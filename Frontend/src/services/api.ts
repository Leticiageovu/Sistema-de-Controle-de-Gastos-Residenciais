import axios from 'axios';
import {
  Pessoa,
  Categoria,
  Transacao,
  RelatorioTotaisPorPessoa,
  RelatorioTotaisPorCategoria,
} from '../types';

/**
 * URL base da API backend.
 * Configure conforme o endereço do seu servidor backend.
 */
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Cria uma instância do axios com configurações padrão.
 * Facilita a comunicação com a API backend.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== SERVIÇOS DE PESSOA ====================

/**
 * Busca todas as pessoas cadastradas no sistema.
 * @returns Promise com array de pessoas
 */
export const getPessoas = async (): Promise<Pessoa[]> => {
  const response = await api.get<Pessoa[]>('/Pessoas');
  return response.data;
};

/**
 * Busca uma pessoa específica por ID.
 * @param id - ID da pessoa
 * @returns Promise com os dados da pessoa
 */
export const getPessoaById = async (id: number): Promise<Pessoa> => {
  const response = await api.get<Pessoa>(`/Pessoas/${id}`);
  return response.data;
};

/**
 * Cria uma nova pessoa no sistema.
 * @param pessoa - Dados da pessoa (sem ID, será gerado automaticamente)
 * @returns Promise com a pessoa criada (incluindo ID gerado)
 */
export const createPessoa = async (pessoa: Omit<Pessoa, 'id'>): Promise<Pessoa> => {
  const response = await api.post<Pessoa>('/Pessoas', pessoa);
  return response.data;
};

/**
 * Deleta uma pessoa do sistema.
 * IMPORTANTE: Todas as transações associadas a esta pessoa também serão deletadas.
 * @param id - ID da pessoa a ser deletada
 * @returns Promise com confirmação da operação
 */
export const deletePessoa = async (id: number): Promise<void> => {
  await api.delete(`/Pessoas/${id}`);
};

// ==================== SERVIÇOS DE CATEGORIA ====================

/**
 * Busca todas as categorias cadastradas no sistema.
 * @returns Promise com array de categorias
 */
export const getCategorias = async (): Promise<Categoria[]> => {
  const response = await api.get<Categoria[]>('/Categorias');
  return response.data;
};

/**
 * Busca uma categoria específica por ID.
 * @param id - ID da categoria
 * @returns Promise com os dados da categoria
 */
export const getCategoriaById = async (id: number): Promise<Categoria> => {
  const response = await api.get<Categoria>(`/Categorias/${id}`);
  return response.data;
};

/**
 * Cria uma nova categoria no sistema.
 * @param categoria - Dados da categoria (sem ID, será gerado automaticamente)
 * @returns Promise com a categoria criada (incluindo ID gerado)
 */
export const createCategoria = async (
  categoria: Omit<Categoria, 'id'>
): Promise<Categoria> => {
  const response = await api.post<Categoria>('/Categorias', categoria);
  return response.data;
};

// ==================== SERVIÇOS DE TRANSAÇÃO ====================

/**
 * Busca todas as transações cadastradas no sistema.
 * As transações virão com as entidades relacionadas (Pessoa e Categoria).
 * @returns Promise com array de transações
 */
export const getTransacoes = async (): Promise<Transacao[]> => {
  const response = await api.get<Transacao[]>('/Transacoes');
  return response.data;
};

/**
 * Busca uma transação específica por ID.
 * @param id - ID da transação
 * @returns Promise com os dados da transação
 */
export const getTransacaoById = async (id: number): Promise<Transacao> => {
  const response = await api.get<Transacao>(`/Transacoes/${id}`);
  return response.data;
};

/**
 * Cria uma nova transação no sistema.
 * 
 * REGRAS DE NEGÓCIO VALIDADAS PELO BACKEND:
 * 1. Menores de idade (menor de 18 anos) só podem ter transações do tipo "Despesa"
 * 2. A categoria deve ser compatível com o tipo da transação:
 *    - Tipo "Despesa": categoria não pode ter finalidade exclusiva "Receita"
 *    - Tipo "Receita": categoria não pode ter finalidade exclusiva "Despesa"
 * 
 * @param transacao - Dados da transação (sem ID, será gerado automaticamente)
 * @returns Promise com a transação criada (incluindo ID gerado)
 */
export const createTransacao = async (
  transacao: Omit<Transacao, 'id' | 'pessoa' | 'categoria'>
): Promise<Transacao> => {
  const response = await api.post<Transacao>('/Transacoes', transacao);
  return response.data;
};

// ==================== SERVIÇOS DE RELATÓRIOS ====================

/**
 * Busca o relatório de totais por pessoa.
 * 
 * Para cada pessoa, retorna:
 * - Total de receitas
 * - Total de despesas
 * - Saldo (receitas - despesas)
 * 
 * Também retorna o total geral de todas as pessoas.
 * 
 * @returns Promise com o relatório completo
 */
export const getRelatorioTotaisPorPessoa = async (): Promise<RelatorioTotaisPorPessoa> => {
  const response = await api.get<RelatorioTotaisPorPessoa>('/Relatorios/TotaisPorPessoa');
  return response.data;
};

/**
 * Busca o relatório de totais por categoria.
 * 
 * Para cada categoria, retorna:
 * - Total de receitas
 * - Total de despesas
 * - Saldo (receitas - despesas)
 * 
 * Também retorna o total geral de todas as categorias.
 * 
 * @returns Promise com o relatório completo
 */
export const getRelatorioTotaisPorCategoria = async (): Promise<RelatorioTotaisPorCategoria> => {
  const response = await api.get<RelatorioTotaisPorCategoria>('/Relatorios/TotaisPorCategoria');
  return response.data;
};
