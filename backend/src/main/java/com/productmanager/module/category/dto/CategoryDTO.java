package com.productmanager.module.category.dto;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
public class CategoryDTO {
    public record Request(@NotBlank(message="Nome é obrigatório") @Size(min=2,max=100) String name, @Size(max=255) String description) {}
    public record Response(Long id, String name, String description, LocalDateTime createdAt) {}
}
