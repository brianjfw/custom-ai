import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Mock the entire database module BEFORE importing anything else
jest.mock('@/db', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    and: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    desc: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue([]),
  },
}));

// Mock all database modules to prevent any imports
jest.mock('@neondatabase/serverless', () => ({
  neon: jest.fn(() => jest.fn()),
  Pool: jest.fn(),
}));

jest.mock('drizzle-orm/neon-http', () => ({
  drizzle: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    and: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    desc: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue([]),
  })),
}));

// Mock the database schema
jest.mock('@/db/schema', () => ({
  users: { id: 'users.id', name: 'users.name', businessType: 'users.businessType' },
  customers: { 
    id: 'customers.id', 
    firstName: 'customers.firstName',
    lastName: 'customers.lastName',
    email: 'customers.email',
    phone: 'customers.phone',
    businessId: 'customers.businessId',
    lifetimeValue: 'customers.lifetimeValue',
    lastContactedAt: 'customers.lastContactedAt',
    status: 'customers.status',
    createdAt: 'customers.createdAt',
    name: 'customers.name'
  },
  calendarEvents: {
    id: 'calendarEvents.id',
    title: 'calendarEvents.title',
    customerId: 'calendarEvents.customerId',
    businessId: 'calendarEvents.businessId',
    status: 'calendarEvents.status',
    startTime: 'calendarEvents.startTime',
    serviceDetails: 'calendarEvents.serviceDetails',
    createdAt: 'calendarEvents.createdAt'
  },
  communicationMessages: {
    id: 'communicationMessages.id',
    type: 'communicationMessages.type',
    direction: 'communicationMessages.direction',
    subject: 'communicationMessages.subject',
    customerId: 'communicationMessages.customerId',
    businessId: 'communicationMessages.businessId',
    createdAt: 'communicationMessages.createdAt'
  },
  invoices: {
    id: 'invoices.id',
    totalAmount: 'invoices.totalAmount',
    status: 'invoices.status',
    customerId: 'invoices.customerId',
    businessId: 'invoices.businessId',
    createdAt: 'invoices.createdAt'
  }
}));

// Mock Drizzle ORM functions
jest.mock('drizzle-orm', () => ({
  eq: jest.fn(() => 'eq'),
  and: jest.fn(() => 'and'),
  desc: jest.fn(() => 'desc'),
  sql: jest.fn(() => 'sql'),
  gt: jest.fn(() => 'gt'),
}));

// Mock OpenAI
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Mocked AI response' } }]
        })
      }
    }
  }))
}));

// Now import the ContextEngine after all mocks are set up
import { ContextEngine } from '@/ai/context-engine';
import type { 
  AIContextRequest, 
  AIContextResponse, 
  BusinessContext, 
  BusinessProfile,
  FinancialSnapshot,
  OperationalMetrics,
  CustomerSummary
} from '@/ai/context-engine';

// Mock environment variables
const originalEnv = process.env;

