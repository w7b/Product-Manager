package com.productmanager.module.product.repository;
import com.productmanager.module.product.entity.Product;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
public interface ProductRepository extends JpaRepository<Product, Long> {
    @Query(value = "SELECT p FROM Product p LEFT JOIN FETCH p.category c " +
            "WHERE p.store.id = :sid " +
            "AND (:cid IS NULL OR c.id = :cid) " +
            "AND (:activeOnly = false OR p.active = true) " +
            "AND (:s IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', CAST(:s AS string), '%')) " +
            "     OR LOWER(p.sku) LIKE LOWER(CONCAT('%', CAST(:s AS string), '%')))",
           countQuery = "SELECT COUNT(p) FROM Product p LEFT JOIN p.category c " +
            "WHERE p.store.id = :sid " +
            "AND (:cid IS NULL OR c.id = :cid) " +
            "AND (:activeOnly = false OR p.active = true) " +
            "AND (:s IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', CAST(:s AS string), '%')) " +
            "     OR LOWER(p.sku) LIKE LOWER(CONCAT('%', CAST(:s AS string), '%')))")
    Page<Product> search(@Param("sid") Long storeId, @Param("s") String search, @Param("cid") Long categoryId,
                         @Param("activeOnly") boolean activeOnly, Pageable pageable);

    Optional<Product> findByIdAndStoreId(Long id, Long storeId);

    /** Trava a linha do produto até o fim da transação, evitando que duas vendas simultâneas furem o estoque. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id AND p.store.id = :sid")
    Optional<Product> findForUpdate(@Param("id") Long id, @Param("sid") Long storeId);

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.category WHERE p.store.id = :sid AND p.active = true " +
           "AND p.stockQty <= p.minStock ORDER BY p.stockQty ASC, p.name ASC")
    List<Product> findLowStock(@Param("sid") Long storeId);

    long countByStoreIdAndActiveTrue(Long storeId);
    long countByCategoryIdAndStoreId(Long categoryId, Long storeId);
    boolean existsBySkuIgnoreCaseAndStoreId(String sku, Long storeId);
    boolean existsBySkuIgnoreCaseAndStoreIdAndIdNot(String sku, Long storeId, Long id);
}
