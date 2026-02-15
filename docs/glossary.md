# Glossário de Termos de Negócio (Ubiquitous Language) 📘

Para manter a comunicação clara entre o time de desenvolvimento (técnico) e o time de vendas (domínio), utilizamos os seguintes termos. Todos os nomes de tabelas, variáveis e classes devem refletir estes conceitos.

## Entidades Principais

### Lead (Prospect)
Uma pessoa ou organização que demonstrou interesse ou foi identificada como cliente potencial, mas ainda não é um cliente.
- **Técnico**: Modelo `Lead` ou `Contact` no Prisma.
- **Atributos**: `email`, `linkedin_url`, `company_name`, `status` (New, Contacted, Qualified).

### Deal (Oportunidade)
Um processo de venda ativo com um Lead qualificado. Representa uma potencial receita.
- **Técnico**: Modelo `Deal` ou `Opportunity`.
- **Atributos**: `amount` (Valor), `stage` (Discovery, Proposal, Negotiation), `close_date`.

### Account (Empresa / Organização)
A entidade jurídica ou organização à qual um Lead pertence.
- **Técnico**: Modelo `Account` ou `Organization` (cuidado para não confundir com `Tenant/Organization` do SaaS).
- **Nota**: No contexto B2B, vendemos para Contas, através de Pessoas (Leads).

### Agent (Agente de IA)
Um worker autônomo especializado em uma tarefa (ex: "SDR Agent" para triagem, "Research Agent" para enriquecimento).
- **Técnico**: Serviço Python (`apps/ai-agents`), Worker BullMQ (`libs/queue-core`).

### Campaign (Campanha)
Um conjunto de ações automatizadas (Sequência de e-mails, LinkedIn tasks) direcionadas a um segmento de Leads.
- **Técnico**: Modelo `Campaign`.
- **Atributos**: `steps` (Wait 2 days -> Send Email -> Wait -> Like Post).

### Workflow (Fluxo de Trabalho)
A orquestração lógica de uma campanha ou automação.
- **Técnico**: Motor de regras (`libs/core/src/services/workflow-engine.ts`).

---

## Termos de Processo

### Enrichment (Enriquecimento)
O processo de buscar dados adicionais sobre um Lead (ex: Tech Stack, Revenue, News) em fontes externas.
- **Ação**: `enrichLead(leadId)`.

### Scoring (Pontuação)
O cálculo de probabilidade de conversão de um Lead (0-100).
- **Ação**: `calculateLeadScore(lead)`.

### Outreach (Prospecção)
O ato de iniciar contato (Cold Email, Cold Call, LinkedIn Message).

### Cadence (Cadência)
A frequência e o ritmo das tentativas de contato em uma campanha (ex: "Dia 1: Email, Dia 3: Call, Dia 7: Email").

---

## Status do Lead (Lifecycle Stage)

1. **Subscriber**: Apenas assinou newsletter.
2. **Lead**: Contato identificado.
3. **MQL (Marketing Qualified Lead)**: Demonstrou interesse (baixou ebook, visitou preço).
4. **SQL (Sales Qualified Lead)**: Validado pelo time de vendas (BDR/SDR) como tendo fit e orçamento.
5. **Opportunity**: Tem um Deal aberto.
6. **Customer**: Fechou negócio.
7. **Evangelist**: Promove o produto.
