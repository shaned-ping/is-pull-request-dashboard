import { describe, it, expect, vi, beforeEach } from 'vitest'

// Use vi.hoisted() to ensure mocks are available during hoisting
const { mockPaginate, mockListReposInOrg, mockIssuesAndPullRequests } = vi.hoisted(() => ({
  mockPaginate: vi.fn(),
  mockListReposInOrg: vi.fn(),
  mockIssuesAndPullRequests: vi.fn(),
}))

// Mock the entire @octokit/rest module
vi.mock('@octokit/rest', () => ({
  Octokit: class MockOctokit {
    teams = {
      listReposInOrg: mockListReposInOrg,
    }
    search = {
      issuesAndPullRequests: mockIssuesAndPullRequests,
    }
    paginate = mockPaginate
  },
}))

// Import after mocking
import {
  getTeamRepositories,
  searchOrgPullRequests,
  searchTeamPullRequests,
  searchUserPullRequests,
} from './github'

describe('github service', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()
  })

  describe('getTeamRepositories', () => {
    it('should fetch and return team repository names', async () => {
      const mockRepos = [
        { full_name: 'pinggolf/repo1' },
        { full_name: 'pinggolf/repo2' },
        { full_name: 'pinggolf/repo3' },
      ]

      mockPaginate.mockResolvedValue(mockRepos)

      const result = await getTeamRepositories('pinggolf', 'is-ping-core')

      expect(mockPaginate).toHaveBeenCalledWith(mockListReposInOrg, {
        org: 'pinggolf',
        team_slug: 'is-ping-core',
        per_page: 100,
      })
      expect(result).toEqual(['pinggolf/repo1', 'pinggolf/repo2', 'pinggolf/repo3'])
    })

    it('should handle pagination for teams with many repositories', async () => {
      // Create 150 mock repos to test pagination
      const mockRepos = Array.from({ length: 150 }, (_, i) => ({
        full_name: `pinggolf/repo${i + 1}`,
      }))

      mockPaginate.mockResolvedValue(mockRepos)

      const result = await getTeamRepositories('pinggolf', 'is-ping-core')

      expect(result).toHaveLength(150)
      expect(result[0]).toBe('pinggolf/repo1')
      expect(result[149]).toBe('pinggolf/repo150')
    })

    it('should return empty array when team has no repositories', async () => {
      mockPaginate.mockResolvedValue([])

      const result = await getTeamRepositories('pinggolf', 'is-ping-core')

      expect(result).toEqual([])
    })

    it('should throw error when API call fails', async () => {
      const error = new Error('API Error: Not Found')
      mockPaginate.mockRejectedValue(error)

      await expect(getTeamRepositories('pinggolf', 'is-ping-core')).rejects.toThrow(
        'API Error: Not Found'
      )
    })
  })

  describe('searchOrgPullRequests', () => {
    const mockPRItems = [
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
        repository_url: 'https://api.github.com/repos/pinggolf/repo1',
        draft: false,
        state: 'open',
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
        repository_url: 'https://api.github.com/repos/pinggolf/repo2',
        draft: true,
        state: 'open',
      },
    ]

    it('should fetch org PRs with date filter', async () => {
      mockPaginate.mockResolvedValue(mockPRItems)

      const result = await searchOrgPullRequests('pinggolf', 14)

      expect(mockPaginate).toHaveBeenCalledWith(
        mockIssuesAndPullRequests,
        expect.objectContaining({
          q: expect.stringMatching(/^is:pr is:open org:pinggolf created:>=/),
          sort: 'created',
          order: 'desc',
          per_page: 100,
        })
      )

      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({
        id: 1,
        number: 123,
        title: 'Test PR 1',
        draft: false,
        state: 'open',
      })
    })

    it('should fetch all org PRs when days is null', async () => {
      mockPaginate.mockResolvedValue(mockPRItems)

      const result = await searchOrgPullRequests('pinggolf', null)

      expect(mockPaginate).toHaveBeenCalledWith(
        mockIssuesAndPullRequests,
        expect.objectContaining({
          q: 'is:pr is:open org:pinggolf',
          sort: 'created',
          order: 'desc',
          per_page: 100,
        })
      )

      expect(result).toHaveLength(2)
    })

    it('should correctly transform API response to PullRequest type', async () => {
      mockPaginate.mockResolvedValue(mockPRItems)

      const result = await searchOrgPullRequests('pinggolf', 14)

      expect(result[0]).toEqual({
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
        state: 'open',
      })
    })

    it('should handle draft PRs correctly', async () => {
      mockPaginate.mockResolvedValue(mockPRItems)

      const result = await searchOrgPullRequests('pinggolf', 14)

      expect(result[1].draft).toBe(true)
    })

    it('should return empty array when no PRs found', async () => {
      mockPaginate.mockResolvedValue([])

      const result = await searchOrgPullRequests('pinggolf', 14)

      expect(result).toEqual([])
    })

    it('should throw error when API call fails', async () => {
      const error = new Error('API Error: Rate limit exceeded')
      mockPaginate.mockRejectedValue(error)

      await expect(searchOrgPullRequests('pinggolf', 14)).rejects.toThrow(
        'API Error: Rate limit exceeded'
      )
    })
  })

  describe('searchUserPullRequests', () => {
    const mockUserPRItems = [
      {
        id: 10,
        number: 100,
        title: 'User PR 1',
        html_url: 'https://github.com/shaned-ping/repo1/pull/100',
        created_at: '2024-11-01T10:00:00Z',
        updated_at: '2024-11-01T12:00:00Z',
        user: {
          login: 'shaned-ping',
          avatar_url: 'https://avatars.githubusercontent.com/u/1000',
          html_url: 'https://github.com/shaned-ping',
        },
        repository_url: 'https://api.github.com/repos/shaned-ping/repo1',
        draft: false,
        state: 'open',
      },
      {
        id: 11,
        number: 101,
        title: 'User PR 2',
        html_url: 'https://github.com/shaned-ping/repo2/pull/101',
        created_at: '2024-11-05T14:00:00Z',
        updated_at: '2024-11-05T15:00:00Z',
        user: {
          login: 'shaned-ping',
          avatar_url: 'https://avatars.githubusercontent.com/u/1000',
          html_url: 'https://github.com/shaned-ping',
        },
        repository_url: 'https://api.github.com/repos/shaned-ping/repo2',
        draft: true,
        state: 'open',
      },
    ]

    it('should fetch user PRs with date filter', async () => {
      // searchUserPullRequests calls octokit.search.issuesAndPullRequests directly, not via paginate
      mockIssuesAndPullRequests.mockResolvedValue({ data: { items: mockUserPRItems } })

      const result = await searchUserPullRequests('shaned-ping', 14)

      expect(mockIssuesAndPullRequests).toHaveBeenCalledWith(
        expect.objectContaining({
          q: expect.stringMatching(/^is:pr is:open user:shaned-ping created:>=/),
          sort: 'created',
          order: 'desc',
          per_page: 100,
        })
      )

      expect(result).toHaveLength(2)
      expect(result[0].user.login).toBe('shaned-ping')
    })

    it('should fetch all user PRs when days is null', async () => {
      mockIssuesAndPullRequests.mockResolvedValue({ data: { items: mockUserPRItems } })

      const result = await searchUserPullRequests('shaned-ping', null)

      expect(mockIssuesAndPullRequests).toHaveBeenCalledWith(
        expect.objectContaining({
          q: 'is:pr is:open user:shaned-ping',
          sort: 'created',
          order: 'desc',
          per_page: 100,
        })
      )

      expect(result).toHaveLength(2)
    })

    it('should use default 14 days when days parameter not provided', async () => {
      mockIssuesAndPullRequests.mockResolvedValue({ data: { items: mockUserPRItems } })

      const result = await searchUserPullRequests('shaned-ping')

      expect(mockIssuesAndPullRequests).toHaveBeenCalledWith(
        expect.objectContaining({
          q: expect.stringMatching(/created:>=/),
        })
      )

      expect(result).toHaveLength(2)
    })

    it('should correctly transform API response to PullRequest type', async () => {
      mockIssuesAndPullRequests.mockResolvedValue({ data: { items: mockUserPRItems } })

      const result = await searchUserPullRequests('shaned-ping', 14)

      expect(result[0]).toEqual({
        id: 10,
        number: 100,
        title: 'User PR 1',
        html_url: 'https://github.com/shaned-ping/repo1/pull/100',
        created_at: '2024-11-01T10:00:00Z',
        updated_at: '2024-11-01T12:00:00Z',
        user: {
          login: 'shaned-ping',
          avatar_url: 'https://avatars.githubusercontent.com/u/1000',
          html_url: 'https://github.com/shaned-ping',
        },
        repository: {
          name: 'repo1',
          full_name: 'shaned-ping/repo1',
          html_url: 'https://github.com/shaned-ping/repo1',
        },
        draft: false,
        state: 'open',
      })
    })

    it('should return empty array when user has no PRs', async () => {
      mockIssuesAndPullRequests.mockResolvedValue({ data: { items: [] } })

      const result = await searchUserPullRequests('shaned-ping', 14)

      expect(result).toEqual([])
    })

    it('should throw error when API call fails', async () => {
      const error = new Error('API Error: User not found')
      mockIssuesAndPullRequests.mockRejectedValue(error)

      await expect(searchUserPullRequests('shaned-ping', 14)).rejects.toThrow(
        'API Error: User not found'
      )
    })
  })

  describe('searchTeamPullRequests', () => {
    const mockTeamRepos = ['pinggolf/repo1', 'pinggolf/repo2']
    const mockOrgPRs = [
      {
        id: 1,
        number: 123,
        title: 'PR in team repo',
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
        state: 'open',
      },
      {
        id: 2,
        number: 456,
        title: 'PR in non-team repo',
        html_url: 'https://github.com/pinggolf/repo3/pull/456',
        created_at: '2024-11-05T14:00:00Z',
        updated_at: '2024-11-05T15:00:00Z',
        user: {
          login: 'anotheruser',
          avatar_url: 'https://avatars.githubusercontent.com/u/456',
          html_url: 'https://github.com/anotheruser',
        },
        repository: {
          name: 'repo3',
          full_name: 'pinggolf/repo3',
          html_url: 'https://github.com/pinggolf/repo3',
        },
        draft: false,
        state: 'open',
      },
      {
        id: 3,
        number: 789,
        title: 'Another PR in team repo',
        html_url: 'https://github.com/pinggolf/repo2/pull/789',
        created_at: '2024-11-10T16:00:00Z',
        updated_at: '2024-11-10T17:00:00Z',
        user: {
          login: 'thirduser',
          avatar_url: 'https://avatars.githubusercontent.com/u/789',
          html_url: 'https://github.com/thirduser',
        },
        repository: {
          name: 'repo2',
          full_name: 'pinggolf/repo2',
          html_url: 'https://github.com/pinggolf/repo2',
        },
        draft: true,
        state: 'open',
      },
    ]

    beforeEach(() => {
      // Mock both API calls
      mockPaginate.mockImplementation((fn: unknown) => {
        if (fn === mockListReposInOrg) {
          return Promise.resolve(
            mockTeamRepos.map((name) => ({ full_name: name }))
          )
        }
        if (fn === mockIssuesAndPullRequests) {
          return Promise.resolve(
            mockOrgPRs.map((pr) => ({
              ...pr,
              repository_url: `https://api.github.com/repos/${pr.repository.full_name}`,
              user: {
                login: pr.user.login,
                avatar_url: pr.user.avatar_url,
                html_url: pr.user.html_url,
              },
            }))
          )
        }
        return Promise.resolve([])
      })
    })

    it('should filter PRs to only include team repositories', async () => {
      const result = await searchTeamPullRequests('pinggolf', 'is-ping-core', 14)

      expect(result).toHaveLength(2)
      expect(result[0].repository.full_name).toBe('pinggolf/repo1')
      expect(result[1].repository.full_name).toBe('pinggolf/repo2')
      expect(result.some((pr) => pr.repository.full_name === 'pinggolf/repo3')).toBe(
        false
      )
    })

    it('should make parallel API calls for team repos and org PRs', async () => {
      await searchTeamPullRequests('pinggolf', 'is-ping-core', 14)

      // Both paginate calls should have been made
      expect(mockPaginate).toHaveBeenCalledTimes(2)
    })

    it('should return empty array when team has no repositories', async () => {
      mockPaginate.mockImplementation((fn: unknown) => {
        if (fn === mockListReposInOrg) {
          return Promise.resolve([])
        }
        return Promise.resolve([])
      })

      const result = await searchTeamPullRequests('pinggolf', 'is-ping-core', 14)

      expect(result).toEqual([])
    })

    it('should handle case when org has PRs but none in team repos', async () => {
      mockPaginate.mockImplementation((fn: unknown) => {
        if (fn === mockListReposInOrg) {
          return Promise.resolve([{ full_name: 'pinggolf/other-repo' }])
        }
        if (fn === mockIssuesAndPullRequests) {
          return Promise.resolve(
            mockOrgPRs.map((pr) => ({
              ...pr,
              repository_url: `https://api.github.com/repos/${pr.repository.full_name}`,
              user: pr.user,
            }))
          )
        }
        return Promise.resolve([])
      })

      const result = await searchTeamPullRequests('pinggolf', 'is-ping-core', 14)

      expect(result).toEqual([])
    })

    it('should pass days parameter correctly', async () => {
      await searchTeamPullRequests('pinggolf', 'is-ping-core', 7)

      expect(mockPaginate).toHaveBeenCalledWith(
        mockIssuesAndPullRequests,
        expect.objectContaining({
          q: expect.stringMatching(/created:>=/),
        })
      )
    })

    it('should handle null days parameter', async () => {
      await searchTeamPullRequests('pinggolf', 'is-ping-core', null)

      expect(mockPaginate).toHaveBeenCalledWith(
        mockIssuesAndPullRequests,
        expect.objectContaining({
          q: 'is:pr is:open org:pinggolf',
        })
      )
    })

    it('should throw error when team repos fetch fails', async () => {
      const error = new Error('Failed to fetch team repositories')
      mockPaginate.mockRejectedValueOnce(error)

      await expect(
        searchTeamPullRequests('pinggolf', 'is-ping-core', 14)
      ).rejects.toThrow('Failed to fetch team repositories')
    })

    it('should throw error when org PRs fetch fails', async () => {
      // Reset mocks and set up for this specific test
      // First paginate call (team repos) succeeds, second (org PRs) fails
      let callCount = 0
      mockPaginate.mockImplementation((fn: unknown) => {
        callCount++
        if (callCount === 1 && fn === mockListReposInOrg) {
          return Promise.resolve(mockTeamRepos.map((name) => ({ full_name: name })))
        }
        return Promise.reject(new Error('Failed to fetch org PRs'))
      })

      await expect(
        searchTeamPullRequests('pinggolf', 'is-ping-core', 14)
      ).rejects.toThrow('Failed to fetch org PRs')
    })
  })
})
