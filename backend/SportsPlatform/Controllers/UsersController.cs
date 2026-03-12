using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SportsPlatform.Data;
using SportsPlatform.Domain.Entities;
using BCrypt.Net;

namespace SportsPlatform.Controllers;

[Route("api/profile")]
[ApiController]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    private int GetCurrentUserId()
    {
        return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }

    [HttpGet]
    public async Task<ActionResult> GetProfile()
    {
        var userId = GetCurrentUserId();
        var user = await _context.Users.FindAsync(userId);

        if (user == null) return NotFound();

        return Ok(new
        {
            user.Id,
            user.Name,
            user.Email,
            user.Balance
        });
    }

    [HttpPut("update-email")]
    public async Task<IActionResult> UpdateEmail([FromBody] UpdateEmailRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || !request.Email.Contains("@"))
            return BadRequest("Некоректний формат пошти");

        var userId = GetCurrentUserId();
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        if (user.Email == request.Email)
            return BadRequest("Введіть нову пошту");

        var emailTaken = await _context.Users.AnyAsync(u => u.Email == request.Email && u.Id != userId);
        if (emailTaken)
            return BadRequest("Ця електронна пошта вже використовується іншим користувачем");

        user.Email = request.Email;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Пошту успішно оновлено", newEmail = user.Email });
    }

    [HttpPut("update-name")]
    public async Task<IActionResult> UpdateName([FromBody] UpdateNameRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest("Ім'я не може бути пустим");

        var userId = GetCurrentUserId();
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        user.Name = request.Name;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Ім'я успішно оновлено", newName = user.Name });
    }

    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
    {
        var userId = GetCurrentUserId();
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        if (!BCrypt.Net.BCrypt.Verify(request.OldPassword, user.PasswordHash))
        {
            return BadRequest("Старий пароль неправильний");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

        await _context.SaveChangesAsync();
        return Ok("Пароль успішно змінено");
    }

    [HttpPost("favorites/{competitionId}")]
    public async Task<IActionResult> AddFavorite(int competitionId)
    {
        var userId = GetCurrentUserId();

        var compExists = await _context.Competitions.AnyAsync(c => c.Id == competitionId);
        if (!compExists) return NotFound("Змагання не існує");

        var exists = await _context.Favorites.AnyAsync(f => f.UserId == userId && f.CompetitionId == competitionId);
        if (exists) return BadRequest("Вже в улюбленому");

        var favorite = new Favorite { UserId = userId, CompetitionId = competitionId };
        _context.Favorites.Add(favorite);
        await _context.SaveChangesAsync();
        return Ok("Додано в улюблене");
    }

    [HttpGet("favorites")]
    public async Task<IActionResult> GetFavorites()
    {
        var userId = GetCurrentUserId();
        var favorites = await _context.Favorites
            .Include(f => f.Competition)
            .Where(f => f.UserId == userId)
            .Select(f => new
            {
                Id = f.Id,
                CompetitionId = f.CompetitionId,
                CompetitionName = f.Competition!.Name,
                Country = f.Competition.Country
            })
            .ToListAsync();

        return Ok(favorites);
    }

    [HttpDelete("favorites/{id}")]
    public async Task<IActionResult> RemoveFavorite(int id)
    {
        var userId = GetCurrentUserId();
        var favorite = await _context.Favorites.FirstOrDefaultAsync(f => f.Id == id && f.UserId == userId);

        if (favorite == null) return NotFound("Не знайдено в улюблених");

        _context.Favorites.Remove(favorite);
        await _context.SaveChangesAsync();
        return Ok("Видалено з улюблених");
    }

    [HttpGet("bets")]
    public async Task<ActionResult<List<Bet>>> GetMyBets()
    {
        var userId = GetCurrentUserId();
        return await _context.Bets
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.Id)
            .ToListAsync();
    }

    [HttpGet("/api/users")]
    [AllowAnonymous]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<User>>> GetAllUsers()
    {
        var users = await _context.Users
            .Select(u => new { u.Id, u.Name, u.Email, u.Role, u.IsBanned, u.BanEndDate })
            .ToListAsync();

        return Ok(users);
    }

    [HttpPut("/api/users/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateUserAsAdmin(int id, [FromBody] UpdateUserRequest request)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound("Користувача не знайдено");

        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            user.Name = request.Name;
        }

        if (!string.IsNullOrWhiteSpace(request.Email) && user.Email != request.Email)
        {
            var emailTaken = await _context.Users.AnyAsync(u => u.Email == request.Email && u.Id != id);
            if (emailTaken) return BadRequest("Ця пошта вже зайнята");
            user.Email = request.Email;
        }

        if (!string.IsNullOrWhiteSpace(request.Role))
        {
            user.Role = request.Role;
        }

        user.IsBanned = request.IsBanned;
        user.BanEndDate = request.BanEndDate;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Користувача оновлено" });
    }

    [HttpPost("deposit")]
    public async Task<IActionResult> Deposit([FromBody] CashierRequest request)
    {
        if (request.Amount <= 0) return BadRequest("Сума має бути більшою за 0");

        var userId = GetCurrentUserId();
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound("Користувача не знайдено");

        user.Balance += request.Amount;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Кошти успішно зараховано!", newBalance = user.Balance });
    }

    [HttpPost("withdraw")]
    public async Task<IActionResult> Withdraw([FromBody] CashierRequest request)
    {
        if (request.Amount < 200) return BadRequest("Мінімальна сума виведення: 200 грн");

        var userId = GetCurrentUserId();
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound("Користувача не знайдено");

        if (user.Balance < request.Amount) return BadRequest("Недостатньо коштів на балансі");

        user.Balance -= request.Amount;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Заявка на виведення успішно оброблена!", newBalance = user.Balance });
    }
}

public class UpdateUserRequest
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsBanned { get; set; }
    public DateTime? BanEndDate { get; set; }
}

public class UpdateNameRequest
{
    public string Name { get; set; } = string.Empty;
}

public class UpdateEmailRequest
{
    public string Email { get; set; } = string.Empty;
}

public class ChangePasswordRequest
{
    public string OldPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

public class CashierRequest
{
    public decimal Amount { get; set; }
}