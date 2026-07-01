# Padrões de Ação e Encadeamento — Page Object Model

## Princípio fundamental

Métodos de ação no Page Object:
- Executam **uma ou mais interações de UI** relacionadas
- **Sempre retornam `this`** para permitir encadeamento fluente
- **Nunca contêm asserções** (`.should()`, `expect()`, `assert`)
- Recebem **dados por parâmetro** — nunca hardcodados

---

## Tipos de métodos

### 1. Ação atômica — uma interação de UI

```javascript
// Uma única interação. Retorna this.
preencherEmail(email) {
  this.emailInput.clear().type(email)
  return this
}

submeter() {
  this.btnSalvar.click()
  return this
}

limparCampo() {
  this.inputBusca.clear()
  return this
}

marcarCheckbox() {
  this.checkboxTermos.check()
  return this
}

selecionarOpcao(valor) {
  this.selectCategoria.select(valor)
  return this
}
```

### 2. Fluxo composto — múltiplas ações relacionadas

Agrupe ações que **sempre ocorrem juntas** em um método de fluxo. Use apenas quando o agrupamento eliminar repetição real nos specs.

```javascript
// Agrupa preenchimento + submissão do formulário de login
entrar(email, senha) {
  return this
    .preencherEmail(email)
    .preencherSenha(senha)
    .submeter()
}

// Agrupa busca completa
buscarLivro(termo) {
  return this
    .limparBusca()
    .preencherBusca(termo)
    .submeterBusca()
}
```

### 3. Ação condicional — quando o elemento pode não estar presente

Às vezes um elemento opcional (modal, banner) precisa ser dispensado antes de prosseguir. Use `cy.get('body').then()` para condicional segura:

```javascript
// Dispensa modal de guia QA se estiver visível (sem falhar se ausente)
dispensarModalSeVisivel() {
  cy.get('body').then(($body) => {
    const seletores = [
      '.modal.show [data-testid="qa-guide-accept"]',
      '.modal.show [aria-label="Fechar"]',
      '.modal.show .modal-footer .btn',
    ].join(', ')

    if ($body.find(seletores).length) {
      cy.get(seletores).first().click({ force: true })
    }
  })
  return this
}
```

---

## Encadeamento fluente nos specs

O retorno de `this` permite escrever fluxos legíveis no spec:

```javascript
// ✅ Encadeamento fluente — legível como prosa
loginPage
  .visit()
  .preencherEmail(Cypress.env('adminEmail'))
  .preencherSenha(Cypress.env('adminPassword'))
  .submeter()

// ✅ Usando método de fluxo composto
loginPage
  .visit()
  .entrar(Cypress.env('adminEmail'), Cypress.env('adminPassword'))

// ✅ Asserção depois do encadeamento, no spec
loginPage.visit().entrar(email, senha)

cy.wait('@loginRequest').its('response.statusCode').should('eq', 200)
cy.location('pathname').should('include', 'admin')
loginPage.mensagemErro.should('not.exist')
```

---

## Autenticação

### Padrão obrigatório — via API com cy.session()

A autenticação **nunca** deve ser feita pela UI no `beforeEach`. Use `cy.session()` para cachear o estado entre testes.

```javascript
// cypress/support/commands.js — comando customizado de login
Cypress.Commands.add('loginComoAdmin', () => {
  cy.session('admin', () => {
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl') || ''}/api/login`,
      body: {
        email:    Cypress.env('adminEmail'),
        password: Cypress.env('adminPassword'),
      },
    }).then(({ body }) => {
      window.localStorage.setItem('authToken', body.token)
    })
  })
})

Cypress.Commands.add('loginComoUsuario', () => {
  cy.session('usuario', () => {
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl') || ''}/api/login`,
      body: {
        email:    Cypress.env('userEmail'),
        password: Cypress.env('userPassword'),
      },
    }).then(({ body }) => {
      window.localStorage.setItem('authToken', body.token)
    })
  })
})
```

```javascript
// No spec que requer autenticação
beforeEach(() => {
  cy.loginComoAdmin()
  catalogoPage.visit()
})
```

---

## Gerenciamento de estado de UI (cesta, localStorage)

Para ações que manipulam estado de aplicação diretamente (sem UI), use comandos customizados, não Page Objects:

```javascript
// cypress/support/commands.js (já existe no projeto)
// cy.setBookCart(books)    → popula cesta via localStorage
// cy.getBookCart()         → lê cesta do localStorage
// cy.clearAuth()           → limpa cookies e localStorage

// No spec — usar commands.js, não o Page Object:
beforeEach(() => {
  cy.clearAuth()
  cy.fixture('livros.json').then((livros) => {
    cy.setBookCart(livros.slice(0, 3))
  })
  cestaPage.visit()
})
```

---

## Interceptação de rede

`cy.intercept()` **nunca** vai dentro do Page Object. Fica no `beforeEach` do spec.

```javascript
// ✅ Correto — no beforeEach do spec
beforeEach(() => {
  cy.intercept('POST', '**/api/login').as('loginRequest')
  cy.intercept('GET',  '**/api/livros').as('getLivros')
  cy.intercept('POST', '**/api/reservas').as('criarReserva')
  loginPage.visit()
})

// No it() — usa o alias configurado no beforeEach
it('deve criar reserva com sucesso', () => {
  loginPage.entrar(Cypress.env('userEmail'), Cypress.env('userPassword'))
  cy.wait('@loginRequest')

  catalogoPage.adicionarLivroNaCesta('Dom Casmurro')
  cestaPage.visit().confirmarReserva()

  cy.wait('@criarReserva').its('response.statusCode').should('eq', 201)
})
```

---

## Evidências (screenshots)

Capturas de tela em etapas críticas ficam no spec, não no Page Object. Use o comando customizado `cy.takeEvidence()` (já disponível neste projeto):

```javascript
// No it() — após ação crítica
it('CT-LOGIN-001 - deve autenticar administrador', () => {
  loginPage.entrar(Cypress.env('adminEmail'), Cypress.env('adminPassword'))

  cy.wait('@loginRequest').its('response.statusCode').should('eq', 200)
  cy.takeEvidence('login-admin-sucesso')

  cy.location('pathname').should('include', 'admin')
  cy.contains('Painel Administrativo').should('be.visible')
})
```

---

## Anti-padrões de ação — nunca faça

```javascript
// ❌ Asserção dentro do Page Object
submeter() {
  this.btnEntrar.click()
  cy.url().should('include', '/admin')  // ← PROIBIDO
  return this
}

// ❌ cy.wait com milissegundos
aguardarCarregamento() {
  cy.wait(3000)  // ← PROIBIDO — use cy.intercept() + cy.wait('@alias')
  return this
}

// ❌ Dados hardcoded
entrarComoAdmin() {
  this.emailInput.type('admin@biblioteca.com')  // ← PROIBIDO
  this.senhaInput.type('admin123')              // ← PROIBIDO
  return this
}

// ❌ cy.intercept() dentro do Page Object
visit() {
  cy.intercept('GET', '/api/livros').as('getLivros')  // ← PROIBIDO
  cy.visit('/catalogo.html')
  return this
}
```
