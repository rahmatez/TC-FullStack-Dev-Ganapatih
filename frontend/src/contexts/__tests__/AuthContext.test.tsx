import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'

// Mock next/router
const mockPush = jest.fn()
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock api
jest.mock('@/lib/api')
const mockedApi = api as jest.Mocked<typeof api>

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('should provide auth context', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    )
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    expect(result.current).toBeDefined()
    expect(result.current.user).toBeNull()
    expect(typeof result.current.login).toBe('function')
    expect(typeof result.current.register).toBe('function')
    expect(typeof result.current.logout).toBe('function')
  })

  it('should initialize with null user when no token in localStorage', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    )
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    expect(result.current.user).toBeNull()
  })

  it('should initialize with user from localStorage', () => {
    const mockUser = { id: 1, username: 'testuser' }
    localStorage.setItem('user', JSON.stringify(mockUser))
    localStorage.setItem('token', 'test-token')
    
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    )
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    expect(result.current.user).toEqual(mockUser)
  })

  it('should have login function', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    )
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    expect(typeof result.current.login).toBe('function')
  })

  it('should have register function', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    )
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    expect(typeof result.current.register).toBe('function')
  })

  it('should have logout function', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    )
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    expect(typeof result.current.logout).toBe('function')
  })

  it('should clear user data on logout', () => {
    const mockUser = { id: 1, username: 'testuser' }
    localStorage.setItem('user', JSON.stringify(mockUser))
    localStorage.setItem('token', 'test-token')
    localStorage.setItem('refreshToken', 'refresh-token')
    
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    )
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    act(() => {
      result.current.logout()
    })
    
    expect(result.current.user).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('refreshToken')).toBeNull()
  })

  it('should redirect to login on logout', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    )
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    act(() => {
      result.current.logout()
    })
    
    expect(mockPush).toHaveBeenCalledWith('/login')
  })
})
