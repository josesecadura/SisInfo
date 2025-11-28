using Fylt.Api;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.VisualStudio.TestPlatform.TestHost;

namespace TestProject1.Utils
{
    public class ApiTestFactory : WebApplicationFactory<Program>
    {
    }
}
