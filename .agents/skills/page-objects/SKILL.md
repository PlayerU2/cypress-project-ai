---
name: page-objects
description: "Skill de Page Object Model para Cypress. Use quando o usuário pedir para criar Page Object, criar página de testes, separar seletores de ações, refatorar spec para usar POM, criar estrutura cypress/pages/, organizar seletores, criar classe de página, aplicar Page Object Pattern, POM, page class."
argument-hint: "Nome da página ou funcionalidade (ex: login, catalogo, reserva)"
---

# Page Object Model — Cypress Hub de Leitura

Você é um engenheiro de QA especializado em Cypress. Ao criar ou refatorar Page Objects neste projeto, siga este guia à risca. Consulte os [padrões de seletores](./references/selectors.md), o [template de Page Class](./references/page-class-template.md) e os [padrões de ação](./references/actions.md).

---

## Quando criar um Page Object

Crie um Page Object quando **3 ou mais testes** interagirem com a mesma página ou quando os seletores e ações se repetirem em múltiplos specs. Consulte [quando criar](./references/page-class-template.md#quando-criar).

---

## Estrutura de arquivos obrigatória

```
cypress/
  pages/
    LoginPage.js
    CatalogoPage.js
    CestaPage.js
    index.js          ← barrel file (re-exports todas as páginas)
  e2e/
    auth/
      login.cy.js     ← importa LoginPage, nunca define seletores inline
```

---

## Procedimento para criar um Page Object

### 1. Identificar responsabilidades

Separe sempre em três camadas:

| Camada | O que contém | Onde fica |
|--------|-------------|-----------|
| **Seletores** | Getters que retornam `cy.get()` | Propriedades `get` na classe |
| **Ações** | Métodos que combinam seletores em fluxos | Métodos da classe, retornam `this` |
| **Asserções** | Verificações de estado e comportamento | **Nunca no Page Object** — somente no `it()` |

### 2. Criar o arquivo da página

Local: `cypress/pages/<NomePagina>Page.js`

Consulte o [template completo](./references/page-class-template.md) e os [padrões de seletores](./references/selectors.md).

### 3. Exportar no barrel file

Adicione a exportação em `cypress/pages/index.js`:

```javascript
// cypress/pages/index.js
const { LoginPage } = require('./LoginPage')
const { CatalogoPage } = require('./CatalogoPage')

module.exports = { LoginPage, CatalogoPage }
```

### 4. Importar no spec

```javascript
// cypress/e2e/auth/login.cy.js
const { LoginPage } = require('../../pages')

const loginPage = new LoginPage()

describe('Login - Hub de Leitura', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    loginPage.visit()
  })

  it('CT-LOGIN-001 - deve autenticar administrador com credenciais válidas', () => {
    loginPage
      .preencherEmail(Cypress.env('adminEmail'))
      .preencherSenha(Cypress.env('adminPassword'))
      .submeter()

    cy.wait('@loginRequest').its('response.statusCode').should('eq', 200)
    cy.location('pathname').should('include', 'admin')
  })
})
```

---

## Regras invioláveis

```
✅  Seletores como getters (get emailInput() { return cy.get(...) })
✅  Métodos de ação retornam this para encadeamento
✅  Asserções SOMENTE no it() do spec
✅  Nomes de métodos em português (domínio do negócio)
✅  cy.intercept() configurado no beforeEach do spec, nunca na Page
✅  Credenciais sempre via Cypress.env(), nunca hardcoded
✅  Hierarquia de seletores: data-testid → aria-label → id → name
❌  Asserções dentro de métodos do Page Object
❌  cy.wait(número) — use aliases
❌  Seletores CSS de classe como único seletor
❌  Dados de teste hardcoded no Page Object
❌  login pela UI no beforeEach — use cy.session() ou cy.request()
```

---

## Referências

- [Padrões de seletores](./references/selectors.md)
- [Template de Page Class](./references/page-class-template.md)
- [Padrões de ação e encadeamento](./references/actions.md)
- [Padrão de autenticação](./references/actions.md#autenticação)
