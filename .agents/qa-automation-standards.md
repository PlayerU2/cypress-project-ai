# qa-automation-standards.md
# Padrões e Boas Práticas de Automação com Cypress

> Este documento define os padrões obrigatórios para geração e revisão de testes automatizados.
> Ao receber este arquivo como contexto, siga estas regras à risca.
> Não invente padrões. Não use criatividade para seletores ou estrutura.
> Se houver dúvida entre duas abordagens, pergunte antes de decidir.

---

## 1. Seletores — hierarquia obrigatória

Sempre use o seletor mais alto disponível na hierarquia abaixo.
Nunca pule níveis sem justificativa explícita.

```
1º  data-testid          → preferência absoluta. Imutável, feito para teste.
2º  aria-label / role    → acessibilidade. Estável e semântico.
3º  id                   → aceitável se não for gerado dinamicamente.
4º  name                 → bom para inputs e formulários.
5º  cy.contains()        → texto visível. Use com cautela — texto muda com i18n.
6º  class CSS            → evitar. Muda com refactor de estilo.
7º  xpath / nth-child    → nunca, exceto último recurso documentado.
```

**Exemplos:**
```javascript
// ✅ Correto
cy.get('[data-testid="login-button"]').click()
cy.get('[aria-label="Fechar modal"]').click()
cy.get('#email-input').type(Cypress.env('userEmail'))

// ❌ Evitar
cy.get('.btn-primary').click()
cy.get('button:nth-child(2)').click()
cy.get('div > form > button').click()
```

---

## 2. Seletores posicionais — .first(), .last(), .eq()

Use seletores posicionais apenas quando a **posição for irrelevante para o teste**.
Nunca use para identificar um elemento específico quando a ordem pode variar.

```javascript
// ✅ Correto — validando estrutura, não identidade
cy.get('[data-testid="produto-card"]').first().within(() => {
  cy.get('[data-testid="produto-nome"]').should('be.visible')
  cy.get('[data-testid="produto-preco"]').should('be.visible')
  cy.get('[data-testid="produto-imagem"]').should('exist')
})

// ✅ Correto — posição é parte da regra de negócio
cy.get('[data-testid="resultado-busca"]').first()
  .should('contain.text', 'mais relevante')

// ✅ Correto — validar quantidade
cy.get('[data-testid="livro-card"]').should('have.length.greaterThan', 0)

// ❌ Frágil — qual produto é esse? E se a ordem mudar?
cy.get('.produto-card').first().click()
cy.get('.item-lista').eq(2).should('contain', 'Admin')
```

**Regra:**
- Posição **varia** → use `data-testid` específico do item
- Posição **não importa** → `.first()` / `.eq()` são válidos
- Posição **é a regra de negócio** → `.first()` é obrigatório e deve ser comentado

---

## 3. Comandos customizados — quando criar

Crie um comando customizado em `cypress/support/commands.js` sempre que:
- Uma ação se repete em mais de 2 testes
- A ação está fora do fluxo funcional (auth, estado, evidências)
- A ação envolve múltiplos passos que poluem o teste

**Comandos obrigatórios — sempre implementar:**

```javascript
// Autenticação via API (nunca pela UI)
Cypress.Commands.add('login', (email, password) => {
  cy.session([email, password], () => {
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/auth/login`,
      body: { email, password }
    }).then(({ body }) => {
      window.localStorage.setItem('token', body.token)
    })
  })
})

// Preservar sessão entre testes
Cypress.Commands.add('preserveSession', () => {
  cy.getCookies().then(cookies => {
    cookies.forEach(cookie => cy.setCookie(cookie.name, cookie.value))
  })
})

// Evidência nomeada com timestamp
Cypress.Commands.add('takeEvidence', (name) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  cy.screenshot(`${name}-${timestamp}`)
})

// Espera explícita por chamada de API
Cypress.Commands.add('waitForApi', (alias) => {
  cy.wait(`@${alias}`).its('response.statusCode').should('eq', 200)
})

