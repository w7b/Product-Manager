package com.productmanager.module.product.service;
import com.productmanager.exception.*;
import com.productmanager.module.category.entity.Category;
import com.productmanager.module.category.repository.CategoryRepository;
import com.productmanager.module.order.repository.OrderItemRepository;
import com.productmanager.module.product.dto.ProductDTO;
import com.productmanager.module.product.entity.Product;
import com.productmanager.module.product.repository.ProductRepository;
import com.productmanager.module.stock.entity.StockMovement;
import com.productmanager.module.stock.repository.StockMovementRepository;
import com.productmanager.module.stock.service.StockService;
import com.productmanager.module.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
@Service @RequiredArgsConstructor
public class ProductService {
    private final ProductRepository repo;
    private final CategoryRepository catRepo;
    private final StockService stockService;
    private final StockMovementRepository movementRepo;
    private final OrderItemRepository orderItemRepo;
    @Transactional(readOnly=true)
    public ProductDTO.PageResponse findAll(String search, Long categoryId, boolean activeOnly, Pageable pg, User u) {
        String s = search == null || search.isBlank() ? null : search.trim();
        Page<Product> p = repo.search(u.getStore().getId(), s, categoryId, activeOnly, pg);
        return toPageRes(p);
    }
    @Transactional(readOnly=true)
    public ProductDTO.Response findById(Long id, User u) { return toRes(findOwned(id,u)); }
    @Transactional(readOnly=true)
    public List<ProductDTO.Response> lowStock(User u) { return repo.findLowStock(u.getStore().getId()).stream().map(this::toRes).toList(); }
    @Transactional
    public ProductDTO.Response create(ProductDTO.Request req, User u) {
        Long sid = u.getStore().getId();
        String sku = normalizeSku(req.sku());
        if (sku != null && repo.existsBySkuIgnoreCaseAndStoreId(sku, sid)) throw new BusinessException("SKU '" + sku + "' já está em uso");
        Product p = repo.save(Product.builder().name(req.name()).description(req.description()).price(req.price())
            .category(resolveCategory(req.categoryId(), sid)).store(u.getStore()).sku(sku)
            .minStock(req.minStock() == null ? 0 : req.minStock())
            .active(req.active() == null || req.active()).build());
        if (req.initialStock() != null && req.initialStock() > 0)
            stockService.apply(p, StockMovement.Type.ENTRADA, req.initialStock(), "Estoque inicial", u);
        return toRes(p);
    }
    @Transactional
    public ProductDTO.Response update(Long id, ProductDTO.Request req, User u) {
        Product p = findOwned(id, u);
        Long sid = u.getStore().getId();
        String sku = normalizeSku(req.sku());
        if (sku != null && repo.existsBySkuIgnoreCaseAndStoreIdAndIdNot(sku, sid, id)) throw new BusinessException("SKU '" + sku + "' já está em uso");
        p.setName(req.name()); p.setDescription(req.description()); p.setPrice(req.price()); p.setSku(sku);
        p.setCategory(resolveCategory(req.categoryId(), sid));
        if (req.minStock() != null) p.setMinStock(req.minStock());
        if (req.active() != null) p.setActive(req.active());
        // O estoque atual (stockQty) não é editado aqui: só por movimentações, para manter o histórico.
        return toRes(repo.save(p));
    }
    /** Produtos que já foram vendidos não podem ser excluídos (o pedido perderia o item); devem ser desativados. */
    @Transactional
    public void delete(Long id, User u) {
        Product p = findOwned(id,u);
        if (orderItemRepo.existsByProductId(id))
            throw new BusinessException("O produto '" + p.getName() + "' já aparece em pedidos e não pode ser excluído. Desative-o na edição.");
        movementRepo.deleteByProductId(id);
        repo.delete(p);
    }
    private Product findOwned(Long id, User u) {
        return repo.findByIdAndStoreId(id, u.getStore().getId()).orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado: "+id));
    }
    private Category resolveCategory(Long catId, Long storeId) {
        if (catId == null) return null;
        return catRepo.findByIdAndStoreId(catId, storeId).orElseThrow(() -> new BusinessException("Categoria não encontrada: "+catId));
    }
    private static String normalizeSku(String sku) { return sku == null || sku.isBlank() ? null : sku.trim().toUpperCase(); }
    private ProductDTO.PageResponse toPageRes(Page<Product> p) {
        return new ProductDTO.PageResponse(p.getContent().stream().map(this::toRes).toList(), p.getNumber(), p.getSize(), p.getTotalElements(), p.getTotalPages(), p.isLast());
    }
    private ProductDTO.Response toRes(Product p) {
        var cat = p.getCategory() != null ? new ProductDTO.CategoryRef(p.getCategory().getId(), p.getCategory().getName()) : null;
        return new ProductDTO.Response(p.getId(), p.getName(), p.getDescription(), p.getPrice(), cat, p.getSku(), p.getStockQty(),
            p.getMinStock(), p.isLowStock(), p.isActive(), p.getCreatedAt(), p.getUpdatedAt());
    }
}
