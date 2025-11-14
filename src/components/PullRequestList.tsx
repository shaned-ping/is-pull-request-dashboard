import { usePullRequests } from '../hooks/usePullRequests'
import PullRequestCard from './PullRequestCard'

interface PullRequestListProps {
  username: string
}

export default function PullRequestList({ username }: PullRequestListProps) {
  const { data: pullRequests, isLoading, error } = usePullRequests(username)

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
    return (
      <div className="empty-state">
        <h2>No open pull requests</h2>
        <p>There are no open PRs in {username}'s repositories from the last 2 weeks.</p>
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
