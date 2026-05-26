package com.productmanager.auth.controller;
import com.productmanager.auth.dto.AuthDTO;
import com.productmanager.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1/auth") @RequiredArgsConstructor
public class AuthController {
    private final AuthService service;
    @PostMapping("/register") public ResponseEntity<AuthDTO.TokenResponse> register(@Valid @RequestBody AuthDTO.RegisterRequest req) { return ResponseEntity.status(HttpStatus.CREATED).body(service.register(req)); }
    @PostMapping("/login") public ResponseEntity<AuthDTO.TokenResponse> login(@Valid @RequestBody AuthDTO.LoginRequest req) { return ResponseEntity.ok(service.login(req)); }
    @PostMapping("/refresh") public ResponseEntity<AuthDTO.TokenResponse> refresh(@Valid @RequestBody AuthDTO.RefreshTokenRequest req) { return ResponseEntity.ok(service.refreshToken(req)); }
}
