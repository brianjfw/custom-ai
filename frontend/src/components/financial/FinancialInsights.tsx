'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Button, Chip, Progress, Avatar, Spinner } from '@heroui/react';
import { trpc } from '@/lib/trpc';
import clsx from 'clsx';

interface FinancialMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  cashFlow: number;
  outstandingInvoices: number;
  avgInvoiceValue: number;
  collectionRate: number;
}

interface AIInsight {
  id: string;
  type: 'opportunity' | 'risk' | 'trend' | 'recommendation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  actionable: boolean;
  category: string;
  estimatedValue?: number;
  timeframe?: string;
  priority: number;
}

interface FinancialInsightsProps {
  metrics?: FinancialMetrics;
  period: string;
  className?: string;
}

export function FinancialInsights({ metrics, period, className }: FinancialInsightsProps) {
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Query AI insights from the Context Engine
  // TODO: Implement when AI endpoints are available
  const aiInsights: AIInsight[] = [];
  const isLoading = false;
  const refetch = async () => {};

  // Generate new insights
  // TODO: Implement when AI endpoints are available
  const generateInsightsMutation = {
    mutateAsync: async (params?: any) => {}
  };

  const handleGenerateInsights = async () => {
    if (!metrics) return;
    
    setIsGenerating(true);
    try {
      await generateInsightsMutation.mutateAsync({
        metrics,
        period,
        includeForecasts: true,
        analyzeRisks: true,
      });
      await refetch();
    } catch (error) {
      console.error('Failed to generate insights:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Get insight color based on type
  const getInsightColor = (type: AIInsight['type']) => {
    switch (type) {
      case 'opportunity': return 'success';
      case 'risk': return 'danger';
      case 'trend': return 'primary';
      case 'recommendation': return 'warning';
      default: return 'default';
    }
  };

  // Get impact color
  const getImpactColor = (impact: AIInsight['impact']) => {
    switch (impact) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  // Sort insights by priority and impact
  const sortedInsights = aiInsights?.sort((a: AIInsight, b: AIInsight) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    const impactOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
    return impactOrder[b.impact] - impactOrder[a.impact];
  }) || [];

  // Mock insights if none available
  const mockInsights: AIInsight[] = [
    {
      id: '1',
      type: 'opportunity',
      title: 'Revenue Optimization Opportunity',
      description: 'Your profit margins have increased by 12% this quarter. Consider raising prices for premium services to capitalize on this efficiency gain.',
      impact: 'high',
      confidence: 87,
      actionable: true,
      category: 'Revenue',
      estimatedValue: 15000,
      timeframe: '30 days',
      priority: 1,
    },
    {
      id: '2',
      type: 'risk',
      title: 'Cash Flow Warning',
      description: 'Outstanding invoices have increased by 35% compared to last month. This could impact cash flow if not addressed.',
      impact: 'medium',
      confidence: 92,
      actionable: true,
      category: 'Cash Flow',
      timeframe: '14 days',
      priority: 2,
    },
    {
      id: '3',
      type: 'trend',
      title: 'Seasonal Revenue Pattern',
      description: 'Analysis shows a 23% revenue increase during Q4. Plan resource allocation and inventory accordingly.',
      impact: 'medium',
      confidence: 78,
      actionable: true,
      category: 'Forecasting',
      timeframe: '90 days',
      priority: 3,
    },
    {
      id: '4',
      type: 'recommendation',
      title: 'Expense Optimization',
      description: 'Your operating expenses are 8% higher than industry average. Consider reviewing vendor contracts and subscription services.',
      impact: 'medium',
      confidence: 85,
      actionable: true,
      category: 'Expenses',
      estimatedValue: 8500,
      timeframe: '60 days',
      priority: 4,
    },
  ];

  const insights = sortedInsights.length > 0 ? sortedInsights : mockInsights;

  return (
    <div className={clsx("w-full", className)}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              AI Financial Insights
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              AI-powered analysis of your financial performance
            </p>
          </div>
          <Button
            color="primary"
            variant="light"
            onClick={handleGenerateInsights}
            isLoading={isGenerating}
            disabled={!metrics}
          >
            {isGenerating ? 'Generating...' : 'Refresh Insights'}
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center h-48">
            <Spinner size="lg" color="primary" />
          </div>
        )}

        {/* Insights Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                         {insights.map((insight: AIInsight) => (
              <Card 
                key={insight.id} 
                className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                isPressable
                onPress={() => setSelectedInsight(insight)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start w-full">
                    <div className="flex items-center gap-3">
                      <Avatar
                        size="sm"
                        className={clsx(
                          "text-white",
                          insight.type === 'opportunity' && "bg-green-500",
                          insight.type === 'risk' && "bg-red-500",
                          insight.type === 'trend' && "bg-blue-500",
                          insight.type === 'recommendation' && "bg-yellow-500"
                        )}
                      >
                        {insight.type === 'opportunity' && '📈'}
                        {insight.type === 'risk' && '⚠️'}
                        {insight.type === 'trend' && '📊'}
                        {insight.type === 'recommendation' && '💡'}
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-white">
                          {insight.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {insight.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Chip
                        color={getInsightColor(insight.type)}
                        variant="flat"
                        size="sm"
                      >
                        {insight.type}
                      </Chip>
                      <Chip
                        color={getImpactColor(insight.impact)}
                        variant="dot"
                        size="sm"
                      >
                        {insight.impact} impact
                      </Chip>
                    </div>
                  </div>
                </CardHeader>
                <CardBody className="pt-0">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {insight.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">Confidence:</span>
                        <Progress 
                          value={insight.confidence} 
                          size="sm" 
                          color="primary"
                          className="w-16"
                        />
                        <span className="text-xs text-gray-500">{insight.confidence}%</span>
                      </div>
                      {insight.timeframe && (
                        <span className="text-xs text-gray-500">
                          {insight.timeframe}
                        </span>
                      )}
                    </div>
                    {insight.estimatedValue && (
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {formatCurrency(insight.estimatedValue)}
                      </span>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {/* Detailed Insight Modal */}
        {selectedInsight && (
          <Card className="border-2 border-primary-200 dark:border-primary-800">
            <CardHeader>
              <div className="flex justify-between items-start w-full">
                <div className="flex items-center gap-3">
                  <Avatar
                    size="md"
                    className={clsx(
                      "text-white",
                      selectedInsight.type === 'opportunity' && "bg-green-500",
                      selectedInsight.type === 'risk' && "bg-red-500",
                      selectedInsight.type === 'trend' && "bg-blue-500",
                      selectedInsight.type === 'recommendation' && "bg-yellow-500"
                    )}
                  >
                    {selectedInsight.type === 'opportunity' && '📈'}
                    {selectedInsight.type === 'risk' && '⚠️'}
                    {selectedInsight.type === 'trend' && '📊'}
                    {selectedInsight.type === 'recommendation' && '💡'}
                  </Avatar>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                      {selectedInsight.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedInsight.category} • {selectedInsight.type}
                    </p>
                  </div>
                </div>
                <Button
                  variant="light"
                  size="sm"
                  onClick={() => setSelectedInsight(null)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  {selectedInsight.description}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Impact</p>
                    <Chip color={getImpactColor(selectedInsight.impact)} variant="flat">
                      {selectedInsight.impact}
                    </Chip>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Confidence</p>
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {selectedInsight.confidence}%
                    </p>
                  </div>
                  {selectedInsight.estimatedValue && (
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Estimated Value</p>
                      <p className="font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(selectedInsight.estimatedValue)}
                      </p>
                    </div>
                  )}
                  {selectedInsight.timeframe && (
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Timeframe</p>
                      <p className="font-semibold text-gray-800 dark:text-white">
                        {selectedInsight.timeframe}
                      </p>
                    </div>
                  )}
                </div>
                
                {selectedInsight.actionable && (
                  <div className="pt-4 border-t">
                    <Button color="primary" className="w-full">
                      Take Action
                    </Button>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}