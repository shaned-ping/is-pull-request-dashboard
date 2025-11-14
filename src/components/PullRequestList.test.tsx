import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import PullRequestList from './PullRequestList'

// Mock the hooks module
vi.mock('../hooks/usePullRequests', () => ({
  useTeamPullRequests: vi.fn(),
}))

// Mock the PullRequestCard component
vi.mock('./PullRequestCard', () => ({
  default: ({ pr }: any) => <div data-testid={`pr-card-${pr.id}`}>{pr.title}</div>,
}))

import { useTeamPullRequests } from '../hooks/usePullRequests'

// Mock PR data for tests
const mockPullRequests = [
  {
    id: 1,
    number: 123,
    title: 'Test PR 1',
    html_url: 'https://github.com/pinggolf/repo1/pull/123',
    created_at: '2024-11-01T10:00:00Z',
    updated_at: '2024-11-01T12:00:00Z',
    user: {
      login: 'testuser',
      avatar_url: 'https://avatars.githubusercontent.com/u/123',
      html_url: 'https://github.com/testuser',
    },
    repository: {
      name: 'repo1',
      full_name: 'pinggolf/repo1',
      html_url: 'https://github.com/pinggolf/repo1',
    },
    draft: false,
    state: 'open' as const,
  },
  {
    id: 2,
    number: 456,
    title: 'Test PR 2',
    html_url: 'https://github.com/pinggolf/repo2/pull/456',
    created_at: '2024-11-05T14:00:00Z',
    updated_at: '2024-11-05T15:00:00Z',
    user: {
      login: 'anotheruser',
      avatar_url: 'https://avatars.githubusercontent.com/u/456',
      html_url: 'https://github.com/anotheruser',
    },
    repository: {
      name: 'repo2',
      full_name: 'pinggolf/repo2',
      html_url: 'https://github.com/pinggolf/repo2',
    },
    draft: true,
    state: 'open' as const,
  },
  {
    id: 3,
    number: 789,
    title: 'Test PR 3',
    html_url: 'https://github.com/pinggolf/repo3/pull/789',
    created_at: '2024-11-10T16:00:00Z',
    updated_at: '2024-11-10T17:00:00Z',
    user: {
      login: 'thirduser',
      avatar_url: 'https://avatars.githubusercontent.com/u/789',
      html_url: 'https://github.com/thirduser',
    },
    repository: {
      name: 'repo3',
      full_name: 'pinggolf/repo3',
      html_url: 'https://github.com/pinggolf/repo3',
    },
    draft: false,
    state: 'open' as const,
  },
]

