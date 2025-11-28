using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fylt.Infrastructure.DAOs
{
    public class RankingItem
    {
        public int Id { get; set; }
        public int IdRanking { get; set; }
        public int IdPelicula { get; set; }
        public int Posicion { get; set; }
        public float? Score { get; set; }

        public Ranking? Ranking { get; set; }
        public Pelicula? Pelicula { get; set; }
    }
}
