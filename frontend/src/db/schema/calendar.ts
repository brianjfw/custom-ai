import { pgTable, uuid, text, timestamp, boolean, jsonb, integer, decimal, index } from 'drizzle-orm/pg-core';
import { users } from '../schema';
import { customers } from './customers';

// Calendar events and appointments
export const calendarEvents = pgTable('calendar_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'cascade' }),
  
  // Event Details
  title: text('title').notNull(),
  description: text('description'),
  eventType: text('event_type').$type<'appointment' | 'meeting' | 'call' | 'service' | 'consultation' | 'follow_up' | 'block_time' | 'personal'>().notNull(),
  
  // Scheduling Information
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  timezone: text('timezone').notNull().default('UTC'),
  allDay: boolean('all_day').notNull().default(false),
  
  // Recurrence
  recurring: boolean('recurring').notNull().default(false),
  recurrenceRule: text('recurrence_rule'), // RRULE format
  recurrenceEndDate: timestamp('recurrence_end_date'),
  
  // Status and Workflow
  status: text('status').$type<'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled'>().notNull().default('scheduled'),
  
  // Location Information
  location: jsonb('location').$type<{
    type: 'office' | 'customer_site' | 'virtual' | 'phone' | 'other';
    address: string;
    notes: string;
    coordinates: { lat: number; lng: number };
  }>(),
  
  // Service Information
  serviceDetails: jsonb('service_details').$type<{
    serviceType: string;
    duration: number;
    estimatedCost: number;
    requirements: string[];
    notes: string;
  }>(),
  
  // Team Assignment
  assignedTeamMembers: jsonb('assigned_team_members').$type<{
    primary: string;
    secondary: string[];
    roles: Record<string, string>;
  }>(),
  
  // Reminders and Notifications
  reminders: jsonb('reminders').$type<Array<{
    type: 'email' | 'sms' | 'push';
    minutesBefore: number;
    sent: boolean;
    sentAt: string;
  }>>(),
  
  // AI Insights
  aiInsights: jsonb('ai_insights').$type<{
    optimalStartTime: string;
    travelTime: number;
    preparation: string[];
    predictedDuration: number;
    riskFactors: string[];
  }>(),
  
  // External Integration
  externalId: text('external_id'), // For Google Calendar, Outlook, etc.
  externalSource: text('external_source'),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  businessIdIdx: index('calendar_events_business_id_idx').on(table.businessId),
  customerIdIdx: index('calendar_events_customer_id_idx').on(table.customerId),
  startTimeIdx: index('calendar_events_start_time_idx').on(table.startTime),
  statusIdx: index('calendar_events_status_idx').on(table.status),
  eventTypeIdx: index('calendar_events_event_type_idx').on(table.eventType),
}));

// Availability schedules for team members
export const availabilitySchedules = pgTable('availability_schedules', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Schedule Information
  name: text('name').notNull(),
  description: text('description'),
  
  // Weekly Schedule
  weeklySchedule: jsonb('weekly_schedule').$type<{
    monday: { enabled: boolean; start: string; end: string; breaks: Array<{ start: string; end: string }> };
    tuesday: { enabled: boolean; start: string; end: string; breaks: Array<{ start: string; end: string }> };
    wednesday: { enabled: boolean; start: string; end: string; breaks: Array<{ start: string; end: string }> };
    thursday: { enabled: boolean; start: string; end: string; breaks: Array<{ start: string; end: string }> };
    friday: { enabled: boolean; start: string; end: string; breaks: Array<{ start: string; end: string }> };
    saturday: { enabled: boolean; start: string; end: string; breaks: Array<{ start: string; end: string }> };
    sunday: { enabled: boolean; start: string; end: string; breaks: Array<{ start: string; end: string }> };
  }>().notNull(),
  
  // Holiday and Exception Dates
  holidays: jsonb('holidays').$type<Array<{
    date: string;
    name: string;
    allDay: boolean;
    hours: { start: string; end: string };
  }>>(),
  
  // Booking Rules
  bookingRules: jsonb('booking_rules').$type<{
    minAdvanceBooking: number; // minutes
    maxAdvanceBooking: number; // days
    slotDuration: number; // minutes
    bufferTime: number; // minutes between appointments
    maxBookingsPerDay: number;
    allowWeekendBooking: boolean;
  }>(),
  
  // Status
  isActive: boolean('is_active').notNull().default(true),
  isDefault: boolean('is_default').notNull().default(false),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  businessIdIdx: index('availability_schedules_business_id_idx').on(table.businessId),
}));

