# Guia de Contribuição 🤝

Obrigado por contribuir com o SalesOS Ultimate! Este documento define os padrões e fluxos de trabalho para garantir a qualidade e manutenibilidade do código.

## 🚀 Fluxo de Trabalho (Git Workflow)

Utilizamos o **Git Feature Branch Workflow**.
- **`main`**: Branch de produção. Nunca faça commits diretamente nela.
- **`develop`** (se houver) ou branches de feature: Todas as novas funcionalidades devem ser criadas em branches separadas a partir da `main`.

### Nomenclatura de Branches
Use prefixos claros:
- `feat/nova-funcionalidade`
- `fix/correcao-bug`
- `docs/atualizacao-readme`
- `chore/dependencias`

### Commits
Seguimos o padrão **Conventional Commits**. O Husky verificará suas mensagens de commit automaticamente.
Exemplos:
- ✅ `feat: adiciona login social`
- ✅ `fix(auth): corrige token expirado`
- ❌ `adicionei login` (rejeitado pelo commitlint)

## 🎨 Guia de Estilo (Code Style)

### TypeScript / JavaScript
- Utilize **camelCase** para variáveis e funções.
- Utilize **PascalCase** para Componentes React e Classes.
- Utilize **kebab-case** para nomes de arquivos (ex: `user-profile.tsx`).
- Prefira `const` sobre `let`. Nunca use `var`.
- Tipagem estrita: evite `any`. Use `unknown` se necessário.
- Use **Prettier** para formatação automática (o VS Code deve formatar ao salvar).

### CSS / Tailwind
- Utilize classes utilitárias do TailwindCSS.
- Evite CSS modules ou styles-in-js, a menos que estritamente necessário para animações complexas.
- Agrupe classes relacionadas ou use `clsx`/`cn` para condicionais.

### React
- Componentes funcionais com Hooks.
- Colocação (Colocation): Mantenha testes, stories e estilos próximos ao componente se possível, ou na pasta `components/ui`.
- Use Server Components por padrão no App Router. Use `'use client'` apenas quando interatividade for necessária.

## 🧪 Testes

Todo novo código deve ser testado.
- **Unitários**: Jest/Vitest para lógica de negócio e utils.
- **Integração**: Testes de API e fluxo de dados.
- **E2E**: Playwright para fluxos críticos de usuário (Login, Checkout).

Execute `npm run test` antes de abrir um PR.

## 📝 Pull Requests (PR)

1. Garanta que seu código está atualizado com a `main`.
2. Preencha o template de PR completamente.
3. Adicione screenshots ou vídeos para mudanças visuais.
4. Solicite review de pelo menos um colega (Code Review).
5. O CI deve passar (lint, build, testes) antes do merge.

## 🐛 Reportando Bugs

Use as Issues do GitHub com o label `bug`. Descreva:
- Passos para reproduzir.
- Comportamento esperado vs atual.
- Logs ou mensagens de erro.
