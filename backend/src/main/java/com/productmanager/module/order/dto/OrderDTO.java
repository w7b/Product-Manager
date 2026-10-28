package com.productmanager.module.order.dto;
import com.productmanager.module.order.entity.Order;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
public class OrderDTO {
    public record ItemRequest(
        @NotNull(message="Produto é obrigatório") Long productId,
        @NotNull(message="Quantidade é obrigatória") @Positive(message="Quantidade deve ser maior que zero") Integer quantity) {}
    /** Usado para criar o pedido e para substituir os itens enquanto ele está ABERTO. */
    public record Request(
        @Size(max=120) String customerName,
        @NotEmpty(message="O pedido precisa de ao menos um item") List<@Valid ItemRequest> items) {}
    public record FinalizeRequest(@NotNull(message="Forma de pagamento é obrigatória") Order.PaymentMethod paymentMethod) {}
    public record ItemResponse(Long id, Long productId, String productName, Integer quantity, BigDecimal unitPrice, BigDecimal subtotal) {}
    public record Response(Long id, Order.Status status, String customerName, Order.PaymentMethod paymentMethod, BigDecimal total,
                           String userName, List<ItemResponse> items, LocalDateTime createdAt, LocalDateTime finishedAt) {}
    public record Summary(Long id, Order.Status status, String customerName, Order.PaymentMethod paymentMethod, BigDecimal total,
                          String userName, LocalDateTime createdAt, LocalDateTime finishedAt) {}
    public record PageResponse(List<Summary> content, int page, int size, long totalElements, int totalPages, boolean last) {}
}
