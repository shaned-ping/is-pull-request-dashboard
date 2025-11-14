import type { PullRequest } from '../types/github'
import { getRelativeTime } from '../utils/dateUtils'

interface PullRequestCardProps {
  pr: PullRequest
}

export default function PullRequestCard({ pr }: PullRequestCardProps) {
  return (
    <div className="pr-card">
      <div className="pr-header">
        <a
          href={pr.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="pr-title"
        >
          {pr.title}
        </a>
        <span className="pr-number">#{pr.number}</span>
      </div>

      <div className="pr-meta">
        <div className="pr-author">
          <img
            src={pr.user.avatar_url}
            alt={pr.user.login}
            width="20"
            height="20"
            style={{ borderRadius: '50%' }}
          />
          <a
            href={pr.user.html_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            {pr.user.login}
          </a>
        </div>

        <div className="pr-date">
          <span>⏱️</span>
          <span>{getRelativeTime(pr.created_at)}</span>
        </div>

        <div className="pr-repo">
          <span>📁</span>
          <a
            href={pr.repository.html_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            {pr.repository.name}
          </a>
        </div>

        {pr.draft && (
          <span style={{ color: '#888', fontStyle: 'italic' }}>Draft</span>
        )}
      </div>
    </div>
  )
}
