'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import NavigationPanel from './NavigationPanel';
import ContentWorkspace from './ContentWorkspace';

interface DualPaneLayoutProps {
  children: React.ReactNode;
  className?: string;
  navigationContent?: React.ReactNode;
  showNavigation?: boolean;
  mobileBreakpoint?: number;
  'data-testid'?: string;
}

export const DualPaneLayout: React.FC<DualPaneLayoutProps> = ({
  children,
  className,
  navigationContent,
  showNavigation = true,
  mobileBreakpoint = 768,
  'data-testid': testId,
}) => {
  // const router = useRouter(); // Reserved for future navigation
  const [isMobile, setIsMobile] = useState(false);
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < mobileBreakpoint;
      setIsMobile(mobile);
      
      // Close navigation on mobile when screen size changes
      if (mobile && isNavigationOpen) {
        setIsNavigationOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileBreakpoint, isNavigationOpen]);

  // Handle escape key to close navigation on mobile
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobile && isNavigationOpen) {
        setIsNavigationOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobile, isNavigationOpen]);

  const layoutClasses = cn(
    'min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50',
    'relative overflow-hidden',
    className
  );

  const gridClasses = cn(
    'grid h-screen transition-all duration-300',
    // Desktop: always show both panes
    !isMobile && showNavigation && 'grid-cols-[320px_1fr]',
    !isMobile && !showNavigation && 'grid-cols-[0px_1fr]',
    // Mobile: single column
    isMobile && 'grid-cols-1'
  );

  const overlayClasses = cn(
    'fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300',
    isNavigationOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
  );

  const navigationClasses = cn(
    'relative z-50 transition-transform duration-300',
    // Desktop positioning
    !isMobile && 'transform-none',
    // Mobile positioning
    isMobile && 'fixed top-0 left-0 h-full w-80 max-w-[80vw]',
    isMobile && (isNavigationOpen ? 'translate-x-0' : '-translate-x-full')
  );

  const contentClasses = cn(
    'relative z-10 overflow-hidden',
    // Ensure content takes full height
    'h-screen'
  );

  const toggleNavigation = () => {
    setIsNavigationOpen(!isNavigationOpen);
  };

  return (
    <div className={layoutClasses} data-testid={testId}>
      {/* Mobile overlay */}
      {isMobile && (
        <div
          className={overlayClasses}
          onClick={() => setIsNavigationOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className={gridClasses}>
        {/* Navigation Panel */}
        {showNavigation && (
          <div className={navigationClasses}>
            <NavigationPanel
              isOpen={isNavigationOpen}
              onClose={() => setIsNavigationOpen(false)}
              isMobile={isMobile}
            >
              {navigationContent}
            </NavigationPanel>
          </div>
        )}

        {/* Content Workspace */}
        <div className={contentClasses}>
          <ContentWorkspace
            onToggleNavigation={toggleNavigation}
            showNavigationToggle={isMobile && showNavigation}
            isNavigationOpen={isNavigationOpen}
          >
            {children}
          </ContentWorkspace>
        </div>
      </div>
    </div>
  );
};

export default DualPaneLayout;