export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  role: 'consultant' | 'secretary' | 'admin'
  status: 'active' | 'inactive' | 'suspended'
  gmc_number?: string
  created_at: string
  updated_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  message: string
  user: User
}

export interface AuthError {
  message: string
  errors: string[]
}
