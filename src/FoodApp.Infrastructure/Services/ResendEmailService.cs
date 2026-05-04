using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using FoodApp.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace FoodApp.Infrastructure.Services;

public class ResendEmailService : IEmailService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private const string FromAddress = "onboarding@resend.dev";
    private const string FromName = "FoodApp";

    public ResendEmailService(IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        _httpClient = httpClientFactory.CreateClient("Resend");
        _apiKey = configuration["ResendSettings:ApiKey"] ?? throw new Exception("Resend API key is not configured.");
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        var payload = new
        {
            from = $"{FromName} <{FromAddress}>",
            to = new[] { to },
            subject = subject,
            html = body
        };

        var json = JsonSerializer.Serialize(payload);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        _httpClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", _apiKey);

        var response = await _httpClient.PostAsync("https://api.resend.com/emails", content);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new Exception($"Resend API hatası: {error}");
        }
    }
}