// Popular banco com fixture
Cypress.Commands.add('seedDatabase', (fixture) => {
  cy.fixture(fixture).then(data => {
    cy.request('POST', `${Cypress.env('apiUrl')}/seed`, data)
  })
})
```

---

## 4. Gestão de sessão e autenticação

```javascript
// ✅ Correto — login via API, sessão cacheada
beforeEach(() => {
  cy.login(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
})

// ❌ Nunca — login pela UI em cada teste
beforeEach(() => {
  cy.visit('/login')
  cy.get('#email').type('admin@biblioteca.com')
  cy.get('#senha').type('admin123')
  cy.get('[data-testid="login-button"]').click()
})
```

**Regras:**
- Sempre use `cy.session()` para cachear autenticação entre specs
- Token JWT: armazene no `localStorage` via `cy.request()`, não pela UI
- Cookies de sessão: preserve com `cy.preserveSession()` quando necessário
- Nunca hardcode credenciais — use `Cypress.env()`

---

## 5. Estrutura de testes

```javascript
describe('Funcionalidade — contexto do que está sendo testado', () => {

  before(() => {
    // setup único para toda a suite (ex: seed de dados)
  })

  beforeEach(() => {
    // estado inicial limpo e previsível para cada teste
    cy.login(Cypress.env('userEmail'), Cypress.env('userPassword'))
    cy.visit('/pagina')
  })

  it('deve [comportamento esperado em linguagem de negócio]', () => {
    // arrange — preparar
    // act — agir
    // assert — verificar
  })

  afterEach(() => {
    // limpeza apenas se necessário
    // prefira beforeEach para garantir estado limpo
  })

})
```

**Regras:**
- Um `it()` = um comportamento = uma razão para falhar
- Nome do `it()` completa a frase: *"deve..."*
- Sem dependência entre testes — cada um roda isolado
- Sem `cy.wait()` com milissegundos fixos — use aliases e interceptações
- Máximo de uma ação principal por teste

---

## 6. Asserções

```javascript
// ✅ Explícita e semântica
cy.get('[data-testid="mensagem-erro"]')
  .should('be.visible')
  .and('contain.text', 'Credenciais inválidas')

// ✅ Estado da aplicação, não só presença
cy.get('[data-testid="usuario-logado"]')
  .should('contain.text', Cypress.env('userName'))

// ✅ Interceptação + asserção de API
cy.intercept('POST', '/api/auth/login').as('loginRequest')
cy.get('[data-testid="login-button"]').click()
cy.wait('@loginRequest').its('response.statusCode').should('eq', 200)

// ❌ Asserção implícita — o que está validando?
cy.get('[data-testid="login-button"]').click()
cy.url().should('include', '/dashboard')  // isso não valida se o login funcionou

// ❌ Wait fixo — nunca
cy.wait(3000)
```

**Regras:**
- Sempre valide o **estado da aplicação**, não só a URL ou presença de elemento
- Use `.and()` para encadear múltiplas asserções no mesmo elemento
- Prefira `cy.intercept()` para validar chamadas de API
- Timeout explícito quando o elemento demora: `.should('be.visible', { timeout: 10000 })`

---

## 7. Variáveis de ambiente

**Nunca hardcode no teste:**
```javascript
// ❌ Nunca
cy.visit('http://localhost:3000')
cy.get('#email').type('admin@biblioteca.com')

// ✅ Sempre
cy.visit('/')  // baseUrl vem do cypress.config.js
cy.get('[data-testid="email-input"]').type(Cypress.env('adminEmail'))
```

**Estrutura obrigatória:**
```
cypress/
  .env                 → valores locais (NUNCA commitar — está no .gitignore)
  .env.example         → modelo sem valores reais (commitar sempre)
  cypress.config.js    → lê as variáveis via process.env
```

**`cypress.config.js`:**
```javascript
const { defineConfig } = require('cypress')
require('dotenv').config()

module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
  },
  env: {
    adminEmail:    process.env.CYPRESS_ADMIN_EMAIL,
    adminPassword: process.env.CYPRESS_ADMIN_PASSWORD,
    userEmail:     process.env.CYPRESS_USER_EMAIL,
    userPassword:  process.env.CYPRESS_USER_PASSWORD,
    apiUrl:        process.env.CYPRESS_API_URL || 'http://localhost:3000/api',
  }
})
```

**`.env.example` — commitar sempre:**
```
CYPRESS_BASE_URL=http://localhost:3000
CYPRESS_ADMIN_EMAIL=
CYPRESS_ADMIN_PASSWORD=
CYPRESS_USER_EMAIL=
CYPRESS_USER_PASSWORD=
CYPRESS_API_URL=http://localhost:3000/api
```

**`.gitignore` — obrigatório:**
```
.env
cypress/videos/
cypress/screenshots/
cypress/downloads/
node_modules/
```

---

## 8. Evidências e relatório

```javascript
// Screenshot em falha automática — configurar no cypress.config.js
screenshotOnRunFailure: true,
video: true,

