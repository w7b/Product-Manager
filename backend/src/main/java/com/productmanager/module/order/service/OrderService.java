package com.productmanager.module.order.service;
import com.productmanager.exception.BusinessException;
import com.productmanager.exception.ResourceNotFoundException;
import com.productmanager.module.order.dto.OrderDTO;
import com.productmanager.module.order.entity.Order;
import com.productmanager.module.order.entity.OrderItem;
import com.productmanager.module.order.repository.OrderRepository;
import com.productmanager.module.product.entity.Product;
import com.productmanager.module.product.repository.ProductRepository;
import com.productmanager.module.stock.entity.StockMovement;
import com.productmanager.module.stock.service.StockService;
import com.productmanager.module.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
/**
 * Ciclo de vida do pedido: ABERTO -> FINALIZADO (baixa o estoque) ou ABERTO/FINALIZADO -> CANCELADO.
 */
@Service @RequiredArgsConstructor
public class OrderService {
    private final OrderRepository repo;
    private final ProductRepository productRepo;
    private final StockService stockService;

    @Transactional(readOnly=true)
    public OrderDTO.PageResponse findAll(Order.Status status, Pageable pg, User u) {
        Page<Order> p = repo.search(u.getStore().getId(), status, pg);
        return new OrderDTO.PageResponse(p.getContent().stream().map(this::toSummary).toList(), p.getNumber(), p.getSize(),
            p.getTotalElements(), p.getTotalPages(), p.isLast());
    }

    @Transactional(readOnly=true)
    public OrderDTO.Response findById(Long id, User u) { return toRes(findOwned(id, u)); }

    @Transactional
    public OrderDTO.Response create(OrderDTO.Request req, User u) {
        Order o = Order.builder().store(u.getStore()).user(u).customerName(blankToNull(req.customerName())).build();
        replaceItems(o, req.items(), u);
        return toRes(repo.save(o));
    }

    @Transactional
    public OrderDTO.Response update(Long id, OrderDTO.Request req, User u) {
        Order o = findOwned(id, u);
        requireOpen(o);
        o.setCustomerName(blankToNull(req.customerName()));
        replaceItems(o, req.items(), u);
        return toRes(o);
    }

    /** Finaliza a venda: tudo ou nada. Se faltar estoque de qualquer item, nenhuma baixa é feita. */
    @Transactional
    public OrderDTO.Response finalizeOrder(Long id, OrderDTO.FinalizeRequest req, User u) {
        Order o = findOwned(id, u);
        requireOpen(o);
        // Trava os produtos sempre na mesma ordem (por id) para evitar deadlock entre pedidos simultâneos.
        o.getItems().stream().sorted(Comparator.comparing(i -> i.getProduct().getId())).forEach(i -> {
            Product p = stockService.lockProduct(i.getProduct().getId(), u);
            stockService.apply(p, StockMovement.Type.SAIDA, i.getQuantity(), "Pedido #" + o.getId(), u);
        });
        o.setPaymentMethod(req.paymentMethod());
        o.setStatus(Order.Status.FINALIZADO);
        o.setFinishedAt(LocalDateTime.now());
        return toRes(o);
    }

    /** Cancelar um pedido FINALIZADO devolve os itens ao estoque e exige perfil ADMIN. */
    @Transactional
    public OrderDTO.Response cancel(Long id, User u) {
        Order o = findOwned(id, u);
        switch (o.getStatus()) {
            case CANCELADO -> throw new BusinessException("Pedido #" + id + " já está cancelado");
            case FINALIZADO -> {
                if (u.getRole() != User.Role.ADMIN) throw new AccessDeniedException("Somente ADMIN cancela pedido finalizado");
                o.getItems().stream().sorted(Comparator.comparing(i -> i.getProduct().getId())).forEach(i -> {
                    Product p = stockService.lockProduct(i.getProduct().getId(), u);
                    stockService.apply(p, StockMovement.Type.ENTRADA, i.getQuantity(), "Cancelamento do pedido #" + o.getId(), u);
                });
            }
            case ABERTO -> { }
        }
        o.setStatus(Order.Status.CANCELADO);
        return toRes(o);
    }

    private void replaceItems(Order o, List<OrderDTO.ItemRequest> items, User u) {
        // Soma quantidades repetidas do mesmo produto em um único item.
        Map<Long, Integer> qtyByProduct = new LinkedHashMap<>();
        items.forEach(i -> qtyByProduct.merge(i.productId(), i.quantity(), Integer::sum));
        o.getItems().clear();
        qtyByProduct.forEach((productId, qty) -> {
            Product p = productRepo.findByIdAndStoreId(productId, u.getStore().getId())
                .orElseThrow(() -> new BusinessException("Produto não encontrado: " + productId));
            if (!p.isActive()) throw new BusinessException("Produto '" + p.getName() + "' está inativo");
            if (qty > p.getStockQty())
                throw new BusinessException("Estoque insuficiente para '" + p.getName() + "': disponível " + p.getStockQty() + ", solicitado " + qty);
            o.getItems().add(OrderItem.builder().order(o).product(p).quantity(qty).unitPrice(p.getPrice())
                .subtotal(p.getPrice().multiply(BigDecimal.valueOf(qty))).build());
        });
        o.recalculateTotal();
    }

    private Order findOwned(Long id, User u) {
        return repo.findWithItems(id, u.getStore().getId()).orElseThrow(() -> new ResourceNotFoundException("Pedido não encontrado: " + id));
    }
    private void requireOpen(Order o) {
        if (o.getStatus() != Order.Status.ABERTO)
            throw new BusinessException("Pedido #" + o.getId() + " está " + o.getStatus() + " e não pode mais ser alterado");
    }
    private static String blankToNull(String s) { return s == null || s.isBlank() ? null : s.trim(); }

    private OrderDTO.Summary toSummary(Order o) {
        return new OrderDTO.Summary(o.getId(), o.getStatus(), o.getCustomerName(), o.getPaymentMethod(), o.getTotal(),
            o.getUser().getName(), o.getCreatedAt(), o.getFinishedAt());
    }
    private OrderDTO.Response toRes(Order o) {
        var items = o.getItems().stream().map(i -> new OrderDTO.ItemResponse(i.getId(), i.getProduct().getId(), i.getProduct().getName(),
            i.getQuantity(), i.getUnitPrice(), i.getSubtotal())).toList();
        return new OrderDTO.Response(o.getId(), o.getStatus(), o.getCustomerName(), o.getPaymentMethod(), o.getTotal(),
            o.getUser().getName(), items, o.getCreatedAt(), o.getFinishedAt());
    }
}
