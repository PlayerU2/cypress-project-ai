// cypress/pages/index.js
// Barrel file — re-exporta todas as Page Classes do projeto.
// Adicione cada nova página aqui ao criá-la.

const { LoginPage }    = require('./LoginPage')
const { CadastroPage } = require('./CadastroPage')
const { CatalogoPage } = require('./CatalogoPage')
const { CestaPage }    = require('./CestaPage')
const { CheckoutPage } = require('./CheckoutPage')

module.exports = {
  LoginPage,
  CadastroPage,
  CatalogoPage,
  CestaPage,
  CheckoutPage,
}
