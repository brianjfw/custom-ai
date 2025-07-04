import type { ConfigThemes } from '@heroui/theme'

// HeroUI Theme Configuration for Glassmorphism Design System
export const glassmorphismThemes: ConfigThemes = {
  light: {
    colors: {
      // Background colors
      background: '#faf9f7',
      foreground: '#2d3748',
      
      // Primary glassmorphism colors
      primary: {
        50: '#f4f3ff',
        100: '#ebe9fe',
        200: '#d9d6fe',
        300: '#bfb8fd',
        400: '#9f8ffa',
        500: '#7c3aed',
        600: '#6d28d9',
        700: '#5b21b6',
        800: '#4c1d95',
        900: '#3c1a78',
        DEFAULT: '#f4f3ff',
        foreground: '#2d3748',
      },
      
      // Accent colors from glassmorphism palette
      secondary: {
        50: '#fef7f7',
        100: '#fdeaea',
        200: '#fbd2d2',
        300: '#f8b4b4',
        400: '#f48888',
        500: '#ff6b6b',
        600: '#ef4444',
        700: '#dc2626',
        800: '#b91c1c',
        900: '#991b1b',
        DEFAULT: '#ff6b6b',
        foreground: '#ffffff',
      },
      
      success: {
        50: '#f0fdfa',
        100: '#ccfbf1',
        200: '#99f6e4',
        300: '#5eead4',
        400: '#2dd4bf',
        500: '#0d9488',
        600: '#0f766e',
        700: '#115e59',
        800: '#134e4a',
        900: '#064e3b',
        DEFAULT: '#a8e6cf',
        foreground: '#ffffff',
      },
      
      warning: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f',
        DEFAULT: '#ffd93d',
        foreground: '#ffffff',
      },
      
      danger: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',
        DEFAULT: '#ff6b6b',
        foreground: '#ffffff',
      },
      
      // Glass effect colors
      default: {
        50: '#fafafa',
        100: '#f4f4f5',
        200: '#e4e4e7',
        300: '#d4d4d8',
        400: '#a1a1aa',
        500: '#71717a',
        600: '#52525b',
        700: '#3f3f46',
        800: '#27272a',
        900: '#18181b',
        DEFAULT: '#ffffff',
        foreground: '#2d3748',
      },
      
      // Content areas with glass effects
      content1: 'rgba(255, 255, 255, 0.8)',
      content2: 'rgba(255, 255, 255, 0.6)',
      content3: 'rgba(255, 255, 255, 0.4)',
      content4: 'rgba(255, 255, 255, 0.2)',
      
      // Glass borders and overlays
      divider: 'rgba(255, 255, 255, 0.2)',
      overlay: 'rgba(0, 0, 0, 0.1)',
      focus: '#4ecdc4',
    },
    layout: {
      radius: {
        small: '8px',
        medium: '12px',
        large: '16px',
      },
      borderWidth: {
        small: '1px',
        medium: '2px',
        large: '3px',
      },
    },
  },
  dark: {
    colors: {
      // Dark mode background
      background: '#1a1a1a',
      foreground: '#ededed',
      
      // Dark mode primary colors
      primary: {
        50: '#2d2d3a',
        100: '#3a3a4a',
        200: '#4a4a5a',
        300: '#5a5a6a',
        400: '#6a6a7a',
        500: '#7a7a8a',
        600: '#8a8a9a',
        700: '#9a9aaa',
        800: '#aaaabc',
        900: '#bababc',
        DEFAULT: '#2d2d3a',
        foreground: '#ffffff',
      },
      
      // Dark mode secondary
      secondary: {
        50: '#2d1a1a',
        100: '#3a2222',
        200: '#4a2a2a',
        300: '#5a3333',
        400: '#6a3b3b',
        500: '#ff6b6b',
        600: '#ff7979',
        700: '#ff8787',
        800: '#ff9595',
        900: '#ffa3a3',
        DEFAULT: '#ff6b6b',
        foreground: '#ffffff',
      },
      
      success: {
        50: '#1a2d2a',
        100: '#223a33',
        200: '#2a4a3b',
        300: '#335a44',
        400: '#3b6a4c',
        500: '#059669',
        600: '#047857',
        700: '#065f46',
        800: '#064e3b',
        900: '#022c22',
        DEFAULT: '#a8e6cf',
        foreground: '#ffffff',
      },
      
      warning: {
        50: '#2d2a1a',
        100: '#3a3322',
        200: '#4a3f2a',
        300: '#5a4c33',
        400: '#6a583b',
        500: '#d97706',
        600: '#b45309',
        700: '#92400e',
        800: '#78350f',
        900: '#451a03',
        DEFAULT: '#ffd93d',
        foreground: '#000000',
      },
      
      danger: {
        50: '#2d1a1a',
        100: '#3a2222',
        200: '#4a2a2a',
        300: '#5a3333',
        400: '#6a3b3b',
        500: '#dc2626',
        600: '#b91c1c',
        700: '#991b1b',
        800: '#7f1d1d',
        900: '#450a0a',
        DEFAULT: '#ff6b6b',
        foreground: '#ffffff',
      },
      
      // Dark glass effects
      default: {
        50: '#18181b',
        100: '#27272a',
        200: '#3f3f46',
        300: '#52525b',
        400: '#71717a',
        500: '#a1a1aa',
        600: '#d4d4d8',
        700: '#e4e4e7',
        800: '#f4f4f5',
        900: '#fafafa',
        DEFAULT: '#1f1f1f',
        foreground: '#ededed',
      },
      
      // Dark content areas
      content1: 'rgba(255, 255, 255, 0.05)',
      content2: 'rgba(255, 255, 255, 0.08)',
      content3: 'rgba(255, 255, 255, 0.12)',
      content4: 'rgba(255, 255, 255, 0.16)',
      
      // Dark borders and overlays
      divider: 'rgba(255, 255, 255, 0.1)',
      overlay: 'rgba(0, 0, 0, 0.3)',
      focus: '#4ecdc4',
    },
  },
}

// HeroUI plugin configuration
export const heroUIConfig = {
  themes: glassmorphismThemes,
  defaultTheme: 'light',
  layout: {
    spacingUnit: 4,
    disabledOpacity: 0.5,
    radius: {
      small: '8px',
      medium: '12px',
      large: '16px',
    },
    borderWidth: {
      small: '1px',
      medium: '2px',
      large: '3px',
    },
  },
  className: {
    // Add glassmorphism classes to all components
    base: 'font-sans antialiased',
  },
}

export type GlassmorphismTheme = typeof glassmorphismThemes