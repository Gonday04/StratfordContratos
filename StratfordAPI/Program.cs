using Microsoft.EntityFrameworkCore;
using StratfordAPI.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Le decimos a C# que lea la contraseña y encienda tu motor "AppDbContext"
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// 2. Configuramos los permisos (CORS) para que tu página web pueda hablar con este servidor
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();

var app = builder.Build();

// 3. Activamos los permisos
app.UseCors("PermitirFrontend");

app.UseAuthorization();
app.MapControllers();

app.Run();