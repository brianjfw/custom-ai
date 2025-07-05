'use client';

import { useState } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Pagination,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Select,
  SelectItem,
} from '@heroui/react';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  EllipsisVerticalIcon,
  UserIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { trpc } from '@/lib/trpc';
import { Customer } from '@/db/schema/customers';
import { CustomerForm } from './CustomerForm';
import { CustomerProfile } from './CustomerProfile';

interface CustomerListProps {
  className?: string;
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

export function CustomerList({ className }: CustomerListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  const itemsPerPage = 20;
  const offset = (currentPage - 1) * itemsPerPage;

  // Fetch customers with search and filters
  const { data: customersData, isLoading, refetch } = trpc.customers.list.useQuery({
    query: searchQuery || undefined,
    status: selectedStatus !== 'all' ? selectedStatus as any : undefined,
    customerType: selectedType !== 'all' ? selectedType as any : undefined,
    limit: itemsPerPage,
    offset,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Fetch customer stats
  const { data: stats } = trpc.customers.getStats.useQuery();

  // Delete customer mutation
  const deleteMutation = trpc.customers.delete.useMutation({
    onSuccess: () => {
      refetch();
      onDeleteClose();
    },
  });

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    onEditOpen();
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    onViewOpen();
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setCustomerToDelete(customer);
    onDeleteOpen();
  };

  const confirmDelete = () => {
    if (customerToDelete) {
      deleteMutation.mutate({ id: customerToDelete.id });
    }
  };

  const handleCreateSuccess = () => {
    refetch();
    onCreateClose();
  };

  const handleEditSuccess = () => {
    refetch();
    onEditClose();
  };

  const customers = customersData?.customers || [];
  const totalCustomers = customersData?.totalCount || 0;
  const totalPages = Math.ceil(totalCustomers / itemsPerPage);

  const renderActions = (customer: Customer) => (
    <Dropdown>
      <DropdownTrigger>
        <Button isIconOnly size="sm" variant="light">
          <EllipsisVerticalIcon className="w-4 h-4" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu>
        <DropdownItem
          key="view"
          startContent={<EyeIcon className="w-4 h-4" />}
          onPress={() => handleViewCustomer(customer)}
        >
          View Details
        </DropdownItem>
        <DropdownItem
          key="edit"
          startContent={<PencilIcon className="w-4 h-4" />}
          onPress={() => handleEditCustomer(customer)}
        >
          Edit
        </DropdownItem>
        <DropdownItem
          key="delete"
          className="text-danger"
          color="danger"
          startContent={<TrashIcon className="w-4 h-4" />}
          onPress={() => handleDeleteCustomer(customer)}
        >
          Delete
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );

  const renderCustomerCell = (customer: Customer, columnKey: string) => {
    switch (columnKey) {
      case 'name':
        return (
          <div className="flex items-center gap-3">
            <Avatar
              showFallback
              size="sm"
              name={`${customer.firstName} ${customer.lastName}`}
              className="glass-card"
            />
            <div>
              <p className="font-medium">
                {customer.firstName} {customer.lastName}
              </p>
              {customer.companyName && (
                <p className="text-sm text-gray-500">{customer.companyName}</p>
              )}
            </div>
          </div>
        );
      case 'contact':
        return (
          <div className="space-y-1">
            {customer.email && (
              <div className="flex items-center gap-2 text-sm">
                <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                <span>{customer.email}</span>
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center gap-2 text-sm">
                <PhoneIcon className="w-4 h-4 text-gray-400" />
                <span>{customer.phone}</span>
              </div>
            )}
          </div>
        );
      case 'type':
        return (
          <div className="flex items-center gap-2">
            {customer.customerType === 'business' ? (
              <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
            ) : (
              <UserIcon className="w-4 h-4 text-gray-400" />
            )}
            <span className="capitalize">{customer.customerType}</span>
          </div>
        );
      case 'status':
        return (
          <Chip
            size="sm"
            variant="flat"
            color={statusColors[customer.status] || 'default'}
            className="capitalize"
          >
            {customer.status}
          </Chip>
        );
      case 'priority':
        return (
          <Chip
            size="sm"
            variant="flat"
            color={priorityColors[customer.priority] || 'default'}
            className="capitalize"
          >
            {customer.priority}
          </Chip>
        );
      case 'value':
        return (
          <div className="text-sm">
            <div className="font-medium">
              ${parseFloat(customer.lifetimeValue || '0').toLocaleString()}
            </div>
            <div className="text-gray-500">LTV</div>
          </div>
        );
      case 'actions':
        return renderActions(customer);
      default:
        return null;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Customer Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your customer relationships and interactions
          </p>
        </div>
        <Button
          color="primary"
          startContent={<PlusIcon className="w-4 h-4" />}
          className="glass-button"
          onPress={onCreateOpen}
        >
          Add Customer
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Customers</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalCustomers}
                  </p>
                </div>
                <UserIcon className="w-8 h-8 text-blue-500" />
              </div>
            </CardBody>
          </Card>
          <Card className="glass-card">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.activeCustomers}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>
            </CardBody>
          </Card>
          <Card className="glass-card">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Business</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.businessCustomers}
                  </p>
                </div>
                <BuildingOfficeIcon className="w-8 h-8 text-purple-500" />
              </div>
            </CardBody>
          </Card>
          <Card className="glass-card">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Conversion</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {stats.conversionRate.toFixed(1)}%
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="glass-card">
        <CardBody className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />}
              className="flex-1"
              classNames={{
                input: "glass-input",
                inputWrapper: "glass-input-wrapper",
              }}
            />
            <Select
              placeholder="Status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="min-w-[120px]"
            >
              <SelectItem key="all" value="all">All Status</SelectItem>
              <SelectItem key="active" value="active">Active</SelectItem>
              <SelectItem key="inactive" value="inactive">Inactive</SelectItem>
              <SelectItem key="prospect" value="prospect">Prospect</SelectItem>
              <SelectItem key="churned" value="churned">Churned</SelectItem>
            </Select>
            <Select
              placeholder="Type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="min-w-[120px]"
            >
              <SelectItem key="all" value="all">All Types</SelectItem>
              <SelectItem key="individual" value="individual">Individual</SelectItem>
              <SelectItem key="business" value="business">Business</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Customer Table */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">
              Customers ({totalCustomers})
            </h2>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <Table
            aria-label="Customer table"
            classNames={{
              wrapper: "glass-table-wrapper",
              th: "glass-table-header",
              td: "glass-table-cell",
            }}
          >
            <TableHeader>
              <TableColumn key="name">NAME</TableColumn>
              <TableColumn key="contact">CONTACT</TableColumn>
              <TableColumn key="type">TYPE</TableColumn>
              <TableColumn key="status">STATUS</TableColumn>
              <TableColumn key="priority">PRIORITY</TableColumn>
              <TableColumn key="value">LIFETIME VALUE</TableColumn>
              <TableColumn key="actions">ACTIONS</TableColumn>
            </TableHeader>
            <TableBody
              isLoading={isLoading}
              loadingContent={<Spinner />}
              emptyContent={
                <div className="text-center py-8">
                  <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No customers found</p>
                  <Button
                    color="primary"
                    variant="flat"
                    onPress={onCreateOpen}
                    className="mt-4"
                  >
                    Add your first customer
                  </Button>
                </div>
              }
            >
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  {['name', 'contact', 'type', 'status', 'priority', 'value', 'actions'].map((columnKey) => (
                    <TableCell key={columnKey}>
                      {renderCustomerCell(customer, columnKey)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            total={totalPages}
            page={currentPage}
            onChange={setCurrentPage}
            className="glass-pagination"
          />
        </div>
      )}

      {/* Create Customer Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={onCreateClose}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>Add New Customer</ModalHeader>
          <ModalBody>
            <CustomerForm onSuccess={handleCreateSuccess} />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Edit Customer Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={onEditClose}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>Edit Customer</ModalHeader>
          <ModalBody>
            {editingCustomer && (
              <CustomerForm
                customer={editingCustomer}
                onSuccess={handleEditSuccess}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* View Customer Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={onViewClose}
        size="4xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>Customer Details</ModalHeader>
          <ModalBody>
            {selectedCustomer && (
              <CustomerProfile customer={selectedCustomer} />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} size="md">
        <ModalContent>
          <ModalHeader>Delete Customer</ModalHeader>
          <ModalBody>
            <p>
              Are you sure you want to delete{' '}
              <strong>
                {customerToDelete?.firstName} {customerToDelete?.lastName}
              </strong>
              ? This action cannot be undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onDeleteClose}>
              Cancel
            </Button>
            <Button
              color="danger"
              onPress={confirmDelete}
              isLoading={deleteMutation.isPending}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}