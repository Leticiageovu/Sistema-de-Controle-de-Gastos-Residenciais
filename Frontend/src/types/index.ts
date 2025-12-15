/**
 * Interface que define a estrutura de uma Pessoa no sistema.
 * Corresponde ao modelo Pessoa do backend.
 */
export interface Pessoa {
  id: number;
  nome: string;
  idade: number;
}

/**
 * Interface que define a estrutura de uma Categoria no sistema.
 * Corresponde ao modelo Categoria do backend.
 */
export interface Categoria {
  id: number;
  descricao: string;
  finalidade: 'Despesa' | 'Receita' | 'Ambas'; // Tipos possíveis de finalidade
}

/**
 * Interface que define a estrutura de uma Transação no sistema.
 * Corresponde ao modelo Transacao do backend.
 */
export interface Transacao {
  id: number;
  descricao: string;
  valor: number;
  tipo: 'Despesa' | 'Receita'; // Tipos possíveis de transação
  categoriaId: number;
  categoria?: Categoria; // Categoria associada (pode vir populada da API)
  pessoaId: number;
  pessoa?: Pessoa; // Pessoa associada (pode vir populada da API)
}

/**
 * Interface para o relatório de totais por pessoa.
 * Contém as informações agregadas de receitas, despesas e saldo.
 */
export interface TotalPorPessoa {
  pessoaId: number;
  nome: string;
  idade: number;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
}

/**
 * Interface para o total geral do relatório.
 * Agrega todas as receitas, despesas e saldo líquido do sistema.
 */
export interface TotalGeral {
  totalReceitas: number;
  totalDespesas: number;
  saldoLiquido: number;
}

/**
 * Interface para o relatório completo de totais por pessoa.
 * Contém a lista de pessoas e o total geral.
 */
export interface RelatorioTotaisPorPessoa {
  pessoas: TotalPorPessoa[];
  totalGeral: TotalGeral;
}

/**
 * Interface para o relatório de totais por categoria.
 * Contém as informações agregadas de receitas, despesas e saldo por categoria.
 */
export interface TotalPorCategoria {
  categoriaId: number;
  descricao: string;
  finalidade: string;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
}

/**
 * Interface para o relatório completo de totais por categoria.
 * Contém a lista de categorias e o total geral.
 */
export interface RelatorioTotaisPorCategoria {
  categorias: TotalPorCategoria[];
  totalGeral: TotalGeral;
}
