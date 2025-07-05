'use client';

import React, { useState } from 'react';
import { Card, CardBody, CardHeader, Button, Tabs, Tab, Spinner, Chip, Divider } from '@heroui/react';
import { trpc } from '@/lib/trpc';
import { GlassmorphismCard } from '@/components/ui/GlassmorphismCard';
import { ProfitLossChart } from './ProfitLossChart';
import { CashFlowAnalysis } from './CashFlowAnalysis';
import { FinancialInsights } from './FinancialInsights';
import { RevenueTracker } from './RevenueTracker';
import clsx from 'clsx';

// Types for financial data
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

interface TimeFilter {
  period: 'today' | 'week' | 'month' | 'quarter' | 'year';
  label: string;
}

const TIME_FILTERS: TimeFilter[] = [
  { period: 'today', label: 'Today' },
  { period: 'week', label: 'This Week' },
  { period: 'month', label: 'This Month' },
  { period: 'quarter', label: 'This Quarter' },
  { period: 'year', label: 'This Year' },
];

export function FinancialDashboard() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [timeFilter, setTimeFilter] = useState<TimeFilter['period']>('month');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // tRPC queries for financial data
  const { data: financialMetrics, isLoading: isLoadingMetrics, refetch: refetchMetrics } = trpc.financial.getMetrics.useQuery(
    { period: timeFilter },
    { 
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchInterval: 1000 * 60 * 10, // 10 minutes
    }
  );

  const { data: revenueData, isLoading: isLoadingRevenue } = trpc.financial.getRevenueTrend.useQuery(
    { period: timeFilter, includeProjected: true }
  );

  const { data: expenseData, isLoading: isLoadingExpenses } = trpc.financial.getExpenseBreakdown.useQuery(
    { period: timeFilter }
  );

  const { data: cashFlowData, isLoading: isLoadingCashFlow } = trpc.financial.getCashFlowHistory.useQuery(
    { period: timeFilter }
  );

  const { data: invoiceStats, isLoading: isLoadingInvoices } = trpc.financial.getInvoiceStats.useQuery(
    { period: timeFilter }
  );

  // Loading state
  const isLoading = isLoadingMetrics || isLoadingRevenue || isLoadingExpenses || isLoadingCashFlow || isLoadingInvoices;

  // Refresh all data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetchMetrics(),
      // Add other refetch calls when available
    ]);
    setIsRefreshing(false);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Get status color for metrics
  const getStatusColor = (value: number, threshold: number = 0) => {
    if (value >= threshold) return 'success';
    if (value >= threshold * 0.8) return 'warning';
    return 'danger';
  };

  // Render metric card
  const renderMetricCard = (title: string, value: number, format: 'currency' | 'percentage' | 'number', trend?: number) => (
    <GlassmorphismCard className="p-4 hover:scale-105 transition-transform duration-200">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
            {format === 'currency' ? formatCurrency(value) : 
             format === 'percentage' ? formatPercentage(value) : 
             value.toLocaleString()}
          </p>
        </div>
        {trend !== undefined && (
          <Chip 
            color={getStatusColor(trend)}
            variant="flat"
            size="sm"
            className="ml-2"
          >
            {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
          </Chip>
        )}
      </div>
    </GlassmorphismCard>
  );

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Financial Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time financial intelligence and insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleRefresh}
            isLoading={isRefreshing}
            variant="light"
            className="glass-button"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
      </div>

      {/* Time Filter */}
      <GlassmorphismCard className="p-4">
        <div className="flex flex-wrap gap-2">
          {TIME_FILTERS.map((filter) => (
            <Button
              key={filter.period}
              variant={timeFilter === filter.period ? 'solid' : 'light'}
              color={timeFilter === filter.period ? 'primary' : 'default'}
              size="sm"
              onClick={() => setTimeFilter(filter.period)}
              className={clsx(
                'glass-button',
                timeFilter === filter.period && 'glass-button-primary'
              )}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </GlassmorphismCard>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" color="primary" />
        </div>
      )}

      {/* Main Content */}
      {!isLoading && (
        <>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {renderMetricCard('Total Revenue', financialMetrics?.totalRevenue || 0, 'currency', 12.5)}
            {renderMetricCard('Net Profit', financialMetrics?.netProfit || 0, 'currency', 8.2)}
            {renderMetricCard('Profit Margin', financialMetrics?.profitMargin || 0, 'percentage', 2.1)}
            {renderMetricCard('Cash Flow', financialMetrics?.cashFlow || 0, 'currency', -5.3)}
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {renderMetricCard('Outstanding Invoices', financialMetrics?.outstandingInvoices || 0, 'currency')}
            {renderMetricCard('Avg Invoice Value', financialMetrics?.avgInvoiceValue || 0, 'currency')}
            {renderMetricCard('Collection Rate', financialMetrics?.collectionRate || 0, 'percentage')}
            {renderMetricCard('Total Expenses', financialMetrics?.totalExpenses || 0, 'currency')}
          </div>

          <Divider className="my-6" />

          {/* Detailed Analytics Tabs */}
          <GlassmorphismCard>
            <CardHeader className="pb-0">
              <Tabs
                aria-label="Financial Analytics"
                selectedKey={activeTab}
                onSelectionChange={(key) => setActiveTab(key as string)}
                variant="underlined"
                classNames={{
                  tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                  cursor: "w-full bg-primary",
                  tab: "max-w-fit px-0 h-12",
                  tabContent: "group-data-[selected=true]:text-primary"
                }}
              >
                <Tab key="overview" title="Overview" />
                <Tab key="revenue" title="Revenue Analysis" />
                <Tab key="expenses" title="Expense Breakdown" />
                <Tab key="cashflow" title="Cash Flow" />
                <Tab key="insights" title="AI Insights" />
              </Tabs>
            </CardHeader>
            <CardBody>
              <div className="min-h-96">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Profit & Loss Overview</h3>
                        <ProfitLossChart
                          data={revenueData}
                          period={timeFilter}
                          className="h-64"
                        />
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Cash Flow Trend</h3>
                        <CashFlowAnalysis
                          data={cashFlowData}
                          period={timeFilter}
                          className="h-64"
                        />
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'revenue' && (
                  <RevenueTracker
                    data={revenueData}
                    period={timeFilter}
                    invoiceStats={invoiceStats}
                  />
                )}
                {activeTab === 'expenses' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Expense Analysis</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="h-64 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center">
                        <p className="text-gray-500">Expense breakdown chart coming soon</p>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-medium">Top Expense Categories</h4>
                        <div className="space-y-2">
                          {expenseData?.categories?.map((category, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <span className="text-sm">{category.name}</span>
                              <span className="text-sm font-medium">{formatCurrency(category.amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'cashflow' && (
                  <CashFlowAnalysis
                    data={cashFlowData}
                    period={timeFilter}
                    detailed={true}
                  />
                )}
                {activeTab === 'insights' && (
                  <FinancialInsights
                    metrics={financialMetrics}
                    period={timeFilter}
                  />
                )}
              </div>
            </CardBody>
          </GlassmorphismCard>
        </>
      )}
    </div>
  );
}