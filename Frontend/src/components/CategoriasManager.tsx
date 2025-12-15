import React, { useState, useEffect } from 'react';
import { Categoria } from '../types';
import { getCategorias, createCategoria } from '../services/api';

/**
 * Componente responsável pelo gerenciamento de categorias.
 * Funcionalidades: Criar e Listar categorias.
 */
const CategoriasManager: React.FC = () => {
  // Estados para gerenciar a lista de categorias e o formulário
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [descricao, setDescricao] = useState('');
  const [finalidade, setFinalidade] = useState<'Despesa' | 'Receita' | 'Ambas'>('Ambas');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /**
   * Carrega a lista de categorias ao montar o componente.
   */
  useEffect(() => {
    loadCategorias();
  }, []);

  /**
   * Busca todas as categorias cadastradas da API.
   */
  const loadCategorias = async () => {
    try {
      setLoading(true);
      const data = await getCategorias();
      setCategorias(data);
      setError('');
    } catch (err) {
      setError('Erro ao carregar categorias. Verifique se a API está rodando.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Manipula o envio do formulário para criar uma nova categoria.
   * Valida os campos antes de enviar para a API.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validação no frontend
    if (!descricao.trim()) {
      setError('A descrição é obrigatória');
      return;
    }

    try {
      setLoading(true);
      // Envia a categoria para a API
      await createCategoria({ descricao: descricao.trim(), finalidade });
      
      // Limpa o formulário
      setDescricao('');
      setFinalidade('Ambas');
      
      // Recarrega a lista de categorias
      await loadCategorias();
      
      setSuccess('Categoria cadastrada com sucesso!');
      
      // Remove a mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao cadastrar categoria');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };



  /**
   * Retorna um badge colorido baseado na finalidade da categoria.
   */
  const getFinalidadeBadge = (finalidade: string) => {
    const colors: { [key: string]: string } = {
      Despesa: '#e74c3c',
      Receita: '#27ae60',
      Ambas: '#3498db',
    };

    return (
      <span
        style={{
          backgroundColor: colors[finalidade] || '#95a5a6',
          color: 'white',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '0.85rem',
          fontWeight: '600',
        }}
      >
        {finalidade}
      </span>
    );
  };

  return (
    <div className="card">
      <h2>Gerenciar Categorias</h2>

      {/* Mensagens de erro e sucesso */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Formulário de cadastro */}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="descricao">Descrição:</label>
          <input
            type="text"
            id="descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Digite a descrição da categoria (ex: Receita: Salário / Despesa: Supermercado / Ambas: Cartão - Compras e Estorno)"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="finalidade">Finalidade:</label>
          <select
            id="finalidade"
            value={finalidade}
            onChange={(e) => setFinalidade(e.target.value as 'Despesa' | 'Receita' | 'Ambas')}
            disabled={loading}
          >
            <option value="Ambas">Ambas (Despesa e Receita)</option>
            <option value="Despesa">Apenas Despesa</option>
            <option value="Receita">Apenas Receita</option>
          </select>
          <small style={{ color: '#777', marginTop: '5px', display: 'block' }}>
            Define se a categoria pode ser usada para despesas, receitas ou ambas.
          </small>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Salvando...' : 'Cadastrar Categoria'}
        </button>
      </form>

      {/* Lista de categorias */}
      <div className="table-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px', marginBottom: '15px' }}>
          <h3 style={{ margin: 0 }}>Categorias Cadastradas</h3>
        </div>
        
        {loading && <div className="loading">Carregando...</div>}
        
        {!loading && categorias.length === 0 && (
          <p>Nenhuma categoria cadastrada.</p>
        )}

        {!loading && categorias.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Descrição</th>
                <th>Finalidade</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((categoria) => (
                <tr key={categoria.id}>
                  <td>{categoria.id}</td>
                  <td>{categoria.descricao}</td>
                  <td>{getFinalidadeBadge(categoria.finalidade)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CategoriasManager;
