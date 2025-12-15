using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GastosResidenciaisAPI.Data;
using GastosResidenciaisAPI.Models;

namespace GastosResidenciaisAPI.Controllers
{
    /// <summary>
    /// Controller responsável por gerenciar as operações de Transação.
    /// Endpoints: Criar e Listar transações.
    /// Implementa validações de regras de negócio complexas.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class TransacoesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TransacoesController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Lista todas as transações cadastradas no sistema.
        /// GET: api/Transacoes
        /// Inclui dados relacionados de Pessoa e Categoria.
        /// </summary>
        /// <returns>Lista de todas as transações com suas relações</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Transacao>>> GetTransacoes()
        {
            // Carrega as transações com suas entidades relacionadas (Pessoa e Categoria)
            return await _context.Transacoes
                .Include(t => t.Pessoa)
                .Include(t => t.Categoria)
                .ToListAsync();
        }

        /// <summary>
        /// Busca uma transação específica pelo ID.
        /// GET: api/Transacoes/5
        /// </summary>
        /// <param name="id">ID da transação</param>
        /// <returns>Dados da transação encontrada</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<Transacao>> GetTransacao(int id)
        {
            var transacao = await _context.Transacoes
                .Include(t => t.Pessoa)
                .Include(t => t.Categoria)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (transacao == null)
            {
                return NotFound(new { message = "Transação não encontrada" });
            }

            return transacao;
        }

        /// <summary>
        /// Cria uma nova transação no sistema.
        /// POST: api/Transacoes
        /// 
        /// REGRAS DE NEGÓCIO IMPLEMENTADAS:
        /// 1. Menores de idade (idade menor que 18) só podem ter transações do tipo "Despesa"
        /// 2. A categoria utilizada deve ser compatível com o tipo da transação:
        ///    - Se tipo é "Despesa", categoria não pode ter finalidade "Receita"
        ///    - Se tipo é "Receita", categoria não pode ter finalidade "Despesa"
        ///    - Categorias com finalidade "Ambas" podem ser usadas para qualquer tipo
        /// 
        /// Validações:
        /// - Descrição, Valor, Tipo, CategoriaId e PessoaId são obrigatórios
        /// - Valor deve ser positivo
        /// - Tipo deve ser "Despesa" ou "Receita"
        /// - Pessoa e Categoria devem existir no banco de dados
        /// </summary>
        /// <param name="transacao">Dados da transação a ser criada</param>
        /// <returns>Transação criada com ID gerado</returns>
        [HttpPost]
        public async Task<ActionResult<Transacao>> PostTransacao(Transacao transacao)
        {
            // Validação: Descrição não pode ser vazia
            if (string.IsNullOrWhiteSpace(transacao.Descricao))
            {
                return BadRequest(new { message = "A descrição é obrigatória" });
            }

            // Validação: Valor deve ser positivo
            if (transacao.Valor <= 0)
            {
                return BadRequest(new { message = "O valor deve ser um número positivo" });
            }

            // Validação: Tipo deve ser válido
            var tiposValidos = new[] { "Despesa", "Receita" };
            if (!tiposValidos.Contains(transacao.Tipo))
            {
                return BadRequest(new 
                { 
                    message = "Tipo inválido. Valores aceitos: 'Despesa' ou 'Receita'" 
                });
            }

            // Verifica se a pessoa existe
            var pessoa = await _context.Pessoas.FindAsync(transacao.PessoaId);
            if (pessoa == null)
            {
                return BadRequest(new { message = "Pessoa não encontrada" });
            }

            // REGRA DE NEGÓCIO: Menores de idade (menor de 18 anos) só podem ter despesas
            if (pessoa.Idade < 18 && transacao.Tipo == "Receita")
            {
                return BadRequest(new 
                { 
                    message = "Menores de idade (menor de 18 anos) só podem registrar despesas" 
                });
            }

            // Verifica se a categoria existe
            var categoria = await _context.Categorias.FindAsync(transacao.CategoriaId);
            if (categoria == null)
            {
                return BadRequest(new { message = "Categoria não encontrada" });
            }

            // REGRA DE NEGÓCIO: Valida se a categoria é compatível com o tipo da transação
            // Se o tipo é "Despesa", a categoria não pode ter finalidade exclusiva para "Receita"
            if (transacao.Tipo == "Despesa" && categoria.Finalidade == "Receita")
            {
                return BadRequest(new 
                { 
                    message = "Esta categoria é exclusiva para receitas e não pode ser usada em despesas" 
                });
            }

            // Se o tipo é "Receita", a categoria não pode ter finalidade exclusiva para "Despesa"
            if (transacao.Tipo == "Receita" && categoria.Finalidade == "Despesa")
            {
                return BadRequest(new 
                { 
                    message = "Esta categoria é exclusiva para despesas e não pode ser usada em receitas" 
                });
            }

            // Adiciona a transação ao banco de dados
            _context.Transacoes.Add(transacao);
            await _context.SaveChangesAsync();

            // Recarrega a transação com as entidades relacionadas para retornar completa
            await _context.Entry(transacao).Reference(t => t.Pessoa).LoadAsync();
            await _context.Entry(transacao).Reference(t => t.Categoria).LoadAsync();

            return CreatedAtAction(nameof(GetTransacao), new { id = transacao.Id }, transacao);
        }
    }
}
