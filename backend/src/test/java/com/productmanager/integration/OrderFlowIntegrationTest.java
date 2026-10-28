package com.productmanager.integration;
import com.productmanager.support.ApiTestSupport;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
class OrderFlowIntegrationTest extends ApiTestSupport {
    @Test
    void finalizarPedidoBaixaEstoqueECancelarDevolve() throws Exception {
        String t = newStoreAdmin();
        long burger = createProduct(t, "X-Burger", "25.90", 10), suco = createProduct(t, "Suco", "8.00", 5);
        var pedido = body(call(post("/api/v1/orders"), t,
            "{\"customerName\":\"Mesa 4\",\"items\":[{\"productId\":" + burger + ",\"quantity\":2},{\"productId\":" + suco + ",\"quantity\":1},{\"productId\":" + burger + ",\"quantity\":1}]}")
            .andExpect(status().isCreated()));
        assertThat(pedido.get("items")).hasSize(2);
        assertThat(pedido.get("total").decimalValue()).isEqualByComparingTo("85.70");
        long id = pedido.get("id").asLong();
        assertThat(stockOf(t, burger)).isEqualTo(10); // pedido aberto ainda não mexe no estoque

        call(post("/api/v1/orders/" + id + "/finalize"), t, "{\"paymentMethod\":\"PIX\"}")
            .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("FINALIZADO"));
        assertThat(stockOf(t, burger)).isEqualTo(7);
        assertThat(stockOf(t, suco)).isEqualTo(4);
        call(put("/api/v1/orders/" + id), t, "{\"items\":[{\"productId\":" + suco + ",\"quantity\":1}]}").andExpect(status().isConflict());

        call(post("/api/v1/orders/" + id + "/cancel"), t, null).andExpect(jsonPath("$.status").value("CANCELADO"));
        assertThat(stockOf(t, burger)).isEqualTo(10);
        assertThat(stockOf(t, suco)).isEqualTo(5);
    }
    @Test
    void faltaDeEstoqueNaFinalizacaoNaoBaixaNenhumItem() throws Exception {
        String t = newStoreAdmin();
        long burger = createProduct(t, "X-Burger", "25.90", 10), suco = createProduct(t, "Suco", "8.00", 2);
        long id = body(call(post("/api/v1/orders"), t,
            "{\"items\":[{\"productId\":" + burger + ",\"quantity\":3},{\"productId\":" + suco + ",\"quantity\":2}]}")).get("id").asLong();
        // Outra venda consome o suco antes de este pedido ser finalizado.
        call(post("/api/v1/products/" + suco + "/stock-movements"), t, "{\"type\":\"SAIDA\",\"quantity\":1,\"reason\":\"Quebra\"}");
        call(post("/api/v1/orders/" + id + "/finalize"), t, "{\"paymentMethod\":\"DINHEIRO\"}").andExpect(status().isConflict());
        assertThat(stockOf(t, burger)).isEqualTo(10);
        assertThat(stockOf(t, suco)).isEqualTo(1);
        call(get("/api/v1/orders/" + id), t, null).andExpect(jsonPath("$.status").value("ABERTO"));
    }
    @Test
    void somenteAdminCancelaPedidoFinalizadoEProdutoVendidoNaoEhExcluido() throws Exception {
        String admin = newStoreAdmin();
        call(post("/api/v1/users"), admin, "{\"name\":\"Caixa\",\"email\":\"caixa@teste.com\",\"password\":\"123456\",\"role\":\"USER\"}");
        String caixa = login("caixa@teste.com");
        long burger = createProduct(admin, "X-Burger", "25.90", 5);
        long id = body(call(post("/api/v1/orders"), caixa, "{\"items\":[{\"productId\":" + burger + ",\"quantity\":1}]}")).get("id").asLong();
        call(post("/api/v1/orders/" + id + "/finalize"), caixa, "{\"paymentMethod\":\"CARTAO_DEBITO\"}").andExpect(status().isOk());
        call(post("/api/v1/orders/" + id + "/cancel"), caixa, null).andExpect(status().isForbidden());
        call(delete("/api/v1/products/" + burger), admin, null).andExpect(status().isConflict());
    }
    @Test
    void relatoriosConsideramSoPedidosFinalizados() throws Exception {
        String t = newStoreAdmin();
        long burger = createProduct(t, "X-Burger", "20.00", 10);
        long a = body(call(post("/api/v1/orders"), t, "{\"items\":[{\"productId\":" + burger + ",\"quantity\":2}]}")).get("id").asLong();
        call(post("/api/v1/orders"), t, "{\"items\":[{\"productId\":" + burger + ",\"quantity\":1}]}"); // fica aberto
        call(post("/api/v1/orders/" + a + "/finalize"), t, "{\"paymentMethod\":\"PIX\"}");
        call(get("/api/v1/reports/summary"), t, null)
            .andExpect(jsonPath("$.revenueToday").value(40.0))
            .andExpect(jsonPath("$.ordersToday").value(1))
            .andExpect(jsonPath("$.openOrders").value(1));
        call(get("/api/v1/reports/top-products"), t, null)
            .andExpect(jsonPath("$[0].name").value("X-Burger")).andExpect(jsonPath("$[0].quantity").value(2));
    }
}
