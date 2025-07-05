import { pgTable, uuid, text, timestamp, boolean, jsonb, integer, decimal, index } from 'drizzle-orm/pg-core';
import { users } from '../schema';
import { customers } from './customers';
import { calendarEvents } from './calendar';

// Invoices and billing
export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  eventId: uuid('event_id').references(() => calendarEvents.id, { onDelete: 'set null' }),
  
  // Invoice Information
  invoiceNumber: text('invoice_number').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  
  // Financial Details
  subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull(),
  taxAmount: decimal('tax_amount', { precision: 12, scale: 2 }).notNull().default('0.00'),
  discountAmount: decimal('discount_amount', { precision: 12, scale: 2 }).notNull().default('0.00'),
  total: decimal('total', { precision: 12, scale: 2 }).notNull(),
  
  // Currency and Tax
  currency: text('currency').notNull().default('USD'),
  taxRate: decimal('tax_rate', { precision: 5, scale: 4 }).notNull().default('0.0000'),
  
  // Status and Workflow
  status: text('status').$type<'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled' | 'refunded'>().notNull().default('draft'),
  
  // Dates
  invoiceDate: timestamp('invoice_date').notNull().defaultNow(),
  dueDate: timestamp('due_date').notNull(),
  
  // Payment Information
  paymentTerms: text('payment_terms').notNull().default('net_30'),
  paymentInstructions: text('payment_instructions'),
  
  // Automation
  autoReminders: boolean('auto_reminders').notNull().default(true),
  
  // Notes
  notes: text('notes'),
  internalNotes: text('internal_notes'),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  sentAt: timestamp('sent_at'),
  paidAt: timestamp('paid_at'),
}, (table) => ({
  businessIdIdx: index('invoices_business_id_idx').on(table.businessId),
  customerIdIdx: index('invoices_customer_id_idx').on(table.customerId),
  statusIdx: index('invoices_status_idx').on(table.status),
  dueDateIdx: index('invoices_due_date_idx').on(table.dueDate),
  invoiceNumberIdx: index('invoices_invoice_number_idx').on(table.invoiceNumber),
}));

// Invoice line items
export const invoiceItems = pgTable('invoice_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  invoiceId: uuid('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  
  // Item Information
  name: text('name').notNull(),
  description: text('description'),
  
  // Quantity and Pricing
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull().default('1.00'),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal('total_price', { precision: 12, scale: 2 }).notNull(),
  
  // Tax and Discount
  taxable: boolean('taxable').notNull().default(true),
  taxRate: decimal('tax_rate', { precision: 5, scale: 4 }).notNull().default('0.0000'),
  discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).notNull().default('0.00'),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  invoiceIdIdx: index('invoice_items_invoice_id_idx').on(table.invoiceId),
}));

// Payments and transactions
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  invoiceId: uuid('invoice_id').references(() => invoices.id, { onDelete: 'set null' }),
  
  // Payment Information
  paymentNumber: text('payment_number').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('USD'),
  
  // Payment Method
  paymentMethod: text('payment_method').$type<'cash' | 'check' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'paypal' | 'stripe' | 'other'>().notNull(),
  
  // Payment Details
  paymentDetails: jsonb('payment_details').$type<{
    cardType: string;
    lastFour: string;
    transactionId: string;
    processorFee: number;
    checkNumber: string;
    bankAccount: string;
    externalReference: string;
  }>(),
  
  // Status
  status: text('status').$type<'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'disputed'>().notNull().default('pending'),
  
  // Dates
  paymentDate: timestamp('payment_date').notNull().defaultNow(),
  processedAt: timestamp('processed_at'),
  
  // Fees and Charges
  processingFee: decimal('processing_fee', { precision: 10, scale: 2 }).notNull().default('0.00'),
  netAmount: decimal('net_amount', { precision: 12, scale: 2 }).notNull(),
  
  // Notes
  notes: text('notes'),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  businessIdIdx: index('payments_business_id_idx').on(table.businessId),
  customerIdIdx: index('payments_customer_id_idx').on(table.customerId),
  invoiceIdIdx: index('payments_invoice_id_idx').on(table.invoiceId),
  statusIdx: index('payments_status_idx').on(table.status),
  paymentDateIdx: index('payments_payment_date_idx').on(table.paymentDate),
}));

