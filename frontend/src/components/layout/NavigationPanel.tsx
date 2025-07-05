"use client";

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { UserButton } from '@clerk/nextjs';
import AISuggestionsPanel from '@/components/ai/AISuggestionsPanel';

interface NavigationPanelProps {
  width: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  count?: number;
  isActive?: boolean;
}

interface NavigationGroup {
  id: string;
  label: string;
  items: NavigationItem[];
  isExpanded?: boolean;
}

export function NavigationPanel({
  width,
  isCollapsed,
  onToggleCollapse,
  className
}: NavigationPanelProps) {
  const { user } = useUser();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['today', 'quick-actions']));

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const navigationGroups: NavigationGroup[] = [
    {
      id: 'today',
      label: 'Today',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', href: '/dashboard', isActive: true },
        { id: 'conversations', label: 'Conversations', icon: '💬', href: '/conversations', count: 3 },
        { id: 'tasks', label: 'Tasks', icon: '✅', href: '/tasks', count: 5 },
        { id: 'calendar', label: 'Calendar', icon: '📅', href: '/calendar' },
      ]
    },
    {
      id: 'quick-actions',
      label: 'Quick Actions',
      items: [
        { id: 'new-customer', label: 'New Customer', icon: '👥', href: '/customers/new' },
        { id: 'create-job', label: 'Create Job', icon: '🔧', href: '/jobs/new' },
        { id: 'send-invoice', label: 'Send Invoice', icon: '💰', href: '/invoices/new' },
        { id: 'ai-assistant', label: 'AI Assistant', icon: '🤖', href: '/assistant' },
      ]
    },
    {
      id: 'business',
      label: 'Business Management',
      items: [
        { id: 'customers', label: 'Customers', icon: '👥', href: '/customers', count: 24 },
        { id: 'jobs', label: 'Jobs', icon: '🔧', href: '/jobs', count: 12 },
        { id: 'invoices', label: 'Invoices', icon: '📄', href: '/invoices', count: 8 },
        { id: 'payments', label: 'Payments', icon: '💳', href: '/payments' },
      ]
    },
    {
      id: 'insights',
      label: 'Business Insights',
      items: [
        { id: 'analytics', label: 'Analytics', icon: '📈', href: '/analytics' },
        { id: 'reports', label: 'Reports', icon: '📊', href: '/reports' },
        { id: 'forecasting', label: 'Forecasting', icon: '🔮', href: '/forecasting' },
      ]
    },
    {
      id: 'settings',
      label: 'Settings',
      items: [
        { id: 'profile', label: 'Profile', icon: '👤', href: '/profile' },
        { id: 'integrations', label: 'Integrations', icon: '🔗', href: '/integrations' },
        { id: 'team', label: 'Team', icon: '👥', href: '/team' },
        { id: 'billing', label: 'Billing', icon: '💰', href: '/billing' },
      ]
    }
  ];

  return (
    <nav 
      className={cn(
        "glass-nav border-r border-white/10 flex flex-col transition-all duration-300",
        "h-screen sticky top-0 z-30",
        className
      )}
      style={{ width: isCollapsed ? 80 : width }}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-accent-coral to-accent-blue flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <div>
                <h1 className="text-glass font-semibold text-sm">SMB Platform</h1>
                <p className="text-glass-secondary text-xs">AI-Powered</p>
              </div>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="glass-button-ghost p-2 hover:bg-white/10 transition-colors duration-200"
            aria-label={isCollapsed ? "Expand navigation" : "Collapse navigation"}
          >
            <span className="text-glass">
              {isCollapsed ? '→' : '←'}
            </span>
          </button>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <UserButton 
            appearance={{
              elements: {
                userButtonBox: "w-10 h-10",
                userButtonTrigger: "glass-avatar",
                userButtonPopoverCard: "glass-card border border-white/20 shadow-lg shadow-black/10",
                userButtonPopoverActionButton: "glass-button-secondary text-glass hover:bg-white/20",
              }
            }}
          />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-glass font-medium text-sm truncate">
                {user?.firstName || 'User'}
              </p>
              <p className="text-glass-secondary text-xs truncate">
                {user?.primaryEmailAddress?.emailAddress || 'user@example.com'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto py-2">
        {navigationGroups.map((group) => (
          <div key={group.id} className="mb-2">
            {!isCollapsed && (
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full px-4 py-2 text-left text-glass-secondary text-xs font-medium uppercase tracking-wider hover:text-glass transition-colors duration-200 flex items-center justify-between group"
              >
                <span>{group.label}</span>
                <span className={cn(
                  "transition-transform duration-200",
                  expandedGroups.has(group.id) ? "rotate-90" : ""
                )}>
                  ▶
                </span>
              </button>
            )}
            
            {(isCollapsed || expandedGroups.has(group.id)) && (
              <div className="space-y-1 px-2">
                {group.items.map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group",
                      item.isActive 
                        ? "bg-gradient-to-r from-accent-coral/20 to-accent-blue/20 text-glass border border-white/20 shadow-lg shadow-black/10"
                        : "text-glass-secondary hover:text-glass hover:bg-white/10"
                    )}
                  >
                    <span className="text-sm">{item.icon}</span>
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-sm font-medium">{item.label}</span>
                        {item.count && (
                          <span className="glass-badge bg-accent-coral/20 text-accent-coral text-xs px-2 py-1">
                            {item.count}
                          </span>
                        )}
                      </>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* AI Suggestions Panel */}
      {!isCollapsed && (
        <div className="px-2 pb-4">
          <AISuggestionsPanel 
            className="h-64"
            onSuggestionClick={(suggestion) => {
              // TODO: Pass suggestion to chat interface via context or callback
              console.log('Suggestion clicked:', suggestion);
            }}
          />
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-accent-sage animate-pulse"></div>
          {!isCollapsed && (
            <div className="flex-1">
              <p className="text-glass-secondary text-xs">System Status</p>
              <p className="text-glass text-sm font-medium">All systems operational</p>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}