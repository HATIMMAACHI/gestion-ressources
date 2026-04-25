import { createContext, useContext, useMemo, useState } from 'react'
import { login as loginApi } from '../services/authService'

const AuthContext = createContext(null)

function parseStoredUser() {
  const storedUser = localStorage.getItem('user')
  if (!storedUser) return null
  try {
    return JSON.parse(storedUser)
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(parseStoredUser)
  const isAuthenticated = Boolean(token)

  async function login(email, password) {
    const payload = await loginApi({ email, password })

    if (!payload?.token) {
      throw new Error('Réponse de connexion invalide: token absent.')
    }

    localStorage.setItem('token', payload.token)
    setToken(payload.token)

    if (payload.user) {
      localStorage.setItem('user', JSON.stringify(payload.user))
      setUser(payload.user)
    }

    return payload
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({ token, user, isAuthenticated, login, logout }),
    [token, user, isAuthenticated],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur de AuthProvider.')
  }

  return context
}
