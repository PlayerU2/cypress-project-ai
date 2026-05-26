# RAG: Hub de Leitura - Sistema de Biblioteca para QA

## Visão Geral
O Hub de Leitura é um sistema educacional completo para aprendizado e prática de Quality Assurance (QA), simulando cenários reais de uma biblioteca digital. Ele oferece funcionalidades de gestão de usuários, catálogo de livros, reservas, painel administrativo e autenticação JWT, sendo ideal para estudos de automação, testes manuais e APIs.

---

## Objetivos do Sistema
- Ensinar e praticar QA com um sistema realista
- Proporcionar cenários de testes funcionais, de API e E2E
- Simular perfis de usuário (comum e administrador)
- Expor falhas e comportamentos reais de sistemas

---

## Funcionalidades Principais
### Gestão de Usuários
- Cadastro, login e atualização de perfil
- Perfis: Usuário comum e Administrador
- Autenticação JWT com expiração
- Recuperação de senha e validação de email

### Catálogo de Livros
- Listagem, busca e filtros
- CRUD completo (admin)
- Controle de estoque e upload de capas

### Reservas
- Reserva de livros disponíveis
- Controle de prazos, retiradas e devoluções
- Histórico e alertas de atraso

### Painel Administrativo
- Dashboard com estatísticas
- Gestão de reservas e usuários
- Relatórios, exportações e logs

---

## Tecnologias Utilizadas
- Node.js, Express.js, SQLite
- JWT para autenticação
- Bootstrap 5, HTML5/CSS3, JavaScript ES6+
- Documentação Swagger para API

---

## Instalação e Execução
1. Clone o repositório e acesse a pasta:
   ```bash
git clone https://github.com/fabioaraujoqa/hub-de-leitura.git
cd hub-de-leitura
```
2. Instale as dependências:
   ```bash
npm install
```
3. Inicie o servidor:
   ```bash
npm start
```
4. Acesse:
   - Sistema: http://localhost:3000
   - API Docs: http://localhost:3000/api-docs
   - Admin: http://localhost:3000/admin-dashboard.html

---

## Credenciais de Teste
- **Administrador:**
  - Email: admin@biblioteca.com
  - Senha: admin123
- **Usuário comum:**
  - Email: usuario@teste.com
  - Senha: user123

---

## Testando a API
- Use cURL, Postman ou Insomnia
- Documentação Swagger disponível em /api-docs
- Exemplo de login via cURL:
  ```bash
  curl -X POST http://localhost:3000/api/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@biblioteca.com","password":"admin123"}'
  ```

---

## Dicas e Problemas Comuns
- Para resetar o banco: delete o arquivo database/biblioteca.db e rode `npm run db`
- Se a porta 3000 estiver ocupada, use `lsof -ti:3000` e `kill -9 PID`
- Tokens expiram em 1 hora

---

## Permissões de Uso
- Uso educacional e acadêmico permitido
- Proibido uso comercial direto e redistribuição sem créditos

---

## Contato e Contribuição
- Desenvolvido por Fábio Araújo
- GitHub: https://github.com/fabioaraujoqa
- LinkedIn: https://www.linkedin.com/in/fabio10/

---

> “A qualidade nunca é um acidente; ela é sempre o resultado de um esforço inteligente.” – John Ruskin
