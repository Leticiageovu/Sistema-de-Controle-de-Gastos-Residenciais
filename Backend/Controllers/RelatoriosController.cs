using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GastosResidenciaisAPI.Data;

namespace GastosResidenciaisAPI.Controllers
{
    /// <summary>
    /// Controller responsável por gerar relatórios e consultas de totais.
    /// Implementa relatórios por pessoa e por categoria.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class RelatoriosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RelatoriosController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Gera relatório de totais por pessoa.
        /// GET: api/Relatorios/TotaisPorPessoa
        /// 
        /// Para cada pessoa cadastrada, calcula:
        /// - Total de receitas
        /// - Total de despesas
        /// - Saldo (receitas - despesas)
        /// 
        /// Ao final, exibe o total geral de todas as pessoas.
        /// </summary>
        /// <returns>Relatório completo de totais por pessoa</returns>
        [HttpGet("TotaisPorPessoa")]
        public async Task<ActionResult<object>> GetTotaisPorPessoa()
        {
            // Busca todas as pessoas com suas transações
            var pessoas = await _context.Pessoas
                .Include(p => p.Transacoes)
                .ToListAsync();

            // Lista para armazenar os totais de cada pessoa
            var totaisPorPessoa = new List<object>();

            // Variáveis para calcular o total geral
            decimal totalGeralReceitas = 0;
            decimal totalGeralDespesas = 0;

            // Processa cada pessoa
            foreach (var pessoa in pessoas)
            {
                // Calcula total de receitas desta pessoa
                // Filtra transações do tipo "Receita" e soma os valores
                var totalReceitas = pessoa.Transacoes
                    .Where(t => t.Tipo == "Receita")
                    .Sum(t => t.Valor);

                // Calcula total de despesas desta pessoa
                // Filtra transações do tipo "Despesa" e soma os valores
                var totalDespesas = pessoa.Transacoes
                    .Where(t => t.Tipo == "Despesa")
                    .Sum(t => t.Valor);

                // Calcula o saldo: receitas menos despesas
                var saldo = totalReceitas - totalDespesas;

                // Adiciona aos totais gerais
                totalGeralReceitas += totalReceitas;
                totalGeralDespesas += totalDespesas;

                // Adiciona o resultado desta pessoa à lista
                totaisPorPessoa.Add(new
                {
                    pessoaId = pessoa.Id,
                    nome = pessoa.Nome,
                    idade = pessoa.Idade,
                    totalReceitas = totalReceitas,
                    totalDespesas = totalDespesas,
                    saldo = saldo
                });
            }

            // Calcula o saldo geral
            var saldoGeral = totalGeralReceitas - totalGeralDespesas;

            // Retorna o relatório completo
            return Ok(new
            {
                pessoas = totaisPorPessoa,
                totalGeral = new
                {
                    totalReceitas = totalGeralReceitas,
                    totalDespesas = totalGeralDespesas,
                    saldoLiquido = saldoGeral
                }
            });
        }

        /// <summary>
        /// Gera relatório de totais por categoria (OPCIONAL).
        /// GET: api/Relatorios/TotaisPorCategoria
        /// 
        /// Para cada categoria cadastrada, calcula:
        /// - Total de receitas
        /// - Total de despesas
        /// - Saldo (receitas - despesas)
        /// 
        /// Ao final, exibe o total geral de todas as categorias.
        /// </summary>
        /// <returns>Relatório completo de totais por categoria</returns>
        [HttpGet("TotaisPorCategoria")]
        public async Task<ActionResult<object>> GetTotaisPorCategoria()
        {
            // Busca todas as categorias com suas transações
            var categorias = await _context.Categorias
                .Include(c => c.Transacoes)
                .ToListAsync();

            // Lista para armazenar os totais de cada categoria
            var totaisPorCategoria = new List<object>();

            // Variáveis para calcular o total geral
            decimal totalGeralReceitas = 0;
            decimal totalGeralDespesas = 0;

            // Processa cada categoria
            foreach (var categoria in categorias)
            {
                // Calcula total de receitas desta categoria
                // Filtra transações do tipo "Receita" e soma os valores
                var totalReceitas = categoria.Transacoes
                    .Where(t => t.Tipo == "Receita")
                    .Sum(t => t.Valor);

                // Calcula total de despesas desta categoria
                // Filtra transações do tipo "Despesa" e soma os valores
                var totalDespesas = categoria.Transacoes
                    .Where(t => t.Tipo == "Despesa")
                    .Sum(t => t.Valor);

                // Calcula o saldo: receitas menos despesas
                var saldo = totalReceitas - totalDespesas;

                // Adiciona aos totais gerais
                totalGeralReceitas += totalReceitas;
                totalGeralDespesas += totalDespesas;

                // Adiciona o resultado desta categoria à lista
                totaisPorCategoria.Add(new
                {
                    categoriaId = categoria.Id,
                    descricao = categoria.Descricao,
                    finalidade = categoria.Finalidade,
                    totalReceitas = totalReceitas,
                    totalDespesas = totalDespesas,
                    saldo = saldo
                });
            }

            // Calcula o saldo geral
            var saldoGeral = totalGeralReceitas - totalGeralDespesas;

            // Retorna o relatório completo
            return Ok(new
            {
                categorias = totaisPorCategoria,
                totalGeral = new
                {
                    totalReceitas = totalGeralReceitas,
                    totalDespesas = totalGeralDespesas,
                    saldoLiquido = saldoGeral
                }
            });
        }
    }
}
