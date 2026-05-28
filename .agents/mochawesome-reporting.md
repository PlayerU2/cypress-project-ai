---
name: Cypress Mochawesome Reporting
description: Reporting standard for Cypress E2E tests using Mochawesome, evidence attachments, run naming, and CI publication for Hub de Leitura
version: 1.0.0
author: hub-de-leitura-qa
license: MIT
testingTypes: [e2e, api, regression, smoke]
frameworks: [cypress, mochawesome]
languages: [javascript]
domains: [web, education, library]
agents: [github-copilot, cursor, claude-code, codex, windsurf, aider, continue, cline, zed, bolt]
---

# Cypress Mochawesome Reporting Skill

You are an expert QA automation engineer responsible for defining how automated test results must be reported in the **Hub de Leitura** project.

Use this Skill whenever the user asks you to configure, review, improve, or standardize test reports, evidence capture, CI publication, or traceability of Cypress executions.

## Contexto do Projeto

O **Hub de Leitura** é uma aplicação web educacional de biblioteca usada para prática de QA.

Stack relevante para esta Skill:

- Backend: Node.js + Express
- Banco de dados: SQLite
- Autenticação: JWT
- Frontend: HTML5 + Bootstrap 5 + JavaScript ES6+
- Testes E2E: Cypress
- API Docs: Swagger
- Base URL local: configurada via `CYPRESS_BASE_URL`
- API URL: configurada via `CYPRESS_API_URL`

Nunca hardcode URLs, credenciais, tokens ou portas nos testes, scripts ou relatórios. Use sempre variáveis de ambiente.

---

## Objetivo da Skill

Esta Skill define o padrão obrigatório para:

1. Ferramenta de relatório dos testes automatizados.
2. Configuração do **Mochawesome** no Cypress.
3. Geração automática de relatório após cada execução.
4. Estrutura de pastas para relatórios, screenshots, vídeos e evidências.
5. Padrão de nomeação de runs para rastreabilidade.
6. Anexos e evidências em cenários críticos.
7. Integração com pipeline de CI/CD.
8. Publicação automática do relatório como artefato do pipeline.
9. Boas práticas e restrições para evitar relatórios frágeis ou inúteis.

---

## Ferramenta Obrigatória

Use **Mochawesome** como ferramenta padrão de relatório.

Ferramentas permitidas:

```text
✅ mochawesome
✅ mochawesome-merge
✅ mochawesome-report-generator
✅ cypress-mochawesome-reporter
```

Ferramentas não prioritárias neste projeto:

```text
⚠️ Allure Report — usar somente se solicitado explicitamente
⚠️ Cypress Cloud — usar somente se houver chave configurada no CI
```

---

## Dependências Obrigatórias

Instale as dependências como `devDependencies`:

```bash
npm install --save-dev cypress-mochawesome-reporter mochawesome mochawesome-merge mochawesome-report-generator
```

Não instale dependências de relatório como dependência de produção.

---

## Configuração Obrigatória do Cypress

Configure o relatório no `cypress.config.js`.

```javascript
const { defineConfig } = require('cypress')
require('dotenv').config()

module.exports = defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/reports/mochawesome',
    reportFilename: '[datetime]-[name]-report',
    timestamp: 'yyyy-mm-dd_HH-MM-ss',
    charts: true,
    reportPageTitle: 'Hub de Leitura - Relatório de Testes E2E',
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false,
    overwrite: false,
    html: true,
    json: true,
  },
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    screenshotOnRunFailure: true,
    video: true,
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 30000,
    retries: {
      runMode: 2,
      openMode: 0,
    },
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on)
      return config
    },
  },
  env: {
    apiUrl: process.env.CYPRESS_API_URL || 'http://localhost:3000/api',
    adminEmail: process.env.CYPRESS_ADMIN_EMAIL,
    adminPassword: process.env.CYPRESS_ADMIN_PASSWORD,
    userEmail: process.env.CYPRESS_USER_EMAIL,
    userPassword: process.env.CYPRESS_USER_PASSWORD,
    testRunName: process.env.TEST_RUN_NAME,
    testEnvironment: process.env.TEST_ENVIRONMENT || 'local',
    buildId: process.env.BUILD_ID,
    commitSha: process.env.GITHUB_SHA,
  }
})
```

