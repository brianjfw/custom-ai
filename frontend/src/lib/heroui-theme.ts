// HeroUI Theme Configuration for Glassmorphism Design System
export const heroUIThemeConfig = {
  light: {
    colors: {
      // Base colors matching our glassmorphism theme
      background: '#f4f3ff',
      foreground: '#2c2c2c',
      
      // Surface colors
      content1: '#ffffff',
      content2: '#faf9f7',
      content3: '#f8f9fa',
      content4: '#f1f3f4',
      
      // Primary colors - using our accent coral
      primary: {
        50: '#fff5f5',
        100: '#ffebeb',
        200: '#ffd1d1',
        300: '#ffb3b3',
        400: '#ff8a8a',
        500: '#ff6b6b',
        600: '#ff4d4d',
        700: '#ff2e2e',
        800: '#e60000',
        900: '#cc0000',
        DEFAULT: '#ff6b6b',
        foreground: '#ffffff',
      },
      
      // Secondary colors - using our accent blue
      secondary: {
        50: '#f0fdfc',
        100: '#ccfbf1',
        200: '#99f6e4',
        300: '#5eead4',
        400: '#2dd4bf',
        500: '#4ecdc4',
        600: '#14b8a6',
        700: '#0f9ba1',
        800: '#0f7c7c',
        900: '#115e59',
        DEFAULT: '#4ecdc4',
        foreground: '#ffffff',
      },
      
      // Success colors - using our accent sage
      success: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#a8e6cf',
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d',
        DEFAULT: '#a8e6cf',
        foreground: '#ffffff',
      },
      
      // Warning colors - using our accent amber
      warning: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#ffd93d',
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f',
        DEFAULT: '#ffd93d',
        foreground: '#000000',
      },
      
      // Danger colors - using our accent coral
      danger: {
        50: '#fff5f5',
        100: '#ffebeb',
        200: '#ffd1d1',
        300: '#ffb3b3',
        400: '#ff8a8a',
        500: '#ff6b6b',
        600: '#ff4d4d',
        700: '#ff2e2e',
        800: '#e60000',
        900: '#cc0000',
        DEFAULT: '#ff6b6b',
        foreground: '#ffffff',
      },
      
      // Focus colors
      focus: '#4ecdc4',
      
      // Border colors for glassmorphism
      divider: 'rgba(255, 255, 255, 0.2)',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
  },
  dark: {
    colors: {
      // Base colors for dark theme
      background: '#1a1625',
      foreground: '#ffffff',
      
      // Surface colors
      content1: '#2d2436',
      content2: '#3a2f47',
      content3: '#473d58',
      content4: '#544a69',
      
      // Primary colors - using our accent coral
      primary: {
        50: '#2d1b1b',
        100: '#4a2626',
        200: '#663131',
        300: '#833c3c',
        400: '#9f4747',
        500: '#ff6b6b',
        600: '#ff8a8a',
        700: '#ffaaaa',
        800: '#ffcaca',
        900: '#ffeaea',
        DEFAULT: '#ff6b6b',
        foreground: '#ffffff',
      },
      
      // Secondary colors - using our accent blue
      secondary: {
        50: '#1a2e2c',
        100: '#2a4b47',
        200: '#3a6863',
        300: '#4a857e',
        400: '#5aa299',
        500: '#4ecdc4',
        600: '#6ed4cc',
        700: '#8edbd4',
        800: '#aee2dc',
        900: '#cee9e4',
        DEFAULT: '#4ecdc4',
        foreground: '#ffffff',
      },
      
      // Success colors - using our accent sage
      success: {
        50: '#1a2d1f',
        100: '#2a4a33',
        200: '#3a6747',
        300: '#4a845b',
        400: '#5aa16f',
        500: '#a8e6cf',
        600: '#b8ead7',
        700: '#c8eedf',
        800: '#d8f2e7',
        900: '#e8f6ef',
        DEFAULT: '#a8e6cf',
        foreground: '#000000',
      },
      
      // Warning colors - using our accent amber
      warning: {
        50: '#2d2719',
        100: '#4a4129',
        200: '#665b39',
        300: '#837549',
        400: '#9f8f59',
        500: '#ffd93d',
        600: '#ffdf5d',
        700: '#ffe57d',
        800: '#ffeb9d',
        900: '#fff1bd',
        DEFAULT: '#ffd93d',
        foreground: '#000000',
      },
      
      // Danger colors - using our accent coral
      danger: {
        50: '#2d1b1b',
        100: '#4a2626',
        200: '#663131',
        300: '#833c3c',
        400: '#9f4747',
        500: '#ff6b6b',
        600: '#ff8a8a',
        700: '#ffaaaa',
        800: '#ffcaca',
        900: '#ffeaea',
        DEFAULT: '#ff6b6b',
        foreground: '#ffffff',
      },
      
      // Focus colors
      focus: '#4ecdc4',
      
      // Border colors for glassmorphism
      divider: 'rgba(255, 255, 255, 0.1)',
      overlay: 'rgba(0, 0, 0, 0.7)',
    },
  },
  layout: {
    // Configure layout with glassmorphism in mind
    fontSize: {
      tiny: '0.75rem',
      small: '0.875rem',
      medium: '1rem',
      large: '1.125rem',
    },
    lineHeight: {
      tiny: '1rem',
      small: '1.25rem',
      medium: '1.5rem',
      large: '1.75rem',
    },
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
    spacingUnit: 4,
    disabledOpacity: 0.5,
  },
}