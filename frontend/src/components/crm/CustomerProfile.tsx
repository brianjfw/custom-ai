'use client';

import React, { useState } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader,
  Button,
  Chip,
  Avatar,
  Divider,
  Progress,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@heroui/react';
import { 
  UserIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  StarIcon,
  HeartIcon,
  PencilIcon,
  TrashIcon,
  ChatBubbleLeftEllipsisIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  DocumentIcon,
  TagIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { CustomerInteractionHistory } from './CustomerInteractionHistory';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  type: 'individual' | 'business';
  tags: string[];
  lastInteraction?: Date;
  totalValue: number;
  status: 'active' | 'inactive' | 'lead' | 'vip';
  avatar?: string;
  location?: string;
  rating?: number;
  isFavorite?: boolean;
  joinDate: Date;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  notes?: string;
  socialProfiles?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  preferences?: {
    communicationMethod: 'email' | 'phone' | 'sms';
    timezone: string;
    language: string;
  };
  metrics?: {
    totalOrders: number;
    averageOrderValue: number;
    lifetimeValue: number;
    lastOrderDate?: Date;
    satisfactionScore: number;
  };
}

interface CustomerProfileProps {
  customer: Customer;
  onEdit?: () => void;
  onDelete?: () => void;
  onClose?: () => void;
  onToggleFavorite?: (customerId: string) => void;
  onAddInteraction?: () => void;
  onSendMessage?: () => void;
  onScheduleCall?: () => void;
  className?: string;
}

const statusColors = {
  active: 'success',
  inactive: 'default',
  lead: 'warning',
  vip: 'secondary'
} as const;

const statusLabels = {
  active: 'Active',
  inactive: 'Inactive',
  lead: 'Lead',
  vip: 'VIP'
} as const;

const mockCustomer: Customer = {
  id: '1',
  name: 'Sarah Johnson',
  email: 'sarah.johnson@email.com',
  phone: '(555) 123-4567',
  type: 'individual',
  tags: ['Premium', 'Frequent', 'Loyal'],
  lastInteraction: new Date('2024-12-27'),
  totalValue: 15420.50,
  status: 'vip',
  location: 'New York, NY',
  rating: 5,
  isFavorite: true,
  joinDate: new Date('2024-01-15'),
  address: {
    street: '123 Main Street, Apt 4B',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA'
  },
  notes: 'Excellent customer. Always pays on time and provides great referrals. Prefers email communication.',
  socialProfiles: {
    linkedin: 'linkedin.com/in/sarahjohnson',
    website: 'sarahjohnson.com'
  },
  preferences: {
    communicationMethod: 'email',
    timezone: 'America/New_York',
    language: 'English'
  },
  metrics: {
    totalOrders: 24,
    averageOrderValue: 642.52,
    lifetimeValue: 15420.50,
    lastOrderDate: new Date('2024-12-20'),
    satisfactionScore: 4.9
  }
};

