using NUnit.Framework;
using System.Net;
using TestProject1.Utils;

namespace TestProject1.IntegrationTests
{
    public class PeliculasEndpointTests
    {
        private ApiTestFactory _factory = null!;
        private HttpClient _client = null!;

        [SetUp]
        public void Setup()
        {
            _factory = new ApiTestFactory();
            _client = _factory.CreateClient();
        }

        [TearDown]
        public void TearDown()
        {
            _client?.Dispose();
            _factory?.Dispose();
        }


        [Test]
        public async Task GetAllPeliculas_ReturnsOk()
        {
            var response = await _client.GetAsync("/Peliculas");
            Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
        }
    }
}
