import { pgTable, uuid, text, timestamp, boolean, jsonb, integer, decimal, index } from 'drizzle-orm/pg-core';
import { users } from '../schema';
import { customers } from './customers';

// Communication templates for consistent messaging
export const communicationTemplates = pgTable('communication_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Template Information
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').$type<'welcome' | 'appointment_reminder' | 'follow_up' | 'marketing' | 'invoice' | 'thank_you' | 'complaint_response'>().notNull(),
  
  // Template Content
  subject: text('subject'), // For email templates
  content: text('content').notNull(),
  
  // Template Settings
  channel: text('channel').$type<'email' | 'sms' | 'phone' | 'chat' | 'push'>().notNull(),
  language: text('language').notNull().default('en'),
  
  // AI Enhancement
  aiEnhanced: boolean('ai_enhanced').notNull().default(false),
  personalizable: boolean('personalizable').notNull().default(true),
  
  // Usage Tracking
  usageCount: integer('usage_count').notNull().default(0),
  
  // Status
  isActive: boolean('is_active').notNull().default(true),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  businessIdIdx: index('communication_templates_business_id_idx').on(table.businessId),
  categoryIdx: index('communication_templates_category_idx').on(table.category),
  channelIdx: index('communication_templates_channel_idx').on(table.channel),
}));

// Communication campaigns for marketing and bulk messaging
export const communicationCampaigns = pgTable('communication_campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Campaign Information
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').$type<'newsletter' | 'promotion' | 'announcement' | 'survey' | 'event' | 'seasonal'>().notNull(),
  
  // Campaign Settings
  channel: text('channel').$type<'email' | 'sms' | 'push' | 'multi_channel'>().notNull(),
  status: text('status').$type<'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled'>().notNull().default('draft'),
  
  // Scheduling
  scheduledAt: timestamp('scheduled_at'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  
  // Targeting
  targetAudience: jsonb('target_audience').$type<{
    customerSegments: string[];
    tags: string[];
    excludeTags: string[];
    minLifetimeValue: number;
    maxLifetimeValue: number;
    customerStatuses: string[];
  }>(),
  
  // Content
  subject: text('subject'),
  content: text('content').notNull(),
  
  // AI Settings
  aiOptimized: boolean('ai_optimized').notNull().default(false),
  personalizeContent: boolean('personalize_content').notNull().default(false),
  
  // Performance Metrics
  sentCount: integer('sent_count').notNull().default(0),
  deliveredCount: integer('delivered_count').notNull().default(0),
  openCount: integer('open_count').notNull().default(0),
  clickCount: integer('click_count').notNull().default(0),
  conversionCount: integer('conversion_count').notNull().default(0),
  
  // Budget and Cost
  budget: decimal('budget', { precision: 10, scale: 2 }),
  cost: decimal('cost', { precision: 10, scale: 2 }).notNull().default('0.00'),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  businessIdIdx: index('communication_campaigns_business_id_idx').on(table.businessId),
  statusIdx: index('communication_campaigns_status_idx').on(table.status),
  scheduledAtIdx: index('communication_campaigns_scheduled_at_idx').on(table.scheduledAt),
}));

