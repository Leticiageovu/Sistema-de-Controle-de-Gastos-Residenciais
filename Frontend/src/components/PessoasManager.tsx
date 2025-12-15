import React, { useState, useEffect } from 'react';
import { Pessoa } from '../types';
import { getPessoas, createPessoa, deletePessoa } from '../services/api';

/**
 * Componente responsável pelo gerenciamento de pessoas.
 * Funcionalidades: Criar, Listar e Deletar pessoas.
 * 
 * REGRA DE NEGÓCIO: Ao deletar uma pessoa, todas as suas transações são removidas.
 */
const PessoasManager: React.FC = () => {
  // Estados para gerenciar a lista de pessoas e o formulário
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /**
   * Carrega a lista de pessoas ao montar o componente.
   * useEffect é executado na primeira renderização.
   */
  useEffect(() => {
    loadPessoas();
  }, []);

  /**
   * Busca todas as pessoas cadastradas da API.
   */
  const loadPessoas = async () => {
    try {
      setLoading(true);
      const data = await getPessoas();
      setPessoas(data);
      setError('');
    } catch (err) {
      setError('Erro ao carregar pessoas. Verifique se a API está rodando.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Manipula o envio do formulário para criar uma nova pessoa.
   * Valida os campos antes de enviar para a API.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validações no frontend
    if (!nome.trim()) {
      setError('O nome é obrigatório');
      return;
    }

    const idadeNum = parseInt(idade);
    if (isNaN(idadeNum) || idadeNum < 0) {
      setError('A idade deve ser um número positivo');
      return;
    }

    try {
      setLoading(true);
      // Envia a pessoa para a API
      await createPessoa({ nome: nome.trim(), idade: idadeNum });
      
      // Limpa o formulário
      setNome('');
      setIdade('');
      
      // Recarrega a lista de pessoas
      await loadPessoas();
      
      setSuccess('Pessoa cadastrada com sucesso!');
      
      // Remove a mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao cadastrar pessoa');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Deleta uma pessoa pelo ID.
   * IMPORTANTE: Todas as transações da pessoa também serão deletadas.
   */
  const handleDelete = async (id: number, nomePessoa: string) => {
    // Confirmação antes de deletar
    if (!window.confirm(
      `Tem certeza que deseja deletar "${nomePessoa}"?\n\nATENÇÃO: Todas as transações desta pessoa também serão removidas!`
    )) {
      return;
    }

    try {
      setLoading(true);
      await deletePessoa(id);
      
      // Recarrega a lista de pessoas
      await loadPessoas();
      
      setSuccess('Pessoa deletada com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao deletar pessoa');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Gerenciar Pessoas</h2>

      {/* Mensagens de erro e sucesso */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Formulário de cadastro */}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nome">Nome:</label>
          <input
            type="text"
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Digite o nome da pessoa"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="idade">Idade:</label>
          <input
            type="number"
            id="idade"
            value={idade}
            onChange={(e) => setIdade(e.target.value)}
            placeholder="Digite a idade"
            min="0"
            disabled={loading}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Salvando...' : 'Cadastrar Pessoa'}
        </button>
      </form>

      {/* Lista de pessoas */}
      <div className="table-container">
        <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>Pessoas Cadastradas</h3>
        
        {loading && <div className="loading">Carregando...</div>}
        
        {!loading && pessoas.length === 0 && (
          <p>Nenhuma pessoa cadastrada.</p>
        )}

        {!loading && pessoas.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Idade</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pessoas.map((pessoa) => (
                <tr key={pessoa.id}>
                  <td>{pessoa.id}</td>
                  <td>{pessoa.nome}</td>
                  <td>{pessoa.idade} {pessoa.idade < 18 ? '(Menor de idade)' : ''}</td>
                  <td>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(pessoa.id, pessoa.nome)}
                      disabled={loading}
                    >
                      Deletar
                    </button>
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

export default PessoasManager;
