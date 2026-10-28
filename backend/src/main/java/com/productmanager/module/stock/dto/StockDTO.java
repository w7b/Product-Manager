package com.productmanager.module.stock.dto;
import com.productmanager.module.stock.entity.StockMovement;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.List;
public class StockDTO {
    public record MovementRequest(
        @NotNull(message="Tipo é obrigatório (ENTRADA, SAIDA ou AJUSTE)") StockMovement.Type type,
        @NotNull(message="Quantidade é obrigatória") @PositiveOrZero(message="Quantidade não pode ser negativa") Integer quantity,
        @Size(max=255) String reason) {}
    public record MovementResponse(Long id, StockMovement.Type type, Integer quantity, Integer balanceAfter,
                                   String reason, String userName, LocalDateTime createdAt) {}
    public record MovementPage(List<MovementResponse> content, int page, int size, long totalElements, int totalPages, boolean last) {}
}
