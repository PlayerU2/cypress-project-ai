# environments.md
# Ambientes e Variáveis — Hub de Leitura

> Documento de referência para o QA Agent e para o GitHub Copilot.
> Nunca hardcode URLs, credenciais ou portas nos testes.
> Sempre use Cypress.env() ou process.env conforme o framework.

---

## Ambientes disponíveis

| Ambiente | URL base | Quando usar |
|----------|----------|-------------|
| Local (dev) | http://localhost:3000 | Desenvolvimento e testes unitários |
| Staging | https://hub-de-leitura-staging.vercel.app | Testes E2E antes do merge |
| Produção | https://hub-de-leitura.vercel.app | Smoke tests pós-deploy |

---

## Variáveis de ambiente — estrutura obrigatória

### Arquivo `.env` (nunca commitar)
```
CYPRESS_BASE_URL=http://localhost:3000
CYPRESS_API_URL=http://localhost:3000/api
CYPRESS_ADMIN_EMAIL=admin@biblioteca.com
CYPRESS_ADMIN_PASSWORD=admin123
CYPRESS_USER_EMAIL=usuario@teste.com
CYPRESS_USER_PASSWORD=user123
```

### Arquivo `.env.example` (sempre commitar)
```
CYPRESS_BASE_URL=
CYPRESS_API_URL=
CYPRESS_ADMIN_EMAIL=
CYPRESS_ADMIN_PASSWORD=
CYPRESS_USER_EMAIL=
CYPRESS_USER_PASSWORD=
```

---

## Credenciais de teste por perfil

| Perfil | Email | Senha | Onde usar |
|--------|-------|-------|-----------|
| Admin | admin@biblioteca.com | admin123 | Testes de gestão de acervo e usuários |
| Usuário comum | usuario@teste.com | user123 | Testes de reserva, catálogo e perfil |

> ⚠️ Nunca escreva essas credenciais diretamente nos testes.
> Use sempre `Cypress.env('adminEmail')` ou `process.env.CYPRESS_ADMIN_EMAIL`.

---

## Como usar no Cypress

```javascript
// cypress.config.js
const { defineConfig } = require('cypress')
require('dotenv').config()

module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
  },
  env: {
    apiUrl:        process.env.CYPRESS_API_URL,
    adminEmail:    process.env.CYPRESS_ADMIN_EMAIL,
    adminPassword: process.env.CYPRESS_ADMIN_PASSWORD,
    userEmail:     process.env.CYPRESS_USER_EMAIL,
    userPassword:  process.env.CYPRESS_USER_PASSWORD,
  }
})

// No teste — uso correto
cy.login(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
cy.request('POST', `${Cypress.env('apiUrl')}/auth/login`, { ... })
```

## Como usar no Playwright

```javascript
// playwright.config.js
import { defineConfig } from '@playwright/test'
import dotenv from 'dotenv'
dotenv.config()

export default defineConfig({
  use: {
    baseURL: process.env.CYPRESS_BASE_URL || 'http://localhost:3000',
  },
})

// No teste — uso correto
const email    = process.env.CYPRESS_ADMIN_EMAIL
const password = process.env.CYPRESS_ADMIN_PASSWORD
await page.goto(process.env.CYPRESS_BASE_URL + '/login')
```

---

## Regras obrigatórias

```
✅  Sempre usar variáveis de ambiente para URLs, emails e senhas
✅  .env no .gitignore — nunca sobe para o repositório
✅  .env.example sempre atualizado quando adicionar nova variável
✅  Checar no CI/CD se as variáveis estão configuradas antes de rodar

❌  Nunca escrever http://localhost:3000 diretamente no teste
❌  Nunca escrever admin@biblioteca.com diretamente no teste
❌  Nunca commitar o arquivo .env com valores reais
❌  Nunca compartilhar credenciais de produção em arquivos de teste
```

---

## Configuração do .gitignore

```
# Variáveis de ambiente
.env
.env.local
.env.production

# Saídas de teste
cypress/videos/
cypress/screenshots/
cypress/downloads/
playwright-report/
test-results/
node_modules/
```