const { CadastroPage } = require('../../pages')

const cadastroPage = new CadastroPage()

// Defaults para execução local sem .env configurado (espelham .env.example)
const envDefaults = {
  adminEmail: 'admin@biblioteca.com',
}

const validUser = {
  nome: 'Usuario Teste Automatizado',
  telefone: '11999999999',
  senha: 'Senha@123',
}

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
    cadastroPage.visit()
  })

  it('CT-CAD-001 - deve criar conta com dados validos e autenticar automaticamente', () => {
    cadastroPage
      .preencherFormulario({ ...validUser, email: createUniqueEmail() })
      .submeter()

    cy.wait('@registerRequest')
      .its('response.statusCode')
      .should('be.oneOf', [200, 201])

    cadastroPage.alertContainer
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

    cy.takeEvidence('cadastro-conta-criada-sucesso')
  })

  it('CT-CAD-002 - deve exibir erro ao tentar cadastrar email ja existente', () => {
    cy.env(['adminEmail']).then((env) => {
      const adminEmail = env.adminEmail || envDefaults.adminEmail

      cadastroPage.preencherFormulario({
        ...validUser,
        nome: 'Admin Duplicado',
        email: adminEmail,
      })
    })
    cadastroPage.submeter()

    cy.wait('@registerRequest')
      .its('response.statusCode')
      .should('be.oneOf', [400, 409])

    cy.location('pathname').should('include', 'register')
    cadastroPage.alertContainer
      .should('be.visible')
      .and('contain.text', 'Erro')

    assertNoAuthToken()
    cy.takeEvidence('cadastro-email-duplicado-erro')
  })

  it('CT-CAD-003 - deve impedir envio com campos obrigatorios vazios', () => {
    cadastroPage.submeter()

    cy.location('pathname').should('include', 'register')
    cadastroPage.inputNome.should('have.class', 'is-invalid')
    cadastroPage.inputEmail.should('have.class', 'is-invalid')
    cadastroPage.inputSenha.should('have.class', 'is-invalid')
    cadastroPage.checkboxTermos.should('have.class', 'is-invalid')
    cy.get('@registerRequest.all').should('have.length', 0)
    assertNoAuthToken()
  })

  it('CT-CAD-004 - deve impedir envio quando confirmacao de senha diverge', () => {
    cadastroPage
      .preencherFormulario({
        ...validUser,
        email: createUniqueEmail(),
        confirmaSenha: 'SenhaDiferente@123',
      })
      .submeter()

    cy.location('pathname').should('include', 'register')
    cadastroPage.inputConfirmaSenha
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
