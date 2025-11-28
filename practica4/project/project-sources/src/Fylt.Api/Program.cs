using Fylt.Domain;
using Fylt.Domain.Clients.TMDBClient;
using Fylt.Domain.Services.PeliculasService;
using Fylt.Domain.Services.TmdbService;
using Fylt.Infrastructure.Context;
using Fylt.Infrastructure.DAOs;

var builder = WebApplication.CreateBuilder(args); // Crear builder

// Add services to the container.
builder.Services.AddHttpClient(); // Registra HttpClient para inyección de dependencia, necesario para PeliculasService
builder.Services.AddControllers(); // Buscar controladores
builder.Services.AddDomain(); // Agregar capa de dominio
builder.Services.AddPersistence(builder.Configuration); // Agregar capa de persistencia
builder.Services.AddScoped<IPeliculasService, PeliculasService>();
builder.Services.AddScoped<TmdbService>();
builder.Services.AddHttpClient<TmdbActorsService>();



// ✅ --- HABILITAR CORS PARA EL FRONTEND LOCAL ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins(
            "http://localhost:3000",   // Frontend Next.js (modo dev)
            "https://localhost:3000"   // En caso de usar HTTPS
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build(); // Construir app

// TRABAJAR EN LOCAL ADMIN Y USER
if (app.Environment.IsDevelopment()) 
{
    app.UseSwagger();
    app.UseSwaggerUI();
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<FyltContext>();

        // Si no existe un admin, lo crea
        if (!db.Usuarios.Any(u => u.Email == "admin@fylt.com"))
        {
            var admin = new Usuario
            {
                RealName = "Administrador",
                Username = "admin",
                Email = "admin@fylt.com",
                Password = BCrypt.Net.BCrypt.HashPassword("admin123"),
                BoolAdmin = true,
                Descripcion = "Cuenta administrativa local",
                Seguidores = 0,
                Seguidos = 0,
                Foto = null
            };

            db.Usuarios.Add(admin);
            db.SaveChanges();

            Console.WriteLine("✅ Usuario admin creado: admin@fylt.com / admin123");
        }
        else if (!db.Usuarios.Any(u => u.Email == "user@fylt.com"))
        {
            var admin = new Usuario
            {
                RealName = "Usuario",
                Username = "user",
                Email = "user@fylt.com",
                Password = BCrypt.Net.BCrypt.HashPassword("user123"),
                BoolAdmin = false,
                Descripcion = "Cuenta usuario local",
                Seguidores = 0,
                Seguidos = 0,
                Foto = null
            };

            db.Usuarios.Add(admin);
            db.SaveChanges();

            Console.WriteLine("✅ Usuario creado: user@fylt.com / user123");
        }
        else
        {
            Console.WriteLine("⚙️ Usuario admin ya existente en la BD.");
        }
    }
}

app.UseHttpsRedirection();

// ✅ --- ACTIVAR POLÍTICA CORS ANTES DE AUTH ---
app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

app.Run();

public partial class Program { }