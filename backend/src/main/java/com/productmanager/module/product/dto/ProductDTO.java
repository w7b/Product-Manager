package com.productmanager.module.product.dto;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
public class ProductDTO {
    public record Request(
        @NotBlank(message="Nome é obrigatório") @Size(min=2,max=150) String name,
        @Size(max=2000) String description,
        @NotNull(message="Preço é obrigatório") @Positive(message="Preço deve ser positivo") BigDecimal price,
        Long categoryId,
        @Size(max=60, message="SKU deve ter no máximo 60 caracteres") String sku,
        @PositiveOrZero(message="Estoque mínimo não pode ser negativo") Integer minStock,
        /** Usado só na criação: gera uma movimentação de ENTRADA "Estoque inicial". */
        @PositiveOrZero(message="Estoque inicial não pode ser negativo") Integer initialStock,
        Boolean active) {}
    public record Response(Long id, String name, String description, BigDecimal price, CategoryRef category,
                           String sku, Integer stockQty, Integer minStock, boolean lowStock, boolean active,
                           LocalDateTime createdAt, LocalDateTime updatedAt) {}
    public record CategoryRef(Long id, String name) {}
    public record PageResponse(List<Response> content, int page, int size, long totalElements, int totalPages, boolean last) {}
}
