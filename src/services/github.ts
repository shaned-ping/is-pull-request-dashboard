import { Octokit } from '@octokit/rest'
import type { PullRequest } from '../types/github'
import { formatDateForGitHub, getTwoWeeksAgo } from '../utils/dateUtils'

// Initialize Octokit with optional auth token
const octokit = new Octokit({
  auth: import.meta.env.VITE_GITHUB_TOKEN,
})

/**
 * Search for pull requests by team
 * GitHub doesn't have a direct "team" search, so we'll need to search by organization
 * and filter by team members or use team mentions in PRs
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
 * Get pull requests for a specific organization
 * Alternative approach if team search doesn't work
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
