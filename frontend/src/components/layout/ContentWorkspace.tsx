"use client";

import { ReactNode, useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { cn } from '@/lib/utils';

interface Stat {
  id: string;
  label: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    period: string;
  };
  icon?: ReactNode;
  color?: 'coral' | 'blue' | 'sage' | 'amber';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  href?: string;
}

interface Activity {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  type: 'customer' | 'job' | 'payment' | 'communication' | 'system';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  icon?: ReactNode;
  href?: string;
  isUnread?: boolean;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface ContentWorkspaceProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  stats?: Stat[];
  recentActivity?: Activity[];
  showStats?: boolean;
  showActivity?: boolean;
  showTimeDate?: boolean;
  enableAnimations?: boolean;
  enableFloatingEffects?: boolean;
  headerActions?: ReactNode;
  onStatClick?: (stat: Stat) => void;
  onActivityClick?: (activity: Activity) => void;
  onBreadcrumbClick?: (item: BreadcrumbItem) => void;
}

export function ContentWorkspace({
  children,
  className,
  title = "Dashboard",
  subtitle,
  breadcrumbs = [],
  stats = [],
  recentActivity = [],
  showStats = true,
  showActivity = true,
  showTimeDate = true,
  enableAnimations = true,
  enableFloatingEffects = true,
  headerActions,
  onStatClick,
  onActivityClick,
  onBreadcrumbClick,
}: ContentWorkspaceProps) {
  const { user } = useUser();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredStat, setHoveredStat] = useState<string | null>(null);
  const [hoveredActivity, setHoveredActivity] = useState<string | null>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);

  // Enhanced time updates
  useEffect(() => {
    if (!showTimeDate) return;
    
    const updateTime = () => setCurrentTime(new Date());
    updateTime();
    
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [showTimeDate]);

  // Enhanced entrance animation trigger
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatColorClass = (color: string = 'blue') => {
    const colorMap = {
      coral: 'from-accent-coral/20 to-accent-coral/10 border-accent-coral/20',
      blue: 'from-accent-blue/20 to-accent-blue/10 border-accent-blue/20',
      sage: 'from-accent-sage/20 to-accent-sage/10 border-accent-sage/20',
      amber: 'from-accent-amber/20 to-accent-amber/10 border-accent-amber/20',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const getStatIconColor = (color: string = 'blue') => {
    const colorMap = {
      coral: 'text-accent-coral',
      blue: 'text-accent-blue',
      sage: 'text-accent-sage',
      amber: 'text-accent-amber',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const getChangeIndicator = (change: Stat['change']) => {
    if (!change) return null;

    const isPositive = change.type === 'increase';
    const iconClass = cn(
      "w-4 h-4 transition-all duration-glass-normal",
      isPositive ? "text-accent-sage" : "text-accent-coral"
    );

    return (
      <div className={cn(
        "flex items-center gap-1 text-xs font-medium",
        isPositive ? "text-accent-sage" : "text-accent-coral"
      )}>
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isPositive ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          )}
        </svg>
        <span>{Math.abs(change.value)}%</span>
        <span className="text-glass-secondary">vs {change.period}</span>
      </div>
    );
  };

  const getActivityIcon = (type: Activity['type']) => {
    const iconMap = {
      customer: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      job: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
        </svg>
      ),
      payment: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      communication: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      system: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    };
    return iconMap[type] || iconMap.system;
  };

  const getPriorityIndicator = (priority: string = 'medium') => {
    const priorityMap = {
      low: { color: 'bg-accent-sage', ring: 'ring-accent-sage/30' },
      medium: { color: 'bg-accent-blue', ring: 'ring-accent-blue/30' },
      high: { color: 'bg-accent-amber', ring: 'ring-accent-amber/30' },
      critical: { color: 'bg-accent-coral', ring: 'ring-accent-coral/30' },
    };
    return priorityMap[priority as keyof typeof priorityMap] || priorityMap.medium;
  };

  // Default stats
  const defaultStats: Stat[] = [
    {
      id: 'revenue',
      label: 'Monthly Revenue',
      value: '$24,500',
      change: { value: 12.5, type: 'increase', period: 'last month' },
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      color: 'sage',
      priority: 'critical',
    },
    {
      id: 'customers',
      label: 'Active Customers',
      value: 847,
      change: { value: 8.2, type: 'increase', period: 'last month' },
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'blue',
      priority: 'high',
    },
    {
      id: 'jobs',
      label: 'Jobs Completed',
      value: 156,
      change: { value: 5.7, type: 'increase', period: 'last week' },
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'coral',
      priority: 'medium',
    },
    {
      id: 'response-time',
      label: 'Avg Response Time',
      value: '2.3h',
      change: { value: 15.2, type: 'decrease', period: 'last month' },
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'amber',
      priority: 'medium',
    },
  ];

  // Default recent activity
  const defaultActivity: Activity[] = [
    {
      id: '1',
      title: 'New customer inquiry received',
      description: 'Sarah Johnson requested a quote for kitchen renovation',
      timestamp: '5 minutes ago',
      type: 'customer',
      priority: 'high',
      isUnread: true,
    },
    {
      id: '2',
      title: 'Payment received',
      description: '$2,400 payment for Project #1247',
      timestamp: '12 minutes ago',
      type: 'payment',
      priority: 'medium',
    },
    {
      id: '3',
      title: 'Job completed',
      description: 'Bathroom renovation at 123 Main St',
      timestamp: '1 hour ago',
      type: 'job',
      priority: 'medium',
    },
    {
      id: '4',
      title: 'System update',
      description: 'AI assistant performance improvements deployed',
      timestamp: '2 hours ago',
      type: 'system',
      priority: 'low',
    },
    {
      id: '5',
      title: 'Customer message',
      description: 'Mike Davis asked about project timeline',
      timestamp: '3 hours ago',
      type: 'communication',
      priority: 'medium',
    },
  ];

  const activeStats = stats.length > 0 ? stats : defaultStats;
  const activeActivity = recentActivity.length > 0 ? recentActivity : defaultActivity;

  return (
    <div
      ref={workspaceRef}
      className={cn(
        "relative h-full w-full overflow-hidden",
        // Enhanced entrance animations
        enableAnimations && isVisible && "animate-glass-entrance",
        !isVisible && "opacity-0",
        className
      )}
    >
      {/* Enhanced floating background elements */}
      {enableFloatingEffects && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-32 right-16 w-40 h-40 bg-accent-blue/3 rounded-full blur-2xl animate-glass-float" />
          <div className="absolute top-64 left-20 w-32 h-32 bg-accent-coral/3 rounded-full blur-2xl animate-glass-float" style={{animationDelay: '2s'}} />
          <div className="absolute bottom-48 right-32 w-36 h-36 bg-accent-sage/3 rounded-full blur-2xl animate-glass-float" style={{animationDelay: '4s'}} />
        </div>
      )}

      <div className="relative z-10 h-full flex flex-col">
        {/* Enhanced header section */}
        <header className={cn(
          "sticky top-0 z-20 bg-glass-bg-strong backdrop-blur-xl border-b border-glass-border",
          "shadow-glass-sm p-6 relative",
          enableAnimations && "animate-glass-slide-up delay-glass-1"
        )}>
          {/* Header background effect */}
          <div className="absolute inset-0 bg-glass-gradient-medium pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-blue/40 to-transparent" />
          
          <div className="relative z-10">
            {/* Enhanced mobile header */}
            <div className="lg:hidden mb-4">
              {showTimeDate && (
                <div className="flex items-center justify-between text-xs text-glass-secondary">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatDate(currentTime).split(',')[0]}</span>
                </div>
              )}
            </div>

            <div className="flex items-start justify-between gap-6">
              <div className="flex-1 min-w-0">
                {/* Enhanced breadcrumb navigation */}
                {breadcrumbs.length > 0 && (
                  <nav className="mb-3" aria-label="Breadcrumb">
                    <ol className="flex items-center gap-2 text-sm">
                      {breadcrumbs.map((item, index) => (
                        <li key={index} className="flex items-center gap-2">
                          {index > 0 && (
                            <svg className="w-4 h-4 text-glass-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                          {item.href && !item.isActive ? (
                            <button
                              onClick={() => onBreadcrumbClick?.(item)}
                              className="text-glass-secondary hover:text-glass transition-colors duration-glass-normal hover:underline"
                            >
                              {item.label}
                            </button>
                          ) : (
                            <span className={cn(
                              item.isActive ? "text-glass font-medium" : "text-glass-secondary"
                            )}>
                              {item.label}
                            </span>
                          )}
                        </li>
                      ))}
                    </ol>
                  </nav>
                )}

                {/* Enhanced title section */}
                <div className="flex items-center gap-4 mb-2">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-glass tracking-tight">
                      {title}
                    </h1>
                    {subtitle && (
                      <p className="text-glass-secondary mt-1 text-sm lg:text-base">
                        {subtitle}
                      </p>
                    )}
                  </div>

                  {/* Enhanced user greeting */}
                  {user && (
                    <div className="hidden lg:block glass-badge glass-badge-blue">
                      Welcome back, {user.firstName || 'User'}!
                    </div>
                  )}
                </div>

                {/* Enhanced time and date display */}
                {showTimeDate && (
                  <div className="hidden lg:flex items-center gap-6 text-sm text-glass-secondary">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-mono font-medium">{formatTime(currentTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{formatDate(currentTime)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced header actions */}
              {headerActions && (
                <div className={cn(
                  "flex items-center gap-3",
                  enableAnimations && "animate-glass-slide-in-right delay-glass-2"
                )}>
                  {headerActions}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Enhanced main content area */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-6 space-y-8">
            {/* Enhanced stats grid */}
            {showStats && (
              <section className={cn(
                "space-y-4",
                enableAnimations && "animate-glass-slide-up delay-glass-3"
              )}>
                <h2 className="text-lg font-semibold text-glass flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Key Metrics
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {activeStats.map((stat, index) => {
                    const isHovered = hoveredStat === stat.id;
                    const priorityIndicator = getPriorityIndicator(stat.priority);

                    return (
                      <div
                        key={stat.id}
                        className={cn(
                          "glass-card relative group cursor-pointer transition-all duration-glass-normal",
                          "hover:shadow-glass-lg hover:transform hover:scale-105",
                          enableAnimations && "animate-glass-scale",
                          enableFloatingEffects && stat.priority === 'critical' && "hover:animate-glass-glow",
                        )}
                        style={{
                          animationDelay: enableAnimations ? `${(index + 4) * 100}ms` : undefined,
                        }}
                        onMouseEnter={() => setHoveredStat(stat.id)}
                        onMouseLeave={() => setHoveredStat(null)}
                        onClick={() => onStatClick?.(stat)}
                      >
                        {/* Enhanced card background */}
                        <div className={cn(
                          "absolute inset-0 rounded-glass-lg bg-gradient-to-br border transition-all duration-glass-normal",
                          getStatColorClass(stat.color),
                          isHovered && "opacity-80"
                        )} />

                        {/* Priority indicator */}
                        <div className={cn(
                          "absolute top-2 right-2 w-2 h-2 rounded-full",
                          priorityIndicator.color,
                          enableFloatingEffects && isHovered && `ring-2 ${priorityIndicator.ring} animate-glass-pulse`
                        )} />

                        <div className="relative z-10 p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className={cn(
                              "w-12 h-12 rounded-glass-lg flex items-center justify-center transition-all duration-glass-normal",
                              getStatIconColor(stat.color),
                              isHovered && "transform scale-110"
                            )}>
                              {stat.icon}
                            </div>
                            
                            {stat.change && (
                              <div className={cn(
                                "transition-all duration-glass-normal",
                                isHovered && "transform scale-110"
                              )}>
                                {getChangeIndicator(stat.change)}
                              </div>
                            )}
                          </div>

                          <div>
                            <p className="text-2xl font-bold text-glass mb-1">
                              {stat.value}
                            </p>
                            <p className="text-glass-secondary text-sm font-medium">
                              {stat.label}
                            </p>
                          </div>

                          {/* Enhanced hover indicator */}
                          {isHovered && (
                            <div className="absolute bottom-2 right-2 opacity-75">
                              <svg className="w-4 h-4 text-glass-secondary animate-glass-slide-in-right" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Enhanced main content */}
            <section className={cn(
              "glass-card-lg min-h-[400px]",
              enableAnimations && "animate-glass-slide-up delay-glass-4"
            )}>
              <div className="relative z-10">
                {children}
              </div>
            </section>

            {/* Enhanced recent activity */}
            {showActivity && (
              <section className={cn(
                "space-y-4",
                enableAnimations && "animate-glass-slide-up delay-glass-5"
              )}>
                <h2 className="text-lg font-semibold text-glass flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Recent Activity
                </h2>

                <div className="glass-card space-y-3">
                  {activeActivity.map((activity, index) => {
                    const isHovered = hoveredActivity === activity.id;
                    const priorityIndicator = getPriorityIndicator(activity.priority);

                    return (
                      <div
                        key={activity.id}
                        className={cn(
                          "flex items-start gap-4 p-3 rounded-glass-lg transition-all duration-glass-normal",
                          "hover:bg-glass-bg-medium hover:transform hover:translate-x-1 cursor-pointer",
                          activity.isUnread && "bg-glass-bg border border-accent-blue/20",
                          enableAnimations && "animate-glass-slide-in-left",
                        )}
                        style={{
                          animationDelay: enableAnimations ? `${(index + 6) * 75}ms` : undefined,
                        }}
                        onMouseEnter={() => setHoveredActivity(activity.id)}
                        onMouseLeave={() => setHoveredActivity(null)}
                        onClick={() => onActivityClick?.(activity)}
                      >
                        {/* Enhanced activity icon */}
                        <div className={cn(
                          "relative flex-shrink-0 w-10 h-10 rounded-glass-lg bg-glass-bg-medium flex items-center justify-center",
                          "text-glass-secondary transition-all duration-glass-normal",
                          isHovered && "transform scale-110 text-glass"
                        )}>
                          {activity.icon || getActivityIcon(activity.type)}
                          
                          {/* Priority indicator ring */}
                          <div className={cn(
                            "absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white",
                            priorityIndicator.color,
                            enableFloatingEffects && activity.priority === 'critical' && "animate-glass-pulse"
                          )} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                "font-medium text-glass truncate transition-all duration-glass-normal",
                                activity.isUnread && "font-semibold"
                              )}>
                                {activity.title}
                              </p>
                              {activity.description && (
                                <p className="text-glass-secondary text-sm mt-1 line-clamp-2">
                                  {activity.description}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-glass-secondary text-xs">
                                {activity.timestamp}
                              </span>
                              {activity.isUnread && (
                                <div className="w-2 h-2 bg-accent-blue rounded-full animate-glass-pulse" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Enhanced hover indicator */}
                        {isHovered && (
                          <div className="flex-shrink-0">
                            <svg className="w-4 h-4 text-glass-secondary animate-glass-slide-in-right" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Enhanced view all activity link */}
                  <div className="pt-3 border-t border-glass-border">
                    <button className="w-full glass-button-ghost text-center py-2 hover:bg-glass-bg-medium transition-all duration-glass-normal">
                      View All Activity
                      <svg className="w-4 h-4 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}