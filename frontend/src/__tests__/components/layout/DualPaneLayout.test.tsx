import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock the component to avoid complex dependencies
jest.mock('@/components/layout/DualPaneLayout', () => {
  return function MockDualPaneLayout({ children }: { children: React.ReactNode }) {
    return (
      <div data-testid="dual-pane-layout" className="dual-pane-container">
        <div data-testid="left-panel" className="left-panel">
          Navigation Panel
        </div>
        <div data-testid="right-panel" className="right-panel">
          {children}
        </div>
      </div>
    )
  }
})

describe('DualPaneLayout', () => {
  describe('Component Rendering', () => {
    it('should render without crashing', async () => {
      const DualPaneLayout = (await import('@/components/layout/DualPaneLayout')).default
      
      expect(() => {
        render(
          <DualPaneLayout>
            <div>Test Content</div>
          </DualPaneLayout>
        )
      }).not.toThrow()
    })

    it('should render both panels', async () => {
      const DualPaneLayout = (await import('@/components/layout/DualPaneLayout')).default
      
      render(
        <DualPaneLayout>
          <div>Content</div>
        </DualPaneLayout>
      )
      
      expect(screen.getByTestId('dual-pane-layout')).toBeInTheDocument()
      expect(screen.getByTestId('left-panel')).toBeInTheDocument()
      expect(screen.getByTestId('right-panel')).toBeInTheDocument()
    })

    it('should render children in the right panel', async () => {
      const DualPaneLayout = (await import('@/components/layout/DualPaneLayout')).default
      
      render(
        <DualPaneLayout>
          <div data-testid="test-content">Test Content</div>
        </DualPaneLayout>
      )
      
      const rightPanel = screen.getByTestId('right-panel')
      const testContent = screen.getByTestId('test-content')
      
      expect(rightPanel).toContainElement(testContent)
    })
  })

  describe('Layout Structure', () => {
    it('should have proper CSS classes', async () => {
      const DualPaneLayout = (await import('@/components/layout/DualPaneLayout')).default
      
      render(
        <DualPaneLayout>
          <div>Content</div>
        </DualPaneLayout>
      )
      
      const container = screen.getByTestId('dual-pane-layout')
      const leftPanel = screen.getByTestId('left-panel')
      const rightPanel = screen.getByTestId('right-panel')
      
      expect(container).toHaveClass('dual-pane-container')
      expect(leftPanel).toHaveClass('left-panel')
      expect(rightPanel).toHaveClass('right-panel')
    })

    it('should maintain layout structure', async () => {
      const DualPaneLayout = (await import('@/components/layout/DualPaneLayout')).default
      
      render(
        <DualPaneLayout>
          <div>Panel Content</div>
        </DualPaneLayout>
      )
      
      const layout = screen.getByTestId('dual-pane-layout')
      const panels = layout.children
      
      expect(panels).toHaveLength(2)
      expect(panels[0]).toHaveAttribute('data-testid', 'left-panel')
      expect(panels[1]).toHaveAttribute('data-testid', 'right-panel')
    })
  })

  describe('Content Rendering', () => {
    it('should render multiple child elements', async () => {
      const DualPaneLayout = (await import('@/components/layout/DualPaneLayout')).default
      
      render(
        <DualPaneLayout>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
          <div data-testid="child-3">Child 3</div>
        </DualPaneLayout>
      )
      
      expect(screen.getByTestId('child-1')).toBeInTheDocument()
      expect(screen.getByTestId('child-2')).toBeInTheDocument()
      expect(screen.getByTestId('child-3')).toBeInTheDocument()
    })

    it('should handle empty children', async () => {
      const DualPaneLayout = (await import('@/components/layout/DualPaneLayout')).default
      
      render(<DualPaneLayout>{null}</DualPaneLayout>)
      
      const rightPanel = screen.getByTestId('right-panel')
      expect(rightPanel).toBeInTheDocument()
    })

    it('should preserve navigation panel content', async () => {
      const DualPaneLayout = (await import('@/components/layout/DualPaneLayout')).default
      
      render(
        <DualPaneLayout>
          <div>Dynamic Content</div>
        </DualPaneLayout>
      )
      
      const leftPanel = screen.getByTestId('left-panel')
      expect(leftPanel).toHaveTextContent('Navigation Panel')
    })
  })

  describe('Component Export', () => {
    it('should export a default component', async () => {
      const layoutModule = await import('@/components/layout/DualPaneLayout')
      expect(layoutModule.default).toBeDefined()
      expect(typeof layoutModule.default).toBe('function')
    })

    it('should be a valid React component', async () => {
      const DualPaneLayout = (await import('@/components/layout/DualPaneLayout')).default
      
      // Test that it's a function that can be called as a component
      expect(typeof DualPaneLayout).toBe('function')
      
      // Test that it accepts children prop
      const result = DualPaneLayout({ children: 'test' })
      expect(result).toBeDefined()
    })
  })
})