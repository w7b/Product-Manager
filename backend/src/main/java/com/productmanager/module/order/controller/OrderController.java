package com.productmanager.module.order.controller;
import com.productmanager.module.order.dto.OrderDTO;
import com.productmanager.module.order.entity.Order;
import com.productmanager.module.order.service.OrderService;
import com.productmanager.module.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1/orders") @RequiredArgsConstructor
public class OrderController {
    private final OrderService service;
    @GetMapping
    public ResponseEntity<OrderDTO.PageResponse> findAll(@RequestParam(required=false) Order.Status status,
        @RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="10") int size, @AuthenticationPrincipal User u) {
        return ResponseEntity.ok(service.findAll(status, PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), Sort.by("createdAt").descending()), u));
    }
    @GetMapping("/{id}") public ResponseEntity<OrderDTO.Response> findById(@PathVariable Long id, @AuthenticationPrincipal User u) { return ResponseEntity.ok(service.findById(id, u)); }
    @PostMapping public ResponseEntity<OrderDTO.Response> create(@Valid @RequestBody OrderDTO.Request req, @AuthenticationPrincipal User u) { return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req, u)); }
    @PutMapping("/{id}") public ResponseEntity<OrderDTO.Response> update(@PathVariable Long id, @Valid @RequestBody OrderDTO.Request req, @AuthenticationPrincipal User u) { return ResponseEntity.ok(service.update(id, req, u)); }
    @PostMapping("/{id}/finalize") public ResponseEntity<OrderDTO.Response> finalizeOrder(@PathVariable Long id, @Valid @RequestBody OrderDTO.FinalizeRequest req, @AuthenticationPrincipal User u) { return ResponseEntity.ok(service.finalizeOrder(id, req, u)); }
    @PostMapping("/{id}/cancel") public ResponseEntity<OrderDTO.Response> cancel(@PathVariable Long id, @AuthenticationPrincipal User u) { return ResponseEntity.ok(service.cancel(id, u)); }
}
