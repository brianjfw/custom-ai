'use client';

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Card, CardBody, CardHeader, Tabs, Tab, Progress, Chip, Button, Select, SelectItem } from '@heroui/react';
import clsx from 'clsx';

interface RevenueData {
  period: string;
  revenue: number;
  projectedRevenue?: number;
  recurringRevenue: number;
  oneTimeRevenue: number;
  invoiceCount: number;
  avgInvoiceValue: number;
}

interface InvoiceStats {
  total: number;
  paid: number;
  outstanding: number;
  overdue: number;
  avgPaymentDays: number;
  collectionRate: number;
}

interface RevenueSource {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface RevenueTrackerProps {
  data?: RevenueData[];
  period: string;
  invoiceStats?: InvoiceStats;
  className?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function RevenueTracker({ 
  data = [], 
  period, 
  invoiceStats,
  className 
}: RevenueTrackerProps) {
  const [activeTab, setActiveTab] = useState<string>('trends');
  const [selectedMetric, setSelectedMetric] = useState<string>('revenue');

  // Generate mock data if none provided
  const chartData = data.length > 0 ? data : generateMockRevenueData(period);
  const mockInvoiceStats = invoiceStats || generateMockInvoiceStats();

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

  // Calculate metrics
  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
  const avgRevenue = totalRevenue / chartData.length;
  const currentRevenue = chartData[chartData.length - 1]?.revenue || 0;
  const previousRevenue = chartData[chartData.length - 2]?.revenue || 0;
  const revenueGrowth = previousRevenue ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

  const recurringRevenue = chartData.reduce((sum, item) => sum + item.recurringRevenue, 0);
  const oneTimeRevenue = chartData.reduce((sum, item) => sum + item.oneTimeRevenue, 0);
  const recurringPercentage = (recurringRevenue / totalRevenue) * 100;

  // Revenue sources mock data
  const revenueSources: RevenueSource[] = [
    { name: 'Services', value: totalRevenue * 0.6, percentage: 60, color: '#0088FE' },
    { name: 'Products', value: totalRevenue * 0.25, percentage: 25, color: '#00C49F' },
    { name: 'Subscriptions', value: totalRevenue * 0.1, percentage: 10, color: '#FFBB28' },
    { name: 'Other', value: totalRevenue * 0.05, percentage: 5, color: '#FF8042' },
  ];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className={clsx("w-full", className)}>
      <div className="space-y-6">
        {/* Revenue Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardBody>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm opacity-90">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="text-right">
                  <Chip 
                    color={revenueGrowth >= 0 ? 'success' : 'danger'}
                    variant="flat"
                    size="sm"
                  >
                    {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
                  </Chip>
                </div>
              </div>
            </CardBody>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardBody>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm opacity-90">Recurring Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(recurringRevenue)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-90">{recurringPercentage.toFixed(1)}%</p>
                </div>
              </div>
            </CardBody>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardBody>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm opacity-90">Avg Invoice Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(avgRevenue)}</p>
                </div>
              </div>
            </CardBody>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardBody>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm opacity-90">Collection Rate</p>
                  <p className="text-2xl font-bold">{mockInvoiceStats.collectionRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center w-full">
              <Tabs
                aria-label="Revenue Analytics"
                selectedKey={activeTab}
                onSelectionChange={(key) => setActiveTab(key as string)}
                variant="underlined"
              >
                <Tab key="trends" title="Revenue Trends" />
                <Tab key="sources" title="Revenue Sources" />
                <Tab key="invoices" title="Invoice Analytics" />
                <Tab key="forecasting" title="Forecasting" />
              </Tabs>
            </div>
          </CardHeader>
          <CardBody>
            <div className="min-h-96">
              {activeTab === 'trends' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                                         <Select
                       label="Metric"
                       selectedKeys={[selectedMetric]}
                       onSelectionChange={(keys) => setSelectedMetric(Array.from(keys)[0] as string)}
                       className="w-48"
                     >
                       <SelectItem key="revenue">Total Revenue</SelectItem>
                       <SelectItem key="recurring">Recurring Revenue</SelectItem>
                       <SelectItem key="oneTime">One-time Revenue</SelectItem>
                       <SelectItem key="invoiceCount">Invoice Count</SelectItem>
                     </Select>
                  </div>
                  
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="period" className="text-sm" />
                        <YAxis 
                          tickFormatter={selectedMetric === 'invoiceCount' ? (value) => value.toString() : formatCurrency}
                          className="text-sm"
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        
                        {selectedMetric === 'revenue' && (
                          <>
                            <Line
                              type="monotone"
                              dataKey="revenue"
                              stroke="#3b82f6"
                              strokeWidth={3}
                              dot={{ r: 4 }}
                              name="Revenue"
                            />
                            <Line
                              type="monotone"
                              dataKey="projectedRevenue"
                              stroke="#3b82f6"
                              strokeWidth={2}
                              strokeDasharray="5 5"
                              dot={{ r: 3 }}
                              name="Projected"
                            />
                          </>
                        )}
                        
                        {selectedMetric === 'recurring' && (
                          <Line
                            type="monotone"
                            dataKey="recurringRevenue"
                            stroke="#10b981"
                            strokeWidth={3}
                            dot={{ r: 4 }}
                            name="Recurring Revenue"
                          />
                        )}
                        
                        {selectedMetric === 'oneTime' && (
                          <Line
                            type="monotone"
                            dataKey="oneTimeRevenue"
                            stroke="#f59e0b"
                            strokeWidth={3}
                            dot={{ r: 4 }}
                            name="One-time Revenue"
                          />
                        )}
                        
                        {selectedMetric === 'invoiceCount' && (
                          <Line
                            type="monotone"
                            dataKey="invoiceCount"
                            stroke="#8b5cf6"
                            strokeWidth={3}
                            dot={{ r: 4 }}
                            name="Invoice Count"
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {activeTab === 'sources' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={revenueSources}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {revenueSources.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">Revenue Breakdown</h4>
                    {revenueSources.map((source, index) => (
                      <div key={source.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm">{source.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatCurrency(source.value)}</p>
                          <p className="text-xs text-gray-500">{source.percentage}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'invoices' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-l-4 border-blue-500">
                      <CardBody>
                        <p className="text-sm text-gray-600">Total Invoices</p>
                        <p className="text-2xl font-bold">{mockInvoiceStats.total}</p>
                      </CardBody>
                    </Card>
                    <Card className="border-l-4 border-green-500">
                      <CardBody>
                        <p className="text-sm text-gray-600">Paid</p>
                        <p className="text-2xl font-bold">{mockInvoiceStats.paid}</p>
                      </CardBody>
                    </Card>
                    <Card className="border-l-4 border-yellow-500">
                      <CardBody>
                        <p className="text-sm text-gray-600">Outstanding</p>
                        <p className="text-2xl font-bold">{mockInvoiceStats.outstanding}</p>
                      </CardBody>
                    </Card>
                    <Card className="border-l-4 border-red-500">
                      <CardBody>
                        <p className="text-sm text-gray-600">Overdue</p>
                        <p className="text-2xl font-bold">{mockInvoiceStats.overdue}</p>
                      </CardBody>
                    </Card>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <h4 className="font-semibold">Payment Performance</h4>
                      </CardHeader>
                      <CardBody>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm">
                              <span>Collection Rate</span>
                              <span>{mockInvoiceStats.collectionRate.toFixed(1)}%</span>
                            </div>
                            <Progress 
                              value={mockInvoiceStats.collectionRate} 
                              color="success" 
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm">
                              <span>Average Payment Time</span>
                              <span>{mockInvoiceStats.avgPaymentDays} days</span>
                            </div>
                            <Progress 
                              value={Math.min(mockInvoiceStats.avgPaymentDays / 30 * 100, 100)} 
                              color="warning" 
                              className="mt-2"
                            />
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <h4 className="font-semibold">Invoice Recommendations</h4>
                      </CardHeader>
                      <CardBody>
                        <div className="space-y-3">
                          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                              Follow up on overdue invoices
                            </p>
                            <p className="text-xs text-yellow-600 dark:text-yellow-400">
                              {mockInvoiceStats.overdue} invoices are overdue
                            </p>
                          </div>
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                              Optimize payment terms
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                              Consider offering early payment discounts
                            </p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === 'forecasting' && (
                <div className="space-y-6">
                  <h4 className="font-semibold">Revenue Forecasting</h4>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="period" className="text-sm" />
                        <YAxis tickFormatter={formatCurrency} className="text-sm" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                          name="Actual Revenue"
                        />
                        <Line
                          type="monotone"
                          dataKey="projectedRevenue"
                          stroke="#10b981"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={{ r: 3 }}
                          name="Projected Revenue"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <Card>
                      <CardBody className="text-center">
                        <p className="text-sm text-gray-600">Next Month</p>
                        <p className="text-xl font-bold text-green-600">
                          {formatCurrency(currentRevenue * 1.08)}
                        </p>
                        <p className="text-xs text-gray-500">+8% projected growth</p>
                      </CardBody>
                    </Card>
                    <Card>
                      <CardBody className="text-center">
                        <p className="text-sm text-gray-600">Next Quarter</p>
                        <p className="text-xl font-bold text-blue-600">
                          {formatCurrency(currentRevenue * 3.2)}
                        </p>
                        <p className="text-xs text-gray-500">Based on trends</p>
                      </CardBody>
                    </Card>
                    <Card>
                      <CardBody className="text-center">
                        <p className="text-sm text-gray-600">Confidence</p>
                        <p className="text-xl font-bold text-purple-600">82%</p>
                        <p className="text-xs text-gray-500">Forecast accuracy</p>
                      </CardBody>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

// Generate mock revenue data
function generateMockRevenueData(period: string): RevenueData[] {
  const now = new Date();
  const data: RevenueData[] = [];
  
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
    
    const baseRevenue = 45000 + (Math.sin(i * 0.1) * 8000);
    const revenue = Math.round(baseRevenue + (Math.random() - 0.5) * 5000);
    
    const recurringRevenue = Math.round(revenue * (0.6 + Math.random() * 0.2));
    const oneTimeRevenue = revenue - recurringRevenue;
    
    const invoiceCount = Math.round(15 + Math.random() * 10);
    const avgInvoiceValue = Math.round(revenue / invoiceCount);
    
    const projectedRevenue = i === 0 ? Math.round(revenue * 1.15) : undefined;
    
    data.push({
      period: date.toLocaleDateString('en-US', formatOptions),
      revenue,
      projectedRevenue,
      recurringRevenue,
      oneTimeRevenue,
      invoiceCount,
      avgInvoiceValue,
    });
  }
  
  return data;
}

// Generate mock invoice stats
function generateMockInvoiceStats(): InvoiceStats {
  const total = 145;
  const paid = 120;
  const outstanding = 18;
  const overdue = 7;
  const avgPaymentDays = 22;
  const collectionRate = (paid / total) * 100;
  
  return {
    total,
    paid,
    outstanding,
    overdue,
    avgPaymentDays,
    collectionRate,
  };
}