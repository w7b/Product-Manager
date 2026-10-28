package com.productmanager.module.order.entity;
import com.productmanager.module.store.entity.Store;
import com.productmanager.module.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
@Entity(name = "CustomerOrder") @Table(name = "orders") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Order {
    public enum Status { ABERTO, FINALIZADO, CANCELADO }
    public enum PaymentMethod { DINHEIRO, PIX, CARTAO_CREDITO, CARTAO_DEBITO }
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "store_id", nullable = false) private Store store;
    /** Quem registrou o pedido. */
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false) private User user;
    @Column(name = "customer_name", length = 120) private String customerName;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) @Builder.Default private Status status = Status.ABERTO;
    @Enumerated(EnumType.STRING) @Column(name = "payment_method", length = 20) private PaymentMethod paymentMethod;
    @Column(nullable = false, precision = 12, scale = 2) @Builder.Default private BigDecimal total = BigDecimal.ZERO;
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true) @OrderBy("id")
    @Builder.Default private List<OrderItem> items = new ArrayList<>();
    @Column(name = "created_at", nullable = false, updatable = false) private LocalDateTime createdAt;
    @Column(name = "finished_at") private LocalDateTime finishedAt;
    @PrePersist protected void onCreate() { this.createdAt = LocalDateTime.now(); }
    public void recalculateTotal() { this.total = items.stream().map(OrderItem::getSubtotal).reduce(BigDecimal.ZERO, BigDecimal::add); }
}
