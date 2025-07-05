'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  Input,
  Select,
  SelectItem,
  Textarea,
  Card,
  CardBody,
  CardHeader,
  Switch,
  Divider,
  Chip,
} from '@heroui/react';
import { 
  UserIcon, 
  BuildingOfficeIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  MapPinIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { trpc } from '@/lib/trpc';
import { Customer } from '@/db/schema/customers';

const customerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  jobTitle: z.string().optional(),
  industry: z.string().optional(),
  customerType: z.enum(['individual', 'business']),
  status: z.enum(['active', 'inactive', 'prospect', 'churned']),
  priority: z.enum(['low', 'medium', 'high', 'vip']),
  marketingOptIn: z.boolean(),
  // Address fields
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  // Communication preferences
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  phoneNotifications: z.boolean(),
  preferredContactTime: z.enum(['morning', 'afternoon', 'evening', 'business_hours']),
  // Notes
  notes: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  customer?: Customer;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const industries = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing',
  'Construction', 'Real Estate', 'Legal', 'Consulting', 'Other'
];

const states = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export function CustomerForm({ customer, onSuccess, onCancel }: CustomerFormProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: customer ? {
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email || '',
      phone: customer.phone || '',
      companyName: customer.companyName || '',
      jobTitle: customer.jobTitle || '',
      industry: customer.industry || '',
      customerType: customer.customerType,
      status: customer.status,
      priority: customer.priority,
      marketingOptIn: customer.marketingOptIn,
      street: customer.address?.street || '',
      city: customer.address?.city || '',
      state: customer.address?.state || '',
      zipCode: customer.address?.zipCode || '',
      country: customer.address?.country || 'US',
      emailNotifications: customer.communicationPreferences?.email ?? true,
      smsNotifications: customer.communicationPreferences?.sms ?? false,
      phoneNotifications: customer.communicationPreferences?.phone ?? true,
      preferredContactTime: customer.communicationPreferences?.preferredTime as any || 'business_hours',
      notes: '',
    } : {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      companyName: '',
      jobTitle: '',
      industry: '',
      customerType: 'individual',
      status: 'prospect',
      priority: 'medium',
      marketingOptIn: false,
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
      emailNotifications: true,
      smsNotifications: false,
      phoneNotifications: true,
      preferredContactTime: 'business_hours',
      notes: '',
    },
  });

  const customerType = watch('customerType');
  const createMutation = trpc.customers.create.useMutation();
  const updateMutation = trpc.customers.update.useMutation();

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = async (data: CustomerFormData) => {
    setIsSubmitting(true);
    
    try {
      const customerData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || undefined,
        phone: data.phone || undefined,
        companyName: data.companyName || undefined,
        jobTitle: data.jobTitle || undefined,
        industry: data.industry || undefined,
        customerType: data.customerType,
        status: data.status,
        priority: data.priority,
        marketingOptIn: data.marketingOptIn,
        tags,
        address: data.street ? {
          street: data.street,
          city: data.city!,
          state: data.state!,
          zipCode: data.zipCode!,
          country: data.country || 'US',
          isPrimary: true,
          addressType: 'home' as const,
        } : undefined,
        communicationPreferences: {
          email: data.emailNotifications,
          sms: data.smsNotifications,
          phone: data.phoneNotifications,
          push: false,
          preferredTime: data.preferredContactTime,
          frequency: 'as_needed' as const,
        },
      };

      if (customer) {
        await updateMutation.mutateAsync({
          id: customer.id,
          data: customerData,
        });
      } else {
        await createMutation.mutateAsync(customerData);
      }

      onSuccess?.();
    } catch (error) {
      console.error('Error saving customer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Basic Information</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              {...register('firstName')}
              label="First Name"
              placeholder="Enter first name"
              isRequired
              isInvalid={!!errors.firstName}
              errorMessage={errors.firstName?.message}
              classNames={{
                input: "glass-input",
                inputWrapper: "glass-input-wrapper",
              }}
            />
            <Input
              {...register('lastName')}
              label="Last Name"
              placeholder="Enter last name"
              isRequired
              isInvalid={!!errors.lastName}
              errorMessage={errors.lastName?.message}
              classNames={{
                input: "glass-input",
                inputWrapper: "glass-input-wrapper",
              }}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              {...register('email')}
              label="Email"
              type="email"
              placeholder="Enter email address"
              startContent={<EnvelopeIcon className="w-4 h-4 text-gray-400" />}
              isInvalid={!!errors.email}
              errorMessage={errors.email?.message}
              classNames={{
                input: "glass-input",
                inputWrapper: "glass-input-wrapper",
              }}
            />
            <Input
              {...register('phone')}
              label="Phone"
              type="tel"
              placeholder="Enter phone number"
              startContent={<PhoneIcon className="w-4 h-4 text-gray-400" />}
              classNames={{
                input: "glass-input",
                inputWrapper: "glass-input-wrapper",
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              {...register('customerType')}
              label="Customer Type"
              placeholder="Select type"
              selectedKeys={[customerType]}
              onSelectionChange={(keys) => setValue('customerType', Array.from(keys)[0] as any)}
            >
              <SelectItem key="individual" value="individual">
                Individual
              </SelectItem>
              <SelectItem key="business" value="business">
                Business
              </SelectItem>
            </Select>
            
            <Select
              {...register('status')}
              label="Status"
              placeholder="Select status"
              selectedKeys={[watch('status')]}
              onSelectionChange={(keys) => setValue('status', Array.from(keys)[0] as any)}
            >
              <SelectItem key="prospect" value="prospect">Prospect</SelectItem>
              <SelectItem key="active" value="active">Active</SelectItem>
              <SelectItem key="inactive" value="inactive">Inactive</SelectItem>
              <SelectItem key="churned" value="churned">Churned</SelectItem>
            </Select>
            
            <Select
              {...register('priority')}
              label="Priority"
              placeholder="Select priority"
              selectedKeys={[watch('priority')]}
              onSelectionChange={(keys) => setValue('priority', Array.from(keys)[0] as any)}
            >
              <SelectItem key="low" value="low">Low</SelectItem>
              <SelectItem key="medium" value="medium">Medium</SelectItem>
              <SelectItem key="high" value="high">High</SelectItem>
              <SelectItem key="vip" value="vip">VIP</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Business Information */}
      {customerType === 'business' && (
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <BuildingOfficeIcon className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Business Information</h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                {...register('companyName')}
                label="Company Name"
                placeholder="Enter company name"
                classNames={{
                  input: "glass-input",
                  inputWrapper: "glass-input-wrapper",
                }}
              />
              <Input
                {...register('jobTitle')}
                label="Job Title"
                placeholder="Enter job title"
                classNames={{
                  input: "glass-input",
                  inputWrapper: "glass-input-wrapper",
                }}
              />
            </div>
            
            <Select
              {...register('industry')}
              label="Industry"
              placeholder="Select industry"
              selectedKeys={watch('industry') ? [watch('industry')] : []}
              onSelectionChange={(keys) => setValue('industry', Array.from(keys)[0] as string)}
            >
              {industries.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </Select>
          </CardBody>
        </Card>
      )}

      {/* Address Information */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <MapPinIcon className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Address Information</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            {...register('street')}
            label="Street Address"
            placeholder="Enter street address"
            classNames={{
              input: "glass-input",
              inputWrapper: "glass-input-wrapper",
            }}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              {...register('city')}
              label="City"
              placeholder="Enter city"
              classNames={{
                input: "glass-input",
                inputWrapper: "glass-input-wrapper",
              }}
            />
            <Select
              {...register('state')}
              label="State"
              placeholder="Select state"
              selectedKeys={watch('state') ? [watch('state')] : []}
              onSelectionChange={(keys) => setValue('state', Array.from(keys)[0] as string)}
            >
              {states.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </Select>
            <Input
              {...register('zipCode')}
              label="ZIP Code"
              placeholder="Enter ZIP code"
              classNames={{
                input: "glass-input",
                inputWrapper: "glass-input-wrapper",
              }}
            />
            <Input
              {...register('country')}
              label="Country"
              placeholder="Enter country"
              classNames={{
                input: "glass-input",
                inputWrapper: "glass-input-wrapper",
              }}
            />
          </div>
        </CardBody>
      </Card>

      {/* Communication Preferences */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <h3 className="text-lg font-semibold">Communication Preferences</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Switch
                {...register('emailNotifications')}
                isSelected={watch('emailNotifications')}
                onValueChange={(value) => setValue('emailNotifications', value)}
              >
                Email Notifications
              </Switch>
              <Switch
                {...register('smsNotifications')}
                isSelected={watch('smsNotifications')}
                onValueChange={(value) => setValue('smsNotifications', value)}
              >
                SMS Notifications
              </Switch>
              <Switch
                {...register('phoneNotifications')}
                isSelected={watch('phoneNotifications')}
                onValueChange={(value) => setValue('phoneNotifications', value)}
              >
                Phone Notifications
              </Switch>
              <Switch
                {...register('marketingOptIn')}
                isSelected={watch('marketingOptIn')}
                onValueChange={(value) => setValue('marketingOptIn', value)}
              >
                Marketing Opt-in
              </Switch>
            </div>
            
            <div>
              <Select
                {...register('preferredContactTime')}
                label="Preferred Contact Time"
                placeholder="Select preferred time"
                selectedKeys={[watch('preferredContactTime')]}
                onSelectionChange={(keys) => setValue('preferredContactTime', Array.from(keys)[0] as any)}
              >
                <SelectItem key="morning" value="morning">Morning</SelectItem>
                <SelectItem key="afternoon" value="afternoon">Afternoon</SelectItem>
                <SelectItem key="evening" value="evening">Evening</SelectItem>
                <SelectItem key="business_hours" value="business_hours">Business Hours</SelectItem>
              </Select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Tags */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <h3 className="text-lg font-semibold">Tags</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Chip
                key={tag}
                onClose={() => removeTag(tag)}
                variant="flat"
                color="primary"
              >
                {tag}
              </Chip>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              classNames={{
                input: "glass-input",
                inputWrapper: "glass-input-wrapper",
              }}
            />
            <Button
              isIconOnly
              color="primary"
              variant="flat"
              onPress={addTag}
              isDisabled={!newTag.trim()}
            >
              <PlusIcon className="w-4 h-4" />
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Notes */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <h3 className="text-lg font-semibold">Notes</h3>
        </CardHeader>
        <CardBody>
          <Textarea
            {...register('notes')}
            placeholder="Add any additional notes about this customer..."
            rows={3}
            classNames={{
              input: "glass-input",
              inputWrapper: "glass-input-wrapper",
            }}
          />
        </CardBody>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button
            variant="light"
            onPress={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          color="primary"
          isLoading={isSubmitting}
          className="glass-button"
        >
          {customer ? 'Update Customer' : 'Create Customer'}
        </Button>
      </div>
    </form>
  );
}