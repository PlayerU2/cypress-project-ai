Cypress.Commands.add('clearAuth', () => {
  cy.clearCookies()
  cy.clearLocalStorage()
})

Cypress.Commands.add('setBookCart', (books) => {
  const cartItems = books.map((book) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    category: book.category,
    cover_image: book.cover_image,
    notes: book.notes || '',
  }))

  cy.window().then((win) => {
    win.localStorage.setItem('bookCart', JSON.stringify(cartItems))
  })
})

Cypress.Commands.add('getBookCart', () => (
  cy.window()
    .its('localStorage')
    .invoke('getItem', 'bookCart')
    .then((cart) => JSON.parse(cart || '[]'))
))

Cypress.Commands.add('takeEvidence', (name) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

  cy.env(['testRunName']).then(({ testRunName }) => {
    const runName = testRunName || 'local-run'

    cy.screenshot(`${runName}/${name}-${timestamp}`)
  })
})
