import { pgTable, text, uuid, timestamp, boolean, jsonb, index } from 'drizzle-orm/pg-core';

// Base user table for authentication
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkUserId: text('clerk_user_id').unique().notNull(),
  email: text('email').unique().notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  businessName: text('business_name'),
  businessType: text('business_type'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  clerkUserIdIdx: index('users_clerk_user_id_idx').on(table.clerkUserId),
  emailIdx: index('users_email_idx').on(table.email),
}));

// Business profiles for extended business information
export const businessProfiles = pgTable('business_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Business Information
  legalName: text('legal_name').notNull(),
  dbaName: text('dba_name'),
  industry: text('industry'),
  description: text('description'),
  
  // Contact Information
  phone: text('phone'),
  website: text('website'),
  
  // Address
  address: jsonb('address').$type<{
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }>(),
  
  // Business Settings
  timezone: text('timezone').notNull().default('UTC'),
  currency: text('currency').notNull().default('USD'),
  
  // Subscription and Plan
  subscriptionTier: text('subscription_tier').$type<'starter' | 'professional' | 'business' | 'enterprise'>().notNull().default('starter'),
  subscriptionStatus: text('subscription_status').$type<'active' | 'canceled' | 'past_due' | 'trialing'>().notNull().default('trialing'),
  
  // Business Metrics
  monthlyRevenue: jsonb('monthly_revenue').$type<number>(),
  teamSize: jsonb('team_size').$type<number>(),
  
  // Feature Flags
  features: jsonb('features').$type<{
    aiVoiceAgent: boolean;
    advancedAnalytics: boolean;
    multiLocation: boolean;
    customIntegrations: boolean;
  }>().notNull().default({
    aiVoiceAgent: false,
    advancedAnalytics: false,
    multiLocation: false,
    customIntegrations: false
  }),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('business_profiles_user_id_idx').on(table.userId),
  industryIdx: index('business_profiles_industry_idx').on(table.industry),
}));

// Integration settings for external services
export const integrations = pgTable('integrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Integration Information
  name: text('name').notNull(),
  type: text('type').$type<'accounting' | 'calendar' | 'payment' | 'email' | 'crm' | 'communication' | 'analytics'>().notNull(),
  provider: text('provider').notNull(), // 'quickbooks', 'google_calendar', 'stripe', etc.
  
  // Configuration
  config: jsonb('config').$type<{
    apiKey: string;
    refreshToken: string;
    webhookUrl: string;
    settings: Record<string, any>;
  }>(),
  
  // Status
  status: text('status').$type<'active' | 'inactive' | 'error' | 'pending'>().notNull().default('pending'),
  lastSync: timestamp('last_sync'),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  businessIdIdx: index('integrations_business_id_idx').on(table.businessId),
  typeIdx: index('integrations_type_idx').on(table.type),
  statusIdx: index('integrations_status_idx').on(table.status),
}));

// Export domain-specific schemas
export * from './schema/customers';
export * from './schema/communications';
export * from './schema/calendar';
export * from './schema/financial';
export * from './schema/ai-conversations';

// Export types for TypeScript usage
export type User = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
export type BusinessProfile = typeof businessProfiles.$inferSelect;
export type BusinessProfileInsert = typeof businessProfiles.$inferInsert;
export type Integration = typeof integrations.$inferSelect;
export type IntegrationInsert = typeof integrations.$inferInsert;