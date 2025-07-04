// Global setup for Jest tests
module.exports = async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test'
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_testing'
  process.env.CLERK_SECRET_KEY = 'sk_test_testing'
  
  // Mock date for consistent testing
  const mockDate = new Date('2024-01-15T10:00:00.000Z')
  global.Date = class extends Date {
    constructor(...args) {
      if (args.length === 0) {
        return mockDate
      }
      return new Date(...args)
    }
    
    static now() {
      return mockDate.getTime()
    }
  }
  
  // Console setup for better test output
  if (process.env.CI) {
    // In CI, suppress most console output
    global.console = {
      ...console,
      log: () => {},
      warn: () => {},
      error: console.error, // Keep errors visible
    }
  }
}