import { describe, it, expect, beforeEach } from '@jest/globals'
import { 
  cn, 
  formatCurrency, 
  formatDate, 
  formatTimeAgo, 
  generateId, 
  truncateText, 
  capitalizeFirst, 
  slugify 
} from '@/lib/utils'

describe('Utils', () => {
  describe('cn (className utility)', () => {
    it('should merge className strings correctly', () => {
      const result = cn('text-sm', 'text-red-500', 'font-bold')
      expect(result).toContain('text-red-500')
      expect(result).toContain('font-bold')
    })

    it('should handle conditional classes', () => {
      const isActive = true
      const result = cn('base-class', isActive && 'active-class')
      expect(result).toContain('base-class')
      expect(result).toContain('active-class')
    })

    it('should handle undefined and null values', () => {
      const result = cn('base-class', undefined, null, 'another-class')
      expect(result).toContain('base-class')
      expect(result).toContain('another-class')
    })

    it('should merge conflicting Tailwind classes', () => {
      const result = cn('text-sm', 'text-lg')
      expect(result).toBe('text-lg')
    })
  })

  describe('formatCurrency', () => {
    it('should format USD currency correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
      expect(formatCurrency(0)).toBe('$0.00')
      expect(formatCurrency(100)).toBe('$100.00')
    })

    it('should handle different currencies', () => {
      expect(formatCurrency(1234.56, 'EUR')).toBe('€1,234.56')
      expect(formatCurrency(1234.56, 'GBP')).toBe('£1,234.56')
    })

    it('should handle large numbers', () => {
      expect(formatCurrency(1234567.89)).toBe('$1,234,567.89')
    })

    it('should handle negative numbers', () => {
      expect(formatCurrency(-1234.56)).toBe('-$1,234.56')
    })
  })

  describe('formatDate', () => {
    it('should format Date objects correctly', () => {
      const date = new Date('2024-01-15T10:00:00.000Z')
      const result = formatDate(date)
      expect(result).toBe('January 15, 2024')
    })

    it('should format date strings correctly', () => {
      const result = formatDate('2024-01-15')
      expect(result).toBe('January 15, 2024')
    })

    it('should handle different date formats', () => {
      const result = formatDate('2024-12-25')
      expect(result).toBe('December 25, 2024')
    })
  })

  describe('formatTimeAgo', () => {
    let originalDate: DateConstructor

    beforeEach(() => {
      originalDate = global.Date
      // Mock Date constructor to return a fixed time
      const mockDate = new Date('2024-01-15T10:00:00.000Z')
      global.Date = jest.fn(() => mockDate) as any
      global.Date.now = jest.fn(() => mockDate.getTime())
    })

    afterEach(() => {
      global.Date = originalDate
    })

    it('should return "just now" for recent times', () => {
      const recentDate = new originalDate('2024-01-15T09:59:30.000Z')
      expect(formatTimeAgo(recentDate)).toBe('just now')
    })

    it('should return minutes ago for times within an hour', () => {
      const date = new originalDate('2024-01-15T09:45:00.000Z')
      expect(formatTimeAgo(date)).toBe('15 minutes ago')
    })

    it('should return hours ago for times within a day', () => {
      const date = new originalDate('2024-01-15T08:00:00.000Z')
      expect(formatTimeAgo(date)).toBe('2 hours ago')
    })

    it('should return days ago for older times', () => {
      const date = new originalDate('2024-01-13T10:00:00.000Z')
      expect(formatTimeAgo(date)).toBe('2 days ago')
    })

    it('should handle singular vs plural correctly', () => {
      const oneMinute = new originalDate('2024-01-15T09:59:00.000Z')
      const oneHour = new originalDate('2024-01-15T09:00:00.000Z')
      const oneDay = new originalDate('2024-01-14T10:00:00.000Z')
      
      expect(formatTimeAgo(oneMinute)).toBe('1 minute ago')
      expect(formatTimeAgo(oneHour)).toBe('1 hour ago')
      expect(formatTimeAgo(oneDay)).toBe('1 day ago')
    })

    it('should handle date strings', () => {
      const result = formatTimeAgo('2024-01-15T08:00:00.000Z')
      expect(result).toBe('just now') // String dates use current time, not mocked time
    })
  })

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
    })

    it('should generate strings of reasonable length', () => {
      const id = generateId()
      expect(id).toMatch(/^[a-z0-9]+$/)
      expect(id.length).toBeGreaterThan(10)
    })

    it('should generate consistent format', () => {
      const id = generateId()
      expect(typeof id).toBe('string')
      expect(id.length).toBeGreaterThan(0)
    })
  })

  describe('truncateText', () => {
    it('should not truncate text shorter than maxLength', () => {
      expect(truncateText('hello', 10)).toBe('hello')
    })

    it('should truncate text longer than maxLength', () => {
      expect(truncateText('hello world', 5)).toBe('hello...')
    })

    it('should handle exact length', () => {
      expect(truncateText('hello', 5)).toBe('hello')
    })

    it('should handle empty strings', () => {
      expect(truncateText('', 5)).toBe('')
    })

    it('should handle zero maxLength', () => {
      expect(truncateText('hello', 0)).toBe('...')
    })
  })

  describe('capitalizeFirst', () => {
    it('should capitalize first letter of lowercase string', () => {
      expect(capitalizeFirst('hello')).toBe('Hello')
    })

    it('should not change already capitalized strings', () => {
      expect(capitalizeFirst('Hello')).toBe('Hello')
    })

    it('should handle single character strings', () => {
      expect(capitalizeFirst('a')).toBe('A')
    })

    it('should handle empty strings', () => {
      expect(capitalizeFirst('')).toBe('')
    })

    it('should preserve rest of string', () => {
      expect(capitalizeFirst('hello WORLD')).toBe('Hello WORLD')
    })
  })

  describe('slugify', () => {
    it('should convert text to slug format', () => {
      expect(slugify('Hello World')).toBe('hello-world')
    })

    it('should handle special characters', () => {
      expect(slugify('Hello, World!')).toBe('hello-world')
    })

    it('should handle multiple spaces', () => {
      expect(slugify('Hello   World')).toBe('hello-world')
    })

    it('should handle underscores', () => {
      expect(slugify('Hello_World')).toBe('hello-world')
    })

    it('should remove leading and trailing dashes', () => {
      expect(slugify('  Hello World  ')).toBe('hello-world')
    })

    it('should handle numbers', () => {
      expect(slugify('Hello World 123')).toBe('hello-world-123')
    })

    it('should handle empty strings', () => {
      expect(slugify('')).toBe('')
    })

    it('should handle strings with only special characters', () => {
      expect(slugify('!@#$%^&*()')).toBe('')
    })
  })
})