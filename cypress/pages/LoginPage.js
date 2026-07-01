// cypress/pages/LoginPage.js

class LoginPage {

  // ─── Seletores ────────────────────────────────────────────────────────────
  // Getters puros: apenas retornam o elemento. Sem ação, sem asserção.
  // Hierarquia: data-testid → aria-label → id → name

  get emailInput()    { return cy.get('#email') }
  get senhaInput()    { return cy.get('#password') }
  get btnEntrar()     { return cy.get('#login-btn') }

  // ─── Navegação ────────────────────────────────────────────────────────────

  visit() {
    const baseUrl = Cypress.config('baseUrl') || ''
    cy.visit(`${baseUrl.replace(/\/$/, '')}/login.html`)
    return this
  }

  // ─── Ações ────────────────────────────────────────────────────────────────
  // Métodos atômicos: uma interação por método.
  // Todos retornam `this` para encadeamento fluente.
  // Nenhum método contém asserções (.should, expect, assert).

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

  // ─── Fluxo composto ───────────────────────────────────────────────────────
  // Agrupa ações que sempre ocorrem juntas no fluxo de login.

  entrar(email, senha) {
    return this
      .preencherEmail(email)
      .preencherSenha(senha)
      .submeter()
  }
}

module.exports = { LoginPage }
