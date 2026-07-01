// cypress/pages/CestaPage.js

class CestaPage {

  // ─── Seletores ────────────────────────────────────────────────────────────
  // Hierarquia aplicada: id (estável, não gerado dinamicamente)

  get listaCesta()  { return cy.get('#cart-list') }
  get resumo()      { return cy.get('#cart-summary') }
  get btnCheckout() { return cy.get('#checkout-btn') }

  // ─── Navegação ────────────────────────────────────────────────────────────

  visit() {
    cy.visit('/basket.html')
    return this
  }

  // ─── Ações ────────────────────────────────────────────────────────────────

  confirmarCheckout() {
    this.btnCheckout.click()
    return this
  }
}

module.exports = { CestaPage }
