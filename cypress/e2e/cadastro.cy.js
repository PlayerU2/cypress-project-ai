describe('Cadastro de Usuário - Hub de Leitura', () => {

  // Gera um e-mail único para evitar conflito entre execuções
  const emailAleatorio = `usuario_${Date.now()}@teste.com`

  beforeEach(() => {
    cy.visit('http://localhost:3000/register.html')
  })

  it('CT-CAD-001 - Cadastro com dados válidos deve criar conta com sucesso', () => {
    // 1. Preencher nome
    cy.get('input[placeholder="Seu nome completo"]').type('Usuário Teste Automatizado')

    // 2. Preencher e-mail único
    cy.get('input[placeholder="seu@email.com"]').type(emailAleatorio)

    // 3. Preencher senha
    cy.get('input[placeholder="Crie uma senha segura"]').type('Senha@123')

    // 4. Confirmar senha
    cy.get('input[placeholder="Confirme sua senha"]').type('Senha@123')

    // 5. Aceitar os termos de uso
    cy.get('input[type="checkbox"]').check()

    // 6. Submeter o formulário
    cy.contains('button', 'Criar Conta').click()

    // 7. Após cadastro bem-sucedido, deve redirecionar para o dashboard
    cy.url().should('include', 'dashboard')
  })

  it('CT-CAD-002 - Cadastro com e-mail já existente deve exibir mensagem de erro', () => {
    // 1. Preencher nome
    cy.get('input[placeholder="Seu nome completo"]').type('Admin Duplicado')

    // 2. Usar e-mail já cadastrado no sistema
    cy.get('input[placeholder="seu@email.com"]').type('admin@biblioteca.com')

    // 3. Preencher senha
    cy.get('input[placeholder="Crie uma senha segura"]').type('Senha@123')

    // 4. Confirmar senha
    cy.get('input[placeholder="Confirme sua senha"]').type('Senha@123')

    // 5. Aceitar os termos de uso
    cy.get('input[type="checkbox"]').check()

    // 6. Submeter o formulário
    cy.contains('button', 'Criar Conta').click()

    // 7. Deve permanecer na página de cadastro
    cy.url().should('include', 'register')

    // 8. Exibir mensagem de erro genérica retornada pelo sistema
    cy.contains('Erro ao criar conta. Tente novamente.').should('be.visible')
  })

  it('CT-CAD-003 - Cadastro com campos obrigatórios vazios deve impedir envio', () => {
    // 1. Não preencher nenhum campo e tentar submeter
    cy.contains('button', 'Criar Conta').click()

    // 2. Permanecer na página de cadastro
    cy.url().should('include', 'register')

    // 3. Campos com validação HTML5 nativa devem estar inválidos
    cy.get('input:invalid').should('have.length.greaterThan', 0)
  })

})
