package com.productmanager.module.product.entity;
import com.productmanager.module.category.entity.Category;
import com.productmanager.module.store.entity.Store;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Entity @Table(name = "products") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private String name;
    @Column(columnDefinition = "TEXT") private String description;
    @Column(nullable = false, precision = 10, scale = 2) private BigDecimal price;
    @Column(length = 60) private String sku;
    /** Quantidade atual; só muda por movimentações de estoque (StockService). */
    @Column(name = "stock_qty", nullable = false) @Builder.Default private Integer stockQty = 0;
    @Column(name = "min_stock", nullable = false) @Builder.Default private Integer minStock = 0;
    @Column(nullable = false) @Builder.Default private boolean active = true;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "category_id") private Category category;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "store_id", nullable = false) private Store store;
    @Column(name = "created_at", nullable = false, updatable = false) private LocalDateTime createdAt;
    @Column(name = "updated_at") private LocalDateTime updatedAt;
    @PrePersist protected void onCreate() { this.createdAt = this.updatedAt = LocalDateTime.now(); }
    @PreUpdate protected void onUpdate() { this.updatedAt = LocalDateTime.now(); }
    public boolean isLowStock() { return stockQty <= minStock; }
}
