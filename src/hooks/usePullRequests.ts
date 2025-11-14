import { useQuery } from '@tanstack/react-query'
import { searchPullRequests } from '../services/github'
import type { PullRequest } from '../types/github'

/**
 * Custom React hook for fetching and managing pull request data with React Query
 *
 * Provides automatic caching, background refetching, and loading/error states
 * for pull requests associated with a specific team.
 *
 * @param teamName - The GitHub team name to fetch pull requests for
 * @returns React Query result object with the following properties:
 *   - data: Array of pull requests (undefined if loading or error)
 *   - isLoading: Boolean indicating initial load state
 *   - error: Error object if request failed (null otherwise)
 *   - refetch: Function to manually trigger a refetch
 *   - isRefetching: Boolean indicating background refetch state
 *
 * @remarks
 * Caching strategy:
 * - Data is cached by team name
 * - Considered stale after 2 minutes
 * - Automatically refetches every 5 minutes in the background
 * - Cache persists across component remounts
 *
 * Error handling:
 * - Network errors are caught and exposed via error property
 * - Previous data remains available during refetch errors
 * - Component can display error UI based on error state
 *
 * @example
 * ```typescript
 * function PullRequestList({ teamName }: Props) {
 *   const { data, isLoading, error, refetch } = usePullRequests(teamName)
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
export function usePullRequests(teamName: string) {
  return useQuery<PullRequest[], Error>({
    queryKey: ['pullRequests', teamName],
    queryFn: () => searchPullRequests(teamName),
    // Refetch every 5 minutes to keep data up-to-date
    refetchInterval: 1000 * 60 * 5,
    // Consider data stale after 2 minutes
    staleTime: 1000 * 60 * 2,
  })
}
