using System.ComponentModel.DataAnnotations;

namespace GastosResidenciaisAPI.Models
{
    /// <summary>
    /// Representa uma pessoa no sistema de controle de gastos residenciais.
    /// Cada pessoa pode ter múltiplas transações associadas.
    /// </summary>
    public class Pessoa
    {
        /// <summary>
        /// Identificador único da pessoa.
        /// Gerado automaticamente pelo banco de dados.
        /// </summary>
        [Key]
        public int Id { get; set; }

        /// <summary>
        /// Nome completo da pessoa.
        /// Campo obrigatório com limite máximo de 200 caracteres.
        /// </summary>
        [Required(ErrorMessage = "O nome é obrigatório")]
        [StringLength(200, ErrorMessage = "O nome deve ter no máximo 200 caracteres")]
        public string Nome { get; set; } = string.Empty;

        /// <summary>
        /// Idade da pessoa em anos.
        /// Deve ser um número inteiro positivo.
        /// Usado para validar se a pessoa é menor de idade (menor de 18 anos).
        /// </summary>
        [Required(ErrorMessage = "A idade é obrigatória")]
        [Range(0, 150, ErrorMessage = "A idade deve ser um número positivo válido")]
        public int Idade { get; set; }

        /// <summary>
        /// Lista de transações associadas a esta pessoa.
        /// Quando a pessoa é deletada, todas as transações também são removidas (cascade delete).
        /// </summary>
        public ICollection<Transacao> Transacoes { get; set; } = new List<Transacao>();
    }
}
