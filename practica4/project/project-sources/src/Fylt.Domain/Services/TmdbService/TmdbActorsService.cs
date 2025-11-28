using Fylt.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.Json.Nodes;

public class TmdbActorsService
{
    private readonly HttpClient _httpClient;
    private readonly FyltContext _context;
    private readonly ILogger<TmdbActorsService> _logger;

    public TmdbActorsService(FyltContext context, HttpClient httpClient, ILogger<TmdbActorsService> logger)
    {
        _context = context;
        _httpClient = httpClient;
        _logger = logger;
    }

    private async Task<string> GetApiKeyAsync()
    {
        var key = await _context.ApiKeys
            .Where(a => EF.Functions.ILike(a.Nombre, "tmdb"))
            .Select(a => a.Direccion)       // ← ESTE ES EL CAMPO CORRECTO
            .FirstOrDefaultAsync();

        if (string.IsNullOrWhiteSpace(key))
            throw new InvalidOperationException("TMDB API Key missing in database!");

        return key;
    }

    public async Task<JsonArray> GetPopularActorsAsync()
    {
        var apiKey = await GetApiKeyAsync();

        var url = $"https://api.themoviedb.org/3/person/popular?api_key={apiKey}&language=es-ES";

        var response = await _httpClient.GetStringAsync(url);

        var json = JsonNode.Parse(response);
        return json?["results"]?.AsArray() ?? new JsonArray();
    }
}
