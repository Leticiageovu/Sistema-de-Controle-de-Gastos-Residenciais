using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GastosResidenciaisAPI.Models
{
    /// <summary>
    /// Representa uma transação financeira (despesa ou receita) no sistema.
    /// Cada transação está associada a uma pessoa e a uma categoria.
    /// </summary>
    public class Transacao
    {
        /// <summary>
        /// Identificador único da transação.
        /// Gerado automaticamente pelo banco de dados.
        /// </summary>
        [Key]
        public int Id { get; set; }

        /// <summary>
        /// Descrição detalhada da transação (ex: "Compra de supermercado", "Pagamento de salário").
        /// Campo obrigatório com limite máximo de 200 caracteres.
        /// </summary>
        [Required(ErrorMessage = "A descrição é obrigatória")]
        [StringLength(200, ErrorMessage = "A descrição deve ter no máximo 200 caracteres")]
        public string Descricao { get; set; } = string.Empty;

        /// <summary>
        /// Valor da transação em reais.
        /// Deve ser um número decimal positivo.
        /// Utiliza precisão de 18 dígitos com 2 casas decimais.
        /// </summary>
        [Required(ErrorMessage = "O valor é obrigatório")]
        [Range(0.01, double.MaxValue, ErrorMessage = "O valor deve ser um número positivo")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Valor { get; set; }

        /// <summary>
        /// Tipo da transação: "Despesa" ou "Receita".
        /// Usado para calcular o saldo (receitas aumentam, despesas diminuem).
        /// Menores de idade (idade menor que 18) só podem ter transações do tipo "Despesa".
        /// </summary>
        [Required(ErrorMessage = "O tipo é obrigatório")]
        public string Tipo { get; set; } = string.Empty; // "Despesa" ou "Receita"

        /// <summary>
        /// Identificador da categoria associada a esta transação.
        /// Chave estrangeira para a tabela Categorias.
        /// </summary>
        [Required(ErrorMessage = "A categoria é obrigatória")]
        public int CategoriaId { get; set; }

        /// <summary>
        /// Objeto da categoria associada a esta transação.
        /// Usado para navegação entre entidades.
        /// </summary>
        [ForeignKey("CategoriaId")]
        public Categoria? Categoria { get; set; }

        /// <summary>
        /// Identificador da pessoa associada a esta transação.
        /// Chave estrangeira para a tabela Pessoas.
        /// </summary>
        [Required(ErrorMessage = "A pessoa é obrigatória")]
        public int PessoaId { get; set; }

        /// <summary>
        /// Objeto da pessoa associada a esta transação.
        /// Usado para navegação entre entidades.
        /// </summary>
        [ForeignKey("PessoaId")]
        public Pessoa? Pessoa { get; set; }
    }
}
