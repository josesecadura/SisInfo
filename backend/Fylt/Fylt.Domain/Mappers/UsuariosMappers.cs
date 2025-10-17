using Fylt.Domain.VOs.UsuariosVOs;
using Fylt.Infrastructure.DAOs;

namespace Fylt.Domain.Mappers
{
    internal static class UsuariosMappers
    {
        public static UsuarioVO ToVO(Usuario entity)
        {
            if (entity == null) return null!;

            return new UsuarioVO
            {
                Id = entity.Id,
                RealName = entity.RealName,
                Username = entity.Username,
                Descripcion = entity.Descripcion,
                Seguidores = entity.Seguidores,
                Seguidos = entity.Seguidos,
                Foto = entity.Foto,
                BoolAdmin = entity.BoolAdmin
            };
        }

        public static Usuario ToEntity(UsuarioVO vo)
        {
            if (vo == null) return null!;

            return new Usuario
            {
                Id = vo.Id,
                RealName = vo.RealName,
                Username = vo.Username,
                Descripcion = vo.Descripcion,
                Seguidores = vo.Seguidores,
                Seguidos = vo.Seguidos,
                Foto = vo.Foto,
                BoolAdmin = vo.BoolAdmin
            };
        }

        public static Usuario ToEntity(CreateUsuarioVO vo)
        {
            if (vo == null) return null!;

            return new Usuario
            {
                RealName = vo.RealName,
                Username = vo.Username,
                Descripcion = vo.Descripcion,
                Seguidores = vo.Seguidores,
                Seguidos = vo.Seguidos,
                Foto = vo.Foto,
                Password = vo.Password,
                BoolAdmin = vo.BoolAdmin
            };
        }

        public static IEnumerable<UsuarioVO> ToVOList(IEnumerable<Usuario> entities) => entities.Select(ToVO);
        public static IEnumerable<Usuario> ToEntityList(IEnumerable<UsuarioVO> vos) => vos.Select(ToEntity);
    }
}
