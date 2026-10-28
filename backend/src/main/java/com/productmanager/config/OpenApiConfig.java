package com.productmanager.config;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.*;
import org.springframework.context.annotation.*;
/** Documentação interativa da API em /swagger-ui.html (botão "Authorize" aceita o access token). */
@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI productManagerOpenApi() {
        return new OpenAPI()
            .info(new Info().title("Product Manager API").version("2.0").description("Gestão de produtos, estoque e pedidos por loja (multi-tenant)."))
            .addSecurityItem(new SecurityRequirement().addList("bearer"))
            .components(new Components().addSecuritySchemes("bearer",
                new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT")));
    }
}
