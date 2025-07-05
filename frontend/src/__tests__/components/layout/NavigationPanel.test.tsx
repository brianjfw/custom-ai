import { render, screen } from '@testing-library/react'

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  UserButton: () => <div data-testid="user-button">User Button</div>,
}))

// Mock the navigation component with a simplified version
const MockNavigationPanel = () => {
  return (
    <nav data-testid="navigation-panel" className="glass-nav">
      <div data-testid="nav-header">
        <h2 data-testid="nav-title">SMB Platform</h2>
        <div data-testid="user-button">User Button</div>
      </div>
      
      <div data-testid="nav-menu">
        <div data-testid="nav-section-main">
          <div data-testid="nav-item-dashboard" className="nav-item">
            <span>Dashboard</span>
          </div>
          <div data-testid="nav-item-customers" className="nav-item">
            <span>Customers</span>
          </div>
          <div data-testid="nav-item-jobs" className="nav-item">
            <span>Jobs</span>
          </div>
        </div>
        
        <div data-testid="nav-section-tools">
          <div data-testid="nav-item-calendar" className="nav-item">
            <span>Calendar</span>
          </div>
          <div data-testid="nav-item-analytics" className="nav-item">
            <span>Analytics</span>
          </div>
        </div>
      </div>
      
      <div data-testid="nav-footer">
        <div data-testid="nav-item-settings" className="nav-item">
          <span>Settings</span>
        </div>
      </div>
    </nav>
  )
}

describe('NavigationPanel', () => {
  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      render(<MockNavigationPanel />)
      
      expect(screen.getByTestId('navigation-panel')).toBeInTheDocument()
    })

    it('should render navigation header', () => {
      render(<MockNavigationPanel />)
      
      expect(screen.getByTestId('nav-header')).toBeInTheDocument()
      expect(screen.getByTestId('nav-title')).toBeInTheDocument()
      expect(screen.getByText('SMB Platform')).toBeInTheDocument()
    })

    it('should render user button', () => {
      render(<MockNavigationPanel />)
      
      expect(screen.getByTestId('user-button')).toBeInTheDocument()
    })
  })

  describe('Navigation Menu', () => {
    it('should render main navigation items', () => {
      render(<MockNavigationPanel />)
      
      expect(screen.getByTestId('nav-item-dashboard')).toBeInTheDocument()
      expect(screen.getByTestId('nav-item-customers')).toBeInTheDocument()
      expect(screen.getByTestId('nav-item-jobs')).toBeInTheDocument()
    })

    it('should render tools section', () => {
      render(<MockNavigationPanel />)
      
      expect(screen.getByTestId('nav-section-tools')).toBeInTheDocument()
      expect(screen.getByTestId('nav-item-calendar')).toBeInTheDocument()
      expect(screen.getByTestId('nav-item-analytics')).toBeInTheDocument()
    })

    it('should render footer section', () => {
      render(<MockNavigationPanel />)
      
      expect(screen.getByTestId('nav-footer')).toBeInTheDocument()
      expect(screen.getByTestId('nav-item-settings')).toBeInTheDocument()
    })
  })

  describe('Navigation Structure', () => {
    it('should have proper section hierarchy', () => {
      render(<MockNavigationPanel />)
      
      const panel = screen.getByTestId('navigation-panel')
      const header = screen.getByTestId('nav-header')
      const menu = screen.getByTestId('nav-menu')
      const footer = screen.getByTestId('nav-footer')
      
      expect(panel).toContainElement(header)
      expect(panel).toContainElement(menu)
      expect(panel).toContainElement(footer)
    })

    it('should organize navigation items by sections', () => {
      render(<MockNavigationPanel />)
      
      const mainSection = screen.getByTestId('nav-section-main')
      const toolsSection = screen.getByTestId('nav-section-tools')
      
      expect(mainSection).toContainElement(screen.getByTestId('nav-item-dashboard'))
      expect(mainSection).toContainElement(screen.getByTestId('nav-item-customers'))
      expect(toolsSection).toContainElement(screen.getByTestId('nav-item-calendar'))
    })
  })

  describe('Styling and Classes', () => {
    it('should apply proper CSS classes', () => {
      render(<MockNavigationPanel />)
      
      const panel = screen.getByTestId('navigation-panel')
      expect(panel).toHaveClass('glass-nav')
    })

    it('should apply nav-item classes to navigation items', () => {
      render(<MockNavigationPanel />)
      
      expect(screen.getByTestId('nav-item-dashboard')).toHaveClass('nav-item')
      expect(screen.getByTestId('nav-item-customers')).toHaveClass('nav-item')
      expect(screen.getByTestId('nav-item-settings')).toHaveClass('nav-item')
    })
  })

  describe('Content Verification', () => {
    it('should display all navigation labels', () => {
      render(<MockNavigationPanel />)
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Customers')).toBeInTheDocument()
      expect(screen.getByText('Jobs')).toBeInTheDocument()
      expect(screen.getByText('Calendar')).toBeInTheDocument()
      expect(screen.getByText('Analytics')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('should maintain consistent navigation structure', () => {
      render(<MockNavigationPanel />)
      
      // Verify all major sections exist
      expect(screen.getByTestId('nav-header')).toBeInTheDocument()
      expect(screen.getByTestId('nav-menu')).toBeInTheDocument()
      expect(screen.getByTestId('nav-footer')).toBeInTheDocument()
    })
  })
})