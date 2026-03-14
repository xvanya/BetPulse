using Microsoft.EntityFrameworkCore;
using SportsPlatform.Data;
using SportsPlatform.Services;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "https://betpulse-mu.vercel.app/",
                "https://betpulse-ax6pi32am-xvanyas-projects.vercel.app/",
                "https://betpulse-git-main-xvanyas-projects.vercel.app/"
              )
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

builder.Services.AddControllers();

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

app.MapGet("/", () => Results.Ok("BetPulse API is running"));

app.MapOpenApi();

app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/openapi/v1.json", "v1");
    options.OAuthUsePkce();
});

app.UseHttpsRedirection();

app.UseCors("FrontendPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();