describe('PullRequestList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render loading state', () => {
    vi.mocked(useTeamPullRequests).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      isError: false,
      isSuccess: false,
      refetch: vi.fn(),
      isRefetching: false,
    } as any)

    render(<PullRequestList org="pinggolf" team="is-ping-core" days={14} />)

    expect(screen.getByText('Loading pull requests...')).toBeInTheDocument()
    expect(screen.getByText('Loading pull requests...')).toHaveClass('loading')
  })

  it('should render error state with error message', () => {
    const error = new Error('API Error: Rate limit exceeded')

    vi.mocked(useTeamPullRequests).mockReturnValue({
      data: undefined,
      isLoading: false,
      error,
      isError: true,
      isSuccess: false,
      refetch: vi.fn(),
      isRefetching: false,
    } as any)

    render(<PullRequestList org="pinggolf" team="is-ping-core" days={14} />)

    expect(screen.getByText('Error loading pull requests')).toBeInTheDocument()
    expect(screen.getByText('API Error: Rate limit exceeded')).toBeInTheDocument()
    expect(
      screen.getByText(/Make sure you have set the VITE_GITHUB_TOKEN/)
    ).toBeInTheDocument()
  })

  it('should render empty state when no PRs are found', () => {
    vi.mocked(useTeamPullRequests).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      refetch: vi.fn(),
      isRefetching: false,
    } as any)

    render(<PullRequestList org="pinggolf" team="is-ping-core" days={14} />)

    expect(screen.getByText('No open pull requests')).toBeInTheDocument()
    expect(
      screen.getByText('There are no open PRs for the is-ping-core team from the last 14 days.')
    ).toBeInTheDocument()
  })

  it('should render empty state with "from the last day" for days=1', () => {
    vi.mocked(useTeamPullRequests).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      refetch: vi.fn(),
      isRefetching: false,
    } as any)

    render(<PullRequestList org="pinggolf" team="is-ping-core" days={1} />)

    expect(
      screen.getByText('There are no open PRs for the is-ping-core team from the last day.')
    ).toBeInTheDocument()
  })

  it('should render empty state with "at any time" for days=null', () => {
    vi.mocked(useTeamPullRequests).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      refetch: vi.fn(),
      isRefetching: false,
    } as any)

    render(<PullRequestList org="pinggolf" team="is-ping-core" days={null} />)

    expect(
      screen.getByText('There are no open PRs for the is-ping-core team at any time.')
    ).toBeInTheDocument()
  })

  it('should render empty state when data is undefined', () => {
    vi.mocked(useTeamPullRequests).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      refetch: vi.fn(),
      isRefetching: false,
    } as any)

    render(<PullRequestList org="pinggolf" team="is-ping-core" days={14} />)

    expect(screen.getByText('No open pull requests')).toBeInTheDocument()
  })

  it('should render list of pull requests', () => {
    vi.mocked(useTeamPullRequests).mockReturnValue({
      data: mockPullRequests,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      refetch: vi.fn(),
      isRefetching: false,
    } as any)

    render(<PullRequestList org="pinggolf" team="is-ping-core" days={14} />)

    // Check that all PR cards are rendered
    expect(screen.getByTestId('pr-card-1')).toBeInTheDocument()
    expect(screen.getByTestId('pr-card-2')).toBeInTheDocument()
    expect(screen.getByTestId('pr-card-3')).toBeInTheDocument()

    // Check that PR titles are displayed
    expect(screen.getByText('Test PR 1')).toBeInTheDocument()
    expect(screen.getByText('Test PR 2')).toBeInTheDocument()
    expect(screen.getByText('Test PR 3')).toBeInTheDocument()
  })

  it('should render list with correct container class', () => {
    vi.mocked(useTeamPullRequests).mockReturnValue({
      data: mockPullRequests,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      refetch: vi.fn(),
      isRefetching: false,
    } as any)

    const { container } = render(
      <PullRequestList org="pinggolf" team="is-ping-core" days={14} />
    )

    expect(container.querySelector('.pr-list')).toBeInTheDocument()
  })

  it('should pass correct props to useTeamPullRequests hook', () => {
    vi.mocked(useTeamPullRequests).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      refetch: vi.fn(),
      isRefetching: false,
    } as any)

    render(<PullRequestList org="test-org" team="test-team" days={7} />)

    expect(useTeamPullRequests).toHaveBeenCalledWith('test-org', 'test-team', 7)
  })

  it('should pass null days parameter to hook', () => {
    vi.mocked(useTeamPullRequests).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      refetch: vi.fn(),
      isRefetching: false,
    } as any)

    render(<PullRequestList org="test-org" team="test-team" days={null} />)

    expect(useTeamPullRequests).toHaveBeenCalledWith('test-org', 'test-team', null)
  })

  it('should render single pull request', () => {
    vi.mocked(useTeamPullRequests).mockReturnValue({
      data: [mockPullRequests[0]],
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      refetch: vi.fn(),
      isRefetching: false,
    } as any)

    render(<PullRequestList org="pinggolf" team="is-ping-core" days={14} />)

    expect(screen.getByTestId('pr-card-1')).toBeInTheDocument()
    expect(screen.queryByTestId('pr-card-2')).not.toBeInTheDocument()
    expect(screen.queryByTestId('pr-card-3')).not.toBeInTheDocument()
  })

  it('should use PR id as key for list rendering', () => {
    vi.mocked(useTeamPullRequests).mockReturnValue({
      data: mockPullRequests,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      refetch: vi.fn(),
      isRefetching: false,
    } as any)

    const { container } = render(
      <PullRequestList org="pinggolf" team="is-ping-core" days={14} />
    )

    // Check that each PR card has a unique test id based on PR id
    mockPullRequests.forEach((pr) => {
      expect(container.querySelector(`[data-testid="pr-card-${pr.id}"]`)).toBeInTheDocument()
    })
  })
})
