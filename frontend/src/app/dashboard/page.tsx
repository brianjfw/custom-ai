"use client";

import { DualPaneLayout } from '@/components/layout/DualPaneLayout';
import { NavigationPanel } from '@/components/layout/NavigationPanel';
import { ContentWorkspace } from '@/components/layout/ContentWorkspace';
import { UserProfile } from '@/components/ui/UserProfile';
import { useUser } from '@clerk/nextjs';
import { NotificationProvider, useNotificationHelpers } from '@/components/ui/NotificationSystem';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

// Demo data for the dashboard
const mockStats = [
  {
    id: 'revenue',
    label: 'Monthly Revenue',
    value: '$24,580',
    change: { value: 12.5, type: 'increase' as const, period: 'vs last month' },
    icon: '💰',
    color: 'sage' as const,
    priority: 'high' as const,
  },
  {
    id: 'customers',
    label: 'Active Customers',
    value: '1,247',
    change: { value: 8.2, type: 'increase' as const, period: 'vs last month' },
    icon: '👥',
    color: 'blue' as const,
    priority: 'medium' as const,
  },
  {
    id: 'jobs',
    label: 'Jobs Completed',
    value: '89',
    change: { value: 3.1, type: 'decrease' as const, period: 'vs last month' },
    icon: '✅',
    color: 'amber' as const,
    priority: 'medium' as const,
  },
  {
    id: 'satisfaction',
    label: 'Customer Satisfaction',
    value: '4.8/5',
    change: { value: 2.1, type: 'increase' as const, period: 'vs last month' },
    icon: '⭐',
    color: 'coral' as const,
    priority: 'high' as const,
  },
];

const mockActivity = [
  {
    id: '1',
    title: 'New customer inquiry received',
    description: 'Sarah Johnson requested a quote for website design',
    timestamp: '5 minutes ago',
    type: 'customer' as const,
    priority: 'high' as const,
    icon: '📧',
    isUnread: true,
  },
  {
    id: '2',
    title: 'Payment received',
    description: '$2,500 payment from Acme Corp for Project #1234',
    timestamp: '1 hour ago',
    type: 'payment' as const,
    priority: 'medium' as const,
    icon: '💳',
  },
  {
    id: '3',
    title: 'Job completed',
    description: 'Website redesign for TechStart completed successfully',
    timestamp: '3 hours ago',
    type: 'job' as const,
    priority: 'medium' as const,
    icon: '🎉',
  },
  {
    id: '4',
    title: 'System backup completed',
    description: 'Daily backup completed successfully at 2:00 AM',
    timestamp: '6 hours ago',
    type: 'system' as const,
    priority: 'low' as const,
    icon: '🔄',
  },
];

