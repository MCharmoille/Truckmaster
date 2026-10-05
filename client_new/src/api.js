import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

let onLogout = () => {}

export function setUnauthorizedHandler(handler) {
  onLogout = handler
}

export function logout() {
  localStorage.removeItem('authToken')
  localStorage.removeItem('userId')
  localStorage.removeItem('user')
  onLogout()
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      logout()
    }
    return Promise.reject(error)
  },
)