### Import Obrigatório no Support File

No arquivo `cypress/support/e2e.js`, importe o reporter:

```javascript
import './commands'
import 'cypress-mochawesome-reporter/register'
```

---

## Estrutura Obrigatória de Pastas

Use a estrutura abaixo para organizar evidências e relatórios:

```text
cypress/
  e2e/
    auth/
    livros/
    reservas/
    admin/
  fixtures/
  support/
    commands.js
    e2e.js
  screenshots/
  videos/
  reports/
    mochawesome/
      assets/
      *.html
      *.json
    merged/
      mochawesome.json
    html/
      index.html
  evidence/
    manual/
    api/
    critical-flows/
```

Regras:

```text
✅ Relatórios automáticos ficam em cypress/reports/mochawesome
✅ Relatórios consolidados ficam em cypress/reports/merged
✅ Relatório HTML final publicado fica em cypress/reports/html
✅ Screenshots automáticos ficam em cypress/screenshots
✅ Vídeos automáticos ficam em cypress/videos
✅ Evidências manuais nomeadas ficam em cypress/evidence
```

---

## Scripts Obrigatórios no package.json

Adicione os scripts abaixo ao `package.json`:

```json
{
  "scripts": {
    "test:e2e": "cypress run",
    "test:e2e:chrome": "cypress run --browser chrome",
    "test:e2e:smoke": "cypress run --spec 'cypress/e2e/smoke/**/*.cy.js'",
    "report:clean": "rimraf cypress/reports cypress/screenshots cypress/videos",
    "report:merge": "mochawesome-merge cypress/reports/mochawesome/*.json > cypress/reports/merged/mochawesome.json",
    "report:generate": "marge cypress/reports/merged/mochawesome.json --reportDir cypress/reports/html --reportFilename index --inline",
    "test:e2e:report": "npm run report:clean && npm run test:e2e || true && npm run report:merge && npm run report:generate"
  }
}
```

Se o projeto ainda não tiver `rimraf`, instale:

```bash
npm install --save-dev rimraf
```

### Regra Importante Sobre `|| true`

Use `|| true` somente no script responsável por gerar relatório, para garantir que o HTML seja gerado mesmo quando houver falhas.

Nunca use `|| true` em scripts de validação final do CI sem capturar corretamente o status da execução.

---

## Padrão de Nomeação de Runs

Toda execução automatizada deve ter um nome rastreável.

Formato obrigatório:

```text
[projeto]-[tipo]-[ambiente]-[branch]-[build]-[data-hora]
```

Exemplos:

```text
hub-leitura-regression-staging-main-145-2026-05-28_14-30
hub-leitura-smoke-production-release-2.1.0-2026-05-28_18-00
hub-leitura-e2e-local-feature-catalogo-001-2026-05-28_09-15
```

Variável recomendada:

```bash
TEST_RUN_NAME=hub-leitura-regression-staging-main-145-2026-05-28_14-30
```

No CI, monte automaticamente o nome da run com:

```bash
echo "TEST_RUN_NAME=hub-leitura-e2e-${TEST_ENVIRONMENT}-${GITHUB_REF_NAME}-${GITHUB_RUN_NUMBER}-$(date +'%Y-%m-%d_%H-%M')" >> $GITHUB_ENV
```

---

## Metadados Obrigatórios do Relatório

Todo relatório deve permitir identificar:

```text
✅ Nome da run
✅ Ambiente executado
✅ Branch
✅ Commit SHA
✅ Build ID ou número do pipeline
✅ Browser
✅ Data e hora da execução
✅ Quantidade de testes executados
✅ Quantidade de testes aprovados
✅ Quantidade de testes falhados
✅ Quantidade de testes pendentes ou ignorados
✅ Link para screenshots e vídeos quando houver falha
```

Quando o reporter não inserir metadados automaticamente, registre os dados no log do Cypress e no sumário do CI.

Exemplo em `before()`:

