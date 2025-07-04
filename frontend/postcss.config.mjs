import { heroui } from '@heroui/theme'

const config = {
  plugins: [
    ["@tailwindcss/postcss", {
      config: {
        plugins: [heroui({
          themes: {
            light: {
              colors: {
                background: '#faf9f7',
                foreground: '#2d3748',
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
                secondary: {
                  DEFAULT: '#ff6b6b',
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
                background: '#1a1a1a',
                foreground: '#ededed',
                primary: {
                  DEFAULT: '#2d2d3a',
                  foreground: '#ffffff',
                },
                secondary: {
                  DEFAULT: '#ff6b6b',
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
          },
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
        })],
      },
    }],
  ],
};

export default config;
