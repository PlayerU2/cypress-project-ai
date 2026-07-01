# cypress-project-ai

![Cypress](https://img.shields.io/badge/Cypress-15.x-brightgreen?logo=cypress)
![Node](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js)
![CI](https://github.com/PlayerU2/cypress-project-ai/actions/workflows/cypress.yml/badge.svg)
![License](https://img.shields.io/badge/license-ISC-blue)

Projeto de automação de testes E2E com Cypress para o sistema **Hub de Leitura**, uma biblioteca digital educacional usada para prática de QA.

Os testes cobrem fluxos críticos da aplicação:

- Login de administrador e usuário comum
- Cadastro de usuário com validações de formulário
- Adição de livros à cesta e fluxo de checkout
- Validações negativas: credenciais inválidas, email duplicado, campos obrigatórios, duplicidade na cesta

---

## Aplicação sob teste

**Hub de Leitura** é um sistema fictício de biblioteca para treinamento em QA.

- Repositório da aplicação: https://github.com/fabioaraujoqa/hub-de-leitura
- URL local: `http://localhost:3000`
- API Docs: `http://localhost:3000/api-docs`
- Painel admin: `http://localhost:3000/admin-dashboard.html`

> A aplicação Hub de Leitura precisa estar rodando localmente antes de executar os testes.

---

## Pré-requisitos

- Node.js 20 ou superior
- npm 9 ou superior
- Hub de Leitura em execução em `http://localhost:3000`

---

## Instalação

```bash
git clone https://github.com/PlayerU2/cypress-project-ai.git
cd cypress-project-ai
npm install
```

Copie o modelo de variáveis de ambiente:

```bash
cp .env.example .env
```

> Se o `.env` não for criado, os testes usam os valores padrão do `.env.example` automaticamente.

---

## Como executar

```bash
# Modo interativo (Cypress UI)
npm run test:e2e:open

# Modo headless (todos os testes)
npm run test:e2e

# Specs individuais
npm run test:login
npm run test:cadastro
npm run test:cesta

# Com relatório Mochawesome (limpa artefatos anteriores)
npm run test:e2e:report
```

---

## Estrutura do projeto

```
cypress-project-ai/
├── .github/
│   ├── prompts/
│   │   └── criar-page-object.prompt.md   ← prompt Copilot para gerar Page Objects
│   └── workflows/
│       └── cypress.yml                   ← pipeline CI GitHub Actions
├── .agents/
│   ├── SKILL.md                          ← skill Cypress E2E para o Copilot
│   ├── qa-automation-standards.md        ← padrões obrigatórios de seletores e estrutura
│   ├── test-strategy.md                  ← estratégia de testes do projeto
│   ├── environments.md                   ← configuração de ambientes
│   ├── mochawesome-reporting.md          ← padrões de relatório
│   └── skills/
│       └── page-objects/                 ← skill POM com templates e referências
├── cypress/
│   ├── e2e/
│   │   ├── auth/
│   │   │   ├── login.cy.js               ← CT-LOGIN-001 a 003
│   │   │   └── cadastro.cy.js            ← CT-CAD-001 a 004
│   │   └── cesta/
│   │       └── adicionar-livro-cesta.cy.js ← CT-CART-001 a 004
│   ├── fixtures/
│   │   ├── usuarios.json                 ← dados de usuários para referência e mocks
│   │   └── livros.json                   ← dados de livros para mocks de API
│   ├── pages/
│   │   ├── index.js                      ← barrel file (re-exporta todas as páginas)
│   │   ├── LoginPage.js
│   │   ├── CadastroPage.js
│   │   ├── CatalogoPage.js
│   │   ├── CestaPage.js
│   │   └── CheckoutPage.js
│   └── support/
│       ├── commands.js                   ← comandos customizados globais
│       └── e2e.js                        ← setup global e imports
├── docs/
│   └── rag-hub-de-leitura.md             ← documentação da aplicação sob teste
├── cypress.config.js
├── .env.example                          ← modelo de variáveis (commitar sempre)
├── package.json
└── README.md
```

---

## Padrões adotados

### Page Object Model (POM)

Cada página da aplicação tem uma classe dedicada em `cypress/pages/`, com responsabilidades separadas:

| Camada | O que contém | Onde fica |
|---|---|---|
| **Seletores** | `get` properties que retornam `cy.get()` | Classe da página |
| **Ações** | Métodos que combinam seletores em fluxos, retornam `this` | Classe da página |
| **Asserções** | `.should()`, `expect()` | Somente no `it()` do spec |

```javascript
// Exemplo — encadeamento fluente com POM
const { LoginPage } = require('../../pages')
const loginPage = new LoginPage()

loginPage.visit().entrar(email, senha)
cy.wait('@loginRequest').its('response.statusCode').should('eq', 200)
```

### Hierarquia de seletores

```
1º  data-testid    → preferência absoluta
2º  aria-label     → acessibilidade
3º  id             → aceitável se não for gerado dinamicamente
4º  name           → bom para inputs de formulário
5º  cy.contains()  → texto visível, com cautela
❌  classe CSS      → evitar
❌  xpath           → nunca
```

### Outros padrões

- `cy.env([...])` em vez de `Cypress.env()` — projeto usa `allowCypressEnv: false`
- Fallback local para execução sem `.env` configurado
- `cy.intercept()` sempre no `beforeEach`, nunca no Page Object
- Sem `cy.wait(número)` — aliases e interceptações para sincronização
- Testes independentes com `cy.clearCookies()` e `cy.clearLocalStorage()` por cenário
- `cy.takeEvidence()` para screenshots nomeados em etapas críticas

---

## Casos de teste

### Login — `cypress/e2e/auth/login.cy.js`

| ID | Tipo | Descrição |
|---|---|---|
| CT-LOGIN-001 | Positivo | Deve autenticar administrador com credenciais válidas |
| CT-LOGIN-002 | Positivo | Deve autenticar usuário comum com credenciais válidas |
| CT-LOGIN-003 | Negativo | Deve exibir erro ao informar senha inválida |

### Cadastro — `cypress/e2e/auth/cadastro.cy.js`

| ID | Tipo | Descrição |
|---|---|---|
| CT-CAD-001 | Positivo | Deve criar conta com dados válidos e autenticar automaticamente |
| CT-CAD-002 | Negativo | Deve exibir erro ao tentar cadastrar email já existente |
| CT-CAD-003 | Negativo | Deve impedir envio com campos obrigatórios vazios |
| CT-CAD-004 | Negativo | Deve impedir envio quando confirmação de senha diverge |

### Cesta de livros — `cypress/e2e/cesta/adicionar-livro-cesta.cy.js`

| ID | Tipo | Descrição |
|---|---|---|
| CT-CART-001 | Positivo | Deve adicionar um livro disponível à cesta com sucesso |
| CT-CART-002 | Positivo | Deve permitir adicionar dois livros diferentes à cesta |
| CT-CART-003 | Negativo | Deve exigir autenticação para finalizar reserva |
| CT-CART-004 | Negativo | Deve impedir adicionar o mesmo livro duas vezes |

---

## CI/CD

O projeto possui pipeline no GitHub Actions (`.github/workflows/cypress.yml`) que executa os testes em **Chrome** e **Firefox** a cada push em `main` e `develop`, e em pull requests para `main`.

Artefatos gerados por execução:
- Screenshots de falhas (retidos por 7 dias)
- Vídeos de todas as execuções (retidos por 7 dias)
- Relatório Mochawesome em HTML

Para usar o pipeline com credenciais reais, configure os seguintes **GitHub Secrets** no repositório:

| Secret | Descrição |
|---|---|
| `CYPRESS_ADMIN_EMAIL` | Email do administrador |
| `CYPRESS_ADMIN_PASSWORD` | Senha do administrador |
| `CYPRESS_USER_EMAIL` | Email do usuário comum |
| `CYPRESS_USER_PASSWORD` | Senha do usuário comum |

---

## Credenciais de teste (ambiente local)

| Perfil | Email | Senha |
|---|---|---|
| Administrador | `admin@biblioteca.com` | `admin123` |
| Usuário comum | `usuario@teste.com` | `user123` |

---

## Observações técnicas

- Requisições `GET` podem retornar `304 Not Modified` — aceito nos testes por ser comportamento válido de cache.
- O spec de cesta trata uma exceção conhecida da aplicação relacionada a `Cannot read properties of null (reading 'document')`, sem mascarar outros erros.
- `cypress.config.js` configura `baseUrl`, timeouts, retries e reporter Mochawesome de forma centralizada.

---

## Histórico de versões

### v5.0 — Page Objects e otimização do projeto

**Page Object Model implementado**

- Criada camada `cypress/pages/` com cinco classes dedicadas por página:
  - `LoginPage.js` — login com `entrar()`, `preencherEmail()`, `preencherSenha()`, `submeter()`
  - `CadastroPage.js` — cadastro com `preencherFormulario()` e ações atômicas por campo
  - `CatalogoPage.js` — catálogo com `adicionarLivroNaCesta()`, `tentarAdicionarLivroNovamente()` e seletor parametrizado `getCardLivro(titulo)`
  - `CestaPage.js` — cesta com `confirmarCheckout()`
  - `CheckoutPage.js` — checkout com seletor `avisoLogin`
- Criado `cypress/pages/index.js` como barrel file centralizando todos os imports
- Separação estrita de responsabilidades: seletores como `get` properties, ações retornam `this`, asserções exclusivamente nos specs

**Specs refatorados**

- Removidos objetos literais (`loginPage = { ... }`) substituídos por classes POM
- Eliminados helpers locais redundantes: `localDefaults`, `getRequiredValue`, `getBaseUrl`, `loadXxxEnv`
- `seedCart` inline substituído por `cy.setBookCart()` (command existente em `commands.js`)
- Adicionado `cy.takeEvidence()` em etapas críticas de todos os testes
- Corrigido uso indevido de `Cypress.env()` — substituído por `cy.env([...]).then()` com fallback para execução local sem `.env`

**Skill e prompt Copilot**

- Criada skill `.agents/skills/page-objects/` com SKILL.md e referências separadas:
  - `references/selectors.md` — hierarquia e padrões de getters
  - `references/page-class-template.md` — templates para login, formulários, listagens e barrel file
  - `references/actions.md` — ações atômicas, fluxos compostos, autenticação e interceptação
- Criado prompt `.github/prompts/criar-page-object.prompt.md` para geração guiada de Page Objects

**CI/CD e estrutura**

- Criado pipeline `.github/workflows/cypress.yml` com execução em Chrome e Firefox em paralelo, upload de screenshots/vídeos/relatórios como artifacts e suporte a GitHub Secrets
- Criadas fixtures `cypress/fixtures/usuarios.json` e `cypress/fixtures/livros.json`
- Removidos artefatos locais: `debug.log` e pasta `.github/skills/` vazia
- README atualizado com badges, árvore de estrutura completa, seção POM, hierarquia de seletores e instruções de CI/CD

---

## Licença

Uso educacional e acadêmico. Desenvolvido para prática de automação de testes E2E com Cypress.
