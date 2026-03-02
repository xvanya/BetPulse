using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace SportsPlatform.Services;

public class EmailService
{
    public async Task SendEmailAsync(string toEmail, string subject, string body)
    {
        var email = new MimeMessage();

        email.From.Add(new MailboxAddress("BetPulse", "betpulse0@gmail.com"));
     
        email.To.Add(new MailboxAddress("", toEmail));
        email.Subject = subject;

        var builder = new BodyBuilder { HtmlBody = body };
        email.Body = builder.ToMessageBody();

        using var smtp = new SmtpClient();

        await smtp.ConnectAsync("smtp.gmail.com", 587, SecureSocketOptions.StartTls);

        await smtp.AuthenticateAsync("betpulse0@gmail.com", "onrq jkqw frpg xdto");

        await smtp.SendAsync(email);
        await smtp.DisconnectAsync(true);
    }
}