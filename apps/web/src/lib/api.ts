import axios from 'axios'

const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL })

// Attach access token to every request
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem('accessToken')
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

// Auto-refresh token on 401
api.interceptors.response.use(
  r => r,
  async (err) => {
    const orig = err.config
    if (err.response?.status === 401 && !orig._retry) {
      orig._retry = true
      const rt = localStorage.getItem('refreshToken')
      if (!rt) { window.location.href = '/login'; return }
      try {
        const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, { refreshToken: rt })
        localStorage.setItem('accessToken',  data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        orig.headers.Authorization = `Bearer ${data.accessToken}`
        return api(orig)
      } catch { window.location.href = '/login' }
    }
    return Promise.reject(err)
  }
)

export default api
