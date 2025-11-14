import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import PullRequestCard from './PullRequestCard'
import type { PullRequest } from '../types/github'

const mockPR: PullRequest = {
  id: 123456,
  number: 42,
  title: 'Add new feature',
  html_url: 'https://github.com/testuser/testrepo/pull/42',
  created_at: '2024-11-10T12:00:00Z',
  updated_at: '2024-11-13T15:30:00Z',
  user: {
    login: 'testuser',
    avatar_url: 'https://avatars.githubusercontent.com/u/123?v=4',
    html_url: 'https://github.com/testuser',
  },
  repository: {
    name: 'testrepo',
    full_name: 'testuser/testrepo',
    html_url: 'https://github.com/testuser/testrepo',
  },
  draft: false,
  state: 'open',
}

describe('PullRequestCard', () => {
  beforeEach(() => {
    // Mock system time for consistent relative time display
    vi.setSystemTime(new Date('2024-11-14T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should render PR title', () => {
    render(<PullRequestCard pr={mockPR} />)
    expect(screen.getByText('Add new feature')).toBeInTheDocument()
  })

  it('should render PR number', () => {
    render(<PullRequestCard pr={mockPR} />)
    expect(screen.getByText('#42')).toBeInTheDocument()
  })

  it('should render PR title as a link with correct URL', () => {
    render(<PullRequestCard pr={mockPR} />)
    const titleLink = screen.getByRole('link', { name: /Add new feature/i })
    expect(titleLink).toHaveAttribute('href', 'https://github.com/testuser/testrepo/pull/42')
    expect(titleLink).toHaveAttribute('target', '_blank')
    expect(titleLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should render author username', () => {
    render(<PullRequestCard pr={mockPR} />)
    expect(screen.getByText('testuser')).toBeInTheDocument()
  })

  it('should render author avatar', () => {
    render(<PullRequestCard pr={mockPR} />)
    const avatar = screen.getByAltText('testuser')
    expect(avatar).toHaveAttribute('src', 'https://avatars.githubusercontent.com/u/123?v=4')
    expect(avatar).toHaveAttribute('width', '20')
    expect(avatar).toHaveAttribute('height', '20')
  })

  it('should render author as a link with correct URL', () => {
    render(<PullRequestCard pr={mockPR} />)
    const authorLinks = screen.getAllByRole('link', { name: /testuser/i })
    // Find the link that contains the avatar
    const authorLink = authorLinks[0]
    expect(authorLink).toHaveAttribute('href', 'https://github.com/testuser')
    expect(authorLink).toHaveAttribute('target', '_blank')
  })

  it('should render repository name', () => {
    render(<PullRequestCard pr={mockPR} />)
    expect(screen.getByText('testrepo')).toBeInTheDocument()
  })

  it('should render repository as a link with correct URL', () => {
    render(<PullRequestCard pr={mockPR} />)
    const repoLink = screen.getByRole('link', { name: /testrepo/i })
    expect(repoLink).toHaveAttribute('href', 'https://github.com/testuser/testrepo')
  })

  it('should render relative time', () => {
    render(<PullRequestCard pr={mockPR} />)
    // PR was created on Nov 10, current mock time is Nov 14
    expect(screen.getByText('4 days ago')).toBeInTheDocument()
  })

  it('should not render Draft indicator for non-draft PRs', () => {
    render(<PullRequestCard pr={mockPR} />)
    expect(screen.queryByText('Draft')).not.toBeInTheDocument()
  })

  it('should render Draft indicator for draft PRs', () => {
    const draftPR = { ...mockPR, draft: true }
    render(<PullRequestCard pr={draftPR} />)
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('should render all metadata sections', () => {
    render(<PullRequestCard pr={mockPR} />)

    // Check for emojis that indicate metadata sections
    const metaSection = screen.getByText('testuser').closest('.pr-meta')
    expect(metaSection).toBeInTheDocument()

    // Author, time, and repo should all be present
    expect(screen.getByText('testuser')).toBeInTheDocument()
    expect(screen.getByText(/days ago/)).toBeInTheDocument()
    expect(screen.getByText('testrepo')).toBeInTheDocument()
  })

  it('should handle PRs with very long titles', () => {
    const longTitlePR = {
      ...mockPR,
      title: 'This is a very long pull request title that should still render properly without breaking the layout',
    }
    render(<PullRequestCard pr={longTitlePR} />)
    expect(screen.getByText(/This is a very long pull request title/)).toBeInTheDocument()
  })

  it('should handle recent PRs (less than an hour old)', () => {
    const recentPR = {
      ...mockPR,
      created_at: '2024-11-14T11:30:00Z', // 30 minutes ago
    }
    render(<PullRequestCard pr={recentPR} />)
    expect(screen.getByText('30 minutes ago')).toBeInTheDocument()
  })

  it('should render card with proper structure', () => {
    const { container } = render(<PullRequestCard pr={mockPR} />)
    const card = container.querySelector('.pr-card')
    expect(card).toBeInTheDocument()

    const header = card?.querySelector('.pr-header')
    expect(header).toBeInTheDocument()

    const meta = card?.querySelector('.pr-meta')
    expect(meta).toBeInTheDocument()
  })
})
