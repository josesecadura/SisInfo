using System;

namespace Fylt.Domain.VOs.UsuarioSeguidorVOs
{
    // VO público simple para representar un follow
    public class UsuarioSeguidorVO
    {
        public int IdUser { get; set; }
        public int IdAmigo { get; set; }
    }
}