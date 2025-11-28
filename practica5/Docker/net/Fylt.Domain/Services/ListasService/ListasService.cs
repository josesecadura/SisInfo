using Fylt.Domain.Mappers;
using Fylt.Domain.Services.UsuariosService;
using Fylt.Domain.VOs;
using Fylt.Domain.VOs.ListasVO;
using Fylt.Domain.VOs.PeliculasVO;
using Fylt.Infrastructure.Context; 
using Fylt.Infrastructure.DAOs;    
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Fylt.Domain.Services.ListasService
{
    public class ListasService : IListasService
    {
        private readonly FyltContext _fyltContext;
        private readonly ILogger<ListasService> _logger;
        // Para crear la lista con el usuario
        private readonly IUsuariosService _usuariosService;

        public ListasService(FyltContext fyltContext, ILogger<ListasService> logger, IUsuariosService usuariosService)
        {
            _fyltContext = fyltContext;
            _logger = logger;
            _usuariosService = usuariosService;
        }

        // --- CRUD de base ---

        // No lo deberiamos usar nunca este realmente, no creamos listas para todos.
        public async Task<int> CreateListaAsync(ListaVO listaVO)
        {
            // Implémentation similaire à celle de CreatePeliculaAsync
            var entity = ListasMappers.ToEntity(listaVO);
            _fyltContext.Listas.Add(entity); // Assurez-vous que Listas est une DbSet dans FyltContext
            await _fyltContext.SaveChangesAsync();
            return entity.Id;
        }

        public async Task<List<ListaVO>> GetAllAsync()
        {
            var listas = await _fyltContext.Listas.AsNoTracking().ToListAsync();
            return ListasMappers.ToVOList(listas).ToList();
        }

        public async Task<ListaVO?> GetByIdAsync(int id)
        {
            var entity = await _fyltContext.Listas.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            return ListasMappers.ToVO(entity);
        }

        public async Task<bool> UpdateListaAsync(ListaVO listaVO)
        {
            var existing = await _fyltContext.Listas.FirstOrDefaultAsync(x => x.Id == listaVO.Id);
            if (existing == null) return false;

            existing.Nombre = listaVO.Nombre;
            existing.Imagen = listaVO.Imagen;
            await _fyltContext.SaveChangesAsync();
            return true;
        }


        public async Task<bool> DeleteListaAsync(int id)
        {
            // 1. Trouver l'entité Lista.
            var listaEntity = await _fyltContext.Listas.FindAsync(id);

            if (listaEntity == null)
            {
                return false;
            }

            // 2. Trouver TOUS les enregistrements ListaPelicula liés à cette liste.
            // Assurez-vous que 'ListaPeliculas' est le nom de votre DbSet pour la table de jointure.
            var jointurePeliculas = await _fyltContext.ListaPeliculas
                .Where(lp => lp.IdLista == id)
                .ToListAsync();

            // 3. Supprimer tous les enregistrements de jointure trouvés.
            if (jointurePeliculas.Any())
            {
                _fyltContext.ListaPeliculas.RemoveRange(jointurePeliculas);
            }

            // 4. Supprimer la Liste elle-même.
            _fyltContext.Listas.Remove(listaEntity);

            // 5. Enregistrer les changements (suppression des jointures + suppression de la liste).
            await _fyltContext.SaveChangesAsync();

            return true;
        }

        // --- Gestion des relations (Exemple) ---

        public async Task<bool> AddPeliculaToListaAsync(int listaId, int peliculaId)
        {
            // Vérification simple de l'existence des entités non incluse pour la concision
            var listaPelicula = new ListaPelicula
            {
                IdLista = listaId,
                IdPelicula = peliculaId
            };

            // Assurez-vous que ListaPeliculas est une DbSet dans FyltContext
            _fyltContext.ListaPeliculas.Add(listaPelicula);
            await _fyltContext.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemovePeliculaFromListaAsync(int listaId, int peliculaId)
        {
            var entity = await _fyltContext.ListaPeliculas
                .FirstOrDefaultAsync(lp => lp.IdLista == listaId && lp.IdPelicula == peliculaId);

            if (entity == null) return false;

            _fyltContext.ListaPeliculas.Remove(entity);
            await _fyltContext.SaveChangesAsync();
            return true;
        }

        public async Task<List<PeliculaVO>> GetPeliculasByListaIdAsync(int listaId)
        {
            _logger.LogInformation("Récupération des películas pour la lista ID : {ListaId}", listaId);

            // 1. Interroger la table de jointure ListaPeliculas pour l'ID de liste donné.
            // 2. Inclure l'entité Pelicula associée.
            // 3. Projeter les entités Pelicula résultantes.
            var peliculasEntities = await _fyltContext.ListaPeliculas
                .Where(lp => lp.IdLista == listaId && lp.Pelicula != null)
                .Select(lp => lp.Pelicula!) // ! asegura al compilador que no es null tras el Where
                .AsNoTracking()
                .ToListAsync();

            if (peliculasEntities == null || !peliculasEntities.Any())
            {
                _logger.LogInformation("Ninguna película buscada en la lista ID : {ListaId}", listaId);
                return new List<PeliculaVO>();
            }

            // 4. Mapper les entités Pelicula en PeliculaVO
            return PeliculasMappers.ToVOList(peliculasEntities).ToList();
        }


        // Nuevo método para obtener las listas mediante el id del usuario
        public async Task<List<ListaVO>> GetListasByUsuarioIdAsync(int usuarioId)
        {
            var listasDao = await _fyltContext.Listas
                .Where(l => l.Usuarios != null && l.Usuarios.Any(ul => ul.IdUser == usuarioId))
                .Include(l => l.Peliculas!)
                    .ThenInclude(lp => lp.Pelicula!)
                .AsNoTracking()
                .ToListAsync();

            if (listasDao.Any() == false)
            {
                // Lista vacía
                return new List<ListaVO>();
            }

            return ListasMappers.ToVOList(listasDao).ToList();
        }

        // Crear lista con id de usuario
        public async Task<int> CreateListaConUsuario(ListaVO list, int userId)
        {
            using var transaction = await _fyltContext.Database.BeginTransactionAsync();

            try
            {
                var user = await _usuariosService.GetUserById(userId);
                if (user == null)
                {
                    throw new Exception("Usuario no encontrado");
                }

                var entity = ListasMappers.ToEntity(list);
                _fyltContext.Listas.Add(entity);
                await _fyltContext.SaveChangesAsync();

                var userList = new UsuarioLista
                {
                    IdUser = userId,
                    IdLista = entity.Id
                };

                _fyltContext.UsuarioListas.Add(userList);
                await _fyltContext.SaveChangesAsync();

                await transaction.CommitAsync();

                return entity.Id;
            }
            catch (Exception)
            {
                // cancelar la transaccion
                await transaction.RollbackAsync();
                throw; // Relancer l'exception pour que le contrôleur la gère (ex: logging)
            }
        }
    }
}