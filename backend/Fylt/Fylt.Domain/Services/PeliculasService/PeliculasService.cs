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
        private readonly HttpClient _httpClient;

        public PeliculasService(FyltContext fyltContext, ILogger<PeliculasService> logger, HttpClient httpClient)
        {
            _fyltContext = fyltContext;
            _logger = logger;
            _httpClient = httpClient;
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
        /// <summary>
        /// Récupère des películas depuis une API externe et les insère ou met à jour la base locale.
        /// </summary>
        public async Task<bool> ImportarPeliculasDesdeApiAsync(string apiUrl)
        {
            try
            {
                _logger.LogInformation("Importation de películas depuis {Url}", apiUrl);

                var response = await _httpClient.GetAsync(apiUrl);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();

                // On désérialise la réponse JSON en une liste de VO
                var peliculasApi = JsonSerializer.Deserialize<List<PeliculaVO>>(content, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (peliculasApi == null || peliculasApi.Count == 0)
                {
                    _logger.LogWarning("Aucune película trouvée depuis l’API.");
                    return false;
                }

                foreach (var pelicula in peliculasApi)
                {
                    var existing = await _fyltContext.Peliculas.FirstOrDefaultAsync(x => x.Id == pelicula.Id);
                    if (existing == null)
                    {
                        // Nouvelle película
                        var entity = PeliculasMappers.ToEntity(pelicula);
                        _fyltContext.Peliculas.Add(entity);
                    }
                    else
                    {
                        // Mise à jour de la película existante
                        existing.Titulo = pelicula.Titulo;
                        existing.Descripcion = pelicula.Descripcion;
                        existing.Imagen = pelicula.Imagen;
                        existing.Valoracion = pelicula.Valoracion;
                        _fyltContext.Peliculas.Update(existing);
                    }
                }

                await _fyltContext.SaveChangesAsync();
                _logger.LogInformation("Importation et mise à jour des películas terminées avec succès.");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l’importation des películas depuis l’API.");
                return false;
            }
        }

        public async Task<int> CreatePeliculaAsync(PeliculaVO peliculaVO)
        {
            try
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
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création de la película.");
                throw; // Renvoyer l'exception pour être gérée par le contrôleur
            }
        }

        public async Task<bool> UpdatePeliculaAsync(PeliculaVO peliculaVO)
        {
            try
            {
                // 1. Rechercher l'entité existante par son ID
                var existing = await _fyltContext.Peliculas.FirstOrDefaultAsync(x => x.Id == peliculaVO.Id);

                if (existing == null)
                {
                    _logger.LogWarning("Mise à jour échouée : Película avec ID {Id} non trouvée.", peliculaVO.Id);
                    return false; // Film non trouvé
                }

                _logger.LogInformation("Mise à jour de la película avec ID : {Id}", peliculaVO.Id);

                // 2. Mettre à jour les propriétés
                existing.Titulo = peliculaVO.Titulo;
                existing.Descripcion = peliculaVO.Descripcion;
                existing.Imagen = peliculaVO.Imagen;
                existing.Valoracion = peliculaVO.Valoracion;

                // Note : Pas besoin d'appeler _fyltContext.Peliculas.Update(existing);
                // car EF Core suit déjà l'objet 'existing' après le FirstOrDefaultAsync.

                // 3. Sauvegarder les changements
                await _fyltContext.SaveChangesAsync();

                _logger.LogInformation("Película avec ID {Id} mise à jour avec succès.", peliculaVO.Id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour de la película avec ID {Id}", peliculaVO.Id);
                return false;
            }
        }
        public async Task<bool> DeletePeliculaAsync(int id)
        {
            try
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
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression de la película avec ID {Id}", id);
                return false;
            }
        }
    }
}
