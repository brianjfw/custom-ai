'use client';

import { ReactNode, forwardRef } from 'react';
import { Card, CardBody, CardProps } from '@heroui/card';
import { cn } from '../../lib/utils';

interface GlassmorphismCardProps extends Omit<CardProps, 'children'> {
  children: ReactNode;
  hoverable?: boolean;
  clickable?: boolean;
  variant?: 'default' | 'elevated' | 'bordered' | 'flat';
  glassIntensity?: 'light' | 'medium' | 'strong';
}

export const GlassmorphismCard = forwardRef<HTMLDivElement, GlassmorphismCardProps>(
  ({ 
    children, 
    className, 
    hoverable = false, 
    clickable = false, 
    variant = 'default',
    glassIntensity = 'medium',
    ...props 
  }, ref) => {
    const baseClasses = 'glass-card';
    
    const variantClasses = {
      default: 'glass-card-default',
      elevated: 'glass-card-elevated',
      bordered: 'glass-card-bordered',
      flat: 'glass-card-flat'
    };

    const intensityClasses = {
      light: 'glass-intensity-light',
      medium: 'glass-intensity-medium',
      strong: 'glass-intensity-strong'
    };

    const interactionClasses = cn(
      hoverable && 'glass-card-hoverable',
      clickable && 'glass-card-clickable cursor-pointer'
    );

    return (
      <Card
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          intensityClasses[glassIntensity],
          interactionClasses,
          className
        )}
        {...props}
      >
        <CardBody className="glass-card-body">
          {children}
        </CardBody>
      </Card>
    );
  }
);

GlassmorphismCard.displayName = 'GlassmorphismCard';