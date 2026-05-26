package com.productmanager.module.category.service;
import com.productmanager.exception.BusinessException;
import com.productmanager.exception.ResourceNotFoundException;
import com.productmanager.module.category.dto.CategoryDTO;
import com.productmanager.module.category.entity.Category;
import com.productmanager.module.category.repository.CategoryRepository;
import com.productmanager.module.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
@Service @RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository repo;
    @Transactional(readOnly=true)
    public List<CategoryDTO.Response> findAll(User u) {
        return repo.findByStoreId(u.getStore().getId()).stream().map(this::toRes).toList();
    }
    @Transactional(readOnly=true)
    public CategoryDTO.Response findById(Long id, User u) { return toRes(findOwned(id,u)); }
    @Transactional
    public CategoryDTO.Response create(CategoryDTO.Request req, User u) {
        if (repo.existsByNameAndStoreId(req.name(), u.getStore().getId()))
            throw new BusinessException("Categoria '"+req.name()+"' já existe");
        return toRes(repo.save(Category.builder().name(req.name()).description(req.description()).store(u.getStore()).build()));
    }
    @Transactional
    public CategoryDTO.Response update(Long id, CategoryDTO.Request req, User u) {
        Category c = findOwned(id, u);
        if (!c.getName().equals(req.name()) && repo.existsByNameAndStoreId(req.name(), u.getStore().getId()))
            throw new BusinessException("Categoria '"+req.name()+"' já existe");
        c.setName(req.name()); c.setDescription(req.description());
        return toRes(repo.save(c));
    }
    @Transactional
    public void delete(Long id, User u) { repo.delete(findOwned(id, u)); }
    private Category findOwned(Long id, User u) {
        return repo.findByIdAndStoreId(id, u.getStore().getId())
            .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada: "+id));
    }
    private CategoryDTO.Response toRes(Category c) {
        return new CategoryDTO.Response(c.getId(), c.getName(), c.getDescription(), c.getCreatedAt());
    }
}
