using Fylt.Domain.VOs.PeliculasVO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Nodes;
using System.Threading.Tasks;

namespace Fylt.Domain.Clients.TMDBClient
{
    public interface ITMDBClient
    {
        Task<List<PeliculaVO>> ImportarPeliculas();
        Task<JsonArray> ImportarActores();
    }
}
