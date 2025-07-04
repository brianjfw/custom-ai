import type { Config } from 'tailwindcss'
import { heroUIThemeConfig } from './src/lib/heroui-theme'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Base colors
        background: 'var(--background)',
        surface: 'var(--surface)',
        'surface-alt': 'var(--surface-alt)',
        foreground: 'var(--foreground)',
        'foreground-secondary': 'var(--foreground-secondary)',
        
        // Glassmorphism colors
        'glass-light': 'var(--glass-bg)',
        'glass-medium': 'var(--glass-bg-medium)',
        'glass-strong': 'var(--glass-bg-strong)',
        'glass-border': 'var(--glass-border)',
        
        // Accent colors
        'accent-coral': 'var(--accent-coral)',
        'accent-blue': 'var(--accent-blue)',
        'accent-amber': 'var(--accent-amber)',
        'accent-sage': 'var(--accent-sage)',
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['SF Mono', 'Consolas', 'Liberation Mono', 'monospace'],
      },
      backdropBlur: {
        'glass-sm': 'var(--backdrop-blur-sm)',
        'glass-md': 'var(--backdrop-blur-md)',
        'glass-lg': 'var(--backdrop-blur-lg)',
      },
      boxShadow: {
        'glass': 'var(--shadow-glass)',
        'glass-lg': 'var(--shadow-glass-lg)',
      },
      borderRadius: {
        'glass-sm': 'var(--radius-sm)',
        'glass-md': 'var(--radius-md)',
        'glass-lg': 'var(--radius-lg)',
        'glass-xl': 'var(--radius-xl)',
      },
      spacing: {
        'glass-xs': 'var(--spacing-xs)',
        'glass-sm': 'var(--spacing-sm)',
        'glass-md': 'var(--spacing-md)',
        'glass-lg': 'var(--spacing-lg)',
        'glass-xl': 'var(--spacing-xl)',
        'glass-2xl': 'var(--spacing-2xl)',
        'glass-3xl': 'var(--spacing-3xl)',
      },
      animation: {
        'glass-fade-in': 'glassFadeIn 0.3s ease-out',
        'glass-slide-up': 'glassSlideUp 0.4s ease-out',
      },
      keyframes: {
        glassFadeIn: {
          'from': {
            opacity: '0',
            'backdrop-filter': 'blur(0)',
          },
          'to': {
            opacity: '1',
            'backdrop-filter': 'var(--backdrop-blur-md)',
          },
        },
        glassSlideUp: {
          'from': {
            opacity: '0',
            transform: 'translateY(20px)',
            'backdrop-filter': 'blur(0)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
            'backdrop-filter': 'var(--backdrop-blur-md)',
          },
        },
      },
    },
  },
  plugins: [
    // HeroUI plugin will be added here once we have the correct import
  ],
}

export default config