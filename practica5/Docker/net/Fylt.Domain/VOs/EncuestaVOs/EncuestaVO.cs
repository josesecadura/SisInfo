using System;

namespace Fylt.Domain.VOs.EncuestaVOs
{
    public class EncuestaVO
    {
        public int Id { get; set; }
        public int IdAdmin { get; set; }
        public string Pregunta { get; set; } = string.Empty;
        public DateTime? Fecha { get; set; }
        public string Opcion1 { get; set; } = string.Empty;
        public string Opcion2 { get; set; } = string.Empty;
        public string? Opcion3 { get; set; }
        public string? Opcion4 { get; set; }
        public int Porcentaje1 { get; set; } = 0;
        public int Porcentaje2 { get; set; } = 0;
        public int Porcentaje3 { get; set; } = 0;
        public int Porcentaje4 { get; set; } = 0;
        public bool Activo { get; set; } = true;
    }
}
