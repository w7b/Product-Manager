package com.productmanager.module.store.repository;
import com.productmanager.module.store.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface StoreRepository extends JpaRepository<Store, Long> {
    Optional<Store> findByName(String name);
}
