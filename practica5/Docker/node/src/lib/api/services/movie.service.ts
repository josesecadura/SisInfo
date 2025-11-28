import { apiClient } from "../client"
import { API_ENDPOINTS } from "../config"

export interface Movie {
  id: number
  title: string
  image: string
  year: number
  genre: string []
  description: string
  rating?: number
  duration?: number
  director?: string
  cast?: string[]
}

export interface ImportMoviesPayload {
  source: "tmdb" | "imdb" | "custom"
  movieIds?: string[]
  filters?: {
    genre?: string
    year?: number
    rating?: number
  }
}

export const movieService = {
  async getAll() {
    return apiClient.get<Movie[]>(API_ENDPOINTS.movies.getAll)
  },

  async getById(id: string | number) {
    return apiClient.get<Movie>(API_ENDPOINTS.movies.getById(id))
  },

  async create(movie: Omit<Movie, "id">) {
    return apiClient.post<Movie>(API_ENDPOINTS.movies.create, movie)
  },

  async update(id: string | number, movie: Partial<Movie>) {
    return apiClient.put<Movie>(API_ENDPOINTS.movies.update(id), movie)
  },

  async delete(id: string | number) {
    return apiClient.delete(API_ENDPOINTS.movies.delete(id))
  },

  async getTrailer(id: string | number) {
    try {
      const response = await apiClient.get<string>(API_ENDPOINTS.movies.getTrailer(id))
      let trailerId = (response as any)?.data?.data || (response as any)?.data || response
      return trailerId
    } catch (error) {
      throw error
    }
  },

  async getRandomMovie() {
    try {
      const movies = await this.getAll()
      const allMovies = (movies as any)?.data?.data || (movies as any)?.data || movies || []
      if (Array.isArray(allMovies) && allMovies.length > 0) {
        const randomIndex = Math.floor(Math.random() * allMovies.length)
        return allMovies[randomIndex]
      }
      return null
    } catch (error) {
      throw error
    }
  },

  async import(payload: ImportMoviesPayload) {
    return apiClient.post<{ imported: number; failed: number; movies: Movie[] }>(API_ENDPOINTS.movies.import, payload)
  },
}
