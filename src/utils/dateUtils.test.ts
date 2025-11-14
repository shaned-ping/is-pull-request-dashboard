import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getDaysAgo,
  getTwoWeeksAgo,
  formatDateForGitHub,
  getRelativeTime,
  isWithinTwoWeeks,
} from './dateUtils'

describe('dateUtils', () => {
  describe('getDaysAgo', () => {
    it('should return a date N days ago', () => {
      const now = new Date('2024-11-14T12:00:00Z')
      vi.setSystemTime(now)

      const sevenDaysAgo = getDaysAgo(7)
      expect(sevenDaysAgo.toISOString()).toBe('2024-11-07T12:00:00.000Z')

      const thirtyDaysAgo = getDaysAgo(30)
      expect(thirtyDaysAgo.toISOString()).toBe('2024-10-15T12:00:00.000Z')

      vi.useRealTimers()
    })

    it('should handle 0 days (today)', () => {
      const now = new Date('2024-11-14T12:00:00Z')
      vi.setSystemTime(now)

      const today = getDaysAgo(0)
      expect(today.toISOString()).toBe('2024-11-14T12:00:00.000Z')

      vi.useRealTimers()
    })

    it('should handle 1 day ago', () => {
      const now = new Date('2024-11-14T12:00:00Z')
      vi.setSystemTime(now)

      const yesterday = getDaysAgo(1)
      expect(yesterday.toISOString()).toBe('2024-11-13T12:00:00.000Z')

      vi.useRealTimers()
    })
  })

  describe('getTwoWeeksAgo', () => {
    it('should return a date 14 days ago', () => {
      const now = new Date('2024-11-14T12:00:00Z')
      vi.setSystemTime(now)

      const twoWeeksAgo = getTwoWeeksAgo()
      expect(twoWeeksAgo.toISOString()).toBe('2024-10-31T12:00:00.000Z')

      vi.useRealTimers()
    })

    it('should be equivalent to getDaysAgo(14)', () => {
      const now = new Date('2024-11-14T12:00:00Z')
      vi.setSystemTime(now)

      const method1 = getTwoWeeksAgo()
      const method2 = getDaysAgo(14)
      expect(method1.toISOString()).toBe(method2.toISOString())

      vi.useRealTimers()
    })
  })

  describe('formatDateForGitHub', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date('2024-11-14T15:30:45.123Z')
      expect(formatDateForGitHub(date)).toBe('2024-11-14')
    })

    it('should handle dates at start of year', () => {
      const date = new Date('2024-01-01T00:00:00.000Z')
      expect(formatDateForGitHub(date)).toBe('2024-01-01')
    })

    it('should handle dates at end of year', () => {
      const date = new Date('2024-12-31T23:59:59.999Z')
      expect(formatDateForGitHub(date)).toBe('2024-12-31')
    })

    it('should pad single digit months and days', () => {
      const date = new Date('2024-03-05T12:00:00.000Z')
      expect(formatDateForGitHub(date)).toBe('2024-03-05')
    })
  })

  describe('getRelativeTime', () => {
    beforeEach(() => {
      const now = new Date('2024-11-14T12:00:00Z')
      vi.setSystemTime(now)
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return relative time for recent dates', () => {
      const twoHoursAgo = '2024-11-14T10:00:00Z'
      const result = getRelativeTime(twoHoursAgo)
      // date-fns may add "about" for approximate times
      expect(result).toMatch(/2 hours ago/)
    })

    it('should return relative time for days ago', () => {
      const threeDaysAgo = '2024-11-11T12:00:00Z'
      const result = getRelativeTime(threeDaysAgo)
      expect(result).toBe('3 days ago')
    })

    it('should return relative time for weeks ago', () => {
      const twoWeeksAgo = '2024-10-31T12:00:00Z'
      const result = getRelativeTime(twoWeeksAgo)
      expect(result).toBe('14 days ago')
    })

    it('should return relative time for minutes ago', () => {
      const thirtyMinutesAgo = '2024-11-14T11:30:00Z'
      const result = getRelativeTime(thirtyMinutesAgo)
      expect(result).toBe('30 minutes ago')
    })
  })

  describe('isWithinTwoWeeks', () => {
    beforeEach(() => {
      const now = new Date('2024-11-14T12:00:00Z')
      vi.setSystemTime(now)
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return true for dates within the last 2 weeks', () => {
      const tenDaysAgo = '2024-11-04T12:00:00Z'
      expect(isWithinTwoWeeks(tenDaysAgo)).toBe(true)
    })

    it('should return true for dates exactly 14 days ago', () => {
      const fourteenDaysAgo = '2024-10-31T12:00:00Z'
      expect(isWithinTwoWeeks(fourteenDaysAgo)).toBe(true)
    })

    it('should return false for dates older than 2 weeks', () => {
      const twentyDaysAgo = '2024-10-25T12:00:00Z'
      expect(isWithinTwoWeeks(twentyDaysAgo)).toBe(false)
    })

    it('should return true for today', () => {
      const today = '2024-11-14T12:00:00Z'
      expect(isWithinTwoWeeks(today)).toBe(true)
    })

    it('should return true for dates just within the boundary', () => {
      const almostFourteenDaysAgo = '2024-10-31T12:00:01Z'
      expect(isWithinTwoWeeks(almostFourteenDaysAgo)).toBe(true)
    })

    it('should return false for dates just outside the boundary', () => {
      const justOverFourteenDaysAgo = '2024-10-31T11:59:59Z'
      expect(isWithinTwoWeeks(justOverFourteenDaysAgo)).toBe(false)
    })
  })
})
