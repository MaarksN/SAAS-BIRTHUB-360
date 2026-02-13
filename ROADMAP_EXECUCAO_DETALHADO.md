# ROADMAP DE EXECUÇÃO - SAAS-BIRTHUB

## Ciclo 01: Containerização Universal, Otimizada e Segura

### Objetivo
Estabelecer a base de infraestrutura com Docker, garantindo builds otimizados, seguros e separados para runtime.

### Diretrizes Técnicas Obrigatórias

#### Containers
- Utilizar **Multistage builds** para reduzir o tamanho final da imagem.
- Basear em **Imagens mínimas** (ex: node:alpine, python:slim).
- Garantir **Separação clara entre build e runtime** (arquivos de fonte não devem ir para produção).

#### Banco e Estado
- **Prisma** deve ser configurado com índices reais no schema.
- Implementar **Soft delete** via middleware no Prisma.
- **Redis** deve ser configurado como infraestrutura base para cache e filas.

#### Node (Next.js) ↔ Python (FastAPI)
- Estabelecer **Contratos tipados** usando Zod (Node) e Pydantic (Python).
- Utilizar **Redis como broker** para comunicação assíncrona.
- **Sem payloads dinâmicos**: Tudo deve ser tipado e validado.

#### Scraping
- **Execução isolada** em containers específicos ou workers.
- **Controle de memória** rigoroso para evitar OOM.
- Implementar **Rotação de proxy e user-agent**.

### Passos de Execução
1.  **Configuração Docker**: Criar `Dockerfile` otimizado para `apps/web` e `apps/ai-agents`.
2.  **Orquestração**: Criar `docker-compose.yml` na pasta `infra/` com serviços essenciais (Postgres, Redis).
3.  **Validação**: Garantir que o build ocorra com sucesso e os containers subam saudáveis.

---

## Ciclos Futuros

### Ciclo 02: Core da Aplicação e Autenticação
- Implementação de Auth.
- Estrutura de Banco de Dados inicial.

### Ciclo 03: Agentes de IA e Scraping
- Implementação dos serviços Python.
- Integração com LLMs.

### Ciclo 04: Frontend e Dashboard
- Interface do usuário.
- Visualização de dados.
