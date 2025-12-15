# Arquitetura do Sistema de Controle de Gastos Residenciais

## 📐 Visão Geral da Arquitetura

O sistema foi desenvolvido seguindo uma arquitetura de três camadas:

```
┌─────────────────────────────────────────┐
│         Frontend (React + TS)           │
│  - Interface do Usuário                 │
│  - Validações de UI                     │
│  - Comunicação HTTP com API             │
└──────────────┬──────────────────────────┘
               │ HTTP/REST
               │ (JSON)
┌──────────────▼──────────────────────────┐
│      Backend (ASP.NET Core Web API)     │
│  - Controllers (endpoints REST)         │
│  - Validações de Negócio                │
│  - Regras de Negócio                    │
└──────────────┬──────────────────────────┘
               │ Entity Framework Core
               │
┌──────────────▼──────────────────────────┐
│      Banco de Dados (SQLite)            │
│  - Pessoas                              │
│  - Categorias                           │
│  - Transacoes                           │
└─────────────────────────────────────────┘
```

## 🔧 Backend - API .NET

### Estrutura de Pastas

```
Backend/
├── Controllers/          # Endpoints da API
├── Data/                # Configuração do banco de dados
├── Models/              # Entidades do domínio
├── Properties/          # Configurações de launch
├── Program.cs           # Configuração e inicialização
└── appsettings.json     # Configurações da aplicação
```

### Models (Camada de Domínio)

#### Pessoa.cs
```
Propriedades:
- Id: int (auto-increment, chave primária)
- Nome: string (obrigatório, max 200 chars)
- Idade: int (positivo, 0-150)
- Transacoes: ICollection<Transacao> (navegação)

Responsabilidades:
- Representar uma pessoa no sistema
- Validar dados básicos (annotations)
- Relacionamento 1:N com Transacao
```

#### Categoria.cs
```
Propriedades:
- Id: int (auto-increment, chave primária)
- Descricao: string (obrigatório, max 100 chars)
- Finalidade: string (Despesa/Receita/Ambas)
- Transacoes: ICollection<Transacao> (navegação)

Responsabilidades:
- Representar uma categoria de transação
- Definir finalidade (restringe uso)
- Relacionamento 1:N com Transacao
```

#### Transacao.cs
```
Propriedades:
- Id: int (auto-increment, chave primária)
- Descricao: string (obrigatório, max 200 chars)
- Valor: decimal (positivo, 18,2 precision)
- Tipo: string (Despesa/Receita)
- CategoriaId: int (FK para Categoria)
- Categoria: Categoria (navegação)
- PessoaId: int (FK para Pessoa)
- Pessoa: Pessoa (navegação)

Responsabilidades:
- Representar uma transação financeira
- Relacionar pessoa e categoria
- Armazenar valor e tipo
```

### Data (Camada de Acesso a Dados)

#### AppDbContext.cs
```
Responsabilidades:
- Gerenciar conexão com SQLite
- Definir DbSets (Pessoas, Categorias, Transacoes)
- Configurar relacionamentos entre entidades
- Configurar comportamento de deleção (Cascade)

Configurações importantes:
1. Pessoa -> Transacoes: DeleteBehavior.Cascade
   (Ao deletar pessoa, deleta suas transações)

2. Categoria -> Transacoes: DeleteBehavior.Restrict
   (Não permite deletar categoria com transações)

3. Connection String: SQLite em arquivo local
```

### Controllers (Camada de Apresentação/API)

#### PessoasController.cs
```
Endpoints:
- GET /api/Pessoas           → Lista todas as pessoas
- GET /api/Pessoas/{id}      → Busca pessoa por ID
- POST /api/Pessoas          → Cria nova pessoa
- DELETE /api/Pessoas/{id}   → Deleta pessoa (e transações)

Lógica de Negócio:
- Validação de nome (não vazio)
- Validação de idade (positiva)
- Confirmação antes de deletar
- Deleção em cascata de transações
```

