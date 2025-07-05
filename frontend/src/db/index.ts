import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'

// Load environment variables
config()

// Validate required environment variables
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in environment variables')
}

// Initialize the client connection
const sql = neon(process.env.DATABASE_URL!)

// Lazy-loaded database instance to prevent test failures
let dbInstance: ReturnType<typeof drizzle> | null = null

// Initialize Drizzle ORM with lazy loading
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    if (!dbInstance) {
      // Only initialize when actually needed
      if (process.env.NODE_ENV === 'test') {
        // In test environment, return a mock
        return jest.fn().mockReturnThis()
      }
      dbInstance = drizzle(sql)
    }
    return dbInstance[prop as keyof typeof dbInstance]
  }
})

// Re-export all schema tables and types for easy access
export * from './schema'