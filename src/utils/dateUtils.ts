import { formatDistanceToNow } from 'date-fns'

/**
 * Calculate the date from exactly 2 weeks (14 days) ago
 *
 * Used primarily for filtering pull requests to show only those created
 * within the last 2 weeks.
 *
 * @returns Date object representing 14 days before the current date/time
 *
 * @example
 * ```typescript
 * const cutoffDate = getTwoWeeksAgo()
 * console.log(cutoffDate) // 2024-10-30T12:00:00.000Z (if today is Nov 13)
 * ```
 */
export function getTwoWeeksAgo(): Date {
  const date = new Date()
  date.setDate(date.getDate() - 14)
  return date
}

/**
 * Format a Date object for use in GitHub API queries
 *
 * Converts a JavaScript Date object to ISO 8601 date format (YYYY-MM-DD)
 * which is required by GitHub's search API for date filtering.
 *
 * @param date - The date to format
 * @returns Date string in YYYY-MM-DD format
 *
 * @example
 * ```typescript
 * const date = new Date('2024-11-13T15:30:00Z')
 * formatDateForGitHub(date) // Returns: "2024-11-13"
 *
 * // Use in GitHub query
 * const query = `is:pr created:>=${formatDateForGitHub(getTwoWeeksAgo())}`
 * ```
 */
export function formatDateForGitHub(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Convert an ISO date string to a human-readable relative time format
 *
 * Uses date-fns to format dates like "3 days ago", "2 hours ago", etc.
 * This provides users with an intuitive understanding of when a PR was created.
 *
 * @param dateString - ISO 8601 date string (e.g., from GitHub API)
 * @returns Human-readable relative time string with "ago" suffix
 *
 * @example
 * ```typescript
 * getRelativeTime('2024-11-10T12:00:00Z') // Returns: "3 days ago"
 * getRelativeTime('2024-11-13T14:00:00Z') // Returns: "2 hours ago"
 * getRelativeTime('2024-11-13T15:58:00Z') // Returns: "2 minutes ago"
 * ```
 */
export function getRelativeTime(dateString: string): string {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true })
}

/**
 * Check whether a given date falls within the last 2 weeks
 *
 * Useful for client-side filtering of pull requests or validating
 * that data meets the 2-week criteria.
 *
 * @param dateString - ISO 8601 date string to check
 * @returns true if the date is within the last 14 days, false otherwise
 *
 * @example
 * ```typescript
 * isWithinTwoWeeks('2024-11-10T12:00:00Z') // true (if today is Nov 13)
 * isWithinTwoWeeks('2024-10-15T12:00:00Z') // false (too old)
 *
 * // Filter PRs
 * const recentPRs = pullRequests.filter(pr => isWithinTwoWeeks(pr.created_at))
 * ```
 */
export function isWithinTwoWeeks(dateString: string): boolean {
  const date = new Date(dateString)
  const twoWeeksAgo = getTwoWeeksAgo()
  return date >= twoWeeksAgo
}
