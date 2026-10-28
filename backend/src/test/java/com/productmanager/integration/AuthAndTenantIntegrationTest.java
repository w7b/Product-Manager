package com.productmanager.integration;
import com.productmanager.support.ApiTestSupport;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
class AuthAndTenantIntegrationTest extends ApiTestSupport {
    @Test
    void registroCriaLojaNovaEUsuarioAdmin() throws Exception {
        var res = register("Maria", "maria@pizza.com", "Pizzaria Bella");
        assertThat(res.get("user").get("role").asText()).isEqualTo("ADMIN");
        assertThat(res.get("user").get("storeName").asText()).isEqualTo("Pizzaria Bella");
    }
    @Test
    void registroComNomeDeLojaExistenteEhRecusado() throws Exception {
        register("Dono", "dono@burger.com", "Burger House");
        call(post("/api/v1/auth/register"), null,
            "{\"name\":\"Intruso\",\"email\":\"intruso@x.com\",\"password\":\"123456\",\"storeName\":\"burger house\"}")
            .andExpect(status().isConflict());
    }
    @Test
    void requisicaoSemTokenRecebe401() throws Exception {
        call(get("/api/v1/products"), null, null).andExpect(status().isUnauthorized());
    }
    @Test
    void lojaNaoEnxergaProdutoDeOutraLoja() throws Exception {
        String lojaA = newStoreAdmin(), lojaB = newStoreAdmin();
        long id = createProduct(lojaA, "X-Burger", "25.90", 0);
        call(get("/api/v1/products/" + id), lojaB, null).andExpect(status().isNotFound());
        call(get("/api/v1/products"), lojaB, null).andExpect(jsonPath("$.totalElements").value(0));
    }
    @Test
    void usuarioComumNaoGerenciaUsuariosEDesativadoPerdeAcesso() throws Exception {
        String admin = newStoreAdmin();
        long id = body(call(post("/api/v1/users"), admin,
            "{\"name\":\"Ana\",\"email\":\"ana@teste.com\",\"password\":\"123456\",\"role\":\"USER\"}")
            .andExpect(status().isCreated())).get("id").asLong();
        String ana = login("ana@teste.com");
        call(get("/api/v1/users"), ana, null).andExpect(status().isForbidden());
        call(put("/api/v1/users/" + id), admin, "{\"name\":\"Ana\",\"role\":\"USER\",\"active\":false}").andExpect(status().isOk());
        call(get("/api/v1/products"), ana, null).andExpect(status().isUnauthorized());
    }
    @Test
    void adminNaoRemoveOProprioAcesso() throws Exception {
        String admin = newStoreAdmin();
        long me = body(call(get("/api/v1/users/me"), admin, null)).get("id").asLong();
        call(put("/api/v1/users/" + me), admin, "{\"name\":\"Eu\",\"role\":\"USER\",\"active\":true}").andExpect(status().isConflict());
    }
}
