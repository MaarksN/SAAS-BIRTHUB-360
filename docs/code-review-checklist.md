# Checklist de Code Review ✅

Use esta lista para verificar a qualidade do código em Pull Requests (PRs).

## Requisitos de Negócio
- [ ] O código resolve o problema descrito na Issue/Ticket?
- [ ] Foram considerados casos de borda e falhas de negócio? (ex: "E se o usuário não tiver saldo?")
- [ ] Existe uma issue aberta no GitHub para documentar a mudança?

## Padrões de Código & Arquitetura
- [ ] O código está legível e auto-explicativo (nomes de variáveis e funções claros)?
- [ ] A lógica de negócio está desacoplada da camada de apresentação (React/UI)?
- [ ] O arquivo `CONTRIBUTING.md` foi seguido (naming conventions, commits, etc)?
- [ ] Dependências desnecessárias foram evitadas? (ex: `lodash` para funções que o JS nativo já faz).

## Testes & Qualidade
- [ ] Testes unitários foram adicionados ou atualizados para cobrir a nova funcionalidade?
- [ ] O linting (`npm run lint`) passou sem erros?
- [ ] O build (`npm run build`) passou sem erros?

## Segurança & Performance
- [ ] Variáveis de ambiente sensíveis (API Keys, Secrets) não foram hardcoded?
- [ ] Tratamento de erros adequado foi implementado (Try-Catch, logs)?
- [ ] Consultas ao banco de dados foram otimizadas (ex: `select` específico em vez de `findMany` gigante, uso de índices)?
- [ ] O código introduz gargalos de performance óbvios (loops aninhados em arrays grandes)?

## Documentação
- [ ] Comentários explicam o "porquê", não o "como" (o código deve explicar o como).
- [ ] Documentação de API (Swagger/OpenAPI) ou README foi atualizada se necessário?
