'use client';

import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { Card, CardBody, CardHeader, Progress, Chip, Button } from '@heroui/react';
import clsx from 'clsx';

interface CashFlowData {
  period: string;
  inflow: number;
  outflow: number;
  netFlow: number;
  cumulativeFlow: number;
  operatingCashFlow: number;
  investingCashFlow: number;
  financingCashFlow: number;
}

interface CashFlowAnalysisProps {
  data?: CashFlowData[];
  period: string;
  className?: string;
  detailed?: boolean;
}

export function CashFlowAnalysis({ 
  data = [], 
  period, 
  className,
  detailed = false 
}: CashFlowAnalysisProps) {
  // Generate mock data if none provided
  const chartData = data.length > 0 ? data : generateMockCashFlowData(period);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800 dark:text-white mb-2">{label}</p>
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
  const currentData = chartData[chartData.length - 1];
  const totalInflow = chartData.reduce((sum, item) => sum + item.inflow, 0);
  const totalOutflow = chartData.reduce((sum, item) => sum + item.outflow, 0);
  const averageNetFlow = chartData.reduce((sum, item) => sum + item.netFlow, 0) / chartData.length;
  const cashFlowTrend = chartData.length > 1 ? 
    ((currentData.netFlow - chartData[0].netFlow) / Math.abs(chartData[0].netFlow)) * 100 : 0;

  const cashFlowHealth = averageNetFlow > 0 ? 'Positive' : 'Negative';
  const healthColor = averageNetFlow > 0 ? 'success' : 'danger';

  return (
    <div className={clsx("w-full", className)}>
      <div className="space-y-6">
        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <p className="text-sm text-green-600 dark:text-green-400">Total Inflow</p>
            <p className="text-xl font-bold text-green-700 dark:text-green-300">
              {formatCurrency(totalInflow)}
            </p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <p className="text-sm text-red-600 dark:text-red-400">Total Outflow</p>
            <p className="text-xl font-bold text-red-700 dark:text-red-300">
              {formatCurrency(totalOutflow)}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <p className="text-sm text-blue-600 dark:text-blue-400">Net Cash Flow</p>
            <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
              {formatCurrency(currentData.netFlow)}
            </p>
            <Chip 
              color={healthColor}
              variant="flat"
              size="sm"
              className="mt-1"
            >
              {cashFlowHealth}
            </Chip>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <p className="text-sm text-purple-600 dark:text-purple-400">Cumulative Flow</p>
            <p className="text-xl font-bold text-purple-700 dark:text-purple-300">
              {formatCurrency(currentData.cumulativeFlow)}
            </p>
            <Chip 
              color={cashFlowTrend >= 0 ? 'success' : 'danger'}
              variant="flat"
              size="sm"
              className="mt-1"
            >
              {cashFlowTrend >= 0 ? '+' : ''}{cashFlowTrend.toFixed(1)}%
            </Chip>
          </div>
        </div>

        {/* Main Chart */}
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
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
              
              <ReferenceLine y={0} stroke="#666" strokeDasharray="2 2" />
              
              <Bar
                dataKey="inflow"
                fill="#10b981"
                name="Cash Inflow"
                opacity={0.8}
              />
              <Bar
                dataKey="outflow"
                fill="#ef4444"
                name="Cash Outflow"
                opacity={0.8}
              />
              <Line
                type="monotone"
                dataKey="netFlow"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4 }}
                name="Net Cash Flow"
              />
              <Line
                type="monotone"
                dataKey="cumulativeFlow"
                stroke="#8b5cf6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3 }}
                name="Cumulative Flow"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Analysis */}
        {detailed && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cash Flow Breakdown */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Cash Flow Breakdown</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Operating Cash Flow</span>
                    <span className="font-medium">{formatCurrency(currentData.operatingCashFlow)}</span>
                  </div>
                  <Progress 
                    value={Math.abs(currentData.operatingCashFlow) / Math.abs(currentData.netFlow) * 100} 
                    color="success"
                    className="w-full"
                  />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Investing Cash Flow</span>
                    <span className="font-medium">{formatCurrency(currentData.investingCashFlow)}</span>
                  </div>
                  <Progress 
                    value={Math.abs(currentData.investingCashFlow) / Math.abs(currentData.netFlow) * 100} 
                    color="warning"
                    className="w-full"
                  />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Financing Cash Flow</span>
                    <span className="font-medium">{formatCurrency(currentData.financingCashFlow)}</span>
                  </div>
                  <Progress 
                    value={Math.abs(currentData.financingCashFlow) / Math.abs(currentData.netFlow) * 100} 
                    color="primary"
                    className="w-full"
                  />
                </div>
              </CardBody>
            </Card>

            {/* Cash Flow Insights */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Cash Flow Insights</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Cash Flow Velocity
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Your cash conversion cycle is {Math.round(Math.random() * 30 + 15)} days
                    </p>
                  </div>
                  
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">
                      Operating Efficiency
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Strong operating cash flow indicates healthy business operations
                    </p>
                  </div>
                  
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                      Investment Activity
                    </p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                      Consider optimizing capital expenditures for better cash flow
                    </p>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      color="primary" 
                      variant="light" 
                      size="sm"
                      className="w-full"
                    >
                      View Detailed Cash Flow Report
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// Generate mock cash flow data
function generateMockCashFlowData(period: string): CashFlowData[] {
  const now = new Date();
  const data: CashFlowData[] = [];
  
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
  
  let cumulativeFlow = 0;
  
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
    
    // Generate realistic cash flow data
    const baseInflow = 35000 + (Math.sin(i * 0.1) * 8000);
    const inflow = Math.round(baseInflow + (Math.random() - 0.5) * 5000);
    
    const baseOutflow = 28000 + (Math.sin(i * 0.15) * 6000);
    const outflow = Math.round(baseOutflow + (Math.random() - 0.5) * 4000);
    
    const netFlow = inflow - outflow;
    cumulativeFlow += netFlow;
    
    // Break down cash flows
    const operatingCashFlow = Math.round(netFlow * (0.7 + Math.random() * 0.2));
    const investingCashFlow = Math.round(netFlow * (0.1 + Math.random() * 0.1)) * -1;
    const financingCashFlow = netFlow - operatingCashFlow - investingCashFlow;
    
    data.push({
      period: date.toLocaleDateString('en-US', formatOptions),
      inflow,
      outflow,
      netFlow,
      cumulativeFlow,
      operatingCashFlow,
      investingCashFlow,
      financingCashFlow,
    });
  }
  
  return data;
}