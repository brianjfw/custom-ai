'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Chip,
  Switch,
  Divider,
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
  TagIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  company?: string;
  type: 'individual' | 'business';
  status: 'active' | 'inactive' | 'lead' | 'vip';
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  tags: string[];
  notes?: string;
  preferences?: {
    communicationMethod: 'email' | 'phone' | 'sms';
    timezone: string;
    language: string;
  };
  socialProfiles?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}

interface CustomerFormProps {
  customer?: CustomerFormData;
  onSave: (customer: CustomerFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
  className?: string;
}

const initialFormData: CustomerFormData = {
  name: '',
  email: '',
  phone: '',
  company: '',
  type: 'individual',
  status: 'lead',
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA'
  },
  tags: [],
  notes: '',
  preferences: {
    communicationMethod: 'email',
    timezone: 'America/New_York',
    language: 'English'
  },
  socialProfiles: {
    linkedin: '',
    twitter: '',
    website: ''
  }
};

const statusOptions = [
  { key: 'lead', label: 'Lead', color: 'warning' },
  { key: 'active', label: 'Active', color: 'success' },
  { key: 'inactive', label: 'Inactive', color: 'default' },
  { key: 'vip', label: 'VIP', color: 'secondary' }
] as const;

const communicationOptions = [
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'sms', label: 'SMS' }
];

const timezoneOptions = [
  { key: 'America/New_York', label: 'Eastern Time (ET)' },
  { key: 'America/Chicago', label: 'Central Time (CT)' },
  { key: 'America/Denver', label: 'Mountain Time (MT)' },
  { key: 'America/Los_Angeles', label: 'Pacific Time (PT)' }
];

const languageOptions = [
  { key: 'English', label: 'English' },
  { key: 'Spanish', label: 'Spanish' },
  { key: 'French', label: 'French' },
  { key: 'German', label: 'German' }
];