#### CategoriasController.cs
```
Endpoints:
- GET /api/Categorias        → Lista todas as categorias
- GET /api/Categorias/{id}   → Busca categoria por ID
- POST /api/Categorias       → Cria nova categoria

Lógica de Negócio:
- Validação de descrição (não vazia)
- Validação de finalidade (Despesa/Receita/Ambas)
- Sem endpoint de deleção (mantém histórico)
```

#### TransacoesController.cs
```
Endpoints:
- GET /api/Transacoes        → Lista todas as transações (com includes)
- GET /api/Transacoes/{id}   → Busca transação por ID
- POST /api/Transacoes       → Cria nova transação

Lógica de Negócio COMPLEXA:
1. Validação de campos obrigatórios
2. Validação de valor positivo
3. Validação de tipo (Despesa/Receita)
4. Verificação de existência da pessoa
5. REGRA: Menor de idade só pode ter Despesa
6. Verificação de existência da categoria
7. REGRA: Categoria deve ser compatível com tipo
   - Despesa não pode usar categoria "Receita"
   - Receita não pode usar categoria "Despesa"
   - "Ambas" pode ser usado para qualquer tipo
8. Carregar entidades relacionadas após criar
```

#### RelatoriosController.cs
```
Endpoints:
- GET /api/Relatorios/TotaisPorPessoa     → Relatório por pessoa
- GET /api/Relatorios/TotaisPorCategoria  → Relatório por categoria

Lógica de Cálculo:
Para cada entidade (pessoa ou categoria):
1. Buscar entidade com transações (Include)
2. Filtrar transações por tipo "Receita"
3. Somar valores das receitas
4. Filtrar transações por tipo "Despesa"
5. Somar valores das despesas
6. Calcular saldo: receitas - despesas
7. Acumular em totais gerais

Retorno:
{
  "pessoas" ou "categorias": [
    {
      "id": ...,
      "nome/descricao": ...,
      "totalReceitas": ...,
      "totalDespesas": ...,
      "saldo": ...
    }
  ],
  "totalGeral": {
    "totalReceitas": ...,
    "totalDespesas": ...,
    "saldoLiquido": ...
  }
}
```

### Program.cs (Configuração)
```
Responsabilidades:
1. Configurar injeção de dependência (AddDbContext)
2. Configurar serialização JSON (ReferenceHandler.IgnoreCycles)
3. Configurar Swagger (documentação)
4. Configurar CORS (permitir frontend)
5. Garantir criação do banco (EnsureCreated)
6. Configurar pipeline HTTP (middleware)
7. Mapear controllers
```

## 🎨 Frontend - React + TypeScript

### Estrutura de Pastas

```
Frontend/src/
├── components/          # Componentes React
├── services/           # Comunicação com API
├── types/              # Tipos TypeScript
├── App.tsx             # Componente raiz
├── App.css             # Estilos globais
└── main.tsx            # Ponto de entrada
```

### Types (Definições TypeScript)

#### index.ts
```
Interfaces definidas:
- Pessoa: corresponde ao modelo C#
- Categoria: corresponde ao modelo C#
- Transacao: corresponde ao modelo C#
- TotalPorPessoa: estrutura do relatório
- TotalPorCategoria: estrutura do relatório
- TotalGeral: totais agregados
- RelatorioTotaisPorPessoa: resposta completa
- RelatorioTotaisPorCategoria: resposta completa

Propósito:
- Type-safety em todo o código
- Autocompletar no VS Code
- Detectar erros em tempo de desenvolvimento
```

### Services (Camada de API)

