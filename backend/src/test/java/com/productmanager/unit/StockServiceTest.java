package com.productmanager.unit;
import com.productmanager.exception.BusinessException;
import com.productmanager.module.product.entity.Product;
import com.productmanager.module.product.repository.ProductRepository;
import com.productmanager.module.stock.entity.StockMovement;
import com.productmanager.module.stock.repository.StockMovementRepository;
import com.productmanager.module.stock.service.StockService;
import com.productmanager.module.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
@ExtendWith(MockitoExtension.class)
class StockServiceTest {
    @Mock StockMovementRepository movements;
    @Mock ProductRepository products;
    @InjectMocks StockService service;
    Product burger;
    User user = User.builder().id(1L).name("Ana").build();
    @BeforeEach void setUp() {
        burger = Product.builder().id(1L).name("X-Burger").stockQty(10).build();
        lenient().when(movements.save(any())).thenAnswer(i -> i.getArgument(0));
    }
    @Test void entradaSomaAoEstoque() {
        var m = service.apply(burger, StockMovement.Type.ENTRADA, 5, "Compra", user);
        assertThat(burger.getStockQty()).isEqualTo(15);
        assertThat(m.getBalanceAfter()).isEqualTo(15);
    }
    @Test void saidaSubtraiDoEstoque() {
        service.apply(burger, StockMovement.Type.SAIDA, 4, null, user);
        assertThat(burger.getStockQty()).isEqualTo(6);
    }
    @Test void saidaMaiorQueOEstoqueEhRecusadaENaoGravaNada() {
        assertThatThrownBy(() -> service.apply(burger, StockMovement.Type.SAIDA, 11, null, user))
            .isInstanceOf(BusinessException.class).hasMessageContaining("disponível 10");
        assertThat(burger.getStockQty()).isEqualTo(10);
        verify(movements, never()).save(any());
    }
    @Test void ajusteDefineOSaldoContado() {
        service.apply(burger, StockMovement.Type.AJUSTE, 3, "Inventário", user);
        assertThat(burger.getStockQty()).isEqualTo(3);
    }
    @Test void entradaZeroEhRecusada() {
        assertThatThrownBy(() -> service.apply(burger, StockMovement.Type.ENTRADA, 0, null, user)).isInstanceOf(BusinessException.class);
    }
}
