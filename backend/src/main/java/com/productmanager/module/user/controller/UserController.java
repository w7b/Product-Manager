package com.productmanager.module.user.controller;
import com.productmanager.auth.dto.AuthDTO;
import com.productmanager.auth.service.AuthService;
import com.productmanager.module.user.dto.UserDTO;
import com.productmanager.module.user.entity.User;
import com.productmanager.module.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/v1/users") @RequiredArgsConstructor
public class UserController {
    private final UserService service;
    /** Dados do usuário logado (qualquer papel). */
    @GetMapping("/me") public ResponseEntity<AuthDTO.UserInfo> me(@AuthenticationPrincipal User u) { return ResponseEntity.ok(AuthService.toInfo(u)); }
    @GetMapping @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO.Response>> findAll(@AuthenticationPrincipal User u) { return ResponseEntity.ok(service.findAll(u)); }
    @PostMapping @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO.Response> create(@Valid @RequestBody UserDTO.CreateRequest req, @AuthenticationPrincipal User u) { return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req, u)); }
    @PutMapping("/{id}") @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO.Response> update(@PathVariable Long id, @Valid @RequestBody UserDTO.UpdateRequest req, @AuthenticationPrincipal User u) { return ResponseEntity.ok(service.update(id, req, u)); }
}
