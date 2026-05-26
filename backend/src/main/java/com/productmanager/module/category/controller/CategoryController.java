package com.productmanager.module.category.controller;
import com.productmanager.module.category.dto.CategoryDTO;
import com.productmanager.module.category.service.CategoryService;
import com.productmanager.module.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/v1/categories") @RequiredArgsConstructor
public class CategoryController {
    private final CategoryService service;
    @GetMapping public ResponseEntity<List<CategoryDTO.Response>> findAll(@AuthenticationPrincipal User u) { return ResponseEntity.ok(service.findAll(u)); }
    @GetMapping("/{id}") public ResponseEntity<CategoryDTO.Response> findById(@PathVariable Long id, @AuthenticationPrincipal User u) { return ResponseEntity.ok(service.findById(id,u)); }
    @PostMapping public ResponseEntity<CategoryDTO.Response> create(@Valid @RequestBody CategoryDTO.Request req, @AuthenticationPrincipal User u) { return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req,u)); }
    @PutMapping("/{id}") public ResponseEntity<CategoryDTO.Response> update(@PathVariable Long id, @Valid @RequestBody CategoryDTO.Request req, @AuthenticationPrincipal User u) { return ResponseEntity.ok(service.update(id,req,u)); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal User u) { service.delete(id,u); return ResponseEntity.noContent().build(); }
}
