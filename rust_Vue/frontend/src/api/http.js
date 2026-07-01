import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
  timeout: 15000
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('admin_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      window.location.assign('/login')
    }
    return Promise.reject(error)
  }
)

export function formatMoney(value) {
  return Number(value || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
}

export function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('vi-VN')
}
