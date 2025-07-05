'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { Card, CardBody, CardHeader, Chip } from '@heroui/react';
import clsx from 'clsx';

interface ProfitLossData {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
  profitMargin: number;
  projectedRevenue?: number;
  projectedExpenses?: number;
  projectedProfit?: number;
}

interface ProfitLossChartProps {
  data?: ProfitLossData[];
  period: string;
  className?: string;
  showProjected?: boolean;
}

export function ProfitLossChart({ 
  data = [], 
  period, 
  className,
  showProjected = true 
}: ProfitLossChartProps) {
  // Generate mock data if none provided
  const chartData = data.length > 0 ? data : generateMockData(period);

  // Format currency for tooltip
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800 dark:text-white">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Calculate key metrics
  const currentPeriodData = chartData[chartData.length - 1];
  const previousPeriodData = chartData[chartData.length - 2];
  const revenueGrowth = previousPeriodData 
    ? ((currentPeriodData.revenue - previousPeriodData.revenue) / previousPeriodData.revenue) * 100
    : 0;

  return (
    <div className={clsx("w-full", className)}>
      <div className="space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
            <p className="text-sm text-green-600 dark:text-green-400">Revenue</p>
            <p className="text-lg font-bold text-green-700 dark:text-green-300">
              {formatCurrency(currentPeriodData.revenue)}
            </p>
            <Chip 
              color={revenueGrowth >= 0 ? 'success' : 'danger'}
              variant="flat"
              size="sm"
              className="mt-1"
            >
              {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
            </Chip>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
            <p className="text-sm text-red-600 dark:text-red-400">Expenses</p>
            <p className="text-lg font-bold text-red-700 dark:text-red-300">
              {formatCurrency(currentPeriodData.expenses)}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <p className="text-sm text-blue-600 dark:text-blue-400">Net Profit</p>
            <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
              {formatCurrency(currentPeriodData.profit)}
            </p>
            <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
              {currentPeriodData.profitMargin.toFixed(1)}% margin
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="period" 
                className="text-gray-500 text-sm"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tickFormatter={formatCurrency}
                className="text-gray-500 text-sm"
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                name="Revenue"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#colorExpenses)"
                name="Expenses"
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4 }}
                name="Net Profit"
              />
              
              {showProjected && (
                <>
                  <Line
                    type="monotone"
                    dataKey="projectedRevenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 3 }}
                    name="Projected Revenue"
                  />
                  <Line
                    type="monotone"
                    dataKey="projectedExpenses"
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 3 }}
                    name="Projected Expenses"
                  />
                </>
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// Generate mock data based on period
function generateMockData(period: string): ProfitLossData[] {
  const now = new Date();
  const data: ProfitLossData[] = [];
  
  // Determine number of data points and date formatting
  let dataPoints = 12;
  let formatOptions: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric' };
  
  switch (period) {
    case 'today':
      dataPoints = 24;
      formatOptions = { hour: 'numeric', hour12: true };
      break;
    case 'week':
      dataPoints = 7;
      formatOptions = { weekday: 'short' };
      break;
    case 'month':
      dataPoints = 30;
      formatOptions = { day: 'numeric' };
      break;
    case 'quarter':
      dataPoints = 12;
      formatOptions = { month: 'short' };
      break;
    case 'year':
      dataPoints = 12;
      formatOptions = { month: 'short', year: 'numeric' };
      break;
  }
  
  // Generate realistic financial data
  for (let i = dataPoints - 1; i >= 0; i--) {
    const date = new Date(now);
    
    switch (period) {
      case 'today':
        date.setHours(date.getHours() - i);
        break;
      case 'week':
        date.setDate(date.getDate() - i);
        break;
      case 'month':
        date.setDate(date.getDate() - i);
        break;
      case 'quarter':
        date.setMonth(date.getMonth() - i);
        break;
      case 'year':
        date.setMonth(date.getMonth() - i);
        break;
    }
    
    // Generate realistic revenue data with seasonal trends
    const baseRevenue = 50000 + (Math.sin(i * 0.1) * 10000);
    const seasonalMultiplier = 1 + (Math.sin(i * 0.2) * 0.3);
    const revenue = Math.round(baseRevenue * seasonalMultiplier + (Math.random() - 0.5) * 5000);
    
    // Expenses are typically 60-80% of revenue
    const expenseRatio = 0.65 + (Math.random() * 0.15);
    const expenses = Math.round(revenue * expenseRatio);
    
    const profit = revenue - expenses;
    const profitMargin = (profit / revenue) * 100;
    
    // Add projected data for future periods
    const projectedRevenue = i === 0 ? Math.round(revenue * 1.15) : undefined;
    const projectedExpenses = i === 0 ? Math.round(expenses * 1.10) : undefined;
    const projectedProfit = projectedRevenue && projectedExpenses ? projectedRevenue - projectedExpenses : undefined;
    
    data.push({
      period: date.toLocaleDateString('en-US', formatOptions),
      revenue,
      expenses,
      profit,
      profitMargin,
      projectedRevenue,
      projectedExpenses,
      projectedProfit,
    });
  }
  
  return data;
}