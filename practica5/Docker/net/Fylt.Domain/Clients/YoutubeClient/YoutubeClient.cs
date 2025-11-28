using Fylt.Domain.Clients.YoutubeClient;
using Fylt.Domain.Services.ApiKeyService;
using System.Net.Http;
using System.Text.Json;

public class YoutubeClient : IYoutubeClient
{
    private readonly HttpClient _httpClient;
    private readonly IApiKeyService _apiKeyService;

    public YoutubeClient(HttpClient httpClient, IApiKeyService apiKeyService)
    {
        _httpClient = httpClient;
        _apiKeyService = apiKeyService;
    }

    public async Task<string?> GetTrailerVideoIdAsync(string movieTitle)
    {
        var apiKeys = await _apiKeyService.GetAll();
        var apiKey = apiKeys.FirstOrDefault(x => x.Nombre == "YouTube");

        if (apiKey == null)
            return null;

        string q = $"{movieTitle} trailer español";

        string url =
            $"search?part=snippet&type=video&maxResults=1&q={Uri.EscapeDataString(q)}&key={apiKey.Direccion}";

        var response = await _httpClient.GetAsync(url);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync();
        var doc = JsonDocument.Parse(json);

        var item = doc.RootElement
            .GetProperty("items")
            .EnumerateArray()
            .FirstOrDefault();

        if (item.ValueKind == JsonValueKind.Undefined)
            return null;

        string videoId = item
            .GetProperty("id")
            .GetProperty("videoId")
            .GetString()!;

        return videoId;
    }
}
