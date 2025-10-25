using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fylt.Domain.VOs.ComentarioVOs
{
    public class CreateComentarioVO
    {
        public int IdUser { get; set; }
        public int IdPelicula { get; set; }
        public string? Descripcion { get; set; }
        public int NumLikes { get; set; } = 0;
    }
}
