using Fylt.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;


namespace TestProject1.IntegrationTests
{
    public class DatabaseConnectionTests
    {

        [Test]
        public void CanConnectToNeonDatabase()
        {
            var connectionString =
                "Host=ep-bold-violet-agv6welv-pooler.c-2.eu-central-1.aws.neon.tech;Port=5432;Database=neondb;Username=neondb_owner;Password=npg_1zdNbswgxUm0;SSL Mode=Require;Trust Server Certificate=true;";
        
            var options = new DbContextOptionsBuilder<FyltContext>()
                .UseNpgsql(connectionString)
                .Options;

            using var context = new FyltContext(options);

            Assert.DoesNotThrow(() => context.Database.CanConnect());
        }
    }
}