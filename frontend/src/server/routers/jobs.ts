import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { eq, and, or, like, desc, asc, gte, lte } from 'drizzle-orm';

// Simplified jobs router that works with basic operations
// Note: Will need to be updated once the jobs schema is finalized

// Zod schemas for validation
const createJobSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  description: z.string().optional(),
  customerId: z.string().uuid(),
  jobType: z.enum(['installation', 'repair', 'maintenance', 'consultation', 'emergency', 'project']).default('repair'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['quote', 'scheduled', 'in_progress', 'completed', 'cancelled', 'on_hold']).default('quote'),
  estimatedDuration: z.number().min(15).optional(), // Duration in minutes
  estimatedCost: z.number().min(0).optional(),
  actualCost: z.number().min(0).optional(),
  scheduledDate: z.string().optional(),
  completedDate: z.string().optional(),
  location: z.object({
    address: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    instructions: z.string().optional(),
  }).optional(),
  assignedTo: z.array(z.string()).optional(),
  materials: z.array(z.object({
    name: z.string(),
    quantity: z.number().min(0),
    unitCost: z.number().min(0),
    totalCost: z.number().min(0),
  })).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const updateJobSchema = createJobSchema.partial();

const jobSearchSchema = z.object({
  query: z.string().optional(),
  status: z.enum(['quote', 'scheduled', 'in_progress', 'completed', 'cancelled', 'on_hold']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  jobType: z.enum(['installation', 'repair', 'maintenance', 'consultation', 'emergency', 'project']).optional(),
  customerId: z.string().uuid().optional(),
  assignedTo: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  sortBy: z.enum(['title', 'status', 'priority', 'scheduledDate', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const jobDocumentSchema = z.object({
  jobId: z.string().uuid(),
  type: z.enum(['photo', 'video', 'document', 'invoice', 'receipt', 'contract']),
  title: z.string(),
  description: z.string().optional(),
  fileUrl: z.string().url(),
  fileSize: z.number().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const jobsRouter = createTRPCRouter({
  // Job management
  create: protectedProcedure
    .input(createJobSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Replace with actual database insertion once jobs schema is available
        const job = {
          id: crypto.randomUUID(),
          ...input,
          jobNumber: `JOB-${Date.now()}`,
          userId: ctx.userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        return job;
      } catch (error) {
        console.error('Error creating job:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create job',
        });
      }
    }),

  list: protectedProcedure
    .input(jobSearchSchema)
    .query(async ({ ctx, input }) => {
      try {
        // TODO: Replace with actual database query once jobs schema is available
        return {
          jobs: [],
          totalCount: 0,
          hasMore: false,
        };
      } catch (error) {
        console.error('Error fetching jobs:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch jobs',
        });
      }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      try {
        // TODO: Replace with actual database query once jobs schema is available
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Job not found',
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        console.error('Error fetching job:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch job',
        });
      }
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      data: updateJobSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Replace with actual database update once jobs schema is available
        const updatedJob = {
          id: input.id,
          ...input.data,
          updatedAt: new Date(),
        };

        return updatedJob;
      } catch (error) {
        console.error('Error updating job:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update job',
        });
      }
    }),

  updateStatus: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      status: z.enum(['quote', 'scheduled', 'in_progress', 'completed', 'cancelled', 'on_hold']),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Replace with actual database update once jobs schema is available
        const updatedJob = {
          id: input.id,
          status: input.status,
          notes: input.notes,
          updatedAt: new Date(),
        };

        return updatedJob;
      } catch (error) {
        console.error('Error updating job status:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update job status',
        });
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Replace with actual database deletion once jobs schema is available
        return { success: true };
      } catch (error) {
        console.error('Error deleting job:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete job',
        });
      }
    }),

  // Job scheduling
  schedule: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      scheduledDate: z.string(),
      estimatedDuration: z.number().min(15),
      assignedTo: z.array(z.string()).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Implement job scheduling with conflict checking
        const scheduledJob = {
          id: input.id,
          status: 'scheduled',
          scheduledDate: input.scheduledDate,
          estimatedDuration: input.estimatedDuration,
          assignedTo: input.assignedTo,
          notes: input.notes,
          updatedAt: new Date(),
        };

        return scheduledJob;
      } catch (error) {
        console.error('Error scheduling job:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to schedule job',
        });
      }
    }),

  // Job costing and materials
  updateCosting: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      estimatedCost: z.number().min(0).optional(),
      actualCost: z.number().min(0).optional(),
      materials: z.array(z.object({
        name: z.string(),
        quantity: z.number().min(0),
        unitCost: z.number().min(0),
        totalCost: z.number().min(0),
      })).optional(),
      laborHours: z.number().min(0).optional(),
      laborRate: z.number().min(0).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Implement job costing update
        const costingData = {
          ...input,
          updatedAt: new Date(),
        };

        return costingData;
      } catch (error) {
        console.error('Error updating job costing:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update job costing',
        });
      }
    }),

  // Job documentation
  documents: {
    add: protectedProcedure
      .input(jobDocumentSchema)
      .mutation(async ({ ctx, input }) => {
        try {
          // TODO: Replace with actual database insertion once jobs schema is available
          const document = {
            id: crypto.randomUUID(),
            ...input,
            userId: ctx.userId,
            createdAt: new Date(),
          };

          return document;
        } catch (error) {
          console.error('Error adding job document:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to add job document',
          });
        }
      }),

    list: protectedProcedure
      .input(z.object({
        jobId: z.string().uuid(),
        type: z.enum(['photo', 'video', 'document', 'invoice', 'receipt', 'contract']).optional(),
      }))
      .query(async ({ ctx, input }) => {
        try {
          // TODO: Replace with actual database query once jobs schema is available
          return [];
        } catch (error) {
          console.error('Error fetching job documents:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch job documents',
          });
        }
      }),

    delete: protectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        jobId: z.string().uuid(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          // TODO: Replace with actual database deletion once jobs schema is available
          return { success: true };
        } catch (error) {
          console.error('Error deleting job document:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to delete job document',
          });
        }
      }),
  },

  // Job analytics
  analytics: {
    getStats: protectedProcedure
      .input(z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        groupBy: z.enum(['day', 'week', 'month']).default('month'),
      }))
      .query(async ({ ctx, input }) => {
        try {
          // TODO: Implement job analytics once jobs schema is available
          return {
            totalJobs: 0,
            completedJobs: 0,
            scheduledJobs: 0,
            inProgressJobs: 0,
            cancelledJobs: 0,
            averageDuration: 0,
            averageValue: 0,
            totalRevenue: 0,
            completionRate: 0,
            jobsByType: [],
            jobsByPriority: [],
            revenueByMonth: [],
          };
        } catch (error) {
          console.error('Error fetching job analytics:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch job analytics',
          });
        }
      }),

    getProfitability: protectedProcedure
      .input(z.object({
        startDate: z.string(),
        endDate: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        try {
          // TODO: Implement job profitability analysis once jobs schema is available
          return {
            totalRevenue: 0,
            totalCosts: 0,
            grossProfit: 0,
            profitMargin: 0,
            costBreakdown: {
              materials: 0,
              labor: 0,
              overhead: 0,
            },
            profitabilityByJobType: [],
            profitabilityTrend: [],
          };
        } catch (error) {
          console.error('Error fetching job profitability:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch job profitability',
          });
        }
      }),
  },

  // Job templates and workflows
  templates: {
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1, 'Template name is required'),
        jobType: z.enum(['installation', 'repair', 'maintenance', 'consultation', 'emergency', 'project']),
        description: z.string().optional(),
        estimatedDuration: z.number().min(15),
        materials: z.array(z.object({
          name: z.string(),
          quantity: z.number().min(0),
          unitCost: z.number().min(0),
        })),
        tasks: z.array(z.object({
          title: z.string(),
          description: z.string().optional(),
          estimatedDuration: z.number().min(5),
          order: z.number().min(1),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          // TODO: Replace with actual database insertion once jobs schema is available
          const template = {
            id: crypto.randomUUID(),
            ...input,
            userId: ctx.userId,
            createdAt: new Date(),
          };

          return template;
        } catch (error) {
          console.error('Error creating job template:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create job template',
          });
        }
      }),

    list: protectedProcedure
      .input(z.object({
        jobType: z.enum(['installation', 'repair', 'maintenance', 'consultation', 'emergency', 'project']).optional(),
      }))
      .query(async ({ ctx, input }) => {
        try {
          // TODO: Replace with actual database query once jobs schema is available
          return [];
        } catch (error) {
          console.error('Error fetching job templates:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch job templates',
          });
        }
      }),

    createFromTemplate: protectedProcedure
      .input(z.object({
        templateId: z.string().uuid(),
        customerId: z.string().uuid(),
        scheduledDate: z.string().optional(),
        customizations: z.record(z.unknown()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          // TODO: Implement job creation from template
          const job = {
            id: crypto.randomUUID(),
            templateId: input.templateId,
            customerId: input.customerId,
            scheduledDate: input.scheduledDate,
            status: 'quote',
            userId: ctx.userId,
            createdAt: new Date(),
          };

          return job;
        } catch (error) {
          console.error('Error creating job from template:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create job from template',
          });
        }
      }),
  },
});