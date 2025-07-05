"use client";

import { ReactNode, useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { cn } from '@/lib/utils';

interface NavigationItem {
  id: string;
  label: string;
  icon: ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: {
    text: string;
    color?: 'coral' | 'blue' | 'sage' | 'amber';
    priority?: 'low' | 'medium' | 'high' | 'critical';
  };
  priority?: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  isActive?: boolean;
  isDisabled?: boolean;
  submenu?: NavigationItem[];
}

interface NavigationSection {
  id: string;
  title: string;
  items: NavigationItem[];
  priority?: 'low' | 'medium' | 'high' | 'critical';
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
}

interface NavigationPanelProps {
  className?: string;
  sections?: NavigationSection[];
  showUserProfile?: boolean;
  showSystemStatus?: boolean;
  enableAnimations?: boolean;
  enableFloatingEffects?: boolean;
  onItemClick?: (item: NavigationItem) => void;
  onSectionToggle?: (sectionId: string, expanded: boolean) => void;
}

export function NavigationPanel({
  className,
  sections = [],
  showUserProfile = true,
  showSystemStatus = true,
  enableAnimations = true,
  enableFloatingEffects = true,
  onItemClick,
  onSectionToggle,
}: NavigationPanelProps) {
  const { user, isLoaded } = useUser();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const panelRef = useRef<HTMLElement>(null);

  // Enhanced entrance animation trigger
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Initialize expanded sections based on priority and defaults
  useEffect(() => {
    const initialExpanded = new Set<string>();
    sections.forEach(section => {
      if (section.defaultExpanded !== false && 
          (section.priority === 'critical' || section.priority === 'high' || section.defaultExpanded)) {
        initialExpanded.add(section.id);
      }
    });
    setExpandedSections(initialExpanded);
  }, [sections]);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
    onSectionToggle?.(sectionId, newExpanded.has(sectionId));
  };

  const handleItemClick = (item: NavigationItem) => {
    if (item.isDisabled) return;
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(25);
    }
    
    if (item.onClick) {
      item.onClick();
    }
    onItemClick?.(item);
  };

  const getBadgeColorClass = (color: string = 'blue') => {
    const colorMap = {
      coral: 'glass-badge-coral',
      blue: 'glass-badge-blue', 
      sage: 'glass-badge-sage',
      amber: 'glass-badge-amber',
    };
    return colorMap[color as keyof typeof colorMap] || 'glass-badge-blue';
  };

  const getPriorityIndicator = (priority: string = 'medium') => {
    const priorityMap = {
      low: { color: 'bg-accent-sage', glow: 'shadow-accent-sage/30' },
      medium: { color: 'bg-accent-blue', glow: 'shadow-accent-blue/30' },
      high: { color: 'bg-accent-amber', glow: 'shadow-accent-amber/30' },
      critical: { color: 'bg-accent-coral', glow: 'shadow-accent-coral/30' },
    };
    return priorityMap[priority as keyof typeof priorityMap] || priorityMap.medium;
  };

  // Default navigation structure
  const defaultSections: NavigationSection[] = [
    {
      id: 'main',
      title: 'Main Navigation',
      priority: 'critical',
      defaultExpanded: true,
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
            </svg>
          ),
          href: '/dashboard',
          priority: 'critical',
          isActive: true,
        },
        {
          id: 'customers',
          label: 'Customers',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          ),
          href: '/customers',
          priority: 'high',
          badge: { text: '23', color: 'blue', priority: 'medium' },
        },
        {
          id: 'ai-assistant',
          label: 'AI Assistant',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          href: '/ai',
          priority: 'high',
          badge: { text: 'New', color: 'coral', priority: 'high' },
        },
      ],
    },
    {
      id: 'business',
      title: 'Business Operations',
      priority: 'high',
      defaultExpanded: true,
      items: [
        {
          id: 'calendar',
          label: 'Calendar',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
          href: '/calendar',
          priority: 'medium',
          badge: { text: '5', color: 'amber', priority: 'low' },
        },
        {
          id: 'communications',
          label: 'Communications',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          ),
          href: '/communications',
          priority: 'medium',
        },
        {
          id: 'analytics',
          label: 'Analytics',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          ),
          href: '/analytics',
          priority: 'medium',
        },
      ],
    },
    {
      id: 'settings',
      title: 'Settings & Tools',
      priority: 'low',
      isCollapsible: true,
      defaultExpanded: false,
      items: [
        {
          id: 'settings',
          label: 'Settings',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
          href: '/settings',
          priority: 'low',
        },
        {
          id: 'help',
          label: 'Help & Support',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          href: '/help',
          priority: 'low',
        },
      ],
    },
  ];

  const activeSections = sections.length > 0 ? sections : defaultSections;

  return (
    <nav
      ref={panelRef}
      className={cn(
        "relative h-full w-full glass-nav overflow-hidden",
        // Enhanced entrance animations
        enableAnimations && isVisible && "animate-glass-entrance",
        !isVisible && "opacity-0 transform translate-x-full",
        className
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Enhanced floating background elements */}
      {enableFloatingEffects && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-16 right-4 w-20 h-20 bg-accent-blue/5 rounded-full blur-lg animate-glass-float" />
          <div className="absolute top-32 left-2 w-16 h-16 bg-accent-coral/5 rounded-full blur-lg animate-glass-float" style={{animationDelay: '1s'}} />
          <div className="absolute bottom-32 right-6 w-24 h-24 bg-accent-sage/5 rounded-full blur-lg animate-glass-float" style={{animationDelay: '2s'}} />
        </div>
      )}

      {/* Enhanced top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-blue/50 to-transparent" />

      <div className="relative z-10 h-full flex flex-col">
        {/* Enhanced header section */}
        <div className={cn(
          "p-6 border-b border-glass-border relative",
          enableAnimations && "animate-glass-slide-up delay-glass-1"
        )}>
          {/* Header background effect */}
          <div className="absolute inset-0 bg-glass-gradient-medium pointer-events-none" />
          
          <div className="relative z-10">
            {/* Enhanced logo/brand area */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-glass-lg bg-accent-coral/20 flex items-center justify-center animate-glass-float">
                  <span className="text-xl font-bold text-accent-coral">✨</span>
                </div>
                {enableFloatingEffects && (
                  <div className="absolute inset-0 rounded-glass-lg bg-accent-coral/10 animate-glass-glow" />
                )}
              </div>
              <div>
                <h1 className="text-lg font-bold text-glass">SMB AI Platform</h1>
                <p className="text-xs text-glass-secondary">v2.1.0</p>
              </div>
            </div>

            {/* Enhanced system status */}
            {showSystemStatus && (
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-accent-sage rounded-full animate-glass-pulse" />
                  <span className="text-glass-secondary">All systems operational</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced navigation sections */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-glass-border scrollbar-track-transparent">
          <div className="p-4 space-y-6">
            {activeSections.map((section, sectionIndex) => {
              const isExpanded = expandedSections.has(section.id);
              const priorityIndicator = getPriorityIndicator(section.priority);

              return (
                <div
                  key={section.id}
                  className={cn(
                    "relative",
                    enableAnimations && "animate-glass-slide-up",
                  )}
                  style={{
                    animationDelay: enableAnimations ? `${(sectionIndex + 2) * 100}ms` : undefined,
                  }}
                >
                  {/* Enhanced section header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {/* Priority indicator */}
                      <div className={cn(
                        "w-1 h-4 rounded-full transition-all duration-glass-normal",
                        priorityIndicator.color,
                        enableFloatingEffects && `shadow-lg ${priorityIndicator.glow}`
                      )} />
                      
                      <h3 className="text-sm font-semibold text-glass-secondary uppercase tracking-wide">
                        {section.title}
                      </h3>
                    </div>

                    {/* Enhanced section toggle */}
                    {section.isCollapsible && (
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="glass-button p-1 hover:bg-glass-bg-medium transition-all duration-glass-normal"
                        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${section.title}`}
                        aria-expanded={isExpanded}
                      >
                        <svg
                          className={cn(
                            "w-4 h-4 text-glass-secondary transition-transform duration-glass-normal",
                            isExpanded && "rotate-180"
                          )}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Enhanced navigation items */}
                  <div className={cn(
                    "space-y-1 transition-all duration-glass-normal ease-glass-smooth overflow-hidden",
                    isExpanded || !section.isCollapsible ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
                  )}>
                    {section.items.map((item, itemIndex) => {
                      const isHovered = hoveredItem === item.id;
                      const itemPriorityIndicator = getPriorityIndicator(item.priority);

                      return (
                        <div
                          key={item.id}
                          className={cn(
                            "relative group",
                            enableAnimations && "animate-glass-slide-in-left",
                          )}
                          style={{
                            animationDelay: enableAnimations ? `${(sectionIndex + itemIndex + 3) * 50}ms` : undefined,
                          }}
                        >
                          <button
                            onClick={() => handleItemClick(item)}
                            onMouseEnter={() => setHoveredItem(item.id)}
                            onMouseLeave={() => setHoveredItem(null)}
                            disabled={item.isDisabled}
                            className={cn(
                              "w-full flex items-center gap-3 p-3 rounded-glass-lg transition-all duration-glass-normal",
                              "text-left relative overflow-hidden",
                              // Active state
                              item.isActive && [
                                "bg-glass-bg-medium text-glass shadow-glass-sm",
                                "border border-glass-border-strong",
                              ],
                              // Hover state
                              !item.isActive && "hover:bg-glass-bg-medium hover:text-glass hover:transform hover:translate-x-1",
                              // Default state
                              !item.isActive && "text-glass-secondary",
                              // Disabled state
                              item.isDisabled && "opacity-50 cursor-not-allowed",
                              // Priority glow effect
                              enableFloatingEffects && item.priority === 'critical' && item.isActive && "animate-glass-glow",
                            )}
                            aria-current={item.isActive ? 'page' : undefined}
                            aria-disabled={item.isDisabled}
                          >
                            {/* Enhanced background effects */}
                            {item.isActive && (
                              <div className="absolute inset-0 bg-glass-gradient-soft pointer-events-none" />
                            )}
                            
                            {/* Priority indicator line */}
                            <div className={cn(
                              "absolute left-0 top-0 bottom-0 w-1 rounded-r-full transition-all duration-glass-normal",
                              item.isActive ? itemPriorityIndicator.color : "bg-transparent",
                              isHovered && !item.isActive && `${itemPriorityIndicator.color} opacity-50`,
                            )} />

                            {/* Enhanced icon container */}
                            <div className={cn(
                              "relative flex-shrink-0 w-5 h-5 transition-all duration-glass-normal",
                              item.isActive && "transform scale-110",
                              enableFloatingEffects && isHovered && "animate-glass-float",
                            )}>
                              {item.icon}
                              
                              {/* Icon glow effect */}
                              {enableFloatingEffects && (item.isActive || isHovered) && (
                                <div className={cn(
                                  "absolute inset-0 rounded-full transition-all duration-glass-normal",
                                  item.isActive ? `bg-${itemPriorityIndicator.color.split('-')[1]}/20 animate-glass-pulse` : "bg-accent-blue/10",
                                )} />
                              )}
                            </div>

                            {/* Enhanced label */}
                            <span className={cn(
                              "flex-1 font-medium transition-all duration-glass-normal",
                              item.isActive && "font-semibold",
                            )}>
                              {item.label}
                            </span>

                            {/* Enhanced badge */}
                            {item.badge && (
                              <div className={cn(
                                "glass-badge text-xs transition-all duration-glass-normal",
                                getBadgeColorClass(item.badge.color),
                                enableFloatingEffects && item.badge.priority === 'critical' && "animate-glass-pulse",
                                isHovered && "transform scale-110",
                              )}>
                                {item.badge.text}
                              </div>
                            )}

                            {/* Enhanced hover indicator */}
                            {isHovered && !item.isActive && (
                              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                <svg className="w-4 h-4 text-glass-secondary animate-glass-slide-in-right" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            )}
                          </button>

                          {/* Enhanced submenu indicator */}
                          {item.submenu && item.submenu.length > 0 && (
                            <div className="ml-6 mt-1 border-l border-glass-border pl-4 space-y-1">
                              {item.submenu.map((subItem) => (
                                <button
                                  key={subItem.id}
                                  onClick={() => handleItemClick(subItem)}
                                  className="w-full flex items-center gap-2 p-2 text-sm text-glass-secondary hover:text-glass hover:bg-glass-bg rounded-glass-sm transition-all duration-glass-normal"
                                >
                                  <div className="w-3 h-3 flex-shrink-0">
                                    {subItem.icon}
                                  </div>
                                  <span>{subItem.label}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enhanced user profile section */}
        {showUserProfile && isLoaded && user && (
          <div className={cn(
            "p-4 border-t border-glass-border bg-glass-bg-medium relative",
            enableAnimations && "animate-glass-slide-up delay-glass-8"
          )}>
            {/* Profile background effect */}
            <div className="absolute inset-0 bg-glass-gradient-strong pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3">
                {/* Enhanced avatar */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-glass-bg-strong border-2 border-glass-border overflow-hidden">
                    {user.imageUrl ? (
                      <img 
                        src={user.imageUrl} 
                        alt={user.fullName || 'User avatar'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-accent-blue/20 flex items-center justify-center">
                        <span className="text-accent-blue font-semibold">
                          {(user.firstName || user.emailAddresses[0]?.emailAddress || 'U')[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Enhanced status indicator */}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent-sage rounded-full border-2 border-white shadow-glass animate-glass-pulse" />
                </div>

                {/* Enhanced user info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-glass truncate">
                    {user.fullName || user.emailAddresses[0]?.emailAddress}
                  </p>
                  <p className="text-xs text-glass-secondary truncate">
                    Premium Plan
                  </p>
                </div>

                {/* Enhanced settings button */}
                <button className="glass-button p-2 hover:bg-glass-bg-strong transition-all duration-glass-normal group">
                  <svg className="w-4 h-4 text-glass-secondary group-hover:text-glass group-hover:rotate-12 transition-all duration-glass-normal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced version info */}
        <div className="p-2 border-t border-glass-border bg-glass-bg text-center">
          <p className="text-xs text-glass-secondary">
            Build {new Date().getFullYear()}.{String(new Date().getMonth() + 1).padStart(2, '0')}.{String(new Date().getDate()).padStart(2, '0')}
          </p>
        </div>
      </div>

      {/* Enhanced bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-sage/50 to-transparent" />
    </nav>
  );
}