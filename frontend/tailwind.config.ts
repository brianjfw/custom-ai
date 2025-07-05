import type { Config } from 'tailwindcss'
import { heroui } from '@heroui/theme'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Enhanced color system with glassmorphism palette
      colors: {
        background: {
          DEFAULT: '#f4f3ff',
          alt: '#faf9f7',
          elevated: '#ffffff',
          glass: 'rgba(255, 255, 255, 0.95)',
        },
        surface: {
          DEFAULT: '#faf9f7',
          alt: '#f8f9fa',
          elevated: '#ffffff',
          glass: 'rgba(255, 255, 255, 0.95)',
        },
        foreground: {
          DEFAULT: '#2c2c2c',
          secondary: '#6c757d',
          muted: '#9ca3af',
          inverse: '#ffffff',
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.1)',
          medium: 'rgba(255, 255, 255, 0.6)',
          strong: 'rgba(255, 255, 255, 0.9)',
          ultra: 'rgba(255, 255, 255, 0.95)',
          border: 'rgba(255, 255, 255, 0.2)',
          'border-strong': 'rgba(255, 255, 255, 0.4)',
        },
        accent: {
          coral: {
            DEFAULT: '#ff6b6b',
            light: '#ff9f9f',
            lighter: '#ffcccc',
            dark: '#ff3333',
            darker: '#e60000',
          },
          blue: {
            DEFAULT: '#4ecdc4',
            light: '#7ed8d1',
            lighter: '#ade3de',
            dark: '#2bb8b0',
            darker: '#1a9d96',
          },
          amber: {
            DEFAULT: '#ffd93d',
            light: '#ffe066',
            lighter: '#ffe799',
            dark: '#ffcc00',
            darker: '#e6b800',
          },
          sage: {
            DEFAULT: '#a8e6cf',
            light: '#c4eed9',
            lighter: '#e0f6e3',
            dark: '#8bdfc4',
            darker: '#6ed8b9',
          },
        },
      },
      
      // Enhanced typography with Inter font system
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'sans-serif',
        ],
        mono: [
          'SF Mono',
          'Monaco',
          'Inconsolata',
          'Roboto Mono',
          'Fira Code',
          'monospace',
        ],
        display: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
      },
      
      // Enhanced letter spacing for professional appearance
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '-0.01em',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },
      
      // Enhanced line heights for optimal readability
      lineHeight: {
        none: '1',
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2',
      },
      
      // Enhanced backdrop blur system
      backdropBlur: {
        xs: '8px',
        sm: '12px',
        md: '20px',
        lg: '25px',
        xl: '30px',
        '2xl': '40px',
        '3xl': '50px',
      },
      
      // Enhanced shadow system with glassmorphism effects
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.1)',
        'glass-sm': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'glass-lg': '0 12px 40px rgba(0, 0, 0, 0.15)',
        'glass-xl': '0 20px 60px rgba(0, 0, 0, 0.2)',
        'glass-2xl': '0 32px 80px rgba(0, 0, 0, 0.25)',
        'glass-inner': 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'glass-inner-lg': 'inset 0 2px 0 rgba(255, 255, 255, 0.15)',
      },
      
      // Enhanced border radius scale
      borderRadius: {
        xs: '8px',
        sm: '12px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '40px',
        '3xl': '48px',
        '4xl': '56px',
        full: '9999px',
      },
      
      // Enhanced spacing scale with golden ratio proportions
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
        '4xl': '80px',
        '5xl': '96px',
        '6xl': '128px',
        '7xl': '160px',
        '8xl': '192px',
      },
      
      // Enhanced animation system with glassmorphism keyframes
      animation: {
        'glass-fade-in': 'glassFadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'glass-slide-up': 'glassSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'glass-slide-in-left': 'glassSlideInLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'glass-slide-in-right': 'glassSlideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'glass-scale': 'glassScale 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
        'glass-glow': 'glassGlow 2s ease-in-out infinite',
        'glass-float': 'glassFloat 3s ease-in-out infinite',
        'glass-shimmer': 'glassShimmer 2s ease-in-out infinite',
        'glass-pulse': 'glassPulse 2s ease-in-out infinite',
        'glass-bounce': 'bounce 1s ease-in-out infinite',
        'glass-spin': 'spin 1s linear infinite',
        'glass-ping': 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      
      // Enhanced keyframe definitions
      keyframes: {
        glassFadeIn: {
          from: {
            opacity: '0',
            backdropFilter: 'blur(0px)',
            transform: 'translateY(20px)',
          },
          to: {
            opacity: '1',
            backdropFilter: 'blur(20px)',
            transform: 'translateY(0)',
          },
        },
        glassSlideUp: {
          from: {
            opacity: '0',
            transform: 'translateY(40px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        glassSlideInLeft: {
          from: {
            opacity: '0',
            transform: 'translateX(-40px)',
          },
          to: {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        glassSlideInRight: {
          from: {
            opacity: '0',
            transform: 'translateX(40px)',
          },
          to: {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        glassScale: {
          from: {
            opacity: '0',
            transform: 'scale(0.95)',
          },
          to: {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        glassGlow: {
          '0%, 100%': {
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          },
          '50%': {
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2), 0 0 30px #ff6b6b',
          },
        },
        glassFloat: {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-20px)',
          },
        },
        glassShimmer: {
          '0%': {
            backgroundPosition: '-200px 0',
          },
          '100%': {
            backgroundPosition: 'calc(200px + 100%) 0',
          },
        },
        glassPulse: {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '0.5',
          },
        },
      },
      
      // Enhanced timing functions
      transitionTimingFunction: {
        'glass': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'glass-bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'glass-smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'glass-snap': 'cubic-bezier(0.77, 0, 0.175, 1)',
        'glass-gentle': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
      
      // Enhanced duration scale
      transitionDuration: {
        instant: '0ms',
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
        slower: '700ms',
        slowest: '1000ms',
      },
      
      // Enhanced z-index scale
      zIndex: {
        base: '0',
        raised: '10',
        overlay: '20',
        modal: '30',
        popover: '40',
        tooltip: '50',
        notification: '60',
        maximum: '9999',
      },
      
      // Enhanced gradient system
      backgroundImage: {
        'glass-gradient-soft': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        'glass-gradient-medium': 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
        'glass-gradient-strong': 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.2) 100%)',
        'glass-gradient-sunset': 'linear-gradient(135deg, #f4f3ff 0%, #faf9f7 50%, #fff5f5 100%)',
        'glass-gradient-dawn': 'linear-gradient(135deg, #f0fdfc 0%, #f4f3ff 50%, #fff5f5 100%)',
        'glass-gradient-warm': 'linear-gradient(135deg, #faf9f7 0%, #fff5f5 100%)',
        'accent-coral-gradient': 'linear-gradient(135deg, #ff6b6b 0%, #ff9f9f 100%)',
        'accent-coral-gradient-intense': 'linear-gradient(135deg, #ff3333 0%, #ff6b6b 100%)',
        'accent-blue-gradient': 'linear-gradient(135deg, #4ecdc4 0%, #7ed8d1 100%)',
        'accent-blue-gradient-intense': 'linear-gradient(135deg, #2bb8b0 0%, #4ecdc4 100%)',
        'accent-amber-gradient': 'linear-gradient(135deg, #ffd93d 0%, #ffe066 100%)',
        'accent-amber-gradient-intense': 'linear-gradient(135deg, #ffcc00 0%, #ffd93d 100%)',
        'accent-sage-gradient': 'linear-gradient(135deg, #a8e6cf 0%, #c4eed9 100%)',
        'accent-sage-gradient-intense': 'linear-gradient(135deg, #8bdfc4 0%, #a8e6cf 100%)',
      },
      
      // Enhanced screen breakpoints
      screens: {
        xs: '320px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
      },
    },
  },
  
  // Enhanced plugins with custom utilities
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            background: '#f4f3ff',
            foreground: '#2c2c2c',
            primary: {
              DEFAULT: '#ff6b6b',
              foreground: '#ffffff',
            },
            secondary: {
              DEFAULT: '#4ecdc4',
              foreground: '#ffffff',
            },
            success: {
              DEFAULT: '#a8e6cf',
              foreground: '#ffffff',
            },
            warning: {
              DEFAULT: '#ffd93d',
              foreground: '#000000',
            },
            danger: {
              DEFAULT: '#ff6b6b',
              foreground: '#ffffff',
            },
          },
        },
        dark: {
          colors: {
            background: '#1a1625',
            foreground: '#ffffff',
            primary: {
              DEFAULT: '#ff6b6b',
              foreground: '#ffffff',
            },
            secondary: {
              DEFAULT: '#4ecdc4',
              foreground: '#ffffff',
            },
            success: {
              DEFAULT: '#a8e6cf',
              foreground: '#000000',
            },
            warning: {
              DEFAULT: '#ffd93d',
              foreground: '#000000',
            },
            danger: {
              DEFAULT: '#ff6b6b',
              foreground: '#ffffff',
            },
          },
        },
      },
    }),
    
    // Custom plugin for glassmorphism utilities
    function({ addUtilities, addComponents, addBase, theme }: { 
      addUtilities: (utilities: Record<string, any>) => void; 
      addComponents: (components: Record<string, any>) => void; 
      addBase: (base: Record<string, any>) => void; 
      theme: (path: string) => any; 
    }) {
      // Add base styles
      addBase({
        ':root': {
          '--glass-bg': 'rgba(255, 255, 255, 0.1)',
          '--glass-bg-medium': 'rgba(255, 255, 255, 0.6)',
          '--glass-bg-strong': 'rgba(255, 255, 255, 0.9)',
          '--glass-border': 'rgba(255, 255, 255, 0.2)',
          '--backdrop-blur-md': 'blur(20px)',
          '--shadow-glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
          '--shadow-glass-inner': 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        },
      });
      
      // Add glassmorphism utilities
      addUtilities({
        '.glass': {
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--backdrop-blur-md)',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--shadow-glass), var(--shadow-glass-inner)',
        },
        '.glass-medium': {
          background: 'var(--glass-bg-medium)',
          backdropFilter: 'var(--backdrop-blur-md)',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--shadow-glass), var(--shadow-glass-inner)',
        },
        '.glass-strong': {
          background: 'var(--glass-bg-strong)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--shadow-glass), var(--shadow-glass-inner)',
        },
        '.text-glass': {
          color: 'var(--foreground)',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
        },
        '.text-glass-secondary': {
          color: 'var(--foreground-secondary)',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
        },
        '.text-glass-muted': {
          color: 'var(--foreground-muted)',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
        },
        '.glass-hover': {
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
        },
        '.glass-hover:hover': {
          background: 'var(--glass-bg-medium)',
          transform: 'translateY(-2px) scale(1.02)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), var(--shadow-glass-inner)',
        },
        '.glass-hover:active': {
          transform: 'translateY(0) scale(0.98)',
          transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      });
      
      // Add glassmorphism components
      addComponents({
        '.glass-card': {
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--backdrop-blur-md)',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--shadow-glass), var(--shadow-glass-inner)',
          borderRadius: theme('borderRadius.lg'),
          padding: theme('spacing.lg'),
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
        },
        '.glass-card::before': {
          content: "''",
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
        },
        '.glass-nav': {
          background: 'var(--glass-bg-strong)',
          backdropFilter: 'blur(25px)',
          border: '1px solid var(--glass-border)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), var(--shadow-glass-inner)',
          borderRadius: theme('borderRadius.lg'),
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
        },
        '.glass-nav::after': {
          content: "''",
          position: 'absolute',
          inset: '0',
          borderRadius: 'inherit',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.1) 100%)',
          pointerEvents: 'none',
        },
        '.glass-button': {
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--backdrop-blur-md)',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--shadow-glass), var(--shadow-glass-inner)',
          borderRadius: theme('borderRadius.2xl'),
          padding: `${theme('spacing.sm')} ${theme('spacing.lg')}`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          fontWeight: '500',
          fontSize: '0.875rem',
          letterSpacing: '-0.01em',
          position: 'relative',
          overflow: 'hidden',
        },
        '.glass-button::before': {
          content: "''",
          position: 'absolute',
          top: '0',
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
          transition: 'left 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        '.glass-button:hover::before': {
          left: '100%',
        },
        '.glass-button:hover': {
          background: 'var(--glass-bg-medium)',
          transform: 'translateY(-2px)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), var(--shadow-glass-inner)',
        },
        '.glass-button:active': {
          transform: 'translateY(0) scale(0.98)',
          transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      });
      
      // Add animation delay utilities
      addUtilities({
        '.delay-glass-1': { animationDelay: '0.1s' },
        '.delay-glass-2': { animationDelay: '0.2s' },
        '.delay-glass-3': { animationDelay: '0.3s' },
        '.delay-glass-4': { animationDelay: '0.4s' },
        '.delay-glass-5': { animationDelay: '0.5s' },
        '.duration-glass-fast': { animationDuration: '0.15s' },
        '.duration-glass-normal': { animationDuration: '0.3s' },
        '.duration-glass-slow': { animationDuration: '0.5s' },
        '.duration-glass-slower': { animationDuration: '0.7s' },
      });
      
      // Add responsive glassmorphism utilities
      addUtilities({
        '@media (max-width: 768px)': {
          '.glass-hover:hover': {
            transform: 'none',
          },
          '.glass-hover:active': {
            transform: 'scale(0.95)',
          },
        },
      });
    },
  ],
}

export default config