#### api.ts
```
Configuração:
- URL base: http://localhost:5000/api
- Cliente: Axios
- Headers: Content-Type application/json

Funções implementadas:

Pessoas:
- getPessoas(): Promise<Pessoa[]>
- getPessoaById(id): Promise<Pessoa>
- createPessoa(pessoa): Promise<Pessoa>
- deletePessoa(id): Promise<void>

Categorias:
- getCategorias(): Promise<Categoria[]>
- getCategoriaById(id): Promise<Categoria>
- createCategoria(categoria): Promise<Categoria>
  (Sem função de deleção - categorias são permanentes)

Transacoes:
- getTransacoes(): Promise<Transacao[]>
- getTransacaoById(id): Promise<Transacao>
- createTransacao(transacao): Promise<Transacao>

Relatórios:
- getRelatorioTotaisPorPessoa(): Promise<RelatorioTotaisPorPessoa>
- getRelatorioTotaisPorCategoria(): Promise<RelatorioTotaisPorCategoria>

Tratamento de Erros:
- Try-catch em todos os componentes
- Exibição de mensagens de erro da API
- Feedback visual para o usuário
```

### Components (Interface do Usuário)

#### PessoasManager.tsx
```
Estados:
- pessoas: Pessoa[] (lista de pessoas)
- nome, idade: campos do formulário
- loading, error, success: controle de UI

Lógica:
1. useEffect: carrega pessoas ao montar
2. loadPessoas(): busca da API
3. handleSubmit(): valida e cria pessoa
4. handleDelete(): confirma e deleta pessoa
5. Renderiza: formulário + tabela

Validações Frontend:
- Nome não vazio
- Idade positiva
- Confirmação antes de deletar
```

#### CategoriasManager.tsx
```
Estados:
- categorias: Categoria[]
- descricao, finalidade: formulário
- loading, error, success: UI

Lógica:
1. useEffect: carrega categorias ao montar
2. loadCategorias(): busca da API
3. handleSubmit(): valida e cria categoria
4. getFinalidadeBadge(): badge colorido com cor por finalidade
5. Renderiza: formulário + tabela simples

Validações Frontend:
- Descrição não vazia
- Finalidade selecionada (Despesa/Receita/Ambas)

Observação:
- Não possui função de exclusão (mantém histórico)
- Exemplo no placeholder mostra uso para Receita, Despesa e Ambas
```

#### TransacoesManager.tsx
```
Estados:
- transacoes, pessoas, categorias: dados
- descricao, valor, tipo, pessoaId, categoriaId: formulário
- loading, error, success: UI

Lógica COMPLEXA:
1. useEffect: carrega todos os dados ao montar
2. loadData(): busca transações, pessoas e categorias
3. getCategoriasCompativeis(): filtra categorias por tipo
   - Se tipo = Despesa: mostra "Despesa" e "Ambas"
   - Se tipo = Receita: mostra "Receita" e "Ambas"
4. getPessoaSelecionada(): verifica idade
5. handleSubmit(): valida e cria transação
   - Verifica menor de idade
   - Valida campos obrigatórios
6. formatarValor(): formata moeda BRL
7. Renderiza: formulário + tabela

Validações Frontend:
- Pessoa selecionada
- Categoria selecionada
- Descrição não vazia
- Valor positivo
- Menor de idade + Receita = bloqueio
```

#### RelatorioTotaisPorPessoa.tsx
```
Estados:
- relatorio: RelatorioTotaisPorPessoa | null
- loading, error: UI

Lógica:
1. useEffect: carrega relatório ao montar
2. loadRelatorio(): busca da API
3. formatarValor(): formata moeda BRL
4. getSaldoClass(): verde (positivo) ou vermelho (negativo)
5. Renderiza: tabela + total geral destacado

Features:
- Botão de atualizar
- Cores para valores positivos/negativos
- Total geral em destaque com gradiente
```

#### RelatorioTotaisPorCategoria.tsx
```
Estados:
- relatorio: RelatorioTotaisPorCategoria | null
- loading, error: UI

Lógica:
1. useEffect: carrega relatório ao montar
2. loadRelatorio(): busca da API
3. formatarValor(): formata moeda BRL
4. getSaldoClass(): verde ou vermelho
5. getFinalidadeBadge(): badge colorido
6. Renderiza: tabela + total geral

Similar ao relatório por pessoa, mas com finalidade
```

