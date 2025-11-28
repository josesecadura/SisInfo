using Fylt.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Text.Json.Nodes;

namespace Fylt.Domain.Services.TmdbService
{
    public class TmdbService
    {
        private readonly FyltContext _context;
        private readonly ILogger<TmdbService> _logger;
        private readonly HttpClient _httpClient;
        private readonly string _baseUrl;

        public TmdbService(FyltContext context, ILogger<TmdbService> logger, HttpClient httpClient, IConfiguration configuration)
        {
            _context = context;
            _logger = logger;
            _httpClient = httpClient;
            // Solución: Usa GetSection y Value en vez de GetValue
            _baseUrl = configuration.GetSection("TMDB:Url").Value ?? "https://api.themoviedb.org/3/";
        }

        public async Task<JsonArray> GetPopularMoviesAsync()
        {
            // 1️⃣ Obtener la API key TMDB de la base de datos
            var tmdbKey = await _context.ApiKeys
                .Where(k => EF.Functions.ILike(k.Nombre, "tmdb"))
                .Select(k => k.Direccion)
                .FirstOrDefaultAsync();

            if (string.IsNullOrEmpty(tmdbKey))
                throw new InvalidOperationException("No hay API Key configurada para TMDB.");

            // 2️⃣ Configuración general
            int totalDeseado = 500;
            int porPagina = 20; // TMDB devuelve 20 por página
            int totalPaginas = (int)Math.Ceiling(totalDeseado / (double)porPagina);

            var todasLasPeliculas = new JsonArray();

            // 3️⃣ Bucle para traer varias páginas
            for (int page = 1; page <= totalPaginas; page++)
            {
                var url = $"{_baseUrl}movie/popular?api_key={tmdbKey}&language=es-ES&page={page}";

                _logger.LogInformation("Solicitando página {Page} desde TMDB...", page);

                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var json = JsonObject.Parse(content);

                if (json?["results"] is JsonArray results)
                {
                    foreach (var movie in results)
                    {
                        // Clonar el nodo antes de añadirlo (evita "The node already has a parent")
                        todasLasPeliculas.Add(JsonNode.Parse(movie!.ToJsonString()));

                        if (todasLasPeliculas.Count >= totalDeseado)
                            break;
                    }
                }

                // detener si ya alcanzamos el límite de 500
                if (todasLasPeliculas.Count >= totalDeseado)
                    break;
            }

            _logger.LogInformation("Se recuperaron {Count} películas desde TMDB.", todasLasPeliculas.Count);
            return todasLasPeliculas;
        }
    }
}
