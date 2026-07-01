// cypress/pages/CheckoutPage.js

class CheckoutPage {

  // ─── Seletores ────────────────────────────────────────────────────────────
  // Hierarquia aplicada: id (estável)

  get avisoLogin() { return cy.get('#login-prompt') }

  // Navegação via cy.visit não é necessária:
  // o checkout é acessado pelo botão da CestaPage (confirmarCheckout).
}

module.exports = { CheckoutPage }
