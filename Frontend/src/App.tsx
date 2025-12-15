import { useState } from 'react';
import './App.css';
import PessoasManager from './components/PessoasManager';
import CategoriasManager from './components/CategoriasManager';
import TransacoesManager from './components/TransacoesManager';
import RelatorioTotaisPorPessoa from './components/RelatorioTotaisPorPessoa';
import RelatorioTotaisPorCategoria from './components/RelatorioTotaisPorCategoria';

/**
 * Componente principal da aplicação.
 * Gerencia a navegação entre as diferentes funcionalidades do sistema através de abas.
 * 
 * FUNCIONALIDADES:
 * - Gerenciar Pessoas: Criar, Listar e Deletar
 * - Gerenciar Categorias: Criar e Listar
 * - Gerenciar Transações: Criar e Listar
 * - Relatório por Pessoa: Consulta de totais
 * - Relatório por Categoria: Consulta de totais (opcional)
 */
function App() {
  // Estado para controlar qual aba está ativa
  const [abaAtiva, setAbaAtiva] = useState<string>('pessoas');

  /**
   * Renderiza o conteúdo da aba ativa.
   */
  const renderizarConteudo = () => {
    switch (abaAtiva) {
      case 'pessoas':
        return <PessoasManager />;
      case 'categorias':
        return <CategoriasManager />;
      case 'transacoes':
        return <TransacoesManager />;
      case 'relatorio-pessoas':
        return <RelatorioTotaisPorPessoa />;
      case 'relatorio-categorias':
        return <RelatorioTotaisPorCategoria />;
      default:
        return <PessoasManager />;
    }
  };

  return (
    <div className="app">
      {/* Cabeçalho */}
      <header className="header">
        <h1>💰 Sistema de Controle de Gastos Residenciais</h1>
        <p>Gerencie suas finanças de forma simples e eficiente</p>
      </header>

      {/* Navegação por abas */}
      <nav className="tabs">
        <button
          className={`tab-button ${abaAtiva === 'pessoas' ? 'active' : ''}`}
          onClick={() => setAbaAtiva('pessoas')}
        >
          👥 Pessoas
        </button>
        <button
          className={`tab-button ${abaAtiva === 'categorias' ? 'active' : ''}`}
          onClick={() => setAbaAtiva('categorias')}
        >
          📁 Categorias
        </button>
        <button
          className={`tab-button ${abaAtiva === 'transacoes' ? 'active' : ''}`}
          onClick={() => setAbaAtiva('transacoes')}
        >
          💵 Transações
        </button>
        <button
          className={`tab-button ${abaAtiva === 'relatorio-pessoas' ? 'active' : ''}`}
          onClick={() => setAbaAtiva('relatorio-pessoas')}
        >
          📊 Relatório por Pessoa
        </button>
        <button
          className={`tab-button ${abaAtiva === 'relatorio-categorias' ? 'active' : ''}`}
          onClick={() => setAbaAtiva('relatorio-categorias')}
        >
          📈 Relatório por Categoria
        </button>
      </nav>

      {/* Conteúdo da aba ativa */}
      <main>{renderizarConteudo()}</main>

      {/* Rodapé */}
      <footer style={{ textAlign: 'center', marginTop: '40px', color: '#999', fontSize: '0.9rem' }}>
        <p>Sistema de Controle de Gastos Residenciais - 2025</p>
        <p>Backend: C# .NET | Frontend: React TypeScript | Persistência: SQLite</p>
      </footer>
    </div>
  );
}

export default App;