// Service offerings for booking
export const services = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Service Information
  name: text('name').notNull(),
  description: text('description'),
  category: text('category'),
  
  // Pricing
  price: decimal('price', { precision: 10, scale: 2 }),
  pricingType: text('pricing_type').$type<'fixed' | 'hourly' | 'per_visit' | 'custom'>().notNull().default('fixed'),
  
  // Duration and Scheduling
  duration: integer('duration').notNull(), // in minutes
  bufferTime: integer('buffer_time').notNull().default(0), // minutes
  
  // Availability
  availableScheduleId: uuid('available_schedule_id').references(() => availabilitySchedules.id),
  
  // Service Requirements
  requirements: jsonb('requirements').$type<{
    equipment: string[];
    materials: string[];
    skills: string[];
    certifications: string[];
  }>(),
  
  // Booking Settings
  bookingSettings: jsonb('booking_settings').$type<{
    onlineBooking: boolean;
    requiresApproval: boolean;
    maxBookingsPerDay: number;
    leadTime: number;
    cancellationPolicy: string;
  }>(),
  
  // Status
  isActive: boolean('is_active').notNull().default(true),
  isPublic: boolean('is_public').notNull().default(true),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  businessIdIdx: index('services_business_id_idx').on(table.businessId),
  categoryIdx: index('services_category_idx').on(table.category),
}));

// Booking requests and inquiries
export const bookingRequests = pgTable('booking_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'cascade' }),
  serviceId: uuid('service_id').references(() => services.id, { onDelete: 'cascade' }),
  
  // Request Information
  requestType: text('request_type').$type<'new_booking' | 'reschedule' | 'cancellation' | 'inquiry'>().notNull(),
  preferredDate: timestamp('preferred_date'),
  preferredTime: text('preferred_time'),
  alternativeDates: jsonb('alternative_dates').$type<Array<{
    date: string;
    time: string;
    priority: number;
  }>>(),
  
  // Contact Information (for walk-ins or new customers)
  contactInfo: jsonb('contact_info').$type<{
    name: string;
    email: string;
    phone: string;
    preferredContact: string;
  }>(),
  
  // Service Details
  serviceNotes: text('service_notes'),
  specialRequests: text('special_requests'),
  
  // Status
  status: text('status').$type<'pending' | 'approved' | 'declined' | 'expired' | 'converted'>().notNull().default('pending'),
  
  // Response
  response: text('response'),
  respondedAt: timestamp('responded_at'),
  
  // Conversion
  convertedEventId: uuid('converted_event_id').references(() => calendarEvents.id),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  expiresAt: timestamp('expires_at'),
}, (table) => ({
  businessIdIdx: index('booking_requests_business_id_idx').on(table.businessId),
  customerIdIdx: index('booking_requests_customer_id_idx').on(table.customerId),
  statusIdx: index('booking_requests_status_idx').on(table.status),
  preferredDateIdx: index('booking_requests_preferred_date_idx').on(table.preferredDate),
}));

// Time blocking and resource management
export const timeBlocks = pgTable('time_blocks', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Block Information
  title: text('title').notNull(),
  description: text('description'),
  blockType: text('block_type').$type<'unavailable' | 'travel' | 'prep' | 'admin' | 'break' | 'maintenance'>().notNull(),
  
  // Time Information
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  
  // Recurrence
  recurring: boolean('recurring').notNull().default(false),
  recurrenceRule: text('recurrence_rule'),
  
  // Status
  isActive: boolean('is_active').notNull().default(true),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  businessIdIdx: index('time_blocks_business_id_idx').on(table.businessId),
  startTimeIdx: index('time_blocks_start_time_idx').on(table.startTime),
  blockTypeIdx: index('time_blocks_block_type_idx').on(table.blockType),
}));

// Export types for TypeScript usage
export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type CalendarEventInsert = typeof calendarEvents.$inferInsert;
export type AvailabilitySchedule = typeof availabilitySchedules.$inferSelect;
export type AvailabilityScheduleInsert = typeof availabilitySchedules.$inferInsert;
export type Service = typeof services.$inferSelect;
export type ServiceInsert = typeof services.$inferInsert;
export type BookingRequest = typeof bookingRequests.$inferSelect;
export type BookingRequestInsert = typeof bookingRequests.$inferInsert;
export type TimeBlock = typeof timeBlocks.$inferSelect;
export type TimeBlockInsert = typeof timeBlocks.$inferInsert;