import { z } from 'zod';
import { contextEngine, BusinessContext } from './context-engine';

// Types for business intelligence
export interface BusinessInsight {
  id: string;
  type: 'financial' | 'operational' | 'customer' | 'market' | 'competitive';
  category: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number; // 0-1
  urgency: 'immediate' | 'short_term' | 'long_term';
  actionable: boolean;
  data: Record<string, unknown>;
  recommendations: string[];
  generatedAt: Date;
  expiresAt?: Date;
}

export interface BusinessMetric {
  id: string;
  name: string;
  value: number;
  previousValue?: number;
  change?: number;
  changePercentage?: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  target?: number;
  unit: string;
  category: string;
  lastUpdated: Date;
}

export interface BusinessForecast {
  id: string;
  metric: string;
  timeframe: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  predictions: Array<{
    period: string;
    value: number;
    confidence: number;
    factors: string[];
  }>;
  methodology: string;
  accuracy: number;
  generatedAt: Date;
}

export interface CompetitiveAnalysis {
  id: string;
  competitor: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  marketPosition: 'leader' | 'challenger' | 'follower' | 'niche';
  lastAnalyzed: Date;
}

export interface BusinessIntelligenceReport {
  id: string;
  businessId: string;
  reportType: 'executive_summary' | 'operational' | 'financial' | 'customer' | 'market' | 'competitive';
  title: string;
  insights: BusinessInsight[];
  metrics: BusinessMetric[];
  forecasts: BusinessForecast[];
  recommendations: string[];
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
}

export interface IntelligenceQuery {
  businessId: string;
  analysisType: 'performance' | 'growth' | 'efficiency' | 'risk' | 'opportunity' | 'competitive';
  timeframe?: string;
  focus?: string[];
  includeForecasts?: boolean;
  includeRecommendations?: boolean;
}

// Validation schemas
const intelligenceQuerySchema = z.object({
  businessId: z.string(),
  analysisType: z.enum(['performance', 'growth', 'efficiency', 'risk', 'opportunity', 'competitive']),
  timeframe: z.string().optional(),
  focus: z.array(z.string()).optional(),
  includeForecasts: z.boolean().optional(),
  includeRecommendations: z.boolean().optional(),
});

/**
 * Business Intelligence Engine - Generates insights and analytics
 * 
 * This system analyzes business data using the Context Engine to generate
 * actionable insights, predictions, and recommendations for business optimization.
 */
export class BusinessIntelligenceEngine {
  private insights: Map<string, BusinessInsight[]> = new Map();
  private reports: Map<string, BusinessIntelligenceReport[]> = new Map();
  private cacheTTL = 30 * 60 * 1000; // 30 minutes

  constructor() {
    // Initialize insight generation
    this.startInsightGeneration();
  }

  /**
   * Generate comprehensive business intelligence report
   */
  async generateReport(query: IntelligenceQuery): Promise<BusinessIntelligenceReport> {
    const validatedQuery = intelligenceQuerySchema.parse(query);

    // Get business context
    const businessContext = await contextEngine.processQuery({
      businessId: validatedQuery.businessId,
      queryType: 'business_analysis',
      query: 'Generate comprehensive business intelligence report',
    });

    // Generate insights based on analysis type
    const insights = await this.generateInsights(validatedQuery, businessContext);
    
    // Calculate key metrics
    const metrics = await this.calculateMetrics(validatedQuery, businessContext);
    
    // Generate forecasts if requested
    const forecasts = validatedQuery.includeForecasts 
      ? await this.generateForecasts(validatedQuery, businessContext)
      : [];

    // Generate recommendations if requested
    const recommendations = validatedQuery.includeRecommendations
      ? await this.generateRecommendations(validatedQuery, insights, metrics)
      : [];

    const report: BusinessIntelligenceReport = {
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      businessId: validatedQuery.businessId,
      reportType: this.mapAnalysisTypeToReportType(validatedQuery.analysisType),
      title: this.generateReportTitle(validatedQuery.analysisType),
      insights,
      metrics,
      forecasts,
      recommendations,
      generatedAt: new Date(),
      period: this.getAnalysisPeriod(validatedQuery.timeframe),
    };

    // Cache the report
    if (!this.reports.has(validatedQuery.businessId)) {
      this.reports.set(validatedQuery.businessId, []);
    }
    this.reports.get(validatedQuery.businessId)!.push(report);

    return report;
  }

