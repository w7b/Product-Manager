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
        Long categoryId) {}
    public record Response(Long id, String name, String description, BigDecimal price, CategoryRef category, LocalDateTime createdAt, LocalDateTime updatedAt) {}
    public record CategoryRef(Long id, String name) {}
    public record PageResponse(List<Response> content, int page, int size, long totalElements, int totalPages, boolean last) {}
}
