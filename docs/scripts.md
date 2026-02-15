# Documentação de Scripts (package.json) 📜

Abaixo, descrevemos os scripts definidos no `package.json` principal e seu propósito.

## Comandos Principais

### `npm install`
- **Descrição**: Instala todas as dependências do monorepo (Node.js e Python).
- **Quando usar**: Sempre após clonar ou fazer pull do repositório.

### `npm run dev`
- **Descrição**: Inicia o servidor de desenvolvimento para todas as aplicações (`turbo run dev`).
  - **apps/web**: Next.js (Web App)
  - **apps/ai-agents**: Python/FastAPI (AI Backend)
  - **libs/queue-core**: BullMQ Workers
- **Portas**:
  - `3000`: Web App
  - `8000`: AI API
  - `6379`: Redis (via Docker)
  - `5432`: PostgreSQL (via Docker)

### `npm run build`
- **Descrição**: Compila todas as aplicações e bibliotecas para produção (`turbo run build`).
- **Garantias**: Verifica tipos (TypeScript) e executa validação de variáveis de ambiente.

### `npm run lint`
- **Descrição**: Executa linters (ESLint, Prettier, flake8) em todo o código.

### `npm run format`
- **Descrição**: Formata automaticamente o código usando Prettier.

---

## Banco de Dados (Prisma)

### `npm run migrate`
- **Descrição**: Aplica migrações pendentes no banco de dados (`prisma migrate deploy`).
- **Use em**: Produção ou quando baixar código novo.

### `npm run db:seed`
- **Descrição**: Popula o banco de dados com dados iniciais (usuários admin, planos de assinatura).
- **Use em**: Primeira configuração ou após resetar o banco.

### `npm run db:reset`
- **Descrição**: ⚠️ Apaga todo o banco de dados e roda migrações/seed novamente.
- **Use em**: Apenas desenvolvimento.

### `npm run db:studio`
- **Descrição**: Abre uma interface web para visualizar e editar dados do banco.
- **URL**: http://localhost:5555

---

## Infraestrutura & Setup

### `npm run setup`
- **Descrição**: Script automatizado (`scripts/setup.sh`) para verificar dependências, configurar ambiente e rodar infraestrutura inicial.

### `npm run workers:restart`
- **Descrição**: Reinicia os processos de fila (workers) para aplicar mudanças no código de background jobs.

### `npm run cleanup`
- **Descrição**: Limpa containers Docker e caches temporários (`scripts/cleanup.sh`).
