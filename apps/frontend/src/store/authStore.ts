import { create } from 'zustand'

export interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  setCredentials: (token: string, user: User) => void
  logout: () => void
}

const safeParseJSON = (str: string | null) => {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token') || null,
  user: safeParseJSON(localStorage.getItem('user_data')),
  isAuthenticated: !!localStorage.getItem('token'),
  
  setCredentials: (token: string, user: User) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user_data', JSON.stringify(user))
    set({ token, user, isAuthenticated: true })
  },
  
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user_data')
    set({ token: null, user: null, isAuthenticated: false })
  },
}))
