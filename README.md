# Sistema de Controle de Gastos Residenciais

Sistema completo para gerenciamento de gastos residenciais, desenvolvido com Web API em C#/.NET e frontend em React com TypeScript.

## 🎯 Funcionalidades

### ✅ Cadastro de Pessoas
- Criar pessoa (Nome, Idade)
- Listar todas as pessoas
- Deletar pessoa (remove todas as transações associadas automaticamente)
- ID gerado automaticamente

### ✅ Cadastro de Categorias
- Criar categoria (Descrição, Finalidade)
- Listar todas as categorias
- Finalidade: Despesa, Receita ou Ambas
- ID gerado automaticamente

### ✅ Cadastro de Transações
- Criar transação (Descrição, Valor, Tipo, Categoria, Pessoa)
- Listar todas as transações
- ID gerado automaticamente
- **Regra de Negócio 1**: Menores de idade (< 18 anos) só podem ter transações do tipo "Despesa"
- **Regra de Negócio 2**: Categoria deve ser compatível com o tipo da transação

### ✅ Relatório de Totais por Pessoa
- Lista todas as pessoas com total de receitas, despesas e saldo
- Exibe total geral ao final (soma de todas as pessoas)

### ✅ Relatório de Totais por Categoria (OPCIONAL)
- Lista todas as categorias com total de receitas, despesas e saldo
- Exibe total geral ao final (soma de todas as categorias)

## 🛠️ Tecnologias Utilizadas

### Backend
- **C# / .NET 8.0**
- **Entity Framework Core** (ORM)
- **SQLite** (Persistência de dados)
- **ASP.NET Core Web API**
- **Swagger** (Documentação da API)

### Frontend
- **React 18**
- **TypeScript**
- **Vite** (Build tool)
- **Axios** (Cliente HTTP)

## 📋 Pré-requisitos

### Para o Backend (.NET)
- .NET SDK 8.0 ou superior
- Instalar: https://dotnet.microsoft.com/download

### Para o Frontend (React)
- Node.js 18 ou superior
- npm ou yarn
- Instalar: https://nodejs.org/

## 🚀 Como Executar

### 1️⃣ Executar o Backend (API)

```bash
# Navegue até a pasta do backend
cd Backend

# Restaure as dependências (caso necessário)
dotnet restore

# Execute a API
dotnet run
```

A API estará disponível em: **http://localhost:5000**
Swagger UI: **http://localhost:5000/swagger**

O banco de dados SQLite será criado automaticamente no arquivo `gastosresidenciais.db` na pasta Backend.

### 2️⃣ Executar o Frontend (React)

```bash
# Navegue até a pasta do frontend
cd Frontend

# Instale as dependências
npm install

# Execute o servidor de desenvolvimento
npm run dev
```

O frontend estará disponível em: **http://localhost:3000**

### 3️⃣ Usando o Sistema

1. Acesse http://localhost:3000 no navegador
2. Cadastre algumas pessoas
3. Cadastre categorias com exemplos como:
   - Receita: Salário, Freelance, Investimentos
   - Despesa: Supermercado, Transporte, Contas
   - Ambas: Cartão (para compras e estornos)
4. Crie transações associando pessoas e categorias
5. Visualize os relatórios nas abas de relatórios

## 📂 Estrutura do Projeto

```
Sistema de Controle de Gastos Residenciais/
│
├── Backend/                                    # API em C# .NET
│   ├── Controllers/                            # Controllers da API
│   │   ├── PessoasController.cs                # Gerenciamento de pessoas
│   │   ├── CategoriasController.cs             # Gerenciamento de categorias
│   │   ├── TransacoesController.cs             # Gerenciamento de transações
│   │   └── RelatoriosController.cs             # Relatórios e consultas
│   ├── Data/                                   # Configuração do banco de dados
│   │   └── AppDbContext.cs                     # Contexto do Entity Framework
│   ├── Models/                                 # Modelos de dados
│   │   ├── Pessoa.cs                           # Modelo Pessoa
│   │   ├── Categoria.cs                        # Modelo Categoria
│   │   └── Transacao.cs                        # Modelo Transacao
│   ├── Properties/
│   │   └── launchSettings.json                 # Configurações de execução
│   ├── Program.cs                              # Ponto de entrada da API
│   ├── appsettings.json                        # Configurações da aplicação
│   ├── GastosResidenciaisAPI.csproj            # Arquivo de projeto .NET
│   └── gastosresidenciais.db                   # Banco de dados SQLite (criado automaticamente)
│
└── Frontend/                                   # Aplicação React
    ├── src/
    │   ├── components/                         # Componentes React
    │   │   ├── PessoasManager.tsx              # Gerenciamento de pessoas
    │   │   ├── CategoriasManager.tsx           # Gerenciamento de categorias
    │   │   ├── TransacoesManager.tsx           # Gerenciamento de transações
    │   │   ├── RelatorioTotaisPorPessoa.tsx    # Relatório por pessoa
    │   │   └── RelatorioTotaisPorCategoria.tsx # Relatório por categoria
    │   ├── services/
    │   │   └── api.ts                          # Cliente da API (Axios)
    │   ├── types/
    │   │   └── index.ts                        # Tipos TypeScript
    │   ├── App.tsx                             # Componente principal
    │   ├── App.css                             # Estilos globais
    │   ├── main.tsx                            # Ponto de entrada React
    │   └── vite-env.d.ts                       # Tipos do Vite
    ├── index.html                              # HTML principal
    ├── package.json                            # Dependências npm
    ├── tsconfig.json                           # Configuração TypeScript
    └── vite.config.ts                          # Configuração Vite
```

