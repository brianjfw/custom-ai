import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { eq, and, or, like, desc, asc } from 'drizzle-orm';
import { 
  customers, 
  customerTags, 
  customerInteractions, 
  customerAddresses, 
  customerRelationships 
} from '@/db/schema/customers';

// Zod schemas for validation
const createCustomerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  customerType: z.enum(['individual', 'business']).default('individual'),
  status: z.enum(['active', 'inactive', 'prospect', 'lead']).default('prospect'),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'ZIP code is required'),
    country: z.string().default('US'),
    isPrimary: z.boolean().default(true),
    addressType: z.enum(['home', 'work', 'billing', 'shipping']).default('home'),
  }).optional(),
});

const updateCustomerSchema = createCustomerSchema.partial();

const customerSearchSchema = z.object({
  query: z.string().optional(),
  customerType: z.enum(['individual', 'business']).optional(),
  status: z.enum(['active', 'inactive', 'prospect', 'lead']).optional(),
  tags: z.array(z.string()).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  sortBy: z.enum(['firstName', 'lastName', 'companyName', 'email', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const customerInteractionSchema = z.object({
  customerId: z.string().uuid(),
  interactionType: z.enum(['call', 'email', 'meeting', 'note', 'task', 'follow_up']),
  subject: z.string().min(1, 'Subject is required'),
  description: z.string().optional(),
  outcome: z.enum(['positive', 'negative', 'neutral']).optional(),
  followUpDate: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  metadata: z.record(z.unknown()).optional(),
});

export const customersRouter = createTRPCRouter({
  // Create a new customer
  create: protectedProcedure
    .input(createCustomerSchema)
    .mutation(async ({ ctx, input }) => {
      const { address, tags, ...customerData } = input;
      
      try {
        // Create customer record
        const [newCustomer] = await ctx.db.insert(customers).values({
          ...customerData,
          tenantId: ctx.userId, // Using userId as tenantId for now
        }).returning();

        // Create address if provided
        if (address) {
          await ctx.db.insert(customerAddresses).values({
            customerId: newCustomer.id,
            tenantId: ctx.userId,
            ...address,
          });
        }

        // Create tags if provided
        if (tags && tags.length > 0) {
          const tagValues = tags.map(tag => ({
            customerId: newCustomer.id,
            tenantId: ctx.userId,
            name: tag,
          }));
          await ctx.db.insert(customerTags).values(tagValues);
        }

        return newCustomer;
      } catch (error) {
        console.error('Error creating customer:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create customer',
        });
      }
    }),

  // Get all customers with filtering and pagination
  list: protectedProcedure
    .input(customerSearchSchema)
    .query(async ({ ctx, input }) => {
      const { query, customerType, status, tags, limit, offset, sortBy, sortOrder } = input;
      
      try {
        // Build WHERE conditions
        const whereConditions = [
          eq(customers.tenantId, ctx.userId),
        ];

        if (query) {
          whereConditions.push(
            or(
              like(customers.firstName, `%${query}%`),
              like(customers.lastName, `%${query}%`),
              like(customers.email, `%${query}%`),
              like(customers.companyName, `%${query}%`),
            )
          );
        }

        if (customerType) {
          whereConditions.push(eq(customers.customerType, customerType));
        }

        if (status) {
          whereConditions.push(eq(customers.status, status));
        }

        // Build ORDER BY
        const orderBy = sortOrder === 'asc' ? asc(customers[sortBy]) : desc(customers[sortBy]);

        // Execute query
        const customersList = await ctx.db
          .select()
          .from(customers)
          .where(and(...whereConditions))
          .orderBy(orderBy)
          .limit(limit)
          .offset(offset);

        // Get total count for pagination
        const totalCount = await ctx.db
          .select({ count: customers.id })
          .from(customers)
          .where(and(...whereConditions));

        return {
          customers: customersList,
          totalCount: totalCount.length,
          hasMore: offset + limit < totalCount.length,
        };
      } catch (error) {
        console.error('Error fetching customers:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch customers',
        });
      }
    }),

  // Get a single customer by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      try {
        const customer = await ctx.db
          .select()
          .from(customers)
          .where(and(
            eq(customers.id, input.id),
            eq(customers.tenantId, ctx.userId)
          ))
          .limit(1);

        if (!customer.length) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Customer not found',
          });
        }

        // Get customer addresses
        const addresses = await ctx.db
          .select()
          .from(customerAddresses)
          .where(eq(customerAddresses.customerId, input.id));

        // Get customer tags
        const tags = await ctx.db
          .select()
          .from(customerTags)
          .where(eq(customerTags.customerId, input.id));

        return {
          ...customer[0],
          addresses,
          tags: tags.map(tag => tag.name),
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        console.error('Error fetching customer:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch customer',
        });
      }
    }),

  // Update a customer
  update: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      data: updateCustomerSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;
      
      try {
        // Check if customer exists and belongs to user
        const existingCustomer = await ctx.db
          .select()
          .from(customers)
          .where(and(
            eq(customers.id, id),
            eq(customers.tenantId, ctx.userId)
          ))
          .limit(1);

        if (!existingCustomer.length) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Customer not found',
          });
        }

        // Update customer
        const [updatedCustomer] = await ctx.db
          .update(customers)
          .set({
            ...data,
            updatedAt: new Date(),
          })
          .where(eq(customers.id, id))
          .returning();

        return updatedCustomer;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        console.error('Error updating customer:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update customer',
        });
      }
    }),

  // Delete a customer
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if customer exists and belongs to user
        const existingCustomer = await ctx.db
          .select()
          .from(customers)
          .where(and(
            eq(customers.id, input.id),
            eq(customers.tenantId, ctx.userId)
          ))
          .limit(1);

        if (!existingCustomer.length) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Customer not found',
          });
        }

        // Delete customer (cascade will handle related records)
        await ctx.db
          .delete(customers)
          .where(eq(customers.id, input.id));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        console.error('Error deleting customer:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete customer',
        });
      }
    }),

  // Add interaction to customer
  addInteraction: protectedProcedure
    .input(customerInteractionSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if customer exists and belongs to user
        const existingCustomer = await ctx.db
          .select()
          .from(customers)
          .where(and(
            eq(customers.id, input.customerId),
            eq(customers.tenantId, ctx.userId)
          ))
          .limit(1);

        if (!existingCustomer.length) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Customer not found',
          });
        }

        const [newInteraction] = await ctx.db
          .insert(customerInteractions)
          .values({
            ...input,
            tenantId: ctx.userId,
          })
          .returning();

        return newInteraction;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        console.error('Error adding customer interaction:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add customer interaction',
        });
      }
    }),

  // Get customer interactions
  getInteractions: protectedProcedure
    .input(z.object({
      customerId: z.string().uuid(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const interactions = await ctx.db
          .select()
          .from(customerInteractions)
          .where(and(
            eq(customerInteractions.customerId, input.customerId),
            eq(customerInteractions.tenantId, ctx.userId)
          ))
          .orderBy(desc(customerInteractions.createdAt))
          .limit(input.limit)
          .offset(input.offset);

        return interactions;
      } catch (error) {
        console.error('Error fetching customer interactions:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch customer interactions',
        });
      }
    }),

  // Get customer statistics
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const stats = await ctx.db
          .select({
            totalCustomers: customers.id,
            activeCustomers: customers.status,
            businessCustomers: customers.customerType,
          })
          .from(customers)
          .where(eq(customers.tenantId, ctx.userId));

        const totalCustomers = stats.length;
        const activeCustomers = stats.filter(s => s.activeCustomers === 'active').length;
        const businessCustomers = stats.filter(s => s.businessCustomers === 'business').length;
        const individualCustomers = stats.filter(s => s.businessCustomers === 'individual').length;

        return {
          totalCustomers,
          activeCustomers,
          businessCustomers,
          individualCustomers,
          conversionRate: totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0,
        };
      } catch (error) {
        console.error('Error fetching customer statistics:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch customer statistics',
        });
      }
    }),
});