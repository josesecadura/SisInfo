using Fylt.Contracts;
using Fylt.Domain.Clients.TMDBClient;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Nodes;

[ApiController]
[Route("[controller]")]
public class ActoresController : ControllerBase
{
    private readonly ITMDBClient _actors;

    public ActoresController(ITMDBClient actors)
    {
        _actors = actors;
    }

    [HttpGet("populares")]
    public async Task<IActionResult> GetPopulares()
    {
        try
        {
            JsonArray actores = await _actors.ImportarActores();
            return Ok(new
            {
                success = true,
                data = actores
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponseBase.Fail("Error interno al obtener los actores.", 500));
        }
    }
}
