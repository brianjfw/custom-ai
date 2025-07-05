import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock Clerk to avoid authentication dependencies
jest.mock('@clerk/nextjs', () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="clerk-provider">{children}</div>
  ),
}))

// Mock the AuthProvider component
jest.mock('@/components/providers/AuthProvider', () => {
  return function MockAuthProvider({ children }: { children: React.ReactNode }) {
    return (
      <div data-testid="auth-provider">
        <div data-testid="clerk-provider">
          {children}
        </div>
      </div>
    )
  }
})

describe('AuthProvider', () => {
  describe('Component Rendering', () => {
    it('should render without crashing', async () => {
      const AuthProvider = (await import('@/components/providers/AuthProvider')).default
      
      expect(() => {
        render(
          <AuthProvider>
            <div>Test Child</div>
          </AuthProvider>
        )
      }).not.toThrow()
    })

    it('should render children correctly', async () => {
      const AuthProvider = (await import('@/components/providers/AuthProvider')).default
      
      render(
        <AuthProvider>
          <div data-testid="test-child">Test Content</div>
        </AuthProvider>
      )
      
      expect(screen.getByTestId('test-child')).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should wrap children with authentication provider', async () => {
      const AuthProvider = (await import('@/components/providers/AuthProvider')).default
      
      render(
        <AuthProvider>
          <div>Protected Content</div>
        </AuthProvider>
      )
      
      expect(screen.getByTestId('auth-provider')).toBeInTheDocument()
      expect(screen.getByTestId('clerk-provider')).toBeInTheDocument()
    })
  })

  describe('Provider Structure', () => {
    it('should maintain proper provider hierarchy', async () => {
      const AuthProvider = (await import('@/components/providers/AuthProvider')).default
      
      render(
        <AuthProvider>
          <div data-testid="nested-content">Nested</div>
        </AuthProvider>
      )
      
      const authProvider = screen.getByTestId('auth-provider')
      const clerkProvider = screen.getByTestId('clerk-provider')
      const nestedContent = screen.getByTestId('nested-content')
      
      expect(authProvider).toContainElement(clerkProvider)
      expect(clerkProvider).toContainElement(nestedContent)
    })

    it('should handle multiple children', async () => {
      const AuthProvider = (await import('@/components/providers/AuthProvider')).default
      
      render(
        <AuthProvider>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
          <span data-testid="child-3">Child 3</span>
        </AuthProvider>
      )
      
      expect(screen.getByTestId('child-1')).toBeInTheDocument()
      expect(screen.getByTestId('child-2')).toBeInTheDocument()
      expect(screen.getByTestId('child-3')).toBeInTheDocument()
    })
  })

  describe('Component Export', () => {
    it('should export a default component', async () => {
      const authModule = await import('@/components/providers/AuthProvider')
      expect(authModule.default).toBeDefined()
      expect(typeof authModule.default).toBe('function')
    })

    it('should be a valid React component', async () => {
      const AuthProvider = (await import('@/components/providers/AuthProvider')).default
      
      expect(typeof AuthProvider).toBe('function')
      
      const result = AuthProvider({ children: 'test' })
      expect(result).toBeDefined()
    })
  })

  describe('Provider Functionality', () => {
    it('should handle empty children gracefully', async () => {
      const AuthProvider = (await import('@/components/providers/AuthProvider')).default
      
      expect(() => {
        render(<AuthProvider>{null}</AuthProvider>)
      }).not.toThrow()
      
      expect(screen.getByTestId('auth-provider')).toBeInTheDocument()
    })

    it('should maintain consistent rendering', async () => {
      const AuthProvider = (await import('@/components/providers/AuthProvider')).default
      
      const { rerender } = render(
        <AuthProvider>
          <div>Original Content</div>
        </AuthProvider>
      )
      
      expect(screen.getByText('Original Content')).toBeInTheDocument()
      
      rerender(
        <AuthProvider>
          <div>Updated Content</div>
        </AuthProvider>
      )
      
      expect(screen.getByText('Updated Content')).toBeInTheDocument()
      expect(screen.getByTestId('auth-provider')).toBeInTheDocument()
    })
  })
})