  /**
   * Generate insights based on business context
   */
  private async generateInsights(query: IntelligenceQuery, businessContext: any): Promise<BusinessInsight[]> {
    const insights: BusinessInsight[] = [];

    switch (query.analysisType) {
      case 'performance':
        insights.push(...await this.generatePerformanceInsights(businessContext));
        break;
      case 'growth':
        insights.push(...await this.generateGrowthInsights(businessContext));
        break;
      case 'efficiency':
        insights.push(...await this.generateEfficiencyInsights(businessContext));
        break;
      case 'risk':
        insights.push(...await this.generateRiskInsights(businessContext));
        break;
      case 'opportunity':
        insights.push(...await this.generateOpportunityInsights(businessContext));
        break;
      case 'competitive':
        insights.push(...await this.generateCompetitiveInsights(businessContext));
        break;
    }

    return insights;
  }

  /**
   * Generate performance insights
   */
  private async generatePerformanceInsights(businessContext: any): Promise<BusinessInsight[]> {
    const insights: BusinessInsight[] = [];

    // Revenue performance insight
    if (businessContext.financialSnapshot) {
      const monthlyRevenue = businessContext.financialSnapshot.monthlyRevenue;
      const profitMargin = businessContext.financialSnapshot.profitMargin;

      if (profitMargin < 20) {
        insights.push({
          id: `insight_${Date.now()}_profit`,
          type: 'financial',
          category: 'Profitability',
          title: 'Below Average Profit Margin',
          description: `Your current profit margin of ${profitMargin.toFixed(1)}% is below the industry standard of 20-25%. This indicates potential for pricing optimization or cost reduction.`,
          impact: 'high',
          confidence: 0.85,
          urgency: 'short_term',
          actionable: true,
          data: { currentMargin: profitMargin, industryStandard: 22.5 },
          recommendations: [
            'Review pricing strategy for premium services',
            'Analyze cost structure for optimization opportunities',
            'Implement value-based pricing models'
          ],
          generatedAt: new Date(),
        });
      }

      if (monthlyRevenue > 0) {
        insights.push({
          id: `insight_${Date.now()}_revenue`,
          type: 'financial',
          category: 'Revenue',
          title: 'Revenue Performance Analysis',
          description: `Current monthly revenue of $${monthlyRevenue.toLocaleString()} shows business activity. Focus on maintaining and growing this revenue stream.`,
          impact: 'medium',
          confidence: 0.9,
          urgency: 'long_term',
          actionable: true,
          data: { monthlyRevenue },
          recommendations: [
            'Implement customer retention programs',
            'Explore upselling opportunities',
            'Develop recurring revenue streams'
          ],
          generatedAt: new Date(),
        });
      }
    }

    // Operational performance insight
    if (businessContext.operationalMetrics) {
      const jobsCompleted = businessContext.operationalMetrics.jobsCompleted;
      const bookingRate = businessContext.operationalMetrics.bookingRate;

      if (bookingRate < 60) {
        insights.push({
          id: `insight_${Date.now()}_booking`,
          type: 'operational',
          category: 'Conversion',
          title: 'Low Booking Conversion Rate',
          description: `Your booking rate of ${bookingRate.toFixed(1)}% is below the optimal range of 60-80%. This suggests opportunities to improve your sales process.`,
          impact: 'high',
          confidence: 0.8,
          urgency: 'immediate',
          actionable: true,
          data: { bookingRate, target: 70 },
          recommendations: [
            'Improve follow-up procedures for leads',
            'Implement automated scheduling system',
            'Review pricing competitiveness'
          ],
          generatedAt: new Date(),
        });
      }
    }

    return insights;
  }

