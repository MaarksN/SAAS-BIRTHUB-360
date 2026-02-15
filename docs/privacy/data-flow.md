# Mapeamento de Dados Sensíveis (GDPR/LGPD) 🛡️

Este documento descreve o fluxo de Dados Pessoais Identificáveis (PII) dentro do SalesOS Ultimate.

## Dados Coletados

### 1. Dados do Usuário (Cliente)
- **PII Direto**: Nome, E-mail, Senha (Hash), Telefone.
- **PII Indireto**: Endereço IP, Cookies de Sessão.
- **Fonte**: Cadastro (Sign Up), Login Social.
- **Armazenamento**: Tabela `User` no PostgreSQL.
- **Processamento**: Autenticação (NextAuth.js), Envio de E-mail (Resend), Faturamento (Stripe).

### 2. Dados de Leads (Prospects)
- **PII Direto**: Nome, E-mail Corporativo/Pessoal, Telefone, LinkedIn URL.
- **PII Indireto**: Cargo, Empresa, Histórico de Emprego.
- **Fonte**: Importação manual (CSV), Integração CRM (HubSpot), Scraping (LinkedIn/Google).
- **Armazenamento**: Tabela `Lead` no PostgreSQL.
- **Processamento**: Enriquecimento de Dados (AI Agents), Segmentação, Envio de Cold Mail.

---

## Fluxo de Dados (DFD)

```mermaid
graph TD
    User((Usuário))
    External[[Fontes Externas]]
    API[API Gateway / Next.js]
    DB[(PostgreSQL)]
    AI[AI Service]
    Vendors[Subprocessadores]

    User -->|Envia CSV/Dados| API
    External -->|Scraping| AI

    API -->|Criptografa| DB
    AI -->|Enriquece| DB

    DB -->|Sincroniza| Vendors

    subgraph Subprocessadores
    OpenAI[OpenAI/Anthropic (Prompts sem PII explícito se anonimizado)]
    HubSpot[HubSpot CRM (Sync Bidirecional)]
    Resend[Resend (Envio de E-mail)]
    Stripe[Stripe (Pagamentos)]
    end
```

## Medidas de Proteção

1. **Criptografia em Repouso**: O banco de dados PostgreSQL deve estar em volume criptografado (depende do provider de cloud).
2. **Criptografia em Trânsito**: Todo o tráfego é TLS 1.2+ (HTTPS).
3. **Senhas**: Hashing com bcrypt/argon2 (via NextAuth).
4. **Controle de Acesso (RBAC)**: Apenas usuários com role `ADMIN` ou `OWNER` podem exportar dados em massa.
5. **Logs de Auditoria**: Ações sensíveis (ex: "Exportar Leads", "Deletar Conta") são registradas na tabela `AuditLog`.

## Retenção de Dados

- **Contas Inativas**: Dados mantidos por 5 anos após cancelamento (para fins legais/fiscais), salvo solicitação de exclusão.
- **Leads**: Dados de leads são de responsabilidade do controlador (cliente). Se o cliente deletar a conta, todos os leads associados são removidos (Cascade Delete).

## Solicitação de Exclusão (Direito ao Esquecimento)

Para solicitar a remoção completa de dados:
1. O usuário deve entrar em contato com o suporte ou usar a função "Deletar Conta" no painel.
2. O sistema executa um Job de limpeza (`Hard Delete`) que remove registros do PostgreSQL e Redis.
3. Notificação é enviada aos subprocessadores (se aplicável via API).
