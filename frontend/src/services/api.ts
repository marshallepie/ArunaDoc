import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Add JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Patient API
export const patientApi = {
  getAll: () => api.get('/api/v1/patients'),
  getOne: (id: number) => api.get(`/api/v1/patients/${id}`),
  create: (data: any) => api.post('/api/v1/patients', { patient: data }),
  update: (id: number, data: any) => api.patch(`/api/v1/patients/${id}`, { patient: data }),
  delete: (id: number) => api.delete(`/api/v1/patients/${id}`),
}

// Consultation API
export const consultationApi = {
  getAll: (status?: string) => api.get('/api/v1/consultations', { params: { status } }),
  getOne: (id: number) => api.get(`/api/v1/consultations/${id}`),
  create: (data: any) => api.post('/api/v1/consultations', { consultation: data }),
  update: (id: number, data: any) => api.patch(`/api/v1/consultations/${id}`, { consultation: data }),
  delete: (id: number) => api.delete(`/api/v1/consultations/${id}`),
  uploadRecording: (id: number, recordingUrl: string) =>
    api.post(`/api/v1/consultations/${id}/upload_recording`, { recording_url: recordingUrl }),
  uploadAudio: (id: number, formData: FormData) =>
    api.post(`/api/v1/consultations/${id}/upload_audio`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}

export default api
