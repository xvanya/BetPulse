using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging; 
using SportsPlatform.Services;

namespace SportsPlatform.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BetsController : ControllerBase
{
    private readonly BetService _service;
    private readonly ILogger<BetsController> _logger; 
    public BetsController(BetService service, ILogger<BetsController> logger)
    {
        _service = service;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> PlaceBet(CreateBetRequest request)
    {
        try
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var bet = await _service.PlaceBetAsync(userId, request.MatchId, request.Choice, request.Amount, request.Odd);

            return Ok(new { message = "Ставку прийнято!", betId = bet.Id, potentialWin = bet.PotentialWin });
        }
        catch (ArgumentException ex) 
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex) 
        {
            _logger.LogError(ex, "Критична помилка при створенні ставки.");

            return StatusCode(500, new { message = "Сталася внутрішня помилка сервера. Спробуйте пізніше." });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetMyBets()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var bets = await _service.GetUserBetsAsync(userId);
        return Ok(bets);
    }
}

public class CreateBetRequest
{
    public int MatchId { get; set; }
    public string Choice { get; set; } = null!;
    public decimal Amount { get; set; }
    public decimal Odd { get; set; }
}