import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import Login from '@/pages/login'
import { AuthProvider } from '@/contexts/AuthContext'

// Mock next/router
const mockPush = jest.fn()
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    pathname: '/login',
  }),
}))

// Mock api module to prevent real requests during tests
jest.mock('@/lib/api')

describe('Login Page Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('should render login form', () => {
    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    )

    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeTruthy()
    expect(screen.getByLabelText(/username/i)).toBeTruthy()
    expect(screen.getByLabelText(/password/i)).toBeTruthy()
  })

  it('should have username and password fields', () => {
    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    )

    const usernameInput = screen.getByLabelText(/username/i) as HTMLInputElement
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement

    expect(usernameInput.type).toBe('text')
    expect(passwordInput.type).toBe('password')
  })

  it('should have submit button', () => {
    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    )

    const button = screen.getByRole('button', { name: /sign in/i })
    expect(button).toBeTruthy()
  })

  it('should show link to register page', () => {
    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    )

    const registerLink = screen.getByRole('link', { name: /create new account/i })
    expect(registerLink).toBeTruthy()
  })

  it('should update input values when typing', () => {
    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    )

    const usernameInput = screen.getByLabelText(/username/i) as HTMLInputElement
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement

    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    expect(usernameInput.value).toBe('testuser')
    expect(passwordInput.value).toBe('password123')
  })

  it('should have NewsFeed title/logo', () => {
    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    )

    const tagline = screen.getByText(/sign in to continue to newsfeed/i)
    expect(tagline).toBeTruthy()
  })
})
