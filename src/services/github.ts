import { Octokit } from '@octokit/rest'
import type { PullRequest } from '../types/github'
import { formatDateForGitHub, getDaysAgo, getTwoWeeksAgo } from '../utils/dateUtils'

/**
 * Octokit client instance for GitHub API interactions
 * Initialized with authentication token from environment variables
 *
 * @remarks
 * Requires VITE_GITHUB_TOKEN environment variable with scopes: repo, read:org
 * Rate limits: 5000 requests/hour (authenticated), 60/hour (unauthenticated)
 */
const octokit = new Octokit({
  auth: import.meta.env.VITE_GITHUB_TOKEN,
})

/**
 * Search for open pull requests associated with a specific GitHub team
 *
 * Fetches PRs that were created within the last 2 weeks and are currently open.
 * Uses GitHub's search API with team-based filtering.
 *
 * @param teamName - The GitHub team name to filter by (e.g., "is-ping-core" or "org/team-name")
 * @returns Promise resolving to an array of pull requests matching the criteria
 * @throws {Error} If the GitHub API request fails or authentication is invalid
 *
 * @remarks
 * GitHub's team search syntax can be tricky. If this doesn't work for your setup,
 * consider using `searchOrgPullRequests` instead or customize the query to use:
 * - `org:organization-name` for organization-wide search
 * - `involves:username1 involves:username2` for specific users
 *
 * The function automatically:
 * - Filters to only open PRs
 * - Limits to PRs created in the last 14 days
 * - Sorts by creation date (newest first)
 * - Transforms API response to match our PullRequest type
 *
 * @example
 * ```typescript
 * const prs = await searchPullRequests('is-ping-core')
 * console.log(`Found ${prs.length} open PRs`)
 * ```
 */
export async function searchPullRequests(teamName: string): Promise<PullRequest[]> {
  try {
    const twoWeeksAgo = getTwoWeeksAgo()
    const dateString = formatDateForGitHub(twoWeeksAgo)

    // Search for open PRs created in the last 2 weeks
    // You'll need to customize this query based on your actual GitHub org/repos
    // Example: team:org/team-name or involves:username
    const query = `is:pr is:open created:>=${dateString} team:${teamName}`

    const response = await octokit.search.issuesAndPullRequests({
      q: query,
      sort: 'created',
      order: 'desc',
      per_page: 100,
    })

    // Transform the response to include repository information
    const pullRequests: PullRequest[] = response.data.items.map((item) => ({
      id: item.id,
      number: item.number,
      title: item.title,
      html_url: item.html_url,
      created_at: item.created_at,
      updated_at: item.updated_at,
      user: {
        login: item.user?.login || 'unknown',
        avatar_url: item.user?.avatar_url || '',
        html_url: item.user?.html_url || '',
      },
      repository: {
        name: item.repository_url.split('/').pop() || '',
        full_name: item.repository_url.split('/').slice(-2).join('/') || '',
        html_url: item.repository_url.replace('api.github.com/repos', 'github.com'),
      },
      draft: item.draft || false,
      state: item.state as 'open' | 'closed',
    }))

    return pullRequests
  } catch (error) {
    console.error('Error fetching pull requests:', error)
    throw error
  }
}

/**
 * Search for open pull requests in a specific user's repositories
 *
 * Fetches all open PRs from repositories owned by the specified user,
 * optionally filtered by creation date.
 *
 * @param username - The GitHub username (e.g., "shaned-ping", "torvalds")
 * @param days - Number of days to look back (1-30), or null for all time (default: 14)
 * @returns Promise resolving to an array of pull requests from user's repositories
 * @throws {Error} If the GitHub API request fails or authentication is invalid
 *
 * @remarks
 * This searches only repositories owned by the user, not:
 * - Repositories they've contributed to
 * - Organization repositories they're part of
 * - PRs they've created in other repos
 *
 * Use this for personal account PR dashboards.
 *
 * Date filtering:
 * - Pass a number (1-30) to filter PRs from the last N days
 * - Pass null to get all open PRs regardless of age
 *
 * @example
 * ```typescript
 * // Last 7 days
 * const weekPRs = await searchUserPullRequests('shaned-ping', 7)
 *
 * // Last 14 days (default)
 * const defaultPRs = await searchUserPullRequests('shaned-ping', 14)
 *
 * // All time
 * const allPRs = await searchUserPullRequests('shaned-ping', null)
 * ```
 */
export async function searchUserPullRequests(
  username: string,
  days: number | null = 14
): Promise<PullRequest[]> {
  try {
    // Build query with optional date filter
    let query = `is:pr is:open user:${username}`

    if (days !== null) {
      const cutoffDate = getDaysAgo(days)
      const dateString = formatDateForGitHub(cutoffDate)
      query += ` created:>=${dateString}`
    }

    const response = await octokit.search.issuesAndPullRequests({
      q: query,
      sort: 'created',
      order: 'desc',
      per_page: 100,
    })

    const pullRequests: PullRequest[] = response.data.items.map((item) => ({
      id: item.id,
      number: item.number,
      title: item.title,
      html_url: item.html_url,
      created_at: item.created_at,
      updated_at: item.updated_at,
      user: {
        login: item.user?.login || 'unknown',
        avatar_url: item.user?.avatar_url || '',
        html_url: item.user?.html_url || '',
      },
      repository: {
        name: item.repository_url.split('/').pop() || '',
        full_name: item.repository_url.split('/').slice(-2).join('/') || '',
        html_url: item.repository_url.replace('api.github.com/repos', 'github.com'),
      },
      draft: item.draft || false,
      state: item.state as 'open' | 'closed',
    }))

    return pullRequests
  } catch (error) {
    console.error('Error fetching pull requests:', error)
    throw error
  }
}

