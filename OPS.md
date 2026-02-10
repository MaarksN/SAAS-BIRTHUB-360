# MANUAL OPERACIONAL | DEFCON 3

Este documento define os protocolos operacionais implementados durante a operação de fechamento de lacunas.

## 🔴 1. CONTROLE DE CUSTO & RATE LIMITING
**Localização:** `libs/core/src/guard.ts`

### Mecanismo
- **Rate Limit:** Token Bucket em memória.
- **Cost Guard:** Limite diário de "custo" (unidades fictícias) por usuário.

### Configuração
| Variável | Valor Padrão | Descrição |
|---|---|---|
| `guard.checkRateLimit` | 20 req/min (AI), 100 req/min (Geral) | Bloqueia spam de requisições. |
| `guard.checkCost` | 1000 unidades/dia | Bloqueia consumo excessivo de API paga. |

**Ação em caso de Bloqueio:**
O sistema lança `AppError` ou `Error` padrão, que deve ser tratado pelo frontend com mensagem amigável.

---

## 🔴 2. OBSERVABILIDADE (ID DE CORRELAÇÃO)
**Localização:** `apps/web/middleware.ts`, `libs/core/src/context.ts`

### Funcionamento
- Todo request recebe um header `X-Request-ID`.
- O ID é propagado via `AsyncLocalStorage` para todos os logs gerados em `libs/core/src/logger.ts`.
- Em caso de erro, solicite o `request_id` do usuário ou busque nos logs.

---

## 🔴 3. FEATURE FLAGS (KILL SWITCHES)
**Localização:** `libs/core/src/features.ts`

### Flags Disponíveis
Para desativar uma feature sem deploy, defina a variável de ambiente no servidor (Vercel/Docker):

| Flag | Env Var | Padrão | Função |
|---|---|---|---|
| `AI_ENABLED` | `FEATURE_AI_ENABLED` | `true` | Desliga todas as chamadas ao LLM Gateway. |
| `BILLING_ENABLED` | `FEATURE_BILLING_ENABLED` | `true` | (Reservado) Controle de fluxo de pagamento. |

**Procedimento de Emergência:**
1. Acesse o painel de variáveis de ambiente.
2. Defina `FEATURE_AI_ENABLED=false`.
3. Redeploy/Restart (dependendo da infra, pode exigir restart rápido).

---

## 🔴 4. RECUPERAÇÃO DE DESASTRES (BACKUP)
**Localização:** `tools/verify-backup.ts`, `tools/restore-procedure.md`

- **Verificação:** Execute `npx tsx tools/verify-backup.ts` para validar integridade de conexão e leitura.
- **Restore:** Siga os passos em `tools/restore-procedure.md`.
- **RTO Estimado:** 15-30 minutos.

---

## 🔴 5. PROTOCOLO DE SUPORTE (DIA ZERO)

### Definição de Responsabilidade
- **Nível 1 (Triagem):** Automático via Dashboard de Logs.
- **Nível 2 (Técnico):** Engenheiro de Plantão (On-call).

### SLA de Resposta
- **Crítico (Sistema Fora/Dados):** 1 hora.
- **Alto (Feature Bloqueada):** 4 horas.
- **Normal (Dúvida/Bug menor):** 24 horas.

### Canal de Comunicação
- Slack Interno: `#ops-war-room`
- Email de Emergência: `ops@salesos.internal`

---

**Última Atualização:** Operação Defcon 3
**Agente:** Jules
