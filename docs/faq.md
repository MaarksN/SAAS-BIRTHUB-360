# FAQ Técnico (Perguntas Frequentes) ❓

Decisões de arquitetura e design explicadas para novos desenvolvedores.

## Stack & Tecnologia

### Por que usamos Prisma e não TypeORM/Drizzle?
- **Prisma**: Oferece a melhor DX (Developer Experience) para TypeScript, com autocompletar e validação de tipos robustos. A migração automática e a introspecção do banco são excelentes para desenvolvimento rápido.
- **TypeORM**: Foi considerado, mas a complexidade de decorators e problemas de manutenção o tornaram menos atraente.
- **Drizzle**: É uma opção moderna e mais leve, mas o Prisma já estava estabelecido e maduro no início do projeto.

### Por que Tailwind CSS?
- Permite desenvolvimento rápido sem sair do HTML/JSX.
- Elimina a necessidade de arquivos CSS separados e nomes de classes complexos (BEM).
- Integração perfeita com Shadcn UI.

### Por que Monorepo (Turborepo)?
- Permite compartilhar código (tipos, utils, UI) entre o frontend Next.js e os workers de backend.
- Facilita refatorações em larga escala.
- Otimiza o tempo de CI/CD com cache de build.

## Arquitetura

### Onde devo colocar minha lógica de negócio?
- **Frontend (UI)**: Apenas lógica de apresentação e validação de formulários.
- **Backend (API Routes)**: Orquestração e validação de requisições.
- **Libs (Core)**: Regras de negócio puras, reutilizáveis e testáveis. Se for complexo, coloque em `libs/core`.

### Como os serviços se comunicam?
- **Síncrono**: `apps/web` chama `apps/ai-agents` via HTTP (REST).
- **Assíncrono**: `apps/web` publica mensagens no Redis (BullMQ), e `libs/queue-core` ou `apps/ai-agents` consomem.

## Desenvolvimento

### Como debuggar os Agentes de IA?
- Use logs detalhados (`logger.info`).
- O Swagger UI (`/docs`) permite testar endpoints individualmente.
- O `pdb` (Python Debugger) pode ser usado se rodar localmente fora do Docker.