```javascript
before(() => {
  cy.log(`Test Run: ${Cypress.env('testRunName')}`)
  cy.log(`Ambiente: ${Cypress.env('testEnvironment')}`)
  cy.log(`Build ID: ${Cypress.env('buildId')}`)
  cy.log(`Commit SHA: ${Cypress.env('commitSha')}`)
})
```

---

## Evidências Obrigatórias

### Evidência Automática

Sempre manter ativo:

```javascript
screenshotOnRunFailure: true
video: true
```

### Evidência Manual Nomeada

Use evidência manual apenas em pontos críticos, como:

```text
✅ Login realizado com sucesso
✅ Reserva criada com sucesso
✅ Livro indisponível bloqueado corretamente
✅ Busca sem resultado exibindo estado vazio
✅ Erro de autenticação ou autorização
✅ Finalização de fluxo E2E crítico
```

Comando obrigatório em `cypress/support/commands.js`:

```javascript
Cypress.Commands.add('takeEvidence', (name) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const runName = Cypress.env('testRunName') || 'local-run'
  cy.screenshot(`${runName}/${name}-${timestamp}`)
})
```

Uso recomendado:

```javascript
cy.takeEvidence('catalogo-busca-sem-resultado')
cy.takeEvidence('reserva-livro-confirmada')
cy.takeEvidence('auth-token-expirado-redirecionamento-login')
```

---

## Convenção de Nomeação de Evidências

Formato obrigatório:

```text
[funcionalidade]-[cenario]-[resultado]
```

Exemplos:

```text
catalogo-busca-titulo-resultados-exibidos
catalogo-filtro-editora-lista-filtrada
catalogo-status-indisponivel-botao-bloqueado
reserva-livro-disponivel-confirmacao-exibida
auth-token-expirado-redirecionamento-login
admin-livro-criado-sucesso
```

Regras:

```text
✅ Use kebab-case
✅ Não use acentos
✅ Não use espaços
✅ Não use nomes genéricos como screenshot1 ou erro
✅ Inclua funcionalidade, cenário e resultado
```

---

## Evidências em Falhas

Quando um teste falhar, o relatório deve conter ou apontar para:

```text
✅ Nome do teste
✅ Spec executada
✅ Mensagem de erro
✅ Stack trace
✅ Screenshot automático
✅ Vídeo da execução
✅ Tentativas de retry, quando houver
✅ Ambiente e browser
```

Nunca considere uma falha analisável sem screenshot ou vídeo em CI.

---

## Evidências de API

Para testes que validam chamadas de API, sempre use `cy.intercept()` e registre alias significativo.

```javascript
cy.intercept('GET', `${Cypress.env('apiUrl')}/livros*`).as('listarLivros')

cy.visit('/catalogo.html')

cy.wait('@listarLivros').then(({ response }) => {
  expect(response.statusCode).to.eq(200)
})
```

Para cenários de erro:

```javascript
cy.intercept('POST', `${Cypress.env('apiUrl')}/reservas`, {
  statusCode: 401,
  body: { message: 'Token inválido ou expirado' }
}).as('criarReservaSemAuth')

cy.wait('@criarReservaSemAuth')
  .its('response.statusCode')
  .should('eq', 401)

cy.takeEvidence('reserva-token-expirado-erro-401')
```

---

## Integração com GitHub Actions

Use o workflow abaixo para executar testes, gerar relatório e publicar artefatos.

