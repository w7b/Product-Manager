package com.productmanager.module.user.repository;
import com.productmanager.module.user.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface UserRepository extends JpaRepository<User, Long> {
    /** Já traz a loja junto, pois o usuário autenticado é usado fora de transação (ex.: nome da loja). */
    @EntityGraph(attributePaths = "store")
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByStoreIdOrderByNameAsc(Long storeId);
    Optional<User> findByIdAndStoreId(Long id, Long storeId);
    long countByStoreIdAndRoleAndActiveTrue(Long storeId, User.Role role);
}
