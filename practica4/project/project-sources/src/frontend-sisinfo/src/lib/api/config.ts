// API configuration for .NET backend
export const API_CONFIG = {
  baseURL: "https://localhost:7052",//process.env.NEXT_PUBLIC_API_URL || "https://api.fylt.com",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
}

// API endpoints
export const API_ENDPOINTS = {
  // Movies
movies: {
  getAll: "/api/Peliculas",
  getById: (id: string | number) => `/api/Peliculas/${id}`,
  create: "/api/Peliculas",
  update: (id: string | number) => `/api/Peliculas/${id}`,
  delete: (id: string | number) => `/api/Peliculas/${id}`,
  import: "/api/Peliculas/importar/tmdb", // 👈 exacto, con barra y mayúscula
},
actors: {
  populares: "/api/Actores/populares",
},

  // Comentarios (Reviews)
  comentarios: {
    getAll: "/api/Comentario/comentarios",
    getById: (id: string | number) => `/api/Comentario/comentarios/${id}`,
    create: "/api/Comentario/comentarios",
    update: (id: string | number) => `/api/Comentario/comentarios/${id}`,
    delete: (id: string | number) => `/api/Comentario/comentarios/${id}`,
  },
  // Surveys
  surveys: {
    getAll: "/api/surveys",
    getById: (id: string | number) => `/api/surveys/${id}`,
    create: "/api/surveys",
    update: (id: string | number) => `/api/surveys/${id}`,
    delete: (id: string | number) => `/api/surveys/${id}`,
    vote: (id: string | number) => `/api/surveys/${id}/vote`,
  },
  // Users
  users: {
    // Backend exposes Spanish routes under /api/Usuarios
    getAll: "/api/Usuarios/users",
    getById: (id: string | number) => `/api/Usuarios/users/${id}`,
    // Use the users list endpoint as profile endpoint when the backend doesn't provide a dedicated profile route
    getProfile: "/api/Usuarios/users",
    update: (id: string | number) => `/api/Usuarios/users/${id}`,
    delete: (id: string | number) => `/api/Usuarios/users/${id}`,
  },
  // Auth
  auth: {
    // login: "/api/auth/login",
    // register: "/api/auth/register",
    // logout: "/api/auth/logout",
    // refresh: "/api/auth/refresh",
    login: "/api/Usuarios/login",    // 👈 U mayúscula
    register: "/api/Usuarios/users", // 👈 U mayúscula
    logout: "/api/Usuarios/logout",  // opcional
    refresh: "/api/Usuarios/refresh" // opcional
  },
  apiKeys: {
    list: "/api/ApiKey/apikeys",
    create: "/api/ApiKey/apikeys",
    update: (id: number) => `/api/ApiKey/apikeys/${id}`,
    delete: (id: number) => `/api/ApiKey/apikeys/${id}`,
  },
  // Listas
  listas: {
    getAll: "/api/Listas",
    getById: (id: string | number) => `/api/Listas/${id}`,
    create: "/api/Listas",
    update: (id: string | number) => `/api/Listas/${id}`,
    delete: (id: string | number) => `/api/Listas/${id}`,
    addPelicula: (listaId: string | number, peliculaId: string | number) => `/api/Listas/${listaId}/peliculas/${peliculaId}`,
    removePelicula: (listaId: string | number, peliculaId: string | number) => `/api/Listas/${listaId}/peliculas/${peliculaId}`,
    getPeliculasByLista: (listaId: string | number) => `/api/Listas/${listaId}/peliculas`,
  },
}
