import { pgTable, uuid, text, timestamp, boolean, jsonb, integer, decimal, index } from 'drizzle-orm/pg-core';
import { users } from '../schema';
import { customers } from './customers';

// AI conversation sessions
export const aiConversations = pgTable('ai_conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'cascade' }),
  
  // Conversation Information
  title: text('title').notNull(),
  summary: text('summary'),
  
  // AI Configuration
  aiModel: text('ai_model').notNull().default('gpt-4'),
  systemPrompt: text('system_prompt'),
  
  // Context Information
  conversationType: text('conversation_type').$type<'customer_support' | 'sales' | 'scheduling' | 'general' | 'internal'>().notNull(),
  channel: text('channel').$type<'chat' | 'voice' | 'email' | 'sms' | 'phone' | 'video'>().notNull(),
  
  // Business Context
  businessContext: jsonb('business_context').$type<{
    customerHistory: Record<string, unknown>[];
    recentTransactions: Record<string, unknown>[];
    openInvoices: Record<string, unknown>[];
    scheduledAppointments: Record<string, unknown>[];
    preferences: Record<string, unknown>;
  }>(),
  
  // Conversation Status
  status: text('status').$type<'active' | 'paused' | 'completed' | 'escalated' | 'archived'>().notNull().default('active'),
  
  // Metadata
  metadata: jsonb('metadata').$type<{
    userAgent: string;
    ipAddress: string;
    location: string;
    deviceType: string;
    referrer: string;
  }>(),
  
  // Performance Metrics
  totalMessages: integer('total_messages').notNull().default(0),
  totalTokens: integer('total_tokens').notNull().default(0),
  avgResponseTime: decimal('avg_response_time', { precision: 8, scale: 2 }).notNull().default('0.00'),
  
  // Satisfaction and Quality
  customerSatisfaction: integer('customer_satisfaction'), // 1-5 rating
  conversationQuality: decimal('conversation_quality', { precision: 3, scale: 2 }),
  
  // Outcomes
  outcome: text('outcome').$type<'resolved' | 'escalated' | 'follow_up_required' | 'abandoned' | 'converted'>(),
  actionsTaken: jsonb('actions_taken').$type<string[]>(),
  
  // Timestamps
  startedAt: timestamp('started_at').notNull().defaultNow(),
  endedAt: timestamp('ended_at'),
  lastMessageAt: timestamp('last_message_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  businessIdIdx: index('ai_conversations_business_id_idx').on(table.businessId),
  customerIdIdx: index('ai_conversations_customer_id_idx').on(table.customerId),
  statusIdx: index('ai_conversations_status_idx').on(table.status),
  conversationTypeIdx: index('ai_conversations_conversation_type_idx').on(table.conversationType),
  startedAtIdx: index('ai_conversations_started_at_idx').on(table.startedAt),
}));

// Individual AI messages within conversations
export const aiMessages = pgTable('ai_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').notNull().references(() => aiConversations.id, { onDelete: 'cascade' }),
  
  // Message Information
  role: text('role').$type<'user' | 'assistant' | 'system' | 'function'>().notNull(),
  content: text('content').notNull(),
  
  // Message Processing
  originalContent: text('original_content'), // Before AI processing
  processedContent: text('processed_content'), // After AI enhancement
  
  // AI Processing Details
  aiModel: text('ai_model').notNull().default('gpt-4'),
  tokenCount: integer('token_count').notNull().default(0),
  processingTime: decimal('processing_time', { precision: 8, scale: 2 }).notNull().default('0.00'),
  
  // Context and Intent
  intent: text('intent'),
  entities: jsonb('entities').$type<Array<{
    type: string;
    value: string;
    confidence: number;
  }>>(),
  
  // Sentiment Analysis
  sentiment: text('sentiment').$type<'positive' | 'neutral' | 'negative'>(),
  sentimentScore: decimal('sentiment_score', { precision: 3, scale: 2 }),
  
  // Message Features
  messageType: text('message_type').$type<'text' | 'image' | 'voice' | 'video' | 'file' | 'function_call'>().notNull().default('text'),
  
  // Attachments and Media
  attachments: jsonb('attachments').$type<Array<{
    type: string;
    url: string;
    name: string;
    size: number;
    mimeType: string;
  }>>(),
  
  // Function Calls (for AI actions)
  functionCall: jsonb('function_call').$type<{
    name: string;
    arguments: Record<string, unknown>;
    result: Record<string, unknown>;
  }>(),
  
  // Quality Metrics
  relevanceScore: decimal('relevance_score', { precision: 3, scale: 2 }),
  helpfulnessScore: decimal('helpfulness_score', { precision: 3, scale: 2 }),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  conversationIdIdx: index('ai_messages_conversation_id_idx').on(table.conversationId),
  roleIdx: index('ai_messages_role_idx').on(table.role),
  createdAtIdx: index('ai_messages_created_at_idx').on(table.createdAt),
}));

