import React, { useState, useEffect } from 'react';
import { Transacao, Pessoa, Categoria } from '../types';
import { getTransacoes, createTransacao, getPessoas, getCategorias } from '../services/api';

/**
 * Componente responsável pelo gerenciamento de transações.
 * Funcionalidades: Criar e Listar transações.
 * 
 * REGRAS DE NEGÓCIO IMPLEMENTADAS:
 * 1. Menores de idade (menor de 18 anos) só podem registrar despesas
 * 2. A categoria deve ser compatível com o tipo da transação
 */
const TransacoesManager: React.FC = () => {
  // Estados para gerenciar transações, pessoas e categorias
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  
  // Estados do formulário
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState<'Despesa' | 'Receita'>('Despesa');
  const [pessoaId, setPessoaId] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /**
   * Carrega dados necessários ao montar o componente.
   */
  useEffect(() => {
    loadData();
  }, []);

  /**
   * Carrega transações, pessoas e categorias da API.
   */
  const loadData = async () => {
    try {
      setLoading(true);
      const [transacoesData, pessoasData, categoriasData] = await Promise.all([
        getTransacoes(),
        getPessoas(),
        getCategorias(),
      ]);
      
      setTransacoes(transacoesData);
      setPessoas(pessoasData);
      setCategorias(categoriasData);
      setError('');
    } catch (err) {
      setError('Erro ao carregar dados. Verifique se a API está rodando.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filtra categorias compatíveis com o tipo de transação selecionado.
   * - Se tipo é "Despesa": mostra categorias "Despesa" e "Ambas"
   * - Se tipo é "Receita": mostra categorias "Receita" e "Ambas"
   */
  const getCategoriasCompativeis = (): Categoria[] => {
    return categorias.filter((cat) => {
      if (cat.finalidade === 'Ambas') return true;
      return cat.finalidade === tipo;
    });
  };

  /**
   * Verifica se a pessoa selecionada é menor de idade.
   */
  const getPessoaSelecionada = (): Pessoa | undefined => {
    return pessoas.find((p) => p.id === parseInt(pessoaId));
  };

  /**
   * Manipula o envio do formulário para criar uma nova transação.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validações no frontend
    if (!descricao.trim()) {
      setError('A descrição é obrigatória');
      return;
    }

    const valorNum = parseFloat(valor);
    if (isNaN(valorNum) || valorNum <= 0) {
      setError('O valor deve ser um número positivo');
      return;
    }

    if (!pessoaId) {
      setError('Selecione uma pessoa');
      return;
    }

    if (!categoriaId) {
      setError('Selecione uma categoria');
      return;
    }

    // Validação: Menor de idade só pode ter despesa
    const pessoa = getPessoaSelecionada();
    if (pessoa && pessoa.idade < 18 && tipo === 'Receita') {
      setError('Menores de idade (menor de 18 anos) só podem registrar despesas');
      return;
    }

    try {
      setLoading(true);
      
      // Envia a transação para a API
      await createTransacao({
        descricao: descricao.trim(),
        valor: valorNum,
        tipo,
        pessoaId: parseInt(pessoaId),
        categoriaId: parseInt(categoriaId),
      });
      
      // Limpa o formulário
      setDescricao('');
      setValor('');
      setTipo('Despesa');
      setPessoaId('');
      setCategoriaId('');
      
      // Recarrega os dados
      await loadData();
      
      setSuccess('Transação cadastrada com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao cadastrar transação');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Formata um valor monetário para exibição.
   */
  const formatarValor = (valor: number): string => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="card">
      <h2>Gerenciar Transações</h2>

      {/* Mensagens de erro e sucesso */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Formulário de cadastro */}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="pessoa">Pessoa:</label>
          <select
            id="pessoa"
            value={pessoaId}
            onChange={(e) => setPessoaId(e.target.value)}
            disabled={loading}
          >
            <option value="">Selecione uma pessoa</option>
            {pessoas.map((pessoa) => (
              <option key={pessoa.id} value={pessoa.id}>
                {pessoa.nome} ({pessoa.idade} anos)
                {pessoa.idade < 18 ? ' - Menor de idade' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="tipo">Tipo:</label>
          <select
            id="tipo"
            value={tipo}
            onChange={(e) => {
              setTipo(e.target.value as 'Despesa' | 'Receita');
              setCategoriaId(''); // Limpa categoria ao mudar tipo
            }}
            disabled={loading}
          >
            <option value="Despesa">Despesa</option>
            <option value="Receita">Receita</option>
          </select>
          {getPessoaSelecionada() && getPessoaSelecionada()!.idade < 18 && tipo === 'Receita' && (
            <small style={{ color: '#e74c3c', marginTop: '5px', display: 'block' }}>
              ⚠️ Menores de idade só podem registrar despesas
            </small>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="categoria">Categoria:</label>
          <select
            id="categoria"
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            disabled={loading}
          >
            <option value="">Selecione uma categoria</option>
            {getCategoriasCompativeis().map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.descricao} ({categoria.finalidade})
              </option>
            ))}
          </select>
          <small style={{ color: '#777', marginTop: '5px', display: 'block' }}>
            Mostrando apenas categorias compatíveis com o tipo selecionado
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="descricao">Descrição:</label>
          <input
            type="text"
            id="descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Digite a descrição da transação"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="valor">Valor (R$):</label>
          <input
            type="number"
            id="valor"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0.01"
            disabled={loading}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Salvando...' : 'Cadastrar Transação'}
        </button>
      </form>

      {/* Lista de transações */}
      <div className="table-container">
        <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>Transações Cadastradas</h3>
        
        {loading && <div className="loading">Carregando...</div>}
        
        {!loading && transacoes.length === 0 && (
          <p>Nenhuma transação cadastrada.</p>
        )}

        {!loading && transacoes.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Pessoa</th>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Tipo</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {transacoes.map((transacao) => (
                <tr key={transacao.id}>
                  <td>{transacao.id}</td>
                  <td>{transacao.pessoa?.nome}</td>
                  <td>{transacao.descricao}</td>
                  <td>{transacao.categoria?.descricao}</td>
                  <td>
                    <span
                      style={{
                        color: transacao.tipo === 'Receita' ? '#27ae60' : '#e74c3c',
                        fontWeight: '600',
                      }}
                    >
                      {transacao.tipo}
                    </span>
                  </td>
                  <td
                    className={
                      transacao.tipo === 'Receita' ? 'valor-positivo' : 'valor-negativo'
                    }
                  >
                    {formatarValor(transacao.valor)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TransacoesManager;