// Expenses and business costs
export const expenses = pgTable('expenses', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Expense Information
  title: text('title').notNull(),
  description: text('description'),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('USD'),
  
  // Categorization
  category: text('category').$type<'materials' | 'labor' | 'equipment' | 'travel' | 'marketing' | 'office' | 'insurance' | 'taxes' | 'other'>().notNull(),
  subcategory: text('subcategory'),
  
  // Tax Information
  taxDeductible: boolean('tax_deductible').notNull().default(true),
  taxCategory: text('tax_category'),
  
  // Payment Information
  paymentMethod: text('payment_method').$type<'cash' | 'check' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'other'>().notNull(),
  vendor: text('vendor'),
  
  // Receipt Information
  receiptUrl: text('receipt_url'),
  receiptNumber: text('receipt_number'),
  
  // Project/Job Association
  eventId: uuid('event_id').references(() => calendarEvents.id, { onDelete: 'set null' }),
  
  // Approval Workflow
  status: text('status').$type<'pending' | 'approved' | 'rejected' | 'reimbursed'>().notNull().default('pending'),
  approvedBy: text('approved_by'),
  approvedAt: timestamp('approved_at'),
  
  // Dates
  expenseDate: timestamp('expense_date').notNull().defaultNow(),
  
  // Notes
  notes: text('notes'),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  businessIdIdx: index('expenses_business_id_idx').on(table.businessId),
  categoryIdx: index('expenses_category_idx').on(table.category),
  statusIdx: index('expenses_status_idx').on(table.status),
  expenseDateIdx: index('expenses_expense_date_idx').on(table.expenseDate),
}));

// Financial analytics and reporting
export const financialAnalytics = pgTable('financial_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Analytics Period
  period: text('period').$type<'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'>().notNull(),
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  
  // Revenue Metrics
  totalRevenue: decimal('total_revenue', { precision: 15, scale: 2 }).notNull().default('0.00'),
  paidRevenue: decimal('paid_revenue', { precision: 15, scale: 2 }).notNull().default('0.00'),
  outstandingRevenue: decimal('outstanding_revenue', { precision: 15, scale: 2 }).notNull().default('0.00'),
  
  // Expense Metrics
  totalExpenses: decimal('total_expenses', { precision: 15, scale: 2 }).notNull().default('0.00'),
  
  // Profit Metrics
  grossProfit: decimal('gross_profit', { precision: 15, scale: 2 }).notNull().default('0.00'),
  netProfit: decimal('net_profit', { precision: 15, scale: 2 }).notNull().default('0.00'),
  profitMargin: decimal('profit_margin', { precision: 5, scale: 4 }).notNull().default('0.0000'),
  
  // Invoice Metrics
  totalInvoices: integer('total_invoices').notNull().default(0),
  paidInvoices: integer('paid_invoices').notNull().default(0),
  overdueInvoices: integer('overdue_invoices').notNull().default(0),
  
  // Customer Metrics
  totalCustomers: integer('total_customers').notNull().default(0),
  newCustomers: integer('new_customers').notNull().default(0),
  averageOrderValue: decimal('average_order_value', { precision: 12, scale: 2 }).notNull().default('0.00'),
  
  // Detailed Breakdown
  revenueByCategory: jsonb('revenue_by_category').$type<Record<string, number>>(),
  expensesByCategory: jsonb('expenses_by_category').$type<Record<string, number>>(),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  businessIdIdx: index('financial_analytics_business_id_idx').on(table.businessId),
  periodIdx: index('financial_analytics_period_idx').on(table.period, table.periodStart),
}));

// Tax information and settings
export const taxSettings = pgTable('tax_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Tax Configuration
  defaultTaxRate: decimal('default_tax_rate', { precision: 5, scale: 4 }).notNull().default('0.0000'),
  taxName: text('tax_name').notNull().default('Tax'),
  taxNumber: text('tax_number'),
  
  // Tax Rates by Category
  taxRates: jsonb('tax_rates').$type<Record<string, {
    rate: number;
    name: string;
    description: string;
  }>>(),
  
  // Business Information
  businessInfo: jsonb('business_info').$type<{
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    logo: string;
  }>(),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  businessIdIdx: index('tax_settings_business_id_idx').on(table.businessId),
}));

// Export types for TypeScript usage
export type Invoice = typeof invoices.$inferSelect;
export type InvoiceInsert = typeof invoices.$inferInsert;
export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type InvoiceItemInsert = typeof invoiceItems.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type PaymentInsert = typeof payments.$inferInsert;
export type Expense = typeof expenses.$inferSelect;
export type ExpenseInsert = typeof expenses.$inferInsert;
export type FinancialAnalytics = typeof financialAnalytics.$inferSelect;
export type FinancialAnalyticsInsert = typeof financialAnalytics.$inferInsert;
export type TaxSettings = typeof taxSettings.$inferSelect;
export type TaxSettingsInsert = typeof taxSettings.$inferInsert;