// AI agents and assistants configuration
export const aiAgents = pgTable('ai_agents', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Agent Information
  name: text('name').notNull(),
  description: text('description'),
  
  // AI Configuration
  aiModel: text('ai_model').notNull().default('gpt-4'),
  systemPrompt: text('system_prompt').notNull(),
  
  // Agent Capabilities
  capabilities: jsonb('capabilities').$type<{
    canSchedule: boolean;
    canProcessPayments: boolean;
    canAccessCustomerData: boolean;
    canCreateInvoices: boolean;
    canModifyAppointments: boolean;
    allowedActions: string[];
  }>(),
  
  // Personality and Voice
  personality: jsonb('personality').$type<{
    tone: string;
    style: string;
    language: string;
    expertise: string[];
    responseLength: string;
  }>(),
  
  // Business Knowledge
  knowledgeBase: jsonb('knowledge_base').$type<{
    services: Record<string, unknown>[];
    policies: Record<string, unknown>[];
    procedures: Record<string, unknown>[];
    faq: Record<string, unknown>[];
    businessInfo: Record<string, unknown>;
  }>(),
  
  // Performance Settings
  maxTokens: integer('max_tokens').notNull().default(1000),
  temperature: decimal('temperature', { precision: 3, scale: 2 }).notNull().default('0.70'),
  responseTimeout: integer('response_timeout').notNull().default(30),
  
  // Usage Limits
  dailyUsageLimit: integer('daily_usage_limit').notNull().default(1000),
  monthlyUsageLimit: integer('monthly_usage_limit').notNull().default(10000),
  
  // Status
  isActive: boolean('is_active').notNull().default(true),
  isDefault: boolean('is_default').notNull().default(false),
  
  // Training Data
  trainingData: jsonb('training_data').$type<{
    conversationHistory: Record<string, unknown>[];
    businessData: Record<string, unknown>[];
    customInstructions: string[];
  }>(),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  lastTrainedAt: timestamp('last_trained_at'),
}, (table) => ({
  businessIdIdx: index('ai_agents_business_id_idx').on(table.businessId),
  isActiveIdx: index('ai_agents_is_active_idx').on(table.isActive),
}));

// AI analytics and insights
export const aiAnalytics = pgTable('ai_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Analytics Period
  period: text('period').$type<'daily' | 'weekly' | 'monthly' | 'yearly'>().notNull(),
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  
  // Usage Metrics
  totalConversations: integer('total_conversations').notNull().default(0),
  totalMessages: integer('total_messages').notNull().default(0),
  totalTokens: integer('total_tokens').notNull().default(0),
  avgConversationLength: decimal('avg_conversation_length', { precision: 8, scale: 2 }).notNull().default('0.00'),
  
  // Performance Metrics
  avgResponseTime: decimal('avg_response_time', { precision: 8, scale: 2 }).notNull().default('0.00'),
  successRate: decimal('success_rate', { precision: 5, scale: 4 }).notNull().default('0.0000'),
  customerSatisfaction: decimal('customer_satisfaction', { precision: 3, scale: 2 }).notNull().default('0.00'),
  
  // Business Impact
  conversionsGenerated: integer('conversions_generated').notNull().default(0),
  appointmentsScheduled: integer('appointments_scheduled').notNull().default(0),
  issuesResolved: integer('issues_resolved').notNull().default(0),
  escalationsRequired: integer('escalations_required').notNull().default(0),
  
  // Channel Performance
  channelPerformance: jsonb('channel_performance').$type<{
    chat: {
      conversations: number;
      avgSatisfaction: number;
      avgResponseTime: number;
    };
    voice: {
      conversations: number;
      avgSatisfaction: number;
      avgResponseTime: number;
    };
    email: {
      conversations: number;
      avgSatisfaction: number;
      avgResponseTime: number;
    };
  }>(),
  
  // Intent Analysis
  topIntents: jsonb('top_intents').$type<Array<{
    intent: string;
    count: number;
    successRate: number;
  }>>(),
  
  // Cost Analysis
  totalCost: decimal('total_cost', { precision: 10, scale: 2 }).notNull().default('0.00'),
  costPerConversation: decimal('cost_per_conversation', { precision: 8, scale: 2 }).notNull().default('0.00'),
  costPerMessage: decimal('cost_per_message', { precision: 8, scale: 4 }).notNull().default('0.0000'),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  businessIdIdx: index('ai_analytics_business_id_idx').on(table.businessId),
  periodIdx: index('ai_analytics_period_idx').on(table.period, table.periodStart),
}));

// Export types for TypeScript usage
export type AiConversation = typeof aiConversations.$inferSelect;
export type AiConversationInsert = typeof aiConversations.$inferInsert;
export type AiMessage = typeof aiMessages.$inferSelect;
export type AiMessageInsert = typeof aiMessages.$inferInsert;
export type AiAgent = typeof aiAgents.$inferSelect;
export type AiAgentInsert = typeof aiAgents.$inferInsert;
export type AiAnalytics = typeof aiAnalytics.$inferSelect;
export type AiAnalyticsInsert = typeof aiAnalytics.$inferInsert;