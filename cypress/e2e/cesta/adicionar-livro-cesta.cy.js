Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes("Cannot read properties of null (reading 'document')")) {
    return false
  }

  return true
})

const catalogPage = {
  visit(baseUrl) {
    cy.visit(`${baseUrl.replace(/\/$/, '')}/catalog.html`)
  },

  bookList() {
    return cy.get('#book-list')
  },

  addBookByTitle(title) {
    cy.contains('#book-list .card', title)
      .should('be.visible')
      .within(() => {
        cy.get('button.add-to-cart')
          .should('be.visible')
          .and('not.be.disabled')
          .click()
      })
  },

  addSameBookAgain(title) {
    cy.contains('#book-list .card', title)
      .should('be.visible')
      .within(() => {
        cy.get('button.add-to-cart')
          .click({ force: true })
      })
  },
}

const basketPage = {
  visit(baseUrl) {
    cy.visit(`${baseUrl.replace(/\/$/, '')}/basket.html`)
  },

  cartList() {
    return cy.get('#cart-list')
  },

  summary() {
    return cy.get('#cart-summary')
  },

  checkoutButton() {
    return cy.get('#checkout-btn')
  },
}

const checkoutPage = {
  loginPrompt() {
    return cy.get('#login-prompt')
  },
}

const localDefaults = {
  baseUrl: 'http://localhost:3000',
}

const getRequiredValue = (env, key) => {
  const value = env[key] || localDefaults[key]

  expect(value, `cy.env("${key}")`).to.be.a('string').and.not.be.empty
  return value
}

const getBaseUrl = (env) => {
  const baseUrl = Cypress.config('baseUrl') || getRequiredValue(env, 'baseUrl')

  expect(baseUrl, 'baseUrl configurada').to.be.a('string').and.not.be.empty
  return baseUrl
}

const loadCartEnv = () => cy.env([
  'baseUrl',
])

const loadAvailableBooks = (baseUrl, amount = 2) => {
  return cy.request(`${baseUrl.replace(/\/$/, '')}/api/books?limit=20&page=1`)
    .its('body.books')
    .then((books) => {
      const availableBooks = books
        .filter((book) => book.available_copies > 0)
        .slice(0, amount)

      expect(availableBooks, 'livros disponiveis para o teste')
        .to.have.length(amount)

      return availableBooks
    })
}

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

const seedCart = (books) => {
  const cartItems = books.map((book) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    category: book.category,
    cover_image: book.cover_image,
    notes: '',
  }))

  cy.window().then((win) => {
    win.localStorage.setItem('bookCart', JSON.stringify(cartItems))
  })
}

const assertCacheableGetSucceeded = (alias) => {
  cy.wait(alias)
    .its('response.statusCode')
    .should('be.oneOf', [200, 304])
}

describe('Adicionar livro a cesta - Hub de Leitura', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()

    cy.intercept('GET', '**/api/books?*').as('listBooks')
    cy.intercept('GET', '**/api/books/*').as('bookDetails')

    loadCartEnv().then((env) => {
      const baseUrl = getBaseUrl(env)

      loadAvailableBooks(baseUrl, 2).as('availableBooks')
    })
  })

  it('CT-CART-001 - deve adicionar um livro disponivel a cesta com sucesso', () => {
    loadCartEnv().then((env) => {
      catalogPage.visit(getBaseUrl(env))
    })

    assertCacheableGetSucceeded('@listBooks')

    cy.get('@availableBooks').then(([book]) => {
      catalogPage.bookList().should('contain.text', book.title)
      catalogPage.addBookByTitle(book.title)

      cy.get('#global-alert-container')
        .should('be.visible')
        .and('contain.text', 'foi adicionado')

      assertCartSize(1)
      assertCartHasBook(book)

      loadCartEnv().then((env) => {
        basketPage.visit(getBaseUrl(env))
      })

      assertCacheableGetSucceeded('@bookDetails')

      basketPage.cartList()
        .should('be.visible')
        .and('contain.text', book.title)

      basketPage.summary()
        .should('contain.text', 'Total de livros')
        .and('contain.text', '1')
    })
  })

  it('CT-CART-002 - deve permitir adicionar dois livros diferentes a cesta', () => {
    loadCartEnv().then((env) => {
      catalogPage.visit(getBaseUrl(env))
    })

    assertCacheableGetSucceeded('@listBooks')

    cy.get('@availableBooks').then(([firstBook, secondBook]) => {
      catalogPage.addBookByTitle(firstBook.title)
      catalogPage.addBookByTitle(secondBook.title)

      assertCartSize(2)
      assertCartHasBook(firstBook)
      assertCartHasBook(secondBook)

      loadCartEnv().then((env) => {
        basketPage.visit(getBaseUrl(env))
      })

      basketPage.cartList()
        .should('contain.text', firstBook.title)
        .and('contain.text', secondBook.title)

      basketPage.summary()
        .should('contain.text', 'Total de livros')
        .and('contain.text', '2')
    })
  })

  it('CT-CART-003 - deve exigir autenticacao para finalizar reserva', () => {
    cy.get('@availableBooks').then(([book]) => {
      loadCartEnv().then((env) => {
        const baseUrl = getBaseUrl(env)

        basketPage.visit(baseUrl)
        seedCart([book])
        basketPage.visit(baseUrl)
      })

      basketPage.cartList()
        .should('be.visible')
        .and('contain.text', book.title)

      basketPage.checkoutButton().click()

      cy.location('pathname').should('include', 'checkout')
      checkoutPage.loginPrompt()
        .should('be.visible')
        .invoke('text')
        .should('match', /autentica..o necess.ria/i)
    })
  })

  it('CT-CART-004 - deve impedir adicionar o mesmo livro duas vezes', () => {
    loadCartEnv().then((env) => {
      catalogPage.visit(getBaseUrl(env))
    })

    assertCacheableGetSucceeded('@listBooks')

    cy.get('@availableBooks').then(([book]) => {
      catalogPage.addBookByTitle(book.title)
      catalogPage.addSameBookAgain(book.title)

      cy.get('#global-alert-container')
        .should('be.visible')
        .invoke('text')
        .should('match', /j. est. na sua cesta/i)

      assertCartSize(1)
      assertCartHasBook(book)
    })
  })
})
