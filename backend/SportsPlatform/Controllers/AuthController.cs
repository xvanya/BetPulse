using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SportsPlatform.Data;
using SportsPlatform.Dtos;
using SportsPlatform.Domain.Entities;
using SportsPlatform.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Google.Apis.Auth;

namespace SportsPlatform.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly EmailService _emailService;

    public AuthController(AppDbContext context, IConfiguration configuration, EmailService emailService)
    {
        _context = context;
        _configuration = configuration;
        _emailService = emailService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<User>> Register(RegisterDto request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            return BadRequest("Користувач вже існує.");

        // Хешування паролю
        string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        // ім'я генерується автоматично
        string generatedName = request.Email.Contains("@")
            ? request.Email.Split('@')[0]
            : "User";

        var user = new User
        {
            Email = request.Email,
            PasswordHash = passwordHash,
            Name = generatedName,
            Role = "User"
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok("Реєстрація успішна");
    }

    [HttpPost("login")]
    public async Task<ActionResult<object>> Login(LoginDto request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null)
            return BadRequest("Користувача не знайдено.");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return BadRequest("Невірний пароль.");

        if (user.IsBanned)
        {
            if (user.BanEndDate == null)
                return BadRequest("Ваш акаунт заблоковано назавжди.");

            if (user.BanEndDate > DateTime.UtcNow)
                return BadRequest($"Ваш акаунт заблоковано до {user.BanEndDate.Value.ToLocalTime():dd.MM.yyyy HH:mm}.");

            user.IsBanned = false;
            user.BanEndDate = null;
            await _context.SaveChangesAsync();
        }

        string token = CreateToken(user);

        return Ok(new
        {
            token = token,
            role = user.Role,
            email = user.Email,
            id = user.Id
        });
    }

    [HttpPost("google-login")]
    public async Task<ActionResult<object>> GoogleLogin([FromBody] GoogleLoginRequest request)
    {
        try
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings()
            {
                Audience = new List<string>() { "29588120359-ppkbibh856jnf6t5qh5gr4iu7tlu21jq.apps.googleusercontent.com" }
            };

            var payload = await GoogleJsonWebSignature.ValidateAsync(request.Credential, settings);

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == payload.Email);

            if (user == null)
            {
                user = new User
                {
                    Email = payload.Email,
                    Name = payload.Name ?? payload.Email.Split('@')[0],
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString() + "A1!"),
                    Role = "User"
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }

            if (user.IsBanned)
            {
                if (user.BanEndDate == null)
                    return BadRequest("Ваш акаунт заблоковано назавжди.");

                if (user.BanEndDate > DateTime.UtcNow)
                    return BadRequest($"Ваш акаунт заблоковано до {user.BanEndDate.Value.ToLocalTime():dd.MM.yyyy HH:mm}.");

                user.IsBanned = false;
                user.BanEndDate = null;
                await _context.SaveChangesAsync();
            }

            string token = CreateToken(user);
            return Ok(new
            {
                token = token,
                role = user.Role,
                email = user.Email,
                id = user.Id
            });
        }
        catch (InvalidJwtException)
        {
            return BadRequest("Недійсний токен Google.");
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Помилка сервера: " + ex.Message);
        }
    }

    private string CreateToken(User user)
    {
        List<Claim> claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration.GetSection("AppSettings:Token").Value!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.Now.AddDays(1),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null)
        {
            return BadRequest("Користувача з такою поштою не знайдено");
        }

        user.ResetToken = Guid.NewGuid().ToString();
        user.ResetTokenExpiry = DateTime.UtcNow.AddHours(1);

        await _context.SaveChangesAsync();

        var resetLink = $"http://localhost:5173/reset-password?token={user.ResetToken}&email={user.Email}";

        var emailBody = $@"
            <div style='font-family: Arial, sans-serif; background-color: #1a1a1a; color: #fff; padding: 20px; border-radius: 10px;'>
                <h2 style='color: #fee000;'>Відновлення паролю на BetPulse</h2>
                <p>Ви (або хтось інший) запросили скидання паролю для вашого акаунту.</p>
                <p>Щоб створити новий пароль, натисніть на кнопку нижче:</p>
                <a href='{resetLink}' style='background-color: #fee000; color: #000; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block; margin: 10px 0;'>Оновити пароль</a>
                <p style='color: #aeb5bc; font-size: 12px; margin-top: 20px;'>Якщо ви цього не робили, просто проігноруйте цей лист. Посилання дійсне 1 годину.</p>
            </div>";

        await _emailService.SendEmailAsync(user.Email, "Відновлення паролю - BetPulse", emailBody);

        return Ok("Лист надіслано");
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null || user.ResetToken != request.Token || user.ResetTokenExpiry < DateTime.UtcNow)
        {
            return BadRequest("Недійсний або прострочений токен. Спробуйте ще раз.");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

        user.ResetToken = null;
        user.ResetTokenExpiry = null;

        await _context.SaveChangesAsync();

        return Ok("Пароль успішно оновлено");
    }
}

public class GoogleLoginRequest
{
    public string Credential { get; set; } = string.Empty;
}

public class ForgotPasswordRequest
{
    public string Email { get; set; } = string.Empty;
}

public class ResetPasswordRequest
{
    public string Email { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}