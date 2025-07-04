'use client';

import React, { useState, useEffect } from 'react';
import { Button, Breadcrumbs, BreadcrumbItem } from '@heroui/react';
import { 
  Bars3Icon, 
  MagnifyingGlassIcon,
  BellIcon,
  QuestionMarkCircleIcon 
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import GlassmorphismCard from '../ui/GlassmorphismCard';

interface ContentWorkspaceProps {
  children: React.ReactNode;
  className?: string;
  onToggleNavigation?: () => void;
  showNavigationToggle?: boolean;
  isNavigationOpen?: boolean;
  title?: string;
  subtitle?: string;
  breadcrumbs?: Array<{ label: string; href?: string; isActive?: boolean }>;
  actions?: React.ReactNode;
  'data-testid'?: string;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

export const ContentWorkspace: React.FC<ContentWorkspaceProps> = ({
  children,
  className,
  onToggleNavigation,
  showNavigationToggle = false,
  isNavigationOpen = false,
  title = 'Dashboard',
  subtitle = 'Manage your business operations',
  breadcrumbs = [{ label: 'Dashboard', isActive: true }],
  actions,
  'data-testid': testId,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [quickActions] = useState<QuickAction[]>([
    {
      id: 'search',
      label: 'Search',
      icon: MagnifyingGlassIcon,
      action: () => console.log('Search clicked'),
      variant: 'secondary'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: BellIcon,
      action: () => console.log('Notifications clicked'),
      variant: 'secondary'
    },
    {
      id: 'help',
      label: 'Help',
      icon: QuestionMarkCircleIcon,
      action: () => console.log('Help clicked'),
      variant: 'secondary'
    }
  ]);

  // Handle scroll to show/hide header glass effect
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLDivElement;
      setScrolled(target.scrollTop > 10);
    };

    const contentElement = document.querySelector('[data-content-scroll]');
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
      return () => contentElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const workspaceClasses = cn(
    'h-full flex flex-col',
    'bg-gradient-to-br from-white/20 to-white/5',
    'backdrop-blur-sm',
    'relative overflow-hidden',
    className
  );

  const headerClasses = cn(
    'relative z-10 p-6 border-b border-white/10',
    'transition-all duration-300',
    scrolled && 'bg-white/30 backdrop-blur-lg shadow-lg shadow-black/5'
  );

  const contentClasses = cn(
    'flex-1 overflow-y-auto p-6',
    'scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent'
  );

  const actionButtonClasses = cn(
    'bg-white/20 hover:bg-white/30 backdrop-blur-sm',
    'border border-white/20 hover:border-white/30',
    'transition-all duration-200'
  );

  return (
    <div className={workspaceClasses} data-testid={testId}>
      {/* Header Bar */}
      <div className={headerClasses}>
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {/* Mobile Navigation Toggle */}
            {showNavigationToggle && (
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onPress={onToggleNavigation}
                aria-label={isNavigationOpen ? 'Close navigation' : 'Open navigation'}
                className={actionButtonClasses}
              >
                <Bars3Icon className="h-5 w-5" />
              </Button>
            )}

            {/* Breadcrumbs */}
            <div className="flex flex-col space-y-1">
                             <Breadcrumbs
                 size="sm"
                 variant="light"
                 className="text-gray-600"
                 classNames={{
                   separator: 'text-gray-400'
                 }}
               >
                {breadcrumbs.map((crumb, index) => (
                  <BreadcrumbItem
                    key={index}
                    href={crumb.href}
                    isCurrent={crumb.isActive}
                    className={cn(
                      crumb.isActive && 'text-gray-900 font-medium'
                    )}
                  >
                    {crumb.label}
                  </BreadcrumbItem>
                ))}
              </Breadcrumbs>
              
              {/* Title and Subtitle */}
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm text-gray-600 mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2">
            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  isIconOnly
                  variant="light"
                  size="sm"
                  onPress={action.action}
                  aria-label={action.label}
                  className={actionButtonClasses}
                >
                  <action.icon className="h-5 w-5" />
                </Button>
              ))}
            </div>

            {/* Custom Actions */}
            {actions && (
              <div className="flex items-center space-x-2 ml-4 border-l border-white/20 pl-4">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div 
        className={contentClasses}
        data-content-scroll
        role="main"
        aria-label="Main content area"
      >
        {/* Content Background Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-white/10 pointer-events-none" />
        
        {/* Content Wrapper */}
        <div className="relative z-10">
          {/* Welcome Message Card */}
          <GlassmorphismCard
            variant="subtle"
            className="mb-6 p-6"
            hoverable
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Welcome back to your business dashboard
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Here's what's happening with your business today
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </GlassmorphismCard>

          {/* Main Content */}
          <div className="space-y-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentWorkspace;