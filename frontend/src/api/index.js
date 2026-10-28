import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 → try refresh → retry
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) throw new Error('No refresh token')
        const { data } = await axios.post('/api/v1/auth/refresh', { refreshToken })
        localStorage.setItem('access_token', data.accessToken)
        localStorage.setItem('refresh_token', data.refreshToken)
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return api(original)
      } catch {
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  }
)

export default api

// Auth
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
}

// Products
export const productsApi = {
  list: (params) => api.get('/products', { params }),
  get: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  listByCategory: (categoryId, params) => api.get('/products', { params: { ...params, categoryId } }),
}

// Categories
export const categoriesApi = {
  list: () => api.get('/categories'),
  get: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
}

// Stock
export const stockApi = {
  move: (productId, data) => api.post(`/products/${productId}/stock-movements`, data),
  history: (productId, params) => api.get(`/products/${productId}/stock-movements`, { params }),
  low: () => api.get('/stock/low'),
}

// Orders
export const ordersApi = {
  list: (params) => api.get('/orders', { params }),
  get: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  finalize: (id, paymentMethod) => api.post(`/orders/${id}/finalize`, { paymentMethod }),
  cancel: (id) => api.post(`/orders/${id}/cancel`),
}

// Users (ADMIN)
export const usersApi = {
  me: () => api.get('/users/me'),
  list: () => api.get('/users'),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
}

// Reports
export const reportsApi = {
  summary: () => api.get('/reports/summary'),
  salesByDay: (days = 14) => api.get('/reports/sales-by-day', { params: { days } }),
  topProducts: (days = 30, limit = 5) => api.get('/reports/top-products', { params: { days, limit } }),
  salesCsv: (from, to) => api.get('/reports/sales.csv', { params: { from, to }, responseType: 'blob' }),
}
