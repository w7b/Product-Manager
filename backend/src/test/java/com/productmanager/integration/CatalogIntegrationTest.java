package com.productmanager.integration;
import com.productmanager.support.ApiTestSupport;
import org.junit.jupiter.api.Test;
import static org.hamcrest.Matchers.contains;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
class CatalogIntegrationTest extends ApiTestSupport {
    @Test
    void naoExcluiCategoriaComProdutos() throws Exception {
        String t = newStoreAdmin();
        long cat = body(call(post("/api/v1/categories"), t, "{\"name\":\"Lanches\"}")).get("id").asLong();
        call(post("/api/v1/products"), t, "{\"name\":\"X-Burger\",\"price\":25.9,\"categoryId\":" + cat + "}");
        call(delete("/api/v1/categories/" + cat), t, null)
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("1 produto(s)")));
    }
    @Test
    void filtraPorCategoriaEOrdenaPorPrecoCrescente() throws Exception {
        String t = newStoreAdmin();
        long lanches = body(call(post("/api/v1/categories"), t, "{\"name\":\"Lanches\"}")).get("id").asLong();
        call(post("/api/v1/products"), t, "{\"name\":\"X-Salada\",\"price\":28,\"categoryId\":" + lanches + "}");
        call(post("/api/v1/products"), t, "{\"name\":\"X-Burger\",\"price\":25,\"categoryId\":" + lanches + "}");
        call(post("/api/v1/products"), t, "{\"name\":\"Suco\",\"price\":8}");
        call(get("/api/v1/products?categoryId=" + lanches + "&sortBy=price&direction=asc"), t, null)
            .andExpect(jsonPath("$.content[*].name", contains("X-Burger", "X-Salada")));
    }
    @Test
    void campoDeOrdenacaoInvalidoNaoQuebraAListagem() throws Exception {
        call(get("/api/v1/products?sortBy=senha"), newStoreAdmin(), null).andExpect(status().isOk());
    }
    @Test
    void skuDuplicadoNaLojaEhRecusado() throws Exception {
        String t = newStoreAdmin();
        call(post("/api/v1/products"), t, "{\"name\":\"Coca\",\"price\":6,\"sku\":\"ref-1\"}").andExpect(status().isCreated());
        call(post("/api/v1/products"), t, "{\"name\":\"Guaraná\",\"price\":6,\"sku\":\"REF-1\"}").andExpect(status().isConflict());
    }
}
