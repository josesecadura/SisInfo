using Fylt.Domain.VOs.ApiKeyVOs;
using Fylt.Infrastructure.DAOs;
using System.Collections.Generic;
using System.Linq;

namespace Fylt.Domain.Mappers
{
    internal static class ApiKeyMappers
    {
        public static ApiKeyVO ToVO(ApiKey entity)
        {
            if (entity == null) return null!;

            return new ApiKeyVO
            {
                Id = entity.Id,
                Direccion = entity.Direccion
            };
        }

        public static ApiKey ToEntity(ApiKeyVO vo)
        {
            if (vo == null) return null!;

            return new ApiKey
            {
                Id = vo.Id,
                Nombre = vo.Nombre,
                Direccion = vo.Direccion
            };
        }

        public static ApiKey ToEntity(CreateApiKeyVO vo)
        {
            if (vo == null) return null!;

            return new ApiKey
            {
                Nombre = vo.Nombre,
                Direccion = vo.Direccion
            };
        }

        public static IEnumerable<ApiKeyVO> ToVOList(IEnumerable<ApiKey> entities) => entities.Select(ToVO);
        public static IEnumerable<ApiKey> ToEntityList(IEnumerable<ApiKeyVO> vos) => vos.Select(ToEntity);
    }
}
