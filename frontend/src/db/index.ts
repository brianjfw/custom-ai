import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'

// Load environment variables
config()

// Validate required environment variables
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in environment variables')
}

// Create the connection
const sql = neon(process.env.DATABASE_URL)

// Initialize Drizzle ORM
export const db = drizzle(sql)

// Re-export all schema tables and types for easy access
export * from './schema'