using Microsoft.EntityFrameworkCore;
using SportsPlatform.Data;
using SportsPlatform.Domain.Entities;
using SportsPlatform.Dtos;

namespace SportsPlatform.Services;

public class SportService
{
    private readonly AppDbContext _context;

    public SportService(AppDbContext context)
    {
        _context = context;
    }

    // Цей метод для адмінки 
    public async Task<List<Sport>> GetAllAsync()
    {
        return await _context.Sports
            .Include(s => s.Competitions)
            .OrderBy(s => s.Name)
            .ToListAsync();
    }

    public async Task<List<SportSidebarDto>> GetSidebarDataAsync()
    {
        var result = await _context.Sports
            .OrderBy(s => s.Id)
            .Select(s => new SportSidebarDto
            {
                Id = s.Id,
                Name = s.Name,
                Competitions = s.Competitions.Select(c => new CompetitionSidebarDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Country = c.Country ?? "Світ",
                    Count = _context.Matches.Count(m => m.CompetitionId == c.Id)
                }).ToList()
            })
            .ToListAsync(); 

        return result;
    }

    public async Task<Sport> CreateAsync(string name)
    {
        var sport = new Sport { Name = name };
        _context.Sports.Add(sport);
        await _context.SaveChangesAsync();
        return sport;
    }

    public async Task UpdateAsync(int id, string newName)
    {
        var sport = await _context.Sports.FindAsync(id);
        if (sport == null) throw new ArgumentException("Спорт не знайдено");

        sport.Name = newName;
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var sport = await _context.Sports.FindAsync(id);
        if (sport == null) throw new ArgumentException("Спорт не знайдено");

        _context.Sports.Remove(sport);
        await _context.SaveChangesAsync();
    }
}