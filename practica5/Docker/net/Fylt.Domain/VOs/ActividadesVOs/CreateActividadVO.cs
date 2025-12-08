using System;

namespace Fylt.Domain.VOs.ActividadesVOs
{
    public class CreateActividadVO
    {
        public int? IdUsuario { get; set; }
        public string? TipoActividad { get; set; }
        public DateTime? FechaAccion { get; set; }
        public string? Detalles { get; set; }
    }
}
