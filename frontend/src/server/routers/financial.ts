import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { eq, and, or, like, desc, asc, gte, lte, sum } from 'drizzle-orm';

// Simplified financial router that works with basic operations
// Note: Will need to be updated once the financial schema is finalized

// Zod schemas for validation
const createInvoiceSchema = z.object({
  customerId: z.string().uuid(),
  jobId: z.string().uuid().optional(),
  invoiceNumber: z.string(),
  issueDate: z.string(),
  dueDate: z.string(),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).default('draft'),
  subtotal: z.number().min(0),
  taxAmount: z.number().min(0).default(0),
  discountAmount: z.number().min(0).default(0),
  total: z.number().min(0),
  currency: z.string().default('USD'),
  notes: z.string().optional(),
  termsAndConditions: z.string().optional(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number().min(0),
    unitPrice: z.number().min(0),
    total: z.number().min(0),
  })),
});

const createPaymentSchema = z.object({
  invoiceId: z.string().uuid(),
  customerId: z.string().uuid(),
  amount: z.number().min(0),
  currency: z.string().default('USD'),
  paymentMethod: z.enum(['cash', 'check', 'credit_card', 'bank_transfer', 'paypal', 'stripe']),
  paymentDate: z.string(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

const createExpenseSchema = z.object({
  category: z.enum(['materials', 'labor', 'equipment', 'travel', 'utilities', 'insurance', 'marketing', 'other']),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(0),
  currency: z.string().default('USD'),
  expenseDate: z.string(),
  vendor: z.string().optional(),
  jobId: z.string().uuid().optional(),
  isRecurring: z.boolean().default(false),
  receipts: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

const financialReportSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  reportType: z.enum(['revenue', 'expenses', 'profit_loss', 'cash_flow']),
  groupBy: z.enum(['day', 'week', 'month', 'quarter', 'year']).default('month'),
});

export const financialRouter = createTRPCRouter({
  // Invoice management
  invoices: {
    create: protectedProcedure
      .input(createInvoiceSchema)
      .mutation(async ({ ctx, input }) => {
        try {
          // TODO: Replace with actual database insertion once financial schema is available
          const invoice = {
            id: crypto.randomUUID(),
            ...input,
            userId: ctx.userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          return invoice;
        } catch (error) {
          console.error('Error creating invoice:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create invoice',
          });
        }
      }),

    list: protectedProcedure
      .input(z.object({
        status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).optional(),
        customerId: z.string().uuid().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        try {
          // TODO: Replace with actual database query once financial schema is available
          return {
            invoices: [],
            totalCount: 0,
            totalAmount: 0,
            hasMore: false,
          };
        } catch (error) {
          console.error('Error fetching invoices:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch invoices',
          });
        }
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        try {
          // TODO: Replace with actual database query once financial schema is available
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Invoice not found',
          });
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          
          console.error('Error fetching invoice:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch invoice',
          });
        }
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        data: createInvoiceSchema.partial(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          // TODO: Replace with actual database update once financial schema is available
          const updatedInvoice = {
            id: input.id,
            ...input.data,
            updatedAt: new Date(),
          };

          return updatedInvoice;
        } catch (error) {
          console.error('Error updating invoice:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update invoice',
          });
        }
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          // TODO: Replace with actual database update once financial schema is available
          return { success: true, status: input.status };
        } catch (error) {
          console.error('Error updating invoice status:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update invoice status',
          });
        }
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        try {
          // TODO: Replace with actual database deletion once financial schema is available
          return { success: true };
        } catch (error) {
          console.error('Error deleting invoice:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to delete invoice',
          });
        }
      }),
  },

  // Payment management
  payments: {
    create: protectedProcedure
      .input(createPaymentSchema)
      .mutation(async ({ ctx, input }) => {
        try {
          // TODO: Replace with actual database insertion and payment processing
          const payment = {
            id: crypto.randomUUID(),
            ...input,
            userId: ctx.userId,
            status: 'completed',
            createdAt: new Date(),
          };

          return payment;
        } catch (error) {
          console.error('Error creating payment:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create payment',
          });
        }
      }),

    list: protectedProcedure
      .input(z.object({
        invoiceId: z.string().uuid().optional(),
        customerId: z.string().uuid().optional(),
        paymentMethod: z.enum(['cash', 'check', 'credit_card', 'bank_transfer', 'paypal', 'stripe']).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        try {
          // TODO: Replace with actual database query once financial schema is available
          return {
            payments: [],
            totalCount: 0,
            totalAmount: 0,
            hasMore: false,
          };
        } catch (error) {
          console.error('Error fetching payments:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch payments',
          });
        }
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        try {
          // TODO: Replace with actual database query once financial schema is available
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Payment not found',
          });
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          
          console.error('Error fetching payment:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch payment',
          });
        }
      }),
  },

  // Expense management
  expenses: {
    create: protectedProcedure
      .input(createExpenseSchema)
      .mutation(async ({ ctx, input }) => {
        try {
          // TODO: Replace with actual database insertion once financial schema is available
          const expense = {
            id: crypto.randomUUID(),
            ...input,
            userId: ctx.userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          return expense;
        } catch (error) {
          console.error('Error creating expense:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create expense',
          });
        }
      }),

    list: protectedProcedure
      .input(z.object({
        category: z.enum(['materials', 'labor', 'equipment', 'travel', 'utilities', 'insurance', 'marketing', 'other']).optional(),
        jobId: z.string().uuid().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        try {
          // TODO: Replace with actual database query once financial schema is available
          return {
            expenses: [],
            totalCount: 0,
            totalAmount: 0,
            hasMore: false,
          };
        } catch (error) {
          console.error('Error fetching expenses:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch expenses',
          });
        }
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        try {
          // TODO: Replace with actual database query once financial schema is available
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Expense not found',
          });
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          
          console.error('Error fetching expense:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch expense',
          });
        }
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        data: createExpenseSchema.partial(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          // TODO: Replace with actual database update once financial schema is available
          const updatedExpense = {
            id: input.id,
            ...input.data,
            updatedAt: new Date(),
          };

          return updatedExpense;
        } catch (error) {
          console.error('Error updating expense:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update expense',
          });
        }
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        try {
          // TODO: Replace with actual database deletion once financial schema is available
          return { success: true };
        } catch (error) {
          console.error('Error deleting expense:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to delete expense',
          });
        }
      }),
  },

  // Financial reporting and analytics
  reports: {
    generate: protectedProcedure
      .input(financialReportSchema)
      .query(async ({ ctx, input }) => {
        try {
          // TODO: Implement financial reporting once financial schema is available
          const sampleData = {
            reportType: input.reportType,
            period: {
              startDate: input.startDate,
              endDate: input.endDate,
            },
            data: [],
            summary: {
              totalRevenue: 0,
              totalExpenses: 0,
              netProfit: 0,
              profitMargin: 0,
            },
          };

          return sampleData;
        } catch (error) {
          console.error('Error generating financial report:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to generate financial report',
          });
        }
      }),

    getOverview: protectedProcedure
      .input(z.object({
        period: z.enum(['this_month', 'last_month', 'this_quarter', 'last_quarter', 'this_year', 'last_year']).default('this_month'),
      }))
      .query(async ({ ctx, input }) => {
        try {
          // TODO: Implement financial overview once financial schema is available
          return {
            revenue: {
              current: 0,
              previous: 0,
              growth: 0,
            },
            expenses: {
              current: 0,
              previous: 0,
              growth: 0,
            },
            profit: {
              current: 0,
              previous: 0,
              growth: 0,
            },
            cashFlow: {
              current: 0,
              projected: 0,
            },
            outstandingInvoices: {
              count: 0,
              amount: 0,
            },
            topCustomers: [],
            expenseBreakdown: [],
          };
        } catch (error) {
          console.error('Error fetching financial overview:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch financial overview',
          });
        }
      }),
  },

  // Tax management
  taxes: {
    calculateTax: protectedProcedure
      .input(z.object({
        amount: z.number().min(0),
        taxRate: z.number().min(0).max(1).optional(),
        jurisdiction: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        try {
          // Simple tax calculation - in production this would integrate with tax services
          const defaultTaxRate = 0.08; // 8% default tax rate
          const taxRate = input.taxRate || defaultTaxRate;
          const taxAmount = input.amount * taxRate;
          const total = input.amount + taxAmount;

          return {
            subtotal: input.amount,
            taxRate: taxRate,
            taxAmount: taxAmount,
            total: total,
            jurisdiction: input.jurisdiction || 'Default',
          };
        } catch (error) {
          console.error('Error calculating tax:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to calculate tax',
          });
        }
      }),

    getTaxReports: protectedProcedure
      .input(z.object({
        startDate: z.string(),
        endDate: z.string(),
        reportType: z.enum(['sales_tax', 'income_tax', 'expense_summary']).default('sales_tax'),
      }))
      .query(async ({ ctx, input }) => {
        try {
          // TODO: Implement tax reporting once financial schema is available
          return {
            reportType: input.reportType,
            period: {
              startDate: input.startDate,
              endDate: input.endDate,
            },
            taxableIncome: 0,
            taxCollected: 0,
            taxPaid: 0,
            deductions: 0,
            netTaxLiability: 0,
            details: [],
          };
        } catch (error) {
          console.error('Error fetching tax reports:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch tax reports',
          });
        }
      }),
  },
});