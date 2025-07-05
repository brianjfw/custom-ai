import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { eq, and, or, like, desc, asc } from 'drizzle-orm';
import { 
  communicationTemplates,
  communicationCampaigns,
  communicationMessages,
  communicationAutomations,
  communicationSettings,
  communicationAnalytics
} from '@/db/schema/communications';

// Zod schemas for validation
const createTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  type: z.enum(['email', 'sms', 'push', 'in_app']),
  category: z.enum(['welcome', 'follow_up', 'promotional', 'transactional', 'reminder', 'survey']),
  subject: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  variables: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  metadata: z.record(z.unknown()).optional(),
});

const createCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  type: z.enum(['email', 'sms', 'push', 'mixed']),
  status: z.enum(['draft', 'scheduled', 'active', 'paused', 'completed']).default('draft'),
  templateId: z.string().uuid().optional(),
  subject: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  scheduledFor: z.string().optional(),
  targetAudience: z.array(z.string()).optional(),
  settings: z.record(z.unknown()).optional(),
});

const sendMessageSchema = z.object({
  recipientId: z.string().uuid(),
  type: z.enum(['email', 'sms', 'push', 'in_app']),
  templateId: z.string().uuid().optional(),
  subject: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  variables: z.record(z.string()).optional(),
  scheduledFor: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  metadata: z.record(z.unknown()).optional(),
});

const createAutomationSchema = z.object({
  name: z.string().min(1, 'Automation name is required'),
  trigger: z.enum(['customer_created', 'job_completed', 'payment_received', 'time_based', 'event_based']),
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.enum(['equals', 'not_equals', 'contains', 'greater_than', 'less_than']),
    value: z.string(),
  })).optional(),
  actions: z.array(z.object({
    type: z.enum(['send_email', 'send_sms', 'create_task', 'update_customer', 'wait']),
    templateId: z.string().uuid().optional(),
    delay: z.number().optional(),
    settings: z.record(z.unknown()).optional(),
  })),
  isActive: z.boolean().default(true),
  metadata: z.record(z.unknown()).optional(),
});

