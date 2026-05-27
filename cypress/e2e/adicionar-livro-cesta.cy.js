// Teste E2E: Adicionar livro à cesta
// Fluxos positivos e negativos

describe('Adicionar livro à cesta', () => {
  beforeEach(() => {
    // Login como usuário comum
    cy.visit('http://localhost:3000/login.html');
    cy.get('#email').type('usuario@teste.com');
    cy.get('#password').type('user123');
    cy.get('#login-btn').click();
    // Não faz assert de dashboard, pois o fluxo é direto para catálogo
  });

  // Fluxo positivo 1: Adicionar livro disponível à cesta
  it('deve adicionar um livro disponível à cesta com sucesso', () => {
    cy.visit('http://localhost:3000/catalog.html');
    // Adiciona o primeiro livro disponível à cesta
    cy.get('.card').first().within(() => {
      cy.get('button.add-to-cart').click();
    });
    // Vai para a cesta
    cy.visit('http://localhost:3000/basket.html');
    // Valida que o livro está na cesta (pelo menos um card de livro)
    cy.get('.card').should('exist');
    cy.get('#cart-summary > :nth-child(1) > strong').should('contain', '1');
  });

  // Fluxo positivo 2: Adicionar múltiplos livros diferentes à cesta
  it('deve permitir adicionar múltiplos livros diferentes à cesta', () => {
    // Vai para o catálogo
    cy.visit('http://localhost:3000/catalog.html');
    cy.get('.card').eq(0).within(() => {
      cy.get('button.add-to-cart').click();
    });
    cy.get('.card').eq(1).within(() => {
      cy.get('button.add-to-cart').click();
    });
    // Vai para a cesta
    cy.visit('http://localhost:3000/basket.html');
    // Valida que há pelo menos dois livros na cesta
    cy.get('.card').should('have.length.at.least', 2);
  });

  // Fluxo negativo 1: Tentar finalizar reserva sem estar logado
  it('não deve permitir finalizar reserva sem estar logado', () => {
    // Sai da sessão (limpa cookies/localStorage)
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('http://localhost:3000/catalog.html');
    cy.get('.card').first().within(() => {
      cy.get('button.add-to-cart').click();
    });
    // Vai para a cesta
    cy.visit('http://localhost:3000/basket.html');
    cy.get('#checkout-btn').click();
    // Deve ser direcionado para checkout.html e aparecer mensagem de autenticação
    cy.url().should('include', '/checkout.html');
    cy.contains('Autenticação Necessária').should('exist');
  });

  // Fluxo negativo 2: Tentar adicionar o mesmo livro duas vezes
  it('não deve permitir adicionar o mesmo livro duas vezes à cesta', () => {
    cy.visit('http://localhost:3000/catalog.html');
    cy.get('.card').first().within(() => {
      cy.get('button.add-to-cart').click();
      // Aguarda o botão ser habilitado novamente antes de clicar de novo
      cy.get('button.add-to-cart').should('not.be.disabled');
      cy.get('button.add-to-cart').click();
    });
    cy.get('#global-alert-container').should('contain', 'já está na sua cesta!');
  });
});
