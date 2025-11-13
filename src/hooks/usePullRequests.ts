import { useQuery } from '@tanstack/react-query'
import { searchPullRequests } from '../services/github'
import type { PullRequest } from '../types/github'

export function usePullRequests(teamName: string) {
  return useQuery<PullRequest[], Error>({
    queryKey: ['pullRequests', teamName],
    queryFn: () => searchPullRequests(teamName),
    // Refetch every 5 minutes
    refetchInterval: 1000 * 60 * 5,
    // Keep data fresh
    staleTime: 1000 * 60 * 2,
  })
}
