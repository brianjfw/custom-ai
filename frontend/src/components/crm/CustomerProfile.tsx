'use client';

import { useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Avatar,
  Chip,
  Button,
  Divider,
  Progress,
  Badge,
  Tooltip,
  Tabs,
  Tab,
} from '@heroui/react';
import {
  UserIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  TagIcon,
  PencilIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { Customer } from '@/db/schema/customers';
import { trpc } from '@/lib/trpc';
import { CustomerInteractionHistory } from './CustomerInteractionHistory';

interface CustomerProfileProps {
  customer: Customer;
  onEdit?: () => void;
}

const statusColors = {
  active: 'success',
  inactive: 'default',
  prospect: 'warning',
  churned: 'danger',
} as const;

const priorityColors = {
  low: 'default',
  medium: 'primary',
  high: 'warning',
  vip: 'danger',
} as const;

const priorityIcons = {
  low: null,
  medium: null,
  high: ExclamationTriangleIcon,
  vip: StarIcon,
};

export function CustomerProfile({ customer, onEdit }: CustomerProfileProps) {
  const [selectedTab, setSelectedTab] = useState('overview');

  // Fetch customer interactions
  const { data: interactions } = trpc.customers.getInteractions.useQuery({
    customerId: customer.id,
    limit: 10,
  });

  const formatCurrency = (amount: string | null) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCustomerHealthScore = () => {
    // Simple health score calculation based on available data
    let score = 50; // Base score
    
    if (customer.status === 'active') score += 30;
    else if (customer.status === 'prospect') score += 10;
    else if (customer.status === 'churned') score -= 40;
    
    if (customer.priority === 'vip') score += 20;
    else if (customer.priority === 'high') score += 10;
    
    if (customer.email) score += 5;
    if (customer.phone) score += 5;
    if (customer.marketingOptIn) score += 10;
    
    const ltv = parseFloat(customer.lifetimeValue || '0');
    if (ltv > 10000) score += 20;
    else if (ltv > 5000) score += 10;
    else if (ltv > 1000) score += 5;
    
    return Math.min(Math.max(score, 0), 100);
  };

  const healthScore = getCustomerHealthScore();
  const PriorityIcon = priorityIcons[customer.priority];

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  const getHealthLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="space-y-6">
      {/* Customer Header */}
      <Card className="glass-card">
        <CardBody className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Avatar and Basic Info */}
            <div className="flex items-start gap-4">
              <Badge
                content={
                  customer.priority === 'vip' ? (
                    <StarIcon className="w-3 h-3" />
                  ) : customer.priority === 'high' ? (
                    <ExclamationTriangleIcon className="w-3 h-3" />
                  ) : null
                }
                color={priorityColors[customer.priority]}
                placement="top-right"
                isInvisible={!['vip', 'high'].includes(customer.priority)}
              >
                <Avatar
                  showFallback
                  size="lg"
                  name={`${customer.firstName} ${customer.lastName}`}
                  className="glass-card w-20 h-20"
                />
              </Badge>
              <div className="space-y-2">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {customer.firstName} {customer.lastName}
                  </h1>
                  {customer.companyName && (
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                      {customer.jobTitle ? `${customer.jobTitle} at ` : ''}
                      {customer.companyName}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Chip
                    size="sm"
                    variant="flat"
                    color={statusColors[customer.status]}
                    className="capitalize"
                  >
                    {customer.status}
                  </Chip>
                  <Chip
                    size="sm"
                    variant="flat"
                    color={priorityColors[customer.priority]}
                    className="capitalize"
                    startContent={PriorityIcon && <PriorityIcon className="w-3 h-3" />}
                  >
                    {customer.priority}
                  </Chip>
                  <Chip
                    size="sm"
                    variant="flat"
                    color="secondary"
                    className="capitalize"
                    startContent={
                      customer.customerType === 'business' ? (
                        <BuildingOfficeIcon className="w-3 h-3" />
                      ) : (
                        <UserIcon className="w-3 h-3" />
                      )
                    }
                  >
                    {customer.customerType}
                  </Chip>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="lg:ml-auto">
              <Button
                color="primary"
                startContent={<PencilIcon className="w-4 h-4" />}
                onPress={onEdit}
                className="glass-button"
              >
                Edit Customer
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Customer Tabs */}
      <Card className="glass-card">
        <CardBody className="p-0">
          <Tabs
            selectedKey={selectedTab}
            onSelectionChange={(key) => setSelectedTab(key as string)}
            className="w-full"
            classNames={{
              tabList: "glass-tab-list",
              tab: "glass-tab",
              tabContent: "glass-tab-content",
            }}
          >
            <Tab key="overview" title="Overview">
              <div className="p-6 space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="glass-card">
                    <CardBody className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                          <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Lifetime Value</p>
                          <p className="text-lg font-semibold">
                            {formatCurrency(customer.lifetimeValue)}
                          </p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>

                  <Card className="glass-card">
                    <CardBody className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                          <ChartBarIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Health Score</p>
                          <div className="flex items-center gap-2">
                            <p className="text-lg font-semibold">{healthScore}%</p>
                            <Chip
                              size="sm"
                              color={getHealthColor(healthScore)}
                              variant="flat"
                            >
                              {getHealthLabel(healthScore)}
                            </Chip>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>

                  <Card className="glass-card">
                    <CardBody className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                          <CalendarDaysIcon className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Customer Since</p>
                          <p className="text-lg font-semibold">
                            {formatDate(customer.createdAt)}
                          </p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>

                  <Card className="glass-card">
                    <CardBody className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/20">
                          <ChatBubbleLeftRightIcon className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Interactions</p>
                          <p className="text-lg font-semibold">
                            {interactions?.length || 0}
                          </p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </div>

                {/* Health Score Details */}
                <Card className="glass-card">
                  <CardHeader className="pb-3">
                    <h3 className="text-lg font-semibold">Customer Health</h3>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Overall Health Score</span>
                        <span className="font-medium">{healthScore}%</span>
                      </div>
                      <Progress
                        value={healthScore}
                        color={getHealthColor(healthScore)}
                        className="glass-progress"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                        <span>Active Status: {customer.status === 'active' ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                        <span>Contact Info: {customer.email || customer.phone ? 'Complete' : 'Partial'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                        <span>Marketing Opt-in: {customer.marketingOptIn ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Contact Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="glass-card">
                    <CardHeader className="pb-3">
                      <h3 className="text-lg font-semibold">Contact Information</h3>
                    </CardHeader>
                    <CardBody className="space-y-4">
                      {customer.email && (
                        <div className="flex items-center gap-3">
                          <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                            <p className="font-medium">{customer.email}</p>
                          </div>
                        </div>
                      )}
                      
                      {customer.phone && (
                        <div className="flex items-center gap-3">
                          <PhoneIcon className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                            <p className="font-medium">{customer.phone}</p>
                          </div>
                        </div>
                      )}

                      {customer.address && (
                        <div className="flex items-start gap-3">
                          <MapPinIcon className="w-5 h-5 text-gray-400 mt-1" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Address</p>
                            <div className="font-medium">
                              <p>{customer.address.street}</p>
                              <p>
                                {customer.address.city}, {customer.address.state} {customer.address.zipCode}
                              </p>
                              <p>{customer.address.country}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardBody>
                  </Card>

                  {/* Business Information */}
                  {customer.customerType === 'business' && (
                    <Card className="glass-card">
                      <CardHeader className="pb-3">
                        <h3 className="text-lg font-semibold">Business Information</h3>
                      </CardHeader>
                      <CardBody className="space-y-4">
                        {customer.companyName && (
                          <div className="flex items-center gap-3">
                            <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Company</p>
                              <p className="font-medium">{customer.companyName}</p>
                            </div>
                          </div>
                        )}
                        
                        {customer.jobTitle && (
                          <div className="flex items-center gap-3">
                            <UserIcon className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Job Title</p>
                              <p className="font-medium">{customer.jobTitle}</p>
                            </div>
                          </div>
                        )}

                        {customer.industry && (
                          <div className="flex items-center gap-3">
                            <TagIcon className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Industry</p>
                              <p className="font-medium">{customer.industry}</p>
                            </div>
                          </div>
                        )}
                      </CardBody>
                    </Card>
                  )}
                </div>

                {/* Communication Preferences */}
                <Card className="glass-card">
                  <CardHeader className="pb-3">
                    <h3 className="text-lg font-semibold">Communication Preferences</h3>
                  </CardHeader>
                  <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900 dark:text-white">Preferred Channels</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircleIcon 
                              className={`w-4 h-4 ${
                                customer.communicationPreferences?.email 
                                  ? 'text-green-500' 
                                  : 'text-gray-300'
                              }`} 
                            />
                            <span className="text-sm">Email</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircleIcon 
                              className={`w-4 h-4 ${
                                customer.communicationPreferences?.sms 
                                  ? 'text-green-500' 
                                  : 'text-gray-300'
                              }`} 
                            />
                            <span className="text-sm">SMS</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircleIcon 
                              className={`w-4 h-4 ${
                                customer.communicationPreferences?.phone 
                                  ? 'text-green-500' 
                                  : 'text-gray-300'
                              }`} 
                            />
                            <span className="text-sm">Phone</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900 dark:text-white">Preferences</h4>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="text-gray-600 dark:text-gray-400">Preferred Time: </span>
                            <span className="capitalize">
                              {customer.communicationPreferences?.preferredTime?.replace('_', ' ') || 'Not specified'}
                            </span>
                          </p>
                          <p>
                            <span className="text-gray-600 dark:text-gray-400">Marketing Opt-in: </span>
                            <span>{customer.marketingOptIn ? 'Yes' : 'No'}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </Tab>

            <Tab key="interactions" title="Interactions">
              <div className="p-6">
                <CustomerInteractionHistory customerId={customer.id} />
              </div>
            </Tab>

            <Tab key="insights" title="AI Insights">
              <div className="p-6">
                <Card className="glass-card">
                  <CardHeader className="pb-3">
                    <h3 className="text-lg font-semibold">AI-Powered Insights</h3>
                  </CardHeader>
                  <CardBody>
                    {customer.aiInsights ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                              Personality Profile
                            </h4>
                            <div className="space-y-2 text-sm">
                              <p>
                                <span className="text-gray-600 dark:text-gray-400">Type: </span>
                                {customer.aiInsights.personalityType}
                              </p>
                              <p>
                                <span className="text-gray-600 dark:text-gray-400">Communication Style: </span>
                                {customer.aiInsights.communicationStyle}
                              </p>
                              <p>
                                <span className="text-gray-600 dark:text-gray-400">Decision Making: </span>
                                {customer.aiInsights.decisionMakingStyle}
                              </p>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                              Loyalty & Risk
                            </h4>
                            <div className="space-y-2">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Loyalty Score</span>
                                  <span>{customer.aiInsights.loyaltyScore}%</span>
                                </div>
                                <Progress 
                                  value={customer.aiInsights.loyaltyScore} 
                                  color="success"
                                  className="glass-progress"
                                />
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Churn Risk</span>
                                  <span>{customer.aiInsights.churnRisk}%</span>
                                </div>
                                <Progress 
                                  value={customer.aiInsights.churnRisk} 
                                  color="danger"
                                  className="glass-progress"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                              Preferred Services
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {customer.aiInsights.preferredServices?.map((service, index) => (
                                <Chip key={index} size="sm" variant="flat">
                                  {service}
                                </Chip>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                              Seasonal Patterns
                            </h4>
                            <div className="space-y-2 text-sm">
                              {customer.aiInsights.seasonalPatterns && 
                                Object.entries(customer.aiInsights.seasonalPatterns).map(([season, value]) => (
                                  <div key={season} className="flex justify-between">
                                    <span className="capitalize">{season}</span>
                                    <span>{value}% active</span>
                                  </div>
                                ))
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">
                          No AI insights available yet. Insights will be generated as more data is collected.
                        </p>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </div>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
}