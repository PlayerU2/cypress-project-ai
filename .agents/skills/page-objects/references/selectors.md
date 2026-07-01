# Padrões de Seletores — Page Object Model

## Hierarquia obrigatória de seletores

Use sempre o seletor mais alto disponível. Nunca pule níveis sem justificativa explícita.

```
1º  data-testid          → preferência absoluta. Imutável, feito para teste.
2º  aria-label / role    → acessibilidade. Estável e semântico.
3º  id                   → aceitável se não for gerado dinamicamente.
4º  name                 → bom para inputs e formulários.
5º  cy.contains()        → texto visível. Use com cautela — texto muda com i18n.
6º  class CSS            → evitar. Muda com refactor de estilo.
7º  xpath / nth-child    → nunca, exceto último recurso documentado.
```

---

## Como escrever getters no Page Object

Cada elemento da UI é exposto como um **getter** da classe. Getters não executam nenhuma ação — apenas retornam o elemento Cypress para que ações e asserções possam encadear.

```javascript
class LoginPage {
  // ✅ data-testid — preferência absoluta
  get emailInput()    { return cy.get('[data-testid="email-input"]') }
  get senhaInput()    { return cy.get('[data-testid="password-input"]') }
  get btnEntrar()     { return cy.get('[data-testid="login-button"]') }
  get mensagemErro()  { return cy.get('[data-testid="error-message"]') }

  // ✅ aria-label — segunda opção
  get btnFecharModal() { return cy.get('[aria-label="Fechar modal"]') }

  // ✅ id — quando estável e não gerado dinamicamente
  get emailInputLegacy() { return cy.get('#email') }

  // ✅ name — bom para inputs de formulário
  get campoNome() { return cy.get('input[name="nome"]') }

  // ✅ cy.contains() — com cautela, apenas para texto estável
  get linkEsqueceuSenha() { return cy.contains('Esqueceu sua senha?') }

  // ❌ Evitar — classe CSS como único seletor
  // get btnEntrar() { return cy.get('.btn-primary') }

  // ❌ Nunca — seletor posicional para identidade
  // get primeiroItem() { return cy.get('li:nth-child(1)') }
}
```

---

## Seletores compostos (within)

Quando a página tem componentes repetidos (cards, linhas de tabela), use `within()` para escopo:

```javascript
class CatalogoPage {
  get listaLivros()   { return cy.get('[data-testid="livro-card"]') }

  // Para interagir com um livro específico por título:
  getLivroPorTitulo(titulo) {
    return cy.contains('[data-testid="livro-card"]', titulo)
  }

  // Para verificar estrutura do primeiro item (posição irrelevante para o teste):
  get primeiroCard()  { return this.listaLivros.first() }
}
```

---

## Seletores dinâmicos e parametrizados

```javascript
class AdminPage {
  // ✅ Seletor parametrizado por ID de registro
  getLinhaUsuario(userId) {
    return cy.get(`[data-testid="usuario-row-${userId}"]`)
  }

  // ✅ Botão de ação dentro de uma linha específica
  getBtnAcaoUsuario(userId, acao) {
    return cy.get(`[data-testid="usuario-row-${userId}"] [data-testid="btn-${acao}"]`)
  }
}
```

---

## Regras para getters

| Regra | Motivo |
|-------|--------|
| Getters são `get` properties, não métodos `()` | Retornam `cy` command sem executar ação |
| Nunca armazene resultado em variável fora do getter | Cypress não é Promise — não funciona assim |
| Um getter por elemento de UI significativo | Granularidade facilita reutilização |
| Nome em camelCase descrevendo o elemento | `btnSalvar`, `inputCpf`, `mensagemSucesso` |
| Nomes no idioma do domínio (português) | Facilita leitura pelo time de QA e negócio |
