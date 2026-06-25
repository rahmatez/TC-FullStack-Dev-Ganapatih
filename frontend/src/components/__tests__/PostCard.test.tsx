import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import PostCard from '@/components/PostCard'

describe('PostCard Component', () => {
  const mockPost = {
    id: 1,
    userId: 1,
    username: 'testuser',
    content: 'This is a test post content',
    createdAt: new Date().toISOString(),
  }

  it('should render post content', () => {
    render(<PostCard post={mockPost} />)
    
    const content = screen.getByText('This is a test post content')
    expect(content).toBeInTheDocument()
  })

  it('should display username with @ symbol', () => {
    render(<PostCard post={mockPost} />)
    
    const username = screen.getByText('@testuser')
    expect(username).toBeInTheDocument()
  })

  it('should display user avatar with first letter', () => {
    render(<PostCard post={mockPost} />)
    
    const avatar = screen.getByText('T')
    expect(avatar).toBeInTheDocument()
  })

  it('should have proper styling classes', () => {
    render(<PostCard post={mockPost} />)
    
    const content = screen.getByText('This is a test post content')
    expect(content).toHaveClass('text-gray-800')
  })

  it('should render relative time', () => {
    const oldDate = new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1 hour ago
    const post = { ...mockPost, createdAt: oldDate }
    
    render(<PostCard post={post} />)
    
    // Should contain "ago" in relative time
    const timeText = screen.getByText(/ago/)
    expect(timeText).toBeInTheDocument()
  })

  it('should handle invalid date gracefully', () => {
    const post = { ...mockPost, createdAt: 'invalid-date' }
    
    render(<PostCard post={post} />)
    
    // Should still render the post
    const content = screen.getByText('This is a test post content')
    expect(content).toBeInTheDocument()
  })

  it('should capitalize first letter of username in avatar', () => {
    const post = { ...mockPost, username: 'john' }
    
    render(<PostCard post={post} />)
    
    const avatar = screen.getByText('J')
    expect(avatar).toBeInTheDocument()
  })
})
