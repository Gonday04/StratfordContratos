using System;

namespace StratfordAPI.Models
{
    public class Candidato
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Apellido { get; set; }
        public string Correo { get; set; }
        public string Contrasena { get; set; }
        public string Telefono { get; set; }
        public string Carrera { get; set; }
        public DateTime FechaRegistro { get; set; } = DateTime.Now;
    }
}