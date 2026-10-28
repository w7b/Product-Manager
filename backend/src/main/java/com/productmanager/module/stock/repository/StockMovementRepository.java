package com.productmanager.module.stock.repository;
import com.productmanager.module.stock.entity.StockMovement;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
    @Query(value = "SELECT m FROM StockMovement m JOIN FETCH m.user WHERE m.product.id = :pid AND m.store.id = :sid",
           countQuery = "SELECT COUNT(m) FROM StockMovement m WHERE m.product.id = :pid AND m.store.id = :sid")
    Page<StockMovement> findHistory(@Param("pid") Long productId, @Param("sid") Long storeId, Pageable pageable);
    @Modifying
    @Query("DELETE FROM StockMovement m WHERE m.product.id = :pid")
    void deleteByProductId(@Param("pid") Long productId);
}
