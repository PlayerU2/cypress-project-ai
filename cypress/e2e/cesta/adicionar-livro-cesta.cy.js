Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes("Cannot read properties of null (reading 'document')")) {
    return false
  }

  return true
})

const { CatalogoPage, CestaPage, CheckoutPage } = require('../../pages')

const catalogoPage  = new CatalogoPage()
const cestaPage     = new CestaPage()
const checkoutPage  = new CheckoutPage()

// ─── Utilitários de teste ────────────────────────────────────────────────────
// Funções auxiliares específicas deste spec (não pertencem ao Page Object).

const loadAvailableBooks = (amount = 2) => (
  cy.request('/api/books?limit=20&page=1')
    .its('body.books')
    .then((books) => {
      const availableBooks = books
        .filter((book) => book.available_copies > 0)
        .slice(0, amount)

      expect(availableBooks, 'livros disponiveis para o teste')
        .to.have.length(amount)

      return availableBooks
    })
)

const getCartItems = () => (
  cy.window()
    .its('localStorage')
    .invoke('getItem', 'bookCart')
    .then((cart) => JSON.parse(cart || '[]'))
)

const assertCartSize = (size) => {
  getCartItems().should('have.length', size)
}

const assertCartHasBook = (book) => {
  getCartItems().then((cart) => {
    expect(cart.map((item) => Number(item.id)), 'ids dos livros na cesta')
      .to.include(Number(book.id))
    expect(cart.map((item) => item.title), 'titulos dos livros na cesta')
      .to.include(book.title)
  })
}

const assertCacheableGetSucceeded = (alias) => {
  cy.wait(alias)
    .its('response.statusCode')
    .should('be.oneOf', [200, 304])
}

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('Adicionar livro a cesta - Hub de Leitura', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()

    cy.intercept('GET', '**/api/books?*').as('listBooks')
    cy.intercept('GET', '**/api/books/*').as('bookDetails')

    loadAvailableBooks(2).as('availableBooks')
  })

  it('CT-CART-001 - deve adicionar um livro disponivel a cesta com sucesso', () => {
    catalogoPage.visit()
    assertCacheableGetSucceeded('@listBooks')

    cy.get('@availableBooks').then(([book]) => {
      catalogoPage.listaLivros.should('contain.text', book.title)
      catalogoPage.adicionarLivroNaCesta(book.title)

      catalogoPage.alertaGlobal
        .should('be.visible')
        .and('contain.text', 'foi adicionado')

      assertCartSize(1)
      assertCartHasBook(book)

      cestaPage.visit()
      assertCacheableGetSucceeded('@bookDetails')

      cestaPage.listaCesta
        .should('be.visible')
        .and('contain.text', book.title)

      cestaPage.resumo
        .should('contain.text', 'Total de livros')
        .and('contain.text', '1')

      cy.takeEvidence('livro-adicionado-cesta-sucesso')
    })
  })

  it('CT-CART-002 - deve permitir adicionar dois livros diferentes a cesta', () => {
    catalogoPage.visit()
    assertCacheableGetSucceeded('@listBooks')

    cy.get('@availableBooks').then(([firstBook, secondBook]) => {
      catalogoPage.adicionarLivroNaCesta(firstBook.title)
      catalogoPage.adicionarLivroNaCesta(secondBook.title)

      assertCartSize(2)
      assertCartHasBook(firstBook)
      assertCartHasBook(secondBook)

      cestaPage.visit()

      cestaPage.listaCesta
        .should('contain.text', firstBook.title)
        .and('contain.text', secondBook.title)

      cestaPage.resumo
        .should('contain.text', 'Total de livros')
        .and('contain.text', '2')

      cy.takeEvidence('dois-livros-adicionados-cesta')
    })
  })

  it('CT-CART-003 - deve exigir autenticacao para finalizar reserva', () => {
    cy.get('@availableBooks').then(([book]) => {
      // Seed via localStorage: visita a página primeiro para ter window disponível,
      // popula a cesta via command e recarrega para renderizar os itens.
      cestaPage.visit()
      cy.setBookCart([book])
      cestaPage.visit()

      cestaPage.listaCesta
        .should('be.visible')
        .and('contain.text', book.title)

      cestaPage.confirmarCheckout()

      cy.location('pathname').should('include', 'checkout')
      checkoutPage.avisoLogin
        .should('be.visible')
        .invoke('text')
        .should('match', /autentica..o necess.ria/i)

      cy.takeEvidence('checkout-sem-autenticacao-bloqueado')
    })
  })

  it('CT-CART-004 - deve impedir adicionar o mesmo livro duas vezes', () => {
    catalogoPage.visit()
    assertCacheableGetSucceeded('@listBooks')

    cy.get('@availableBooks').then(([book]) => {
      catalogoPage.adicionarLivroNaCesta(book.title)
      catalogoPage.tentarAdicionarLivroNovamente(book.title)

      catalogoPage.alertaGlobal
        .should('be.visible')
        .invoke('text')
        .should('match', /j. est. na sua cesta/i)

      assertCartSize(1)
      assertCartHasBook(book)
    })
  })
})
