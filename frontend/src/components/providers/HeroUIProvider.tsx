'use client'

import React from 'react'
import { HeroUIProvider } from '@heroui/system'
import { useRouter } from 'next/navigation'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

interface GlassmorphismProviderProps {
  children: React.ReactNode
}

export function GlassmorphismProvider({ children }: GlassmorphismProviderProps) {
  const router = useRouter()

  return (
    <HeroUIProvider 
      navigate={router.push}
      className="h-full"
      locale="en-US"
    >
      <NextThemesProvider
        attribute="class"
        defaultTheme="light"
        themes={['light', 'dark']}
        enableSystem
        disableTransitionOnChange
      >
        <div className="relative flex flex-col h-full bg-background text-foreground">
          {children}
        </div>
      </NextThemesProvider>
    </HeroUIProvider>
  )
}

export default GlassmorphismProvider