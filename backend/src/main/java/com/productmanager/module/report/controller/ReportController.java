package com.productmanager.module.report.controller;
import com.productmanager.module.report.dto.ReportDTO;
import com.productmanager.module.report.service.ReportService;
import com.productmanager.module.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
@RestController @RequestMapping("/api/v1/reports") @RequiredArgsConstructor
public class ReportController {
    private final ReportService service;
    @GetMapping("/summary") public ResponseEntity<ReportDTO.Summary> summary(@AuthenticationPrincipal User u) { return ResponseEntity.ok(service.summary(u)); }
    @GetMapping("/sales-by-day")
    public ResponseEntity<List<ReportDTO.DailySales>> salesByDay(@RequestParam(defaultValue="14") int days, @AuthenticationPrincipal User u) {
        return ResponseEntity.ok(service.salesByDay(Math.min(Math.max(days, 1), 90), u));
    }
    @GetMapping("/top-products")
    public ResponseEntity<List<ReportDTO.TopProduct>> topProducts(@RequestParam(defaultValue="30") int days, @RequestParam(defaultValue="5") int limit, @AuthenticationPrincipal User u) {
        return ResponseEntity.ok(service.topProducts(Math.min(Math.max(days, 1), 365), Math.min(Math.max(limit, 1), 50), u));
    }
    @GetMapping(value = "/sales.csv", produces = "text/csv")
    public ResponseEntity<byte[]> salesCsv(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                           @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
                                           @AuthenticationPrincipal User u) {
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"vendas_" + from + "_" + to + ".csv\"")
            .contentType(new MediaType("text", "csv", java.nio.charset.StandardCharsets.UTF_8))
            .body(service.salesCsv(from, to, u));
    }
}