export function CustomerForm({ 
  customer, 
  onSave, 
  onCancel, 
  isLoading = false,
  mode = 'create',
  className = ''
}: CustomerFormProps) {
  const [formData, setFormData] = useState<CustomerFormData>(customer || initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newTag, setNewTag] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const { isOpen: isUnsavedOpen, onOpen: onUnsavedOpen, onClose: onUnsavedClose } = useDisclosure();

  useEffect(() => {
    if (customer) {
      setFormData(customer);
    }
  }, [customer]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\(\d{3}\)\s\d{3}-\d{4}$/.test(formData.phone)) {
      newErrors.phone = 'Phone format: (555) 123-4567';
    }

    // Business type requires company
    if (formData.type === 'business' && !formData.company?.trim()) {
      newErrors.company = 'Company name is required for business customers';
    }

    // Validate social profiles URLs
    if (formData.socialProfiles?.website && 
        !/^https?:\/\/.+\..+/.test(formData.socialProfiles.website)) {
      newErrors.website = 'Please enter a valid website URL';
    }

    if (formData.socialProfiles?.linkedin && 
        !/^https?:\/\/(www\.)?linkedin\.com\//.test(formData.socialProfiles.linkedin)) {
      newErrors.linkedin = 'Please enter a valid LinkedIn URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      onUnsavedOpen();
    } else {
      onCancel();
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof CustomerFormData] as any,
        [field]: value
      }
    }));
    setIsDirty(true);
    
    // Clear error when user starts typing
    const errorKey = `${parent}.${field}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
      setIsDirty(true);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
    setIsDirty(true);
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <Card className="glass-card">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  {formData.type === 'business' ? (
                    <BuildingOfficeIcon className="w-6 h-6 text-blue-500" />
                  ) : (
                    <UserIcon className="w-6 h-6 text-blue-500" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {mode === 'create' ? 'Add New Customer' : `Edit ${formData.name || 'Customer'}`}
                  </h2>
                  <p className="text-sm text-foreground/70 mt-1">
                    {mode === 'create' 
                      ? 'Create a new customer profile with contact information and preferences'
                      : 'Update customer information and preferences'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="light"
                  onPress={handleCancel}
                  isDisabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  isLoading={isLoading}
                  startContent={!isLoading && <CheckIcon className="w-4 h-4" />}
                  className="glass-button-primary"
                >
                  {mode === 'create' ? 'Create Customer' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Basic Information */}
        <Card className="glass-card">
          <CardHeader>
            <h3 className="text-lg font-semibold">Basic Information</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Switch
                  isSelected={formData.type === 'business'}
                  onValueChange={(checked) => 
                    handleInputChange('type', checked ? 'business' : 'individual')
                  }
                >
                  Business Customer
                </Switch>
              </div>
              <Select
                label="Status"
                selectedKeys={[formData.status]}
                onSelectionChange={(keys) => 
                  handleInputChange('status', Array.from(keys)[0])
                }
                isInvalid={!!errors.status}
                errorMessage={errors.status}
              >
                {statusOptions.map(option => (
                  <SelectItem key={option.key}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={formData.name}
                onValueChange={(value) => handleInputChange('name', value)}
                isRequired
                isInvalid={!!errors.name}
                errorMessage={errors.name}
                className="glass-input"
              />
              {formData.type === 'business' && (
                <Input
                  label="Company Name"
                  value={formData.company || ''}
                  onValueChange={(value) => handleInputChange('company', value)}
                  isRequired={formData.type === 'business'}
                  isInvalid={!!errors.company}
                  errorMessage={errors.company}
                  className="glass-input"
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onValueChange={(value) => handleInputChange('email', value)}
                isRequired
                isInvalid={!!errors.email}
                errorMessage={errors.email}
                startContent={<EnvelopeIcon className="w-4 h-4 text-gray-400" />}
                className="glass-input"
              />
              <Input
                label="Phone Number"
                value={formData.phone}
                onValueChange={(value) => handleInputChange('phone', formatPhoneNumber(value))}
                isRequired
                isInvalid={!!errors.phone}
                errorMessage={errors.phone}
                placeholder="(555) 123-4567"
                startContent={<PhoneIcon className="w-4 h-4 text-gray-400" />}
                className="glass-input"
              />
            </div>
          </CardBody>
        </Card>

        {/* Address Information */}
        <Card className="glass-card">
          <CardHeader>
            <h3 className="text-lg font-semibold">Address Information</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input
              label="Street Address"
              value={formData.address?.street || ''}
              onValueChange={(value) => handleNestedInputChange('address', 'street', value)}
              startContent={<MapPinIcon className="w-4 h-4 text-gray-400" />}
              className="glass-input"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="City"
                value={formData.address?.city || ''}
                onValueChange={(value) => handleNestedInputChange('address', 'city', value)}
                className="glass-input"
              />
              <Input
                label="State"
                value={formData.address?.state || ''}
                onValueChange={(value) => handleNestedInputChange('address', 'state', value)}
                className="glass-input"
              />
              <Input
                label="ZIP Code"
                value={formData.address?.zipCode || ''}
                onValueChange={(value) => handleNestedInputChange('address', 'zipCode', value)}
                className="glass-input"
              />
            </div>
            <Input
              label="Country"
              value={formData.address?.country || ''}
              onValueChange={(value) => handleNestedInputChange('address', 'country', value)}
              className="glass-input"
            />
          </CardBody>
        </Card>

        {/* Tags */}
        <Card className="glass-card">
          <CardHeader>
            <h3 className="text-lg font-semibold">Tags</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add tag..."
                value={newTag}
                onValueChange={setNewTag}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                startContent={<TagIcon className="w-4 h-4 text-gray-400" />}
                className="glass-input flex-1"
              />
              <Button
                onPress={handleAddTag}
                isDisabled={!newTag.trim()}
                className="glass-button"
              >
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <Chip
                    key={tag}
                    size="sm"
                    variant="flat"
                    className="glass-badge"
                    endContent={
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    }
                  >
                    {tag}
                  </Chip>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Preferences */}
        <Card className="glass-card">
          <CardHeader>
            <h3 className="text-lg font-semibold">Preferences</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Communication Method"
                selectedKeys={[formData.preferences?.communicationMethod || 'email']}
                onSelectionChange={(keys) => 
                  handleNestedInputChange('preferences', 'communicationMethod', Array.from(keys)[0])
                }
              >
                {communicationOptions.map(option => (
                  <SelectItem key={option.key}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
              <Select
                label="Timezone"
                selectedKeys={[formData.preferences?.timezone || 'America/New_York']}
                onSelectionChange={(keys) => 
                  handleNestedInputChange('preferences', 'timezone', Array.from(keys)[0])
                }
              >
                {timezoneOptions.map(option => (
                  <SelectItem key={option.key}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
              <Select
                label="Language"
                selectedKeys={[formData.preferences?.language || 'English']}
                onSelectionChange={(keys) => 
                  handleNestedInputChange('preferences', 'language', Array.from(keys)[0])
                }
              >
                {languageOptions.map(option => (
                  <SelectItem key={option.key}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </CardBody>
        </Card>

        {/* Social Profiles */}
        <Card className="glass-card">
          <CardHeader>
            <h3 className="text-lg font-semibold">Social Profiles</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Website"
                value={formData.socialProfiles?.website || ''}
                onValueChange={(value) => handleNestedInputChange('socialProfiles', 'website', value)}
                placeholder="https://example.com"
                isInvalid={!!errors.website}
                errorMessage={errors.website}
                className="glass-input"
              />
              <Input
                label="LinkedIn"
                value={formData.socialProfiles?.linkedin || ''}
                onValueChange={(value) => handleNestedInputChange('socialProfiles', 'linkedin', value)}
                placeholder="https://linkedin.com/in/username"
                isInvalid={!!errors.linkedin}
                errorMessage={errors.linkedin}
                className="glass-input"
              />
            </div>
          </CardBody>
        </Card>

        {/* Notes */}
        <Card className="glass-card">
          <CardHeader>
            <h3 className="text-lg font-semibold">Notes</h3>
          </CardHeader>
          <CardBody>
            <Textarea
              placeholder="Add any additional notes about this customer..."
              value={formData.notes || ''}
              onValueChange={(value) => handleInputChange('notes', value)}
              className="glass-textarea"
              minRows={4}
            />
          </CardBody>
        </Card>
      </form>

      {/* Unsaved Changes Modal */}
      <Modal 
        isOpen={isUnsavedOpen} 
        onClose={onUnsavedClose}
        className="glass-modal"
      >
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
            <span>Unsaved Changes</span>
          </ModalHeader>
          <ModalBody>
            <p className="text-foreground/80">
              You have unsaved changes. Are you sure you want to leave without saving?
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onUnsavedClose}>
              Continue Editing
            </Button>
            <Button 
              color="danger" 
              onPress={() => {
                onUnsavedClose();
                onCancel();
              }}
            >
              Discard Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}