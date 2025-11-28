using Fylt.Domain.Clients.YoutubeClient;
using Fylt.Domain.Mappers;
using Fylt.Domain.VOs.PeliculasVO;
using Fylt.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

namespace Fylt.Domain.Services.PeliculasService
{
    public class PeliculasService : IPeliculasService
    {
        private readonly FyltContext _fyltContext;
        private readonly ILogger<PeliculasService> _logger;
        private readonly IYoutubeClient _youTubeClient;
        public PeliculasService(FyltContext fyltContext,  ILogger<PeliculasService> logger, IYoutubeClient youTubeClient)
        {
            _fyltContext = fyltContext;
            _logger = logger;
            _youTubeClient = youTubeClient;
        }

        /// <summary>
        /// Récupère la liste de toutes les películas depuis la base de données locale.
        /// </summary>
        public async Task<List<PeliculaVO>> GetAllAsync()
        {
            var peliculas = await _fyltContext.Peliculas.AsNoTracking().ToListAsync();
            return PeliculasMappers.ToVOList(peliculas).ToList();
        }

        /// <summary>
        /// Récupère une película par son ID.
        /// </summary>
        public async Task<PeliculaVO?> GetByIdAsync(int id)
        {
            try
            {
                _logger.LogInformation("Recherche de la película avec ID : {Id}", id);

                // 1. Chercher l'entité dans la base de données
                var entity = await _fyltContext.Peliculas
                    .AsNoTracking() // Bon réflexe pour une simple lecture
                    .FirstOrDefaultAsync(x => x.Id == id);

                if (entity == null)
                {
                    _logger.LogWarning("Película avec ID {Id} non trouvée.", id);
                    return null;
                }

                // 2. Mapper l'entité vers le VO
                var vo = PeliculasMappers.ToVO(entity);

                _logger.LogInformation("Película avec ID {Id} trouvée.", id);
                return vo;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de la película avec ID {Id}", id);
                // Il est préférable de jeter l'exception pour que le contrôleur gère le 500
                throw;
            }
        }
        public async Task<int> CreatePeliculaAsync(PeliculaVO peliculaVO)
        {
            _logger.LogInformation("Création d'une nouvelle película avec titre : {Titulo}", peliculaVO.Titulo);

            // 1. Mapper le VO vers l'Entité. L'Id sera ignoré par EF Core car c'est une création.
            var entity = PeliculasMappers.ToEntity(peliculaVO);

            // 2. Ajouter l'entité au contexte
            _fyltContext.Peliculas.Add(entity);

            // 3. Sauvegarder les changements
            await _fyltContext.SaveChangesAsync();

            _logger.LogInformation("Película créée avec succès. ID : {Id}", entity.Id);
            return entity.Id;

        }

        public async Task<bool> UpdatePeliculaAsync(PeliculaVO peliculaVO)
        {
            try
            {
                var existing = await _fyltContext.Peliculas.FirstOrDefaultAsync(x => x.Id == peliculaVO.Id);

                if (existing == null)
                {
                    _logger.LogWarning("Película con ID {Id} no encontrada para actualización.", peliculaVO.Id);
                    return false;
                }

                _logger.LogInformation("Actualizando película ID {Id}", peliculaVO.Id);

                existing.ExternalId = peliculaVO.ExternalId;
                existing.Titulo = peliculaVO.Titulo ?? existing.Titulo;
                existing.Descripcion = peliculaVO.Descripcion ?? existing.Descripcion;
                existing.Fecha = peliculaVO.Fecha ?? existing.Fecha;
                existing.Imagen = peliculaVO.Imagen ?? existing.Imagen;
                existing.Valoracion = peliculaVO.Valoracion ?? existing.Valoracion;
                existing.Generos = peliculaVO.Generos;

                await _fyltContext.SaveChangesAsync();

                _logger.LogInformation("Película ID {Id} actualizada correctamente.", peliculaVO.Id);
                return true;
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Error al actualizar película ID {Id}: {Message}", peliculaVO.Id, ex.InnerException?.Message ?? ex.Message);
                throw; // <-- así puedes ver el detalle exacto en la consola
            }
        }
        public async Task<bool> DeletePeliculaAsync(int id)
        {

            var entity = await _fyltContext.Peliculas.FindAsync(id);
            if (entity == null)
            {
                _logger.LogWarning("Pelicula avec ID {Id} non trouvée.", id);
                return false;
            }

            _fyltContext.Peliculas.Remove(entity);
            await _fyltContext.SaveChangesAsync();

            _logger.LogInformation("Pelicula avec ID {Id} supprimée.", id);
            return true;

        }
        public async Task<bool> ExistsByExternalIdAsync(int externalId)
        {
            return await _fyltContext.Peliculas.AnyAsync(p => p.ExternalId == externalId);
        }

        public async Task<string?> GetTrailerAsync(int peliculaId)
        {
            var pelicula = await _fyltContext.Peliculas.FindAsync(peliculaId);
            if (pelicula == null)
                return null;

            var trailerUrl = await _youTubeClient.GetTrailerVideoIdAsync(pelicula.Titulo);
            return trailerUrl;
        }
    }
}