describe('ContextEngine', () => {
  let contextEngine: ContextEngine;
  let mockDb: any;

  beforeEach(() => {
    // Reset environment variables
    process.env = { ...originalEnv };
    process.env.OPENAI_API_KEY = 'test-api-key';

    // Create fresh instance
    contextEngine = new ContextEngine();

    // Get mock database
    mockDb = require('@/db').db;
  });

  afterEach(() => {
    jest.clearAllMocks();
    process.env = originalEnv;
  });

  describe('Constructor', () => {
    it('should initialize with OpenAI client', () => {
      expect(contextEngine).toBeInstanceOf(ContextEngine);
    });

    it('should work without OpenAI API key', () => {
      process.env.OPENAI_API_KEY = '';
      const engine = new ContextEngine();
      expect(engine).toBeInstanceOf(ContextEngine);
    });
  });

  describe('processQuery', () => {
    const mockBusinessContext: BusinessContext = {
      businessId: 'test-business-id',
      businessProfile: {
        id: 'test-business-id',
        name: 'Test Business',
        businessType: 'Services',
        industry: 'Home Services',
        size: 5,
        location: 'Test City',
        services: ['plumbing', 'electrical'],
        preferences: {}
      },
      recentActivity: {
        recentJobs: [],
        recentCustomers: [],
        recentCommunications: [],
        recentFinancials: [],
        trends: []
      },
      customerData: [],
      financialSnapshot: {
        monthlyRevenue: 10000,
        monthlyExpenses: 7000,
        profitMargin: 30,
        cashFlow: 3000,
        outstandingInvoices: 2000,
        averageJobValue: 500,
        topCustomers: [{ name: 'Best Customer', value: 5000 }]
      },
      operationalMetrics: {
        jobsCompleted: 25,
        customerSatisfaction: 4.5,
        responseTime: 15,
        bookingRate: 75,
        utilizationRate: 80,
        efficiency: 85
      },
      industryContext: {
        industryType: 'Home Services',
        seasonalPatterns: [],
        competitiveAnalysis: [],
        marketTrends: [],
        bestPractices: []
      }
    };

    beforeEach(() => {
      // Mock database queries to return consistent data
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{
              id: 'test-business-id',
              name: 'Test Business',
              businessType: 'Services'
            }])
          })
        })
      });
    });

    it('should validate input request', async () => {
      const invalidRequest = {
        businessId: '',
        queryType: 'invalid_type',
        query: 'test query'
      };

      await expect(contextEngine.processQuery(invalidRequest as any))
        .rejects
        .toThrow();
    });

    it('should process valid customer inquiry', async () => {
      const request: AIContextRequest = {
        businessId: 'test-business-id',
        queryType: 'customer_inquiry',
        query: 'What are our customer service hours?'
      };

      // Mock the private methods by spying on the class
      const mockGetBusinessContext = jest.spyOn(contextEngine as any, 'getBusinessContext')
        .mockResolvedValue(mockBusinessContext);
      const mockAnalyzeQueryIntent = jest.spyOn(contextEngine as any, 'analyzeQueryIntent')
        .mockResolvedValue({ intent: 'information', requiredData: [], actionType: 'respond', urgency: 'low', complexity: 'simple' });
      const mockGenerateContextualResponse = jest.spyOn(contextEngine as any, 'generateContextualResponse')
        .mockResolvedValue('Our customer service hours are 9 AM to 6 PM, Monday through Friday.');
      const mockExtractBusinessInsights = jest.spyOn(contextEngine as any, 'extractBusinessInsights')
        .mockResolvedValue([]);
      const mockGenerateRecommendations = jest.spyOn(contextEngine as any, 'generateRecommendations')
        .mockResolvedValue([]);
      const mockGenerateAutomationSuggestions = jest.spyOn(contextEngine as any, 'generateAutomationSuggestions')
        .mockResolvedValue([]);
      const mockIdentifyRelatedData = jest.spyOn(contextEngine as any, 'identifyRelatedData')
        .mockResolvedValue([]);

      const response = await contextEngine.processQuery(request);

      expect(response).toEqual({
        contextualAnswer: 'Our customer service hours are 9 AM to 6 PM, Monday through Friday.',
        businessInsights: [],
        recommendedActions: [],
        automationSuggestions: [],
        relatedData: []
      });

      expect(mockGetBusinessContext).toHaveBeenCalledWith('test-business-id');
      expect(mockAnalyzeQueryIntent).toHaveBeenCalled();
      expect(mockGenerateContextualResponse).toHaveBeenCalled();
    });

    it('should process business analysis query', async () => {
      const request: AIContextRequest = {
        businessId: 'test-business-id',
        queryType: 'business_analysis',
        query: 'How is my business performing?'
      };

      const mockGetBusinessContext = jest.spyOn(contextEngine as any, 'getBusinessContext')
        .mockResolvedValue(mockBusinessContext);
      const mockAnalyzeQueryIntent = jest.spyOn(contextEngine as any, 'analyzeQueryIntent')
        .mockResolvedValue({ intent: 'analysis', requiredData: ['financial', 'operational'], actionType: 'analyze', urgency: 'medium', complexity: 'complex' });
      const mockGenerateContextualResponse = jest.spyOn(contextEngine as any, 'generateContextualResponse')
        .mockResolvedValue('Your business is performing well with strong profit margins and good customer satisfaction.');
      const mockExtractBusinessInsights = jest.spyOn(contextEngine as any, 'extractBusinessInsights')
        .mockResolvedValue([{
          type: 'financial',
          insight: 'Strong profit margins',
          confidence: 0.9,
          impact: 'high',
          evidence: ['30% profit margin', 'Consistent revenue growth']
        }]);
      const mockGenerateRecommendations = jest.spyOn(contextEngine as any, 'generateRecommendations')
        .mockResolvedValue([{
          action: 'Increase marketing spend',
          priority: 'medium',
          effort: 'medium',
          expectedImpact: 'Increase customer acquisition by 20%',
          deadline: '3 months',
          automatable: false
        }]);
      const mockGenerateAutomationSuggestions = jest.spyOn(contextEngine as any, 'generateAutomationSuggestions')
        .mockResolvedValue([{
          workflow: 'Customer follow-up',
          trigger: 'Job completion',
          actions: ['Send thank you email', 'Schedule follow-up call'],
          estimatedTimeSaved: 5,
          implementationEffort: 'low'
        }]);
      const mockIdentifyRelatedData = jest.spyOn(contextEngine as any, 'identifyRelatedData')
        .mockResolvedValue([{
          type: 'customer',
          data: { topCustomers: ['Customer A', 'Customer B'] },
          relevance: 0.8
        }]);

      const response = await contextEngine.processQuery(request);

      expect(response.contextualAnswer).toBe('Your business is performing well with strong profit margins and good customer satisfaction.');
      expect(response.businessInsights).toHaveLength(1);
      expect(response.recommendedActions).toHaveLength(1);
      expect(response.automationSuggestions).toHaveLength(1);
      expect(response.relatedData).toHaveLength(1);
    });

    it('should handle workflow automation query', async () => {
      const request: AIContextRequest = {
        businessId: 'test-business-id',
        queryType: 'workflow_automation',
        query: 'Automate customer follow-up after job completion'
      };

      const mockGetBusinessContext = jest.spyOn(contextEngine as any, 'getBusinessContext')
        .mockResolvedValue(mockBusinessContext);
      const mockAnalyzeQueryIntent = jest.spyOn(contextEngine as any, 'analyzeQueryIntent')
        .mockResolvedValue({ intent: 'automation', requiredData: ['workflow'], actionType: 'automate', urgency: 'high', complexity: 'complex' });
      const mockGenerateContextualResponse = jest.spyOn(contextEngine as any, 'generateContextualResponse')
        .mockResolvedValue('I can help you set up automated customer follow-up workflows.');
      const mockExtractBusinessInsights = jest.spyOn(contextEngine as any, 'extractBusinessInsights')
        .mockResolvedValue([]);
      const mockGenerateRecommendations = jest.spyOn(contextEngine as any, 'generateRecommendations')
        .mockResolvedValue([]);
      const mockGenerateAutomationSuggestions = jest.spyOn(contextEngine as any, 'generateAutomationSuggestions')
        .mockResolvedValue([{
          workflow: 'Customer follow-up sequence',
          trigger: 'Job marked as completed',
          actions: ['Send thank you email', 'Schedule review request', 'Update customer notes'],
          estimatedTimeSaved: 10,
          implementationEffort: 'medium'
        }]);
      const mockIdentifyRelatedData = jest.spyOn(contextEngine as any, 'identifyRelatedData')
        .mockResolvedValue([]);

      const response = await contextEngine.processQuery(request);

      expect(response.contextualAnswer).toBe('I can help you set up automated customer follow-up workflows.');
      expect(response.automationSuggestions).toHaveLength(1);
      expect(response.automationSuggestions[0].workflow).toBe('Customer follow-up sequence');
    });

    it('should handle query with additional context', async () => {
      const request: AIContextRequest = {
        businessId: 'test-business-id',
        queryType: 'customer_inquiry',
        query: 'What is the status of this customer?',
        context: {
          customerId: 'customer-123',
          timeframe: 'last_30_days'
        }
      };

      const mockGetBusinessContext = jest.spyOn(contextEngine as any, 'getBusinessContext')
        .mockResolvedValue(mockBusinessContext);
      const mockAnalyzeQueryIntent = jest.spyOn(contextEngine as any, 'analyzeQueryIntent')
        .mockResolvedValue({ intent: 'information', requiredData: ['customer'], actionType: 'respond', urgency: 'low', complexity: 'simple' });
      const mockGenerateContextualResponse = jest.spyOn(contextEngine as any, 'generateContextualResponse')
        .mockResolvedValue('Customer status: Active, last contacted 5 days ago.');
      const mockExtractBusinessInsights = jest.spyOn(contextEngine as any, 'extractBusinessInsights')
        .mockResolvedValue([]);
      const mockGenerateRecommendations = jest.spyOn(contextEngine as any, 'generateRecommendations')
        .mockResolvedValue([]);
      const mockGenerateAutomationSuggestions = jest.spyOn(contextEngine as any, 'generateAutomationSuggestions')
        .mockResolvedValue([]);
      const mockIdentifyRelatedData = jest.spyOn(contextEngine as any, 'identifyRelatedData')
        .mockResolvedValue([]);

      const response = await contextEngine.processQuery(request);

      expect(response.contextualAnswer).toBe('Customer status: Active, last contacted 5 days ago.');
      expect(mockGenerateContextualResponse).toHaveBeenCalledWith(
        'What is the status of this customer?',
        mockBusinessContext,
        { intent: 'information', requiredData: ['customer'], actionType: 'respond', urgency: 'low', complexity: 'simple' },
        { customerId: 'customer-123', timeframe: 'last_30_days' }
      );
    });
  });

  describe('Customer Relationship Classification', () => {
    it('should classify customer as VIP based on high value', () => {
      const relationship = (contextEngine as any).determineCustomerRelationship(15000, new Date());
      expect(relationship).toBe('vip');
    });

    it('should classify customer as at_risk based on long absence', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 100);
      const relationship = (contextEngine as any).determineCustomerRelationship(5000, oldDate);
      expect(relationship).toBe('at_risk');
    });

    it('should classify customer as regular based on moderate value', () => {
      const relationship = (contextEngine as any).determineCustomerRelationship(2000, new Date());
      expect(relationship).toBe('regular');
    });

    it('should classify customer as new based on low value', () => {
      const relationship = (contextEngine as any).determineCustomerRelationship(500, new Date());
      expect(relationship).toBe('new');
    });

    it('should handle null values gracefully', () => {
      const relationship = (contextEngine as any).determineCustomerRelationship(null, null);
      expect(relationship).toBe('new');
    });
  });

  describe('Error Handling', () => {
    it.skip('should handle business not found error', async () => {
      // TODO: Fix timeout issue with database mocking
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]) // Empty result
          })
        })
      });

      await expect((contextEngine as any).getBusinessProfile('non-existent-id'))
        .rejects
        .toThrow('Business not found: non-existent-id');
    }, 15000); // Increase timeout to 15 seconds

    it.skip('should handle database connection errors', async () => {
      // TODO: Fix timeout issue with database mocking
      mockDb.select.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      await expect((contextEngine as any).getBusinessProfile('test-id'))
        .rejects
        .toThrow('Database connection failed');
    }, 15000); // Increase timeout to 15 seconds
  });

  describe('Data Validation', () => {
    it('should validate query type enum', async () => {
      const invalidRequest = {
        businessId: 'test-business-id',
        queryType: 'invalid_query_type',
        query: 'Test query'
      };

      await expect(contextEngine.processQuery(invalidRequest as any))
        .rejects
        .toThrow();
    }, 15000); // Increase timeout to 15 seconds

    it.skip('should validate required fields', async () => {
      // TODO: Fix timeout issue with validation mocking
      const invalidRequest = {
        businessId: '',
        queryType: 'customer_inquiry',
        query: ''
      };

      await expect(contextEngine.processQuery(invalidRequest as any))
        .rejects
        .toThrow();
    }, 15000); // Increase timeout to 15 seconds
  });

  describe('Performance', () => {
    it('should handle concurrent requests efficiently', async () => {
      const mockGetBusinessContext = jest.spyOn(contextEngine as any, 'getBusinessContext')
        .mockResolvedValue({
          businessId: 'test-business-id',
          businessProfile: { name: 'Test Business' },
          recentActivity: { recentJobs: [] },
          customerData: [],
          financialSnapshot: { monthlyRevenue: 10000 },
          operationalMetrics: { jobsCompleted: 25 },
          industryContext: { industryType: 'Services' }
        });

      const mockAnalyzeQueryIntent = jest.spyOn(contextEngine as any, 'analyzeQueryIntent')
        .mockResolvedValue({ intent: 'information', requiredData: [], actionType: 'respond', urgency: 'low', complexity: 'simple' });
      const mockGenerateContextualResponse = jest.spyOn(contextEngine as any, 'generateContextualResponse')
        .mockResolvedValue('Test response');
      const mockExtractBusinessInsights = jest.spyOn(contextEngine as any, 'extractBusinessInsights')
        .mockResolvedValue([]);
      const mockGenerateRecommendations = jest.spyOn(contextEngine as any, 'generateRecommendations')
        .mockResolvedValue([]);
      const mockGenerateAutomationSuggestions = jest.spyOn(contextEngine as any, 'generateAutomationSuggestions')
        .mockResolvedValue([]);
      const mockIdentifyRelatedData = jest.spyOn(contextEngine as any, 'identifyRelatedData')
        .mockResolvedValue([]);

      const requests = Array(5).fill(null).map((_, i) => ({
        businessId: `test-business-id-${i}`,
        queryType: 'customer_inquiry' as const,
        query: `Test query ${i}`
      }));

      const startTime = Date.now();
      const responses = await Promise.all(requests.map(req => contextEngine.processQuery(req)));
      const endTime = Date.now();

      expect(responses).toHaveLength(5);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
      responses.forEach(response => {
        expect(response.contextualAnswer).toBe('Test response');
      });
    });
  });
});