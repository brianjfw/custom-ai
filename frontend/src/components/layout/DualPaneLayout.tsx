"use client";

import { ReactNode, useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface DualPaneLayoutProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
  className?: string;
  defaultLeftWidth?: number;
  minLeftWidth?: number;
  maxLeftWidth?: number;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  showResizeHandle?: boolean;
  animateEntrance?: boolean;
  enableKeyboardShortcuts?: boolean;
  onLayoutChange?: (width: number, collapsed: boolean) => void;
}

export function DualPaneLayout({
  leftPanel,
  rightPanel,
  className,
  defaultLeftWidth = 320,
  minLeftWidth = 240,
  maxLeftWidth = 480,
  defaultCollapsed = false,
  showResizeHandle = true,
  animateEntrance = true,
  enableKeyboardShortcuts = true,
  onLayoutChange,
}: DualPaneLayoutProps) {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileOverlay, setShowMobileOverlay] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  // Enhanced mobile detection
  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && !isCollapsed) {
        setIsCollapsed(true);
      }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    // Simulate loading state for entrance animation
    const timer = setTimeout(() => setIsLoading(false), 100);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
      clearTimeout(timer);
    };
  }, [isCollapsed]);

  const toggleCollapse = useCallback(() => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    
    // Haptic feedback on supported devices
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    // Mobile overlay handling
    if (isMobile) {
      setShowMobileOverlay(!newCollapsed);
    }

    onLayoutChange?.(leftWidth, newCollapsed);
  }, [isCollapsed, leftWidth, isMobile, onLayoutChange]);

  // Enhanced keyboard shortcuts
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeydown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + B to toggle navigation panel
      if ((e.metaKey || e.ctrlKey) && e.key === 'b' && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        toggleCollapse();
      }
      
      // Escape key to close mobile overlay
      if (e.key === 'Escape' && isMobile && showMobileOverlay) {
        e.preventDefault();
        setShowMobileOverlay(false);
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [enableKeyboardShortcuts, isMobile, showMobileOverlay, toggleCollapse]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!showResizeHandle || isCollapsed || isMobile) return;

    e.preventDefault();
    setIsResizing(true);
    setIsDragging(true);
    startXRef.current = e.clientX;
    startWidthRef.current = leftWidth;

    // Add global mouse event listeners
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startXRef.current;
      const newWidth = Math.max(
        minLeftWidth,
        Math.min(maxLeftWidth, startWidthRef.current + deltaX)
      );
      setLeftWidth(newWidth);
      onLayoutChange?.(newWidth, isCollapsed);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Haptic feedback on resize complete
      if ('vibrate' in navigator) {
        navigator.vibrate(25);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [showResizeHandle, isCollapsed, isMobile, leftWidth, minLeftWidth, maxLeftWidth, onLayoutChange]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!showResizeHandle || isCollapsed || isMobile) return;

    const touch = e.touches[0];
    setIsResizing(true);
    setIsDragging(true);
    startXRef.current = touch.clientX;
    startWidthRef.current = leftWidth;

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const deltaX = touch.clientX - startXRef.current;
      const newWidth = Math.max(
        minLeftWidth,
        Math.min(maxLeftWidth, startWidthRef.current + deltaX)
      );
      setLeftWidth(newWidth);
      onLayoutChange?.(newWidth, isCollapsed);
    };

    const handleTouchEnd = () => {
      setIsResizing(false);
      setIsDragging(false);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  }, [showResizeHandle, isCollapsed, isMobile, leftWidth, minLeftWidth, maxLeftWidth, onLayoutChange]);

  const leftPanelWidth = isCollapsed ? 0 : leftWidth;
  const rightPanelWidth = `calc(100% - ${leftPanelWidth}px)`;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex h-screen w-full overflow-hidden bg-glass-gradient-sunset",
        // Enhanced entrance animations
        animateEntrance && !isLoading && "animate-glass-entrance",
        isLoading && "opacity-0",
        className
      )}
      style={{
        '--left-panel-width': `${leftPanelWidth}px`,
        '--right-panel-width': rightPanelWidth,
      } as React.CSSProperties}
    >
      {/* Enhanced floating background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent-blue/5 rounded-full blur-xl animate-glass-float" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-accent-coral/5 rounded-full blur-xl animate-glass-float" style={{animationDelay: '2s'}} />
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-accent-sage/5 rounded-full blur-xl animate-glass-float" style={{animationDelay: '4s'}} />
      </div>

      {/* Enhanced mobile overlay */}
      {isMobile && showMobileOverlay && (
        <div 
          className="fixed inset-0 z-overlay bg-black/50 backdrop-blur-sm animate-glass-entrance"
          onClick={() => setShowMobileOverlay(false)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setShowMobileOverlay(false);
            }
          }}
          aria-label="Close navigation overlay"
        />
      )}

      {/* Enhanced left panel */}
      <div
        className={cn(
          "relative transition-all duration-glass-normal ease-glass-smooth",
          // Desktop styles
          !isMobile && [
            "h-full border-r border-glass-border bg-glass-bg-medium backdrop-blur-lg",
            "shadow-glass-lg shadow-black/10",
            isCollapsed && "w-0 overflow-hidden opacity-0",
            !isCollapsed && "opacity-100",
          ],
          // Mobile styles
          isMobile && [
            "fixed left-0 top-0 z-modal h-full w-80 max-w-[85vw]",
            "bg-glass-bg-strong backdrop-blur-xl border-r border-glass-border",
            "shadow-glass-xl shadow-black/20",
            showMobileOverlay ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0",
          ],
          // Enhanced entrance animations
          animateEntrance && !isLoading && !isMobile && "animate-glass-slide-in-left delay-glass-1",
          animateEntrance && !isLoading && isMobile && showMobileOverlay && "animate-glass-slide-in-left",
        )}
        style={{
          width: isMobile ? undefined : leftPanelWidth,
        }}
        aria-hidden={isCollapsed}
        role="complementary"
        aria-label="Navigation panel"
      >
        {/* Enhanced panel background effects */}
        <div className="absolute inset-0 bg-glass-gradient-soft pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-blue/40 to-transparent" />
        
        {/* Panel content */}
        <div className="relative z-10 h-full overflow-hidden">
          {leftPanel}
        </div>

        {/* Enhanced mobile close indicator */}
        {isMobile && showMobileOverlay && (
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={() => setShowMobileOverlay(false)}
              className="glass-button p-2 text-glass-secondary hover:text-glass"
              aria-label="Close navigation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Enhanced resize handle */}
      {showResizeHandle && !isCollapsed && !isMobile && (
        <div
          ref={resizeHandleRef}
          className={cn(
            "relative w-1 bg-transparent cursor-col-resize group hover:bg-accent-blue/20 transition-all duration-glass-normal",
            isDragging && "bg-accent-blue/40",
            animateEntrance && !isLoading && "animate-glass-slide-up delay-glass-2",
          )}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize panels"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') {
              e.preventDefault();
              const newWidth = Math.max(minLeftWidth, leftWidth - 20);
              setLeftWidth(newWidth);
              onLayoutChange?.(newWidth, isCollapsed);
            }
            if (e.key === 'ArrowRight') {
              e.preventDefault();
              const newWidth = Math.min(maxLeftWidth, leftWidth + 20);
              setLeftWidth(newWidth);
              onLayoutChange?.(newWidth, isCollapsed);
            }
          }}
        >
          {/* Enhanced visual feedback */}
          <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-glass-normal">
            <div className="w-1 h-8 bg-accent-blue rounded-full shadow-glass" />
          </div>
          
          {/* Enhanced resize indicator */}
          <div className={cn(
            "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
            "w-4 h-12 glass-card flex items-center justify-center opacity-0 group-hover:opacity-100",
            "transition-all duration-glass-normal shadow-glass-lg",
            isDragging && "opacity-100 scale-110"
          )}>
            <div className="flex space-x-0.5">
              <div className="w-0.5 h-4 bg-glass-border rounded-full" />
              <div className="w-0.5 h-4 bg-glass-border rounded-full" />
            </div>
          </div>
        </div>
      )}

      {/* Enhanced right panel */}
      <div
        className={cn(
          "flex-1 h-full relative transition-all duration-glass-normal ease-glass-smooth",
          "bg-glass-bg backdrop-blur-sm",
          // Enhanced entrance animations
          animateEntrance && !isLoading && "animate-glass-slide-in-right delay-glass-3",
        )}
        style={{
          width: isMobile ? '100%' : rightPanelWidth,
          marginLeft: isMobile ? 0 : (isCollapsed ? 0 : undefined),
        }}
        role="main"
        aria-label="Main content"
      >
        {/* Enhanced panel background effects */}
        <div className="absolute inset-0 bg-glass-gradient-dawn opacity-30 pointer-events-none" />
        
        {/* Panel content */}
        <div className="relative z-10 h-full overflow-hidden">
          {rightPanel}
        </div>
      </div>

      {/* Enhanced toggle button for mobile */}
      {isMobile && (
        <button
          onClick={toggleCollapse}
          className={cn(
            "fixed top-4 left-4 z-notification glass-button p-3",
            "shadow-glass-lg hover:shadow-glass-xl transition-all duration-glass-normal",
            showMobileOverlay && "opacity-0 pointer-events-none",
            animateEntrance && !isLoading && "animate-glass-scale delay-glass-4",
          )}
          aria-label={isCollapsed ? "Open navigation" : "Close navigation"}
          aria-expanded={!isCollapsed}
        >
          <svg className="w-5 h-5 text-glass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Enhanced accessibility indicators */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isCollapsed ? "Navigation panel collapsed" : "Navigation panel expanded"}
        {isResizing && "Resizing panels"}
      </div>

      {/* Enhanced loading state */}
      {isLoading && (
        <div className="absolute inset-0 z-maximum bg-glass-bg-strong backdrop-blur-lg flex items-center justify-center">
          <div className="glass-card p-6 flex items-center gap-4">
            <div className="glass-spinner" />
            <span className="text-glass font-medium">Loading layout...</span>
          </div>
        </div>
      )}

      {/* Enhanced keyboard shortcut hint */}
      {enableKeyboardShortcuts && !isMobile && (
        <div className="fixed bottom-4 right-4 z-tooltip opacity-0 hover:opacity-100 transition-opacity duration-glass-normal pointer-events-none">
          <div className="glass-tooltip show text-xs">
            Press <kbd className="glass-badge glass-badge-blue px-2 py-1">⌘ B</kbd> to toggle navigation
          </div>
        </div>
      )}
    </div>
  );
}