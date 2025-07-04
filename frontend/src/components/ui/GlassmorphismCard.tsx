"use client";

import { ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface GlassmorphismCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'subtle' | 'strong';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
}

const GlassmorphismCard = forwardRef<HTMLDivElement, GlassmorphismCardProps>(
  ({ 
    children, 
    className, 
    variant = 'default',
    hover = false,
    padding = 'md',
    rounded = 'lg',
    onClick,
    ...props 
  }, ref) => {
    const baseClasses = "backdrop-blur-md border border-white/20 shadow-lg shadow-black/10 transition-all duration-300";
    
    const variantClasses = {
      default: "bg-white/10",
      elevated: "bg-white/20 shadow-xl shadow-black/20",
      subtle: "bg-white/5 border-white/10",
      strong: "bg-white/30 border-white/30"
    };
    
    const paddingClasses = {
      none: "",
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
      xl: "p-8"
    };
    
    const roundedClasses = {
      sm: "rounded-xl",
      md: "rounded-2xl",
      lg: "rounded-3xl",
      xl: "rounded-[2rem]"
    };
    
    const hoverClasses = hover 
      ? "hover:bg-white/20 hover:shadow-xl hover:shadow-black/20 hover:scale-[1.02] cursor-pointer" 
      : "";

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          paddingClasses[padding],
          roundedClasses[rounded],
          hoverClasses,
          className
        )}
        onClick={onClick}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassmorphismCard.displayName = "GlassmorphismCard";

export { GlassmorphismCard };

// Additional utility components for common patterns
interface GlassHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function GlassHeader({ 
  title, 
  subtitle, 
  icon, 
  action, 
  className 
}: GlassHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-accent-coral to-accent-blue flex items-center justify-center">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-glass">{title}</h2>
          {subtitle && (
            <p className="text-glass-secondary text-sm">{subtitle}</p>
          )}
        </div>
      </div>
      {action && (
        <div className="flex items-center gap-2">
          {action}
        </div>
      )}
    </div>
  );
}

interface GlassStatsProps {
  stats: Array<{
    label: string;
    value: string | number;
    icon?: string;
    color?: 'coral' | 'blue' | 'sage' | 'amber';
  }>;
  className?: string;
}

export function GlassStats({ stats, className }: GlassStatsProps) {
  const colorClasses = {
    coral: "bg-accent-coral/20 text-accent-coral",
    blue: "bg-accent-blue/20 text-accent-blue", 
    sage: "bg-accent-sage/20 text-accent-sage",
    amber: "bg-accent-amber/20 text-accent-amber"
  };

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {stat.icon && (
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center text-sm",
                stat.color ? colorClasses[stat.color] : "bg-accent-blue/20 text-accent-blue"
              )}>
                {stat.icon}
              </div>
            )}
            <div className="text-2xl font-bold text-glass">{stat.value}</div>
          </div>
          <div className="text-glass-secondary text-sm">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

interface GlassListProps {
  items: Array<{
    id: string;
    title: string;
    description?: string;
    icon?: ReactNode;
    time?: string;
    badge?: {
      text: string;
      color?: 'coral' | 'blue' | 'sage' | 'amber';
    };
    onClick?: () => void;
  }>;
  className?: string;
}

export function GlassList({ items, className }: GlassListProps) {
  const badgeColorClasses = {
    coral: "bg-accent-coral/20 text-accent-coral",
    blue: "bg-accent-blue/20 text-accent-blue",
    sage: "bg-accent-sage/20 text-accent-sage",
    amber: "bg-accent-amber/20 text-accent-amber"
  };

  return (
    <div className={cn("space-y-2", className)}>
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-3 p-3 glass-card hover:bg-white/15 transition-colors duration-200 cursor-pointer"
          onClick={item.onClick}
        >
          {item.icon && (
            <div className="w-10 h-10 rounded-full bg-accent-blue/20 flex items-center justify-center flex-shrink-0">
              {item.icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-glass font-medium text-sm truncate">{item.title}</p>
              {item.time && (
                <p className="text-glass-secondary text-xs flex-shrink-0 ml-2">{item.time}</p>
              )}
            </div>
            {item.description && (
              <p className="text-glass-secondary text-xs mt-1 truncate">{item.description}</p>
            )}
          </div>
          {item.badge && (
            <div className={cn(
              "glass-badge text-xs px-2 py-1 flex-shrink-0",
              item.badge.color ? badgeColorClasses[item.badge.color] : "bg-accent-blue/20 text-accent-blue"
            )}>
              {item.badge.text}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}