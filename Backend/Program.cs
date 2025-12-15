using Microsoft.EntityFrameworkCore;
using GastosResidenciaisAPI.Data;

var builder = WebApplication.CreateBuilder(args);

// Adiciona o DbContext configurado para usar SQLite
// O banco de dados será criado no arquivo "gastosresidenciais.db" na raiz do projeto
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Adiciona os controllers ao pipeline
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Configura o JSON para ignorar referências cíclicas
        // Isso evita erros ao serializar entidades com relacionamentos
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// Adiciona documentação Swagger para facilitar testes da API
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configura CORS para permitir requisições do frontend React
// IMPORTANTE: Em produção, configure origins específicos ao invés de AllowAnyOrigin
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.AllowAnyOrigin()  // Permite qualquer origem (dev only)
                  .AllowAnyHeader()   // Permite qualquer cabeçalho
                  .AllowAnyMethod();  // Permite qualquer método HTTP (GET, POST, DELETE, etc)
        });
});

var app = builder.Build();

// Garante que o banco de dados seja criado na inicialização
// Se o banco não existir, será criado automaticamente
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    dbContext.Database.EnsureCreated();
}

// Configure o pipeline de requisição HTTP
if (app.Environment.IsDevelopment())
{
    // Habilita Swagger apenas em desenvolvimento
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Habilita CORS (deve vir antes de UseAuthorization)
app.UseCors("AllowReactApp");

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
