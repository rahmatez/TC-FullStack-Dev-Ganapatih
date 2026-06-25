import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import CreatePost from '@/components/CreatePost'

describe('CreatePost Component', () => {
  const mockOnPostCreated = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render textarea', () => {
    render(<CreatePost onPostCreated={mockOnPostCreated} />)
    
    const textarea = screen.getByPlaceholderText(/What's on your mind/i)
    expect(textarea).toBeTruthy()
  })

  it('should render post button', () => {
    render(<CreatePost onPostCreated={mockOnPostCreated} />)
    
    const button = screen.getByRole('button', { name: /post/i })
    expect(button).toBeTruthy()
  })

  it('should update textarea value on input', () => {
    render(<CreatePost onPostCreated={mockOnPostCreated} />)
    
    const textarea = screen.getByPlaceholderText(/What's on your mind/i) as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'Test post content' } })
    
    expect(textarea.value).toBe('Test post content')
  })

  it('should disable button when textarea is empty', () => {
    render(<CreatePost onPostCreated={mockOnPostCreated} />)
    
    const button = screen.getByRole('button', { name: /post/i })
    expect(button).toBeDisabled()
  })

  it('should enable button when textarea has content', () => {
    render(<CreatePost onPostCreated={mockOnPostCreated} />)
    
    const textarea = screen.getByPlaceholderText(/What's on your mind/i)
    const button = screen.getByRole('button', { name: /post/i })
    
    fireEvent.change(textarea, { target: { value: 'Test content' } })
    
    expect(button).not.toBeDisabled()
  })

  it('should have character counter', () => {
    render(<CreatePost onPostCreated={mockOnPostCreated} />)
    
    const counter = screen.getByText(/0/)
    expect(counter).toBeTruthy()
    expect(counter.textContent).toContain('/200')
  })

  it('should update character counter on input', () => {
    render(<CreatePost onPostCreated={mockOnPostCreated} />)
    
    const textarea = screen.getByPlaceholderText(/What's on your mind/i)
    fireEvent.change(textarea, { target: { value: 'Hello' } })
    
    const counter = screen.getByText(/5/)
    expect(counter).toBeTruthy()
    expect(counter.textContent).toContain('/200')
  })

  it('should show error for content exceeding 200 characters', () => {
    render(<CreatePost onPostCreated={mockOnPostCreated} />)
    
    const textarea = screen.getByPlaceholderText(/What's on your mind/i)
    const longText = 'a'.repeat(201)
    
    fireEvent.change(textarea, { target: { value: longText } })
    
    const counter = screen.getByText(/201/)
    expect(counter).toBeTruthy()
    expect(counter.className).toContain('text-red-500')
  })
})