/**
 * Search for open pull requests across an entire GitHub organization
 *
 * Alternative to team-based search. Fetches all open PRs for an organization
 * that were created within the last 2 weeks.
 *
 * @param org - The GitHub organization name (e.g., "facebook", "microsoft")
 * @returns Promise resolving to an array of pull requests from the organization
 * @throws {Error} If the GitHub API request fails or authentication is invalid
 *
 * @remarks
 * Use this function if team-based search is not working or if you want to
 * see all PRs across the entire organization. You can then filter on the
 * client side if needed.
 *
 * Note: For large organizations, this may return many results (up to 100).
 * Consider pagination if you need more than 100 PRs.
 *
 * @example
 * ```typescript
 * const orgPrs = await searchOrgPullRequests('my-company')
 * const teamPrs = orgPrs.filter(pr => teamMembers.includes(pr.user.login))
 * ```
 */
export async function searchOrgPullRequests(
  org: string,
  days: number | null = 14
): Promise<PullRequest[]> {
  try {
    // Build query with optional date filter
    let query = `is:pr is:open org:${org}`

    if (days !== null) {
      const cutoffDate = getDaysAgo(days)
      const dateString = formatDateForGitHub(cutoffDate)
      query += ` created:>=${dateString}`
    }

    // Use pagination to fetch ALL results, not just first 100
    // GitHub search API returns max 1000 results total
    const items = await octokit.paginate(octokit.search.issuesAndPullRequests, {
      q: query,
      sort: 'created',
      order: 'desc',
      per_page: 100,
    })

    const pullRequests: PullRequest[] = items.map((item) => ({
      id: item.id,
      number: item.number,
      title: item.title,
      html_url: item.html_url,
      created_at: item.created_at,
      updated_at: item.updated_at,
      user: {
        login: item.user?.login || 'unknown',
        avatar_url: item.user?.avatar_url || '',
        html_url: item.user?.html_url || '',
      },
      repository: {
        name: item.repository_url.split('/').pop() || '',
        full_name: item.repository_url.split('/').slice(-2).join('/') || '',
        html_url: item.repository_url.replace('api.github.com/repos', 'github.com'),
      },
      draft: item.draft || false,
      state: item.state as 'open' | 'closed',
    }))

    return pullRequests
  } catch (error) {
    console.error('Error fetching pull requests:', error)
    throw error
  }
}

/**
 * Get list of repositories that a team has access to
 *
 * @param org - The GitHub organization name (e.g., "pinggolf")
 * @param teamSlug - The team slug (e.g., "is-ping-core")
 * @returns Promise resolving to an array of repository full names (e.g., ["pinggolf/repo1", "pinggolf/repo2"])
 * @throws {Error} If the GitHub API request fails or authentication is invalid
 *
 * @remarks
 * Requires `read:org` scope in your GitHub token.
 * Returns all repositories the team has any level of access to.
 *
 * @example
 * ```typescript
 * const repos = await getTeamRepositories('pinggolf', 'is-ping-core')
 * // Returns: ["pinggolf/is-ping-services", "pinggolf/is-ping-web", ...]
 * ```
 */
export async function getTeamRepositories(org: string, teamSlug: string): Promise<string[]> {
  try {
    // Use pagination to fetch ALL team repositories, not just first page
    const repos = await octokit.paginate(octokit.teams.listReposInOrg, {
      org,
      team_slug: teamSlug,
      per_page: 100,
    })

    return repos.map((repo) => repo.full_name)
  } catch (error) {
    console.error('Error fetching team repositories:', error)
    throw error
  }
}

/**
 * Search for open pull requests for a specific team in a GitHub organization
 *
 * Fetches PRs from repositories that the team has access to, with optional date filtering.
 * This is the recommended method for team-based PR dashboards.
 *
 * @param org - The GitHub organization name (e.g., "pinggolf")
 * @param teamName - The team slug (e.g., "is-ping-core")
 * @param days - Number of days to look back (1-30), or null for all time (default: 14)
 * @returns Promise resolving to an array of pull requests for the team
 * @throws {Error} If the GitHub API request fails or authentication is invalid
 *
 * @remarks
 * This function:
 * 1. Gets the list of repositories the team has access to
 * 2. Fetches all open PRs in the organization
 * 3. Filters PRs to only include those from team repositories
 *
 * This approach avoids GitHub's search query length limits which would be
 * exceeded when teams have access to many repositories (e.g., 100+).
 *
 * Date filtering:
 * - Pass a number (1-30) to filter PRs from the last N days
 * - Pass null to get all open PRs regardless of age
 *
 * Note: You need `read:org` scope in your GitHub token.
 *
 * @example
 * ```typescript
 * // Last 14 days for is-ping-core team
 * const teamPRs = await searchTeamPullRequests('pinggolf', 'is-ping-core', 14)
 *
 * // All time
 * const allPRs = await searchTeamPullRequests('pinggolf', 'is-ping-core', null)
 * ```
 */
export async function searchTeamPullRequests(
  org: string,
  teamName: string,
  days: number | null = 14
): Promise<PullRequest[]> {
  try {
    // Fetch team repositories and org PRs in parallel for better performance
    const [teamRepos, allOrgPRs] = await Promise.all([
      getTeamRepositories(org, teamName),
      searchOrgPullRequests(org, days),
    ])

    if (teamRepos.length === 0) {
      return []
    }

    // Create a Set for O(1) lookup performance
    const teamRepoSet = new Set(teamRepos)

    // Filter PRs to only include those from team repositories
    const teamPRs = allOrgPRs.filter((pr) => teamRepoSet.has(pr.repository.full_name))

    return teamPRs
  } catch (error) {
    console.error('Error fetching pull requests:', error)
    throw error
  }
}