## 🔐 Regras de Negócio Implementadas

### 1. Deleção em Cascata
Quando uma pessoa é deletada, todas as suas transações também são removidas automaticamente (configurado no DbContext com `DeleteBehavior.Cascade`).

### 2. Restrição para Menores de Idade
Pessoas com idade menor que 18 anos só podem ter transações do tipo "Despesa". Tentativas de criar transações do tipo "Receita" para menores são bloqueadas com mensagem de erro.

### 3. Compatibilidade Categoria-Transação
A categoria escolhida deve ser compatível com o tipo da transação:
- Transação "Despesa": não pode usar categoria com finalidade exclusiva "Receita"
- Transação "Receita": não pode usar categoria com finalidade exclusiva "Despesa"
- Categorias com finalidade "Ambas" podem ser usadas para qualquer tipo

### 4. Validações de Dados
- Nome e descrição são obrigatórios
- Idade e valor devem ser números positivos
- IDs são gerados automaticamente pelo banco de dados
- Finalidade deve ser: "Despesa", "Receita" ou "Ambas"
- Tipo deve ser: "Despesa" ou "Receita"

## 📊 Persistência de Dados

O sistema utiliza **SQLite** como banco de dados, garantindo que os dados sejam mantidos após reiniciar o sistema. O arquivo do banco de dados (`gastosresidenciais.db`) é criado automaticamente na primeira execução e armazena:
- Tabela `Pessoas`
- Tabela `Categorias`
- Tabela `Transacoes`

## 🎨 Interface do Usuário

A interface foi desenvolvida com foco em:
- **Usabilidade**: Navegação intuitiva por abas
- **Responsividade**: Funciona em diferentes tamanhos de tela
- **Feedback Visual**: Mensagens de erro e sucesso claras
- **Design Moderno**: Cores gradientes e visual limpo
- **Validações**: Feedback imediato sobre erros de entrada

## 📝 Documentação no Código

Todo o código está amplamente documentado com:
- Comentários XML no backend (C#)
- Comentários JSDoc no frontend (TypeScript)
- Explicações sobre lógica de negócio
- Descrição de cada função/método
- Informações sobre parâmetros e retornos

## 🧪 Testando a API

### Via Swagger
Acesse http://localhost:5000/swagger para testar os endpoints diretamente no navegador.

### Via curl (Exemplos)

```bash
# Criar uma pessoa
curl -X POST http://localhost:5000/api/Pessoas \
  -H "Content-Type: application/json" \
  -d '{"nome":"João Silva","idade":25}'

# Listar pessoas
curl http://localhost:5000/api/Pessoas

# Criar uma categoria
curl -X POST http://localhost:5000/api/Categorias \
  -H "Content-Type: application/json" \
  -d '{"descricao":"Supermercado","finalidade":"Despesa"}'

# Criar uma transação
curl -X POST http://localhost:5000/api/Transacoes \
  -H "Content-Type: application/json" \
  -d '{"descricao":"Compra no supermercado","valor":150.50,"tipo":"Despesa","categoriaId":1,"pessoaId":1}'

# Ver relatório por pessoa
curl http://localhost:5000/api/Relatorios/TotaisPorPessoa
```

## 🏗️ Boas Práticas Implementadas

### Backend (.NET)
- ✅ Separação em camadas (Models, Controllers, Data)
- ✅ Uso de DTOs implícitos através dos Models
- ✅ Validações com Data Annotations
- ✅ Tratamento de erros com mensagens amigáveis
- ✅ Configuração de CORS para o frontend
- ✅ Documentação XML nos controllers
- ✅ Relacionamentos e cascade delete configurados no EF Core

### Frontend (React)
- ✅ Componentização clara e reutilizável
- ✅ TypeScript para type-safety
- ✅ Separação de concerns (components, services, types)
- ✅ Estado gerenciado com useState
- ✅ Efeitos colaterais com useEffect
- ✅ Tratamento de erros com try-catch
- ✅ Feedback visual para o usuário
- ✅ Código documentado

## 👨‍💻 Desenvolvedor

Sistema desenvolvido seguindo as especificações do teste técnico com foco em:
- Aderência às regras de negócio
- Qualidade e legibilidade do código
- Boas práticas em .NET e React
- Documentação clara e completa

---

**Observações Importantes:**

1. Certifique-se de que o backend está rodando antes de iniciar o frontend
2. O banco de dados é criado automaticamente na primeira execução
3. A porta padrão do backend é 5000 e do frontend é 3000
4. Se necessário, ajuste a URL da API em `Frontend/src/services/api.ts`
