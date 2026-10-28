package com.productmanager.module.stock.entity;
import com.productmanager.module.product.entity.Product;
import com.productmanager.module.store.entity.Store;
import com.productmanager.module.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
/** Registro imutável de cada alteração no estoque de um produto. */
@Entity @Table(name = "stock_movements") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StockMovement {
    public enum Type { ENTRADA, SAIDA, AJUSTE }
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "product_id", nullable = false) private Product product;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "store_id", nullable = false) private Store store;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false) private User user;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private Type type;
    /** ENTRADA/SAIDA: quantidade movimentada. AJUSTE: quantidade contada (novo saldo). */
    @Column(nullable = false) private Integer quantity;
    @Column(name = "balance_after", nullable = false) private Integer balanceAfter;
    private String reason;
    @Column(name = "created_at", nullable = false, updatable = false) private LocalDateTime createdAt;
    @PrePersist protected void onCreate() { this.createdAt = LocalDateTime.now(); }
}
