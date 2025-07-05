import { z } from 'zod';
import { OpenAI } from 'openai';
import { db } from '../db';
import { users, customers, communicationMessages, calendarEvents, invoices } from '../db/schema';
import { eq, and, desc, sql, gt } from 'drizzle-orm';

// Types for business context
export interface BusinessContext {
  businessId: string;
  businessProfile: BusinessProfile;
  recentActivity: RecentActivity;
  customerData: CustomerSummary[];
  financialSnapshot: FinancialSnapshot;
  operationalMetrics: OperationalMetrics;
  industryContext: IndustryContext;
}

export interface BusinessProfile {
  id: string;
  name: string;
  businessType: string;
  industry: string;
  size: number;
  location: string;
  services: string[];
  preferences: Record<string, unknown>;
}

export interface RecentActivity {
  recentJobs: JobSummary[];
  recentCustomers: CustomerSummary[];
  recentCommunications: CommunicationSummary[];
  recentFinancials: FinancialActivity[];
  trends: ActivityTrend[];
}

export interface CustomerSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalValue: number;
  lastContact: Date;
  status: string;
  relationship: 'new' | 'regular' | 'vip' | 'at_risk';
  tags: string[];
}

export interface JobSummary {
  id: string;
  title: string;
  customerId: string;
  customerName: string;
  status: string;
  value: number;
  scheduledDate: Date;
  completion: number;
  profitMargin: number;
}

export interface FinancialSnapshot {
  monthlyRevenue: number;
  monthlyExpenses: number;
  profitMargin: number;
  cashFlow: number;
  outstandingInvoices: number;
  averageJobValue: number;
  topCustomers: { name: string; value: number }[];
}

export interface OperationalMetrics {
  jobsCompleted: number;
  customerSatisfaction: number;
  responseTime: number;
  bookingRate: number;
  utilizationRate: number;
  efficiency: number;
}

export interface IndustryContext {
  industryType: string;
  seasonalPatterns: SeasonalPattern[];
  competitiveAnalysis: CompetitiveInsight[];
  marketTrends: MarketTrend[];
  bestPractices: BestPractice[];
}

export interface AIContextRequest {
  businessId: string;
  queryType: 'customer_inquiry' | 'business_analysis' | 'workflow_automation' | 'general';
  query: string;
  context?: {
    customerId?: string;
    jobId?: string;
    timeframe?: string;
  };
}

export interface AIContextResponse {
  contextualAnswer: string;
  businessInsights: BusinessInsight[];
  recommendedActions: RecommendedAction[];
  automationSuggestions: AutomationSuggestion[];
  relatedData: RelatedData[];
}

export interface BusinessInsight {
  type: 'financial' | 'operational' | 'customer' | 'market';
  insight: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  evidence: string[];
}

export interface RecommendedAction {
  action: string;
  priority: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  expectedImpact: string;
  deadline: string;
  automatable: boolean;
}

export interface AutomationSuggestion {
  workflow: string;
  trigger: string;
  actions: string[];
  estimatedTimeSaved: number;
  implementationEffort: string;
}

export interface RelatedData {
  type: string;
  data: Record<string, unknown>;
  relevance: number;
}

// Validation schemas
const contextRequestSchema = z.object({
  businessId: z.string(),
  queryType: z.enum(['customer_inquiry', 'business_analysis', 'workflow_automation', 'general']),
  query: z.string(),
  context: z.object({
    customerId: z.string().optional(),
    jobId: z.string().optional(),
    timeframe: z.string().optional(),
  }).optional(),
});

/**
 * Context Engine - The core AI orchestration layer
 * 
 * This is our proprietary system that transforms disconnected business data
 * into intelligent, context-aware AI responses. Unlike generic AI tools,
 * the Context Engine understands the complete business context and can
 * orchestrate complex workflows automatically.
 */
export class ContextEngine {
  private openai: OpenAI | null = null;
  private businessContextCache: Map<string, { data: BusinessContext; timestamp: number }> = new Map();
  private contextTTL = 5 * 60 * 1000; // 5 minutes cache

