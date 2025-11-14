import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { usePullRequests, useTeamPullRequests, useOrgPullRequests } from './usePullRequests'
import type { ReactNode } from 'react'

// Mock the github service module
vi.mock('../services/github', () => ({
  searchUserPullRequests: vi.fn(),
  searchTeamPullRequests: vi.fn(),
  searchOrgPullRequests: vi.fn(),
}))

import {
  searchUserPullRequests,
  searchTeamPullRequests,
  searchOrgPullRequests,
} from '../services/github'

// Mock PR data for tests
const mockPullRequests = [
  {
    id: 1,
    number: 123,
    title: 'Test PR 1',
    html_url: 'https://github.com/test/repo/pull/123',
    created_at: '2024-11-01T10:00:00Z',
    updated_at: '2024-11-01T12:00:00Z',
    user: {
      login: 'testuser',
      avatar_url: 'https://avatars.githubusercontent.com/u/123',
      html_url: 'https://github.com/testuser',
    },
    repository: {
      name: 'repo',
      full_name: 'test/repo',
      html_url: 'https://github.com/test/repo',
    },
    draft: false,
    state: 'open' as const,
  },
  {
    id: 2,
    number: 456,
    title: 'Test PR 2',
    html_url: 'https://github.com/test/repo/pull/456',
    created_at: '2024-11-05T14:00:00Z',
    updated_at: '2024-11-05T15:00:00Z',
    user: {
      login: 'anotheruser',
      avatar_url: 'https://avatars.githubusercontent.com/u/456',
      html_url: 'https://github.com/anotheruser',
    },
    repository: {
      name: 'repo',
      full_name: 'test/repo',
      html_url: 'https://github.com/test/repo',
    },
    draft: true,
    state: 'open' as const,
  },
]

