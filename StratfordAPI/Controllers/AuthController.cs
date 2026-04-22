using Microsoft.AspNetCore.Mvc;
using StratfordAPI.Data;
using StratfordAPI.Models;
using System.Linq;

namespace StratfordAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            var candidato = _context.Candidatos
                .FirstOrDefault(c => c.Correo == request.Correo && c.Contrasena == request.Contrasena);

            if (candidato == null)
            {
                return Unauthorized(new { mensaje = "Correo o contraseña incorrectos" });
            }

            return Ok(new { 
                mensaje = "¡Login exitoso!",
                nombreCompleto = $"{candidato.Nombre} {candidato.Apellido}",
                carrera = candidato.Carrera
            });
        }

        [HttpPost("registro")]
        public IActionResult Registro([FromBody] RegistroRequest request)
        {
            var correoExiste = _context.Candidatos.Any(c => c.Correo == request.Correo);
            
            if (correoExiste)
            {
                return BadRequest(new { mensaje = "Este correo ya está registrado. Intenta iniciar sesión." });
            }

            var nuevoCandidato = new Candidato
            {
                Nombre = request.Nombre,
                Apellido = request.Apellido,
                Correo = request.Correo,
                Contrasena = request.Contrasena,
                Telefono = request.Telefono,
                Carrera = request.Carrera,
                FechaRegistro = System.DateTime.Now
            };

            _context.Candidatos.Add(nuevoCandidato);
            _context.SaveChanges();

            return Ok(new { mensaje = "¡Candidato registrado con éxito en MySQL!" });
        }
    }
}