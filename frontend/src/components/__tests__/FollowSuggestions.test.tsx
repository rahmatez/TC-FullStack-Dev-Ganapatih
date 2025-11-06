import '@testing-library/jest-dom'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import FollowSuggestions from '@/components/FollowSuggestions'
import api from '@/lib/api'
import toast from 'react-hot-toast'

jest.mock('@/lib/api')
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}))

const mockedApi = api as jest.Mocked<typeof api>
const mockedToast = toast as jest.Mocked<typeof toast>

const mockSuggestions = [
  {
    id: 1,
    username: 'alice',
    createdAt: '2023-01-01T00:00:00.000Z',
    isFollowing: false,
  },
  {
    id: 2,
    username: 'bob',
    createdAt: '2023-01-02T00:00:00.000Z',
    isFollowing: true,
  },
]

describe('FollowSuggestions Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedApi.get.mockResolvedValue({ data: mockSuggestions })
    mockedApi.post.mockResolvedValue({})
    mockedApi.delete.mockResolvedValue({})
  })

  it('renders fetched suggestions', async () => {
    render(<FollowSuggestions />)

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith('/users')
    })

    expect(await screen.findByText('@alice')).toBeInTheDocument()
    expect(screen.getByText('@bob')).toBeInTheDocument()
  })

  it('toggles follow status when button clicked', async () => {
    render(<FollowSuggestions />)

  const followButtons = await screen.findAllByRole('button', { name: /follow/i })
  const followButton = followButtons[0]
    fireEvent.click(followButton)

    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledWith('/follow/1')
    })

    expect(mockedToast.success).toHaveBeenCalledWith('Now following user', expect.any(Object))
  })
})