// Screenshot manual em etapas críticas
cy.takeEvidence('login-realizado-com-sucesso')
cy.takeEvidence('reserva-confirmada')
cy.takeEvidence('erro-credenciais-invalidas')
```

**Convenção de nomeação:**
```
[funcionalidade]-[cenario]-[status]

login-senha-invalida-erro-visivel
reserva-livro-indisponivel-mensagem-exibida
busca-sem-resultado-estado-vazio-correto
```

**Relatório — use um dos dois:**
- `cypress-mochawesome-reporter` → HTML simples, fácil de configurar
- `@shelex/cypress-allure-plugin` → Allure Report, mais completo

---

## 9. Organização de arquivos

```
cypress/
  e2e/
    auth/
      login.cy.js
      logout.cy.js
      recuperar-senha.cy.js
    livros/
      catalogo.cy.js
      busca.cy.js
      detalhes.cy.js
    reservas/
      criar-reserva.cy.js
      cancelar-reserva.cy.js
    admin/
      gestao-usuarios.cy.js
      gestao-acervo.cy.js
  support/
    commands.js          → todos os comandos customizados
    e2e.js               → imports globais e configurações
  fixtures/
    usuario-admin.json
    usuario-comum.json
    livros.json
    reservas.json
  pages/                 → Page Objects (quando aplicável)
    LoginPage.js
    CatalogoPage.js
    ReservaPage.js
```

---

## 10. Page Object Model — quando e como usar

**Quando criar:**
- 3 ou mais testes interagem com a mesma página
- A página tem muitos elementos e os testes ficam verbosos
- O time precisa de consistência nos seletores entre specs

**Regras do Page Object:**
- Encapsula **seletores e ações** — nunca asserções
- Asserções sempre ficam no teste (`it()`)
- Métodos retornam `this` para encadeamento ou `cy` para continuidade

```javascript
// pages/LoginPage.js
class LoginPage {
  get emailInput()    { return cy.get('[data-testid="email-input"]') }
  get senhaInput()    { return cy.get('[data-testid="password-input"]') }
  get loginButton()   { return cy.get('[data-testid="login-button"]') }
  get mensagemErro()  { return cy.get('[data-testid="error-message"]') }

  visit() {
    cy.visit('/login')
    return this
  }

  preencherCredenciais(email, senha) {
    this.emailInput.type(email)
    this.senhaInput.type(senha)
    return this
  }

  submeter() {
    this.loginButton.click()
    return this
  }
}

export default new LoginPage()

// No teste:
import LoginPage from '../pages/LoginPage'

it('deve exibir erro com credenciais inválidas', () => {
  LoginPage
    .visit()
    .preencherCredenciais('invalido@teste.com', 'senhaerrada')
    .submeter()

  LoginPage.mensagemErro
    .should('be.visible')
    .and('contain.text', 'Credenciais inválidas')
})
```

---

## 11. O que NUNCA fazer — restrições para o Copilot

> Esta seção define o que está proibido, independente do contexto.
> Ao gerar código de teste, nunca faça nenhum dos itens abaixo.

```
❌  cy.wait(número)                    → use cy.intercept() + cy.wait('@alias')
❌  .eq(0) / .first() para identidade  → use data-testid específico
❌  Seletor de classe CSS como único    → suba na hierarquia de seletores
❌  Login pela UI no beforeEach         → use cy.login() via API
❌  Hardcode de URL, email ou senha     → use Cypress.env()
❌  Credenciais no cypress.config.js    → use .env + process.env
❌  Testes com dependência de ordem     → cada it() é independente
❌  Múltiplas ações principais no it()  → um comportamento por teste
❌  Asserção apenas de URL              → valide o estado da aplicação
❌  Commitar arquivo .env               → está no .gitignore
❌  XPath como seletor                  → use a hierarquia da seção 1
❌  Page Object com asserções dentro    → asserções só no teste