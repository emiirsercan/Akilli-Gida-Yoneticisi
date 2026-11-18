using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using FoodApp.Application.DTOs.Recipes;
using FoodApp.Application.Services;
using Microsoft.Extensions.Configuration;

namespace FoodApp.Infrastructure.Services;

public class GroqRecipeService : IRecipeService
{
    private const string DefaultModel = "openai/gpt-oss-120b";

    private const string SystemPrompt = """
        Sen bir Türk mutfağı şefisin. Kullanıcının mesajındaki JSON dizisini malzeme adları olarak değerlendir.
        Türkçe, evde uygulanabilir, birbirinden farklı üç tarif öner. Her tarif listeden en az bir
        malzeme kullanmalı. Gerekli tüm malzemeler kullanıcının listesinde olmalı. Sadece su, tuz,
        yemeklik yağ ve kuru baharatlar bu kuralın dışında. Örneğin listede yoksa domates, un veya
        biber gerektiren bir tarif seçme. Tarif kullanıcının malzemeleriyle tek başına yapılabilmeli.
        Lezzet için en fazla bir ek malzeme önerebilirsin. Malzeme listesinde "isteğe bağlı" yaz,
        ilgili adımı koşullu tarif et ve püf noktasında nasıl atlanacağını belirt.
        "ingredients" alanındaki her satıra sayıyla yazılmış bir miktar ekle. Örnek:
        "2 adet yumurta", "150 g yoğurt", "1 tutam tuz", "1 çay kaşığı nane (isteğe bağlı)".
        Sadece malzeme adı yazma. Her tarifin en az beş sıralı adımı olsun.
        Süreyi dakika cinsinden yaz. Pişirme süresini, ateş ayarını ve gerekiyorsa fırın sıcaklığını
        ilgili adımda belirt. Yanıtı verilen JSON şemasına göre oluştur.
        """;

    private static readonly JsonElement RecipeSchema = JsonSerializer.Deserialize<JsonElement>("""
        {
          "type": "object",
          "properties": {
            "recipes": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "name": { "type": "string" },
                  "description": { "type": "string" },
                  "ingredients": {
                    "type": "array",
                    "items": {
                      "type": "string",
                      "description": "Kullanıcının malzemesi veya temel kiler malzemesi ve sayısal miktarı. Liste dışı ek malzemeyi isteğe bağlı olarak işaretle. Örnek: 150 g yoğurt."
                    }
                  },
                  "steps": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "stepNumber": { "type": "integer" },
                        "description": { "type": "string" }
                      },
                      "required": ["stepNumber", "description"],
                      "additionalProperties": false
                    }
                  },
                  "prepTime": { "type": "string" },
                  "difficulty": { "type": "string", "enum": ["Kolay", "Orta", "Zor"] },
                  "tips": { "type": "string" }
                },
                "required": ["name", "description", "ingredients", "steps", "prepTime", "difficulty", "tips"],
                "additionalProperties": false
              }
            }
          },
          "required": ["recipes"],
          "additionalProperties": false
        }
        """);

    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _model;

    public GroqRecipeService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _apiKey = configuration["GroqSettings:ApiKey"] ?? "";
        _model = configuration["GroqSettings:Model"] ?? DefaultModel;
    }

    public async Task<RecipeSuggestionResponse> GetSuggestionsAsync(List<string> ingredients)
    {
        var requestBody = new
        {
            model = _model,
            messages = new[]
            {
                new { role = "system", content = SystemPrompt },
                new { role = "user", content = JsonSerializer.Serialize(ingredients) }
            },
            temperature = 0.4,
            reasoning_effort = "medium",
            max_completion_tokens = 4096,
            response_format = new
            {
                type = "json_schema",
                json_schema = new { name = "recipe_suggestions", strict = true, schema = RecipeSchema }
            }
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.groq.com/openai/v1/chat/completions");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
        request.Content = JsonContent.Create(requestBody);

        using var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();

        using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var choice = document.RootElement.GetProperty("choices")[0];
        var text = choice.GetProperty("message").GetProperty("content").GetString();
        if (choice.GetProperty("finish_reason").GetString() != "stop" || string.IsNullOrWhiteSpace(text))
            throw new JsonException("Groq did not return a complete recipe response.");

        var result = JsonSerializer.Deserialize<RecipeSuggestionResponse>(text, JsonSerializerOptions.Web);
        if (result?.Recipes is not { Count: 3 } || result.Recipes.Any(recipe => recipe.Steps.Count < 5))
            throw new JsonException("Groq did not return three recipes with at least five steps each.");

        return result;
    }
}
