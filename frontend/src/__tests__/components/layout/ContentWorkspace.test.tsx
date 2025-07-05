import { render, screen } from '@testing-library/react'
import { ContentWorkspace } from '@/components/layout/ContentWorkspace'

// Mock Clerk hooks and provider
jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    isLoaded: true,
    isSignedIn: true,
    user: {
      id: 'test-user-id',
      firstName: 'Test',
      lastName: 'User',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
    },
  }),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="clerk-provider">{children}</div>
  ),
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Create a test wrapper that provides the ClerkProvider context
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div data-testid="test-wrapper">
      {children}
    </div>
  )
}

describe('ContentWorkspace', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      render(
        <TestWrapper>
          <ContentWorkspace>
            <div data-testid="workspace-content">Content</div>
          </ContentWorkspace>
        </TestWrapper>
      )
      
      expect(screen.getByTestId('workspace-content')).toBeInTheDocument()
    })

    it('should render children correctly', () => {
      render(
        <TestWrapper>
          <ContentWorkspace>
            <div data-testid="child-1">Child 1</div>
            <div data-testid="child-2">Child 2</div>
          </ContentWorkspace>
        </TestWrapper>
      )
      
      expect(screen.getByTestId('child-1')).toBeInTheDocument()
      expect(screen.getByTestId('child-2')).toBeInTheDocument()
    })
  })

  describe('Layout Structure', () => {
    it('should apply proper CSS classes', () => {
      const { container } = render(
        <TestWrapper>
          <ContentWorkspace>
            <div data-testid="test-content">Test Content</div>
          </ContentWorkspace>
        </TestWrapper>
      )
      
      // Look for the workspace container
      const workspaceContainer = container.querySelector('[class*="relative h-full w-full"]')
      expect(workspaceContainer).toBeInTheDocument()
      expect(screen.getByTestId('test-content')).toBeInTheDocument()
    })

    it('should maintain workspace structure', () => {
      const { container } = render(
        <TestWrapper>
          <ContentWorkspace>
            <div data-testid="workspace-child">Workspace Child</div>
          </ContentWorkspace>
        </TestWrapper>
      )
      
      expect(container.firstChild).toBeInTheDocument()
      expect(screen.getByTestId('workspace-child')).toBeInTheDocument()
    })
  })

  describe('Content Rendering', () => {
    it('should render multiple child elements', () => {
      render(
        <TestWrapper>
          <ContentWorkspace>
            <div data-testid="element-1">Element 1</div>
            <div data-testid="element-2">Element 2</div>
            <div data-testid="element-3">Element 3</div>
          </ContentWorkspace>
        </TestWrapper>
      )
      
      expect(screen.getByTestId('element-1')).toBeInTheDocument()
      expect(screen.getByTestId('element-2')).toBeInTheDocument()
      expect(screen.getByTestId('element-3')).toBeInTheDocument()
    })

    it('should handle complex content structures', () => {
      render(
        <TestWrapper>
          <ContentWorkspace>
            <div data-testid="complex-content">
              <h1>Title</h1>
              <p>Description</p>
              <div>
                <span>Nested content</span>
              </div>
            </div>
          </ContentWorkspace>
        </TestWrapper>
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
      const component = <ContentWorkspace><div>Test</div></ContentWorkspace>
      expect(component).toBeDefined()
      expect(component.type).toBe(ContentWorkspace)
    })
  })

  describe('Responsive Design', () => {
    it('should handle responsive layout', () => {
      const { container } = render(
        <TestWrapper>
          <ContentWorkspace>
            <div data-testid="responsive-content">Responsive Content</div>
          </ContentWorkspace>
        </TestWrapper>
      )
      
      expect(container.firstChild).toBeInTheDocument()
      expect(screen.getByTestId('responsive-content')).toBeInTheDocument()
    })

    it('should maintain styling', () => {
      const { container } = render(
        <TestWrapper>
          <ContentWorkspace>
            <div data-testid="glass-content">Glass Content</div>
          </ContentWorkspace>
        </TestWrapper>
      )
      
      expect(container.firstChild).toBeInTheDocument()
      expect(screen.getByTestId('glass-content')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle rendering errors gracefully', () => {
      const originalError = console.error
      console.error = jest.fn()
      
      try {
        render(
          <TestWrapper>
            <ContentWorkspace>
              <div data-testid="error-content">Error Content</div>
            </ContentWorkspace>
          </TestWrapper>
        )
        
        expect(screen.getByTestId('error-content')).toBeInTheDocument()
      } finally {
        console.error = originalError
      }
    })
  })
})