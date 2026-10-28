package com.productmanager.module.report.service;
import com.productmanager.module.category.repository.CategoryRepository;
import com.productmanager.module.order.entity.Order;
import com.productmanager.module.order.repository.OrderItemRepository;
import com.productmanager.module.order.repository.OrderRepository;
import com.productmanager.module.product.repository.ProductRepository;
import com.productmanager.module.report.dto.ReportDTO;
import com.productmanager.module.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
/** Indicadores calculados a partir dos pedidos FINALIZADOS da loja. */
@Service @RequiredArgsConstructor
public class ReportService {
    private static final DateTimeFormatter BR = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private final OrderRepository orderRepo;
    private final OrderItemRepository itemRepo;
    private final ProductRepository productRepo;
    private final CategoryRepository categoryRepo;

    @Transactional(readOnly=true)
    public ReportDTO.Summary summary(User u) {
        Long sid = u.getStore().getId();
        LocalDate today = LocalDate.now();
        List<Order> month = orderRepo.findFinishedBetween(sid, today.withDayOfMonth(1).atStartOfDay(), today.plusDays(1).atStartOfDay());
        List<Order> day = month.stream().filter(o -> !o.getFinishedAt().toLocalDate().isBefore(today)).toList();
        BigDecimal revenueMonth = sum(month);
        BigDecimal avg = month.isEmpty() ? BigDecimal.ZERO : revenueMonth.divide(BigDecimal.valueOf(month.size()), 2, RoundingMode.HALF_UP);
        return new ReportDTO.Summary(sum(day), day.size(), revenueMonth, month.size(), avg,
            orderRepo.countByStoreIdAndStatus(sid, Order.Status.ABERTO), productRepo.countByStoreIdAndActiveTrue(sid),
            categoryRepo.findByStoreId(sid).size(), productRepo.findLowStock(sid).size());
    }

    /** Faturamento por dia nos últimos {@code days} dias (dias sem venda aparecem com zero). */
    @Transactional(readOnly=true)
    public List<ReportDTO.DailySales> salesByDay(int days, User u) {
        LocalDate first = LocalDate.now().minusDays(days - 1L);
        Map<LocalDate, List<Order>> byDay = orderRepo.findFinishedBetween(u.getStore().getId(), first.atStartOfDay(), LocalDate.now().plusDays(1).atStartOfDay())
            .stream().collect(Collectors.groupingBy(o -> o.getFinishedAt().toLocalDate()));
        List<ReportDTO.DailySales> out = new ArrayList<>();
        for (LocalDate d = first; !d.isAfter(LocalDate.now()); d = d.plusDays(1)) {
            List<Order> list = byDay.getOrDefault(d, List.of());
            out.add(new ReportDTO.DailySales(d, sum(list), list.size()));
        }
        return out;
    }

    @Transactional(readOnly=true)
    public List<ReportDTO.TopProduct> topProducts(int days, int limit, User u) {
        LocalDateTime from = LocalDate.now().minusDays(days - 1L).atStartOfDay();
        return itemRepo.topProducts(u.getStore().getId(), from, LocalDate.now().plusDays(1).atStartOfDay()).stream().limit(limit)
            .map(r -> new ReportDTO.TopProduct((Long) r[0], (String) r[1], ((Number) r[2]).longValue(), (BigDecimal) r[3])).toList();
    }

    /** CSV separado por ";" e com BOM, para abrir direto no Excel em português. */
    @Transactional(readOnly=true)
    public byte[] salesCsv(LocalDate from, LocalDate to, User u) {
        StringBuilder sb = new StringBuilder("﻿Pedido;Finalizado em;Cliente;Pagamento;Itens;Total (R$)\n");
        for (Order o : orderRepo.findFinishedBetween(u.getStore().getId(), from.atStartOfDay(), to.plusDays(1).atStartOfDay())) {
            int items = o.getItems().stream().mapToInt(i -> i.getQuantity()).sum();
            sb.append(o.getId()).append(';').append(o.getFinishedAt().format(BR)).append(';')
              .append(csv(o.getCustomerName())).append(';').append(o.getPaymentMethod()).append(';')
              .append(items).append(';').append(o.getTotal().toPlainString().replace('.', ',')).append('\n');
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private static BigDecimal sum(List<Order> orders) { return orders.stream().map(Order::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add); }
    private static String csv(String s) { return s == null ? "" : "\"" + s.replace("\"", "\"\"") + "\""; }
}
