using Fylt.Domain.VOs.PeliculasVO;
using Fylt.Infrastructure.DAOs;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

namespace Fylt.Domain.Clients.TMDBClient
{
    public class TMDBClient : ITMDBClient
    {
        private readonly HttpClient _httpClient;

        public TMDBClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<List<PeliculaVO>> ImportarPeliculas()
        {
            var peliculas = new List<PeliculaVO>();
            for (int page = 1; page <= 25; page++)
            {
                // Aquí podrías procesar o almacenar las películas obtenidas por página

                string url = "movie/popular?language=es-ES&page=" + page.ToString(); 

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
                            Valoracion = valoracion.HasValue ? (int?)Math.Round(valoracion.Value) : null
                        });
                    }

             
            }
            return peliculas;  
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