// Individual communication messages
export const communicationMessages = pgTable('communication_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'cascade' }),
  campaignId: uuid('campaign_id').references(() => communicationCampaigns.id, { onDelete: 'set null' }),
  templateId: uuid('template_id').references(() => communicationTemplates.id, { onDelete: 'set null' }),
  
  // Message Details
  type: text('type').$type<'automated' | 'manual' | 'ai_generated' | 'template_based'>().notNull(),
  channel: text('channel').$type<'email' | 'sms' | 'phone' | 'chat' | 'push' | 'video' | 'social'>().notNull(),
  direction: text('direction').$type<'inbound' | 'outbound'>().notNull(),
  
  // Recipients (for group messages)
  recipients: jsonb('recipients').$type<{
    to: string[];
    cc: string[];
    bcc: string[];
  }>(),
  
  // Content
  subject: text('subject'),
  content: text('content').notNull(),
  
  // Delivery Information
  status: text('status').$type<'draft' | 'queued' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied' | 'failed' | 'bounced'>().notNull().default('draft'),
  
  // External References
  externalId: text('external_id'), // ID from email/SMS provider
  externalStatus: text('external_status'),
  
  // Delivery Tracking
  sentAt: timestamp('sent_at'),
  deliveredAt: timestamp('delivered_at'),
  openedAt: timestamp('opened_at'),
  clickedAt: timestamp('clicked_at'),
  
  // Error Handling
  errorMessage: text('error_message'),
  retryCount: integer('retry_count').notNull().default(0),
  
  // AI Analysis
  sentiment: text('sentiment').$type<'positive' | 'neutral' | 'negative'>(),
  aiSummary: text('ai_summary'),
  
  // Engagement
  engagementScore: decimal('engagement_score', { precision: 5, scale: 2 }),
  
  // Cost Tracking
  cost: decimal('cost', { precision: 8, scale: 4 }).notNull().default('0.0000'),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  businessIdIdx: index('communication_messages_business_id_idx').on(table.businessId),
  customerIdIdx: index('communication_messages_customer_id_idx').on(table.customerId),
  campaignIdIdx: index('communication_messages_campaign_id_idx').on(table.campaignId),
  statusIdx: index('communication_messages_status_idx').on(table.status),
  channelIdx: index('communication_messages_channel_idx').on(table.channel),
  sentAtIdx: index('communication_messages_sent_at_idx').on(table.sentAt),
}));

// Communication automations and workflows
export const communicationAutomations = pgTable('communication_automations', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Automation Information
  name: text('name').notNull(),
  description: text('description'),
  
  // Trigger Configuration
  triggerType: text('trigger_type').$type<'time_based' | 'event_based' | 'behavior_based' | 'manual'>().notNull(),
  triggerConditions: jsonb('trigger_conditions').$type<{
    eventType: string;
    timeDelay: number;
    conditions: Array<{
      field: string;
      operator: string;
      value: string | number | boolean;
    }>;
  }>().notNull(),
  
  // Communication Configuration
  templateId: uuid('template_id').references(() => communicationTemplates.id, { onDelete: 'set null' }),
  channel: text('channel').$type<'email' | 'sms' | 'phone' | 'chat' | 'push' | 'multi_channel'>().notNull(),
  
  // Frequency Control
  frequency: text('frequency').$type<'once' | 'daily' | 'weekly' | 'monthly' | 'per_event'>().notNull().default('once'),
  maxSendsPerCustomer: integer('max_sends_per_customer').notNull().default(1),
  
  // Status and Control
  isActive: boolean('is_active').notNull().default(true),
  
  // Performance Tracking
  triggerCount: integer('trigger_count').notNull().default(0),
  successCount: integer('success_count').notNull().default(0),
  failureCount: integer('failure_count').notNull().default(0),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  lastTriggeredAt: timestamp('last_triggered_at'),
}, (table) => ({
  businessIdIdx: index('communication_automations_business_id_idx').on(table.businessId),
  triggerTypeIdx: index('communication_automations_trigger_type_idx').on(table.triggerType),
  isActiveIdx: index('communication_automations_is_active_idx').on(table.isActive),
}));

