// cypress/pages/CatalogoPage.js

class CatalogoPage {

  // ─── Seletores ────────────────────────────────────────────────────────────
  // Hierarquia aplicada:
  //   #book-list, #global-alert-container → id (estável)
  //   #book-list .card → seletor composto de id + tag (sem data-testid disponível)
  //   button.add-to-cart → classe CSS (único identificador disponível nos cards dinâmicos)

  get listaLivros()  { return cy.get('#book-list') }
  get alertaGlobal() { return cy.get('#global-alert-container') }

  // Seletor parametrizado: localiza o card pelo texto do título
  getCardLivro(titulo) {
    return cy.contains('#book-list .card', titulo)
  }

  // Seletor do botão de adicionar dentro de um card específico
  getBtnAdicionarCesta(titulo) {
    return this.getCardLivro(titulo).find('button.add-to-cart')
  }

  // ─── Navegação ────────────────────────────────────────────────────────────

  visit() {
    cy.visit('/catalog.html')
    return this
  }

  // ─── Ações ────────────────────────────────────────────────────────────────
  // Todos os métodos retornam `this` para encadeamento.
  // Sem asserções — verificações ficam no it() do spec.

  adicionarLivroNaCesta(titulo) {
    this.getCardLivro(titulo).within(() => {
      cy.get('button.add-to-cart').click()
    })
    return this
  }

  // Tenta adicionar um livro já presente na cesta (force para contornar possível estado desabilitado)
  tentarAdicionarLivroNovamente(titulo) {
    this.getCardLivro(titulo).within(() => {
      cy.get('button.add-to-cart').click({ force: true })
    })
    return this
  }
}

module.exports = { CatalogoPage }
