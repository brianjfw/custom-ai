'use client';

import React from 'react';
import { Button, Chip } from '@heroui/react';
import { 
  CurrencyDollarIcon, 
  UsersIcon, 
  ArrowTrendingUpIcon,
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import DualPaneLayout from '@/components/layout/DualPaneLayout';
import GlassmorphismCard from '@/components/ui/GlassmorphismCard';
import { UserProfile } from '@/components/ui/UserProfile';

// Sample business metrics data
const businessMetrics = [
  {
    id: 'revenue',
    title: 'Monthly Revenue',
    value: '$12,450',
    change: '+18.2%',
    trend: 'up',
    icon: CurrencyDollarIcon,
    color: 'success'
  },
  {
    id: 'customers',
    title: 'Active Customers',
    value: '247',
    change: '+12.5%',
    trend: 'up',
    icon: UsersIcon,
    color: 'primary'
  },
  {
    id: 'appointments',
    title: 'This Week',
    value: '38',
    change: '+4.2%',
    trend: 'up',
    icon: ClockIcon,
    color: 'secondary'
  },
  {
    id: 'conversion',
    title: 'Lead Conversion',
    value: '68%',
    change: '+8.1%',
    trend: 'up',
         icon: ArrowTrendingUpIcon,
    color: 'warning'
  }
];

const recentActivities = [
  {
    id: 1,
    type: 'customer',
    title: 'New customer inquiry',
    description: 'Sarah Johnson requested a quote for kitchen renovation',
    time: '5 minutes ago',
    icon: UsersIcon,
    urgent: true
  },
  {
    id: 2,
    type: 'payment',
    title: 'Payment received',
    description: 'Invoice #1234 paid by Marcus Chen - $2,400',
    time: '12 minutes ago',
    icon: CurrencyDollarIcon,
    urgent: false
  },
  {
    id: 3,
    type: 'ai',
    title: 'AI Assistant Update',
    description: 'Successfully handled 3 customer inquiries automatically',
    time: '1 hour ago',
    icon: SparklesIcon,
    urgent: false
  },
  {
    id: 4,
    type: 'appointment',
    title: 'Appointment scheduled',
    description: 'Site visit with David Park scheduled for tomorrow 2PM',
    time: '2 hours ago',
    icon: ClockIcon,
    urgent: false
  }
];

const quickActions = [
  {
    id: 'new-customer',
    label: 'Add Customer',
    icon: UsersIcon,
    color: 'primary'
  },
  {
    id: 'create-invoice',
    label: 'Create Invoice',
    icon: CurrencyDollarIcon,
    color: 'success'
  },
  {
    id: 'call-ai',
    label: 'AI Assistant',
    icon: SparklesIcon,
    color: 'secondary'
  },
  {
    id: 'schedule',
    label: 'Schedule Job',
    icon: ClockIcon,
    color: 'warning'
  }
];

export default function DashboardPage() {
  return (
    <DualPaneLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Business Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Overview of your business performance</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="light"
              size="sm"
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20"
            >
              Export Data
            </Button>
            <Button
              color="primary"
              size="sm"
              className="bg-gradient-to-r from-primary/90 to-primary/70 backdrop-blur-sm"
            >
              <SparklesIcon className="h-4 w-4 mr-1" />
              Ask AI
            </Button>
          </div>
        </div>
        {/* Business Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {businessMetrics.map((metric) => (
            <GlassmorphismCard
              key={metric.id}
              variant="default"
              className="p-6"
              hoverable
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-2xl bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm">
                    <metric.icon className="h-6 w-6 text-gray-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {metric.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {metric.value}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Chip
                    size="sm"
                    variant="flat"
                    color={metric.color as "success" | "primary" | "secondary" | "warning" | "danger"}
                    className="text-xs"
                  >
                    {metric.change}
                  </Chip>
                </div>
              </div>
            </GlassmorphismCard>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <GlassmorphismCard
              variant="default"
              className="p-6"
              header={
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Recent Activities
                  </h3>
                  <Button variant="light" size="sm" className="text-primary">
                    View All
                  </Button>
                </div>
              }
            >
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-4 p-4 rounded-2xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200"
                  >
                    <div className="flex-shrink-0">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-white/30 to-white/10">
                        <activity.icon className="h-5 w-5 text-gray-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </p>
                        {activity.urgent && (
                          <Chip size="sm" color="danger" variant="flat">
                            Urgent
                          </Chip>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassmorphismCard>
          </div>

          {/* Quick Actions & User Profile */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <GlassmorphismCard
              variant="default"
              className="p-6"
              header={
                <h3 className="text-lg font-semibold text-gray-900">
                  Quick Actions
                </h3>
              }
            >
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <Button
                    key={action.id}
                    variant="light"
                    className="h-auto p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <action.icon className="h-6 w-6 text-gray-700" />
                      <span className="text-sm font-medium text-gray-900">
                        {action.label}
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            </GlassmorphismCard>

            {/* User Profile Demo */}
            <GlassmorphismCard
              variant="default"
              className="p-6"
              header={
                <h3 className="text-lg font-semibold text-gray-900">
                  User Profile Demo
                </h3>
              }
            >
              <UserProfile />
            </GlassmorphismCard>

            {/* AI Assistant Status */}
            <GlassmorphismCard
              variant="subtle"
              className="p-6"
              header={
                <div className="flex items-center space-x-2">
                  <SparklesIcon className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    AI Assistant
                  </h3>
                </div>
              }
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <Chip size="sm" color="success" variant="flat">
                    Online
                  </Chip>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Interactions Today</span>
                  <span className="text-sm font-medium text-gray-900">28</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Leads Captured</span>
                  <span className="text-sm font-medium text-gray-900">7</span>
                </div>
                <Button
                  color="primary"
                  variant="flat"
                  size="sm"
                  className="w-full mt-4"
                >
                  <SparklesIcon className="h-4 w-4 mr-1" />
                  Chat with AI
                </Button>
              </div>
            </GlassmorphismCard>
          </div>
        </div>
      </div>
    </DualPaneLayout>
  );
}