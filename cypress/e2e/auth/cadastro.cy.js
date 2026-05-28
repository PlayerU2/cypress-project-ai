const registerPage = {
  visit(baseUrl) {
    cy.visit(`${baseUrl.replace(/\/$/, '')}/register.html`)
  },

  nameInput() {
    return cy.get('#name')
  },

  emailInput() {
    return cy.get('#email')
  },

  phoneInput() {
    return cy.get('#phone')
  },

  passwordInput() {
    return cy.get('#password')
  },

  confirmPasswordInput() {
    return cy.get('#confirm-password')
  },

  termsCheckbox() {
    return cy.get('#terms-agreement')
  },

  submitButton() {
    return cy.get('#register-btn')
  },

  alert() {
    return cy.get('#alert-container')
  },

  fillForm({ name, email, phone, password, confirmPassword = password }) {
    this.nameInput().clear().type(name)
    this.emailInput().clear().type(email)

    if (phone) {
      this.phoneInput().clear().type(phone)
    }

    this.passwordInput().clear().type(password, { log: false })
    this.confirmPasswordInput().clear().type(confirmPassword, { log: false })
    this.termsCheckbox().check()
  },

  submit() {
    this.submitButton().click()
  },
}

const localDefaults = {
  baseUrl: 'http://localhost:3000',
  adminEmail: 'admin@biblioteca.com',
}

const validUser = {
  name: 'Usuario Teste Automatizado',
  phone: '11999999999',
  password: 'Senha@123',
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

const loadRegisterEnv = () => cy.env([
  'baseUrl',
  'adminEmail',
])

const createUniqueEmail = () => {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 100000)

  return `usuario_${timestamp}_${random}@teste.com`
}

const assertNoAuthToken = () => {
  cy.window()
    .its('localStorage')
    .invoke('getItem', 'authToken')
    .should('be.null')
}

describe('Cadastro de Usuario - Hub de Leitura', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()

    cy.intercept('POST', '**/api/register').as('registerRequest')
    cy.intercept('POST', '**/api/login').as('autoLoginRequest')

    loadRegisterEnv().then((env) => {
      registerPage.visit(getBaseUrl(env))
    })
  })

  it('CT-CAD-001 - deve criar conta com dados validos e autenticar automaticamente', () => {
    const email = createUniqueEmail()

    registerPage.fillForm({
      ...validUser,
      email,
    })
    registerPage.submit()

    cy.wait('@registerRequest')
      .its('response.statusCode')
      .should('be.oneOf', [200, 201])

    registerPage.alert()
      .should('be.visible')
      .and('contain.text', 'Conta criada com sucesso')

    cy.wait('@autoLoginRequest')
      .its('response.statusCode')
      .should('eq', 200)

    cy.location('pathname').should('include', 'dashboard')
    cy.window()
      .its('localStorage')
      .invoke('getItem', 'authToken')
      .should('be.a', 'string')
      .and('not.be.empty')
  })

  it('CT-CAD-002 - deve exibir erro ao tentar cadastrar email ja existente', () => {
    loadRegisterEnv().then((env) => {
      registerPage.fillForm({
        ...validUser,
        name: 'Admin Duplicado',
        email: getRequiredValue(env, 'adminEmail'),
      })
    })
    registerPage.submit()

    cy.wait('@registerRequest')
      .its('response.statusCode')
      .should('be.oneOf', [400, 409])

    cy.location('pathname').should('include', 'register')
    registerPage.alert()
      .should('be.visible')
      .and('contain.text', 'Erro')
    assertNoAuthToken()
  })

  it('CT-CAD-003 - deve impedir envio com campos obrigatorios vazios', () => {
    registerPage.submit()

    cy.location('pathname').should('include', 'register')
    cy.get('#name').should('have.class', 'is-invalid')
    cy.get('#email').should('have.class', 'is-invalid')
    cy.get('#password').should('have.class', 'is-invalid')
    cy.get('#terms-agreement').should('have.class', 'is-invalid')
    cy.get('@registerRequest.all').should('have.length', 0)
    assertNoAuthToken()
  })

  it('CT-CAD-004 - deve impedir envio quando confirmacao de senha diverge', () => {
    registerPage.fillForm({
      ...validUser,
      email: createUniqueEmail(),
      confirmPassword: 'SenhaDiferente@123',
    })
    registerPage.submit()

    cy.location('pathname').should('include', 'register')
    registerPage.confirmPasswordInput()
      .should('have.class', 'is-invalid')
      .parent()
      .find('.invalid-feedback')
      .invoke('text')
      .should('match', /senhas/i)
      .and('match', /coincidem/i)
    cy.get('@registerRequest.all').should('have.length', 0)
    assertNoAuthToken()
  })
})
