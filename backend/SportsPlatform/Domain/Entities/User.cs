namespace SportsPlatform.Domain.Entities;

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty; // Додано для профілю
    public string Role { get; set; } = "User"; // "User" або "Admin"
    public decimal Balance { get; set; } = 10000m;
    public bool IsBanned { get; set; } = false;
    public DateTime? BanEndDate { get; set; }

    //для скидання паролю
    public string? ResetToken { get; set; } 
    public DateTime? ResetTokenExpiry { get; set; }

    // Зв'язки
    public List<Favorite> Favorites { get; set; } = new();
    public List<Bet> Bets { get; set; } = new();
}