using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using SportsPlatform.Data;
using SportsPlatform.Domain.Entities;
using Microsoft.Extensions.Logging;
using System.Net.Http.Json;
using Microsoft.Extensions.Configuration;

namespace SportsPlatform.Services;

public class SportsSyncService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<SportsSyncService> _logger;
    private readonly string _apiKey;

    public SportsSyncService(
        IServiceProvider serviceProvider,
        ILogger<SportsSyncService> logger,
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _apiKey = configuration["ApiKeys:SportsApi"];
        _httpClientFactory = httpClientFactory;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("СЕРВІС СИНХРОНІЗАЦІЇ ЗАПУЩЕНО! ЧЕКАЄМО СТАРТУ...");

        await Task.Delay(5000, stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await SyncDataAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError($"КРИТИЧНА ПОМИЛКА СЕРВІСУ: {ex.Message}");
            }

            await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
        }
    }

    private async Task SyncDataAsync()
    {
        _logger.LogInformation("ПОЧИНАЮ ЗАВАНТАЖЕННЯ ДАНИХ...");

        using (var scope = _serviceProvider.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            foreach (var league in _leagues)
            {
                try
                {
                    var sport = await context.Sports.FirstOrDefaultAsync(s => s.Name == league.SportName);
                    if (sport == null)
                    {
                        sport = new Sport { Name = league.SportName };
                        context.Sports.Add(sport);
                        await context.SaveChangesAsync();
                    }

                    var competition = await context.Competitions
                        .FirstOrDefaultAsync(c => c.Name == league.CompetitionName && c.SportId == sport.Id);

                    if (competition == null)
                    {
                        competition = new Competition
                        {
                            Name = league.CompetitionName,
                            SportId = sport.Id,
                            Country = league.Country
                        };
                        context.Competitions.Add(competition);
                        await context.SaveChangesAsync();
                        _logger.LogInformation($"СТВОРЕНО ЛІГУ: {league.CompetitionName} -> {league.Country}");
                    }
                    else if (competition.Country != league.Country || string.IsNullOrEmpty(competition.Country))
                    {
                        competition.Country = league.Country;
                        await context.SaveChangesAsync();
                        _logger.LogInformation($"ОНОВЛЕНО КРАЇНУ: {league.CompetitionName} -> {league.Country}");
                    }

                    var client = _httpClientFactory.CreateClient();

                    var url = $"https://api.the-odds-api.com/v4/sports/{league.Key}/odds/?apiKey={_apiKey}&regions=eu&markets=h2h";
                    var response = await client.GetAsync(url);

                    if (!response.IsSuccessStatusCode)
                    {
                        var err = await response.Content.ReadAsStringAsync();
                        _logger.LogError($"ПОМИЛКА API ({league.Key}): {response.StatusCode} - {err}");
                        continue;
                    }

                    var apiMatches = await response.Content.ReadFromJsonAsync<List<ApiMatchDto>>();

                    if (apiMatches == null || apiMatches.Count == 0)
                    {
                        _logger.LogWarning($"НЕМАЄ МАТЧІВ ДЛЯ: {league.CompetitionName}");
                        continue;
                    }

                    int added = 0;
                    int updated = 0;

                    foreach (var item in apiMatches)
                    {
                        var dbMatch = await context.Matches.FirstOrDefaultAsync(m => m.ExternalId == item.id);

                        var bookmaker = item.bookmakers?.FirstOrDefault();
                        var market = bookmaker?.markets?.FirstOrDefault(m => m.key == "h2h");
                        double o1 = 1.0, o2 = 1.0, oX = 1.0;
                        if (market?.outcomes != null)
                        {
                            o1 = market.outcomes.FirstOrDefault(o => o.name == item.home_team)?.price ?? 1.0;
                            o2 = market.outcomes.FirstOrDefault(o => o.name == item.away_team)?.price ?? 1.0;
                            oX = market.outcomes.FirstOrDefault(o => o.name == "Draw")?.price ?? 1.0;
                        }

                        if (dbMatch == null)
                        {
                            context.Matches.Add(new Match
                            {
                                ExternalId = item.id,
                                Team1 = item.home_team,
                                Team2 = item.away_team,
                                StartTime = item.commence_time,
                                Odds1 = o1,
                                Odds2 = o2,
                                OddsX = oX,
                                CompetitionId = competition.Id,
                                IsManual = false
                            });
                            added++;
                        }
                        else if (!dbMatch.IsManual)
                        {
                            dbMatch.StartTime = item.commence_time;
                            dbMatch.Odds1 = o1; dbMatch.Odds2 = o2; dbMatch.OddsX = oX;
                            updated++;
                        }
                    }
                    await context.SaveChangesAsync();
                    _logger.LogInformation($"{league.CompetitionName}: +{added} нових, ~{updated} оновлених матчів.");
                }
                catch (Exception ex)
                {
                    _logger.LogError($"ПОМИЛКА ОБРОБКИ ({league.Key}): {ex.Message}");
                }
            }
        }
        _logger.LogInformation("СИНХРОНІЗАЦІЯ ЗАВЕРШЕНА.");
    }

    private readonly List<(string Key, string SportName, string CompetitionName, string Country)> _leagues = new()
    {
        ("soccer_epl", "Футбол", "Прем'єр-ліга Англії", "Англія"),
        ("soccer_uefa_champs_league", "Футбол", "Ліга Чемпіонів", "Європа"),
        ("basketball_nba", "Баскетбол", "NBA", "США"),
        ("tennis_atp_wimbledon", "Теніс", "Wimbledon", "Англія"),

        ("soccer_spain_la_liga", "Футбол", "Ла Ліга", "Іспанія"),
        ("soccer_italy_serie_a", "Футбол", "Серія А", "Італія"),
        ("soccer_germany_bundesliga", "Футбол", "Бундесліга", "Німеччина"),
        ("soccer_france_ligue_one", "Футбол", "Ліга 1", "Франція"),
    };

    public class ApiMatchDto
    {
        public string id { get; set; }
        public DateTime commence_time { get; set; }
        public string home_team { get; set; }
        public string away_team { get; set; }
        public List<ApiBookmaker> bookmakers { get; set; }
    }
    public class ApiBookmaker { public List<ApiMarket> markets { get; set; } }
    public class ApiMarket { public string key { get; set; } public List<ApiOutcome> outcomes { get; set; } }
    public class ApiOutcome { public string name { get; set; } public double price { get; set; } }
}