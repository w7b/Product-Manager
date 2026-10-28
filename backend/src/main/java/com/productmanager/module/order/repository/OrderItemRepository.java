package com.productmanager.module.order.repository;
import com.productmanager.module.order.entity.Order;
import com.productmanager.module.order.entity.OrderItem;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    boolean existsByProductId(Long productId);

    /** [productId, productName, quantidade vendida, faturamento] dos pedidos finalizados no período. */
    @Query("SELECT i.product.id, i.product.name, SUM(i.quantity), SUM(i.subtotal) FROM OrderItem i " +
           "WHERE i.order.store.id = :sid AND i.order.status = :status " +
           "AND i.order.finishedAt >= :from AND i.order.finishedAt < :to " +
           "GROUP BY i.product.id, i.product.name ORDER BY SUM(i.quantity) DESC, SUM(i.subtotal) DESC")
    List<Object[]> topProductsByStatus(@Param("sid") Long storeId, @Param("status") Order.Status status,
                                       @Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    default List<Object[]> topProducts(Long storeId, LocalDateTime from, LocalDateTime to) {
        return topProductsByStatus(storeId, Order.Status.FINALIZADO, from, to);
    }
}
