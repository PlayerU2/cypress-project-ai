// cypress/pages/CadastroPage.js

class CadastroPage {

  // ─── Seletores ────────────────────────────────────────────────────────────
  // Hierarquia aplicada: id (estável, não gerado dinamicamente)
  // data-testid não disponível nesta página — id é o melhor nível acessível.

  get inputNome()          { return cy.get('#name') }
  get inputEmail()         { return cy.get('#email') }
  get inputTelefone()      { return cy.get('#phone') }
  get inputSenha()         { return cy.get('#password') }
  get inputConfirmaSenha() { return cy.get('#confirm-password') }
  get checkboxTermos()     { return cy.get('#terms-agreement') }
  get btnCadastrar()       { return cy.get('#register-btn') }
  get alertContainer()     { return cy.get('#alert-container') }

  // ─── Navegação ────────────────────────────────────────────────────────────

  visit() {
    cy.visit('/register.html')
    return this
  }

  // ─── Ações atômicas ───────────────────────────────────────────────────────
  // Uma interação por método. Todos retornam `this`.
  // Nenhum método contém asserções (.should, expect, assert).

  preencherNome(nome) {
    this.inputNome.clear().type(nome)
    return this
  }

  preencherEmail(email) {
    this.inputEmail.clear().type(email)
    return this
  }

  preencherTelefone(telefone) {
    this.inputTelefone.clear().type(telefone)
    return this
  }

  preencherSenha(senha) {
    this.inputSenha.clear().type(senha, { log: false })
    return this
  }

  confirmarSenha(confirmaSenha) {
    this.inputConfirmaSenha.clear().type(confirmaSenha, { log: false })
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

  // ─── Fluxo composto ───────────────────────────────────────────────────────
  // Agrupa o preenchimento completo do formulário.
  // `confirmaSenha` replica `senha` por padrão (caso happy path).

  preencherFormulario({ nome, email, telefone, senha, confirmaSenha = senha }) {
    this.preencherNome(nome)
    this.preencherEmail(email)

    if (telefone) {
      this.preencherTelefone(telefone)
    }

    this.preencherSenha(senha)
    this.confirmarSenha(confirmaSenha)
    this.aceitarTermos()

    return this
  }
}

module.exports = { CadastroPage }
