# cypress-project-ai

Projeto de automacao de testes E2E com Cypress para o sistema **Hub de Leitura**, uma biblioteca digital educacional usada para pratica de QA.

Os testes cobrem fluxos criticos da aplicacao:

- Login
- Cadastro de usuario
- Adicao de livros a cesta
- Validacoes negativas de formulario, autenticacao e duplicidade

---

## Aplicacao sob teste

**Hub de Leitura** e um sistema ficticio de biblioteca para treinamento em QA.

- Repositorio da aplicacao: https://github.com/fabioaraujoqa/hub-de-leitura
- URL local: `http://localhost:3000`
- API Docs: `http://localhost:3000/api-docs`
- Painel admin: `http://localhost:3000/admin-dashboard.html`

> A aplicacao Hub de Leitura precisa estar rodando localmente antes de executar os testes.

---

## Pre-requisitos

- Node.js 18 ou superior
- npm 9 ou superior
- Cypress instalado via dependencias do projeto
- Hub de Leitura em execucao em `http://localhost:3000`

---

## Instalacao

```bash
git clone https://github.com/PlayerU2/cypress-project-ai.git
cd cypress-project-ai
npm install
```

Copie o modelo de variaveis de ambiente se quiser customizar a URL ou credenciais:

```bash
cp .env.example .env
```

---

## Como executar

Abrir o Cypress em modo interativo:

```bash
npm run test:e2e:open
```

Executar todos os testes em modo headless:

```bash
npm run test:e2e
```

Executar specs especificos:

```bash
npm run test:login
npm run test:cadastro
npm run test:cesta
```

Executar com relatorio Mochawesome:

```bash
npm run test:e2e:report
```

---

## Estrutura principal

```text
cypress-project-ai/
  cypress/
    e2e/
      auth/
        login.cy.js
        cadastro.cy.js
      cesta/
        adicionar-livro-cesta.cy.js
    support/
      commands.js
      e2e.js
  docs/
    rag-hub-de-leitura.md
  .agents/
    qa-automation-standards.md
    test-strategy.md
    environments.md
    mochawesome-reporting.md
  cypress.config.js
  .env.example
  package.json
  README.md
```

---

## Padroes adotados nos testes

- Uso de `cy.env()` em vez de `Cypress.env()`, pois o projeto esta com `allowCypressEnv: false`.
- Fallback local para `baseUrl` e credenciais de teste documentadas.
- Uso de seletores estaveis como `id` quando nao ha `data-testid`.
- Uso de `cy.intercept()` para observar chamadas relevantes da API.
- Validacao de estado real da aplicacao, como URL, mensagens, `localStorage` e resposta da API.
- Sem `cy.wait()` com tempo fixo.
- Testes independentes, limpando cookies e `localStorage` antes de cada cenario.
- Relatorios, screenshots e videos de execucao sao ignorados pelo Git.

---

## Casos de teste

### Login - `cypress/e2e/auth/login.cy.js`

| ID | Tipo | Descricao |
|---|---|---|
| CT-LOGIN-001 | Positivo | Deve autenticar administrador com credenciais validas |
| CT-LOGIN-002 | Positivo | Deve autenticar usuario comum com credenciais validas |
| CT-LOGIN-003 | Negativo | Deve exibir erro ao informar senha invalida |

Principais validacoes:

- Chamada `POST /api/login`
- Redirecionamento conforme perfil
- Token salvo em `localStorage.authToken`
- Ausencia de token em login invalido

### Cadastro - `cypress/e2e/auth/cadastro.cy.js`

| ID | Tipo | Descricao |
|---|---|---|
| CT-CAD-001 | Positivo | Deve criar conta com dados validos e autenticar automaticamente |
| CT-CAD-002 | Negativo | Deve exibir erro ao tentar cadastrar email ja existente |
| CT-CAD-003 | Negativo | Deve impedir envio com campos obrigatorios vazios |
| CT-CAD-004 | Negativo | Deve impedir envio quando confirmacao de senha diverge |

Principais validacoes:

- Chamada `POST /api/register`
- Login automatico via `POST /api/login`
- Campos invalidos no formulario
- Bloqueio de envio para API quando o formulario esta invalido
- Token salvo apenas em cadastro valido

### Cesta de livros - `cypress/e2e/cesta/adicionar-livro-cesta.cy.js`

| ID | Tipo | Descricao |
|---|---|---|
| CT-CART-001 | Positivo | Deve adicionar um livro disponivel a cesta com sucesso |
| CT-CART-002 | Positivo | Deve permitir adicionar dois livros diferentes a cesta |
| CT-CART-003 | Negativo | Deve exigir autenticacao para finalizar reserva |
| CT-CART-004 | Negativo | Deve impedir adicionar o mesmo livro duas vezes |

Principais validacoes:

- Busca de livros disponiveis via API
- Clique no livro pelo titulo real retornado pela API
- Persistencia da cesta em `localStorage.bookCart`
- Conteudo exibido na pagina da cesta
- Prompt de autenticacao no checkout
- Bloqueio de duplicidade na cesta

---

## Credenciais de teste

| Perfil | Email | Senha |
|---|---|---|
| Administrador | `admin@biblioteca.com` | `admin123` |
| Usuario comum | `usuario@teste.com` | `user123` |

---

## Observacoes tecnicas

- Algumas requisicoes `GET` podem retornar `304 Not Modified`, que e aceito nos testes por ser comportamento valido de cache do navegador.
- O spec de cesta trata uma excecao conhecida da aplicacao relacionada a `Cannot read properties of null (reading 'document')`, sem mascarar outros erros.
- Os specs usam valores locais documentados como fallback para facilitar execucao em ambiente de estudo.
- `cypress.config.js` ja configura `baseUrl`, timeouts, retries e reporter Mochawesome.
- A pasta `.playwright-mcp/` foi removida por ser artefato local fora do escopo Cypress.

---

## Licenca

Uso educacional e academico. Desenvolvido para pratica de automacao de testes E2E com Cypress.
