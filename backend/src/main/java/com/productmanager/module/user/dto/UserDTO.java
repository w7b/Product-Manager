package com.productmanager.module.user.dto;
import com.productmanager.module.user.entity.User;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
public class UserDTO {
    public record CreateRequest(
        @NotBlank @Size(min=2,max=100) String name,
        @Email @NotBlank String email,
        @NotBlank @Size(min=6,max=100) String password,
        @NotNull(message="Papel é obrigatório (USER ou ADMIN)") User.Role role) {}
    public record UpdateRequest(
        @NotBlank @Size(min=2,max=100) String name,
        @NotNull(message="Papel é obrigatório (USER ou ADMIN)") User.Role role,
        @NotNull Boolean active,
        /** Opcional: preenchido só quando o ADMIN redefine a senha. */
        @Size(min=6,max=100) String password) {}
    public record Response(Long id, String name, String email, User.Role role, boolean active, LocalDateTime createdAt) {}
}
