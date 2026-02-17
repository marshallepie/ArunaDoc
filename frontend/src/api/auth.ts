import { apiClient } from '../lib/axios'
import type { LoginCredentials, LoginResponse, User } from '../types/auth'

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
    const response = await apiClient.post<LoginResponse>('/auth/sign_in', {
      user: credentials,
    })

    // Extract token from Authorization header
    const authHeader = response.headers['authorization']
    const token = authHeader ? authHeader.substring(7) : ''

    return {
      user: response.data.user,
      token,
    }
  },

  logout: async (): Promise<void> => {
    await apiClient.delete('/auth/sign_out')
    localStorage.removeItem('auth_token')
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<{ user: User }>('/auth/me')
    return response.data.user
  },
}
