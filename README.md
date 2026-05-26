# cypress-project-ai

Projeto de automação de testes E2E para o sistema **Hub de Leitura**, uma biblioteca digital educacional para prática de QA. Os testes são escritos com **Cypress** e cobrem os principais fluxos da aplicação, como autenticação e cadastro de usuários.

---

## 🖥️ Aplicação sob teste

**Hub de Leitura** — sistema fictício de treinamento para QA, desenvolvido por [Fábio Araújo](https://github.com/fabioaraujoqa).

- Repositório da aplicação: https://github.com/fabioaraujoqa/hub-de-leitura
- URL local: `http://localhost:3000`
- Documentação da API: `http://localhost:3000/api-docs`
- Painel admin: `http://localhost:3000/admin-dashboard.html`

> A aplicação precisa estar rodando localmente antes de executar os testes.

---

## 📋 Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- [npm](https://www.npmjs.com/) v9 ou superior
- Hub de Leitura em execução em `http://localhost:3000`

---

## 📦 Instalação

Clone o repositório e instale as dependências:

```bash
git clone https://github.com/fabioaraujoqa/cypress-project-ai.git
cd cypress-project-ai
npm install
```

### Dependências

| Pacote    | Versão   | Descrição                        |
|-----------|----------|----------------------------------|
| `cypress` | `^15.15` | Framework de testes E2E          |

---

## 🚀 Como executar

### Interface gráfica (recomendado)

Abre o Cypress Test Runner para execução interativa:

```bash
npx cypress open
```

### Modo headless (CI/CD)

Executa todos os testes no terminal, sem abrir o navegador:

```bash
npx cypress run
```

### Executar um arquivo específico

```bash
npx cypress run --spec "cypress/e2e/cadastro.cy.js"
```

---

## 🗂️ Estrutura do projeto

```
cypress-project-ai/
├── cypress/
│   ├── e2e/
│   │   ├── login.cy.js       # Testes de autenticação
│   │   └── cadastro.cy.js    # Testes de cadastro de usuário
│   ├── fixtures/
│   │   └── example.json      # Dados de apoio aos testes
│   └── support/
│       ├── commands.js       # Comandos customizados do Cypress
│       └── e2e.js            # Configurações globais de suporte
├── docs/
│   ├── hub-de-leitura.md     # Documentação da aplicação
│   └── rag-hub-de-leitura.md # Base de conhecimento para QA
├── cypress.config.js         # Configuração do Cypress
└── package.json
```

---

## 🧪 Casos de teste

### Login (`login.cy.js`)

| ID            | Tipo     | Descrição                                          |
|---------------|----------|----------------------------------------------------|
| CT-LOGIN-001  | Positivo | Login com credenciais válidas de administrador     |

### Cadastro (`cadastro.cy.js`)

| ID          | Tipo     | Descrição                                                  |
|-------------|----------|------------------------------------------------------------|
| CT-CAD-001  | Positivo | Cadastro com dados válidos — redireciona para o dashboard  |
| CT-CAD-002  | Negativo | Cadastro com e-mail já existente — exibe mensagem de erro  |
| CT-CAD-003  | Negativo | Campos obrigatórios vazios — impede envio do formulário    |

---

## 🔑 Credenciais de teste

| Perfil        | E-mail                   | Senha      |
|---------------|--------------------------|------------|
| Administrador | admin@biblioteca.com     | admin123   |
| Usuário comum | usuario@teste.com        | user123    |

---

## 📄 Licença

Uso educacional e acadêmico. Desenvolvido por [Fábio Araújo](https://github.com/fabioaraujoqa).