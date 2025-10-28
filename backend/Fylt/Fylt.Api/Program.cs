using Fylt.Domain;

var builder = WebApplication.CreateBuilder(args); //Crear builder

// Add services to the container.
builder.Services.AddHttpClient(); // Registra HttpClient para inyección de dependencia, necesario para PeliculasService
builder.Services.AddControllers(); //Buscar controladores
builder.Services.AddDomain(); //Agregar capa de dominio
builder.Services.AddPersistence(builder.Configuration); //Agregar capa de persistencia

builder.Services.AddEndpointsApiExplorer(); //Explorador de endpoints
builder.Services.AddSwaggerGen(); //Generador de Swagger

var app = builder.Build(); //Construir app

// Configure the HTTP request pipeline.Si la aplicacion esta en desarrollo que use el swagger 
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}   

app.UseHttpsRedirection(); //Redireccionar a HTTPS

app.UseAuthorization(); //Usar autorizacion

app.MapControllers(); //Mapear controladores

app.Run(); //Correr app
