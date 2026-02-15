# Estrutura do Monorepo 📂

O **SalesOS Ultimate** utiliza [Turborepo](https://turbo.build/) para gerenciar dependências e build incremental.

## Diretórios Principais

- **apps/**: Aplicações executáveis e serviços.
  - **web/** (`apps/web`): Aplicação Next.js 14 (Frontend/BFF). Contém interfaces de usuário (Dashboard, Lead Intelligence) e API Routes.
  - **ai-agents/** (`apps/ai-agents`): Serviço backend em Python (FastAPI). Responsável por scraping (Selenium/Playwright), enriquecimento de dados (RAG) e interação com LLMs.

- **libs/**: Bibliotecas compartilhadas (lógica de negócio, utils, componentes).
  - **core/** (`libs/core`): Núcleo da aplicação. Contém serviços (Email, Pagamento), tipos TypeScript, validações Zod e configurações globais.
  - **ui/** (`libs/ui`): Biblioteca de componentes React (baseada em Shadcn UI/Radix). **Não deve conter lógica de negócio**.
  - **queue-core/** (`libs/queue-core`): Configurações de filas (BullMQ) e workers.

- **packages/**: Pacotes internos npm.
  - **database/** (`packages/database`): Definição do Schema Prisma (`schema.prisma`) e Cliente Prisma gerado. Centraliza o acesso ao banco de dados PostgreSQL.
  - **config/** (`packages/config`): Configurações compartilhadas de ESLint, TypeScript e Tailwind.

- **infra/**: Configurações de infraestrutura (Docker, Terraform, Scripts de Deploy).

## Dependências Cruzadas

O `apps/web` consome `libs/core` e `libs/ui` via workspace protocol (`workspace:*`).
O `libs/core` consome `packages/database`.
O `apps/ai-agents` acessa o banco diretamente ou via API do `apps/web` (dependendo do fluxo).

## Por que Monorepo?

- **Reutilização de Código**: Tipos e utilitários compartilhados entre Frontend e Workers.
- **Consistência**: Linting e formatação unificados.
- **Velocidade**: Turborepo armazena cache de builds e testes. Se você não alterou `apps/ai-agents`, ele não será re-buildado.
