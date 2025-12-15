using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GastosResidenciaisAPI.Data;
using GastosResidenciaisAPI.Models;

namespace GastosResidenciaisAPI.Controllers
{
    /// <summary>
    /// Controller responsável por gerenciar as operações de Categoria.
    /// Endpoints: Criar e Listar categorias.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriasController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CategoriasController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Lista todas as categorias cadastradas no sistema.
        /// GET: api/Categorias
        /// </summary>
        /// <returns>Lista de todas as categorias</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Categoria>>> GetCategorias()
        {
            return await _context.Categorias.ToListAsync();
        }

        /// <summary>
        /// Busca uma categoria específica pelo ID.
        /// GET: api/Categorias/5
        /// </summary>
        /// <param name="id">ID da categoria</param>
        /// <returns>Dados da categoria encontrada</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<Categoria>> GetCategoria(int id)
        {
            var categoria = await _context.Categorias.FindAsync(id);

            if (categoria == null)
            {
                return NotFound(new { message = "Categoria não encontrada" });
            }

            return categoria;
        }

        /// <summary>
        /// Cria uma nova categoria no sistema.
        /// POST: api/Categorias
        /// Validações:
        /// - Descrição é obrigatória
        /// - Finalidade deve ser: "Despesa", "Receita" ou "Ambas"
        /// </summary>
        /// <param name="categoria">Dados da categoria a ser criada</param>
        /// <returns>Categoria criada com ID gerado</returns>
        [HttpPost]
        public async Task<ActionResult<Categoria>> PostCategoria(Categoria categoria)
        {
            // Validação: Descrição não pode ser vazia
            if (string.IsNullOrWhiteSpace(categoria.Descricao))
            {
                return BadRequest(new { message = "A descrição é obrigatória" });
            }

            // Validação: Finalidade deve ter um valor válido
            var finalidadesValidas = new[] { "Despesa", "Receita", "Ambas" };
            if (!finalidadesValidas.Contains(categoria.Finalidade))
            {
                return BadRequest(new 
                { 
                    message = "Finalidade inválida. Valores aceitos: 'Despesa', 'Receita' ou 'Ambas'" 
                });
            }

            _context.Categorias.Add(categoria);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategoria), new { id = categoria.Id }, categoria);
        }
    }
}
