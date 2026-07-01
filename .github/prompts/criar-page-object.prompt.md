---
name: "Criar Page Object"
description: "Gera um Page Object completo para uma página do Hub de Leitura seguindo o padrão POM deste projeto: seletores como getters, ações retornando this, sem asserções na classe, barrel file e spec de exemplo."
argument-hint: "Nome da página ou funcionalidade (ex: login, catalogo, reserva, admin)"
agent: agent
---

# Criar Page Object — Hub de Leitura

Crie um Page Object completo para a página/funcionalidade informada. Siga **rigorosamente** os padrões do projeto descritos em [qa-automation-standards.md](../../.agents/qa-automation-standards.md) e na [skill page-objects](../../.agents/skills/page-objects/SKILL.md).

## Contexto do projeto

- Framework: **Cypress** com **JavaScript** (não TypeScript)
- Módulos: **CommonJS** (`require` / `module.exports`)
- Seletores preferidos: `data-testid` → `aria-label` → `id` → `name`
- Página de destino: `cypress/pages/<NomePagina>Page.js`
- Credenciais e URLs: sempre via `Cypress.env()`, nunca hardcoded
- Autenticação: via `cy.session()` + `cy.request()`, nunca pela UI
- Base URL: `/login.html`, `/catalogo.html`, `/admin.html`, etc.

## O que gerar

### 1. Arquivo do Page Object

**Local:** `cypress/pages/<NomePagina>Page.js`

Estrutura obrigatória em três seções separadas por comentários:

```javascript
class <NomePagina>Page {

  // ─── Seletores ────────────────────────────────────────────────────────────
  // Getters puros: data-testid preferencialmente

  // ─── Navegação ────────────────────────────────────────────────────────────
  // visit() retorna this

  // ─── Ações ────────────────────────────────────────────────────────────────
  // Métodos de ação atômica e fluxos compostos, todos retornam this
  // SEM asserções (.should, expect, assert)
}

module.exports = { <NomePagina>Page }
```

### 2. Atualização do barrel file

Adicione a exportação em `cypress/pages/index.js` (criar se não existir).

### 3. Spec de exemplo

Crie ou mostre um exemplo de spec em `cypress/e2e/<dominio>/<funcionalidade>.cy.js` demonstrando:

- `require` do Page Object via barrel
- `cy.intercept()` no `beforeEach` (nunca no Page Object)
- Instância da página e encadeamento fluente
- Asserções **apenas** no `it()`, nunca dentro de métodos do Page Object
- IDs de caso de teste no formato `CT-<FUNCIONALIDADE>-<NNN>`
- `cy.clearCookies()` e `cy.clearLocalStorage()` no `beforeEach`
- `cy.takeEvidence('descricao-da-etapa')` em etapas críticas

## Regras invioláveis

```
✅  Seletores como get properties (não métodos com parênteses)
✅  Métodos de ação retornam `this`
✅  Asserções SOMENTE no it() do spec
✅  Credenciais via Cypress.env()
✅  cy.intercept() no beforeEach do spec
✅  module.exports = { NomePage } (CommonJS)
✅  Nomes de métodos em português (domínio do negócio)
❌  .should(), expect() dentro de métodos do Page Object
❌  cy.wait(número) — use aliases
❌  Seletores CSS de classe como único seletor (.btn-primary)
❌  Dados hardcoded na classe
❌  async/await com comandos Cypress
```

## Informações necessárias

Se não fornecidas no argumento, pergunte:

1. **Qual página/funcionalidade** deve ser coberta? (ex: login, catálogo, reserva, cesta, perfil)
2. **Quais elementos de UI** existem na página? (inputs, botões, listas, modais)
3. **Quais fluxos principais** o usuário executa? (preencher e submeter, buscar, adicionar, confirmar)
4. **Qual o path da URL** da página? (ex: `/login.html`, `/catalogo.html`)
5. **Há interceptações de API** relevantes? (ex: POST /api/login, GET /api/livros)
