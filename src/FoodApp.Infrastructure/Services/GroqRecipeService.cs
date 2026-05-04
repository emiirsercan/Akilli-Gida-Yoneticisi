using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using FoodApp.Application.DTOs.Recipes;
using FoodApp.Application.Services;
using Microsoft.Extensions.Configuration;

namespace FoodApp.Infrastructure.Services;

public class GroqRecipeService : IRecipeService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _model;

    public GroqRecipeService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _apiKey = configuration["GroqSettings:ApiKey"]!;
        _model = configuration["GroqSettings:Model"] ?? "llama3-70b-8192";
    }

    public async Task<RecipeSuggestionResponse> GetSuggestionsAsync(List<string> ingredients)
    {
        var ingredientList = string.Join(", ", ingredients);

        var systemPrompt = "Sen 20 yıllık deneyime sahip bir Türk mutfağı şefisin. " +
            "Kullanıcının verdiği malzemelere göre FARKLI pişirme teknikleri kullanan (kavurma, haşlama, fırın, wok vb.), " +
            "birbirinden tamamen farklı tarifler öneriyorsun. " +
            "Her tarif için malzeme miktarlarını gram/adet olarak belirtiyorsun. " +
            "Adımları çok net, sıralı ve detaylı yazıyorsun. " +
            "Sadece geçerli JSON döndürüyorsun, kesinlikle başka metin yazmıyorsun.";

        var userPrompt = "Elimdeki malzemeler: " + ingredientList + "\n\n" +
            "GÖREV: Bu malzemeleri kullanarak 3 FARKLI tarif öner. Tarifler birbirinden tamamen farklı olsun " +
            "(örn: biri çorba, biri ana yemek, biri atıştırmalık). " +
            "Her tarif için en az 5 adım olsun. Malzeme miktarlarını yaz.\n\n" +
            "Aşağıdaki JSON formatını kullan:\n\n" +
            "{\n" +
            "  \"recipes\": [\n" +
            "    {\n" +
            "      \"name\": \"Tarif Adı\",\n" +
            "      \"description\": \"Bu tarifi neden yapmalısın ve nasıl bir lezzet sunar (2-3 cümle)\",\n" +
            "      \"ingredients\": [\"200g domates\", \"2 adet yumurta\", \"1 çay kaşığı tuz\"],\n" +
            "      \"steps\": [\n" +
            "        { \"stepNumber\": 1, \"description\": \"Detaylı adım açıklaması (sıcaklık, süre, teknik dahil)\" },\n" +
            "        { \"stepNumber\": 2, \"description\": \"Detaylı adım açıklaması\" },\n" +
            "        { \"stepNumber\": 3, \"description\": \"Detaylı adım açıklaması\" },\n" +
            "        { \"stepNumber\": 4, \"description\": \"Detaylı adım açıklaması\" },\n" +
            "        { \"stepNumber\": 5, \"description\": \"Detaylı adım açıklaması\" }\n" +
            "      ],\n" +
            "      \"prepTime\": \"25 dakika\",\n" +
            "      \"difficulty\": \"Kolay\",\n" +
            "      \"tips\": \"Bu tarifi daha lezzetli yapacak pratik ipucu veya püf nokta\"\n" +
            "    }\n" +
            "  ]\n" +
            "}\n\n" +
            "KURALLAR: Sadece JSON döndür. difficulty değeri 'Kolay', 'Orta' veya 'Zor' olmalı. 3 tarif öner.";

        var requestBody = new
        {
            model = _model,
            messages = new[]
            {
                new { role = "system", content = systemPrompt },
                new { role = "user",   content = userPrompt }
            },
            temperature = 0.8,
            max_tokens = 4096,
            response_format = new { type = "json_object" }
        };

        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        _httpClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", _apiKey);

        var response = await _httpClient.PostAsync(
            "https://api.groq.com/openai/v1/chat/completions", content);

        var responseBody = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
            throw new Exception($"Groq API hatası: {responseBody}");

        using var doc = JsonDocument.Parse(responseBody);
        var text = doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString() ?? "{}";

        // JSON bloğunu temizle
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
