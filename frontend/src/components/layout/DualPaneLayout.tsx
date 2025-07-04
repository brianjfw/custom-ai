"use client";

import React, { useState, ReactNode, useCallback } from 'react';
import { NavigationPanel } from './NavigationPanel';
import { ContentWorkspace } from './ContentWorkspace';
import { cn } from '@/lib/utils';

interface DualPaneLayoutProps {
  children: ReactNode;
  className?: string;
  initialNavWidth?: number;
  minNavWidth?: number;
  maxNavWidth?: number;
  showNavigation?: boolean;
}

export function DualPaneLayout({
  children,
  className,
  initialNavWidth = 320,
  minNavWidth = 280,
  maxNavWidth = 480,
  showNavigation = true,
}: DualPaneLayoutProps) {
  const [navWidth, setNavWidth] = useState(initialNavWidth);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const newWidth = Math.max(minNavWidth, Math.min(maxNavWidth, e.clientX));
    setNavWidth(newWidth);
  }, [isDragging, minNavWidth, maxNavWidth]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-background via-surface to-surface-alt",
      "grid grid-cols-1 lg:grid-cols-[auto_1fr] transition-all duration-300",
      className
    )}>
      {/* Navigation Panel */}
      {showNavigation && (
        <>
          <NavigationPanel
            width={navWidth}
            isCollapsed={isNavCollapsed}
            onToggleCollapse={() => setIsNavCollapsed(!isNavCollapsed)}
            className="hidden lg:block"
          />
          
          {/* Resize Handle */}
          <div
            className="hidden lg:block w-1 bg-gradient-to-b from-transparent via-white/10 to-transparent cursor-col-resize hover:bg-white/20 transition-colors duration-200 group"
            onMouseDown={handleMouseDown}
            style={{ 
              position: 'absolute',
              left: `${navWidth}px`,
              top: 0,
              bottom: 0,
              zIndex: 10
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-0.5 h-8 bg-white/30 group-hover:bg-white/50 transition-colors duration-200" />
            </div>
          </div>
        </>
      )}

      {/* Content Workspace */}
      <ContentWorkspace
        navigationWidth={showNavigation ? navWidth : 0}
        isNavigationCollapsed={isNavCollapsed}
        onToggleNavigation={() => setIsNavCollapsed(!isNavCollapsed)}
      >
        {children}
      </ContentWorkspace>

      {/* Mobile Navigation Overlay */}
      {showNavigation && !isNavCollapsed && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsNavCollapsed(true)}
        >
          <div className="absolute left-0 top-0 h-full w-80 transform transition-transform duration-300">
            <NavigationPanel
              width={320}
              isCollapsed={false}
              onToggleCollapse={() => setIsNavCollapsed(true)}
              className="h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}