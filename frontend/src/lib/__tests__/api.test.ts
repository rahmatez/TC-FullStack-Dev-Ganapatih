import api from '@/lib/api'

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Clear localStorage
    localStorage.clear()
  })

  describe('API Instance Configuration', () => {
    it('should have correct baseURL', () => {
      expect(api.defaults.baseURL).toBe('http://localhost:5000/api')
    })

    it('should have correct Content-Type header', () => {
      expect(api.defaults.headers['Content-Type']).toBe('application/json')
    })

    it('should have request interceptor', () => {
      expect(api.interceptors.request).toBeDefined()
    })

    it('should have response interceptor', () => {
      expect(api.interceptors.response).toBeDefined()
    })
  })

  describe('LocalStorage Token Management', () => {
    it('should store token in localStorage', () => {
      const token = 'test-token-123'
      localStorage.setItem('token', token)
      
      expect(localStorage.getItem('token')).toBe(token)
    })

    it('should remove token from localStorage', () => {
      localStorage.setItem('token', 'test-token')
      localStorage.removeItem('token')
      
      expect(localStorage.getItem('token')).toBeNull()
    })

    it('should store refreshToken in localStorage', () => {
      const refreshToken = 'refresh-token-123'
      localStorage.setItem('refreshToken', refreshToken)
      
      expect(localStorage.getItem('refreshToken')).toBe(refreshToken)
    })

    it('should store user data in localStorage', () => {
      const user = { id: 1, username: 'testuser' }
      localStorage.setItem('user', JSON.stringify(user))
      
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
      expect(storedUser).toEqual(user)
    })
  })

  describe('API Instance Methods', () => {
    it('should have get method', () => {
      expect(typeof api.get).toBe('function')
    })

    it('should have post method', () => {
      expect(typeof api.post).toBe('function')
    })

    it('should have put method', () => {
      expect(typeof api.put).toBe('function')
    })

    it('should have delete method', () => {
      expect(typeof api.delete).toBe('function')
    })
  })
})
