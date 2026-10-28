package com.productmanager.module.stock.controller;
import com.productmanager.module.product.dto.ProductDTO;
import com.productmanager.module.product.service.ProductService;
import com.productmanager.module.stock.dto.StockDTO;
import com.productmanager.module.stock.service.StockService;
import com.productmanager.module.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/v1") @RequiredArgsConstructor
public class StockController {
    private final StockService service;
    private final ProductService productService;
    @PostMapping("/products/{id}/stock-movements")
    public ResponseEntity<StockDTO.MovementResponse> register(@PathVariable Long id, @Valid @RequestBody StockDTO.MovementRequest req, @AuthenticationPrincipal User u) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.register(id, req, u));
    }
    @GetMapping("/products/{id}/stock-movements")
    public ResponseEntity<StockDTO.MovementPage> history(@PathVariable Long id, @RequestParam(defaultValue="0") int page,
        @RequestParam(defaultValue="10") int size, @AuthenticationPrincipal User u) {
        return ResponseEntity.ok(service.history(id, PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100),
            Sort.by("createdAt").descending().and(Sort.by("id").descending())), u));
    }
    /** Produtos ativos com estoque atual menor ou igual ao mínimo. */
    @GetMapping("/stock/low")
    public ResponseEntity<List<ProductDTO.Response>> lowStock(@AuthenticationPrincipal User u) {
        return ResponseEntity.ok(productService.lowStock(u));
    }
}
