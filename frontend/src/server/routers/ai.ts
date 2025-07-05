import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { OpenAI } from 'openai';

// Initialize OpenAI with conditional API key
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Input schemas
const sendMessageSchema = z.object({
  message: z.string().min(1).max(4000),
  conversationId: z.string().optional(),
  context: z.object({
    businessType: z.string().optional(),
    currentPage: z.string().optional(),
  }).optional(),
});

const conversationHistorySchema = z.object({
  conversationId: z.string(),
});

export const aiRouter = createTRPCRouter({
  // Send a message to the AI assistant
  sendMessage: publicProcedure
    .input(sendMessageSchema)
    .mutation(async ({ input }) => {
      if (!openai) {
        throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.');
      }

      try {
        // Build system prompt based on context
        const systemPrompt = `You are an intelligent AI assistant for a small business management platform. 
You help business owners manage their operations, customers, finances, and growth strategies.

Key capabilities:
- Customer relationship management
- Financial insights and reporting  
- Marketing and sales automation
- Business process optimization
- Industry-specific advice

Context: ${input.context?.businessType ? `Business Type: ${input.context.businessType}` : 'General business assistance'}
Current Page: ${input.context?.currentPage || 'Dashboard'}

Respond in a helpful, professional, and actionable manner. Keep responses concise but comprehensive.`;

        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: input.message }
          ],
          max_tokens: 1000,
          temperature: 0.7,
        });

        const aiResponse = response.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

        // In a real app, you'd save this to the database
        // For now, return the response directly
        return {
          id: `msg_${Date.now()}`,
          message: aiResponse,
          timestamp: new Date(),
          conversationId: input.conversationId || `conv_${Date.now()}`,
        };
      } catch (error) {
        console.error('AI API Error:', error);
        throw new Error('Failed to get AI response. Please try again.');
      }
    }),

  // Get AI suggestions for business optimization
  getSuggestions: publicProcedure
    .input(z.object({
      topic: z.enum(['sales', 'marketing', 'finance', 'operations', 'general']),
      businessType: z.string().optional(),
    }))
    .query(async ({ input }) => {
      // Mock suggestions based on topic - in production, this could use AI
      const suggestions = {
        sales: [
          'Implement a customer referral program',
          'Set up automated follow-up sequences',
          'Analyze your sales funnel conversion rates',
        ],
        marketing: [
          'Optimize your local SEO presence',
          'Create social media content calendar',
          'Set up email marketing campaigns',
        ],
        finance: [
          'Review and optimize your pricing strategy',
          'Set up automated expense tracking',
          'Create monthly financial dashboards',
        ],
        operations: [
          'Streamline your appointment scheduling',
          'Implement quality control checklists',
          'Automate routine administrative tasks',
        ],
        general: [
          'Conduct regular customer satisfaction surveys',
          'Set up performance tracking metrics',
          'Develop standard operating procedures',
        ],
      };

      return {
        topic: input.topic,
        suggestions: suggestions[input.topic] || suggestions.general,
      };
    }),

  // Get conversation history
  getConversationHistory: publicProcedure
    .input(conversationHistorySchema)
    .query(async ({ input }) => {
      // Mock conversation history - in a real app, fetch from database
      return {
        id: input.conversationId,
        messages: [
          {
            id: 'msg_1',
            content: 'Hello! How can I help you manage your business today?',
            role: 'assistant' as const,
            timestamp: new Date(Date.now() - 60000),
          },
        ],
        createdAt: new Date(Date.now() - 3600000),
        updatedAt: new Date(),
      };
    }),

  // Get all conversations for a user
  getConversations: publicProcedure
    .query(async () => {
      // Mock conversations list - in a real app, fetch from database
      return [
        {
          id: 'conv_1',
          title: 'Customer Service Strategy',
          lastMessage: 'How can I improve customer retention?',
          timestamp: new Date(Date.now() - 3600000),
          messageCount: 5,
        },
        {
          id: 'conv_2', 
          title: 'Financial Planning',
          lastMessage: 'What are the key metrics I should track?',
          timestamp: new Date(Date.now() - 7200000),
          messageCount: 8,
        },
      ];
    }),

  // Create a new conversation
  createConversation: publicProcedure
    .input(z.object({
      title: z.string().min(1).max(100).optional(),
      initialMessage: z.string().min(1).max(4000).optional(),
    }))
    .mutation(async ({ input }) => {
      const conversationId = `conv_${Date.now()}`;
      
      // In a real app, save to database
      return {
        id: conversationId,
        title: input.title || 'New Conversation',
        createdAt: new Date(),
        messageCount: input.initialMessage ? 1 : 0,
      };
    }),
});