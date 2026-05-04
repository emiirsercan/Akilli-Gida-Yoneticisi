using System.Text;
using System.Text.Json;
using FoodApp.Application.DTOs.Recipes;
using FoodApp.Application.Services;
using Microsoft.Extensions.Configuration;

namespace FoodApp.Infrastructure.Services;

public class GeminiRecipeService : IRecipeService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _model;

    public GeminiRecipeService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _apiKey = configuration["GeminiSettings:ApiKey"]!;
        _model = configuration["GeminiSettings:Model"] ?? "gemini-2.0-flash";
    }

    public async Task<RecipeSuggestionResponse> GetSuggestionsAsync(List<string> ingredients)
    {
        var ingredientList = string.Join(", ", ingredients);

        var prompt = "Sen bir Türk mutfağı uzmanı şefsin. Elimde şu malzemeler var: " + ingredientList + "\n\n" +
            "Bu malzemeleri kullanarak 2-3 farklı pratik tarif öner.\n" +
            "Her tarif için aşağıdaki JSON formatını kullan:\n\n" +
            "{\n" +
            "  \"recipes\": [\n" +
            "    {\n" +
            "      \"name\": \"Tarif Adı\",\n" +
            "      \"description\": \"Kısa açıklama (1-2 cümle)\",\n" +
            "      \"ingredients\": [\"malzeme 1\", \"malzeme 2\"],\n" +
            "      \"steps\": [\n" +
            "        { \"stepNumber\": 1, \"description\": \"Adım açıklaması\" },\n" +
            "        { \"stepNumber\": 2, \"description\": \"Adım açıklaması\" }\n" +
            "      ],\n" +
            "      \"prepTime\": \"20 dakika\",\n" +
            "      \"difficulty\": \"Kolay\",\n" +
            "      \"tips\": \"Pratik ipucu\"\n" +
            "    }\n" +
            "  ]\n" +
            "}\n\n" +
            "SADECE JSON döndür, başka hiçbir şey yazma. JSON dışında hiçbir açıklama ekleme.";

        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new { text = prompt }
                    }
                }
            },
            generationConfig = new
            {
                temperature = 0.7,
                maxOutputTokens = 2048
            }
        };

        var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_model}:generateContent?key={_apiKey}";
        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync(url, content);
        var responseBody = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
            throw new Exception($"Gemini API hatası: {responseBody}");

        using var doc = JsonDocument.Parse(responseBody);
        var text = doc.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString() ?? "{}";

        // JSON bloğunu temizle (```json ... ``` varsa)
        text = text.Trim();
        if (text.StartsWith("```json")) text = text[7..];
        if (text.StartsWith("```"))     text = text[3..];
        if (text.EndsWith("```"))       text = text[..^3];
        text = text.Trim();

        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        var result = JsonSerializer.Deserialize<RecipeSuggestionResponse>(text, options);

        return result ?? new RecipeSuggestionResponse(new List<RecipeSuggestion>());
    }
}
