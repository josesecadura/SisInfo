using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fylt.Domain.Clients.YoutubeClient
{
    public interface IYoutubeClient
    {
        Task<string?> GetTrailerVideoIdAsync(string movieTitle);
    }
}
