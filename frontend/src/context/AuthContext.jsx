import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { authApi, usersApi } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })

  const login = useCallback(async (credentials) => {
    const { data } = await authApi.login(credentials)
    localStorage.setItem('access_token', data.accessToken)
    localStorage.setItem('refresh_token', data.refreshToken)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }, [])

  const register = useCallback(async (credentials) => {
    const { data } = await authApi.register(credentials)
    localStorage.setItem('access_token', data.accessToken)
    localStorage.setItem('refresh_token', data.refreshToken)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.clear()
    setUser(null)
  }, [])

  const isAuthenticated = Boolean(user && localStorage.getItem('access_token'))
  const isAdmin = user?.role === 'ADMIN'

  // Atualiza os dados do usuário (ex.: papel alterado pelo ADMIN) ao abrir o sistema.
  useEffect(() => {
    if (!isAuthenticated) return
    usersApi.me().then(({ data }) => {
      localStorage.setItem('user', JSON.stringify(data))
      setUser(data)
    }).catch(() => {})
  }, [isAuthenticated])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
