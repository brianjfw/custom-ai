'use client';

import { useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Input,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Textarea,
  Spinner,
  Divider,
  Avatar,
} from '@heroui/react';
import {
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  PlusIcon,
  ClockIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { trpc } from '@/lib/trpc';
import { CustomerInteraction } from '@/db/schema/customers';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface CustomerInteractionHistoryProps {
  customerId: string;
}

const interactionSchema = z.object({
  type: z.enum(['call', 'email', 'sms', 'meeting', 'note', 'service', 'complaint', 'feedback']),
  subject: z.string().min(1, 'Subject is required'),
  description: z.string().optional(),
  direction: z.enum(['inbound', 'outbound']),
  outcome: z.enum(['successful', 'follow_up_needed', 'not_interested', 'complaint_resolved']).optional(),
  followUpRequired: z.boolean(),
  followUpDate: z.string().optional(),
  followUpNotes: z.string().optional(),
});

type InteractionFormData = z.infer<typeof interactionSchema>;

const interactionTypeConfig = {
  call: {
    icon: PhoneIcon,
    color: 'primary',
    label: 'Phone Call',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    iconColor: 'text-blue-600',
  },
  email: {
    icon: EnvelopeIcon,
    color: 'secondary',
    label: 'Email',
    bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    iconColor: 'text-purple-600',
  },
  sms: {
    icon: ChatBubbleLeftRightIcon,
    color: 'success',
    label: 'SMS',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
    iconColor: 'text-green-600',
  },
  meeting: {
    icon: UserGroupIcon,
    color: 'warning',
    label: 'Meeting',
    bgColor: 'bg-amber-100 dark:bg-amber-900/20',
    iconColor: 'text-amber-600',
  },
  note: {
    icon: DocumentTextIcon,
    color: 'default',
    label: 'Note',
    bgColor: 'bg-gray-100 dark:bg-gray-900/20',
    iconColor: 'text-gray-600',
  },
  service: {
    icon: ArrowTopRightOnSquareIcon,
    color: 'primary',
    label: 'Service',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    iconColor: 'text-blue-600',
  },
  complaint: {
    icon: ExclamationTriangleIcon,
    color: 'danger',
    label: 'Complaint',
    bgColor: 'bg-red-100 dark:bg-red-900/20',
    iconColor: 'text-red-600',
  },
  feedback: {
    icon: HeartIcon,
    color: 'success',
    label: 'Feedback',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
    iconColor: 'text-green-600',
  },
};

const outcomeColors = {
  successful: 'success',
  follow_up_needed: 'warning',
  not_interested: 'danger',
  complaint_resolved: 'success',
} as const;

const sentimentColors = {
  positive: 'success',
  neutral: 'default',
  negative: 'danger',
} as const;

export function CustomerInteractionHistory({ customerId }: CustomerInteractionHistoryProps) {
  const [filterType, setFilterType] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const itemsPerPage = 10;
  const offset = (currentPage - 1) * itemsPerPage;

  // Fetch interactions
  const { data: interactions, isLoading, refetch } = trpc.customers.getInteractions.useQuery({
    customerId,
    limit: itemsPerPage,
    offset,
  });

  // Add interaction mutation
  const addInteractionMutation = trpc.customers.addInteraction.useMutation({
    onSuccess: () => {
      refetch();
      onClose();
      reset();
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<InteractionFormData>({
    resolver: zodResolver(interactionSchema),
    defaultValues: {
      type: 'note',
      direction: 'outbound',
      followUpRequired: false,
    },
  });

  const interactionType = watch('type');
  const followUpRequired = watch('followUpRequired');

  const onSubmit = async (data: InteractionFormData) => {
    try {
      await addInteractionMutation.mutateAsync({
        customerId,
        interactionType: data.type,
        subject: data.subject,
        description: data.description,
        outcome: data.outcome as any,
        followUpDate: data.followUpDate,
        priority: 'medium',
        metadata: {
          direction: data.direction,
          followUpRequired: data.followUpRequired,
          followUpNotes: data.followUpNotes,
        },
      });
    } catch (error) {
      console.error('Error adding interaction:', error);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const filteredInteractions = interactions?.filter(interaction => 
    filterType === 'all' || interaction.type === filterType
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Interaction History
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Track all customer communications and interactions
          </p>
        </div>
        <Button
          color="primary"
          startContent={<PlusIcon className="w-4 h-4" />}
          onPress={onOpen}
          className="glass-button"
        >
          Add Interaction
        </Button>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardBody className="p-4">
          <div className="flex gap-4">
            <Select
              placeholder="Filter by type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="min-w-[150px]"
            >
              <SelectItem key="all" value="all">All Types</SelectItem>
              {Object.entries(interactionTypeConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Interactions Timeline */}
      <Card className="glass-card">
        <CardBody className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : filteredInteractions.length > 0 ? (
            <div className="space-y-6">
              {filteredInteractions.map((interaction, index) => {
                const config = interactionTypeConfig[interaction.type as keyof typeof interactionTypeConfig];
                const IconComponent = config.icon;
                
                return (
                  <div key={interaction.id} className="relative">
                    {/* Timeline Line */}
                    {index < filteredInteractions.length - 1 && (
                      <div className="absolute left-6 top-12 bottom-0 w-px bg-gray-200 dark:bg-gray-700"></div>
                    )}
                    
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className={`flex-shrink-0 p-2 rounded-lg ${config.bgColor}`}>
                        <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {interaction.subject}
                              </h3>
                              <Chip
                                size="sm"
                                variant="flat"
                                color={config.color as any}
                                className="capitalize"
                              >
                                {config.label}
                              </Chip>
                              {interaction.direction && (
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  color="default"
                                  className="capitalize"
                                >
                                  {interaction.direction}
                                </Chip>
                              )}
                            </div>
                            
                            {interaction.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {interaction.description}
                              </p>
                            )}
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <ClockIcon className="w-4 h-4" />
                                <span>{formatDate(interaction.interactionDate)}</span>
                              </div>
                              
                              {interaction.duration && (
                                <div className="flex items-center gap-1">
                                  <span>Duration: {formatDuration(interaction.duration)}</span>
                                </div>
                              )}
                              
                              {interaction.outcome && (
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  color={outcomeColors[interaction.outcome as keyof typeof outcomeColors]}
                                  className="capitalize"
                                >
                                  {interaction.outcome.replace('_', ' ')}
                                </Chip>
                              )}
                              
                              {interaction.sentiment && (
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  color={sentimentColors[interaction.sentiment as keyof typeof sentimentColors]}
                                  className="capitalize"
                                >
                                  {interaction.sentiment}
                                </Chip>
                              )}
                            </div>
                            
                            {/* Follow-up Information */}
                            {interaction.followUpRequired && (
                              <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                                  <ClockIcon className="w-4 h-4" />
                                  <span className="font-medium">Follow-up Required</span>
                                </div>
                                {interaction.followUpDate && (
                                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                    Due: {formatDate(interaction.followUpDate)}
                                  </p>
                                )}
                                {interaction.followUpNotes && (
                                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                    {interaction.followUpNotes}
                                  </p>
                                )}
                              </div>
                            )}
                            
                            {/* AI Summary */}
                            {interaction.aiSummary && (
                              <div className="mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                                  AI Summary
                                </h4>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                  {interaction.aiSummary}
                                </p>
                              </div>
                            )}
                            
                            {/* Key Points */}
                            {interaction.keyPoints && interaction.keyPoints.length > 0 && (
                              <div className="mt-3">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                  Key Points
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {interaction.keyPoints.map((point, pointIndex) => (
                                    <Chip
                                      key={pointIndex}
                                      size="sm"
                                      variant="flat"
                                      color="secondary"
                                    >
                                      {point}
                                    </Chip>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No interactions found</p>
              <Button
                color="primary"
                variant="flat"
                onPress={onOpen}
              >
                Add first interaction
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Add Interaction Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>Add New Interaction</ModalHeader>
          <ModalBody>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  {...register('type')}
                  label="Interaction Type"
                  placeholder="Select type"
                  selectedKeys={[interactionType]}
                  onSelectionChange={(keys) => setValue('type', Array.from(keys)[0] as any)}
                  isRequired
                >
                  {Object.entries(interactionTypeConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </Select>
                
                <Select
                  {...register('direction')}
                  label="Direction"
                  placeholder="Select direction"
                  selectedKeys={[watch('direction')]}
                  onSelectionChange={(keys) => setValue('direction', Array.from(keys)[0] as any)}
                  isRequired
                >
                  <SelectItem key="inbound" value="inbound">Inbound</SelectItem>
                  <SelectItem key="outbound" value="outbound">Outbound</SelectItem>
                </Select>
              </div>
              
              <Input
                {...register('subject')}
                label="Subject"
                placeholder="Enter interaction subject"
                isRequired
                isInvalid={!!errors.subject}
                errorMessage={errors.subject?.message}
                classNames={{
                  input: "glass-input",
                  inputWrapper: "glass-input-wrapper",
                }}
              />
              
              <Textarea
                {...register('description')}
                label="Description"
                placeholder="Enter detailed description of the interaction"
                rows={3}
                classNames={{
                  input: "glass-input",
                  inputWrapper: "glass-input-wrapper",
                }}
              />
              
              <Select
                {...register('outcome')}
                label="Outcome"
                placeholder="Select outcome"
                selectedKeys={watch('outcome') ? [watch('outcome')] : []}
                onSelectionChange={(keys) => setValue('outcome', Array.from(keys)[0] as any)}
              >
                <SelectItem key="successful" value="successful">Successful</SelectItem>
                <SelectItem key="follow_up_needed" value="follow_up_needed">Follow-up Needed</SelectItem>
                <SelectItem key="not_interested" value="not_interested">Not Interested</SelectItem>
                <SelectItem key="complaint_resolved" value="complaint_resolved">Complaint Resolved</SelectItem>
              </Select>
              
              <div className="flex items-center gap-2">
                <input
                  {...register('followUpRequired')}
                  type="checkbox"
                  id="followUpRequired"
                  className="rounded"
                />
                <label htmlFor="followUpRequired" className="text-sm">
                  Follow-up required
                </label>
              </div>
              
              {followUpRequired && (
                <div className="space-y-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                  <Input
                    {...register('followUpDate')}
                    label="Follow-up Date"
                    type="datetime-local"
                    classNames={{
                      input: "glass-input",
                      inputWrapper: "glass-input-wrapper",
                    }}
                  />
                  <Textarea
                    {...register('followUpNotes')}
                    label="Follow-up Notes"
                    placeholder="Enter follow-up notes"
                    rows={2}
                    classNames={{
                      input: "glass-input",
                      inputWrapper: "glass-input-wrapper",
                    }}
                  />
                </div>
              )}
            </form>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleSubmit(onSubmit)}
              isLoading={addInteractionMutation.isPending}
              className="glass-button"
            >
              Add Interaction
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}