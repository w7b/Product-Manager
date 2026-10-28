package com.productmanager.module.order.repository;
import com.productmanager.module.order.entity.Order;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
public interface OrderRepository extends JpaRepository<Order, Long> {
    @Query(value = "SELECT o FROM CustomerOrder o JOIN FETCH o.user WHERE o.store.id = :sid AND (:status IS NULL OR o.status = :status)",
           countQuery = "SELECT COUNT(o) FROM CustomerOrder o WHERE o.store.id = :sid AND (:status IS NULL OR o.status = :status)")
    Page<Order> search(@Param("sid") Long storeId, @Param("status") Order.Status status, Pageable pageable);

    /** Carrega o pedido e seus itens, sem carregar os produtos (eles serão travados depois, se preciso). */
    @Query("SELECT DISTINCT o FROM CustomerOrder o LEFT JOIN FETCH o.items WHERE o.id = :id AND o.store.id = :sid")
    Optional<Order> findWithItems(@Param("id") Long id, @Param("sid") Long storeId);

    @Query("SELECT o FROM CustomerOrder o WHERE o.store.id = :sid AND o.status = :status " +
           "AND o.finishedAt >= :from AND o.finishedAt < :to ORDER BY o.finishedAt")
    List<Order> findByStatusFinishedBetween(@Param("sid") Long storeId, @Param("status") Order.Status status,
                                            @Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    default List<Order> findFinishedBetween(Long storeId, LocalDateTime from, LocalDateTime to) {
        return findByStatusFinishedBetween(storeId, Order.Status.FINALIZADO, from, to);
    }

    long countByStoreIdAndStatus(Long storeId, Order.Status status);
}
