using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fylt.Domain.VOs.EncuestaVOs
{
    public class CreateEncuestaVO
    {
        public int IdAdmin { get; set; }
        public DateTime? Fecha { get; set; }
        public string Opcion1 { get; set; } = null!;
        public string Opcion2 { get; set; } = null!;
        public string? Opcion3 { get; set; }
        public string? Opcion4 { get; set; }
        public int Porcentaje1 { get; set; } = 0;
        public int Porcentaje2 { get; set; } = 0;
        public int Porcentaje3 { get; set; } = 0;
        public int Porcentaje4 { get; set; } = 0;
    }
}
