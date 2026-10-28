package com.productmanager.module.stock.service;
import com.productmanager.exception.BusinessException;
import com.productmanager.exception.ResourceNotFoundException;
import com.productmanager.module.product.entity.Product;
import com.productmanager.module.product.repository.ProductRepository;
import com.productmanager.module.stock.dto.StockDTO;
import com.productmanager.module.stock.entity.StockMovement;
import com.productmanager.module.stock.repository.StockMovementRepository;
import com.productmanager.module.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service @RequiredArgsConstructor
public class StockService {
    private final StockMovementRepository repo;
    private final ProductRepository productRepo;

    @Transactional
    public StockDTO.MovementResponse register(Long productId, StockDTO.MovementRequest req, User u) {
        Product p = lockProduct(productId, u);
        return toRes(apply(p, req.type(), req.quantity(), req.reason(), u));
    }

    @Transactional(readOnly=true)
    public StockDTO.MovementPage history(Long productId, Pageable pg, User u) {
        productRepo.findByIdAndStoreId(productId, u.getStore().getId())
            .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado: " + productId));
        Page<StockMovement> page = repo.findHistory(productId, u.getStore().getId(), pg);
        return new StockDTO.MovementPage(page.getContent().stream().map(this::toRes).toList(), page.getNumber(), page.getSize(),
            page.getTotalElements(), page.getTotalPages(), page.isLast());
    }

    /** Busca o produto da loja do usuário com trava de escrita (usar dentro de uma transação). */
    public Product lockProduct(Long productId, User u) {
        return productRepo.findForUpdate(productId, u.getStore().getId())
            .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado: " + productId));
    }

    /**
     * Regra central do estoque, usada pela tela de estoque e pelos pedidos.
     * O produto deve ter sido obtido com {@link #lockProduct} na mesma transação.
     */
    public StockMovement apply(Product p, StockMovement.Type type, int quantity, String reason, User u) {
        int current = p.getStockQty();
        int balance = switch (type) {
            case ENTRADA -> {
                if (quantity <= 0) throw new BusinessException("A quantidade de entrada deve ser maior que zero");
                yield current + quantity;
            }
            case SAIDA -> {
                if (quantity <= 0) throw new BusinessException("A quantidade de saída deve ser maior que zero");
                if (quantity > current)
                    throw new BusinessException("Estoque insuficiente para '" + p.getName() + "': disponível " + current + ", solicitado " + quantity);
                yield current - quantity;
            }
            case AJUSTE -> quantity;
        };
        p.setStockQty(balance);
        return repo.save(StockMovement.builder().product(p).store(p.getStore()).user(u)
            .type(type).quantity(quantity).balanceAfter(balance).reason(reason).build());
    }

    private StockDTO.MovementResponse toRes(StockMovement m) {
        return new StockDTO.MovementResponse(m.getId(), m.getType(), m.getQuantity(), m.getBalanceAfter(), m.getReason(),
            m.getUser().getName(), m.getCreatedAt());
    }
}
