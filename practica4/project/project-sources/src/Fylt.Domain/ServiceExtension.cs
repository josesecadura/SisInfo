using Fylt.Domain.Services.UsuariosService;
using Fylt.Domain.Services.ActividadesService;
using Fylt.Domain.Services.ApiKeyService;
using Fylt.Domain.Services.EncuestaService;
using Fylt.Domain.Services.ComentarioService;
﻿using Fylt.Domain.Clients.TMDBClient;
using Fylt.Domain.Services.ListasService;
using Fylt.Domain.Services.PeliculasService;
using Fylt.Domain.Services.RankingItemsService;
using Fylt.Domain.Services.RankingsService;
using Fylt.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.Net.Http;

namespace Fylt.Domain
{
    // Configuración de los servicios y de la base de datos
    public static class ServiceExtension
    {
        public static IServiceCollection AddDomain(this IServiceCollection services)
        {
            // registra servicios de dominio puros una sola vez (validadores, reglas, etc.)
            services.AddScoped<IUsuariosService, UsuariosService>();
            services.AddScoped<IActividadService, ActividadService>();
            services.AddScoped<IApiKeyService, ApiKeyService>();
            services.AddScoped<IEncuestaService, EncuestaService>();
            services.AddScoped<IComentarioService, ComentarioService>();
            services.AddScoped<IPeliculasService, PeliculasService>();
            services.AddScoped<IListasService, ListasService>();
            services.AddScoped<IRankingItemsService, RankingItemsService>();
            services.AddScoped<IRankingsService, RankingsService>();

            return services;
        }

        // Registro de la base de datos y repositorios
        public static IServiceCollection AddPersistence(this IServiceCollection services, IConfiguration configuration)
        {
            var connString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Missing connection string 'DefaultConnection'.");

            services.AddDbContext<FyltContext>(options => // Añade el contexto de la base de datos con PostgreSQL
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
