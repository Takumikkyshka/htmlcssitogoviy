import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'
import { apiService } from '../services/api'

interface User {
  id: number
  email: string
  name?: string
  role?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        // Если роль отсутствует в сохранённом пользователе, но есть в localStorage
        if (!parsedUser.role) {
          const storedRole = localStorage.getItem('userRole')
          if (storedRole) {
            parsedUser.role = storedRole
          }
        }
        setToken(storedToken)
        setUser(parsedUser)
      } catch (error) {
        console.error('Error parsing stored user:', error)
      }
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiService.login(email, password)

    if (response.error) {
      return { success: false, error: response.error }
    }

    if (response.data) {
      const { token: newToken, user: newUser } = response.data
      
      // Если роль не пришла, пробуем получить из БД через отдельный запрос или используем дефолт
      const userWithRole = {
        ...newUser,
        role: newUser.role || localStorage.getItem('userRole') || 'user'
      }
      
      setToken(newToken)
      setUser(userWithRole)
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(userWithRole))
      localStorage.setItem('userRole', userWithRole.role)
      
      return { success: true }
    }

    return { success: false, error: 'Неизвестная ошибка' }
  }, [])

  const register = useCallback(async (email: string, password: string, name?: string) => {
    const response = await apiService.register(email, password, name)

    if (response.error) {
      return { success: false, error: response.error }
    }

    if (response.data) {
      const { token: newToken, user: newUser } = response.data
      setToken(newToken)
      setUser(newUser)
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(newUser))
      if (newUser.role) {
        localStorage.setItem('userRole', newUser.role)
      }
      return { success: true }
    }

    return { success: false, error: 'Неизвестная ошибка' }
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
  }, [])

  const isAuthenticated = useMemo(() => !!token && !!user, [token, user])

  const value = useMemo(() => ({
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated,
  }), [user, token, login, register, logout, isAuthenticated])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