```yaml
name: Cypress E2E Report

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  workflow_dispatch:

jobs:
  cypress-e2e:
    runs-on: ubuntu-latest

    env:
      TEST_ENVIRONMENT: staging
      CYPRESS_BASE_URL: ${{ secrets.CYPRESS_BASE_URL }}
      CYPRESS_API_URL: ${{ secrets.CYPRESS_API_URL }}
      CYPRESS_ADMIN_EMAIL: ${{ secrets.CYPRESS_ADMIN_EMAIL }}
      CYPRESS_ADMIN_PASSWORD: ${{ secrets.CYPRESS_ADMIN_PASSWORD }}
      CYPRESS_USER_EMAIL: ${{ secrets.CYPRESS_USER_EMAIL }}
      CYPRESS_USER_PASSWORD: ${{ secrets.CYPRESS_USER_PASSWORD }}
      BUILD_ID: ${{ github.run_number }}
      GITHUB_SHA: ${{ github.sha }}

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Define test run name
        run: |
          echo "TEST_RUN_NAME=hub-leitura-e2e-${TEST_ENVIRONMENT}-${GITHUB_REF_NAME}-${GITHUB_RUN_NUMBER}-$(date +'%Y-%m-%d_%H-%M')" >> $GITHUB_ENV

      - name: Run Cypress tests and generate report
        id: cypress
        run: |
          set +e
          npm run report:clean
          npm run test:e2e:chrome
          TEST_EXIT_CODE=$?
          npm run report:merge || true
          npm run report:generate || true
          echo "test_exit_code=$TEST_EXIT_CODE" >> $GITHUB_OUTPUT
          exit 0

      - name: Upload Mochawesome HTML report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: mochawesome-report-${{ env.TEST_RUN_NAME }}
          path: cypress/reports/html
          retention-days: 14

      - name: Upload Cypress screenshots
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: cypress-screenshots-${{ env.TEST_RUN_NAME }}
          path: cypress/screenshots
          if-no-files-found: ignore
          retention-days: 14

      - name: Upload Cypress videos
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: cypress-videos-${{ env.TEST_RUN_NAME }}
          path: cypress/videos
          if-no-files-found: ignore
          retention-days: 14

      - name: Fail job if tests failed
        if: steps.cypress.outputs.test_exit_code != '0'
        run: exit 1
```

---

## Publicação Automática em GitHub Pages

Quando solicitado, publique o relatório em GitHub Pages.

Exemplo:

```yaml
name: Publish Mochawesome Report

on:
  workflow_run:
    workflows: ['Cypress E2E Report']
    types:
      - completed

jobs:
  publish-report:
    runs-on: ubuntu-latest
    if: github.event.workflow_run.conclusion != 'cancelled'

    steps:
      - name: Download report artifact
        uses: actions/download-artifact@v4
        with:
          name: mochawesome-report
          path: public

      - name: Deploy to GitHub Pages
        uses: actions/upload-pages-artifact@v3
        with:
          path: public

      - name: Deploy
        uses: actions/deploy-pages@v4
```

A publicação em GitHub Pages deve ser usada apenas quando o repositório estiver configurado com Pages habilitado e permissões corretas.

---

## Comentário Automático no Pull Request

Quando a execução ocorrer em `pull_request`, adicione um comentário com resumo.

Modelo de comentário:

```markdown
## Relatório de Testes E2E — Hub de Leitura

**Run:** `${TEST_RUN_NAME}`  
**Ambiente:** `${TEST_ENVIRONMENT}`  
**Branch:** `${GITHUB_REF_NAME}`  
**Build:** `${GITHUB_RUN_NUMBER}`  
**Commit:** `${GITHUB_SHA}`  

Artefatos publicados:
- Mochawesome HTML Report
- Cypress Screenshots
- Cypress Videos

Verifique os artefatos anexados à execução do pipeline.
```

Nunca exponha credenciais, tokens JWT ou secrets no comentário do PR.

---

## Padrão de Retenção de Artefatos

Use retenção curta para reduzir custo e ruído:

```text
Pull Request: 7 dias
Develop/Staging: 14 dias
Main/Produção: 30 dias
Execução manual investigativa: 7 dias
```

Configuração recomendada:

```yaml
retention-days: 14
```

---

## Regras para Smoke, Regression e Debug

### Smoke

```text
Objetivo: validar fluxo mínimo crítico
Quando executar: pull request, pós-deploy
Relatório: obrigatório
Vídeo: obrigatório em CI
Retenção: 7 a 14 dias
```

### Regression

```text
Objetivo: validar funcionalidades principais
Quando executar: merge em develop/main ou execução agendada
Relatório: obrigatório
Vídeo: obrigatório
Retenção: 14 a 30 dias
```

### Debug Local

```text
Objetivo: investigação local
Quando executar: desenvolvimento
Relatório: opcional
Vídeo: opcional
Retenção: não aplicável
```

---

## Boas Práticas para Relatórios Úteis

