/**
 * Represents a GitHub pull request with essential information
 *
 * This is a simplified version of GitHub's PR object, containing only
 * the fields needed for display in the dashboard.
 */
export interface PullRequest {
  /** Unique identifier for the pull request (GitHub's internal ID) */
  id: number

  /** Pull request number (visible in URLs and UI, e.g., #123) */
  number: number

  /** Title/headline of the pull request */
  title: string

  /** Full URL to the pull request on GitHub */
  html_url: string

  /** ISO 8601 timestamp when the PR was created */
  created_at: string

  /** ISO 8601 timestamp when the PR was last updated */
  updated_at: string

  /** Information about the pull request author */
  user: {
    /** GitHub username of the author */
    login: string

    /** URL to the user's GitHub avatar image */
    avatar_url: string

    /** Full URL to the user's GitHub profile */
    html_url: string
  }

  /** Information about the repository containing the pull request */
  repository: {
    /** Short name of the repository (e.g., "react") */
    name: string

    /** Full repository name including org (e.g., "facebook/react") */
    full_name: string

    /** Full URL to the repository on GitHub */
    html_url: string
  }

  /** Whether the pull request is marked as a draft */
  draft: boolean

  /** Current state of the pull request */
  state: 'open' | 'closed'
}

/**
 * Response structure from GitHub's search API
 *
 * Used when searching for issues and pull requests.
 * Note: In GitHub's API, pull requests are treated as issues.
 */
export interface GitHubSearchResponse {
  /** Total number of results matching the search query */
  total_count: number

  /**
   * Whether the results are incomplete due to timeout
   * If true, the results may not include all matching items
   */
  incomplete_results: boolean

  /** Array of pull requests/issues matching the search criteria */
  items: PullRequest[]
}
