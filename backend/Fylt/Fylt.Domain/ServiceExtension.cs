using Fylt.Domain.Services.UsuariosService;
using Fylt.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Fylt.Domain
{
    public static class ServiceExtension
    {
        public static IServiceCollection AddDomain(this IServiceCollection services)
        {
            // registra servicios de dominio puros (validadores, reglas, etc.)
            services.AddScoped<IUsuariosService, UsuariosService>();

            return services;
        }

        public static IServiceCollection AddPersistence(this IServiceCollection services, IConfiguration configuration)
        {
            var connString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Missing connection string 'DefaultConnection'.");

            services.AddDbContext<FyltContext>(options =>
            {
                options.UseNpgsql(connString, npgsql =>
                {
                    npgsql.MigrationsAssembly(typeof(FyltContext).Assembly.FullName);
                });

            });

            // Repositorios / UoW (si los tienes)
            // services.AddScoped<IUsuarioRepository, UsuarioRepository>();
            // services.AddScoped<IUnitOfWork, UnitOfWork>();

            return services;
        }

    }
}