export function CustomerProfile({ 
  customer = mockCustomer, 
  onEdit, 
  onDelete, 
  onClose,
  onToggleFavorite,
  onAddInteraction,
  onSendMessage,
  onScheduleCall,
  className = ''
}: CustomerProfileProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'inactive':
        return <ExclamationCircleIcon className="w-4 h-4 text-gray-500" />;
      case 'lead':
        return <ArrowTrendingUpIcon className="w-4 h-4 text-orange-500" />;
      case 'vip':
        return <ShieldCheckIcon className="w-4 h-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIconSolid 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-amber-500' : 'text-gray-300'}`}
      />
    ));
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CurrencyDollarIcon className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-foreground/70">Total Value</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(customer.totalValue)}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="glass-card">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <ChartBarIcon className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-foreground/70">Total Orders</p>
                <p className="text-lg font-semibold text-blue-600">
                  {customer.metrics?.totalOrders || 0}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="glass-card">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <StarIcon className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-foreground/70">Satisfaction</p>
                <p className="text-lg font-semibold text-purple-600">
                  {customer.metrics?.satisfactionScore || 0}/5
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Contact Information */}
      <Card className="glass-card">
        <CardHeader>
          <h3 className="text-lg font-semibold">Contact Information</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <EnvelopeIcon className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-foreground/70">Email</p>
                <p className="text-sm font-medium">{customer.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <PhoneIcon className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-foreground/70">Phone</p>
                <p className="text-sm font-medium">{customer.phone}</p>
              </div>
            </div>
            {customer.address && (
              <div className="flex items-start gap-3 md:col-span-2">
                <MapPinIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-foreground/70">Address</p>
                  <p className="text-sm font-medium">
                    {customer.address.street}<br />
                    {customer.address.city}, {customer.address.state} {customer.address.zipCode}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Business Information */}
      {customer.company && (
        <Card className="glass-card">
          <CardHeader>
            <h3 className="text-lg font-semibold">Business Information</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center gap-3">
              <BuildingOfficeIcon className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-foreground/70">Company</p>
                <p className="text-sm font-medium">{customer.company}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Notes */}
      {customer.notes && (
        <Card className="glass-card">
          <CardHeader>
            <h3 className="text-lg font-semibold">Notes</h3>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-foreground/80 leading-relaxed">
              {customer.notes}
            </p>
          </CardBody>
        </Card>
      )}

      {/* Tags */}
      {customer.tags.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <h3 className="text-lg font-semibold">Tags</h3>
          </CardHeader>
          <CardBody>
            <div className="flex flex-wrap gap-2">
              {customer.tags.map(tag => (
                <Chip
                  key={tag}
                  size="sm"
                  variant="flat"
                  className="glass-badge"
                >
                  {tag}
                </Chip>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );

  const renderInteractionsTab = () => (
    <div className="space-y-6">
      <CustomerInteractionHistory customerId={customer.id} />
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <h3 className="text-lg font-semibold">Customer Metrics</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground/70">Average Order Value</span>
              <span className="font-semibold">
                {formatCurrency(customer.metrics?.averageOrderValue || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground/70">Lifetime Value</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(customer.metrics?.lifetimeValue || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground/70">Total Orders</span>
              <span className="font-semibold">
                {customer.metrics?.totalOrders || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground/70">Last Order</span>
              <span className="font-semibold">
                {customer.metrics?.lastOrderDate ? formatDate(customer.metrics.lastOrderDate) : 'N/A'}
              </span>
            </div>
          </CardBody>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <h3 className="text-lg font-semibold">Satisfaction Score</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {renderStars(Math.round(customer.metrics?.satisfactionScore || 0))}
              </div>
              <span className="text-lg font-semibold">
                {customer.metrics?.satisfactionScore || 0}/5
              </span>
            </div>
            <Progress 
              value={(customer.metrics?.satisfactionScore || 0) * 20} 
              className="max-w-md"
              color="success"
            />
            <p className="text-sm text-foreground/70">
              Based on {customer.metrics?.totalOrders || 0} completed orders
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="glass-card">
        <CardBody className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar 
                  src={customer.avatar}
                  name={getInitials(customer.name)}
                  size="lg"
                  className="glass-avatar"
                />
                {customer.type === 'business' && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <BuildingOfficeIcon className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-foreground">{customer.name}</h1>
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    onPress={() => onToggleFavorite?.(customer.id)}
                  >
                    {customer.isFavorite ? (
                      <HeartIconSolid className="w-5 h-5 text-red-500" />
                    ) : (
                      <HeartIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </Button>
                </div>
                {customer.company && (
                  <p className="text-foreground/70 mt-1">{customer.company}</p>
                )}
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(customer.status)}
                    <Chip
                      size="sm"
                      color={statusColors[customer.status]}
                      variant="flat"
                    >
                      {statusLabels[customer.status]}
                    </Chip>
                  </div>
                  {customer.rating && (
                    <div className="flex items-center gap-1">
                      <StarIcon className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium">{customer.rating}</span>
                    </div>
                  )}
                  {customer.location && (
                    <div className="flex items-center gap-1">
                      <MapPinIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-foreground/70">{customer.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip content="Send Message">
                <Button
                  isIconOnly
                  variant="flat"
                  size="sm"
                  onPress={onSendMessage}
                >
                  <ChatBubbleLeftEllipsisIcon className="w-4 h-4" />
                </Button>
              </Tooltip>
              <Tooltip content="Schedule Call">
                <Button
                  isIconOnly
                  variant="flat"
                  size="sm"
                  onPress={onScheduleCall}
                >
                  <CalendarIcon className="w-4 h-4" />
                </Button>
              </Tooltip>
              <Tooltip content="Edit Customer">
                <Button
                  isIconOnly
                  variant="flat"
                  size="sm"
                  onPress={onEdit}
                >
                  <PencilIcon className="w-4 h-4" />
                </Button>
              </Tooltip>
              <Tooltip content="Delete Customer">
                <Button
                  isIconOnly
                  variant="flat"
                  size="sm"
                  color="danger"
                  onPress={onDeleteOpen}
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </Tooltip>
              {onClose && (
                <Button
                  variant="light"
                  size="sm"
                  onPress={onClose}
                >
                  Close
                </Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Tabs */}
      <Card className="glass-card">
        <CardBody className="p-0">
          <Tabs 
            selectedKey={selectedTab} 
            onSelectionChange={(key) => setSelectedTab(key as string)}
            classNames={{
              tabList: "glass-tab-list",
              tab: "glass-tab",
              tabContent: "glass-tab-content"
            }}
          >
            <Tab key="overview" title="Overview">
              <div className="p-6">
                {renderOverviewTab()}
              </div>
            </Tab>
            <Tab key="interactions" title="Interactions">
              <div className="p-6">
                {renderInteractionsTab()}
              </div>
            </Tab>
            <Tab key="analytics" title="Analytics">
              <div className="p-6">
                {renderAnalyticsTab()}
              </div>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isDeleteOpen} 
        onClose={onDeleteClose}
        className="glass-modal"
      >
        <ModalContent>
          <ModalHeader>
            <h3 className="text-lg font-semibold">Delete Customer</h3>
          </ModalHeader>
          <ModalBody>
            <p className="text-foreground/80">
              Are you sure you want to delete <strong>{customer.name}</strong>? 
              This action cannot be undone and will remove all associated data.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onDeleteClose}>
              Cancel
            </Button>
            <Button 
              color="danger" 
              onPress={() => {
                onDelete?.();
                onDeleteClose();
              }}
            >
              Delete Customer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}