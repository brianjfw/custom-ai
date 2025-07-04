import React from 'react';
import { Card, CardBody, CardHeader } from '@heroui/react';
import { cn } from '@/lib/utils';

interface GlassmorphismCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'subtle' | 'strong';
  blur?: 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  header?: React.ReactNode;
  headerClassName?: string;
  bodyClassName?: string;
  onClick?: () => void;
  'data-testid'?: string;
}

const variantStyles = {
  default: 'bg-white/20 border-white/20',
  subtle: 'bg-white/10 border-white/10',
  strong: 'bg-white/40 border-white/30'
};

const blurStyles = {
  sm: 'backdrop-blur-sm',
  md: 'backdrop-blur-md',
  lg: 'backdrop-blur-lg'
};

export const GlassmorphismCard: React.FC<GlassmorphismCardProps> = ({
  children,
  className,
  variant = 'default',
  blur = 'md',
  hoverable = false,
  header,
  headerClassName,
  bodyClassName,
  onClick,
  'data-testid': testId,
  ...props
}) => {
  const cardClasses = cn(
    // Base glassmorphism styles
    'border border-solid rounded-3xl shadow-lg shadow-black/10',
    variantStyles[variant],
    blurStyles[blur],
    // Hover effects
    hoverable && 'transition-all duration-300 hover:shadow-xl hover:shadow-black/20 hover:bg-white/30',
    // Interactive cursor
    onClick && 'cursor-pointer',
    className
  );

  const headerClasses = cn(
    'px-6 py-4 border-b border-white/10',
    headerClassName
  );

  const bodyClasses = cn(
    'px-6 py-4',
    bodyClassName
  );

  return (
    <Card
      className={cardClasses}
      isPressable={Boolean(onClick)}
      onPress={onClick}
      data-testid={testId}
      {...props}
    >
      {header && (
        <CardHeader className={headerClasses}>
          {header}
        </CardHeader>
      )}
      <CardBody className={bodyClasses}>
        {children}
      </CardBody>
    </Card>
  );
};

export default GlassmorphismCard;