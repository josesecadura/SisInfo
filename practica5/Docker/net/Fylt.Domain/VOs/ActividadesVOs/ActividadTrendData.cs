using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fylt.Domain.VOs.ActividadesVOs
{
    public class ActividadTrendData
    {
        // Etiqueta para el gráfico (p.ej., "2025-12-07")
        public string Etiqueta { get; set; } = null!;
        // Conteo o valor para esa etiqueta
        public int Valor { get; set; }
    }
}