// Communication preferences and settings
export const communicationSettings = pgTable('communication_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Email Settings
  emailSettings: jsonb('email_settings').$type<{
    provider: string;
    fromName: string;
    fromEmail: string;
    replyToEmail: string;
    smtpHost: string;
    smtpPort: number;
    smtpSecure: boolean;
    smtpUsername: string;
    smtpPassword: string;
    trackOpens: boolean;
    trackClicks: boolean;
  }>(),
  
  // SMS Settings
  smsSettings: jsonb('sms_settings').$type<{
    provider: string;
    fromNumber: string;
    webhookUrl: string;
    trackDelivery: boolean;
  }>(),
  
  // Voice Settings
  voiceSettings: jsonb('voice_settings').$type<{
    provider: string;
    fromNumber: string;
    voiceId: string;
    language: string;
    recordCalls: boolean;
  }>(),
  
  // Push Notification Settings
  pushSettings: jsonb('push_settings').$type<{
    provider: string;
    appKey: string;
    trackOpens: boolean;
    schedulingEnabled: boolean;
  }>(),
  
  // General Settings
  generalSettings: jsonb('general_settings').$type<{
    businessHours: {
      monday: { start: string; end: string; enabled: boolean };
      tuesday: { start: string; end: string; enabled: boolean };
      wednesday: { start: string; end: string; enabled: boolean };
      thursday: { start: string; end: string; enabled: boolean };
      friday: { start: string; end: string; enabled: boolean };
      saturday: { start: string; end: string; enabled: boolean };
      sunday: { start: string; end: string; enabled: boolean };
    };
    timezone: string;
    autoReply: boolean;
    autoReplyMessage: string;
    unsubscribeUrl: string;
    privacyPolicyUrl: string;
  }>(),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  businessIdIdx: index('communication_settings_business_id_idx').on(table.businessId),
}));

// Communication analytics and insights
export const communicationAnalytics = pgTable('communication_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Analytics Period
  period: text('period').$type<'daily' | 'weekly' | 'monthly' | 'yearly'>().notNull(),
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  
  // Channel Performance
  channelMetrics: jsonb('channel_metrics').$type<{
    email: {
      sent: number;
      delivered: number;
      opened: number;
      clicked: number;
      bounced: number;
      unsubscribed: number;
      cost: number;
    };
    sms: {
      sent: number;
      delivered: number;
      clicked: number;
      failed: number;
      cost: number;
    };
    phone: {
      attempted: number;
      connected: number;
      duration: number;
      cost: number;
    };
    push: {
      sent: number;
      delivered: number;
      opened: number;
      clicked: number;
    };
  }>(),
  
  // Campaign Performance
  campaignPerformance: jsonb('campaign_performance').$type<{
    totalCampaigns: number;
    activeCampaigns: number;
    avgOpenRate: number;
    avgClickRate: number;
    avgConversionRate: number;
    totalRevenue: number;
    roi: number;
  }>(),
  
  // Customer Engagement
  customerEngagement: jsonb('customer_engagement').$type<{
    totalCustomersReached: number;
    newCustomersReached: number;
    avgEngagementScore: number;
    topEngagementChannels: string[];
    segmentPerformance: Record<string, number>;
  }>(),
  
  // AI Insights
  aiInsights: jsonb('ai_insights').$type<{
    bestSendTimes: Record<string, string>;
    optimalChannels: string[];
    contentRecommendations: string[];
    audienceSegmentations: string[];
  }>(),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  businessIdIdx: index('communication_analytics_business_id_idx').on(table.businessId),
  periodIdx: index('communication_analytics_period_idx').on(table.period, table.periodStart),
}));

// Export types for TypeScript usage
export type CommunicationTemplate = typeof communicationTemplates.$inferSelect;
export type CommunicationTemplateInsert = typeof communicationTemplates.$inferInsert;
export type CommunicationCampaign = typeof communicationCampaigns.$inferSelect;
export type CommunicationCampaignInsert = typeof communicationCampaigns.$inferInsert;
export type CommunicationMessage = typeof communicationMessages.$inferSelect;
export type CommunicationMessageInsert = typeof communicationMessages.$inferInsert;
export type CommunicationAutomation = typeof communicationAutomations.$inferSelect;
export type CommunicationAutomationInsert = typeof communicationAutomations.$inferInsert;
export type CommunicationSettings = typeof communicationSettings.$inferSelect;
export type CommunicationSettingsInsert = typeof communicationSettings.$inferInsert;
export type CommunicationAnalytics = typeof communicationAnalytics.$inferSelect;
export type CommunicationAnalyticsInsert = typeof communicationAnalytics.$inferInsert;