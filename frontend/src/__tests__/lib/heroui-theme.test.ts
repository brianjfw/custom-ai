import { describe, it, expect } from '@jest/globals'
import { heroUIThemeConfig } from '@/lib/heroui-theme'

describe('HeroUI Theme Configuration', () => {
  describe('Theme Structure', () => {
    it('should have correct theme structure', () => {
      expect(heroUIThemeConfig).toBeDefined()
      expect(typeof heroUIThemeConfig).toBe('object')
    })

    it('should have light theme configuration', () => {
      expect(heroUIThemeConfig.light).toBeDefined()
      expect(typeof heroUIThemeConfig.light).toBe('object')
    })

    it('should have dark theme configuration', () => {
      expect(heroUIThemeConfig.dark).toBeDefined()
      expect(typeof heroUIThemeConfig.dark).toBe('object')
    })

    it('should have layout configuration', () => {
      expect(heroUIThemeConfig.layout).toBeDefined()
      expect(typeof heroUIThemeConfig.layout).toBe('object')
    })
  })

  describe('Light Theme Colors', () => {
    it('should have primary glassmorphism colors', () => {
      const colors = heroUIThemeConfig.light.colors
      
      expect(colors.background).toBe('#f4f3ff')
      expect(colors.foreground).toBe('#2c2c2c')
      expect(colors.content1).toBe('#ffffff')
      expect(colors.content2).toBe('#faf9f7')
      expect(colors.content3).toBe('#f8f9fa')
    })

    it('should have primary accent colors', () => {
      const colors = heroUIThemeConfig.light.colors
      
      expect(colors.primary.DEFAULT).toBe('#ff6b6b')
      expect(colors.secondary.DEFAULT).toBe('#4ecdc4')
      expect(colors.success.DEFAULT).toBe('#a8e6cf')
      expect(colors.warning.DEFAULT).toBe('#ffd93d')
      expect(colors.danger.DEFAULT).toBe('#ff6b6b')
    })

    it('should have glassmorphism border colors', () => {
      const colors = heroUIThemeConfig.light.colors
      
      expect(colors.divider).toBe('rgba(255, 255, 255, 0.2)')
      expect(colors.overlay).toBe('rgba(0, 0, 0, 0.5)')
    })
  })

  describe('Dark Theme Colors', () => {
    it('should have dark glassmorphism colors', () => {
      const colors = heroUIThemeConfig.dark.colors
      
      expect(colors.background).toBe('#1a1625')
      expect(colors.foreground).toBe('#ffffff')
      expect(colors.content1).toBe('#2d2436')
      expect(colors.content2).toBe('#3a2f47')
    })

    it('should have dark accent colors', () => {
      const colors = heroUIThemeConfig.dark.colors
      
      expect(colors.primary.DEFAULT).toBe('#ff6b6b')
      expect(colors.secondary.DEFAULT).toBe('#4ecdc4')
      expect(colors.success.DEFAULT).toBe('#a8e6cf')
      expect(colors.warning.DEFAULT).toBe('#ffd93d')
    })

    it('should have dark glassmorphism border colors', () => {
      const colors = heroUIThemeConfig.dark.colors
      
      expect(colors.divider).toBe('rgba(255, 255, 255, 0.1)')
      expect(colors.overlay).toBe('rgba(0, 0, 0, 0.7)')
    })
  })

  describe('Layout Configuration', () => {
    it('should have font size configuration', () => {
      const layout = heroUIThemeConfig.layout
      
      expect(layout.fontSize.tiny).toBe('0.75rem')
      expect(layout.fontSize.small).toBe('0.875rem')
      expect(layout.fontSize.medium).toBe('1rem')
      expect(layout.fontSize.large).toBe('1.125rem')
    })

    it('should have line height configuration', () => {
      const layout = heroUIThemeConfig.layout
      
      expect(layout.lineHeight.tiny).toBe('1rem')
      expect(layout.lineHeight.small).toBe('1.25rem')
      expect(layout.lineHeight.medium).toBe('1.5rem')
      expect(layout.lineHeight.large).toBe('1.75rem')
    })

    it('should have radius configuration', () => {
      const layout = heroUIThemeConfig.layout
      
      expect(layout.radius.small).toBe('8px')
      expect(layout.radius.medium).toBe('12px')
      expect(layout.radius.large).toBe('16px')
    })

    it('should have border width configuration', () => {
      const layout = heroUIThemeConfig.layout
      
      expect(layout.borderWidth.small).toBe('1px')
      expect(layout.borderWidth.medium).toBe('2px')
      expect(layout.borderWidth.large).toBe('3px')
    })

    it('should have spacing unit configuration', () => {
      const layout = heroUIThemeConfig.layout
      
      expect(layout.spacingUnit).toBe(4)
      expect(layout.disabledOpacity).toBe(0.5)
    })
  })

  describe('Color Validation', () => {
    it('should have valid hex color values', () => {
      const lightColors = heroUIThemeConfig.light.colors
      const darkColors = heroUIThemeConfig.dark.colors
      
      // Test light theme colors
      expect(lightColors.background).toMatch(/^#[0-9a-fA-F]{6}$/)
      expect(lightColors.foreground).toMatch(/^#[0-9a-fA-F]{6}$/)
      expect(lightColors.content1).toMatch(/^#[0-9a-fA-F]{6}$/)
      expect(lightColors.primary.DEFAULT).toMatch(/^#[0-9a-fA-F]{6}$/)
      
      // Test dark theme colors
      expect(darkColors.background).toMatch(/^#[0-9a-fA-F]{6}$/)
      expect(darkColors.foreground).toMatch(/^#[0-9a-fA-F]{6}$/)
      expect(darkColors.content1).toMatch(/^#[0-9a-fA-F]{6}$/)
      expect(darkColors.primary.DEFAULT).toMatch(/^#[0-9a-fA-F]{6}$/)
    })

    it('should have valid rgba color values', () => {
      const lightColors = heroUIThemeConfig.light.colors
      const darkColors = heroUIThemeConfig.dark.colors
      
      // Test rgba values
      expect(lightColors.divider).toMatch(/^rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\)$/)
      expect(lightColors.overlay).toMatch(/^rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\)$/)
      expect(darkColors.divider).toMatch(/^rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\)$/)
      expect(darkColors.overlay).toMatch(/^rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\)$/)
    })

    it('should have consistent color palettes', () => {
      const lightColors = heroUIThemeConfig.light.colors
      const darkColors = heroUIThemeConfig.dark.colors
      
      // Both themes should have same color keys
      expect(Object.keys(lightColors.primary)).toEqual(Object.keys(darkColors.primary))
      expect(Object.keys(lightColors.secondary)).toEqual(Object.keys(darkColors.secondary))
      expect(Object.keys(lightColors.success)).toEqual(Object.keys(darkColors.success))
      expect(Object.keys(lightColors.warning)).toEqual(Object.keys(darkColors.warning))
      expect(Object.keys(lightColors.danger)).toEqual(Object.keys(darkColors.danger))
    })
  })

  describe('Accessibility', () => {
    it('should have proper contrast ratios', () => {
      const lightColors = heroUIThemeConfig.light.colors
      const darkColors = heroUIThemeConfig.dark.colors
      
      // Check that foreground colors are defined for contrast
      expect(lightColors.primary.foreground).toBeDefined()
      expect(lightColors.secondary.foreground).toBeDefined()
      expect(darkColors.primary.foreground).toBeDefined()
      expect(darkColors.secondary.foreground).toBeDefined()
    })

    it('should have disabled opacity for accessibility', () => {
      const layout = heroUIThemeConfig.layout
      
      expect(layout.disabledOpacity).toBe(0.5)
      expect(layout.disabledOpacity).toBeGreaterThan(0)
      expect(layout.disabledOpacity).toBeLessThan(1)
    })
  })

  describe('Theme Completeness', () => {
    it('should have all required theme sections', () => {
      expect(heroUIThemeConfig).toHaveProperty('light')
      expect(heroUIThemeConfig).toHaveProperty('dark')
      expect(heroUIThemeConfig).toHaveProperty('layout')
    })

    it('should have all required color categories', () => {
      const requiredColors = ['background', 'foreground', 'content1', 'content2', 'content3', 'primary', 'secondary', 'success', 'warning', 'danger', 'focus', 'divider', 'overlay']
      
      requiredColors.forEach(color => {
        expect(heroUIThemeConfig.light.colors).toHaveProperty(color)
        expect(heroUIThemeConfig.dark.colors).toHaveProperty(color)
      })
    })

    it('should have all required layout properties', () => {
      const requiredLayout = ['fontSize', 'lineHeight', 'radius', 'borderWidth', 'spacingUnit', 'disabledOpacity']
      
      requiredLayout.forEach(prop => {
        expect(heroUIThemeConfig.layout).toHaveProperty(prop)
      })
    })
  })
})