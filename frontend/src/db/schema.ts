import { pgTable, text, timestamp, uuid, jsonb, boolean, integer, varchar, decimal, index } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// Users table - core user information
export const users = pgTable('users', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  clerkId: varchar('clerk_id', { length: 256 }).unique().notNull(),
  email: varchar('email', { length: 256 }).unique().notNull(),
  name: varchar('name', { length: 256 }).notNull(),
  avatarUrl: text('avatar_url'),
  role: varchar('role', { length: 50 }).default('user'),
  businessName: varchar('business_name', { length: 256 }),
  businessType: varchar('business_type', { length: 100 }),
  businessSize: varchar('business_size', { length: 50 }),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  subscriptionTier: varchar('subscription_tier', { length: 50 }).default('free'),
  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at').default(sql`now()`),
}, (table) => ({
  clerkIdIdx: index('users_clerk_id_idx').on(table.clerkId),
  emailIdx: index('users_email_idx').on(table.email),
}))

// Conversations table - AI chat conversations
export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 256 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 50 }).default('general'), // general, support, sales, finance, etc.
  status: varchar('status', { length: 50 }).default('active'), // active, archived, deleted
  isPublic: boolean('is_public').default(false),
  metadata: jsonb('metadata'), // Store additional conversation metadata
  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at').default(sql`now()`),
})

// Messages table - individual messages in conversations
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  role: varchar('role', { length: 50 }).notNull(), // user, assistant, system
  attachments: jsonb('attachments'), // File attachments and metadata
  metadata: jsonb('metadata'), // Additional message metadata
  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at').default(sql`now()`),
})

// Files table - file storage and management
export const files = pgTable('files', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  conversationId: uuid('conversation_id').references(() => conversations.id, { onDelete: 'cascade' }),
  filename: varchar('filename', { length: 256 }).notNull(),
  originalName: varchar('original_name', { length: 256 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  size: integer('size').notNull(), // File size in bytes
  url: text('url').notNull(), // Storage URL
  status: varchar('status', { length: 50 }).default('uploaded'), // uploaded, processing, processed, error
  metadata: jsonb('metadata'), // File-specific metadata
  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at').default(sql`now()`),
})

// Business profiles table - extended business information
export const businessProfiles = pgTable('business_profiles', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  businessName: varchar('business_name', { length: 256 }).notNull(),
  businessType: varchar('business_type', { length: 100 }).notNull(),
  industry: varchar('industry', { length: 100 }),
  businessSize: varchar('business_size', { length: 50 }),
  description: text('description'),
  website: varchar('website', { length: 256 }),
  phone: varchar('phone', { length: 50 }),
  address: jsonb('address'), // Address object with street, city, state, zip, country
  businessHours: jsonb('business_hours'), // Operating hours structure
  logo: text('logo_url'),
  settings: jsonb('settings'), // Business-specific settings
  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at').default(sql`now()`),
}, (table) => ({
  userIdIdx: index('business_profiles_user_id_idx').on(table.userId),
  industryIdx: index('business_profiles_industry_idx').on(table.industry),
}))

// AI agents table - configuration for AI assistants
export const aiAgents = pgTable('ai_agents', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 256 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 50 }).notNull(), // front_desk, back_office, copilot
  prompt: text('prompt').notNull(),
  model: varchar('model', { length: 100 }).default('gpt-4'),
  temperature: decimal('temperature', { precision: 3, scale: 2 }).default('0.7'),
  maxTokens: integer('max_tokens').default(2048),
  isActive: boolean('is_active').default(true),
  configuration: jsonb('configuration'), // Agent-specific configuration
  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at').default(sql`now()`),
})

// Subscriptions table - user subscription management
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  planId: varchar('plan_id', { length: 100 }).notNull(),
  planName: varchar('plan_name', { length: 100 }).notNull(),
  status: varchar('status', { length: 50 }).notNull(), // active, cancelled, past_due, etc.
  currentPeriodStart: timestamp('current_period_start').notNull(),
  currentPeriodEnd: timestamp('current_period_end').notNull(),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 256 }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at').default(sql`now()`),
})

// Analytics table - business metrics and insights
export const analytics = pgTable('analytics', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  eventData: jsonb('event_data').notNull(),
  timestamp: timestamp('timestamp').default(sql`now()`),
  sessionId: varchar('session_id', { length: 256 }),
  metadata: jsonb('metadata'),
})

// Integrations table - third-party service connections
export const integrations = pgTable('integrations', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // calendar, email, crm, accounting, etc.
  provider: varchar('provider', { length: 100 }).notNull(), // google, microsoft, quickbooks, etc.
  isActive: boolean('is_active').default(true),
  credentials: jsonb('credentials'), // Encrypted credentials
  settings: jsonb('settings'), // Integration-specific settings
  lastSync: timestamp('last_sync'),
  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at').default(sql`now()`),
})

// Export types for TypeScript
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Conversation = typeof conversations.$inferSelect
export type NewConversation = typeof conversations.$inferInsert
export type Message = typeof messages.$inferSelect
export type NewMessage = typeof messages.$inferInsert
export type File = typeof files.$inferSelect
export type NewFile = typeof files.$inferInsert
export type BusinessProfile = typeof businessProfiles.$inferSelect
export type NewBusinessProfile = typeof businessProfiles.$inferInsert
export type AIAgent = typeof aiAgents.$inferSelect
export type NewAIAgent = typeof aiAgents.$inferInsert
export type Subscription = typeof subscriptions.$inferSelect
export type NewSubscription = typeof subscriptions.$inferInsert
export type Analytics = typeof analytics.$inferSelect
export type NewAnalytics = typeof analytics.$inferInsert
export type Integration = typeof integrations.$inferSelect
export type NewIntegration = typeof integrations.$inferInsert

// Export domain-specific schemas
export * from './schema/customers'
export * from './schema/communications'
export * from './schema/calendar'
export * from './schema/financial'
export * from './schema/ai-conversations'