  /**
   * Generate growth insights
   */
  private async generateGrowthInsights(businessContext: any): Promise<BusinessInsight[]> {
    const insights: BusinessInsight[] = [];

    // Customer growth insight
    if (businessContext.customerData && businessContext.recentActivity) {
      const totalCustomers = businessContext.customerData.length;
      const newCustomers = businessContext.recentActivity.recentCustomers.length;

      insights.push({
        id: `insight_${Date.now()}_growth`,
        type: 'customer',
        category: 'Customer Acquisition',
        title: 'Customer Growth Analysis',
        description: `You have ${totalCustomers} total customers with ${newCustomers} new acquisitions in the last 30 days. Focus on scaling customer acquisition efforts.`,
        impact: 'medium',
        confidence: 0.75,
        urgency: 'short_term',
        actionable: true,
        data: { totalCustomers, newCustomers, acquisitionRate: (newCustomers / totalCustomers) * 100 },
        recommendations: [
          'Implement referral program to leverage existing customers',
          'Increase digital marketing efforts',
          'Explore partnerships for customer acquisition'
        ],
        generatedAt: new Date(),
      });
    }

    // Service expansion insight
    insights.push({
      id: `insight_${Date.now()}_expansion`,
      type: 'market',
      category: 'Service Expansion',
      title: 'Service Line Expansion Opportunity',
      description: 'Based on customer requests and market trends, consider expanding your service offerings to capture additional revenue from existing customers.',
      impact: 'high',
      confidence: 0.7,
      urgency: 'long_term',
      actionable: true,
      data: { potentialRevenueLift: 25 },
      recommendations: [
        'Survey customers for desired additional services',
        'Analyze competitor service offerings',
        'Develop pilot programs for new services'
      ],
      generatedAt: new Date(),
    });

    return insights;
  }

  /**
   * Generate efficiency insights
   */
  private async generateEfficiencyInsights(businessContext: any): Promise<BusinessInsight[]> {
    const insights: BusinessInsight[] = [];

    // Response time efficiency
    if (businessContext.operationalMetrics) {
      const responseTime = businessContext.operationalMetrics.responseTime;

      if (responseTime > 60) {
        insights.push({
          id: `insight_${Date.now()}_response`,
          type: 'operational',
          category: 'Response Time',
          title: 'Slow Customer Response Time',
          description: `Your average response time of ${responseTime} minutes exceeds the optimal range of 15-30 minutes. Faster responses can significantly improve customer satisfaction and conversion rates.`,
          impact: 'high',
          confidence: 0.9,
          urgency: 'immediate',
          actionable: true,
          data: { currentResponseTime: responseTime, target: 25 },
          recommendations: [
            'Implement automated response system',
            'Set up push notifications for new inquiries',
            'Create response time KPIs for team members'
          ],
          generatedAt: new Date(),
        });
      }
    }

    // Automation opportunity
    insights.push({
      id: `insight_${Date.now()}_automation`,
      type: 'operational',
      category: 'Automation',
      title: 'Process Automation Opportunity',
      description: 'Several manual processes in your workflow can be automated to save time and reduce errors, particularly in scheduling and customer follow-ups.',
      impact: 'medium',
      confidence: 0.8,
      urgency: 'short_term',
      actionable: true,
      data: { potentialTimeSaved: '10-15 hours per week' },
      recommendations: [
        'Implement automated appointment reminders',
        'Set up invoice automation workflows',
        'Create customer follow-up sequences'
      ],
      generatedAt: new Date(),
    });

    return insights;
  }

