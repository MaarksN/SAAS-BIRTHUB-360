# Guia de Troubleshooting (Resolução de Problemas) 🛠️

Este guia cobre os erros mais comuns encontrados durante o desenvolvimento e como resolvê-los.

## Banco de Dados & Prisma

### 1. `PrismaClientInitializationError: Can't reach database server`
- **Causa**: O container do PostgreSQL não está rodando ou a porta 5432 não está exposta.
- **Solução**:
  ```bash
  docker-compose -f docker-compose.dev.yml up -d postgres
  ```

### 2. `The table public.User does not exist in the current database.`
- **Causa**: O banco foi criado mas as migrações não foram aplicadas.
- **Solução**:
  ```bash
  npm run migrate
  ```

### 3. `Error: Schema engine mismatch`
- **Causa**: Você instalou dependências em um OS (ex: Linux) e tentou rodar em outro (ex: Windows/Mac) sem gerar o cliente novamente.
- **Solução**:
  ```bash
  npx prisma generate
  ```

## Python & AI Agents

### 1. `ModuleNotFoundError: No module named 'fastapi'`
- **Causa**: O ambiente virtual (venv) não está ativo ou as dependências não foram instaladas.
- **Solução**:
  ```bash
  cd apps/ai-agents
  python3 -m venv venv
  source venv/bin/activate
  pip install -r requirements.txt
  ```

### 2. `ConnectionRefusedError: [Errno 111] Connect to localhost:6379`
- **Causa**: O container Redis não está rodando.
- **Solução**:
  ```bash
  docker-compose -f docker-compose.dev.yml up -d redis
  ```

## Docker

### 1. `Bind for 0.0.0.0:5432 failed: port is already allocated`
- **Causa**: Você já tem um PostgreSQL rodando na máquina (fora do Docker).
- **Solução**: Pare o serviço local (`sudo service postgresql stop`) ou altere a porta no `docker-compose.dev.yml` (ex: `5433:5432`).

### 2. Containers "morrendo" logo após iniciar
- **Causa**: Erro na configuração ou falta de variáveis de ambiente.
- **Solução**: Veja os logs:
  ```bash
  docker logs salesos-ai-agents --tail 50
  ```

## Performance

### 1. Build do Next.js muito lento
- **Causa**: Cache do Turborepo corrompido ou muitas dependências.
- **Solução**:
  ```bash
  rm -rf .turbo node_modules/.cache
  npm run dev
  ```
