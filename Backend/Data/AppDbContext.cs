using Microsoft.EntityFrameworkCore;
using GastosResidenciaisAPI.Models;

namespace GastosResidenciaisAPI.Data
{
    /// <summary>
    /// Contexto do banco de dados para o sistema de controle de gastos residenciais.
    /// Utiliza SQLite como banco de dados para garantir persistência após reinicialização.
    /// Gerencia as entidades: Pessoa, Categoria e Transacao.
    /// </summary>
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        /// <summary>
        /// DbSet para gerenciar as pessoas cadastradas no sistema.
        /// </summary>
        public DbSet<Pessoa> Pessoas { get; set; }

        /// <summary>
        /// DbSet para gerenciar as categorias de transações.
        /// </summary>
        public DbSet<Categoria> Categorias { get; set; }

        /// <summary>
        /// DbSet para gerenciar as transações financeiras.
        /// </summary>
        public DbSet<Transacao> Transacoes { get; set; }

        /// <summary>
        /// Configura as relações entre as entidades e comportamentos do banco de dados.
        /// </summary>
        /// <param name="modelBuilder">Construtor de modelo do Entity Framework</param>
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuração da relação Pessoa -> Transacoes
            // Quando uma pessoa é deletada, todas as suas transações também são deletadas (Cascade)
            modelBuilder.Entity<Pessoa>()
                .HasMany(p => p.Transacoes)
                .WithOne(t => t.Pessoa)
                .HasForeignKey(t => t.PessoaId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configuração da relação Categoria -> Transacoes
            // Quando uma categoria é deletada, as transações relacionadas também são afetadas
            modelBuilder.Entity<Categoria>()
                .HasMany(c => c.Transacoes)
                .WithOne(t => t.Categoria)
                .HasForeignKey(t => t.CategoriaId)
                .OnDelete(DeleteBehavior.Restrict); // Impede deletar categoria se houver transações

            // Garante que o campo Finalidade da Categoria tenha valores válidos
            modelBuilder.Entity<Categoria>()
                .Property(c => c.Finalidade)
                .IsRequired();

            // Garante que o campo Tipo da Transacao tenha valores válidos
            modelBuilder.Entity<Transacao>()
                .Property(t => t.Tipo)
                .IsRequired();
        }
    }
}