function DashboardContent() {
  const { user, isLoaded } = useUser();
  const [isVisible, setIsVisible] = useState(false);
  const notifications = useNotificationHelpers();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  // Demo notification on load
  useEffect(() => {
    if (isLoaded && user && isVisible) {
      const timer = setTimeout(() => {
        notifications.success(
          'Welcome back!',
          `Hello ${user.firstName || 'there'}, your dashboard is ready.`,
          {
            duration: 4000,
            priority: 'medium',
            action: {
              label: 'View Details',
              onClick: () => console.log('Notification action clicked'),
            },
          }
        );
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, user, isVisible, notifications]);

  const handleStatClick = (stat: any) => {
    notifications.info(
      'Stat Details',
      `You clicked on ${stat.label}: ${stat.value}`,
      { duration: 3000 }
    );
  };

  const handleActivityClick = (activity: any) => {
    notifications.info(
      'Activity Details',
      `Activity: ${activity.title}`,
      { duration: 3000 }
    );
  };

  return (
    <div className={cn(
      "min-h-screen transition-all duration-1000 ease-out",
      !isVisible && "opacity-0 scale-95",
      isVisible && "opacity-100 scale-100"
    )}>
      <DualPaneLayout
        defaultLeftWidth={320}
        minLeftWidth={280}
        maxLeftWidth={400}
        animateEntrance={true}
        enableKeyboardShortcuts={true}
        leftPanel={
          <NavigationPanel
            enableAnimations={true}
            enableFloatingEffects={true}
            showUserProfile={true}
            showSystemStatus={true}
          />
        }
        rightPanel={
          <ContentWorkspace
            title="Business Dashboard"
            subtitle={user ? `Welcome back, ${user.firstName || 'there'}!` : 'Welcome to your dashboard'}
            breadcrumbs={[
              { label: 'Home', href: '/' },
              { label: 'Dashboard', isActive: true },
            ]}
            stats={mockStats}
            recentActivity={mockActivity}
            showStats={true}
            showActivity={true}
            showTimeDate={true}
            enableAnimations={true}
            enableFloatingEffects={true}
            onStatClick={handleStatClick}
            onActivityClick={handleActivityClick}
            headerActions={
              <div className="flex items-center gap-3">
                <button
                  onClick={() => notifications.info('Quick Action', 'You clicked the quick action button!')}
                  className="glass-button-secondary text-sm px-4 py-2"
                >
                  Quick Action
                </button>
                <button
                  onClick={() => notifications.success('Settings', 'Opening settings panel...')}
                  className="glass-button p-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </button>
              </div>
            }
          >
            {/* Main Dashboard Content */}
            <div className="space-y-8">
              {/* User Profile Section */}
              <div className={cn(
                "transition-all duration-1000 delay-500",
                !isVisible && "opacity-0 translate-y-8",
                isVisible && "opacity-100 translate-y-0"
              )}>
                <UserProfile />
              </div>

              {/* Quick Actions Grid */}
              <div className={cn(
                "transition-all duration-1000 delay-700",
                !isVisible && "opacity-0 translate-y-8",
                isVisible && "opacity-100 translate-y-0"
              )}>
                <div className="glass-card p-8 relative overflow-hidden">
                  {/* Card background effects */}
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 to-accent-coral/5 pointer-events-none" />
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-blue/40 to-transparent" />
                  
                  <div className="relative z-10">
                    <h2 className="text-2xl font-bold text-glass mb-6 flex items-center gap-3">
                      <span className="text-2xl">🚀</span>
                      Quick Actions
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[
                        {
                          title: 'New Customer',
                          description: 'Add a new customer to your database',
                          icon: '👤',
                          color: 'blue',
                          action: () => notifications.info('New Customer', 'Opening customer creation form...'),
                        },
                        {
                          title: 'Create Invoice',
                          description: 'Generate a new invoice for services',
                          icon: '📄',
                          color: 'sage',
                          action: () => notifications.info('Create Invoice', 'Opening invoice creator...'),
                        },
                        {
                          title: 'Schedule Job',
                          description: 'Plan and schedule upcoming work',
                          icon: '📅',
                          color: 'amber',
                          action: () => notifications.info('Schedule Job', 'Opening job scheduler...'),
                        },
                        {
                          title: 'View Reports',
                          description: 'Access detailed business analytics',
                          icon: '📊',
                          color: 'coral',
                          action: () => notifications.info('View Reports', 'Opening analytics dashboard...'),
                        },
                        {
                          title: 'AI Assistant',
                          description: 'Get AI-powered business insights',
                          icon: '🤖',
                          color: 'blue',
                          action: () => notifications.info('AI Assistant', 'Starting AI conversation...'),
                        },
                        {
                          title: 'Settings',
                          description: 'Configure your business preferences',
                          icon: '⚙️',
                          color: 'sage',
                          action: () => notifications.info('Settings', 'Opening settings panel...'),
                        },
                      ].map((action, index) => (
                        <button
                          key={action.title}
                          onClick={action.action}
                          className={cn(
                            "glass-card glass-hover text-left p-6 group relative overflow-hidden",
                            "transform transition-all duration-500",
                            `delay-${(index + 1) * 100}`
                          )}
                        >
                          {/* Action card background effects */}
                          <div className={cn(
                            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none",
                            action.color === 'blue' && "bg-gradient-to-br from-accent-blue/10 to-transparent",
                            action.color === 'sage' && "bg-gradient-to-br from-accent-sage/10 to-transparent", 
                            action.color === 'amber' && "bg-gradient-to-br from-accent-amber/10 to-transparent",
                            action.color === 'coral' && "bg-gradient-to-br from-accent-coral/10 to-transparent"
                          )} />
                          
                          <div className="relative z-10">
                            <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
                              {action.icon}
                            </div>
                            <h3 className="text-lg font-semibold text-glass mb-2 group-hover:text-gradient-blue transition-all duration-300">
                              {action.title}
                            </h3>
                            <p className="text-glass-secondary text-sm leading-relaxed">
                              {action.description}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notification Demo Section */}
              <div className={cn(
                "transition-all duration-1000 delay-900",
                !isVisible && "opacity-0 translate-y-8",
                isVisible && "opacity-100 translate-y-0"
              )}>
                <div className="glass-card p-8 relative overflow-hidden">
                  {/* Card background effects */}
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-coral/5 to-accent-sage/5 pointer-events-none" />
                  
                  <div className="relative z-10">
                    <h2 className="text-2xl font-bold text-glass mb-6 flex items-center gap-3">
                      <span className="text-2xl">🔔</span>
                      Notification System Demo
                    </h2>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <button
                        onClick={() => notifications.success('Success!', 'This is a success notification')}
                        className="glass-button-primary text-sm py-3"
                      >
                        Success
                      </button>
                      <button
                        onClick={() => notifications.error('Error!', 'This is an error notification')}
                        className="glass-button-secondary text-sm py-3"
                      >
                        Error
                      </button>
                      <button
                        onClick={() => notifications.warning('Warning!', 'This is a warning notification')}
                        className="glass-button-secondary text-sm py-3"
                      >
                        Warning
                      </button>
                      <button
                        onClick={() => notifications.info('Info!', 'This is an info notification')}
                        className="glass-button-secondary text-sm py-3"
                      >
                        Info
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ContentWorkspace>
        }
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <NotificationProvider
      maxNotifications={5}
      position="top-right"
      enableAnimations={true}
    >
      <DashboardContent />
    </NotificationProvider>
  );
}