  /**
   * Generate risk insights
   */
  private async generateRiskInsights(businessContext: any): Promise<BusinessInsight[]> {
    const insights: BusinessInsight[] = [];

    // Customer concentration risk
    if (businessContext.financialSnapshot && businessContext.financialSnapshot.topCustomers) {
      const topCustomerRevenue = businessContext.financialSnapshot.topCustomers[0]?.value || 0;
      const totalRevenue = businessContext.financialSnapshot.monthlyRevenue;
      const concentration = totalRevenue > 0 ? (topCustomerRevenue / totalRevenue) * 100 : 0;

      if (concentration > 30) {
        insights.push({
          id: `insight_${Date.now()}_concentration`,
          type: 'financial',
          category: 'Customer Risk',
          title: 'High Customer Concentration Risk',
          description: `Your top customer represents ${concentration.toFixed(1)}% of revenue, creating dependency risk. Diversifying your customer base will reduce this vulnerability.`,
          impact: 'high',
          confidence: 0.85,
          urgency: 'short_term',
          actionable: true,
          data: { concentration, threshold: 30 },
          recommendations: [
            'Develop customer acquisition strategy',
            'Implement customer retention programs',
            'Diversify service offerings to attract different customer segments'
          ],
          generatedAt: new Date(),
        });
      }
    }

    // Outstanding invoices risk
    if (businessContext.financialSnapshot && businessContext.financialSnapshot.outstandingInvoices > 0) {
      const outstanding = businessContext.financialSnapshot.outstandingInvoices;
      const monthlyRevenue = businessContext.financialSnapshot.monthlyRevenue;
      const outstandingRatio = monthlyRevenue > 0 ? (outstanding / monthlyRevenue) * 100 : 0;

      if (outstandingRatio > 20) {
        insights.push({
          id: `insight_${Date.now()}_collections`,
          type: 'financial',
          category: 'Cash Flow Risk',
          title: 'High Outstanding Invoices',
          description: `Outstanding invoices of $${outstanding.toLocaleString()} represent ${outstandingRatio.toFixed(1)}% of monthly revenue, potentially impacting cash flow.`,
          impact: 'medium',
          confidence: 0.9,
          urgency: 'immediate',
          actionable: true,
          data: { outstanding, ratio: outstandingRatio },
          recommendations: [
            'Implement automated payment reminders',
            'Offer early payment discounts',
            'Review credit terms and collection procedures'
          ],
          generatedAt: new Date(),
        });
      }
    }

    return insights;
  }

  /**
   * Generate opportunity insights
   */
  private async generateOpportunityInsights(businessContext: any): Promise<BusinessInsight[]> {
    const insights: BusinessInsight[] = [];

    // Upselling opportunity
    if (businessContext.customerData) {
      const vipCustomers = businessContext.customerData.filter((c: any) => c.relationship === 'vip').length;
      const totalCustomers = businessContext.customerData.length;

      insights.push({
        id: `insight_${Date.now()}_upsell`,
        type: 'customer',
        category: 'Revenue Optimization',
        title: 'Customer Upselling Opportunity',
        description: `You have ${vipCustomers} VIP customers out of ${totalCustomers} total. These high-value customers represent prime upselling opportunities for premium services.`,
        impact: 'high',
        confidence: 0.8,
        urgency: 'short_term',
        actionable: true,
        data: { vipCustomers, totalCustomers, vipRatio: (vipCustomers / totalCustomers) * 100 },
        recommendations: [
          'Create premium service packages for VIP customers',
          'Implement personalized outreach for high-value clients',
          'Develop loyalty programs with exclusive benefits'
        ],
        generatedAt: new Date(),
      });
    }

    // Digital transformation opportunity
    insights.push({
      id: `insight_${Date.now()}_digital`,
      type: 'operational',
      category: 'Digital Transformation',
      title: 'Digital Transformation Opportunity',
      description: 'Implementing additional digital tools and online presence can expand your market reach and improve customer experience in the modern marketplace.',
      impact: 'medium',
      confidence: 0.75,
      urgency: 'long_term',
      actionable: true,
      data: { marketGrowthPotential: '15-25%' },
      recommendations: [
        'Enhance online presence and SEO',
        'Implement online booking and payment systems',
        'Develop mobile app for customer convenience'
      ],
      generatedAt: new Date(),
    });

    return insights;
  }

