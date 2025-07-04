"use client";

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContentWorkspaceProps {
  children: ReactNode;
  navigationWidth?: number;
  isNavigationCollapsed?: boolean;
  onToggleNavigation: () => void;
  className?: string;
}

export function ContentWorkspace({
  children,
  onToggleNavigation,
  className
}: ContentWorkspaceProps) {
  return (
    <main 
      className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300",
        "bg-gradient-to-br from-background/50 via-surface/50 to-surface-alt/50",
        className
      )}
      
    >
      {/* Mobile Header */}
      <div className="lg:hidden glass-nav border-b border-white/10 p-4 flex items-center justify-between">
        <button
          onClick={onToggleNavigation}
          className="glass-button-ghost p-2 hover:bg-white/10 transition-colors duration-200"
          aria-label="Toggle navigation"
        >
          <span className="text-glass">☰</span>
        </button>
        
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-accent-coral to-accent-blue flex items-center justify-center">
            <span className="text-white font-bold text-xs">AI</span>
          </div>
          <h1 className="text-glass font-semibold">SMB Platform</h1>
        </div>
        
        <div className="w-10 h-10"></div> {/* Spacer for balance */}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {/* Content Header */}
          <div className="glass-container m-4 mb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-accent-coral to-accent-blue flex items-center justify-center">
                  <span className="text-white text-xl">🚀</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-glass">
                    Welcome to Your AI-Powered Dashboard
                  </h1>
                  <p className="text-glass-secondary">
                    Manage your business operations with intelligent automation
                  </p>
                </div>
              </div>
              
              <div className="hidden md:flex items-center gap-3">
                <div className="glass-badge bg-accent-sage/20 text-accent-sage">
                  All Systems Operational
                </div>
                <div className="glass-badge bg-accent-blue/20 text-accent-blue">
                  AI Ready
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-4">
            <div className="glass-card glass-fade-in p-6">
              {children}
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="p-4 pt-0">
            <div className="glass-container">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-glass mb-1">24</div>
                  <div className="text-glass-secondary text-sm">Active Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-glass mb-1">12</div>
                  <div className="text-glass-secondary text-sm">Open Jobs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-glass mb-1">$8,420</div>
                  <div className="text-glass-secondary text-sm">Monthly Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-glass mb-1">98%</div>
                  <div className="text-glass-secondary text-sm">Customer Satisfaction</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="p-4 pt-0">
            <div className="glass-container">
              <h2 className="text-lg font-semibold text-glass mb-4">Recent Activity</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 glass-card">
                  <div className="w-8 h-8 rounded-full bg-accent-sage/20 flex items-center justify-center">
                    <span className="text-sm">💬</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-glass text-sm font-medium">New customer inquiry from Sarah Johnson</p>
                    <p className="text-glass-secondary text-xs">2 minutes ago</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 glass-card">
                  <div className="w-8 h-8 rounded-full bg-accent-blue/20 flex items-center justify-center">
                    <span className="text-sm">✅</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-glass text-sm font-medium">Job completed: Kitchen renovation - Mike Chen</p>
                    <p className="text-glass-secondary text-xs">15 minutes ago</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 glass-card">
                  <div className="w-8 h-8 rounded-full bg-accent-coral/20 flex items-center justify-center">
                    <span className="text-sm">💰</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-glass text-sm font-medium">Payment received: $2,400 from David Wilson</p>
                    <p className="text-glass-secondary text-xs">1 hour ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}