#### App.tsx
```
Estados:
- abaAtiva: string (controle de navegação)

Lógica:
1. renderizarConteudo(): switch para renderizar componente correto
2. Renderiza: header + tabs + conteúdo + footer

Navegação:
- pessoas: PessoasManager
- categorias: CategoriasManager
- transacoes: TransacoesManager
- relatorio-pessoas: RelatorioTotaisPorPessoa
- relatorio-categorias: RelatorioTotaisPorCategoria
```

### Estilos (App.css)

```
Design System:
- Cores principais: #667eea (azul), #764ba2 (roxo)
- Gradientes: linear-gradient(135deg, ...)
- Espaçamentos consistentes: 12px, 20px, 30px
- Border-radius: 6px-10px
- Box-shadows suaves
- Transições em hover

Componentes estilizados:
- .header: cabeçalho com gradiente
- .tabs: navegação por abas
- .card: container de conteúdo
- .form-group: campos de formulário
- .btn: botões com variações (primary, danger, secondary)
- .table-container: tabelas responsivas
- .error-message / .success-message: feedback
- .total-geral: destaque para totais
- .valor-positivo / .valor-negativo: cores de valores

Responsividade:
- @media (max-width: 768px)
- Ajustes para mobile
```

## 🔄 Fluxo de Dados

### Criação de Transação (Exemplo Completo)

```
1. USUÁRIO: Preenche formulário de transação
   ↓
2. FRONTEND: Valida campos no handleSubmit
   - Descrição não vazia?
   - Valor positivo?
   - Pessoa selecionada?
   - Categoria selecionada?
   - Menor de idade + Receita? → ERRO
   ↓
3. FRONTEND: Chama api.createTransacao()
   ↓
4. AXIOS: POST http://localhost:5000/api/Transacoes
   Body: { descricao, valor, tipo, categoriaId, pessoaId }
   ↓
5. BACKEND: TransacoesController.PostTransacao()
   - Valida descrição não vazia
   - Valida valor positivo
   - Valida tipo (Despesa/Receita)
   - Busca pessoa no banco
   - Verifica menor de idade + Receita → ERRO 400
   - Busca categoria no banco
   - Verifica compatibilidade categoria/tipo → ERRO 400
   - Adiciona transação ao DbContext
   - SaveChangesAsync()
   - Carrega entidades relacionadas
   ↓
6. ENTITY FRAMEWORK: INSERT INTO Transacoes
   ↓
7. SQLITE: Persiste dados em gastosresidenciais.db
   ↓
8. BACKEND: Retorna 201 Created + transação com ID
   ↓
9. FRONTEND: Recebe resposta
   - Limpa formulário
   - Recarrega lista de transações
   - Exibe mensagem de sucesso
   ↓
10. USUÁRIO: Vê transação na tabela
```

### Deleção de Pessoa (Cascade)

```
1. USUÁRIO: Clica em "Deletar" na pessoa
   ↓
2. FRONTEND: Exibe confirmação
   "Tem certeza? Todas as transações serão removidas!"
   ↓
3. USUÁRIO: Confirma
   ↓
4. FRONTEND: Chama api.deletePessoa(id)
   ↓
5. AXIOS: DELETE http://localhost:5000/api/Pessoas/{id}
   ↓
6. BACKEND: PessoasController.DeletePessoa()
   - Busca pessoa no banco
   - Remove pessoa do DbContext
   - SaveChangesAsync()
   ↓
7. ENTITY FRAMEWORK: DELETE FROM Pessoas WHERE Id = ...
   ↓
8. SQLITE: Trigger CASCADE DELETE
   - DELETE FROM Transacoes WHERE PessoaId = ...
   ↓
9. BACKEND: Retorna 200 OK + mensagem
   ↓
10. FRONTEND: Recarrega lista + mensagem de sucesso
```

