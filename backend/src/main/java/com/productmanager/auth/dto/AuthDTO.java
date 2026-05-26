package com.productmanager.auth.dto;
import jakarta.validation.constraints.*;
public class AuthDTO {
    public record RegisterRequest(@NotBlank @Size(min=2,max=100) String name, @Email @NotBlank String email, @NotBlank @Size(min=6,max=100) String password, @NotBlank @Size(min=2,max=100) String storeName) {}
    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}
    public record RefreshTokenRequest(@NotBlank String refreshToken) {}
    public record TokenResponse(String accessToken, String refreshToken, String tokenType, long expiresIn, UserInfo user) {}
    public record UserInfo(Long id, String name, String email, String storeName) {}
}
