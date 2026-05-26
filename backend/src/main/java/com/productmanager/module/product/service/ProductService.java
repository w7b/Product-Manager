package com.productmanager.module.product.service;
import com.productmanager.exception.*;
import com.productmanager.module.category.entity.Category;
import com.productmanager.module.category.repository.CategoryRepository;
import com.productmanager.module.product.dto.ProductDTO;
import com.productmanager.module.product.entity.Product;
import com.productmanager.module.product.repository.ProductRepository;
import com.productmanager.module.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service @RequiredArgsConstructor
public class ProductService {
    private final ProductRepository repo;
    private final CategoryRepository catRepo;
    @Transactional(readOnly=true)
    public ProductDTO.PageResponse findAll(String search, Pageable pg, User u) {
        Page<Product> p = repo.search(u.getStore().getId(), search, pg);
        return toPageRes(p);
    }
    @Transactional(readOnly=true)
    public ProductDTO.Response findById(Long id, User u) { return toRes(findOwned(id,u)); }
    @Transactional
    public ProductDTO.Response create(ProductDTO.Request req, User u) {
        Category cat = resolveCategory(req.categoryId(), u.getStore().getId());
        return toRes(repo.save(Product.builder().name(req.name()).description(req.description()).price(req.price()).category(cat).store(u.getStore()).build()));
    }
    @Transactional
    public ProductDTO.Response update(Long id, ProductDTO.Request req, User u) {
        Product p = findOwned(id, u);
        p.setName(req.name()); p.setDescription(req.description()); p.setPrice(req.price());
        p.setCategory(resolveCategory(req.categoryId(), u.getStore().getId()));
        return toRes(repo.save(p));
    }
    @Transactional
    public void delete(Long id, User u) { repo.delete(findOwned(id,u)); }
    private Product findOwned(Long id, User u) {
        return repo.findByIdAndStoreId(id, u.getStore().getId()).orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado: "+id));
    }
    private Category resolveCategory(Long catId, Long storeId) {
        if (catId == null) return null;
        return catRepo.findByIdAndStoreId(catId, storeId).orElseThrow(() -> new BusinessException("Categoria não encontrada: "+catId));
    }
    private ProductDTO.PageResponse toPageRes(Page<Product> p) {
        return new ProductDTO.PageResponse(p.getContent().stream().map(this::toRes).toList(), p.getNumber(), p.getSize(), p.getTotalElements(), p.getTotalPages(), p.isLast());
    }
    private ProductDTO.Response toRes(Product p) {
        var cat = p.getCategory() != null ? new ProductDTO.CategoryRef(p.getCategory().getId(), p.getCategory().getName()) : null;
        return new ProductDTO.Response(p.getId(), p.getName(), p.getDescription(), p.getPrice(), cat, p.getCreatedAt(), p.getUpdatedAt());
    }
}
