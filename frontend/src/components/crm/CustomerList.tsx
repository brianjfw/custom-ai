'use client';

import React, { useState, useMemo } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader,
  Input,
  Button,
  Chip,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Pagination,
  Skeleton,
  Badge,
  Select,
  SelectItem
} from '@heroui/react';
import { 
  MagnifyingGlassIcon,
  UserIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  EllipsisVerticalIcon,
  PlusIcon,
  FunnelIcon,
  Bars3Icon,
  Squares2X2Icon,
  HeartIcon,
  ClockIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { trpc } from '@/lib/trpc';
import { CustomerSearch } from './CustomerSearch';

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
}

interface CustomerListProps {
  onSelectCustomer?: (customer: Customer) => void;
  onCreateCustomer?: () => void;
  selectedCustomerId?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '(555) 123-4567',
    type: 'individual',
    tags: ['Premium', 'Frequent'],
    lastInteraction: new Date('2024-12-27'),
    totalValue: 15420.50,
    status: 'vip',
    location: 'New York, NY',
    rating: 5,
    isFavorite: true,
    joinDate: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'mike@techcorp.com',
    phone: '(555) 234-5678',
    company: 'TechCorp Solutions',
    type: 'business',
    tags: ['Enterprise', 'High-Value'],
    lastInteraction: new Date('2024-12-26'),
    totalValue: 45780.00,
    status: 'active',
    location: 'San Francisco, CA',
    rating: 4,
    isFavorite: false,
    joinDate: new Date('2024-02-08')
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.r@startup.io',
    phone: '(555) 345-6789',
    company: 'Startup Innovations',
    type: 'business',
    tags: ['Startup', 'Growing'],
    lastInteraction: new Date('2024-12-20'),
    totalValue: 8940.25,
    status: 'active',
    location: 'Austin, TX',
    rating: 4,
    isFavorite: false,
    joinDate: new Date('2024-03-12')
  },
  {
    id: '4',
    name: 'David Park',
    email: 'david.park@email.com',
    phone: '(555) 456-7890',
    type: 'individual',
    tags: ['New'],
    lastInteraction: new Date('2024-12-15'),
    totalValue: 1250.00,
    status: 'lead',
    location: 'Seattle, WA',
    rating: 3,
    isFavorite: false,
    joinDate: new Date('2024-12-10')
  },
  {
    id: '5',
    name: 'Jennifer Walsh',
    email: 'jen@creativestudio.com',
    phone: '(555) 567-8901',
    company: 'Creative Studio',
    type: 'business',
    tags: ['Creative', 'Regular'],
    lastInteraction: new Date('2024-12-10'),
    totalValue: 12680.75,
    status: 'active',
    location: 'Los Angeles, CA',
    rating: 5,
    isFavorite: true,
    joinDate: new Date('2024-01-28')
  }
];

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

