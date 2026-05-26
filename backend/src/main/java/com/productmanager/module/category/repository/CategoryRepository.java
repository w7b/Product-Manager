package com.productmanager.module.category.repository;
import com.productmanager.module.category.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByStoreId(Long storeId);
    Optional<Category> findByIdAndStoreId(Long id, Long storeId);
    boolean existsByNameAndStoreId(String name, Long storeId);
    boolean existsByIdAndStoreId(Long id, Long storeId);
}
