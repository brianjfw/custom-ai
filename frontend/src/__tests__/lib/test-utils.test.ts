import { testMessage, formatMessage } from '@/lib/test-utils'

describe('Test Utils', () => {
  describe('testMessage', () => {
    it('should return the correct test message', () => {
      expect(testMessage).toBe('Import aliases are working correctly!')
    })

    it('should be a string', () => {
      expect(typeof testMessage).toBe('string')
    })

    it('should not be empty', () => {
      expect(testMessage.length).toBeGreaterThan(0)
    })
  })

  describe('formatMessage', () => {
    it('should format a message with emoji and styling', () => {
      const input = 'Hello World'
      const result = formatMessage(input)
      
      expect(result).toContain('✅')
      expect(result).toContain('Hello World')
      expect(result).toMatch(/✅.*Hello World/)
    })

    it('should handle empty strings', () => {
      const result = formatMessage('')
      expect(result).toContain('✅')
      expect(typeof result).toBe('string')
    })

    it('should handle special characters', () => {
      const input = 'Test with special chars: !@#$%^&*()'
      const result = formatMessage(input)
      expect(result).toContain(input)
      expect(result).toContain('✅')
    })

    it('should handle long messages', () => {
      const longMessage = 'A'.repeat(1000)
      const result = formatMessage(longMessage)
      expect(result).toContain(longMessage)
      expect(result).toContain('✅')
    })

    it('should format the test message correctly', () => {
      const result = formatMessage(testMessage)
      expect(result).toContain('✅')
      expect(result).toContain('Import aliases are working correctly!')
    })
  })
})