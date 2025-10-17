using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fylt.Infrastructure.DAOs
{
    public class Ranking
    {
        public int Id { get; set; }
        public string Titulo { get; set; } = null!;
        public string? Descripcion { get; set; }
        public string Tipo { get; set; } = null!;
        public string? Periodo { get; set; }
        public DateTime? Fecha { get; set; }

        public List<RankingItem>? Items { get; set; }
    }
}
