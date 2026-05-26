# 🛍️ Product Manager — Fullstack Ecosystem

[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/)
[![React](https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Container-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

Uma solução corporativa completa para governança de estoques, gerenciamento multi-tenant de lojas e catalogação inteligente de produtos. Desenvolvido com uma arquitetura desacoplada utilizando **Spring Boot 3.2** no ecossistema de backend e **React + Vite** no ecossistema de frontend.

---

## 🗺️ Visão Geral da Arquitetura

O sistema adota o modelo de isolamento lógico por **Lojas (Stores)**, garantindo que usuários, categorias e produtos estejam estritamente vinculados a uma organização específica.

```fullstack-pm/
├── docker-compose.yml          # Orquestração da infraestrutura local (App + DB)
├── backend/                    # Core API: Spring Boot 3.2 + Java 17 + Maven
│   ├── Dockerfile
│   └── src/main/java/com/productmanager/
│       ├── auth/               # Mecanismo de segurança JWT & UserDetails
│       ├── config/             # Configurações de filtros, CORS e SecurityFilterChain
│       ├── exception/          # Interceptor global de exceções (Clean Responses)
│       └── module/             # Domínios de negócio isolados (Camadas segredadas)
│           ├── store/          # Contexto delimitador de Lojas
│           ├── user/           # Gestão de contas e perfis (Roles)
│           ├── category/       # Agrupamentos lógicos de produtos
│           └── product/        # Catálogo com paginação e ordenação nativa
└── frontend/                   # UI/UX Layer: React 18 + Vite + Tailwind/CSS
└── src/
├── api/                # Cliente Axios customizado + Interceptors para Auto-Refresh
├── components/         # Design System (Atomic Components & Layouts)
├── context/            # Gerenciamento de estado global (AuthContext)
├── hooks/              # Hooks customizados para abstração de lógica assíncrona
├── pages/              # Views baseadas em rotas declarativas
└── routes/             # Guardas de rotas dinâmicas (Públicas vs Privadas)
```

---

## 🔐 Engine de Autenticação & Segurança

O fluxo de segurança implementa o padrão clássico de tokens de curta duração aliado a tokens de renovação, mitigando riscos de hijacking de sessão:

1. **Handshake Inicial:** `/api/auth/login` devolve um `accessToken` (15 min) e um `refreshToken` (7 dias).
2. **Sessão Persistente:** Os tokens de sessão são isolados e gerenciados no estado da aplicação e `localStorage`.
3. **Interceptor de Requisições:** O cliente Axios injeta automaticamente o cabeçalho `Authorization: Bearer <token>` em rotas protegidas.
4. **Auto-Refresh Loop:** Se a API retornar um status `401 Unauthorized`, o Interceptor congela a pilha de requisições, consome o endpoint de refresh e reexecuta as chamadas originais de forma transparente para o usuário.

| Rota Visual | Protegida? | Escopo / Operação |
| :--- | :---: | :--- |
| `/login` | ✗ | Autenticação e geração de chaves criptográficas. |
| `/register` | ✗ | Criação de conta e provisionamento de Tenant. |
| `/dashboard` | **✔** | Agregados analíticos e gráficos de inventário. |
| `/products` | **✔** | Grid operacional de produtos + Busca avançada + Paginação. |
| `/products/:id` | **✔** | Detalhamento técnico do item e mutação de dados inline. |
| `/categories` | **✔** | Painel estrutural de classificação de catálogo. |

---

## 🚀 Inicialização do Ecossistema

### Via Docker Compose (Abordagem Pronta para Produção)
Para subir todo o ecossistema (Frontend, Backend e Banco de Dados) configurados para se comunicarem nativamente via redes Docker:

```bash
docker compose up --build -d
```

- Acesso à UI (Frontend): http://localhost:3000
- Gateway da API (Backend): http://localhost:8080

Inicialização Isolada (Modo de Desenvolvimento)
```bash
docker run -d --name pm-db \
  -e POSTGRES_DB=productmanager \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:16-alpine
  ```

## 🛰️ Manual da API (Playbook de Comandos cURL)
Utilize os roteiros de comandos abaixo para inspecionar, testar e homologar os comportamentos das rotas diretamente via terminal de linha de comando.

💡 Dica: Substitua o valor da variável TOKEN pelo hash retornado no endpoint de login.

🔑 Autenticação e Registro
Registrar Novo Usuário / Administrador
```bash 
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alex Admin",
    "email": "alex@empresa.com",
    "password": "SenhaSegura123",
    "role": "ADMIN"
  }'
```

Efetuar Login (Obter Tokens de Sessão)
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alex@empresa.com",
    "password": "SenhaSegura123"
  }'
```

🏪 Gestão de Lojas (Multi-Tenant Stores)
Cadastrar Unidade Comercial
```bash
curl -X POST http://localhost:8080/api/stores \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Distribuidora Central Tech"
  }'
  ```

Listar Unidades Disponíveis
```bash
curl -X GET http://localhost:8080/api/stores \
  -H "Authorization: Bearer $TOKEN"
```

📂 Controle de Categorias
Criar Categoria Estrutural
```bash
curl -X POST http://localhost:8080/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Hardware Premium",
    "description": "Componentes eletrônicos de alta performance",
    "store_id": 1
  }'
```

Consultar Categorias Vinculadas à Loja

```bash

curl -X GET "http://localhost:8080/api/categories?storeId=1" \
  -H "Authorization: Bearer $TOKEN"
```

📦 Catálogo de Produtos
Incluir Produto com Vinculações Relacionais

```bash

curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Monitor UltraWide 34",
    "description": "Painel IPS, 144Hz, Resolução QHD",
    "price": 2499.90,
    "category_id": 1,
    "store_id": 1
  }'
  ```

Recuperar Catálogo Paginado
```bash
curl -X GET "http://localhost:8080/api/products?page=0&size=10&sort=name,asc" \
  -H "Authorization: Bearer $TOKEN"
```

Modificar Atributos de Produto (Update Inline)
```bash
curl -X PUT http://localhost:8080/api/products/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Monitor UltraWide 34 PRO",
    "price": 2649.00
  }''
  ```

Excluir Registro de Produto
```bash
curl -X DELETE http://localhost:8080/api/products/1 \
  -H "Authorization: Bearer $TOKEN"
```