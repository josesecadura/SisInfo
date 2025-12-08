using System;

namespace Fylt.Domain.VOs.ActividadesVOs
{
    public class ActividadVO
    {
        public int Id { get; set; }
        public int IdUsuario { get; set; }
        public string TipoActividad { get; set; } = null!;
        public DateTime FechaAccion { get; set; }
        public string? Detalles { get; set; }
    }
}
