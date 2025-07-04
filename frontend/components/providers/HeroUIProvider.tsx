'use client';

import { HeroUIProvider as BaseHeroUIProvider } from '@heroui/react';

interface HeroUIProviderProps {
  children: React.ReactNode;
}

/**
 * HeroUI Provider Component
 * Provides theme context and configuration for the AI-Powered SMB Platform
 */
export function HeroUIProvider({ children }: HeroUIProviderProps) {
  return (
    <BaseHeroUIProvider
      className="min-h-screen bg-background font-sans antialiased"
    >
      {children}
    </BaseHeroUIProvider>
  );
}

export default HeroUIProvider;