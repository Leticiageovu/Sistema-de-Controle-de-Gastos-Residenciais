import React, { useState, useEffect } from 'react';
import type { RelatorioTotaisPorCategoria } from '../types';
import { getRelatorioTotaisPorCategoria } from '../services/api';

/**
 * Componente responsável por exibir o relatório de totais por categoria (OPCIONAL).
 * 
 * Exibe para cada categoria:
 * - Total de receitas
 * - Total de despesas
 * - Saldo (receitas - despesas)
 * 
 * Ao final, mostra o total geral de todas as categorias.
 */
const RelatorioTotaisPorCategoria: React.FC = () => {
  const [relatorio, setRelatorio] = useState<RelatorioTotaisPorCategoria | null>(null);
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
      const data = await getRelatorioTotaisPorCategoria();
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
      <h2>Relatório de Totais por Categoria</h2>
      <p style={{ color: '#777', marginBottom: '20px' }}>
        Visualize o total de receitas, despesas e saldo de cada categoria cadastrada.
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

          {/* Tabela de totais por categoria */}
          {relatorio.categorias.length === 0 ? (
            <p>Nenhuma categoria cadastrada para gerar relatório.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Descrição</th>
                    <th>Finalidade</th>
                    <th>Total Receitas</th>
                    <th>Total Despesas</th>
                    <th>Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {relatorio.categorias.map((categoria) => (
                    <tr key={categoria.categoriaId}>
                      <td>{categoria.categoriaId}</td>
                      <td>{categoria.descricao}</td>
                      <td>{getFinalidadeBadge(categoria.finalidade)}</td>
                      <td className="valor-positivo">{formatarValor(categoria.totalReceitas)}</td>
                      <td className="valor-negativo">{formatarValor(categoria.totalDespesas)}</td>
                      <td className={getSaldoClass(categoria.saldo)}>
                        {formatarValor(categoria.saldo)}
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

export default RelatorioTotaisPorCategoria;
