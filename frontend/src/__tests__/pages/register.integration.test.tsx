import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import Register from '@/pages/register'
import { AuthProvider } from '@/contexts/AuthContext'

// Mock next/router
const mockPush = jest.fn()
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    pathname: '/register',
  }),
}))

describe('Register Page Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render register form', () => {
    render(
      <AuthProvider>
        <Register />
      </AuthProvider>
    )

    expect(screen.getByRole('heading', { name: /join newsfeed/i })).toBeTruthy()
  })

  it('should have all required form fields', () => {
    render(
      <AuthProvider>
        <Register />
      </AuthProvider>
    )

    expect(screen.getByLabelText(/username/i)).toBeTruthy()
    expect(screen.getByLabelText(/^password/i)).toBeTruthy()
    expect(screen.getByLabelText(/confirm password/i)).toBeTruthy()
  })

  it('should have username, password, and confirm password inputs', () => {
    render(
      <AuthProvider>
        <Register />
      </AuthProvider>
    )

    const usernameInput = screen.getByLabelText(/username/i) as HTMLInputElement
    const passwordInput = screen.getByLabelText(/^password/i) as HTMLInputElement
    const confirmInput = screen.getByLabelText(/confirm password/i) as HTMLInputElement

    expect(usernameInput).toBeTruthy()
    expect(passwordInput.type).toBe('password')
    expect(confirmInput.type).toBe('password')
  })

  it('should have register button', () => {
    render(
      <AuthProvider>
        <Register />
      </AuthProvider>
    )

    const button = screen.getByRole('button', { name: /create account/i })
    expect(button).toBeTruthy()
  })

  it('should show link to login page', () => {
    render(
      <AuthProvider>
        <Register />
      </AuthProvider>
    )

    const loginLink = screen.getByRole('link', { name: /sign in instead/i })
    expect(loginLink).toBeTruthy()
  })

  it('should update input values when typing', () => {
    render(
      <AuthProvider>
        <Register />
      </AuthProvider>
    )

    const usernameInput = screen.getByLabelText(/username/i) as HTMLInputElement
    const passwordInput = screen.getByLabelText(/^password/i) as HTMLInputElement

    fireEvent.change(usernameInput, { target: { value: 'newuser' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    expect(usernameInput.value).toBe('newuser')
    expect(passwordInput.value).toBe('password123')
  })

  it('should display account creation heading', () => {
    render(
      <AuthProvider>
        <Register />
      </AuthProvider>
    )

    const heading = screen.getByText(/create your account/i)
    expect(heading).toBeTruthy()
  })
})
