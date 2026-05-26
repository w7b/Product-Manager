package com.productmanager.module.product.repository;
import com.productmanager.module.product.entity.Product;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
public interface ProductRepository extends JpaRepository<Product, Long> {
    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.category " +
            "WHERE p.store.id = :sid " +
            "AND (:s IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', CAST(:s AS string), '%')))")
    Page<Product> search(@Param("sid") Long storeId, @Param("s") String search, Pageable pageable);

    Optional<Product> findByIdAndStoreId(Long id, Long storeId);

    Page<Product> findByStoreIdAndCategoryId(Long storeId, Long categoryId, Pageable pageable);
}
