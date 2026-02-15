# Documentação da API 📡

Como acessar e utilizar a API do SalesOS Ultimate.

## Visão Geral

O SalesOS expõe duas APIs principais:
1. **API Web (Next.js)**: Utilizada pelo frontend e integrações simples.
2. **API de IA (FastAPI)**: Microserviço especializado em operações de Inteligência Artificial.

## 1. API de IA (FastAPI)

A documentação interativa (Swagger UI) é gerada automaticamente pelo FastAPI.

- **URL Local**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **URL Staging**: `https://staging-api.salesos.com/docs` (Exemplo)

### Autenticação
A maioria dos endpoints requer um token JWT válido no header `Authorization: Bearer <token>`.
O token é o mesmo gerado pelo NextAuth.js no frontend.

### Endpoints Principais
- **POST /api/v1/crawl**: Inicia um job de scraping.
- **POST /api/v1/enrich**: Enriquece dados de um lead com IA.
- **POST /api/v1/generate**: Gera copy de e-mail (Cold Mail).

## 2. API Web (Next.js)

Os endpoints do Next.js ficam em `apps/web/app/api`.
Atualmente não há geração automática de Swagger para estes endpoints (planejado para v2).

### Estrutura de Rotas
- `/api/auth/*`: Rotas do NextAuth.js (Login, Logout, Session).
- `/api/leads`: CRUD de Leads.
- `/api/campaigns`: Gerenciamento de Campanhas.
- `/api/webhooks/stripe`: Recebimento de eventos de pagamento.

### Como Testar
Recomendamos usar o **Insomnia** ou **Postman**.
Importe a coleção `docs/insomnia.json` (se disponível) para ter exemplos prontos.

### Roadmap v2 (Documentação Automática)
Planejamos integrar `next-swagger-doc` para gerar OpenAPI spec automaticamente para as rotas do Next.js, similar ao que o FastAPI já faz.
