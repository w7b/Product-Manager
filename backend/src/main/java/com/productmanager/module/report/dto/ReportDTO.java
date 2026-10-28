package com.productmanager.module.report.dto;
import java.math.BigDecimal;
import java.time.LocalDate;
public class ReportDTO {
    public record Summary(BigDecimal revenueToday, long ordersToday, BigDecimal revenueMonth, long ordersMonth,
                          BigDecimal averageTicketMonth, long openOrders, long activeProducts, long categories, long lowStockProducts) {}
    public record DailySales(LocalDate date, BigDecimal revenue, long orders) {}
    public record TopProduct(Long productId, String name, long quantity, BigDecimal revenue) {}
}
