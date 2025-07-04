import { defineConfig } from 'drizzle-kit'
import { config } from 'dotenv'

// Load environment variables
config()

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
})