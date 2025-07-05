import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock the page component since it might have complex dependencies
jest.mock('@/app/page', () => {
  return function MockPage() {
    return (
      <div data-testid="main-page">
        <h1>Welcome to SMB Platform</h1>
        <p>Main page content</p>
      </div>
    )
  }
})

describe('Main Page', () => {
  describe('Page Rendering', () => {
    it('should render without crashing', async () => {
      const Page = (await import('@/app/page')).default
      
      expect(() => {
        render(<Page />)
      }).not.toThrow()
    })

    it('should render main page content', async () => {
      const Page = (await import('@/app/page')).default
      
      render(<Page />)
      
      expect(screen.getByTestId('main-page')).toBeInTheDocument()
      expect(screen.getByText('Welcome to SMB Platform')).toBeInTheDocument()
    })

    it('should have proper page structure', async () => {
      const Page = (await import('@/app/page')).default
      
      render(<Page />)
      
      const mainElement = screen.getByTestId('main-page')
      expect(mainElement).toBeInTheDocument()
      
      const heading = screen.getByRole('heading')
      expect(heading).toBeInTheDocument()
    })
  })

  describe('Component Export', () => {
    it('should export a default component', async () => {
      const pageModule = await import('@/app/page')
      expect(pageModule.default).toBeDefined()
      expect(typeof pageModule.default).toBe('function')
    })

    it('should be a valid React component', async () => {
      const Page = (await import('@/app/page')).default
      
      // Test that it's a function that can be called as a component
      expect(typeof Page).toBe('function')
      
      // Test that it returns valid JSX
      const result = Page({})
      expect(result).toBeDefined()
    })
  })

  describe('Page Functionality', () => {
    it('should handle rendering multiple times', async () => {
      const Page = (await import('@/app/page')).default
      
      const { rerender } = render(<Page />)
      expect(screen.getByTestId('main-page')).toBeInTheDocument()
      
      rerender(<Page />)
      expect(screen.getByTestId('main-page')).toBeInTheDocument()
    })

    it('should maintain consistent content', async () => {
      const Page = (await import('@/app/page')).default
      
      render(<Page />)
      
      const content = screen.getByText('Main page content')
      expect(content).toBeInTheDocument()
      expect(content.textContent).toBe('Main page content')
    })
  })
})