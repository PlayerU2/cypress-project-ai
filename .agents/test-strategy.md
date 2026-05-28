# test-strategy.md
# Estratégia de Testes — Hub de Leitura

> Documento de referência para o QA Agent e para o GitHub Copilot.
> Ao gerar testes, priorize conforme esta estratégia.
> Não teste tudo igualmente — teste o que importa primeiro.

---

## Objetivo

Garantir que as funcionalidades críticas do Hub de Leitura funcionem
corretamente para os dois perfis de usuário (comum e administrador),
com cobertura adequada de cenários positivos, negativos e de segurança.

---

## O que SERÁ testado

### Prioridade Alta — testar sempre (smoke + regressão)
- Login com sucesso — usuário comum e administrador
- Logout e invalidação do token
- Acesso ao catálogo de livros
- Busca de livros por título e autor
- Reserva de livro disponível
- Cancelamento de reserva
- Visualização do histórico de reservas

### Prioridade Média — testar em regressão completa
- Cadastro de novo usuário
- Edição de perfil
- Adição de livro pelo admin
- Edição de livro pelo admin
- Remoção de livro pelo admin
- Gestão de usuários pelo admin
- Atualização de status de reserva pelo admin

### Prioridade Baixa — testar quando houver alteração na área
- Paginação do catálogo
- Ordenação dos resultados de busca
- Visualização detalhada de livro
- Responsividade (mobile/tablet)

---

## O que NÃO será testado

- Testes de performance e carga (escopo da Aula 4 com K6)
- Testes de infraestrutura (não é responsabilidade do QA de aplicação)
- Testes de banco de dados direto (cobertos pelos testes unitários)
- Funcionalidades não documentadas na API

---

## Tipos de teste e quando usar

| Tipo | Ferramenta | Quando rodar |
|------|-----------|--------------|
| Unitário | Jest + Supertest | A cada commit (CI/CD) |
| Integração | Jest + Supertest | A cada PR |
| E2E — smoke | Cypress / Playwright | Pós-deploy em qualquer ambiente |
| E2E — regressão | Cypress / Playwright | Antes de merge na main |
| Acessibilidade | axe-core | A cada sprint |
| Performance | K6 | Antes de releases maiores |

---

## Cobertura mínima esperada

| Métrica | Meta |
|---------|------|
| Cobertura de linhas (Jest) | ≥ 80% |
| Cobertura de branches (Jest) | ≥ 70% |
| Cenários críticos com teste E2E | 100% |
| Testes de acessibilidade sem critical | 100% |

---

## Riscos priorizados por área

### Autenticação — risco ALTO
- Token JWT expirado não invalidado corretamente
- Acesso a rotas protegidas sem token
- Usuário comum acessando rotas de admin
- Exposição de senha em logs ou respostas da API

### Reservas — risco ALTO
- Reserva duplicada para o mesmo livro
- Livro indisponível sendo reservado
- Cancelamento por usuário não autorizado

### Catálogo — risco MÉDIO
- Busca retornando resultados incorretos
- Livro removido ainda aparecendo no catálogo
- Dados inconsistentes entre lista e detalhe

### Admin — risco MÉDIO
- Remoção acidental de livros com reservas ativas
- Edição de usuário sem confirmação
- Acesso ao painel admin por usuário comum

---

## Ordem de execução recomendada

```
1. Testes de autenticação (smoke)
   → login, logout, token inválido

2. Testes de catálogo (smoke)
   → listar, buscar, detalhe

3. Testes de reserva (smoke)
   → criar, visualizar, cancelar

4. Testes de admin (regressão)
   → gestão de livros e usuários

5. Testes de acessibilidade
   → páginas públicas e autenticadas

6. Testes negativos e edge cases
   → campos vazios, dados inválidos, permissões
```

---

## Definition of Ready para QA

Um item está pronto para ser testado quando:
- História de usuário tem critérios de aceitação definidos
- Ambiente de staging está atualizado com a feature
- Dados de teste estão disponíveis (fixtures ou seed)
- API documentada no Swagger está atualizada

## Definition of Done para QA

Um item está concluído em QA quando:
- Todos os cenários críticos passaram
- Bugs encontrados foram registrados e priorizados
- Cobertura de testes atinge a meta da área
- Relatório de execução foi gerado e compartilhado