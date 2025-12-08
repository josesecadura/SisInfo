using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fylt.Domain.VOs.ActividadesVOs
{
    public class ActividadEstadisticaVO
    {
        public int TotalLoginsExitosos7Dias { get; set; }
        public int TotalLoginsFallidos7Dias { get; set; }
        public int TotalNuevosUsuarios7Dias { get; set; }
        public int TotalComentariosCreados7Dias { get; set; } 
        public int TotalLikesComentarios7Dias { get; set; }

        public double RatioLoginExito { get; set; } 

        public List<ActividadTrendData> TendenciaLoginsExitosos7Dias { get; set; } = new List<ActividadTrendData>();

        public List<ActividadTrendData> TendenciaNuevosUsuarios7Dias { get; set; } = new List<ActividadTrendData>();
    }
}
