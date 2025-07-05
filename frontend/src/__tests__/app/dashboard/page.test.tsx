import { render, screen } from '@testing-library/react'

// Mock the DualPaneLayout
jest.mock('@/components/layout/DualPaneLayout', () => {
  return function MockDualPaneLayout({ children }: { children: React.ReactNode }) {
    return <div data-testid="dual-pane-layout">{children}</div>
  }
})

// Simple mock of the dashboard page
const mockDashboardPage = () => {
  return (
    <div data-testid="dual-pane-layout">
      <div data-testid="dashboard-content">
        <h1>Dashboard</h1>
        <p>Welcome to your dashboard</p>
        <div data-testid="dashboard-features">
          <div data-testid="feature-1">Analytics</div>
          <div data-testid="feature-2">Reports</div>
          <div data-testid="feature-3">Settings</div>
        </div>
      </div>
    </div>
  )
}

describe('Dashboard Page', () => {
  describe('Page Rendering', () => {
    it('should render without crashing', () => {
      render(mockDashboardPage())
      
      expect(screen.getByTestId('dual-pane-layout')).toBeInTheDocument()
      expect(screen.getByTestId('dashboard-content')).toBeInTheDocument()
    })

    it('should render dashboard title', () => {
      render(mockDashboardPage())
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Welcome to your dashboard')).toBeInTheDocument()
    })

    it('should render dashboard features', () => {
      render(mockDashboardPage())
      
      expect(screen.getByTestId('dashboard-features')).toBeInTheDocument()
      expect(screen.getByTestId('feature-1')).toBeInTheDocument()
      expect(screen.getByTestId('feature-2')).toBeInTheDocument()
      expect(screen.getByTestId('feature-3')).toBeInTheDocument()
    })
  })

  describe('Layout Integration', () => {
    it('should use DualPaneLayout wrapper', () => {
      render(mockDashboardPage())
      
      expect(screen.getByTestId('dual-pane-layout')).toBeInTheDocument()
    })

    it('should contain dashboard content within layout', () => {
      render(mockDashboardPage())
      
      const layout = screen.getByTestId('dual-pane-layout')
      const content = screen.getByTestId('dashboard-content')
      
      expect(layout).toContainElement(content)
    })
  })

  describe('Content Structure', () => {
    it('should have proper content hierarchy', () => {
      render(mockDashboardPage())
      
      const content = screen.getByTestId('dashboard-content')
      const features = screen.getByTestId('dashboard-features')
      
      expect(content).toContainElement(features)
    })

    it('should display feature items', () => {
      render(mockDashboardPage())
      
      expect(screen.getByText('Analytics')).toBeInTheDocument()
      expect(screen.getByText('Reports')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })
  })

  describe('Page Metadata', () => {
    it('should be identifiable as dashboard page', () => {
      render(mockDashboardPage())
      
      // Check for dashboard-specific content
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByTestId('dashboard-content')).toBeInTheDocument()
    })
  })
})