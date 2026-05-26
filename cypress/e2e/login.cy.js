describe('template spec', () => {
  it('CT-LOGIN-001 - Login com credenciais válidas de administrador', () => {
    // 1. Acessar a página de login
    cy.visit('http://localhost:3000/login')

    // 2. Inserir e-mail
    cy.get('input[name="email"], input[type="email"]').type('admin@biblioteca.com')

    // 3. Inserir senha
    cy.get('input[name="password"], input[type="password"]').type('admin123')


    // 4. Clicar em "Entrar"
    cy.contains('button', 'Entrar').click()

    // 5. Redirecionamento para o Painel Admin
    cy.url().should('include', '/admin')

    // 6. Menu com opções administrativas visível
    cy.contains('Painel Administrativo').should('be.visible')
    // Se necessário, adicione outros seletores/textos conforme o menu real

      // Se o modal de guia QA aparecer, aguarde e clique em aceitar antes das validações
      cy.get('.modal-footer > .btn', { timeout: 5000 }).click({ force: true })
  })
})