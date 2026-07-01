# Template de Page Class — Page Object Model

## Quando criar

Crie um Page Object quando:
- **3 ou mais testes** interagem com a mesma página
- A página tem muitos elementos e os specs ficam verbosos
- O time precisa de consistência nos seletores entre specs
- Um fluxo de UI se repete em múltiplas suites de teste

---

## Template completo — Page Object JS (padrão deste projeto)

```javascript
// cypress/pages/LoginPage.js

class LoginPage {

  // ─── Seletores ────────────────────────────────────────────────────────────
  // Getters puros: apenas retornam o elemento. Sem ação, sem asserção.

  get emailInput()     { return cy.get('[data-testid="email-input"]') }
  get senhaInput()     { return cy.get('[data-testid="password-input"]') }
  get btnEntrar()      { return cy.get('[data-testid="login-button"]') }
  get mensagemErro()   { return cy.get('[data-testid="error-message"]') }
  get linkRecuperarSenha() { return cy.contains('Esqueceu sua senha?') }

  // ─── Navegação ────────────────────────────────────────────────────────────

  visit() {
    cy.visit('/login.html')
    return this
  }

  // ─── Ações ────────────────────────────────────────────────────────────────
  // Métodos combinam seletores em fluxos de usuário.
  // Sempre retornam `this` para permitir encadeamento.
  // Nunca contêm asserções — asserções ficam no it().

  preencherEmail(email) {
    this.emailInput.clear().type(email)
    return this
  }

  preencherSenha(senha) {
    this.senhaInput.clear().type(senha, { log: false })
    return this
  }

  submeter() {
    this.btnEntrar.click()
    return this
  }

  // ─── Fluxo completo ───────────────────────────────────────────────────────
  // Agrupa ações relacionadas para evitar verbosidade no spec.
  // Use apenas quando o fluxo for idêntico em múltiplos testes.

  entrar(email, senha) {
    return this
      .preencherEmail(email)
      .preencherSenha(senha)
      .submeter()
  }
}

module.exports = { LoginPage }
```

---

## Exemplo de uso no spec

```javascript
// cypress/e2e/auth/login.cy.js
const { LoginPage } = require('../../pages')

const loginPage = new LoginPage()

describe('Login - Hub de Leitura', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.intercept('POST', '**/api/login').as('loginRequest')
    loginPage.visit()
  })

  it('CT-LOGIN-001 - deve autenticar administrador com credenciais válidas', () => {
    loginPage.entrar(Cypress.env('adminEmail'), Cypress.env('adminPassword'))

    cy.wait('@loginRequest').its('response.statusCode').should('eq', 200)
    cy.location('pathname').should('include', 'admin')

    loginPage.mensagemErro.should('not.exist')
  })

  it('CT-LOGIN-003 - deve exibir erro com credenciais inválidas', () => {
    loginPage.entrar(Cypress.env('adminEmail'), 'senha-invalida')

    cy.wait('@loginRequest').its('response.statusCode').should('be.oneOf', [400, 401])

    loginPage.mensagemErro
      .should('be.visible')
      .and('match', /credenciais|senha|inválid/i)
  })
})
```

---

## Template para páginas com formulários complexos

