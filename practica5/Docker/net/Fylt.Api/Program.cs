using Fylt.Api.ApiModels;
using Fylt.Domain;
using Fylt.Domain.Clients.TMDBClient;
using Fylt.Domain.Clients.YoutubeClient;
using Fylt.Domain.Services.PeliculasService;
using Fylt.Infrastructure.Context;
using Fylt.Infrastructure.DAOs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args); // Crear builder

// Add services to the container.
builder.Services.AddHttpClient(); // Registra HttpClient para inyección de dependencia, necesario para PeliculasService
builder.Services.AddControllers(); // Buscar controladores
builder.Services.AddDomain(); // Agregar capa de dominio
builder.Services.AddPersistence(builder.Configuration); // Agregar capa de persistencia
builder.Services.AddControllers(); //Buscar controladores
builder.Services.AddDomain(); //Agregar capa de dominio

// Configuaración del cliente TMDB (APIKey y URL)
var TmbdUrl = builder.Configuration.GetValue<string>("TMDB:Url");
builder.Services.AddHttpClient<ITMDBClient, TMDBClient>(client =>
{
    client.BaseAddress = new Uri(TmbdUrl);
});

var youtubeUrl = builder.Configuration.GetValue<string>("YouTube:Url");

builder.Services.AddHttpClient<IYoutubeClient, YoutubeClient>(client =>
{
    client.BaseAddress = new Uri(youtubeUrl);
});

// Configurar opciones
builder.Services.Configure<TokenOptions>(builder.Configuration.GetSection("Token"));


// Leer opciones para configurar el middleware
var jwtSection = builder.Configuration.GetSection("Token");
var key = Encoding.UTF8.GetBytes(jwtSection["Key"]!);
var issuer = jwtSection["Issuer"];
var audience = jwtSection["Audience"];

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = issuer,
            ValidateAudience = true,
            ValidAudience = audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1) // margen pequeño
        };
    });

//--- HABILITAR CORS PARA EL FRONTEND LOCAL ---
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
var follows = builder.Services.BuildServiceProvider()
    .GetRequiredService<FyltContext>()
    .Model.FindEntityType(typeof(UsuarioSeguidor));

// TRABAJAR EN LOCAL ADMIN Y USER
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<FyltContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

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

            logger.LogInformation("Usuario admin creado: {Email} / {Password}", "admin@fylt.com", "admin123");
        }
        else if (!db.Usuarios.Any(u => u.Email == "user@fylt.com"))
        {
            var user = new Usuario
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

            db.Usuarios.Add(user);
            db.SaveChanges();

            logger.LogInformation("Usuario creado: {Email} / {Password}", "user@fylt.com", "user123");
        }
        else
        {
            logger.LogInformation("Usuario admin ya existente en la BD.");
        }
    }
}




app.UseHttpsRedirection();

// --- ACTIVAR POLÍTICA CORS ANTES DE AUTH ---
app.UseCors("AllowFrontend");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();

public partial class Program { }