```text
✅ Nomeie specs por domínio funcional
✅ Nomeie testes com linguagem de negócio
✅ Use um comportamento por it()
✅ Use cy.intercept() para evidenciar chamadas críticas
✅ Tire screenshot manual apenas em pontos de valor
✅ Gere relatório mesmo quando houver falha
✅ Publique HTML, screenshots e vídeos como artefatos
✅ Mantenha run name único e rastreável
✅ Relacione falhas com ambiente, branch e commit
✅ Separe smoke de regression
```

Exemplo de teste com evidência:

```javascript
describe('Catálogo — Busca de Livros', () => {
  beforeEach(() => {
    cy.login(Cypress.env('userEmail'), Cypress.env('userPassword'))
    cy.intercept('GET', `${Cypress.env('apiUrl')}/livros*`).as('listarLivros')
    cy.visit('/catalogo.html')
    cy.wait('@listarLivros').its('response.statusCode').should('eq', 200)
  })

  it('deve exibir estado vazio ao buscar por livro inexistente', () => {
    cy.intercept('GET', `${Cypress.env('apiUrl')}/livros/busca*`).as('buscarLivros')

    cy.get('[data-testid="catalogo-search-input"]')
      .clear()
      .type('Livro Inexistente 999')

    cy.wait('@buscarLivros').its('response.statusCode').should('eq', 200)

    cy.get('[data-testid="catalogo-empty-state"]')
      .should('be.visible')
      .and('contain.text', 'Nenhum livro encontrado')

    cy.takeEvidence('catalogo-busca-inexistente-estado-vazio')
  })
})
```

---

## Anti-Patterns Proibidos

Nunca faça:

```text
❌ Gerar relatório somente quando todos os testes passam
❌ Desabilitar screenshots em CI
❌ Desabilitar vídeos em CI sem justificativa
❌ Usar nomes genéricos como report.html, teste1 ou screenshot-final
❌ Sobrescrever relatórios sem timestamp
❌ Publicar .env, tokens JWT ou secrets nos artefatos
❌ Hardcode de URL base, API URL, email ou senha
❌ Ignorar status real dos testes usando || true no job final
❌ Salvar relatório fora da estrutura cypress/reports
❌ Depender apenas do log textual sem screenshot ou vídeo
❌ Misturar relatórios de ambientes diferentes na mesma pasta
```

---

## Checklist de Revisão

Antes de considerar o relatório pronto, valide:

```text
✅ cypress-mochawesome-reporter instalado
✅ Reporter configurado no cypress.config.js
✅ Import do reporter registrado em cypress/support/e2e.js
✅ screenshotOnRunFailure habilitado
✅ video habilitado para CI
✅ Scripts de limpeza, execução, merge e geração configurados
✅ Relatório HTML gerado em cypress/reports/html
✅ JSON gerado para merge em cypress/reports/mochawesome
✅ Run name único configurado via TEST_RUN_NAME
✅ Artifacts publicados no CI
✅ Screenshots publicados no CI
✅ Vídeos publicados no CI
✅ Job falha quando testes falham
✅ Secrets usados para credenciais e URLs sensíveis
✅ Nenhum .env ou token publicado como artefato
```

---

## Critérios de Aceite

A configuração de relatório será aceita quando:

```text
✅ Ao executar npm run test:e2e:report, o relatório HTML é gerado
✅ Falhas aparecem no Mochawesome com stack trace
✅ Screenshots de falha são anexados ou referenciados
✅ Vídeos são armazenados como artefato no CI
✅ O nome da run permite rastrear ambiente, branch, build e data
✅ O pipeline publica relatório, screenshots e vídeos mesmo em falha
✅ O pipeline retorna falha quando há teste quebrado
✅ Nenhum dado sensível aparece no relatório publicado
```

---

## Escopo Fora desta Skill

Esta Skill não define:

```text
❌ Estratégia de criação de cenários manuais
❌ Seletores de interface
❌ Page Objects
❌ Dados de seed do banco
❌ Testes unitários com Jest
❌ Testes de performance
❌ Configuração de infraestrutura de produção
```

Para seletores, autenticação, estrutura de specs e comandos customizados, use a Skill de Cypress E2E e os padrões de automação do projeto.
