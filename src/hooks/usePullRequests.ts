import { useQuery } from '@tanstack/react-query'
import { searchUserPullRequests, searchTeamPullRequests, searchOrgPullRequests } from '../services/github'
import type { PullRequest } from '../types/github'

/**
 * Custom React hook for fetching and managing pull request data with React Query
 *
 * Provides automatic caching, background refetching, and loading/error states
 * for pull requests in a specific user's repositories.
 *
 * @param username - The GitHub username to fetch pull requests for
 * @param days - Number of days to look back (1-30), or null for all time (default: 14)
 * @returns React Query result object with the following properties:
 *   - data: Array of pull requests (undefined if loading or error)
 *   - isLoading: Boolean indicating initial load state
 *   - error: Error object if request failed (null otherwise)
 *   - refetch: Function to manually trigger a refetch
 *   - isRefetching: Boolean indicating background refetch state
 *
 * @remarks
 * Caching strategy:
 * - Data is cached by username and days filter
 * - Considered stale after 2 minutes
 * - Automatically refetches every 5 minutes in the background
 * - Cache persists across component remounts
 * - Changing the days filter will fetch new data
 *
 * Error handling:
 * - Network errors are caught and exposed via error property
 * - Previous data remains available during refetch errors
 * - Component can display error UI based on error state
 *
 * @example
 * ```typescript
 * function PullRequestList({ username, days }: Props) {
 *   const { data, isLoading, error, refetch } = usePullRequests(username, days)
 *
 *   if (isLoading) return <div>Loading...</div>
 *   if (error) return <div>Error: {error.message}</div>
 *   if (!data) return null
 *
 *   return (
 *     <div>
 *       <button onClick={() => refetch()}>Refresh</button>
 *       {data.map(pr => <PullRequestCard key={pr.id} pr={pr} />)}
 *     </div>
 *   )
 * }
 * ```
 */
export function usePullRequests(username: string, days: number | null = 14) {
  return useQuery<PullRequest[], Error>({
    queryKey: ['pullRequests', username, days],
    queryFn: () => searchUserPullRequests(username, days),
    // Refetch every 5 minutes to keep data up-to-date
    refetchInterval: 1000 * 60 * 5,
    // Consider data stale after 2 minutes
    staleTime: 1000 * 60 * 2,
  })
}

/**
 * Custom React hook for fetching team pull requests with React Query
 *
 * Provides automatic caching, background refetching, and loading/error states
 * for pull requests associated with a specific GitHub team in an organization.
 *
 * @param org - The GitHub organization name (e.g., "pinggolf")
 * @param teamName - The team slug (e.g., "is-ping-core")
 * @param days - Number of days to look back (1-30), or null for all time (default: 14)
 * @returns React Query result object with the following properties:
 *   - data: Array of pull requests (undefined if loading or error)
 *   - isLoading: Boolean indicating initial load state
 *   - error: Error object if request failed (null otherwise)
 *   - refetch: Function to manually trigger a refetch
 *   - isRefetching: Boolean indicating background refetch state
 *
 * @remarks
 * Caching strategy:
 * - Data is cached by org, team, and days filter
 * - Considered stale after 2 minutes
 * - Automatically refetches every 5 minutes in the background
 * - Cache persists across component remounts
 * - Changing the days filter will fetch new data
 *
 * Authentication:
 * - Requires GitHub token with `read:org` scope
 * - Set VITE_GITHUB_TOKEN environment variable
 *
 * Error handling:
 * - Network errors are caught and exposed via error property
 * - Previous data remains available during refetch errors
 * - Component can display error UI based on error state
 *
 * @example
 * ```typescript
 * function TeamPullRequestList({ org, team, days }: Props) {
 *   const { data, isLoading, error } = useTeamPullRequests(org, team, days)
 *
 *   if (isLoading) return <div>Loading...</div>
 *   if (error) return <div>Error: {error.message}</div>
 *   if (!data) return null
 *
 *   return (
 *     <div>
 *       {data.map(pr => <PullRequestCard key={pr.id} pr={pr} />)}
 *     </div>
 *   )
 * }
 * ```
 */
export function useTeamPullRequests(org: string, teamName: string, days: number | null = 14) {
  return useQuery<PullRequest[], Error>({
    queryKey: ['teamPullRequests', org, teamName, days],
    queryFn: () => searchTeamPullRequests(org, teamName, days),
    // Refetch every 5 minutes to keep data up-to-date
    refetchInterval: 1000 * 60 * 5,
    // Consider data stale after 2 minutes
    staleTime: 1000 * 60 * 2,
  })
}

/**
 * Custom React hook for fetching organization pull requests with React Query
 *
 * Provides automatic caching, background refetching, and loading/error states
 * for all pull requests in a GitHub organization.
 *
 * @param org - The GitHub organization name (e.g., "pinggolf")
 * @param days - Number of days to look back (1-30), or null for all time (default: 14)
 * @returns React Query result object with the following properties:
 *   - data: Array of pull requests (undefined if loading or error)
 *   - isLoading: Boolean indicating initial load state
 *   - error: Error object if request failed (null otherwise)
 *   - refetch: Function to manually trigger a refetch
 *   - isRefetching: Boolean indicating background refetch state
 *
 * @remarks
 * This hook fetches ALL open PRs in the organization, regardless of team.
 * More reliable than team-based search.
 *
 * Caching strategy:
 * - Data is cached by org and days filter
 * - Considered stale after 2 minutes
 * - Automatically refetches every 5 minutes in the background
 * - Cache persists across component remounts
 * - Changing the days filter will fetch new data
 *
 * @example
 * ```typescript
 * function OrgPullRequestList({ org, days }: Props) {
 *   const { data, isLoading, error } = useOrgPullRequests(org, days)
 *
 *   if (isLoading) return <div>Loading...</div>
 *   if (error) return <div>Error: {error.message}</div>
 *   if (!data) return null
 *
 *   return (
 *     <div>
 *       {data.map(pr => <PullRequestCard key={pr.id} pr={pr} />)}
 *     </div>
 *   )
 * }
 * ```
 */
export function useOrgPullRequests(org: string, days: number | null = 14) {
  return useQuery<PullRequest[], Error>({
    queryKey: ['orgPullRequests', org, days],
    queryFn: () => searchOrgPullRequests(org, days),
    // Refetch every 5 minutes to keep data up-to-date
    refetchInterval: 1000 * 60 * 5,
    // Consider data stale after 2 minutes
    staleTime: 1000 * 60 * 2,
  })
}
