// API configuration for .NET backend
export const API_CONFIG = {
  baseURL: "http://localhost:7052",//process.env.NEXT_PUBLIC_API_URL || "https://api.fylt.com",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
}

// API endpoints
export const API_ENDPOINTS = {
  // Movies
movies: {
  getAll: "/Peliculas",
  getById: (id: string | number) => `/Peliculas/${id}`,
  getTrailer: (id: string | number) => `/Peliculas/${id}/trailer`,
  create: "/Peliculas",
  update: (id: string | number) => `/Peliculas/${id}`,
  delete: (id: string | number) => `/Peliculas/${id}`,
  import: "/Peliculas/importar/tmdb", 
},
actors: {
  populares: "/Actores/populares",
},

  // Comentarios (Reviews)
  comentarios: {
    getAll: "/Comentario/comentarios",
    getById: (id: string | number) => `/Comentario/comentarios/${id}`,
    create: "/Comentario/comentarios",
    update: (id: string | number) => `/Comentario/comentarios/${id}`,
    delete: (id: string | number) => `/Comentario/comentarios/${id}`,
  },
  // Comentario Likes
  comentarioLikes: {
    getLikes: (comentarioId: string | number) => `/ComentarioLike/comentario/${comentarioId}`,
    getUserLikedComments: (userId: string | number) => `/ComentarioLike/usuario/${userId}/likes`,
    checkUserLike: (userId: string | number, comentarioId: string | number) => `/ComentarioLike/comentario/exists/${comentarioId}/${userId}`,
    create: "/ComentarioLike/comentario/like",
    delete: (userId: string | number, comentarioId: string | number) => `/ComentarioLike/comentario/like/${userId}/${comentarioId}`,
  },
  encuestas: {
    getAll: "/Encuesta/encuestas",
    getActive: "/Encuesta/encuestas/activas",
    getById: (id: string | number) => `/Encuesta/encuestas/${id}`,
    create: "/Encuesta/encuestas",
    update: (id: string | number) => `/Encuesta/encuestas/${id}`,
    delete: (id: string | number) => `/Encuesta/encuestas/${id}`,
    // Voting endpoints
    vote: (id: string | number) => `/Encuesta/encuestas/${id}/vote`,
    getVote: (encuestaId: string | number, userId: string | number) => `/Encuesta/encuestas/${encuestaId}/vote?idUser=${userId}`,
  },
  // Users
  users: {
    // Backend exposes Spanish routes under /Usuarios
    getAll: "/Usuarios/users",
    getById: (id: string | number) => `/Usuarios/users/${id}`,
    // Use the users list endpoint as profile endpoint when the backend doesn't provide a dedicated profile route
    getProfile: "/Usuarios/users",
    update: (id: string | number) => `/Usuarios/users/${id}`,
    delete: (id: string | number) => `/Usuarios/users/${id}`,
    changePassword: (id: string | number) => `/Usuarios/users/${id}/password`,
    userNameExists: (username: string) => `/Usuarios/UsernameExists?username=${username}`,
  },
  // Auth
  auth: {
    login: "/Usuarios/login",    
    register: "/Usuarios/users", 
    logout: "/Usuarios/logout",  
    refresh: "/Usuarios/refresh",
    me: "/Usuarios/me",
  },
  apiKeys: {
    list: "/ApiKey/apikeys",
    create: "/ApiKey/apikeys",
    update: (id: number) => `/ApiKey/apikeys/${id}`,
    delete: (id: number) => `/ApiKey/apikeys/${id}`,
  },
  // Listas
  listas: {
    getAll: "/Listas",
    getById: (id: string | number) => `/Listas/${id}`,
    // Recoger las listas de un usuario
    getListasByUsuarioId: (userId: string | number) => `/Listas/usuario/${userId}`,
    create: "/Listas",
    // Crear lista para un usuario
    createWithUser: (userId: string | number) => `/Listas/usuario/${userId}`,
    update: (id: string | number) => `/Listas/${id}`,
    delete: (id: string | number) => `/Listas/${id}`,
    addPelicula: (listaId: string | number, peliculaId: string | number) => `/Listas/${listaId}/peliculas/${peliculaId}`,
    removePelicula: (listaId: string | number, peliculaId: string | number) => `/Listas/${listaId}/peliculas/${peliculaId}`,
    getPeliculasByLista: (listaId: string | number) => `/Listas/${listaId}/peliculas`,
  },
  // Usuario Seguidor
  usuarioSeguidor: {
    seguir: "/UsuarioSeguidor/seguir",
    unfollow: (idUser: string | number, idAmigo: string | number) => `/UsuarioSeguidor/${idUser}/${idAmigo}`,
    getAmigos: (idUser: string | number) => `/UsuarioSeguidor/amigos/${idUser}`,
    buscar: (username: string) => `/UsuarioSeguidor/buscar?username=${username}`,
  },
}
