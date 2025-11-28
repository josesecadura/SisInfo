using Fylt.Infrastructure.DAOs;
using System.ComponentModel.DataAnnotations.Schema;

namespace Fylt.Infrastructure.DAOs
{
    public class EncuestaVoto
    {
        public int IdUser { get; set; }
        public Usuario Usuario { get; set; } 

        public int IdEncuesta { get; set; }
        public Encuesta Encuesta { get; set; } 

        public int OpcionVotada { get; set; } 
    }
}