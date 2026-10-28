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
import java.util.Set;
@RestController @RequestMapping("/api/v1/products") @RequiredArgsConstructor
public class ProductController {
    private static final Set<String> SORTABLE = Set.of("name", "price", "createdAt", "stockQty");
    private final ProductService service;
    @GetMapping
    public ResponseEntity<ProductDTO.PageResponse> findAll(
        @RequestParam(required=false) String search,
        @RequestParam(required=false) Long categoryId,
        @RequestParam(defaultValue="false") boolean activeOnly,
        @RequestParam(defaultValue="0") int page,
        @RequestParam(defaultValue="10") int size,
        @RequestParam(defaultValue="createdAt") String sortBy,
        @RequestParam(defaultValue="desc") String direction,
        @AuthenticationPrincipal User u) {
        String field = SORTABLE.contains(sortBy) ? sortBy : "createdAt";
        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(field).ascending() : Sort.by(field).descending();
        PageRequest pg = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), sort);
        return ResponseEntity.ok(service.findAll(search, categoryId, activeOnly, pg, u));
    }
    /** Mantido para compatibilidade: o mesmo que GET /products?categoryId={id}. */
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ProductDTO.PageResponse> findByCategory(@PathVariable Long categoryId,
        @RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="10") int size, @AuthenticationPrincipal User u) {
        return ResponseEntity.ok(service.findAll(null, categoryId, false, PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), Sort.by("name")), u));
    }
    @GetMapping("/{id}") public ResponseEntity<ProductDTO.Response> findById(@PathVariable Long id, @AuthenticationPrincipal User u) { return ResponseEntity.ok(service.findById(id,u)); }
    @PostMapping public ResponseEntity<ProductDTO.Response> create(@Valid @RequestBody ProductDTO.Request req, @AuthenticationPrincipal User u) { return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req,u)); }
    @PutMapping("/{id}") public ResponseEntity<ProductDTO.Response> update(@PathVariable Long id, @Valid @RequestBody ProductDTO.Request req, @AuthenticationPrincipal User u) { return ResponseEntity.ok(service.update(id,req,u)); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal User u) { service.delete(id,u); return ResponseEntity.noContent().build(); }
}
