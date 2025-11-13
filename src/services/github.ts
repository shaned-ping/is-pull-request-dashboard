import { Octokit } from '@octokit/rest'
import type { PullRequest } from '../types/github'
import { formatDateForGitHub, getTwoWeeksAgo } from '../utils/dateUtils'

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
export async function searchOrgPullRequests(org: string): Promise<PullRequest[]> {
  try {
    const twoWeeksAgo = getTwoWeeksAgo()
    const dateString = formatDateForGitHub(twoWeeksAgo)

    const query = `is:pr is:open created:>=${dateString} org:${org}`

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
