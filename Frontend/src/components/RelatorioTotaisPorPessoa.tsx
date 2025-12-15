import React, { useState, useEffect } from 'react';
import type { RelatorioTotaisPorPessoa } from '../types';
import { getRelatorioTotaisPorPessoa } from '../services/api';

/**
 * Componente responsável por exibir o relatório de totais por pessoa.
 * 
 * Exibe para cada pessoa:
 * - Total de receitas
 * - Total de despesas
 * - Saldo (receitas - despesas)
 * 
 * Ao final, mostra o total geral de todas as pessoas.
 */
const RelatorioTotaisPorPessoa: React.FC = () => {
  const [relatorio, setRelatorio] = useState<RelatorioTotaisPorPessoa | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Carrega o relatório ao montar o componente.
   */
  useEffect(() => {
    loadRelatorio();
  }, []);

  /**
   * Busca o relatório da API.
   */
  const loadRelatorio = async () => {
    try {
      setLoading(true);
      const data = await getRelatorioTotaisPorPessoa();
      setRelatorio(data);
      setError('');
    } catch (err) {
      setError('Erro ao carregar relatório. Verifique se a API está rodando.');
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

  /**
   * Retorna a classe CSS baseada no saldo (positivo ou negativo).
   */
  const getSaldoClass = (saldo: number): string => {
    return saldo >= 0 ? 'valor-positivo' : 'valor-negativo';
  };

  return (
    <div className="card">
      <h2>Relatório de Totais por Pessoa</h2>
      <p style={{ color: '#777', marginBottom: '20px' }}>
        Visualize o total de receitas, despesas e saldo de cada pessoa cadastrada.
      </p>

      {/* Mensagem de erro */}
      {error && <div className="error-message">{error}</div>}

      {/* Loading */}
      {loading && <div className="loading">Carregando relatório...</div>}

      {/* Relatório */}
      {!loading && relatorio && (
        <div className="relatorio-totais">
          {/* Botão para atualizar */}
          <button
            className="btn btn-secondary"
            onClick={loadRelatorio}
            style={{ marginBottom: '20px' }}
          >
            🔄 Atualizar Relatório
          </button>

          {/* Tabela de totais por pessoa */}
          {relatorio.pessoas.length === 0 ? (
            <p>Nenhuma pessoa cadastrada para gerar relatório.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Idade</th>
                    <th>Total Receitas</th>
                    <th>Total Despesas</th>
                    <th>Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {relatorio.pessoas.map((pessoa) => (
                    <tr key={pessoa.pessoaId}>
                      <td>{pessoa.pessoaId}</td>
                      <td>{pessoa.nome}</td>
                      <td>{pessoa.idade}</td>
                      <td className="valor-positivo">{formatarValor(pessoa.totalReceitas)}</td>
                      <td className="valor-negativo">{formatarValor(pessoa.totalDespesas)}</td>
                      <td className={getSaldoClass(pessoa.saldo)}>
                        {formatarValor(pessoa.saldo)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Total Geral */}
          <div className="total-geral">
            <h3>📊 Total Geral</h3>
            <div className="total-row">
              <span>Total de Receitas:</span>
              <span>{formatarValor(relatorio.totalGeral.totalReceitas)}</span>
            </div>
            <div className="total-row">
              <span>Total de Despesas:</span>
              <span>{formatarValor(relatorio.totalGeral.totalDespesas)}</span>
            </div>
            <div className="total-row" style={{ fontSize: '1.3rem', borderTop: '2px solid rgba(255,255,255,0.3)', paddingTop: '10px', marginTop: '10px' }}>
              <span>Saldo Líquido:</span>
              <span style={{ fontWeight: 'bold' }}>
                {formatarValor(relatorio.totalGeral.saldoLiquido)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RelatorioTotaisPorPessoa;