export const communicationsRouter = createTRPCRouter({
  // Template management
  templates: {
    create: protectedProcedure
      .input(createTemplateSchema)
      .mutation(async ({ ctx, input }) => {
        try {
          const [newTemplate] = await ctx.db
            .insert(communicationTemplates)
            .values({
              ...input,
              tenantId: ctx.userId,
            })
            .returning();

          return newTemplate;
        } catch (error) {
          console.error('Error creating template:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create template',
          });
        }
      }),

    list: protectedProcedure
      .input(z.object({
        type: z.enum(['email', 'sms', 'push', 'in_app']).optional(),
        category: z.enum(['welcome', 'follow_up', 'promotional', 'transactional', 'reminder', 'survey']).optional(),
        isActive: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        try {
          const whereConditions = [eq(communicationTemplates.tenantId, ctx.userId)];

          if (input.type) {
            whereConditions.push(eq(communicationTemplates.type, input.type));
          }

          if (input.category) {
            whereConditions.push(eq(communicationTemplates.category, input.category));
          }

          if (input.isActive !== undefined) {
            whereConditions.push(eq(communicationTemplates.isActive, input.isActive));
          }

          const templates = await ctx.db
            .select()
            .from(communicationTemplates)
            .where(and(...whereConditions))
            .orderBy(desc(communicationTemplates.createdAt))
            .limit(input.limit)
            .offset(input.offset);

          return templates;
        } catch (error) {
          console.error('Error fetching templates:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch templates',
          });
        }
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        try {
          const template = await ctx.db
            .select()
            .from(communicationTemplates)
            .where(and(
              eq(communicationTemplates.id, input.id),
              eq(communicationTemplates.tenantId, ctx.userId)
            ))
            .limit(1);

          if (!template.length) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Template not found',
            });
          }

          return template[0];
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          
          console.error('Error fetching template:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch template',
          });
        }
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        data: createTemplateSchema.partial(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const [updatedTemplate] = await ctx.db
            .update(communicationTemplates)
            .set({
              ...input.data,
              updatedAt: new Date(),
            })
            .where(and(
              eq(communicationTemplates.id, input.id),
              eq(communicationTemplates.tenantId, ctx.userId)
            ))
            .returning();

          if (!updatedTemplate) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Template not found',
            });
          }

          return updatedTemplate;
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          
          console.error('Error updating template:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update template',
          });
        }
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        try {
          const result = await ctx.db
            .delete(communicationTemplates)
            .where(and(
              eq(communicationTemplates.id, input.id),
              eq(communicationTemplates.tenantId, ctx.userId)
            ));

          return { success: true };
        } catch (error) {
          console.error('Error deleting template:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to delete template',
          });
        }
      }),
  },

  // Campaign management
  campaigns: {
    create: protectedProcedure
      .input(createCampaignSchema)
      .mutation(async ({ ctx, input }) => {
        try {
          const [newCampaign] = await ctx.db
            .insert(communicationCampaigns)
            .values({
              ...input,
              tenantId: ctx.userId,
            })
            .returning();

          return newCampaign;
        } catch (error) {
          console.error('Error creating campaign:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create campaign',
          });
        }
      }),

    list: protectedProcedure
      .input(z.object({
        type: z.enum(['email', 'sms', 'push', 'mixed']).optional(),
        status: z.enum(['draft', 'scheduled', 'active', 'paused', 'completed']).optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        try {
          const whereConditions = [eq(communicationCampaigns.tenantId, ctx.userId)];

          if (input.type) {
            whereConditions.push(eq(communicationCampaigns.type, input.type));
          }

          if (input.status) {
            whereConditions.push(eq(communicationCampaigns.status, input.status));
          }

          const campaigns = await ctx.db
            .select()
            .from(communicationCampaigns)
            .where(and(...whereConditions))
            .orderBy(desc(communicationCampaigns.createdAt))
            .limit(input.limit)
            .offset(input.offset);

          return campaigns;
        } catch (error) {
          console.error('Error fetching campaigns:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch campaigns',
          });
        }
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        try {
          const campaign = await ctx.db
            .select()
            .from(communicationCampaigns)
            .where(and(
              eq(communicationCampaigns.id, input.id),
              eq(communicationCampaigns.tenantId, ctx.userId)
            ))
            .limit(1);

          if (!campaign.length) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Campaign not found',
            });
          }

          return campaign[0];
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          
          console.error('Error fetching campaign:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch campaign',
          });
        }
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        status: z.enum(['draft', 'scheduled', 'active', 'paused', 'completed']),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const [updatedCampaign] = await ctx.db
            .update(communicationCampaigns)
            .set({
              status: input.status,
              updatedAt: new Date(),
            })
            .where(and(
              eq(communicationCampaigns.id, input.id),
              eq(communicationCampaigns.tenantId, ctx.userId)
            ))
            .returning();

          if (!updatedCampaign) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Campaign not found',
            });
          }

          return updatedCampaign;
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          
          console.error('Error updating campaign status:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update campaign status',
          });
        }
      }),
  },

  // Message management
  messages: {
    send: protectedProcedure
      .input(sendMessageSchema)
      .mutation(async ({ ctx, input }) => {
        try {
          const [newMessage] = await ctx.db
            .insert(communicationMessages)
            .values({
              ...input,
              tenantId: ctx.userId,
              status: 'pending',
            })
            .returning();

          // TODO: Integrate with actual communication providers (Twilio, SendGrid, etc.)
          // For now, we'll just mark as sent
          const [sentMessage] = await ctx.db
            .update(communicationMessages)
            .set({
              status: 'sent',
              sentAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(communicationMessages.id, newMessage.id))
            .returning();

          return sentMessage;
        } catch (error) {
          console.error('Error sending message:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to send message',
          });
        }
      }),

    list: protectedProcedure
      .input(z.object({
        recipientId: z.string().uuid().optional(),
        type: z.enum(['email', 'sms', 'push', 'in_app']).optional(),
        status: z.enum(['pending', 'sent', 'delivered', 'failed', 'bounced']).optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        try {
          const whereConditions = [eq(communicationMessages.tenantId, ctx.userId)];

          if (input.recipientId) {
            whereConditions.push(eq(communicationMessages.recipientId, input.recipientId));
          }

          if (input.type) {
            whereConditions.push(eq(communicationMessages.type, input.type));
          }

          if (input.status) {
            whereConditions.push(eq(communicationMessages.status, input.status));
          }

          const messages = await ctx.db
            .select()
            .from(communicationMessages)
            .where(and(...whereConditions))
            .orderBy(desc(communicationMessages.createdAt))
            .limit(input.limit)
            .offset(input.offset);

          return messages;
        } catch (error) {
          console.error('Error fetching messages:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch messages',
          });
        }
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        try {
          const message = await ctx.db
            .select()
            .from(communicationMessages)
            .where(and(
              eq(communicationMessages.id, input.id),
              eq(communicationMessages.tenantId, ctx.userId)
            ))
            .limit(1);

          if (!message.length) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Message not found',
            });
          }

          return message[0];
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          
          console.error('Error fetching message:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch message',
          });
        }
      }),
  },

  // Automation management
  automations: {
    create: protectedProcedure
      .input(createAutomationSchema)
      .mutation(async ({ ctx, input }) => {
        try {
          const [newAutomation] = await ctx.db
            .insert(communicationAutomations)
            .values({
              ...input,
              tenantId: ctx.userId,
            })
            .returning();

          return newAutomation;
        } catch (error) {
          console.error('Error creating automation:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create automation',
          });
        }
      }),

    list: protectedProcedure
      .input(z.object({
        isActive: z.boolean().optional(),
        trigger: z.enum(['customer_created', 'job_completed', 'payment_received', 'time_based', 'event_based']).optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        try {
          const whereConditions = [eq(communicationAutomations.tenantId, ctx.userId)];

          if (input.isActive !== undefined) {
            whereConditions.push(eq(communicationAutomations.isActive, input.isActive));
          }

          if (input.trigger) {
            whereConditions.push(eq(communicationAutomations.trigger, input.trigger));
          }

          const automations = await ctx.db
            .select()
            .from(communicationAutomations)
            .where(and(...whereConditions))
            .orderBy(desc(communicationAutomations.createdAt))
            .limit(input.limit)
            .offset(input.offset);

          return automations;
        } catch (error) {
          console.error('Error fetching automations:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch automations',
          });
        }
      }),

    toggle: protectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        isActive: z.boolean(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const [updatedAutomation] = await ctx.db
            .update(communicationAutomations)
            .set({
              isActive: input.isActive,
              updatedAt: new Date(),
            })
            .where(and(
              eq(communicationAutomations.id, input.id),
              eq(communicationAutomations.tenantId, ctx.userId)
            ))
            .returning();

          if (!updatedAutomation) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Automation not found',
            });
          }

          return updatedAutomation;
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          
          console.error('Error toggling automation:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to toggle automation',
          });
        }
      }),
  },

  // Communication analytics
  analytics: {
    getOverview: protectedProcedure
      .input(z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        try {
          const whereConditions = [eq(communicationMessages.tenantId, ctx.userId)];

          if (input.startDate) {
            whereConditions.push(eq(communicationMessages.createdAt, new Date(input.startDate)));
          }

          if (input.endDate) {
            whereConditions.push(eq(communicationMessages.createdAt, new Date(input.endDate)));
          }

          const messages = await ctx.db
            .select()
            .from(communicationMessages)
            .where(and(...whereConditions));

          const totalMessages = messages.length;
          const sentMessages = messages.filter(m => m.status === 'sent').length;
          const deliveredMessages = messages.filter(m => m.status === 'delivered').length;
          const failedMessages = messages.filter(m => m.status === 'failed').length;

          const emailMessages = messages.filter(m => m.type === 'email').length;
          const smsMessages = messages.filter(m => m.type === 'sms').length;

          return {
            totalMessages,
            sentMessages,
            deliveredMessages,
            failedMessages,
            deliveryRate: sentMessages > 0 ? (deliveredMessages / sentMessages) * 100 : 0,
            failureRate: totalMessages > 0 ? (failedMessages / totalMessages) * 100 : 0,
            emailMessages,
            smsMessages,
          };
        } catch (error) {
          console.error('Error fetching communication analytics:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch communication analytics',
          });
        }
      }),
  },
});