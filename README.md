# SalesOS Ultimate 🚀

Bem-vindo ao **SalesOS Ultimate**, a plataforma unificada de aceleração de vendas que combina CRM, Inteligência de Mercado e Agentes de IA Autônomos.

Este repositório é um **Monorepo** gerenciado pelo [Turborepo](https://turbo.build/), contendo aplicações web (Next.js), serviços de IA (Python/FastAPI) e bibliotecas compartilhadas.

---

## ⚡ Quick Start ("Zero to Hero")

Siga estes passos para rodar o projeto em **menos de 15 minutos**.

### 1. Pré-requisitos

Certifique-se de ter as seguintes ferramentas instaladas:

- **Node.js**: v20.10.0+ (`node -v`)
- **pnpm** ou **npm**: v10+
- **Python**: v3.11+ (`python3 --version`)
- **Docker & Docker Compose**: Para rodar o banco de dados e Redis.

### 2. Instalação

Clone o repositório e instale as dependências:

```bash
git clone https://github.com/seu-org/salesos-ultimate.git
cd salesos-ultimate

# Instalar dependências (Node.js)
npm install

# Setup inicial (criação de arquivos .env, etc)
# (Se o script setup não existir, copie manualmente)
cp .env.example .env
```

### 3. Configuração de Ambiente

O arquivo `.env` na raiz controla as variáveis de ambiente globais.
Preencha as chaves obrigatórias (ex: `OPENAI_API_KEY`, `DATABASE_URL`).

> **Nota**: O sistema valida as variáveis ao iniciar. Se algo estiver faltando, o build falhará.

### 4. Infraestrutura (Banco de Dados & Redis)

Suba os containers Docker:

```bash
# Iniciar Postgres e Redis em background
docker-compose -f docker-compose.dev.yml up -d
```

Execute as migrações e o seed do banco de dados:

```bash
# Gerar cliente Prisma
npx prisma generate

# Rodar migrações
npm run migrate

# Popular banco com dados iniciais
npm run db:seed
```

### 5. Rodar a Aplicação

Inicie todo o stack (Frontend + Backend + IA) com um único comando:

```bash
npm run dev
```

- **Web App**: [http://localhost:3000](http://localhost:3000)
- **AI API**: [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI)
- **Prisma Studio**: `npm run db:studio` (Gerenciador de Banco de Dados)

---

## 🏗️ Arquitetura

O projeto segue uma arquitetura baseada em microserviços e monorepo:

- **[apps/web](./apps/web)**: Frontend e Backend-for-Frontend (BFF) em Next.js 14 (App Router).
- **[apps/ai-agents](./apps/ai-agents)**: Microserviço Python (FastAPI) para tarefas pesadas de IA (Scraping, RAG).
- **[libs/core](./libs/core)**: Lógica de negócio compartilhada, tipos e acesso a dados (Prisma).
- **[packages/database](./packages/database)**: Definição do Schema Prisma e migrações.
- **[infra](./infra)**: Configurações de Docker, Terraform, etc.

Para mais detalhes, consulte a [Documentação de Arquitetura](./docs/architecture/c4.md).

---

## 🤝 Como Contribuir

Quer ajudar? Ótimo! Por favor, leia nosso [Guia de Contribuição](./CONTRIBUTING.md) para entender nosso fluxo de trabalho, padrões de código e política de Pull Requests.

### Comandos Úteis

- `npm run build`: Compila todos os pacotes.
- `npm run lint`: Verifica a qualidade do código.
- `npm run test`: Roda testes unitários.
- `npx husky init`: Re-inicializa hooks do git (se necessário).

---

## 📚 Documentação

- [Estrutura do Projeto](./docs/structure.md)
- [Glossário de Termos](./docs/glossary.md)
- [Guia de Scripts](./docs/scripts.md)
- [Troubleshooting](./docs/troubleshooting.md)
- [Deploy & Rollback](./docs/ops/deploy-rollback.md)

---

## 📄 Licença

Este projeto é proprietário e confidencial.
