using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fylt.Infrastructure.DAOs
{
    public class Actividad
    {
        // Primary key
        public int Id { get; set; }

        // Foreign key to Usuario (nullable to allow anonymous logs)
        public int? IdUsuario { get; set; }

        // Log fields
        public string TipoActividad { get; set; } = null!;
        public DateTime FechaAccion { get; set; }
        public string? Detalles { get; set; }

        // Navigation
        public Usuario? Usuario { get; set; }
    }
}
