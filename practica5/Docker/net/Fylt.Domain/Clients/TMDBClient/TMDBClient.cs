using Fylt.Domain.Services.ApiKeyService;
using Fylt.Domain.VOs.ApiKeyVOs;
using Fylt.Domain.VOs.PeliculasVO;
using Fylt.Infrastructure.DAOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Net.Http;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Threading.Tasks;
namespace Fylt.Domain.Clients.TMDBClient
{
    public class TMDBClient : ITMDBClient
    {
        private static readonly Dictionary<int, string> GenreMap = new()
        {
            { 28, "Acción" },
            { 12, "Aventura" },
            { 16, "Animación" },
            { 35, "Comedia" },
            { 80, "Crimen" },
            { 99, "Documental" },
            { 18, "Drama" },
            { 10751, "Familiar" },
            { 14, "Fantasía" },
            { 36, "Historia" },
            { 27, "Terror" },
            { 10402, "Música" },
            { 9648, "Misterio" },
            { 10749, "Romance" },
            { 878, "Ciencia ficción" },
            { 10770, "Película de TV" },
            { 53, "Suspense" },
            { 10752, "Guerra" },
            { 37, "Western" }
        };

        private readonly HttpClient _httpClient;
        private readonly IApiKeyService _apiKeyService;

        public TMDBClient(HttpClient httpClient, IApiKeyService apiKeyService)
        {
            _httpClient = httpClient;
            _apiKeyService= apiKeyService;
        }


       
        public async Task<List<PeliculaVO>> ImportarPeliculas()
        {
            var peliculas = new List<PeliculaVO>();
            var apikeyList= await _apiKeyService.GetAll();
            var apiKey = apikeyList.FirstOrDefault(x => x.Nombre == "TMDB");

            for (int page = 1; page <= 25; page++)
            {
                // Aquí podrías procesar o almacenar las películas obtenidas por página

                string url = "movie/popular?language=es-ES&page=" + page.ToString();

                _httpClient.DefaultRequestHeaders.Authorization =
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey.Direccion);

                using var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var json = await response.Content.ReadAsStringAsync();

                using var doc = JsonDocument.Parse(json);
                if (!doc.RootElement.TryGetProperty("results", out var results) ||
                    results.ValueKind != JsonValueKind.Array)
                {
                    return peliculas;
                }


                foreach (var m in results.EnumerateArray())
                {
                    // --------------------------
                    //  Obtener y traducir géneros
                    // --------------------------    
                    var generos = new List<string>();
                    List<int> genreIds = new List<int>();

                    if (m.TryGetProperty("genre_ids", out JsonElement genreArray) && genreArray.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var g in genreArray.EnumerateArray())
                        {
                            if (g.ValueKind == JsonValueKind.Number && g.TryGetInt32(out int gid))
                                genreIds.Add(gid);
                        }
                    }

                    foreach (var gid in genreIds)
                    {
                        if (GenreMap.TryGetValue(gid, out var nombre))
                            generos.Add(nombre);
                    }

                    var externalId = GetInt(m, "id");
                    var titulo = GetString(m, "title") ?? "(Sin título)";
                    var descripcion = GetString(m, "overview");
                    var fecha = ParseDate(GetString(m, "release_date"));
                    var imagen = GetString(m, "poster_path");
                    var valoracion = GetDouble(m, "vote_average");

                    peliculas.Add(new PeliculaVO
                    {
                        ExternalId = externalId,
                        Titulo = string.IsNullOrWhiteSpace(titulo) ? "(Sin título)" : titulo,
                        Descripcion = string.IsNullOrWhiteSpace(descripcion) ? null : descripcion,
                        Fecha = fecha,
                        Imagen = string.IsNullOrWhiteSpace(imagen) ? null : $"https://image.tmdb.org/t/p/w500{imagen}",
                        Valoracion = valoracion.HasValue ? (int?)Math.Round(valoracion.Value) : null,
                        Generos = generos
                    });
                }


            }
            return peliculas;
        }

        public async Task<JsonArray> ImportarActores()
        {
            var apikeyList = await _apiKeyService.GetAll();
            var apiKey = apikeyList.FirstOrDefault(x => x.Nombre == "TMDB");
            string url = "person/popular";

            _httpClient.DefaultRequestHeaders.Authorization =
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey.Direccion);

            using var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();

            using var stream = await response.Content.ReadAsStreamAsync();

            var doc = JsonNode.Parse(stream);

            return doc?["results"]?.AsArray() ?? new JsonArray();
        }

        private static DateTime? ParseDate(string? iso)
        {
            if (string.IsNullOrWhiteSpace(iso)) return null;
            return DateTime.TryParseExact(
                iso,
                "yyyy-MM-dd",
                CultureInfo.InvariantCulture,
                DateTimeStyles.None,
                out var dt)
                ? dt
                : (DateTime?)null;
        }

        private static string? GetString(JsonElement obj, string prop)
        {
            if (obj.TryGetProperty(prop, out var p) && p.ValueKind != JsonValueKind.Null)
            {
                if (p.ValueKind == JsonValueKind.String) return p.GetString();
                return p.ToString();
            }
            return null;
        }

        private static int GetInt(JsonElement obj, string prop)
        {
            if (obj.TryGetProperty(prop, out var p))
            {
                if (p.ValueKind == JsonValueKind.Number && p.TryGetInt32(out var v)) return v;
                if (p.ValueKind == JsonValueKind.String && int.TryParse(p.GetString(), out var vs)) return vs;
            }
            return 0;
        }

        private static double? GetDouble(JsonElement obj, string prop)
        {
            if (obj.TryGetProperty(prop, out var p))
            {
                if (p.ValueKind == JsonValueKind.Number && p.TryGetDouble(out var v)) return v;
                if (p.ValueKind == JsonValueKind.String &&
                    double.TryParse(p.GetString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var vs))
                    return vs;
            }
            return null;
        }
    }
}
