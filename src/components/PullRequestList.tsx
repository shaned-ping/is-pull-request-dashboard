import { usePullRequests } from '../hooks/usePullRequests'
import PullRequestCard from './PullRequestCard'

interface PullRequestListProps {
  username: string
  days: number | null
}

export default function PullRequestList({ username, days }: PullRequestListProps) {
  const { data: pullRequests, isLoading, error } = usePullRequests(username, days)

  if (isLoading) {
    return <div className="loading">Loading pull requests...</div>
  }

  if (error) {
    return (
      <div className="error">
        <h2>Error loading pull requests</h2>
        <p>{error.message}</p>
        <p>
          Make sure you have set the VITE_GITHUB_TOKEN environment variable
          and have the necessary permissions.
        </p>
      </div>
    )
  }

  if (!pullRequests || pullRequests.length === 0) {
    const timeframeText =
      days === null ? 'at any time' : days === 1 ? 'from the last day' : `from the last ${days} days`

    return (
      <div className="empty-state">
        <h2>No open pull requests</h2>
        <p>There are no open PRs in {username}'s repositories {timeframeText}.</p>
      </div>
    )
  }

  return (
    <div className="pr-list">
      {pullRequests.map((pr) => (
        <PullRequestCard key={pr.id} pr={pr} />
      ))}
    </div>
  )
}