  /**
   * Generate competitive insights
   */
  private async generateCompetitiveInsights(_businessContext: any): Promise<BusinessInsight[]> {
    const insights: BusinessInsight[] = [];

    // Market positioning insight
    insights.push({
      id: `insight_${Date.now()}_positioning`,
      type: 'competitive',
      category: 'Market Position',
      title: 'Market Positioning Analysis',
      description: 'Based on industry trends, positioning your business as a technology-forward, customer-centric provider can differentiate you from traditional competitors.',
      impact: 'medium',
      confidence: 0.7,
      urgency: 'long_term',
      actionable: true,
      data: { competitiveAdvantage: 'Technology adoption' },
      recommendations: [
        'Highlight technology advantages in marketing',
        'Showcase customer testimonials and reviews',
        'Develop unique value propositions'
      ],
      generatedAt: new Date(),
    });

    return insights;
  }

  /**
   * Calculate key business metrics
   */
  private async calculateMetrics(query: IntelligenceQuery, businessContext: any): Promise<BusinessMetric[]> {
    const metrics: BusinessMetric[] = [];

    if (businessContext.financialSnapshot) {
      metrics.push({
        id: 'monthly_revenue',
        name: 'Monthly Revenue',
        value: businessContext.financialSnapshot.monthlyRevenue,
        trend: 'stable', // Would calculate from historical data
        unit: 'USD',
        category: 'Financial',
        lastUpdated: new Date(),
      });

      metrics.push({
        id: 'profit_margin',
        name: 'Profit Margin',
        value: businessContext.financialSnapshot.profitMargin,
        target: 25,
        trend: businessContext.financialSnapshot.profitMargin >= 20 ? 'stable' : 'decreasing',
        unit: '%',
        category: 'Financial',
        lastUpdated: new Date(),
      });

      metrics.push({
        id: 'average_job_value',
        name: 'Average Job Value',
        value: businessContext.financialSnapshot.averageJobValue,
        trend: 'stable',
        unit: 'USD',
        category: 'Revenue',
        lastUpdated: new Date(),
      });
    }

    if (businessContext.operationalMetrics) {
      metrics.push({
        id: 'booking_rate',
        name: 'Booking Conversion Rate',
        value: businessContext.operationalMetrics.bookingRate,
        target: 70,
        trend: businessContext.operationalMetrics.bookingRate >= 60 ? 'stable' : 'decreasing',
        unit: '%',
        category: 'Operations',
        lastUpdated: new Date(),
      });

      metrics.push({
        id: 'response_time',
        name: 'Average Response Time',
        value: businessContext.operationalMetrics.responseTime,
        target: 30,
        trend: businessContext.operationalMetrics.responseTime <= 30 ? 'stable' : 'increasing',
        unit: 'minutes',
        category: 'Operations',
        lastUpdated: new Date(),
      });

      metrics.push({
        id: 'customer_satisfaction',
        name: 'Customer Satisfaction',
        value: businessContext.operationalMetrics.customerSatisfaction,
        target: 4.5,
        trend: 'stable',
        unit: 'rating',
        category: 'Customer',
        lastUpdated: new Date(),
      });
    }

    if (businessContext.customerData) {
      metrics.push({
        id: 'total_customers',
        name: 'Total Customers',
        value: businessContext.customerData.length,
        trend: 'increasing',
        unit: 'count',
        category: 'Customer',
        lastUpdated: new Date(),
      });
    }

    return metrics;
  }

