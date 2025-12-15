using System.ComponentModel.DataAnnotations;

namespace GastosResidenciaisAPI.Models
{
    /// <summary>
    /// Representa uma categoria de transação no sistema.
    /// Categorias podem ser usadas para despesas, receitas ou ambas.
    /// </summary>
    public class Categoria
    {
        /// <summary>
        /// Identificador único da categoria.
        /// Gerado automaticamente pelo banco de dados.
        /// </summary>
        [Key]
        public int Id { get; set; }

        /// <summary>
        /// Descrição da categoria (ex: Alimentação, Salário, Transporte).
        /// Campo obrigatório com limite máximo de 100 caracteres.
        /// </summary>
        [Required(ErrorMessage = "A descrição é obrigatória")]
        [StringLength(100, ErrorMessage = "A descrição deve ter no máximo 100 caracteres")]
        public string Descricao { get; set; } = string.Empty;

        /// <summary>
        /// Finalidade da categoria: define se pode ser usada para despesas, receitas ou ambas.
        /// Valores possíveis: "Despesa", "Receita", "Ambas"
        /// Usado para validar se uma categoria pode ser usada em determinada transação.
        /// </summary>
        [Required(ErrorMessage = "A finalidade é obrigatória")]
        public string Finalidade { get; set; } = string.Empty; // "Despesa", "Receita", "Ambas"

        /// <summary>
        /// Lista de transações que utilizam esta categoria.
        /// </summary>
        public ICollection<Transacao> Transacoes { get; set; } = new List<Transacao>();
    }
}
