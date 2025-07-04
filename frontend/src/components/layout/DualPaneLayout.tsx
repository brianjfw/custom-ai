'use client';

import { ReactNode, useState } from 'react';
import { NavigationPanel } from './NavigationPanel';
import { ContentWorkspace } from './ContentWorkspace';
import { Button } from '@heroui/button';
import { Menu, X } from 'lucide-react';

interface DualPaneLayoutProps {
  children?: ReactNode;
  className?: string;
}

export function DualPaneLayout({ children, className = '' }: DualPaneLayoutProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className={`dual-pane-layout ${className}`}>
      {/* Mobile Navigation Toggle */}
      <div className="mobile-nav-toggle md:hidden">
        <Button
          isIconOnly
          variant="ghost"
          className="glass-button fixed top-4 left-4 z-50"
          onPress={() => setIsMobileNavOpen(!isMobileNavOpen)}
        >
          {isMobileNavOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Navigation Panel */}
      <NavigationPanel 
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />

      {/* Content Workspace */}
      <ContentWorkspace>
        {children}
      </ContentWorkspace>

      {/* Mobile Navigation Overlay */}
      {isMobileNavOpen && (
        <div
          className="mobile-nav-overlay md:hidden"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}
    </div>
  );
}