const { LoginPage } = require('../../pages')

const loginPage = new LoginPage()

// Defaults para execução local sem .env configurado (espelham .env.example)
const envDefaults = {
  adminEmail:    'admin@biblioteca.com',
  adminPassword: 'admin123',
  userEmail:     'usuario@teste.com',
  userPassword:  'user123',
}

const assertTokenPersisted = () => {
  cy.window()
    .its('localStorage')
    .invoke('getItem', 'authToken')
    .should('be.a', 'string')
    .and('not.be.empty')
}

const dismissQaGuideIfVisible = () => {
  cy.get('body').then(($body) => {
    const closeButtonSelector = [
      '.modal.show [data-testid="qa-guide-accept"]',
      '.modal.show [aria-label="Fechar"]',
      '.modal.show .modal-footer .btn',
    ].join(', ')

    if ($body.find(closeButtonSelector).length) {
      cy.get(closeButtonSelector).first().click({ force: true })
    }
  })
}

describe('Login - Hub de Leitura', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.intercept('POST', '**/api/login').as('loginRequest')
    loginPage.visit()
  })

  it('CT-LOGIN-001 - deve autenticar administrador com credenciais validas', () => {
    cy.env(['adminEmail', 'adminPassword']).then((env) => {
      const adminEmail    = env.adminEmail    || envDefaults.adminEmail
      const adminPassword = env.adminPassword || envDefaults.adminPassword

      loginPage.entrar(adminEmail, adminPassword)
    })

    cy.wait('@loginRequest')
      .its('response.statusCode')
      .should('eq', 200)

    cy.location('pathname').should('include', 'admin')
    dismissQaGuideIfVisible()

    cy.contains('Painel Administrativo').should('be.visible')
    assertTokenPersisted()
    cy.takeEvidence('login-admin-sucesso')
  })

  it('CT-LOGIN-002 - deve autenticar usuario comum com credenciais validas', () => {
    cy.env(['userEmail', 'userPassword']).then((env) => {
      const userEmail    = env.userEmail    || envDefaults.userEmail
      const userPassword = env.userPassword || envDefaults.userPassword

      loginPage.entrar(userEmail, userPassword)
    })

    cy.wait('@loginRequest')
      .its('response.statusCode')
      .should('eq', 200)

    cy.location('pathname').should('not.include', 'login')
    assertTokenPersisted()
    cy.takeEvidence('login-usuario-sucesso')
  })

  it('CT-LOGIN-003 - deve exibir erro ao informar senha invalida', () => {
    cy.env(['adminEmail']).then((env) => {
      const adminEmail = env.adminEmail || envDefaults.adminEmail

      loginPage.entrar(adminEmail, 'senha-invalida-qa')
    })

    cy.wait('@loginRequest')
      .its('response.statusCode')
      .should('be.oneOf', [400, 401])

    cy.location('pathname').should('include', 'login')
    cy.window()
      .its('localStorage')
      .invoke('getItem', 'authToken')
      .should('be.null')

    cy.get('body')
      .invoke('text')
      .should('match', /erro|senha|credenciais|invalid/i)

    cy.takeEvidence('login-senha-invalida-erro')
  })
})
