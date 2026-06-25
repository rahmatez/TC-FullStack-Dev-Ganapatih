import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import withAuth from '@/components/withAuth'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'
import React from 'react'

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}))

const mockPush = jest.fn()
const mockedUseRouter = useRouter as jest.Mock
const mockedUseAuth = useAuth as jest.Mock

const DummyComponent = () => <div>Protected Content</div>
const ProtectedComponent = withAuth(DummyComponent)

describe('withAuth HOC', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPush.mockReset()
    mockedUseRouter.mockReturnValue({
      push: mockPush,
    })
  })

  it('renders wrapped component when user is present', () => {
    mockedUseAuth.mockReturnValue({
      user: { username: 'testuser' },
      isLoading: false,
    })

    render(<ProtectedComponent />)

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('redirects to login when no user', async () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
    })

    render(<ProtectedComponent />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })
})
