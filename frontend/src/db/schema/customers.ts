import { pgTable, uuid, text, timestamp, boolean, jsonb, integer, decimal, index } from 'drizzle-orm/pg-core';
import { users } from '../schema';

// Customer profiles for SMB businesses
export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Basic Information
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  
  // Business Customer Fields
  companyName: text('company_name'),
  jobTitle: text('job_title'),
  industry: text('industry'),
  
  // Address Information
  address: jsonb('address').$type<{
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }>(),
  
  // Customer Status and Segmentation
  status: text('status').$type<'active' | 'inactive' | 'prospect' | 'churned'>().notNull().default('prospect'),
  customerType: text('customer_type').$type<'individual' | 'business' | 'enterprise'>().notNull().default('individual'),
  priority: text('priority').$type<'low' | 'medium' | 'high' | 'vip'>().notNull().default('medium'),
  
  // Financial Information
  creditLimit: decimal('credit_limit', { precision: 12, scale: 2 }),
  currentBalance: decimal('current_balance', { precision: 12, scale: 2 }).notNull().default('0.00'),
  lifetimeValue: decimal('lifetime_value', { precision: 12, scale: 2 }).notNull().default('0.00'),
  
  // Marketing and Communication Preferences
  marketingOptIn: boolean('marketing_opt_in').notNull().default(false),
  communicationPreferences: jsonb('communication_preferences').$type<{
    email: boolean;
    sms: boolean;
    phone: boolean;
    push: boolean;
    preferredTime: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'as_needed';
  }>().notNull().default({
    email: true,
    sms: false,
    phone: true,
    push: false,
    preferredTime: 'business_hours',
    frequency: 'as_needed'
  }),
  
  // AI and Analytics
  aiInsights: jsonb('ai_insights').$type<{
    personalityType: string;
    communicationStyle: string;
    decisionMakingStyle: string;
    loyaltyScore: number;
    churnRisk: number;
    preferredServices: string[];
    seasonalPatterns: Record<string, number>;
  }>(),
  
  // Custom Fields for Business-Specific Data
  customFields: jsonb('custom_fields').$type<Record<string, string | number | boolean>>(),
  
  // Referral and Source Tracking
  referralSource: text('referral_source'),
  referredBy: text('referred_by'), // Will be a UUID string instead of direct reference
  acquisitionCost: decimal('acquisition_cost', { precision: 10, scale: 2 }),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  lastContactedAt: timestamp('last_contacted_at'),
  
  // Soft delete
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  businessIdIdx: index('customers_business_id_idx').on(table.businessId),
  emailIdx: index('customers_email_idx').on(table.email),
  phoneIdx: index('customers_phone_idx').on(table.phone),
  statusIdx: index('customers_status_idx').on(table.status),
  customerTypeIdx: index('customers_customer_type_idx').on(table.customerType),
  companyNameIdx: index('customers_company_name_idx').on(table.companyName),
}));

// Customer tags for flexible categorization
export const customerTags = pgTable('customer_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  color: text('color').notNull().default('#4ecdc4'),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  businessIdIdx: index('customer_tags_business_id_idx').on(table.businessId),
  nameIdx: index('customer_tags_name_idx').on(table.name),
}));

// Many-to-many relationship between customers and tags
export const customerTagAssignments = pgTable('customer_tag_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id').notNull().references(() => customerTags.id, { onDelete: 'cascade' }),
  assignedAt: timestamp('assigned_at').notNull().defaultNow(),
}, (table) => ({
  customerIdIdx: index('customer_tag_assignments_customer_id_idx').on(table.customerId),
  tagIdIdx: index('customer_tag_assignments_tag_id_idx').on(table.tagId),
}));

// Customer interaction history
export const customerInteractions = pgTable('customer_interactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  businessId: uuid('business_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Interaction Details
  type: text('type').$type<'call' | 'email' | 'sms' | 'meeting' | 'note' | 'service' | 'complaint' | 'feedback'>().notNull(),
  subject: text('subject'),
  description: text('description'),
  
  // Interaction Metadata
  direction: text('direction').$type<'inbound' | 'outbound'>().notNull(),
  channel: text('channel').$type<'phone' | 'email' | 'sms' | 'chat' | 'in_person' | 'video' | 'social'>(),
  duration: integer('duration'), // in minutes
  outcome: text('outcome').$type<'successful' | 'follow_up_needed' | 'not_interested' | 'complaint_resolved'>(),
  
  // AI Analysis
  sentiment: text('sentiment').$type<'positive' | 'neutral' | 'negative'>(),
  aiSummary: text('ai_summary'),
  keyPoints: jsonb('key_points').$type<string[]>(),
  
  // Follow-up Information
  followUpRequired: boolean('follow_up_required').notNull().default(false),
  followUpDate: timestamp('follow_up_date'),
  followUpNotes: text('follow_up_notes'),
  
  // Timestamps
  interactionDate: timestamp('interaction_date').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  customerIdIdx: index('customer_interactions_customer_id_idx').on(table.customerId),
  businessIdIdx: index('customer_interactions_business_id_idx').on(table.businessId),
  typeIdx: index('customer_interactions_type_idx').on(table.type),
  interactionDateIdx: index('customer_interactions_interaction_date_idx').on(table.interactionDate),
}));

// Customer addresses for businesses with multiple locations
export const customerAddresses = pgTable('customer_addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  
  // Address Information
  type: text('type').$type<'billing' | 'shipping' | 'service' | 'office' | 'home'>().notNull(),
  label: text('label'), // e.g., "Main Office", "Warehouse", "Home"
  
  // Address Details
  street: text('street').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  zipCode: text('zip_code').notNull(),
  country: text('country').notNull().default('US'),
  
  // Geographic Information
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  
  // Service Information
  serviceZone: text('service_zone'),
  accessInstructions: text('access_instructions'),
  
  // Status
  isPrimary: boolean('is_primary').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  customerIdIdx: index('customer_addresses_customer_id_idx').on(table.customerId),
  typeIdx: index('customer_addresses_type_idx').on(table.type),
  cityStateIdx: index('customer_addresses_city_state_idx').on(table.city, table.state),
  latLngIdx: index('customer_addresses_lat_lng_idx').on(table.latitude, table.longitude),
}));

// Customer relationships for B2B scenarios
export const customerRelationships = pgTable('customer_relationships', {
  id: uuid('id').primaryKey().defaultRandom(),
  parentCustomerId: uuid('parent_customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  childCustomerId: uuid('child_customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  
  // Relationship Details
  relationshipType: text('relationship_type').$type<'parent_company' | 'subsidiary' | 'partner' | 'vendor' | 'referral_source'>().notNull(),
  description: text('description'),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  parentCustomerIdIdx: index('customer_relationships_parent_customer_id_idx').on(table.parentCustomerId),
  childCustomerIdIdx: index('customer_relationships_child_customer_id_idx').on(table.childCustomerId),
}));

// Export types for TypeScript usage
export type Customer = typeof customers.$inferSelect;
export type CustomerInsert = typeof customers.$inferInsert;
export type CustomerTag = typeof customerTags.$inferSelect;
export type CustomerTagInsert = typeof customerTags.$inferInsert;
export type CustomerInteraction = typeof customerInteractions.$inferSelect;
export type CustomerInteractionInsert = typeof customerInteractions.$inferInsert;
export type CustomerAddress = typeof customerAddresses.$inferSelect;
export type CustomerAddressInsert = typeof customerAddresses.$inferInsert;
export type CustomerRelationship = typeof customerRelationships.$inferSelect;
export type CustomerRelationshipInsert = typeof customerRelationships.$inferInsert;