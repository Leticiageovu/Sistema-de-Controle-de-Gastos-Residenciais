using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GastosResidenciaisAPI.Data;
using GastosResidenciaisAPI.Models;

namespace GastosResidenciaisAPI.Controllers
{
    /// <summary>
    /// Controller responsável por gerenciar as operações de Pessoa.
    /// Endpoints: Criar, Listar e Deletar pessoas.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class PessoasController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PessoasController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Lista todas as pessoas cadastradas no sistema.
        /// GET: api/Pessoas
        /// </summary>
        /// <returns>Lista de todas as pessoas</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Pessoa>>> GetPessoas()
        {
            return await _context.Pessoas.ToListAsync();
        }

        /// <summary>
        /// Busca uma pessoa específica pelo ID.
        /// GET: api/Pessoas/5
        /// </summary>
        /// <param name="id">ID da pessoa</param>
        /// <returns>Dados da pessoa encontrada</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<Pessoa>> GetPessoa(int id)
        {
            var pessoa = await _context.Pessoas.FindAsync(id);

            if (pessoa == null)
            {
                return NotFound(new { message = "Pessoa não encontrada" });
            }

            return pessoa;
        }

        /// <summary>
        /// Cria uma nova pessoa no sistema.
        /// POST: api/Pessoas
        /// Validações:
        /// - Nome é obrigatório
        /// - Idade deve ser um número positivo
        /// </summary>
        /// <param name="pessoa">Dados da pessoa a ser criada</param>
        /// <returns>Pessoa criada com ID gerado</returns>
        [HttpPost]
        public async Task<ActionResult<Pessoa>> PostPessoa(Pessoa pessoa)
        {
            // Validação: Nome não pode ser vazio
            if (string.IsNullOrWhiteSpace(pessoa.Nome))
            {
                return BadRequest(new { message = "O nome é obrigatório" });
            }

            // Validação: Idade deve ser positiva
            if (pessoa.Idade < 0)
            {
                return BadRequest(new { message = "A idade deve ser um número positivo" });
            }

            _context.Pessoas.Add(pessoa);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPessoa), new { id = pessoa.Id }, pessoa);
        }

        /// <summary>
        /// Deleta uma pessoa do sistema.
        /// DELETE: api/Pessoas/5
        /// IMPORTANTE: Ao deletar uma pessoa, todas as suas transações também são deletadas (CASCADE).
        /// Além disso, TODAS as categorias órfãs (sem transações) são removidas automaticamente do sistema.
        /// Esta é uma operação irreversível.
        /// </summary>
        /// <param name="id">ID da pessoa a ser deletada</param>
        /// <returns>Status da operação</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePessoa(int id)
        {
            var pessoa = await _context.Pessoas.FindAsync(id);
            if (pessoa == null)
            {
                return NotFound(new { message = "Pessoa não encontrada" });
            }

            // Remove a pessoa do banco de dados
            // As transações associadas serão deletadas automaticamente devido ao CASCADE configurado no DbContext
            _context.Pessoas.Remove(pessoa);
            await _context.SaveChangesAsync();

            // Após deletar a pessoa e suas transações, remove TODAS as categorias órfãs do sistema
            // (categorias que não têm mais nenhuma transação associada)
            var todasCategorias = await _context.Categorias.ToListAsync();
            var categoriasRemovidas = 0;

            foreach (var categoria in todasCategorias)
            {
                var temTransacoes = await _context.Transacoes
                    .AnyAsync(t => t.CategoriaId == categoria.Id);

                // Se a categoria não tem transações, remove ela
                if (!temTransacoes)
                {
                    _context.Categorias.Remove(categoria);
                    categoriasRemovidas++;
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { 
                message = $"Pessoa deletada com sucesso. Todas as transações e {categoriasRemovidas} categoria(s) órfã(s) foram removidas." 
            });
        }
    }
}
