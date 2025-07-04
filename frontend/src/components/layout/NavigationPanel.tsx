'use client';

import React, { useState, useMemo } from 'react';
import { Button, Avatar, Divider, Chip } from '@heroui/react';
import { useUser } from '@clerk/nextjs';
import { 
  HomeIcon, 
  ChartBarIcon, 
  UsersIcon, 
  DocumentTextIcon,
  CogIcon,
  XMarkIcon,
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import GlassmorphismCard from '../ui/GlassmorphismCard';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string | number;
  isActive?: boolean;
  timestamp?: Date;
}

interface NavigationGroup {
  id: string;
  label: string;
  items: NavigationItem[];
  timestamp?: Date;
}

interface NavigationPanelProps {
  children?: React.ReactNode;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
  'data-testid'?: string;
}

// Sample navigation data with time-based grouping
const getNavigationData = (): NavigationGroup[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  return [
    {
      id: 'today',
      label: 'Today',
      timestamp: today,
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: HomeIcon,
          href: '/dashboard',
          isActive: true,
          timestamp: new Date(now.getTime() - 5 * 60 * 1000) // 5 minutes ago
        },
        {
          id: 'customers',
          label: 'Customers',
          icon: UsersIcon,
          href: '/customers',
          badge: 3,
          timestamp: new Date(now.getTime() - 15 * 60 * 1000) // 15 minutes ago
        },
        {
          id: 'ai-assistant',
          label: 'AI Assistant',
          icon: SparklesIcon,
          href: '/ai',
          badge: 'NEW',
          timestamp: new Date(now.getTime() - 30 * 60 * 1000) // 30 minutes ago
        }
      ]
    },
    {
      id: 'yesterday',
      label: 'Yesterday',
      timestamp: yesterday,
      items: [
        {
          id: 'reports',
          label: 'Reports',
          icon: ChartBarIcon,
          href: '/reports',
          timestamp: new Date(yesterday.getTime() + 14 * 60 * 60 * 1000) // Yesterday 2 PM
        },
        {
          id: 'invoices',
          label: 'Invoices',
          icon: DocumentTextIcon,
          href: '/invoices',
          badge: 2,
          timestamp: new Date(yesterday.getTime() + 10 * 60 * 60 * 1000) // Yesterday 10 AM
        }
      ]
    },
    {
      id: 'this-week',
      label: 'This Week',
      timestamp: thisWeek,
      items: [
        {
          id: 'settings',
          label: 'Settings',
          icon: CogIcon,
          href: '/settings',
          timestamp: new Date(thisWeek.getTime() + 2 * 24 * 60 * 60 * 1000) // 2 days ago
        }
      ]
    }
  ];
};

const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

export const NavigationPanel: React.FC<NavigationPanelProps> = ({
  children,
  className,
  isOpen = true,
  onClose,
  isMobile = false,
  'data-testid': testId,
}) => {
  const { user } = useUser();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['today']));
  
  const navigationData = useMemo(() => getNavigationData(), []);

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const panelClasses = cn(
    'h-full flex flex-col',
    'bg-gradient-to-b from-white/30 to-white/10',
    'backdrop-blur-xl border-r border-white/20',
    'relative overflow-hidden',
    className
  );

  const headerClasses = cn(
    'p-6 border-b border-white/10',
    'bg-white/10 backdrop-blur-sm'
  );

  const contentClasses = cn(
    'flex-1 overflow-y-auto p-4 space-y-6',
    // Custom scrollbar styling
    'scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent'
  );

  const navigationItemClasses = (item: NavigationItem) => cn(
    'flex items-center justify-between w-full p-3 rounded-2xl',
    'text-left transition-all duration-200',
    'hover:bg-white/20 hover:backdrop-blur-sm',
    'focus:outline-none focus:ring-2 focus:ring-white/30',
    item.isActive && 'bg-white/30 shadow-lg shadow-black/10'
  );

  return (
    <div className={panelClasses} data-testid={testId}>
      {/* Header */}
      <div className={headerClasses}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar
              src={user?.imageUrl}
              name={user?.fullName || user?.emailAddresses[0]?.emailAddress || 'User'}
              size="md"
              className="border-2 border-white/20"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {user?.fullName || 'Welcome'}
              </p>
              <p className="text-xs text-gray-600">
                {user?.emailAddresses[0]?.emailAddress}
              </p>
            </div>
          </div>
          
          {/* Mobile close button */}
          {isMobile && onClose && (
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onPress={onClose}
              aria-label="Close navigation"
              className="text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Content */}
      <div className={contentClasses}>
        {/* Time-based Navigation Groups */}
        {navigationData.map((group) => (
          <div key={group.id} className="space-y-2">
            <Button
              variant="light"
              className="w-full justify-between p-3 h-auto"
              onPress={() => toggleGroup(group.id)}
              aria-expanded={expandedGroups.has(group.id)}
              aria-controls={`nav-group-${group.id}`}
            >
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {group.label}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {group.items.length} items
              </span>
            </Button>

            {/* Navigation Items */}
            {expandedGroups.has(group.id) && (
              <div
                id={`nav-group-${group.id}`}
                className="space-y-1 animate-in slide-in-from-top-2 duration-200"
              >
                {group.items.map((item) => (
                  <GlassmorphismCard
                    key={item.id}
                    variant="subtle"
                    className="p-0 overflow-hidden"
                    hoverable
                    onClick={() => {
                      // Handle navigation
                      if (isMobile && onClose) {
                        onClose();
                      }
                    }}
                  >
                    <button className={navigationItemClasses(item)}>
                      <div className="flex items-center space-x-3">
                        <item.icon className="h-5 w-5 text-gray-600" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              {item.label}
                            </span>
                            {item.badge && (
                              <Chip
                                size="sm"
                                variant="flat"
                                color={typeof item.badge === 'string' ? 'primary' : 'secondary'}
                                className="text-xs"
                              >
                                {item.badge}
                              </Chip>
                            )}
                          </div>
                          {item.timestamp && (
                            <p className="text-xs text-gray-500 mt-1">
                              {formatRelativeTime(item.timestamp)}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  </GlassmorphismCard>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Custom Navigation Content */}
        {children && (
          <>
            <Divider className="my-4 bg-white/20" />
            <div className="space-y-4">
              {children}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NavigationPanel;