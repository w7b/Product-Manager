package com.productmanager.module.product.controller;
import com.productmanager.module.product.dto.ProductDTO;
import com.productmanager.module.product.service.ProductService;
import com.productmanager.module.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1/products") @RequiredArgsConstructor
public class ProductController {
    private final ProductService service;
    @GetMapping
    public ResponseEntity<ProductDTO.PageResponse> findAll(
        @RequestParam(required=false) String search,
        @RequestParam(defaultValue="0") int page,
        @RequestParam(defaultValue="10") int size,
        @RequestParam(defaultValue="createdAt") String sortBy,
        @RequestParam(defaultValue="desc") String dir,
        @AuthenticationPrincipal User u) {
        Sort sort = dir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        return ResponseEntity.ok(service.findAll(search, PageRequest.of(page,size,sort), u));
    }
    @GetMapping("/{id}") public ResponseEntity<ProductDTO.Response> findById(@PathVariable Long id, @AuthenticationPrincipal User u) { return ResponseEntity.ok(service.findById(id,u)); }
    @PostMapping public ResponseEntity<ProductDTO.Response> create(@Valid @RequestBody ProductDTO.Request req, @AuthenticationPrincipal User u) { return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req,u)); }
    @PutMapping("/{id}") public ResponseEntity<ProductDTO.Response> update(@PathVariable Long id, @Valid @RequestBody ProductDTO.Request req, @AuthenticationPrincipal User u) { return ResponseEntity.ok(service.update(id,req,u)); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal User u) { service.delete(id,u); return ResponseEntity.noContent().build(); }
}
