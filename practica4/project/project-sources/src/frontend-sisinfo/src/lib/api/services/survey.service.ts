import { apiClient } from "../client"
import { API_ENDPOINTS } from "../config"

export interface Survey {
  id: number
  question: string
  options: string[]
  votes: number[]
  totalVotes: number
  createdAt: string
  expiresAt?: string
}

export interface VoteSurveyPayload {
  optionIndex: number
  userId: string
}

export const surveyService = {
  async getAll() {
    return apiClient.get<Survey[]>(API_ENDPOINTS.surveys.getAll)
  },

  async getById(id: string | number) {
    return apiClient.get<Survey>(API_ENDPOINTS.surveys.getById(id))
  },

  async create(survey: Omit<Survey, "id" | "votes" | "totalVotes" | "createdAt">) {
    return apiClient.post<Survey>(API_ENDPOINTS.surveys.create, survey)
  },

  async update(id: string | number, survey: Partial<Survey>) {
    return apiClient.put<Survey>(API_ENDPOINTS.surveys.update(id), survey)
  },

  async delete(id: string | number) {
    return apiClient.delete(API_ENDPOINTS.surveys.delete(id))
  },

  async vote(id: string | number, payload: VoteSurveyPayload) {
    return apiClient.post<Survey>(API_ENDPOINTS.surveys.vote(id), payload)
  },
}