  /**
   * Generate forecasts
   */
  private async generateForecasts(_query: IntelligenceQuery, businessContext: any): Promise<BusinessForecast[]> {
    const forecasts: BusinessForecast[] = [];

    // Revenue forecast
    if (businessContext.financialSnapshot) {
      const currentRevenue = businessContext.financialSnapshot.monthlyRevenue;
      
      forecasts.push({
        id: 'revenue_forecast',
        metric: 'Monthly Revenue',
        timeframe: 'monthly',
        predictions: [
          {
            period: 'Next Month',
            value: currentRevenue * 1.05, // 5% growth assumption
            confidence: 0.75,
            factors: ['historical_growth', 'seasonal_trends', 'market_conditions']
          },
          {
            period: 'Next Quarter',
            value: currentRevenue * 1.12, // 12% quarterly growth
            confidence: 0.65,
            factors: ['business_expansion', 'customer_retention', 'market_demand']
          },
        ],
        methodology: 'Historical trend analysis with market adjustment factors',
        accuracy: 0.78,
        generatedAt: new Date(),
      });
    }

    return forecasts;
  }

  /**
   * Generate recommendations
   */
  private async generateRecommendations(
    _query: IntelligenceQuery,
    insights: BusinessInsight[],
    metrics: BusinessMetric[]
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // Extract high-impact recommendations from insights
    insights
      .filter(insight => insight.impact === 'high' && insight.actionable)
      .forEach(insight => {
        recommendations.push(...insight.recommendations);
      });

    // Add metric-based recommendations
    metrics.forEach(metric => {
      if (metric.target && metric.value < metric.target) {
        switch (metric.id) {
          case 'profit_margin':
            recommendations.push('Implement cost reduction initiatives to improve profit margins');
            break;
          case 'booking_rate':
            recommendations.push('Enhance sales process to improve booking conversion rates');
            break;
          case 'response_time':
            recommendations.push('Implement automated response systems to reduce response times');
            break;
        }
      }
    });

    // Remove duplicates and limit to top 10
    return [...new Set(recommendations)].slice(0, 10);
  }

  /**
   * Start periodic insight generation
   */
  private startInsightGeneration(): void {
    // Generate insights every hour for active businesses
    setInterval(() => {
      // This would periodically refresh insights for all businesses
      console.log('Periodic insight generation running...');
    }, 60 * 60 * 1000); // Every hour
  }

  /**
   * Helper methods
   */
  private mapAnalysisTypeToReportType(analysisType: string): BusinessIntelligenceReport['reportType'] {
    const mapping: Record<string, BusinessIntelligenceReport['reportType']> = {
      'performance': 'executive_summary',
      'growth': 'market',
      'efficiency': 'operational',
      'risk': 'financial',
      'opportunity': 'customer',
      'competitive': 'competitive',
    };
    return mapping[analysisType] || 'executive_summary';
  }

  private generateReportTitle(analysisType: string): string {
    const titles: Record<string, string> = {
      'performance': 'Business Performance Analysis',
      'growth': 'Growth Opportunity Assessment',
      'efficiency': 'Operational Efficiency Report',
      'risk': 'Business Risk Analysis',
      'opportunity': 'Revenue Opportunity Report',
      'competitive': 'Competitive Analysis Report',
    };
    return titles[analysisType] || 'Business Intelligence Report';
  }

  private getAnalysisPeriod(timeframe?: string): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();
    
    switch (timeframe) {
      case 'week':
        start.setDate(end.getDate() - 7);
        break;
      case 'quarter':
        start.setMonth(end.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(end.getFullYear() - 1);
        break;
      default: // month
        start.setMonth(end.getMonth() - 1);
    }
    
    return { start, end };
  }

  /**
   * Get cached insights for a business
   */
  getCachedInsights(businessId: string): BusinessInsight[] {
    return this.insights.get(businessId) || [];
  }

  /**
   * Get reports for a business
   */
  getReports(businessId: string): BusinessIntelligenceReport[] {
    return this.reports.get(businessId) || [];
  }
}

// Export the singleton instance
export const businessIntelligence = new BusinessIntelligenceEngine();