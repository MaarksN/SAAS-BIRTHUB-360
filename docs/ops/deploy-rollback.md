# Deploy & Rollback 🚢

Guia para deploy em produção e recuperação (rollback) em caso de incidentes.

## Deploy

O processo de deploy depende da infraestrutura (Vercel, AWS ECS, Railway). Este guia assume uma infraestrutura baseada em Docker (Docker Compose ou ECS).

### 1. Preparação

Antes de iniciar o deploy:
1. Certifique-se de que a branch `main` está atualizada e passou em todos os testes no CI.
2. Gere uma nova tag de versão (ex: `v1.2.0`).

### 2. Build de Imagens

```bash
docker build -t salesos-web:v1.2.0 -f apps/web/Dockerfile .
docker build -t salesos-ai-agents:v1.2.0 -f apps/ai-agents/Dockerfile .
docker build -t salesos-workers:v1.2.0 -f libs/queue-core/Dockerfile .
```

### 3. Execução em Produção

Atualize o arquivo `docker-compose.prod.yml` com as novas tags de imagem e reinicie os serviços:

```bash
docker-compose -f docker-compose.prod.yml up -d --remove-orphans
```

### 4. Migrações de Banco de Dados

Sempre rode as migrações após atualizar o código, mas verifique se são compatíveis com a versão antiga (caso precise de rollback).

```bash
npx prisma migrate deploy
```

---

## Rollback (Recuperação)

Se um deploy introduzir um bug crítico, siga este procedimento para recuperar o sistema em menos de 5 minutos (MTTR).

### 1. Reverter Código (Aplicação)

Se o erro for na aplicação (crash, bug lógico):
1. Identifique a versão anterior estável (ex: `v1.1.9`).
2. Atualize o `docker-compose.prod.yml` para usar a tag anterior.
3. Reinicie os serviços:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### 2. Reverter Banco de Dados (Schema)

Se o erro for causado por uma migração de banco de dados (ex: coluna renomeada que quebrou a query):

1. **ATENÇÃO**: Reverter migrações pode causar perda de dados inseridos na nova versão.
2. Identifique a migração problemática.
3. Use o comando `prisma migrate resolve` para marcar como revertida (se aplicável) ou restaure o backup.

> **Recomendação**: Pratique "Non-Breaking Migrations". Adicione colunas novas, migre os dados, e só depois remova as colunas antigas em um deploy futuro.

### 3. Restaurar Backup (Último Recurso)

Se os dados foram corrompidos:
1. Pare a aplicação.
2. Restaure o dump mais recente do PostgreSQL.
   ```bash
   pg_restore -d salesos_prod latest_backup.dump
   ```
