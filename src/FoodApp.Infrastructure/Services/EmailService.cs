using FoodApp.Application.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;
using MimeKit.Text;

namespace FoodApp.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        var email = new MimeMessage();
        var fromAddress = _configuration["SmtpSettings:SenderEmail"] ?? "noreply@foodapp.com";
        var senderName = _configuration["SmtpSettings:SenderName"] ?? "FoodApp";

        email.From.Add(new MailboxAddress(senderName, fromAddress));
        email.To.Add(MailboxAddress.Parse(to));
        email.Subject = subject;
        email.Body = new TextPart(TextFormat.Html) { Text = body };

        using var smtp = new SmtpClient();
        
        var host = _configuration["SmtpSettings:Server"];
        var port = int.Parse(_configuration["SmtpSettings:Port"] ?? "587");
        var username = _configuration["SmtpSettings:Username"];
        var password = _configuration["SmtpSettings:Password"];

        // Gerçek kullanım için SMTP ayarlarını yapılandırıyoruz
        await smtp.ConnectAsync(host, port, SecureSocketOptions.StartTls);
        await smtp.AuthenticateAsync(username, password);
        
        await smtp.SendAsync(email);
        await smtp.DisconnectAsync(true);
    }
}