// Create a wrapper component that provides QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries for tests
      },
    },
  })

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('usePullRequests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch and return pull requests for a user', async () => {
    vi.mocked(searchUserPullRequests).mockResolvedValue(mockPullRequests)

    const { result } = renderHook(() => usePullRequests('testuser', 14), {
      wrapper: createWrapper(),
    })

    // Initially loading
    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()

    // Wait for the query to complete
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Check results
    expect(searchUserPullRequests).toHaveBeenCalledWith('testuser', 14)
    expect(result.current.data).toEqual(mockPullRequests)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should use default days parameter of 14', async () => {
    vi.mocked(searchUserPullRequests).mockResolvedValue(mockPullRequests)

    const { result } = renderHook(() => usePullRequests('testuser'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(searchUserPullRequests).toHaveBeenCalledWith('testuser', 14)
  })

  it('should handle null days parameter for all-time search', async () => {
    vi.mocked(searchUserPullRequests).mockResolvedValue(mockPullRequests)

    const { result } = renderHook(() => usePullRequests('testuser', null), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(searchUserPullRequests).toHaveBeenCalledWith('testuser', null)
    expect(result.current.data).toEqual(mockPullRequests)
  })

  it('should handle empty results', async () => {
    vi.mocked(searchUserPullRequests).mockResolvedValue([])

    const { result } = renderHook(() => usePullRequests('testuser', 14), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('should handle errors from API', async () => {
    const error = new Error('API Error: User not found')
    vi.mocked(searchUserPullRequests).mockRejectedValue(error)

    const { result } = renderHook(() => usePullRequests('testuser', 14), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toEqual(error)
    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
  })

  it('should cache results with correct query key', async () => {
    vi.mocked(searchUserPullRequests).mockResolvedValue(mockPullRequests)

    const { result, rerender } = renderHook(
      ({ username, days }) => usePullRequests(username, days),
      {
        wrapper: createWrapper(),
        initialProps: { username: 'testuser', days: 14 },
      }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Should be called once
    expect(searchUserPullRequests).toHaveBeenCalledTimes(1)

    // Rerender with same params should use cache
    rerender({ username: 'testuser', days: 14 })

    // Should still be called only once (cached)
    expect(searchUserPullRequests).toHaveBeenCalledTimes(1)

    // Rerender with different params should fetch new data
    rerender({ username: 'testuser', days: 7 })

    await waitFor(() => expect(searchUserPullRequests).toHaveBeenCalledTimes(2))

    expect(searchUserPullRequests).toHaveBeenCalledWith('testuser', 7)
  })
})

describe('useTeamPullRequests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch and return pull requests for a team', async () => {
    vi.mocked(searchTeamPullRequests).mockResolvedValue(mockPullRequests)

    const { result } = renderHook(() => useTeamPullRequests('pinggolf', 'is-ping-core', 14), {
      wrapper: createWrapper(),
    })

    // Initially loading
    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()

    // Wait for the query to complete
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Check results
    expect(searchTeamPullRequests).toHaveBeenCalledWith('pinggolf', 'is-ping-core', 14)
    expect(result.current.data).toEqual(mockPullRequests)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should use default days parameter of 14', async () => {
    vi.mocked(searchTeamPullRequests).mockResolvedValue(mockPullRequests)

    const { result } = renderHook(() => useTeamPullRequests('pinggolf', 'is-ping-core'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(searchTeamPullRequests).toHaveBeenCalledWith('pinggolf', 'is-ping-core', 14)
  })

  it('should handle null days parameter for all-time search', async () => {
    vi.mocked(searchTeamPullRequests).mockResolvedValue(mockPullRequests)

    const { result } = renderHook(() => useTeamPullRequests('pinggolf', 'is-ping-core', null), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(searchTeamPullRequests).toHaveBeenCalledWith('pinggolf', 'is-ping-core', null)
    expect(result.current.data).toEqual(mockPullRequests)
  })

  it('should handle empty results when team has no PRs', async () => {
    vi.mocked(searchTeamPullRequests).mockResolvedValue([])

    const { result } = renderHook(() => useTeamPullRequests('pinggolf', 'is-ping-core', 14), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('should handle errors from API', async () => {
    const error = new Error('API Error: Team not found')
    vi.mocked(searchTeamPullRequests).mockRejectedValue(error)

    const { result } = renderHook(() => useTeamPullRequests('pinggolf', 'is-ping-core', 14), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toEqual(error)
    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
  })

  it('should cache results with correct query key', async () => {
    vi.mocked(searchTeamPullRequests).mockResolvedValue(mockPullRequests)

    const { result, rerender } = renderHook(
      ({ org, team, days }) => useTeamPullRequests(org, team, days),
      {
        wrapper: createWrapper(),
        initialProps: { org: 'pinggolf', team: 'is-ping-core', days: 14 },
      }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Should be called once
    expect(searchTeamPullRequests).toHaveBeenCalledTimes(1)

    // Rerender with same params should use cache
    rerender({ org: 'pinggolf', team: 'is-ping-core', days: 14 })

    // Should still be called only once (cached)
    expect(searchTeamPullRequests).toHaveBeenCalledTimes(1)

    // Rerender with different days should fetch new data
    rerender({ org: 'pinggolf', team: 'is-ping-core', days: 7 })

    await waitFor(() => expect(searchTeamPullRequests).toHaveBeenCalledTimes(2))

    expect(searchTeamPullRequests).toHaveBeenCalledWith('pinggolf', 'is-ping-core', 7)
  })

  it('should refetch when org changes', async () => {
    vi.mocked(searchTeamPullRequests).mockResolvedValue(mockPullRequests)

    const { result, rerender } = renderHook(
      ({ org, team, days }) => useTeamPullRequests(org, team, days),
      {
        wrapper: createWrapper(),
        initialProps: { org: 'pinggolf', team: 'is-ping-core', days: 14 },
      }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(searchTeamPullRequests).toHaveBeenCalledTimes(1)

    // Change organization
    rerender({ org: 'different-org', team: 'is-ping-core', days: 14 })

    await waitFor(() => expect(searchTeamPullRequests).toHaveBeenCalledTimes(2))

    expect(searchTeamPullRequests).toHaveBeenCalledWith('different-org', 'is-ping-core', 14)
  })

  it('should refetch when team changes', async () => {
    vi.mocked(searchTeamPullRequests).mockResolvedValue(mockPullRequests)

    const { result, rerender } = renderHook(
      ({ org, team, days }) => useTeamPullRequests(org, team, days),
      {
        wrapper: createWrapper(),
        initialProps: { org: 'pinggolf', team: 'is-ping-core', days: 14 },
      }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(searchTeamPullRequests).toHaveBeenCalledTimes(1)

    // Change team
    rerender({ org: 'pinggolf', team: 'different-team', days: 14 })

    await waitFor(() => expect(searchTeamPullRequests).toHaveBeenCalledTimes(2))

    expect(searchTeamPullRequests).toHaveBeenCalledWith('pinggolf', 'different-team', 14)
  })
})

describe('useOrgPullRequests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch and return pull requests for an organization', async () => {
    vi.mocked(searchOrgPullRequests).mockResolvedValue(mockPullRequests)

    const { result } = renderHook(() => useOrgPullRequests('pinggolf', 14), {
      wrapper: createWrapper(),
    })

    // Initially loading
    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()

    // Wait for the query to complete
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Check results
    expect(searchOrgPullRequests).toHaveBeenCalledWith('pinggolf', 14)
    expect(result.current.data).toEqual(mockPullRequests)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should use default days parameter of 14', async () => {
    vi.mocked(searchOrgPullRequests).mockResolvedValue(mockPullRequests)

    const { result } = renderHook(() => useOrgPullRequests('pinggolf'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(searchOrgPullRequests).toHaveBeenCalledWith('pinggolf', 14)
  })

  it('should handle null days parameter for all-time search', async () => {
    vi.mocked(searchOrgPullRequests).mockResolvedValue(mockPullRequests)

    const { result } = renderHook(() => useOrgPullRequests('pinggolf', null), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(searchOrgPullRequests).toHaveBeenCalledWith('pinggolf', null)
    expect(result.current.data).toEqual(mockPullRequests)
  })

  it('should handle empty results when org has no PRs', async () => {
    vi.mocked(searchOrgPullRequests).mockResolvedValue([])

    const { result } = renderHook(() => useOrgPullRequests('pinggolf', 14), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('should handle errors from API', async () => {
    const error = new Error('API Error: Organization not found')
    vi.mocked(searchOrgPullRequests).mockRejectedValue(error)

    const { result } = renderHook(() => useOrgPullRequests('pinggolf', 14), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toEqual(error)
    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
  })

  it('should cache results with correct query key', async () => {
    vi.mocked(searchOrgPullRequests).mockResolvedValue(mockPullRequests)

    const { result, rerender } = renderHook(({ org, days }) => useOrgPullRequests(org, days), {
      wrapper: createWrapper(),
      initialProps: { org: 'pinggolf', days: 14 },
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Should be called once
    expect(searchOrgPullRequests).toHaveBeenCalledTimes(1)

    // Rerender with same params should use cache
    rerender({ org: 'pinggolf', days: 14 })

    // Should still be called only once (cached)
    expect(searchOrgPullRequests).toHaveBeenCalledTimes(1)

    // Rerender with different days should fetch new data
    rerender({ org: 'pinggolf', days: 7 })

    await waitFor(() => expect(searchOrgPullRequests).toHaveBeenCalledTimes(2))

    expect(searchOrgPullRequests).toHaveBeenCalledWith('pinggolf', 7)
  })

  it('should refetch when org changes', async () => {
    vi.mocked(searchOrgPullRequests).mockResolvedValue(mockPullRequests)

    const { result, rerender } = renderHook(({ org, days }) => useOrgPullRequests(org, days), {
      wrapper: createWrapper(),
      initialProps: { org: 'pinggolf', days: 14 },
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(searchOrgPullRequests).toHaveBeenCalledTimes(1)

    // Change organization
    rerender({ org: 'different-org', days: 14 })

    await waitFor(() => expect(searchOrgPullRequests).toHaveBeenCalledTimes(2))

    expect(searchOrgPullRequests).toHaveBeenCalledWith('different-org', 14)
  })
})