export function CustomerList({ 
  onSelectCustomer, 
  onCreateCustomer, 
  selectedCustomerId,
  searchQuery = '',
  onSearchChange 
}: CustomerListProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [sortBy, setSortBy] = useState<'name' | 'lastInteraction' | 'totalValue'>('lastInteraction');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'lead' | 'vip'>('all');
  const [filterType, setFilterType] = useState<'all' | 'individual' | 'business'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['1', '5']));
  const itemsPerPage = 12;

  const searchQueryValue = onSearchChange ? searchQuery : localSearchQuery;

  const filteredAndSortedCustomers = useMemo(() => {
    let filtered = mockCustomers.filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchQueryValue.toLowerCase()) ||
                           customer.email.toLowerCase().includes(searchQueryValue.toLowerCase()) ||
                           customer.phone.includes(searchQueryValue) ||
                           (customer.company && customer.company.toLowerCase().includes(searchQueryValue.toLowerCase()));
      
      const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
      const matchesType = filterType === 'all' || customer.type === filterType;
      
      return matchesSearch && matchesStatus && matchesType;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'lastInteraction':
          return (b.lastInteraction?.getTime() || 0) - (a.lastInteraction?.getTime() || 0);
        case 'totalValue':
          return b.totalValue - a.totalValue;
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQueryValue, filterStatus, filterType, sortBy]);

  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedCustomers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedCustomers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedCustomers.length / itemsPerPage);

  const handleSearchChange = (value: string) => {
    if (onSearchChange) {
      onSearchChange(value);
    } else {
      setLocalSearchQuery(value);
    }
    setCurrentPage(1);
  };

  const toggleFavorite = (customerId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(customerId)) {
        newFavorites.delete(customerId);
      } else {
        newFavorites.add(customerId);
      }
      return newFavorites;
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const renderCustomerCard = (customer: Customer) => (
    <Card 
      key={customer.id}
      className={`glass-card hover:glass-card-elevated cursor-pointer transition-all duration-300 animate-glass-entrance group ${
        selectedCustomerId === customer.id ? 'ring-2 ring-blue-500/50' : ''
      }`}
      isPressable
      onPress={() => onSelectCustomer?.(customer)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar 
                src={customer.avatar}
                name={getInitials(customer.name)}
                size="md"
                className="glass-avatar"
              />
              {customer.type === 'business' && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <BuildingOfficeIcon className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground group-hover:text-blue-600 transition-colors">
                  {customer.name}
                </h3>
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onPress={() => toggleFavorite(customer.id)}
                >
                  {favorites.has(customer.id) ? (
                    <HeartIconSolid className="w-4 h-4 text-red-500" />
                  ) : (
                    <HeartIcon className="w-4 h-4 text-gray-400" />
                  )}
                </Button>
              </div>
              {customer.company && (
                <p className="text-sm text-foreground/70">{customer.company}</p>
              )}
              <div className="flex items-center gap-4 mt-1">
                <Chip
                  size="sm"
                  color={statusColors[customer.status]}
                  variant="flat"
                  className="text-xs"
                >
                  {statusLabels[customer.status]}
                </Chip>
                {customer.rating && (
                  <div className="flex items-center gap-1">
                    <StarIcon className="w-3 h-3 text-amber-500" />
                    <span className="text-xs text-foreground/70">{customer.rating}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Dropdown>
            <DropdownTrigger>
              <Button
                isIconOnly
                variant="light"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <EllipsisVerticalIcon className="w-4 h-4" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Customer actions"
              className="glass-dropdown"
            >
              <DropdownItem key="view">View Profile</DropdownItem>
              <DropdownItem key="edit">Edit Customer</DropdownItem>
              <DropdownItem key="contact">Contact</DropdownItem>
              <DropdownItem key="delete" className="text-danger">Delete</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </CardHeader>
      <CardBody className="pt-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-foreground/70">
            <EnvelopeIcon className="w-4 h-4" />
            <span className="truncate">{customer.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground/70">
            <PhoneIcon className="w-4 h-4" />
            <span>{customer.phone}</span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="text-sm">
              <span className="text-foreground/70">Total Value: </span>
              <span className="font-semibold text-green-600">
                {formatCurrency(customer.totalValue)}
              </span>
            </div>
            {customer.lastInteraction && (
              <div className="text-xs text-foreground/60 flex items-center gap-1">
                <ClockIcon className="w-3 h-3" />
                {formatDate(customer.lastInteraction)}
              </div>
            )}
          </div>
          {customer.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {customer.tags.map(tag => (
                <Chip
                  key={tag}
                  size="sm"
                  variant="flat"
                  className="glass-badge text-xs"
                >
                  {tag}
                </Chip>
              ))}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );

  const renderListView = (customer: Customer) => (
    <Card 
      key={customer.id}
      className={`glass-card hover:glass-card-elevated cursor-pointer transition-all duration-300 animate-glass-entrance group ${
        selectedCustomerId === customer.id ? 'ring-2 ring-blue-500/50' : ''
      }`}
      isPressable
      onPress={() => onSelectCustomer?.(customer)}
    >
      <CardBody className="p-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative">
              <Avatar 
                src={customer.avatar}
                name={getInitials(customer.name)}
                size="md"
                className="glass-avatar"
              />
              {customer.type === 'business' && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <BuildingOfficeIcon className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground group-hover:text-blue-600 transition-colors truncate">
                  {customer.name}
                </h3>
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onPress={() => toggleFavorite(customer.id)}
                >
                  {favorites.has(customer.id) ? (
                    <HeartIconSolid className="w-4 h-4 text-red-500" />
                  ) : (
                    <HeartIcon className="w-4 h-4 text-gray-400" />
                  )}
                </Button>
              </div>
              {customer.company && (
                <p className="text-sm text-foreground/70 truncate">{customer.company}</p>
              )}
              <div className="flex items-center gap-4 mt-1">
                <span className="text-sm text-foreground/70 truncate">{customer.email}</span>
                <span className="text-sm text-foreground/70">{customer.phone}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Chip
              size="sm"
              color={statusColors[customer.status]}
              variant="flat"
              className="text-xs"
            >
              {statusLabels[customer.status]}
            </Chip>
            <div className="text-sm font-semibold text-green-600">
              {formatCurrency(customer.totalValue)}
            </div>
            {customer.lastInteraction && (
              <div className="text-xs text-foreground/60 flex items-center gap-1">
                <ClockIcon className="w-3 h-3" />
                {formatDate(customer.lastInteraction)}
              </div>
            )}
            <Dropdown>
              <DropdownTrigger>
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <EllipsisVerticalIcon className="w-4 h-4" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Customer actions"
                className="glass-dropdown"
              >
                <DropdownItem key="view">View Profile</DropdownItem>
                <DropdownItem key="edit">Edit Customer</DropdownItem>
                <DropdownItem key="contact">Contact</DropdownItem>
                <DropdownItem key="delete" className="text-danger">Delete</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </CardBody>
    </Card>
  );

  return (
    <div className="space-y-6 animate-glass-entrance">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Customers</h2>
          <p className="text-sm text-foreground/70 mt-1">
            Manage your customer relationships and track interactions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Button
              isIconOnly
              variant={viewMode === 'grid' ? 'flat' : 'light'}
              size="sm"
              onPress={() => setViewMode('grid')}
            >
              <Squares2X2Icon className="w-4 h-4" />
            </Button>
            <Button
              isIconOnly
              variant={viewMode === 'list' ? 'flat' : 'light'}
              size="sm"
              onPress={() => setViewMode('list')}
            >
              <Bars3Icon className="w-4 h-4" />
            </Button>
          </div>
          <Button
            color="primary"
            startContent={<PlusIcon className="w-4 h-4" />}
            onPress={onCreateCustomer}
            className="glass-button-primary"
          >
            Add Customer
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <CustomerSearch
            value={searchQueryValue}
            onChange={handleSearchChange}
            placeholder="Search customers by name, email, phone, or company..."
          />
        </div>
        <div className="flex items-center gap-3">
          <Select
            size="sm"
            placeholder="Status"
            selectedKeys={[filterStatus]}
            onSelectionChange={(keys) => setFilterStatus(Array.from(keys)[0] as any)}
            className="min-w-32"
          >
            <SelectItem key="all">All Status</SelectItem>
            <SelectItem key="active">Active</SelectItem>
            <SelectItem key="inactive">Inactive</SelectItem>
            <SelectItem key="lead">Lead</SelectItem>
            <SelectItem key="vip">VIP</SelectItem>
          </Select>
          <Select
            size="sm"
            placeholder="Type"
            selectedKeys={[filterType]}
            onSelectionChange={(keys) => setFilterType(Array.from(keys)[0] as any)}
            className="min-w-32"
          >
            <SelectItem key="all">All Types</SelectItem>
            <SelectItem key="individual">Individual</SelectItem>
            <SelectItem key="business">Business</SelectItem>
          </Select>
          <Select
            size="sm"
            placeholder="Sort by"
            selectedKeys={[sortBy]}
            onSelectionChange={(keys) => setSortBy(Array.from(keys)[0] as any)}
            className="min-w-40"
          >
            <SelectItem key="lastInteraction">Last Interaction</SelectItem>
            <SelectItem key="name">Name</SelectItem>
            <SelectItem key="totalValue">Total Value</SelectItem>
          </Select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-foreground/70">
          Showing {paginatedCustomers.length} of {filteredAndSortedCustomers.length} customers
        </p>
        {filteredAndSortedCustomers.length > 0 && (
          <div className="text-sm text-foreground/70">
            Total value: {formatCurrency(filteredAndSortedCustomers.reduce((sum, c) => sum + c.totalValue, 0))}
          </div>
        )}
      </div>

      {/* Customer List */}
      <div className="space-y-4">
        {paginatedCustomers.length === 0 ? (
          <div className="text-center py-12">
            <UserIcon className="w-16 h-16 text-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground/70 mb-2">No customers found</h3>
            <p className="text-foreground/50 mb-4">
              {searchQueryValue ? 'Try adjusting your search criteria' : 'Get started by adding your first customer'}
            </p>
            <Button
              color="primary"
              startContent={<PlusIcon className="w-4 h-4" />}
              onPress={onCreateCustomer}
              className="glass-button-primary"
            >
              Add Customer
            </Button>
          </div>
        ) : (
          <>
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
                : 'space-y-3'
            }>
              {paginatedCustomers.map(customer => 
                viewMode === 'grid' 
                  ? renderCustomerCard(customer)
                  : renderListView(customer)
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <Pagination
                  total={totalPages}
                  page={currentPage}
                  onChange={setCurrentPage}
                  showControls
                  showShadow
                  className="glass-pagination"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}