```javascript
// cypress/pages/CadastroPage.js

class CadastroPage {

  // ─── Seletores ────────────────────────────────────────────────────────────

  get inputNome()          { return cy.get('[data-testid="input-nome"]') }
  get inputEmail()         { return cy.get('[data-testid="input-email"]') }
  get inputSenha()         { return cy.get('[data-testid="input-senha"]') }
  get inputConfirmaSenha() { return cy.get('[data-testid="input-confirma-senha"]') }
  get selectPerfil()       { return cy.get('[data-testid="select-perfil"]') }
  get checkboxTermos()     { return cy.get('[data-testid="checkbox-termos"]') }
  get btnCadastrar()       { return cy.get('[data-testid="btn-cadastrar"]') }
  get mensagemSucesso()    { return cy.get('[data-testid="mensagem-sucesso"]') }
  get erroNome()           { return cy.get('[data-testid="erro-nome"]') }
  get erroEmail()          { return cy.get('[data-testid="erro-email"]') }
  get erroSenha()          { return cy.get('[data-testid="erro-senha"]') }

  // ─── Navegação ────────────────────────────────────────────────────────────

  visit() {
    cy.visit('/cadastro.html')
    return this
  }

  // ─── Ações individuais ────────────────────────────────────────────────────

  preencherNome(nome) {
    this.inputNome.clear().type(nome)
    return this
  }

  preencherEmail(email) {
    this.inputEmail.clear().type(email)
    return this
  }

  preencherSenha(senha) {
    this.inputSenha.clear().type(senha, { log: false })
    return this
  }

  confirmarSenha(senha) {
    this.inputConfirmaSenha.clear().type(senha, { log: false })
    return this
  }

  selecionarPerfil(perfil) {
    this.selectPerfil.select(perfil)
    return this
  }

  aceitarTermos() {
    this.checkboxTermos.check()
    return this
  }

  submeter() {
    this.btnCadastrar.click()
    return this
  }

  // ─── Fluxo completo ───────────────────────────────────────────────────────

  cadastrar({ nome, email, senha, perfil = 'usuario' }) {
    return this
      .preencherNome(nome)
      .preencherEmail(email)
      .preencherSenha(senha)
      .confirmarSenha(senha)
      .selecionarPerfil(perfil)
      .aceitarTermos()
      .submeter()
  }
}

module.exports = { CadastroPage }
```

---

## Template para páginas de listagem/catálogo

```javascript
// cypress/pages/CatalogoPage.js

class CatalogoPage {

  // ─── Seletores ────────────────────────────────────────────────────────────

  get inputBusca()     { return cy.get('[data-testid="input-busca"]') }
  get btnBuscar()      { return cy.get('[data-testid="btn-buscar"]') }
  get listaLivros()    { return cy.get('[data-testid="livro-card"]') }
  get estadoVazio()    { return cy.get('[data-testid="estado-vazio"]') }
  get loadingSpinner() { return cy.get('[data-testid="loading"]') }

  // Seletor parametrizado — livro específico pelo título
  getLivro(titulo) {
    return cy.contains('[data-testid="livro-card"]', titulo)
  }

  // Seletor de ação dentro do card de um livro específico
  getBtnAdicionarCesta(titulo) {
    return this.getLivro(titulo).find('[data-testid="btn-adicionar-cesta"]')
  }

  // ─── Navegação ────────────────────────────────────────────────────────────

  visit() {
    cy.visit('/catalogo.html')
    return this
  }

  // ─── Ações ────────────────────────────────────────────────────────────────

  buscar(termo) {
    this.inputBusca.clear().type(termo)
    this.btnBuscar.click()
    return this
  }

  adicionarLivroNaCesta(titulo) {
    this.getBtnAdicionarCesta(titulo).click()
    return this
  }
}

module.exports = { CatalogoPage }
```

---

## Barrel file (index.js)

```javascript
// cypress/pages/index.js
const { LoginPage }    = require('./LoginPage')
const { CadastroPage } = require('./CadastroPage')
const { CatalogoPage } = require('./CatalogoPage')
const { CestaPage }    = require('./CestaPage')

module.exports = {
  LoginPage,
  CadastroPage,
  CatalogoPage,
  CestaPage,
}
```

---

## Checklist de validação do Page Object

Antes de finalizar qualquer Page Object, verifique:

```
[ ] Seletores seguem a hierarquia: data-testid → aria-label → id → name
[ ] Getters usam a sintaxe `get nomeDoElemento() { return cy.get(...) }`
[ ] Métodos de ação retornam `this`
[ ] Nenhum método contém .should(), expect() ou assert
[ ] Credenciais e dados de teste usam Cypress.env() ou parâmetro
[ ] cy.intercept() não está dentro do Page Object (fica no beforeEach do spec)
[ ] Arquivo exporta a classe: module.exports = { NomePage }
[ ] Barrel file (index.js) foi atualizado com o novo Page Object
```
