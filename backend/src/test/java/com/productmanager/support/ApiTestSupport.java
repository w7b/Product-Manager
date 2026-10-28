package com.productmanager.support;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import java.util.UUID;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
/** Base dos testes de integração: sobe a aplicação inteira e conversa com ela via HTTP simulado. */
@SpringBootTest @AutoConfigureMockMvc @ActiveProfiles("test")
public abstract class ApiTestSupport {
    @Autowired protected MockMvc mvc;
    @Autowired protected ObjectMapper json;

    /** Registra uma loja nova com nome/e-mail únicos e devolve o access token do ADMIN dela. */
    protected String newStoreAdmin() throws Exception {
        String id = UUID.randomUUID().toString().substring(0, 8);
        return register("Admin " + id, "admin" + id + "@teste.com", "Loja " + id).get("accessToken").asText();
    }
    protected JsonNode register(String name, String email, String store) throws Exception {
        return body(mvc.perform(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON)
            .content("{\"name\":\"" + name + "\",\"email\":\"" + email + "\",\"password\":\"123456\",\"storeName\":\"" + store + "\"}")));
    }
    protected String login(String email) throws Exception {
        return body(mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
            .content("{\"email\":\"" + email + "\",\"password\":\"123456\"}"))).get("accessToken").asText();
    }
    protected ResultActions call(MockHttpServletRequestBuilder req, String token, String body) throws Exception {
        if (token != null) req.header("Authorization", "Bearer " + token);
        if (body != null) req.contentType(MediaType.APPLICATION_JSON).content(body);
        return mvc.perform(req);
    }
    protected JsonNode body(ResultActions r) throws Exception { return json.readTree(r.andReturn().getResponse().getContentAsString()); }
    protected long createProduct(String token, String name, String price, int initialStock) throws Exception {
        return body(call(post("/api/v1/products"), token,
            "{\"name\":\"" + name + "\",\"price\":" + price + ",\"initialStock\":" + initialStock + "}")).get("id").asLong();
    }
    protected int stockOf(String token, long productId) throws Exception {
        return body(call(get("/api/v1/products/" + productId), token, null)).get("stockQty").asInt();
    }
}
