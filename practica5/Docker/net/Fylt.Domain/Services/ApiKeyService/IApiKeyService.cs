using Fylt.Domain.VOs.ApiKeyVOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Fylt.Domain.Services.ApiKeyService
{
    public interface IApiKeyService
    {
        Task<List<ApiKeyVO>> GetAll();
        Task<int> CrearApiKeyAsync(CreateApiKeyVO vo);
        Task<bool> UpdateApiKeyAsync(ApiKeyVO vo);
        Task<bool> DeleteApiKeyAsync(int id);
    }
}