## 🔒 Segurança e Validações

### Validações em Múltiplas Camadas

```
┌─────────────────────────────────────────┐
│  Frontend (TypeScript)                  │
│  - Validação de UI (campos vazios)     │
│  - Type checking (TypeScript)          │
│  - Mensagens amigáveis                 │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Backend (C#)                           │
│  - Data Annotations ([Required], etc)  │
│  - Validações de negócio               │
│  - Verificações no banco               │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Banco de Dados (SQLite)                │
│  - Constraints (NOT NULL, FK)          │
│  - Integridade referencial             │
└─────────────────────────────────────────┘
```

## 📊 Persistência e Relacionamentos

### Diagrama de Entidades

```
┌─────────────────┐
│     Pessoa      │
├─────────────────┤
│ • Id (PK)       │
│ • Nome          │
│ • Idade         │
└────────┬────────┘
         │ 1
         │
         │ N
┌────────▼────────┐       N  ┌─────────────────┐
│   Transacao     ├──────────┤   Categoria     │
├─────────────────┤     1    ├─────────────────┤
│ • Id (PK)       │          │ • Id (PK)       │
│ • Descricao     │          │ • Descricao     │
│ • Valor         │          │ • Finalidade    │
│ • Tipo          │          └─────────────────┘
│ • PessoaId (FK) │
│ • CategoriaId (FK)│
└─────────────────┘

Relacionamentos:
- Pessoa 1:N Transacao (Cascade Delete)
- Categoria 1:N Transacao (Restrict Delete)
```

## 🧪 Pontos de Teste

### Casos de Teste Importantes

1. **Menor de Idade + Receita**
   - Criar pessoa com idade < 18
   - Tentar criar transação tipo "Receita"
   - Esperado: Erro 400 com mensagem

2. **Categoria Incompatível**
   - Criar categoria com finalidade "Despesa"
   - Tentar criar transação tipo "Receita" com essa categoria
   - Esperado: Erro 400 com mensagem

3. **Deleção em Cascata**
   - Criar pessoa
   - Criar transações para essa pessoa
   - Deletar pessoa
   - Verificar que transações foram removidas

4. **Relatórios**
   - Criar pessoas com transações
   - Verificar cálculos de totais
   - Verificar saldo (receitas - despesas)
   - Verificar total geral

## 🚀 Performance e Otimizações

### Otimizações Implementadas

1. **Eager Loading**
   ```csharp
   .Include(t => t.Pessoa)
   .Include(t => t.Categoria)
   ```
   - Evita N+1 queries
   - Uma query para buscar tudo

2. **Async/Await**
   - Todos os métodos são assíncronos
   - Não bloqueia threads
   - Melhor escalabilidade

3. **React Optimization**
   - useEffect com array de dependências
   - Evita re-renders desnecessários
   - Loading states para UX

## 📈 Possíveis Melhorias Futuras

1. **Backend**
   - Implementar Repository Pattern
   - Adicionar DTOs (separar Models de ViewModels)
   - Implementar paginação
   - Adicionar filtros e ordenação
   - Implementar logging (Serilog)
   - Adicionar autenticação/autorização
   - Unit tests com xUnit
   - Migrations ao invés de EnsureCreated

2. **Frontend**
   - Adicionar Context API ou Redux
   - Implementar React Query para cache
   - Adicionar testes (Jest, React Testing Library)
   - Melhorar responsividade
   - Adicionar gráficos (Chart.js)
   - Implementar filtros nas tabelas
   - Adicionar paginação
   - Dark mode

3. **Geral**
   - Containerização (Docker)
   - CI/CD pipeline
   - Deploy em nuvem
   - Monitoramento e métricas
   - Backup automatizado do banco
