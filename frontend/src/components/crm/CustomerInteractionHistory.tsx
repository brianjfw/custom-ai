'use client';

import React, { useState } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader,
  Button,
  Chip,
  Avatar,
  Select,
  SelectItem,
  Input,
  Textarea,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Pagination
} from '@heroui/react';
import { 
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftEllipsisIcon,
  CalendarIcon,
  UserIcon,
  ClockIcon,
  PlusIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface Interaction {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'order' | 'support';
  title: string;
  description?: string;
  date: Date;
  duration?: number; // in minutes
  outcome?: 'positive' | 'neutral' | 'negative';
  tags?: string[];
  attachments?: string[];
  createdBy?: string;
  relatedOrderId?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'completed' | 'pending' | 'cancelled';
}

interface CustomerInteractionHistoryProps {
  customerId: string;
  onAddInteraction?: (interaction: Omit<Interaction, 'id' | 'date' | 'createdBy'>) => void;
  className?: string;
}

const mockInteractions: Interaction[] = [
  {
    id: '1',
    type: 'order',
    title: 'Order #ORD-2024-001 Completed',
    description: 'Premium service package delivered successfully. Customer was very satisfied with the quality.',
    date: new Date('2024-12-27T10:30:00'),
    outcome: 'positive',
    tags: ['order', 'premium'],
    status: 'completed',
    relatedOrderId: 'ORD-2024-001',
    createdBy: 'System'
  },
  {
    id: '2',
    type: 'call',
    title: 'Follow-up Call',
    description: 'Discussed upcoming project requirements and timeline. Customer requested additional features.',
    date: new Date('2024-12-25T14:15:00'),
    duration: 25,
    outcome: 'positive',
    tags: ['follow-up', 'project'],
    status: 'completed',
    createdBy: 'John Smith'
  },
  {
    id: '3',
    type: 'email',
    title: 'Quote Sent',
    description: 'Detailed quote for Q1 2025 services sent via email. Awaiting customer response.',
    date: new Date('2024-12-20T09:45:00'),
    outcome: 'neutral',
    tags: ['quote', 'proposal'],
    status: 'pending',
    createdBy: 'Sarah Johnson'
  },
  {
    id: '4',
    type: 'meeting',
    title: 'Strategy Session',
    description: 'In-person meeting to discuss long-term partnership and expansion opportunities.',
    date: new Date('2024-12-18T16:00:00'),
    duration: 90,
    outcome: 'positive',
    tags: ['strategy', 'partnership'],
    status: 'completed',
    priority: 'high',
    createdBy: 'Mike Rodriguez'
  },
  {
    id: '5',
    type: 'support',
    title: 'Technical Support',
    description: 'Resolved billing inquiry and updated account settings per customer request.',
    date: new Date('2024-12-15T11:20:00'),
    duration: 15,
    outcome: 'positive',
    tags: ['support', 'billing'],
    status: 'completed',
    createdBy: 'Support Team'
  },
  {
    id: '6',
    type: 'note',
    title: 'Customer Preference Update',
    description: 'Customer prefers email communication over phone calls. Updated preferences in system.',
    date: new Date('2024-12-10T13:30:00'),
    outcome: 'neutral',
    tags: ['preferences', 'communication'],
    status: 'completed',
    createdBy: 'Jennifer Walsh'
  }
];

const interactionIcons = {
  call: PhoneIcon,
  email: EnvelopeIcon,
  meeting: CalendarIcon,
  note: DocumentTextIcon,
  order: CheckCircleIcon,
  support: InformationCircleIcon
};

const interactionColors = {
  call: 'primary',
  email: 'secondary',
  meeting: 'success',
  note: 'warning',
  order: 'success',
  support: 'danger'
} as const;

const outcomeColors = {
  positive: 'success',
  neutral: 'default',
  negative: 'danger'
} as const;

const outcomeLabels = {
  positive: 'Positive',
  neutral: 'Neutral',
  negative: 'Negative'
};

export function CustomerInteractionHistory({ 
  customerId, 
  onAddInteraction,
  className = ''
}: CustomerInteractionHistoryProps) {
  const [interactions, setInteractions] = useState(mockInteractions);
  const [filterType, setFilterType] = useState<'all' | Interaction['type']>('all');
  const [filterOutcome, setFilterOutcome] = useState<'all' | Interaction['outcome']>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  
  // New interaction form state
  const [newInteraction, setNewInteraction] = useState({
    type: 'note' as Interaction['type'],
    title: '',
    description: '',
    duration: '',
    outcome: 'neutral' as Interaction['outcome'],
    priority: 'medium' as Interaction['priority']
  });

  const itemsPerPage = 10;

  const filteredInteractions = interactions.filter(interaction => {
    const matchesType = filterType === 'all' || interaction.type === filterType;
    const matchesOutcome = filterOutcome === 'all' || interaction.outcome === filterOutcome;
    return matchesType && matchesOutcome;
  });

  const paginatedInteractions = filteredInteractions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredInteractions.length / itemsPerPage);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const handleAddInteraction = () => {
    const interaction = {
      id: Date.now().toString(),
      ...newInteraction,
      date: new Date(),
      duration: newInteraction.duration ? parseInt(newInteraction.duration) : undefined,
      createdBy: 'Current User'
    };

    setInteractions(prev => [interaction, ...prev]);
    
    // Create properly typed interaction for callback
    const callbackInteraction = {
      ...newInteraction,
      duration: newInteraction.duration ? parseInt(newInteraction.duration) : undefined
    };
    onAddInteraction?.(callbackInteraction);
    
    // Reset form
    setNewInteraction({
      type: 'note',
      title: '',
      description: '',
      duration: '',
      outcome: 'neutral',
      priority: 'medium'
    });
    
    onAddClose();
  };

  const getInteractionIcon = (type: Interaction['type']) => {
    const IconComponent = interactionIcons[type];
    return <IconComponent className="w-5 h-5" />;
  };

  const renderInteractionCard = (interaction: Interaction, index: number) => {
    const isLast = index === paginatedInteractions.length - 1;
    
    return (
      <div key={interaction.id} className="relative">
        {/* Timeline Line */}
        {!isLast && (
          <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 to-transparent"></div>
        )}
        
        <Card className="glass-card hover:glass-card-elevated transition-all duration-300 animate-glass-entrance ml-16">
          <CardBody className="p-4">
            {/* Timeline Dot */}
            <div className="absolute -left-8 top-4 w-8 h-8 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center backdrop-blur-sm">
              {getInteractionIcon(interaction.type)}
            </div>
            
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold text-foreground">{interaction.title}</h4>
                  <Chip
                    size="sm"
                    color={interactionColors[interaction.type]}
                    variant="flat"
                    className="text-xs"
                  >
                    {interaction.type.charAt(0).toUpperCase() + interaction.type.slice(1)}
                  </Chip>
                  {interaction.outcome && (
                    <Chip
                      size="sm"
                      color={outcomeColors[interaction.outcome]}
                      variant="flat"
                      className="text-xs"
                    >
                      {outcomeLabels[interaction.outcome]}
                    </Chip>
                  )}
                  {interaction.priority === 'high' && (
                    <Chip
                      size="sm"
                      color="danger"
                      variant="flat"
                      className="text-xs"
                    >
                      High Priority
                    </Chip>
                  )}
                </div>
                
                {interaction.description && (
                  <p className="text-sm text-foreground/70 mb-3 leading-relaxed">
                    {interaction.description}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-xs text-foreground/60">
                  <div className="flex items-center gap-1">
                    <ClockIcon className="w-3 h-3" />
                    <span>{formatDate(interaction.date)} at {formatTime(interaction.date)}</span>
                  </div>
                  {interaction.duration && (
                    <div className="flex items-center gap-1">
                      <span>Duration: {formatDuration(interaction.duration)}</span>
                    </div>
                  )}
                  {interaction.createdBy && (
                    <div className="flex items-center gap-1">
                      <UserIcon className="w-3 h-3" />
                      <span>by {interaction.createdBy}</span>
                    </div>
                  )}
                </div>
                
                {interaction.tags && interaction.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {interaction.tags.map(tag => (
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
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Interaction History</h3>
          <p className="text-sm text-foreground/70 mt-1">
            Track all customer communications and activities
          </p>
        </div>
        <Button
          color="primary"
          startContent={<PlusIcon className="w-4 h-4" />}
          onPress={onAddOpen}
          className="glass-button-primary"
        >
          Add Interaction
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select
          size="sm"
          placeholder="All Types"
          selectedKeys={[filterType]}
          onSelectionChange={(keys) => setFilterType(Array.from(keys)[0] as any)}
          className="min-w-40"
        >
          <SelectItem key="all">All Types</SelectItem>
          <SelectItem key="call">Calls</SelectItem>
          <SelectItem key="email">Emails</SelectItem>
          <SelectItem key="meeting">Meetings</SelectItem>
          <SelectItem key="note">Notes</SelectItem>
          <SelectItem key="order">Orders</SelectItem>
          <SelectItem key="support">Support</SelectItem>
        </Select>
        
        <Select
          size="sm"
          placeholder="All Outcomes"
          selectedKeys={filterOutcome ? [filterOutcome] : []}
          onSelectionChange={(keys) => setFilterOutcome(Array.from(keys)[0] as any)}
          className="min-w-40"
        >
          <SelectItem key="all">All Outcomes</SelectItem>
          <SelectItem key="positive">Positive</SelectItem>
          <SelectItem key="neutral">Neutral</SelectItem>
          <SelectItem key="negative">Negative</SelectItem>
        </Select>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-foreground/70">
          Showing {paginatedInteractions.length} of {filteredInteractions.length} interactions
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {paginatedInteractions.length === 0 ? (
          <div className="text-center py-12">
            <ClockIcon className="w-16 h-16 text-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground/70 mb-2">No interactions found</h3>
            <p className="text-foreground/50 mb-4">
              {filterType !== 'all' || filterOutcome !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Start tracking customer interactions'
              }
            </p>
            <Button
              color="primary"
              startContent={<PlusIcon className="w-4 h-4" />}
              onPress={onAddOpen}
              className="glass-button-primary"
            >
              Add First Interaction
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {paginatedInteractions.map((interaction, index) => 
                renderInteractionCard(interaction, index)
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

      {/* Add Interaction Modal */}
      <Modal 
        isOpen={isAddOpen} 
        onClose={onAddClose}
        size="2xl"
        className="glass-modal"
      >
        <ModalContent>
          <ModalHeader>
            <h3 className="text-lg font-semibold">Add New Interaction</h3>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Type"
                selectedKeys={[newInteraction.type]}
                onSelectionChange={(keys) => 
                  setNewInteraction(prev => ({ ...prev, type: Array.from(keys)[0] as any }))
                }
              >
                <SelectItem key="call">Call</SelectItem>
                <SelectItem key="email">Email</SelectItem>
                <SelectItem key="meeting">Meeting</SelectItem>
                <SelectItem key="note">Note</SelectItem>
                <SelectItem key="order">Order</SelectItem>
                <SelectItem key="support">Support</SelectItem>
              </Select>
              
              <Select
                label="Outcome"
                selectedKeys={newInteraction.outcome ? [newInteraction.outcome] : []}
                onSelectionChange={(keys) => 
                  setNewInteraction(prev => ({ ...prev, outcome: Array.from(keys)[0] as any }))
                }
              >
                <SelectItem key="positive">Positive</SelectItem>
                <SelectItem key="neutral">Neutral</SelectItem>
                <SelectItem key="negative">Negative</SelectItem>
              </Select>
            </div>
            
            <Input
              label="Title"
              value={newInteraction.title}
              onValueChange={(value) => 
                setNewInteraction(prev => ({ ...prev, title: value }))
              }
              className="glass-input"
            />
            
            <Textarea
              label="Description"
              placeholder="Add details about this interaction..."
              value={newInteraction.description}
              onValueChange={(value) => 
                setNewInteraction(prev => ({ ...prev, description: value }))
              }
              className="glass-textarea"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Duration (minutes)"
                type="number"
                placeholder="Optional"
                value={newInteraction.duration}
                onValueChange={(value) => 
                  setNewInteraction(prev => ({ ...prev, duration: value }))
                }
                className="glass-input"
              />
              
              <Select
                label="Priority"
                selectedKeys={newInteraction.priority ? [newInteraction.priority] : []}
                onSelectionChange={(keys) => 
                  setNewInteraction(prev => ({ ...prev, priority: Array.from(keys)[0] as any }))
                }
              >
                <SelectItem key="low">Low</SelectItem>
                <SelectItem key="medium">Medium</SelectItem>
                <SelectItem key="high">High</SelectItem>
              </Select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onAddClose}>
              Cancel
            </Button>
            <Button 
              color="primary" 
              onPress={handleAddInteraction}
              isDisabled={!newInteraction.title.trim()}
              className="glass-button-primary"
            >
              Add Interaction
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}