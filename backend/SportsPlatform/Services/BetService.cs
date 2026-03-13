using Microsoft.EntityFrameworkCore;
using SportsPlatform.Data;
using SportsPlatform.Domain.Entities;

namespace SportsPlatform.Services;

public class BetService
{
    private readonly AppDbContext _context;

    public BetService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Bet> PlaceBetAsync(int userId, int matchId, string choice, decimal amount, decimal odd)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) throw new ArgumentException("Користувача не знайдено");

            if (user.Balance < amount) throw new ArgumentException("Недостатньо коштів на балансі");

            var match = await _context.Matches.FindAsync(matchId);
            if (match == null) throw new ArgumentException("Матч не знайдено");

            user.Balance -= amount;

            var bet = new Bet
            {
                UserId = userId,
                MatchId = matchId,
                Choice = choice,
                Amount = amount,
                Odd = odd,
                Status = "Pending",
                PotentialWin = amount * odd,
                BetDate = DateTime.UtcNow
            };

            _context.Bets.Add(bet);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return bet;
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<List<Bet>> GetUserBetsAsync(int userId)
    {
        return await _context.Bets
            .Include(b => b.Match)
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.BetDate)
            .ToListAsync();
    }
}