using Microsoft.EntityFrameworkCore;
using SportsPlatform.Data;
using SportsPlatform.Services;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// безпечний CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // <--- Отут додали закриваючу дужку!
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

builder.Services.AddControllers();
//builder.Services.AddEndpointsApiExplorer();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string not found");

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(connectionString);
});

builder.Services.AddHttpClient();
builder.Services.AddScoped<SportService>();
builder.Services.AddScoped<CompetitionService>();
builder.Services.AddScoped<PromotionService>();
builder.Services.AddScoped<BetService>();
builder.Services.AddScoped<EmailService>();
//builder.Services.AddHostedService<SportsPlatform.Services.SportsSyncService>();
//оце розкоментувати тільки коли треба буде синхронізація

// Налаштування Аутентифікації (JWT) 
builder.Services.AddAuthentication().AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        ValidateAudience = false,
        ValidateIssuer = false,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration.GetSection("AppSettings:Token").Value!))
    };
});

builder.Services.AddOpenApi();

var app = builder.Build();

app.MapOpenApi();

app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/openapi/v1.json", "v1");
    options.OAuthUsePkce();
});

app.UseHttpsRedirection();

// 🔥 Використовуємо нашу нову політику замість "AllowAll"
app.UseCors("FrontendPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();