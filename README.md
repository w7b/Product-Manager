# 🛍️ Product Manager — Fullstack

Sistema completo de gerenciamento de produtos com autenticação JWT.

## 📁 Estrutura

```
fullstack-pm/
├── docker-compose.yml          # Orquestra backend + frontend + postgres
├── backend/                    # Spring Boot 3.2 + Java 17
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/java/com/productmanager/
│       ├── auth/               # JWT, login, registro, refresh
│       ├── config/             # SecurityConfig, JwtFilter, CORS
│       ├── exception/          # Handler global de erros
│       └── module/
│           ├── category/       # CRUD de categorias
│           ├── product/        # CRUD de produtos com paginação
│           ├── store/          # Entidade loja
│           └── user/           # Entidade usuário (UserDetails)
└── frontend/                   # React 18 + Vite
    └── src/
        ├── api/                # axios + interceptors (refresh automático)
        ├── components/
        │   ├── layout/         # AppLayout com sidebar
        │   └── ui/             # Button, Input, Modal, Table, Badge…
        ├── context/            # AuthContext (login/logout/register)
        ├── hooks/              # useAsync, useConfirm
        ├── pages/
        │   ├── auth/           # LoginPage, RegisterPage
        │   └── dashboard/      # DashboardPage, ProductsPage,
        │                       # ProductDetailPage, CategoriesPage
        ├── routes/             # AppRoutes (PrivateRoute / PublicRoute)
        └── styles/             # global.css
```

## 🚀 Como rodar

### Com Docker (recomendado)
```bash
docker compose up --build
```
- Frontend: http://localhost:3000
- Backend:  http://localhost:8080

### Desenvolvimento local

**Backend:**
```bash
# Suba o banco primeiro
docker run -d --name pm-db -e POSTGRES_DB=productmanager -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16-alpine

cd backend
mvn spring-boot:run
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev      # http://localhost:3000
```

> O Vite proxy já redireciona `/api` → `http://localhost:8080`.

## 🔐 Rotas do frontend

| Rota               | Auth | Descrição              |
|--------------------|------|------------------------|
| `/login`           | ✗    | Login                  |
| `/register`        | ✗    | Cadastro               |
| `/dashboard`       | ✔    | Visão geral + métricas |
| `/products`        | ✔    | Lista + busca + CRUD   |
| `/products/:id`    | ✔    | Detalhe + edição inline|
| `/categories`      | ✔    | Lista + CRUD           |

## 🔑 Fluxo de autenticação

1. Login/Register → recebe `accessToken` (15 min) + `refreshToken` (7 dias)
2. Token salvo no `localStorage`
3. Axios interceptor adiciona `Authorization: Bearer` em toda requisição
4. Se 401 → tenta renovar com refresh token automaticamente
5. Se refresh falhar → redireciona para `/login`
