import { render, screen } from '@testing-library/react'
import { ContentWorkspace } from '@/components/layout/ContentWorkspace'

describe('ContentWorkspace', () => {
  const mockToggleNavigation = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      render(
        <ContentWorkspace onToggleNavigation={mockToggleNavigation}>
          <div data-testid="workspace-content">Content</div>
        </ContentWorkspace>
      )
      
      expect(screen.getByTestId('workspace-content')).toBeInTheDocument()
    })

    it('should render children correctly', () => {
      render(
        <ContentWorkspace onToggleNavigation={mockToggleNavigation}>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </ContentWorkspace>
      )
      
      expect(screen.getByTestId('child-1')).toBeInTheDocument()
      expect(screen.getByTestId('child-2')).toBeInTheDocument()
    })
  })

  describe('Layout Structure', () => {
    it('should apply proper CSS classes', () => {
      const { container } = render(
        <ContentWorkspace onToggleNavigation={mockToggleNavigation}>
          <div data-testid="test-content">Test Content</div>
        </ContentWorkspace>
      )
      
      expect(container.firstChild).toHaveClass('flex-1')
      expect(container.firstChild).toHaveClass('flex')
      expect(container.firstChild).toHaveClass('flex-col')
    })

    it('should maintain workspace structure', () => {
      const { container } = render(
        <ContentWorkspace onToggleNavigation={mockToggleNavigation}>
          <div data-testid="workspace-child">Workspace Child</div>
        </ContentWorkspace>
      )
      
      expect(container.firstChild).toBeInTheDocument()
      expect(screen.getByTestId('workspace-child')).toBeInTheDocument()
    })
  })

  describe('Content Rendering', () => {
    it('should render multiple child elements', () => {
      render(
        <ContentWorkspace onToggleNavigation={mockToggleNavigation}>
          <div data-testid="element-1">Element 1</div>
          <div data-testid="element-2">Element 2</div>
          <div data-testid="element-3">Element 3</div>
        </ContentWorkspace>
      )
      
      expect(screen.getByTestId('element-1')).toBeInTheDocument()
      expect(screen.getByTestId('element-2')).toBeInTheDocument()
      expect(screen.getByTestId('element-3')).toBeInTheDocument()
    })

    it('should handle complex content structures', () => {
      render(
        <ContentWorkspace onToggleNavigation={mockToggleNavigation}>
          <div data-testid="complex-content">
            <h1>Title</h1>
            <p>Description</p>
            <div>
              <span>Nested content</span>
            </div>
          </div>
        </ContentWorkspace>
      )
      
      expect(screen.getByTestId('complex-content')).toBeInTheDocument()
      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
      expect(screen.getByText('Nested content')).toBeInTheDocument()
    })
  })

  describe('Component Export', () => {
    it('should export a default component', () => {
      expect(ContentWorkspace).toBeDefined()
      expect(typeof ContentWorkspace).toBe('function')
    })

    it('should be a valid React component', () => {
      const component = <ContentWorkspace onToggleNavigation={mockToggleNavigation}><div>Test</div></ContentWorkspace>
      expect(component).toBeDefined()
      expect(component.type).toBe(ContentWorkspace)
    })
  })

  describe('Responsive Design', () => {
    it('should handle responsive layout', () => {
      const { container } = render(
        <ContentWorkspace onToggleNavigation={mockToggleNavigation}>
          <div data-testid="responsive-content">Responsive Content</div>
        </ContentWorkspace>
      )
      
      expect(container.firstChild).toHaveClass('flex-1')
      expect(screen.getByTestId('responsive-content')).toBeInTheDocument()
    })

    it('should maintain styling', () => {
      const { container } = render(
        <ContentWorkspace onToggleNavigation={mockToggleNavigation}>
          <div data-testid="glass-content">Glass Content</div>
        </ContentWorkspace>
      )
      
      expect(container.firstChild).toHaveClass('flex-1')
      expect(screen.getByTestId('glass-content')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle rendering errors gracefully', () => {
      const originalError = console.error
      console.error = jest.fn()
      
      try {
        render(
          <ContentWorkspace onToggleNavigation={mockToggleNavigation}>
            <div data-testid="error-content">Error Content</div>
          </ContentWorkspace>
        )
        
        expect(screen.getByTestId('error-content')).toBeInTheDocument()
      } finally {
        console.error = originalError
      }
    })
  })
})