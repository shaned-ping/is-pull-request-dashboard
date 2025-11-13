import { formatDistanceToNow } from 'date-fns'

/**
 * Get date from 2 weeks ago
 */
export function getTwoWeeksAgo(): Date {
  const date = new Date()
  date.setDate(date.getDate() - 14)
  return date
}

/**
 * Format date for GitHub API query (YYYY-MM-DD)
 */
export function formatDateForGitHub(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Get relative time string (e.g., "3 days ago")
 */
export function getRelativeTime(dateString: string): string {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true })
}

/**
 * Check if date is within last 2 weeks
 */
export function isWithinTwoWeeks(dateString: string): boolean {
  const date = new Date(dateString)
  const twoWeeksAgo = getTwoWeeksAgo()
  return date >= twoWeeksAgo
}
