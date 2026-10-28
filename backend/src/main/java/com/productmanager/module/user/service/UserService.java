package com.productmanager.module.user.service;
import com.productmanager.exception.BusinessException;
import com.productmanager.exception.ResourceNotFoundException;
import com.productmanager.module.user.dto.UserDTO;
import com.productmanager.module.user.entity.User;
import com.productmanager.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
/** Gestão da equipe da loja, feita pelo ADMIN. Todo usuário criado aqui pertence à loja do ADMIN. */
@Service @RequiredArgsConstructor
public class UserService {
    private final UserRepository repo;
    private final PasswordEncoder encoder;
    @Transactional(readOnly=true)
    public List<UserDTO.Response> findAll(User admin) {
        return repo.findByStoreIdOrderByNameAsc(admin.getStore().getId()).stream().map(UserService::toRes).toList();
    }
    @Transactional
    public UserDTO.Response create(UserDTO.CreateRequest req, User admin) {
        if (repo.existsByEmail(req.email())) throw new BusinessException("Email já cadastrado");
        return toRes(repo.save(User.builder().name(req.name()).email(req.email()).password(encoder.encode(req.password()))
            .role(req.role()).store(admin.getStore()).build()));
    }
    @Transactional
    public UserDTO.Response update(Long id, UserDTO.UpdateRequest req, User admin) {
        User target = repo.findByIdAndStoreId(id, admin.getStore().getId())
            .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + id));
        boolean losesAdmin = target.getRole() == User.Role.ADMIN && target.isActive()
            && (req.role() != User.Role.ADMIN || !req.active());
        if (losesAdmin && target.getId().equals(admin.getId()))
            throw new BusinessException("Você não pode remover o seu próprio acesso de ADMIN nem desativar a sua conta");
        if (losesAdmin && repo.countByStoreIdAndRoleAndActiveTrue(admin.getStore().getId(), User.Role.ADMIN) <= 1)
            throw new BusinessException("A loja precisa de pelo menos um ADMIN ativo");
        target.setName(req.name());
        target.setRole(req.role());
        target.setActive(req.active());
        if (req.password() != null && !req.password().isBlank()) target.setPassword(encoder.encode(req.password()));
        return toRes(target);
    }
    public static UserDTO.Response toRes(User u) {
        return new UserDTO.Response(u.getId(), u.getName(), u.getEmail(), u.getRole(), u.isActive(), u.getCreatedAt());
    }
}
