const loginPage = {
  visit(baseUrl) {
    cy.visit(`${baseUrl.replace(/\/$/, '')}/login.html`)
  },

  emailInput() {
    return cy.get('#email')
  },

  passwordInput() {
    return cy.get('#password')
  },

  submitButton() {
    return cy.get('#login-btn')
  },

  login(email, password) {
    this.emailInput().clear().type(email)
    this.passwordInput().clear().type(password, { log: false })
    this.submitButton().click()
  },
}

const localDefaults = {
  baseUrl: 'http://localhost:3000',
  adminEmail: 'admin@biblioteca.com',
  adminPassword: 'admin123',
  userEmail: 'usuario@teste.com',
  userPassword: 'user123',
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

const loadLoginEnv = () => cy.env([
  'baseUrl',
  'adminEmail',
  'adminPassword',
  'userEmail',
  'userPassword',
])

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

    loadLoginEnv().then((env) => {
      cy.intercept('POST', '**/api/login').as('loginRequest')
      loginPage.visit(getBaseUrl(env))
    })
  })

  it('CT-LOGIN-001 - deve autenticar administrador com credenciais validas', () => {
    loadLoginEnv().then((env) => {
      loginPage.login(
        getRequiredValue(env, 'adminEmail'),
        getRequiredValue(env, 'adminPassword'),
      )
    })

    cy.wait('@loginRequest')
      .its('response.statusCode')
      .should('eq', 200)

    cy.location('pathname').should('include', 'admin')
    dismissQaGuideIfVisible()

    cy.contains('Painel Administrativo')
      .should('be.visible')

    assertTokenPersisted()
  })

  it('CT-LOGIN-002 - deve autenticar usuario comum com credenciais validas', () => {
    loadLoginEnv().then((env) => {
      loginPage.login(
        getRequiredValue(env, 'userEmail'),
        getRequiredValue(env, 'userPassword'),
      )
    })

    cy.wait('@loginRequest')
      .its('response.statusCode')
      .should('eq', 200)

    cy.location('pathname').should('not.include', 'login')
    assertTokenPersisted()
  })

  it('CT-LOGIN-003 - deve exibir erro ao informar senha invalida', () => {
    loadLoginEnv().then((env) => {
      loginPage.login(getRequiredValue(env, 'adminEmail'), 'senha-invalida-qa')
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
  })
})
