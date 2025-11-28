using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Nodes;

[ApiController]
[Route("api/[controller]")]
public class ActoresController : ControllerBase
{
    private readonly TmdbActorsService _actors;

    public ActoresController(TmdbActorsService actors)
    {
        _actors = actors;
    }

    [HttpGet("populares")]
    public async Task<IActionResult> GetPopulares()
    {
        JsonArray actores = await _actors.GetPopularActorsAsync();
        return Ok(new
        {
            success = true,
            data = actores
        });
    }
}
