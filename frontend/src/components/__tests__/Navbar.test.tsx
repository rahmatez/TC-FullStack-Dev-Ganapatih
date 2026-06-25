import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import Navbar from '@/components/Navbar'
import { AuthProvider } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}))

// Mock AuthContext
const mockLogout = jest.fn()
const mockUser = {
  id: 1,
  username: 'testuser',
}

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    logout: mockLogout,
  }),
}))

describe('Navbar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      pathname: '/feed',
      push: jest.fn(),
    })
  })

  it('should render navbar with logo', () => {
    render(<Navbar />)
    
    const logo = screen.getByText('NewsFeed')
    expect(logo).toBeInTheDocument()
  })

  it('should display username', () => {
    render(<Navbar />)
    
    const username = screen.getByText('@testuser')
    expect(username).toBeInTheDocument()
  })

  it('should have Feed and Profile links', () => {
    render(<Navbar />)
    
    const feedLink = screen.getByText('Feed')
    const profileLink = screen.getByText('Profile')
    
    expect(feedLink).toBeInTheDocument()
    expect(profileLink).toBeInTheDocument()
  })

  it('should highlight active route', () => {
    ;(useRouter as jest.Mock).mockReturnValue({
      pathname: '/feed',
      push: jest.fn(),
    })
    
    render(<Navbar />)
    
    const feedLink = screen.getByText('Feed')
    expect(feedLink.parentElement).toHaveClass('text-primary-700')
  })

  it('should call logout when logout button clicked', () => {
    render(<Navbar />)
    
    const logoutButton = screen.getByText('Logout')
    fireEvent.click(logoutButton)
    
    expect(mockLogout).toHaveBeenCalledTimes(1)
  })

  it('should render logout button', () => {
    render(<Navbar />)
    
    const logoutButton = screen.getByRole('button', { name: /logout/i })
    expect(logoutButton).toBeInTheDocument()
    expect(logoutButton).toHaveClass('bg-gradient-to-r')
    expect(logoutButton).toHaveClass('from-red-500')
  })
})