  constructor() {
    // Only initialize OpenAI in non-test environments
    if (process.env.NODE_ENV !== 'test') {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY || '',
      });
    }
  }

  /**
   * Main entry point for context-aware AI processing
   */
  async processQuery(request: AIContextRequest): Promise<AIContextResponse> {
    const validatedRequest = contextRequestSchema.parse(request);

    // Step 1: Gather comprehensive business context
    const businessContext = await this.getBusinessContext(validatedRequest.businessId);

    // Step 2: Analyze query intent and determine required context
    const queryIntent = await this.analyzeQueryIntent(validatedRequest.query, validatedRequest.queryType);

    // Step 3: Generate contextual AI response
    const contextualResponse = await this.generateContextualResponse(
      validatedRequest.query,
      businessContext,
      queryIntent,
      validatedRequest.context
    );

    // Step 4: Extract business insights from current state
    const businessInsights = await this.extractBusinessInsights(businessContext);

    // Step 5: Generate actionable recommendations
    const recommendations = await this.generateRecommendations(businessContext, queryIntent);

    // Step 6: Suggest automation opportunities
    const automationSuggestions = await this.generateAutomationSuggestions(businessContext, queryIntent);

    // Step 7: Identify related data and opportunities
    const relatedData = await this.identifyRelatedData(businessContext, validatedRequest.context);

    return {
      contextualAnswer: contextualResponse,
      businessInsights,
      recommendedActions: recommendations,
      automationSuggestions,
      relatedData,
    };
  }

  /**
   * Gather comprehensive business context from all data sources
   */
  private async getBusinessContext(businessId: string): Promise<BusinessContext> {
    // Check cache first
    const cacheKey = `business_context_${businessId}`;
    const cached = this.businessContextCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.contextTTL) {
      return cached.data;
    }

    // Gather all business data in parallel for efficiency
    const [
      businessProfile,
      recentActivity,
      customerData,
      financialSnapshot,
      operationalMetrics,
      industryContext
    ] = await Promise.all([
      this.getBusinessProfile(businessId),
      this.getRecentActivity(businessId),
      this.getCustomerData(businessId),
      this.getFinancialSnapshot(businessId),
      this.getOperationalMetrics(businessId),
      this.getIndustryContext(businessId)
    ]);

    const context: BusinessContext = {
      businessId,
      businessProfile,
      recentActivity,
      customerData,
      financialSnapshot,
      operationalMetrics,
      industryContext,
    };

    // Cache the context
    this.businessContextCache.set(cacheKey, {
      data: context,
      timestamp: Date.now(),
    });

    return context;
  }

  /**
   * Extract business profile and configuration
   */
  private async getBusinessProfile(businessId: string): Promise<BusinessProfile> {
    const business = await db
      .select()
      .from(users)
      .where(eq(users.id, businessId))
      .limit(1);

    if (!business.length) {
      throw new Error(`Business not found: ${businessId}`);
    }

    const profile = business[0];
    
    return {
      id: profile.id,
      name: profile.name || 'Unknown Business',
      businessType: profile.businessType || 'General',
      industry: 'Services', // Default since not in users table
      size: 1, // Default since not in users table
      location: 'Unknown', // Default since not in users table
      services: [], // Default since not in users table
      preferences: {}, // Default since not in users table
    };
  }

  /**
   * Gather recent business activity across all domains
   */
  private async getRecentActivity(businessId: string): Promise<RecentActivity> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [recentJobs, recentCustomers, recentCommunications, recentFinancials] = await Promise.all([
      // Recent services/events (representing jobs)
      db.select({
        id: calendarEvents.id,
        title: calendarEvents.title,
        customerId: calendarEvents.customerId,
        customerName: customers.name,
        status: calendarEvents.status,
        value: sql<number>`COALESCE(${calendarEvents.serviceDetails}->>'estimatedCost', '0')::numeric`,
        scheduledDate: calendarEvents.startTime,
        completion: sql<number>`CASE WHEN ${calendarEvents.status} = 'completed' THEN 100 ELSE 0 END`,
        profitMargin: sql<number>`COALESCE(${calendarEvents.serviceDetails}->>'estimatedCost', '0')::numeric * 0.3`,
      })
      .from(calendarEvents)
      .leftJoin(customers, eq(calendarEvents.customerId, customers.id))
      .where(and(
        eq(calendarEvents.businessId, businessId),
        gt(calendarEvents.createdAt, thirtyDaysAgo)
      ))
      .orderBy(desc(calendarEvents.createdAt))
      .limit(10),

      // Recent customers
      db.select({
        id: customers.id,
        name: sql<string>`CONCAT(${customers.firstName}, ' ', ${customers.lastName})`,
        email: customers.email,
        phone: customers.phone,
        totalValue: customers.lifetimeValue,
        lastContact: customers.lastContactedAt,
        status: customers.status,
        tags: sql<string[]>`'{}'::text[]`, // Default empty array since no tags field
      })
      .from(customers)
      .where(and(
        eq(customers.businessId, businessId),
        gt(customers.createdAt, thirtyDaysAgo)
      ))
      .orderBy(desc(customers.createdAt))
      .limit(10),

      // Recent communications
      db.select({
        id: communicationMessages.id,
        type: communicationMessages.type,
        direction: communicationMessages.direction,
        subject: communicationMessages.subject,
        customerId: communicationMessages.customerId,
        customerName: customers.name,
        createdAt: communicationMessages.createdAt,
      })
      .from(communicationMessages)
      .leftJoin(customers, eq(communicationMessages.customerId, customers.id))
      .where(and(
        eq(communicationMessages.businessId, businessId),
        gt(communicationMessages.createdAt, thirtyDaysAgo)
      ))
      .orderBy(desc(communicationMessages.createdAt))
      .limit(10),

      // Recent financial activity
      db.select({
        id: invoices.id,
        amount: invoices.totalAmount,
        status: invoices.status,
        customerId: invoices.customerId,
        customerName: customers.name,
        createdAt: invoices.createdAt,
      })
      .from(invoices)
      .leftJoin(customers, eq(invoices.customerId, customers.id))
      .where(and(
        eq(invoices.businessId, businessId),
        gt(invoices.createdAt, thirtyDaysAgo)
      ))
      .orderBy(desc(invoices.createdAt))
      .limit(10),
    ]);

    return {
      recentJobs: recentJobs.map(job => ({
        id: job.id,
        title: job.title,
        customerId: job.customerId,
        customerName: job.customerName || 'Unknown',
        status: job.status,
        value: Number(job.value || 0),
        scheduledDate: job.scheduledDate || new Date(),
        completion: Number(job.completion || 0),
        profitMargin: Number(job.profitMargin || 0),
      })),
      recentCustomers: recentCustomers.map(customer => ({
        id: customer.id,
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone || '',
        totalValue: Number(customer.totalValue || 0),
        lastContact: customer.lastContact || new Date(),
        status: customer.status,
        relationship: this.determineCustomerRelationship(customer.totalValue, customer.lastContact),
        tags: customer.tags || [],
      })),
      recentCommunications: recentCommunications.map(comm => ({
        id: comm.id,
        type: comm.type,
        direction: comm.direction,
        subject: comm.subject || '',
        customerId: comm.customerId,
        customerName: comm.customerName || 'Unknown',
        createdAt: comm.createdAt,
      })),
      recentFinancials: recentFinancials.map(invoice => ({
        id: invoice.id,
        type: 'invoice',
        amount: Number(invoice.amount || 0),
        status: invoice.status,
        customerId: invoice.customerId,
        customerName: invoice.customerName || 'Unknown',
        createdAt: invoice.createdAt,
      })),
      trends: [], // TODO: Implement trend analysis
    };
  }

  /**
   * Determine customer relationship based on value and recency
   */
  private determineCustomerRelationship(
    totalValue: number | null,
    lastContact: Date | null
  ): 'new' | 'regular' | 'vip' | 'at_risk' {
    const value = Number(totalValue || 0);
    const daysSinceContact = lastContact 
      ? Math.floor((Date.now() - lastContact.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    // Handle null/undefined values - should be considered new customers
    if (!totalValue && !lastContact) return 'new';
    
    // Check for at-risk customers first (any customer with >90 days absence is at risk)
    if (daysSinceContact > 90) return 'at_risk';
    
    // Then classify by value for active customers
    if (value >= 10000) return 'vip';
    if (value >= 1000) return 'regular';
    
    // Default to new for low-value, recent customers
    return 'new';
  }

  /**
   * Get customer data with insights
   */
  private async getCustomerData(businessId: string): Promise<CustomerSummary[]> {
    const customerData = await db
      .select({
        id: customers.id,
        name: sql<string>`CONCAT(${customers.firstName}, ' ', ${customers.lastName})`,
        email: customers.email,
        phone: customers.phone,
        totalValue: customers.lifetimeValue,
        lastContact: customers.lastContactedAt,
        status: customers.status,
        tags: sql<string[]>`'{}'::text[]`, // Default empty array since no tags field
      })
      .from(customers)
      .where(eq(customers.businessId, businessId))
      .orderBy(desc(customers.lifetimeValue))
      .limit(50);

    return customerData.map(customer => ({
      id: customer.id,
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      totalValue: Number(customer.totalValue || 0),
      lastContact: customer.lastContact || new Date(),
      status: customer.status,
      relationship: this.determineCustomerRelationship(customer.totalValue, customer.lastContact),
      tags: customer.tags || [],
    }));
  }

  /**
   * Generate financial snapshot
   */
  private async getFinancialSnapshot(businessId: string): Promise<FinancialSnapshot> {
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const [monthlyRevenue, monthlyExpenses, outstandingInvoices, averageJobValue, topCustomers] = await Promise.all([
      // Monthly revenue
      db.select({
        total: sql<number>`COALESCE(SUM(${invoices.totalAmount}), 0)`,
      })
      .from(invoices)
      .where(and(
        eq(invoices.businessId, businessId),
        gt(invoices.createdAt, currentMonth),
        eq(invoices.status, 'paid')
      )),

      // Monthly expenses (placeholder - would need expense tracking)
      Promise.resolve([{ total: 0 }]),

      // Outstanding invoices
      db.select({
        total: sql<number>`COALESCE(SUM(${invoices.totalAmount}), 0)`,
      })
      .from(invoices)
      .where(and(
        eq(invoices.businessId, businessId),
        sql`${invoices.status} IN ('pending', 'overdue')`
      )),

      // Average service value
      db.select({
        average: sql<number>`COALESCE(AVG((${calendarEvents.serviceDetails}->>'estimatedCost')::numeric), 0)`,
      })
      .from(calendarEvents)
      .where(and(
        eq(calendarEvents.businessId, businessId),
        sql`${calendarEvents.serviceDetails}->>'estimatedCost' IS NOT NULL`
      )),

      // Top customers by value
      db.select({
        name: sql<string>`CONCAT(${customers.firstName}, ' ', ${customers.lastName})`,
        value: customers.lifetimeValue,
      })
      .from(customers)
      .where(eq(customers.businessId, businessId))
      .orderBy(desc(customers.lifetimeValue))
      .limit(5),
    ]);

    const revenue = Number(monthlyRevenue[0]?.total || 0);
    const expenses = Number(monthlyExpenses[0]?.total || 0);

    return {
      monthlyRevenue: revenue,
      monthlyExpenses: expenses,
      profitMargin: revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0,
      cashFlow: revenue - expenses,
      outstandingInvoices: Number(outstandingInvoices[0]?.total || 0),
      averageJobValue: Number(averageJobValue[0]?.average || 0),
      topCustomers: topCustomers.map(customer => ({
        name: customer.name,
        value: Number(customer.value || 0),
      })),
    };
  }

  /**
   * Calculate operational metrics
   */
  private async getOperationalMetrics(businessId: string): Promise<OperationalMetrics> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [jobsCompleted, totalJobs, avgResponseTime] = await Promise.all([
      // Events completed in last 30 days
      db.select({
        count: sql<number>`COUNT(*)`,
      })
      .from(calendarEvents)
      .where(and(
        eq(calendarEvents.businessId, businessId),
        eq(calendarEvents.status, 'completed'),
        gt(calendarEvents.updatedAt, thirtyDaysAgo)
      )),

      // Total events in last 30 days
      db.select({
        count: sql<number>`COUNT(*)`,
      })
      .from(calendarEvents)
      .where(and(
        eq(calendarEvents.businessId, businessId),
        gt(calendarEvents.createdAt, thirtyDaysAgo)
      )),

      // Average response time (placeholder - would need communication tracking)
      Promise.resolve([{ avgTime: 30 }]),
    ]);

    const completed = Number(jobsCompleted[0]?.count || 0);
    const total = Number(totalJobs[0]?.count || 0);

    return {
      jobsCompleted: completed,
      customerSatisfaction: 4.2, // Placeholder - would need satisfaction tracking
      responseTime: Number(avgResponseTime[0]?.avgTime || 30),
      bookingRate: total > 0 ? (completed / total) * 100 : 0,
      utilizationRate: 75, // Placeholder - would need scheduling data
      efficiency: 85, // Placeholder - would need performance tracking
    };
  }

  /**
   * Get industry context and best practices
   */
  private async getIndustryContext(businessId: string): Promise<IndustryContext> {
    const business = await db
      .select({
        businessType: users.businessType,
      })
      .from(users)
      .where(eq(users.id, businessId))
      .limit(1);

    const industry = business[0]?.businessType || 'Services';
    
    return {
      industryType: industry,
      seasonalPatterns: this.getSeasonalPatterns(industry),
      competitiveAnalysis: this.getCompetitiveInsights(industry),
      marketTrends: this.getMarketTrends(industry),
      bestPractices: this.getBestPractices(industry),
    };
  }

  /**
   * Analyze query intent to determine processing approach
   */
  private async analyzeQueryIntent(query: string, queryType: string): Promise<QueryIntent> {
    const prompt = `Analyze this business query and determine the intent:
    
Query: "${query}"
Query Type: ${queryType}

Classify the intent and identify key components:
1. Intent category (customer_service, business_analysis, workflow_request, information_request)
2. Required data types (customer, financial, operational, scheduling)
3. Action type (informational, transactional, analytical, predictive)
4. Urgency level (low, medium, high, urgent)
5. Complexity (simple, moderate, complex)

Respond with a JSON object containing these classifications.`;

    try {
      const response = await this.openai?.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.1,
      });

      const content = response?.choices[0]?.message?.content || '{}';
      return JSON.parse(content);
    } catch (error) {
      console.error('Error analyzing query intent:', error);
      return {
        intent: 'information_request',
        requiredData: ['general'],
        actionType: 'informational',
        urgency: 'medium',
        complexity: 'moderate',
      };
    }
  }

  /**
   * Generate contextual AI response using business data
   */
  private async generateContextualResponse(
    query: string,
    context: BusinessContext,
    intent: QueryIntent,
    additionalContext?: any
  ): Promise<string> {
    const systemPrompt = `You are an AI assistant for ${context.businessProfile.name}, a ${context.businessProfile.businessType} business in the ${context.businessProfile.industry} industry.

BUSINESS CONTEXT:
- Business Type: ${context.businessProfile.businessType}
- Industry: ${context.businessProfile.industry}
- Location: ${context.businessProfile.location}
- Team Size: ${context.businessProfile.size}
- Services: ${context.businessProfile.services.join(', ')}

CURRENT BUSINESS STATE:
- Monthly Revenue: $${context.financialSnapshot.monthlyRevenue.toLocaleString()}
- Profit Margin: ${context.financialSnapshot.profitMargin.toFixed(1)}%
- Outstanding Invoices: $${context.financialSnapshot.outstandingInvoices.toLocaleString()}
- Jobs Completed (30 days): ${context.operationalMetrics.jobsCompleted}
- Average Job Value: $${context.financialSnapshot.averageJobValue.toLocaleString()}
- Customer Satisfaction: ${context.operationalMetrics.customerSatisfaction}/5.0

RECENT ACTIVITY:
- Recent Jobs: ${context.recentActivity.recentJobs.length} jobs
- Recent Customers: ${context.recentActivity.recentCustomers.length} new customers
- Recent Communications: ${context.recentActivity.recentCommunications.length} communications

You have access to comprehensive business data and should provide specific, actionable advice based on the actual business context. Always reference relevant data points and provide concrete suggestions for improvement.`;

    const userPrompt = `${query}

${additionalContext ? `Additional Context: ${JSON.stringify(additionalContext)}` : ''}

Please provide a comprehensive response that:
1. Addresses the specific query with business context
2. References relevant data from the business
3. Provides actionable recommendations
4. Suggests next steps or follow-up actions`;

    try {
      const response = await this.openai?.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      });

      return response?.choices[0]?.message?.content || 'I apologize, but I could not generate a response. Please try again.';
    } catch (error) {
      console.error('Error generating contextual response:', error);
      return 'I apologize, but I encountered an error processing your request. Please try again.';
    }
  }

  /**
   * Extract business insights from current context
   */
  private async extractBusinessInsights(context: BusinessContext): Promise<BusinessInsight[]> {
    const insights: BusinessInsight[] = [];

    // Financial insights
    if (context.financialSnapshot.profitMargin < 20) {
      insights.push({
        type: 'financial',
        insight: 'Your profit margin is below the industry standard of 20-25%. Consider reviewing your pricing strategy or reducing costs.',
        confidence: 0.8,
        impact: 'high',
        evidence: [`Current profit margin: ${context.financialSnapshot.profitMargin.toFixed(1)}%`],
      });
    }

    // Operational insights
    if (context.operationalMetrics.bookingRate < 60) {
      insights.push({
        type: 'operational',
        insight: 'Your booking rate is below optimal levels. Consider improving your sales process or follow-up procedures.',
        confidence: 0.7,
        impact: 'medium',
        evidence: [`Current booking rate: ${context.operationalMetrics.bookingRate.toFixed(1)}%`],
      });
    }

    // Customer insights
    const atRiskCustomers = context.customerData.filter(c => c.relationship === 'at_risk').length;
    if (atRiskCustomers > 0) {
      insights.push({
        type: 'customer',
        insight: `You have ${atRiskCustomers} customers at risk of churning. Consider reaching out to re-engage them.`,
        confidence: 0.9,
        impact: 'high',
        evidence: [`${atRiskCustomers} customers haven't been contacted in 90+ days`],
      });
    }

    return insights;
  }

  /**
   * Generate actionable recommendations
   */
  private async generateRecommendations(
    context: BusinessContext,
    _intent: QueryIntent
  ): Promise<RecommendedAction[]> {
    const recommendations: RecommendedAction[] = [];

    // Financial recommendations
    if (context.financialSnapshot.outstandingInvoices > 0) {
      recommendations.push({
        action: 'Send payment reminders for outstanding invoices',
        priority: 'high',
        effort: 'low',
        expectedImpact: `Collect $${context.financialSnapshot.outstandingInvoices.toLocaleString()} in outstanding payments`,
        deadline: '1 week',
        automatable: true,
      });
    }

    // Operational recommendations
    if (context.operationalMetrics.responseTime > 60) {
      recommendations.push({
        action: 'Implement automated response system to improve response times',
        priority: 'medium',
        effort: 'medium',
        expectedImpact: 'Reduce response time by 50% and improve customer satisfaction',
        deadline: '2 weeks',
        automatable: true,
      });
    }

    return recommendations;
  }

  /**
   * Generate automation suggestions
   */
  private async generateAutomationSuggestions(
    context: BusinessContext,
    _intent: QueryIntent
  ): Promise<AutomationSuggestion[]> {
    const suggestions: AutomationSuggestion[] = [];

    // Invoice automation
    if (context.recentActivity.recentJobs.length > 0) {
      suggestions.push({
        workflow: 'Automated Invoice Generation',
        trigger: 'When job status changes to completed',
        actions: [
          'Generate invoice from job data',
          'Send invoice to customer via email',
          'Set up payment reminders',
          'Update job status to billed',
        ],
        estimatedTimeSaved: 30,
        implementationEffort: 'Low',
      });
    }

    // Customer follow-up automation
    if (context.customerData.some(c => c.relationship === 'at_risk')) {
      suggestions.push({
        workflow: 'Customer Re-engagement Campaign',
        trigger: 'Customer inactive for 60+ days',
        actions: [
          'Send personalized follow-up email',
          'Schedule phone call reminder',
          'Offer special promotion',
          'Update customer relationship status',
        ],
        estimatedTimeSaved: 45,
        implementationEffort: 'Medium',
      });
    }

    return suggestions;
  }

  /**
   * Identify related data that might be relevant
   */
  private async identifyRelatedData(
    context: BusinessContext,
    additionalContext?: Record<string, unknown>
  ): Promise<RelatedData[]> {
    const relatedData: RelatedData[] = [];

    // If customer context is provided, include relevant customer data
    if (additionalContext?.customerId) {
      const customer = context.customerData.find(c => c.id === additionalContext.customerId);
      if (customer) {
        relatedData.push({
          type: 'customer',
          data: customer,
          relevance: 1.0,
        });
      }
    }

    // Include top customers for business analysis
    if (context.financialSnapshot.topCustomers.length > 0) {
      relatedData.push({
        type: 'top_customers',
        data: { customers: context.financialSnapshot.topCustomers },
        relevance: 0.8,
      });
    }

    // Include recent high-value jobs
    const highValueJobs = context.recentActivity.recentJobs.filter(j => j.value > context.financialSnapshot.averageJobValue);
    if (highValueJobs.length > 0) {
      relatedData.push({
        type: 'high_value_jobs',
        data: { jobs: highValueJobs },
        relevance: 0.7,
      });
    }

    return relatedData;
  }

  // Helper methods for industry context
  private getSeasonalPatterns(_industry: string): SeasonalPattern[] {
    const patterns: Record<string, SeasonalPattern[]> = {
      'HVAC': [
        { season: 'Summer', demand: 'high', factor: 1.4 },
        { season: 'Winter', demand: 'high', factor: 1.3 },
        { season: 'Spring', demand: 'medium', factor: 1.0 },
        { season: 'Fall', demand: 'medium', factor: 1.0 },
      ],
      'Landscaping': [
        { season: 'Spring', demand: 'high', factor: 1.5 },
        { season: 'Summer', demand: 'high', factor: 1.3 },
        { season: 'Fall', demand: 'medium', factor: 1.1 },
        { season: 'Winter', demand: 'low', factor: 0.6 },
      ],
      'Personal Care': [
        { season: 'Summer', demand: 'high', factor: 1.2 },
        { season: 'Winter', demand: 'medium', factor: 1.0 },
        { season: 'Spring', demand: 'medium', factor: 1.0 },
        { season: 'Fall', demand: 'medium', factor: 1.0 },
      ],
    };

    return patterns[industry] || [
      { season: 'All Year', demand: 'consistent', factor: 1.0 },
    ];
  }

  private getCompetitiveInsights(_industry: string): CompetitiveInsight[] {
    return [
      {
        insight: 'Local competitors are increasing their digital presence',
        impact: 'medium',
        recommendation: 'Invest in online marketing and customer reviews',
      },
      {
        insight: 'Industry pricing is trending upward',
        impact: 'high',
        recommendation: 'Consider gradual price increases for new customers',
      },
    ];
  }

  private getMarketTrends(_industry: string): MarketTrend[] {
    return [
      {
        trend: 'Customers expect faster response times',
        impact: 'high',
        timeline: 'immediate',
        recommendation: 'Implement automated response systems',
      },
      {
        trend: 'Digital payment preferences increasing',
        impact: 'medium',
        timeline: '6 months',
        recommendation: 'Offer multiple digital payment options',
      },
    ];
  }

  private getBestPractices(_industry: string): BestPractice[] {
    return [
      {
        practice: 'Follow up within 24 hours of initial contact',
        category: 'customer_service',
        impact: 'high',
        difficulty: 'low',
      },
      {
        practice: 'Send payment reminders before invoices are due',
        category: 'financial',
        impact: 'high',
        difficulty: 'low',
      },
      {
        practice: 'Document all customer interactions',
        category: 'operational',
        impact: 'medium',
        difficulty: 'medium',
      },
    ];
  }
}

// Additional type definitions
interface QueryIntent {
  intent: string;
  requiredData: string[];
  actionType: string;
  urgency: string;
  complexity: string;
}

interface SeasonalPattern {
  season: string;
  demand: string;
  factor: number;
}

interface CompetitiveInsight {
  insight: string;
  impact: string;
  recommendation: string;
}

interface MarketTrend {
  trend: string;
  impact: string;
  timeline: string;
  recommendation: string;
}

interface BestPractice {
  practice: string;
  category: string;
  impact: string;
  difficulty: string;
}

interface ActivityTrend {
  metric: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  change: number;
  timeframe: string;
}

interface CommunicationSummary {
  id: string;
  type: string;
  direction: string;
  subject: string;
  customerId: string;
  customerName: string;
  createdAt: Date;
}

interface FinancialActivity {
  id: string;
  type: string;
  amount: number;
  status: string;
  customerId: string;
  customerName: string;
  createdAt: Date;
}

// Export the singleton instance
export const contextEngine = new ContextEngine();