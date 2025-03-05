import React, { createContext, useState, useContext, ReactNode } from 'react'

interface User {
  id: string
  username: string
  email: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  register: (username: string, email: string, password: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simulated login - replace with actual API call
    if (username === 'demo' && password === 'password') {
      const mockUser = {
        id: '1',
        username: 'demo',
        email: 'demo@example.com'
      }
      setUser(mockUser)
      localStorage.setItem('user', JSON.stringify(mockUser))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    // Simulated registration - replace with actual API call
    const mockUser = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      email
    }
    setUser(mockUser)
    localStorage.setItem('user', JSON.stringify(mockUser))
    return true
  }

  // Check for existing user on context initialization
  React.useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
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