# 🛍️ Product Manager — Fullstack Ecosystem

[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/)
[![React](https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Container-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

Sistema web multi-tenant para a operação de uma loja (caso de uso: hamburgueria): catálogo de produtos e categorias, **controle de estoque**, **pedidos/vendas**, **gestão da equipe com papéis** e **painel com relatórios**. Backend em **Spring Boot 3.2 (Java 17)** e frontend em **React 18 + Vite**.

---

## 🗺️ Visão geral da arquitetura

Cada **loja (store)** é um tenant isolado: usuários, categorias, produtos, movimentações de estoque e pedidos pertencem a uma loja, e toda consulta é filtrada pela loja do usuário autenticado (extraída do JWT, nunca enviada pelo cliente).

```
fullstack-pm/
├── docker-compose.yml              # Banco + API + Web
├── backend/                        # Spring Boot 3.2 + Java 17 + Maven
│   └── src/main/
│       ├── java/com/productmanager/
│       │   ├── auth/               # Registro, login, refresh (JWT)
│       │   ├── config/             # Spring Security, filtro JWT, CORS, Swagger
│       │   ├── exception/          # Tratamento global de erros
│       │   └── module/
│       │       ├── store/          # Lojas (tenant)
│       │       ├── user/           # Equipe da loja e papéis (USER / ADMIN)
│       │       ├── category/       # Categorias
│       │       ├── product/        # Catálogo com busca, filtro e paginação
│       │       ├── stock/          # Movimentações de estoque e alertas
│       │       ├── order/          # Pedidos e itens
│       │       └── report/         # Indicadores e exportação CSV
│       └── resources/db/migration/ # Migrações Flyway (V1, V2, V3)
└── frontend/                       # React 18 + Vite
    └── src/ (api, components, context, hooks, pages, routes)
```

### Banco de dados (7 tabelas)

| Tabela | Conteúdo |
| --- | --- |
| `stores` | Lojas (nome único) |
| `users` | Usuários da loja, papel `USER`/`ADMIN`, conta ativa ou não |
| `categories` | Categorias (nome único por loja) |
| `products` | Produtos: preço, SKU, estoque atual, estoque mínimo, ativo |
| `stock_movements` | Histórico de entradas, saídas e ajustes, com saldo após cada movimento |
| `orders` | Pedidos: status `ABERTO`/`FINALIZADO`/`CANCELADO`, pagamento, total |
| `order_items` | Itens do pedido, com o preço copiado no momento da venda |

O esquema é versionado com **Flyway**. Um banco criado pela versão anterior (Extensão III, com `ddl-auto=update`) é reconhecido automaticamente: a V1 é marcada como aplicada e só as novas migrações rodam. Na migração, o primeiro usuário de cada loja passa a ser ADMIN.

---

## 🔐 Autenticação e papéis

1. `POST /api/v1/auth/login` devolve um `accessToken` (15 min) e um `refreshToken` (7 dias).
2. O Axios envia `Authorization: Bearer <token>` em toda requisição.
3. Sem token ou com token expirado a API responde **401**, e o interceptor do front renova o token e repete a chamada.
4. **Registro** (`/register`) sempre cria uma **loja nova** e torna o usuário **ADMIN** dela. Funcionários entram na loja somente quando o ADMIN os cadastra em **Usuários**.

| Ação | USER | ADMIN |
| --- | :---: | :---: |
| Produtos, categorias, estoque, pedidos, relatórios | ✔ | ✔ |
| Cancelar pedido **finalizado** (devolve o estoque) | ✗ | ✔ |
| Cadastrar, editar, desativar usuários | ✗ | ✔ |

Uma conta desativada perde o acesso imediatamente, mesmo com token válido.

---

## 🖥️ Telas

| Rota | O que faz |
| :--- | :--- |
| `/login`, `/register` | Entrada e criação de conta + loja |
| `/dashboard` | Faturamento do dia e do mês, ticket médio, gráfico de 14 dias, mais vendidos, estoque baixo, exportação CSV |
| `/orders` | Lista de pedidos com filtro por status e criação de pedido |
| `/orders/:id` | Itens do pedido, editar (se aberto), finalizar com forma de pagamento, cancelar |
| `/products` | Busca por nome/SKU, filtro por categoria, estoque de cada produto |
| `/products/:id` | Detalhes, edição, movimentar estoque e histórico de movimentações |
| `/stock` | Produtos por menor estoque e alertas de reposição |
| `/categories` | Categorias (exclusão bloqueada se houver produtos) |
| `/users` | Equipe da loja (somente ADMIN) |

---

## 🔄 Regras de negócio principais

- **Pedido aberto** não mexe no estoque. Ao **finalizar**, o sistema baixa o estoque de todos os itens em uma única transação, travando os produtos (`SELECT ... FOR UPDATE`). Se faltar estoque de qualquer item, nada é baixado.
- **Cancelar** um pedido finalizado gera entradas "Cancelamento do pedido #N" e devolve o estoque.
- O estoque só muda por **movimentações** (entrada, saída, ajuste por contagem), então todo saldo tem histórico com usuário e motivo.
- Produto que já foi vendido não pode ser excluído: deve ser **desativado**.
- Categoria com produtos não pode ser excluída (resposta 409 com explicação).

---

## 🚀 Como rodar

### Docker Compose
```bash
docker compose up --build -d
```
- Frontend: http://localhost:3000
- API: http://localhost:8080
- Documentação interativa da API (Swagger): http://localhost:8080/swagger-ui.html

### Modo desenvolvimento
```bash
# Banco
docker run -d --name pm-db -e POSTGRES_DB=productmanager -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16-alpine
# API
cd backend && mvn spring-boot:run
# Front (http://localhost:3000, com proxy para a API)
cd frontend && npm install && npm run dev
```

### Testes
```bash
cd backend && mvn test
```
Os testes usam um banco H2 em memória (não precisam de PostgreSQL) e cobrem isolamento entre lojas, permissões, regras de estoque e o fluxo completo de pedidos.

---

## 🛰️ API (resumo)

Todas as rotas, exceto `/api/v1/auth/**`, exigem `Authorization: Bearer <accessToken>`. A lista completa, com exemplos, está no Swagger.

| Método | Rota | Descrição |
| --- | --- | --- |
| POST | `/api/v1/auth/register` | Cria loja + usuário ADMIN |
| POST | `/api/v1/auth/login` · `/refresh` | Tokens de acesso |
| GET | `/api/v1/users/me` | Usuário logado |
| GET/POST/PUT | `/api/v1/users` | Equipe da loja (ADMIN) |
| GET/POST/PUT/DELETE | `/api/v1/categories` | Categorias |
| GET | `/api/v1/products?search=&categoryId=&page=&size=&sortBy=&direction=` | Busca paginada (`sortBy`: name, price, createdAt, stockQty) |
| GET/POST/PUT/DELETE | `/api/v1/products/{id}` | Produto |
| GET/POST | `/api/v1/products/{id}/stock-movements` | Histórico / nova movimentação (`ENTRADA`, `SAIDA`, `AJUSTE`) |
| GET | `/api/v1/stock/low` | Produtos com estoque ≤ mínimo |
| GET/POST | `/api/v1/orders` | Lista (filtro `status`) / cria pedido |
| GET/PUT | `/api/v1/orders/{id}` | Detalhe / troca os itens (só ABERTO) |
| POST | `/api/v1/orders/{id}/finalize` · `/cancel` | Finaliza (baixa estoque) / cancela |
| GET | `/api/v1/reports/summary` · `/sales-by-day` · `/top-products` | Indicadores |
| GET | `/api/v1/reports/sales.csv?from=AAAA-MM-DD&to=AAAA-MM-DD` | Exporta vendas |

Exemplo: registrar, abrir e finalizar um pedido
```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/register -H "Content-Type: application/json" \
  -d '{"name":"Ana","email":"ana@burger.com","password":"123456","storeName":"Burger House"}' | jq -r .accessToken)

curl -X POST http://localhost:8080/api/v1/products -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"X-Burger","price":25.90,"sku":"LAN-001","minStock":5,"initialStock":30}'

curl -X POST http://localhost:8080/api/v1/orders -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"customerName":"Mesa 4","items":[{"productId":1,"quantity":2}]}'

curl -X POST http://localhost:8080/api/v1/orders/1/finalize -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"paymentMethod":"PIX"}'
```
