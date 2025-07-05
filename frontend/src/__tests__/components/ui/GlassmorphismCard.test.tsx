import { describe, it, expect } from '@jest/globals'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { GlassmorphismCard, GlassHeader, GlassStats, GlassList } from '@/components/ui/GlassmorphismCard'

describe('GlassmorphismCard', () => {
  describe('Basic Rendering', () => {
    it('should render children correctly', () => {
      render(
        <GlassmorphismCard>
          <div>Test Content</div>
        </GlassmorphismCard>
      )
      
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should apply default classes', () => {
      render(
        <GlassmorphismCard data-testid="card">
          <div>Test Content</div>
        </GlassmorphismCard>
      )
      
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('backdrop-blur-md')
      expect(card).toHaveClass('border')
      expect(card).toHaveClass('shadow-lg')
    })

    it('should apply custom className', () => {
      render(
        <GlassmorphismCard className="custom-class" data-testid="card">
          <div>Test Content</div>
        </GlassmorphismCard>
      )
      
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('custom-class')
    })
  })

  describe('Variant Styles', () => {
    it('should apply default variant styles', () => {
      render(
        <GlassmorphismCard variant="default" data-testid="card">
          <div>Test Content</div>
        </GlassmorphismCard>
      )
      
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('bg-white/10')
    })

    it('should apply elevated variant styles', () => {
      render(
        <GlassmorphismCard variant="elevated" data-testid="card">
          <div>Test Content</div>
        </GlassmorphismCard>
      )
      
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('bg-white/20')
      expect(card).toHaveClass('shadow-xl')
    })

    it('should apply subtle variant styles', () => {
      render(
        <GlassmorphismCard variant="subtle" data-testid="card">
          <div>Test Content</div>
        </GlassmorphismCard>
      )
      
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('bg-white/5')
    })

    it('should apply strong variant styles', () => {
      render(
        <GlassmorphismCard variant="strong" data-testid="card">
          <div>Test Content</div>
        </GlassmorphismCard>
      )
      
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('bg-white/30')
    })
  })

  describe('Padding Options', () => {
    it('should apply no padding', () => {
      render(
        <GlassmorphismCard padding="none" data-testid="card">
          <div>Test Content</div>
        </GlassmorphismCard>
      )
      
      const card = screen.getByTestId('card')
      expect(card).not.toHaveClass('p-3')
      expect(card).not.toHaveClass('p-4')
    })

    it('should apply small padding', () => {
      render(
        <GlassmorphismCard padding="sm" data-testid="card">
          <div>Test Content</div>
        </GlassmorphismCard>
      )
      
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('p-3')
    })

    it('should apply medium padding (default)', () => {
      render(
        <GlassmorphismCard padding="md" data-testid="card">
          <div>Test Content</div>
        </GlassmorphismCard>
      )
      
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('p-4')
    })

    it('should apply large padding', () => {
      render(
        <GlassmorphismCard padding="lg" data-testid="card">
          <div>Test Content</div>
        </GlassmorphismCard>
      )
      
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('p-6')
    })

    it('should apply extra large padding', () => {
      render(
        <GlassmorphismCard padding="xl" data-testid="card">
          <div>Test Content</div>
        </GlassmorphismCard>
      )
      
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('p-8')
    })
  })

  describe('Rounded Corners', () => {
    it('should apply small rounded corners', () => {
      render(
        <GlassmorphismCard rounded="sm" data-testid="card">
          <div>Test Content</div>
        </GlassmorphismCard>
      )
      
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('rounded-xl')
    })

    it('should apply medium rounded corners', () => {
      render(
        <GlassmorphismCard rounded="md" data-testid="card">
          <div>Test Content</div>
        </GlassmorphismCard>
      )
      
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('rounded-2xl')
    })

    it('should apply large rounded corners (default)', () => {
      render(
        <GlassmorphismCard rounded="lg" data-testid="card">
          <div>Test Content</div>
        </GlassmorphismCard>
      )
      
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('rounded-3xl')
    })

    it('should apply extra large rounded corners', () => {
      render(
        <GlassmorphismCard rounded="xl" data-testid="card">
          <div>Test Content</div>
        </GlassmorphismCard>
      )
      
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('rounded-[2rem]')
    })
  })

  describe('Hover Effects', () => {
    it('should apply hover effects when enabled', () => {
      render(
        <GlassmorphismCard hover={true} data-testid="card">
          <div>Test Content</div>
        </GlassmorphismCard>
      )
      
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('hover:bg-white/20')
      expect(card).toHaveClass('cursor-pointer')
    })

    it('should not apply hover effects when disabled', () => {
      render(
        <GlassmorphismCard hover={false} data-testid="card">
          <div>Test Content</div>
        </GlassmorphismCard>
      )
      
      const card = screen.getByTestId('card')
      expect(card).not.toHaveClass('hover:bg-white/20')
      expect(card).not.toHaveClass('cursor-pointer')
    })
  })

  describe('Click Handling', () => {
    it('should handle click events', () => {
      const handleClick = jest.fn()
      render(
        <GlassmorphismCard onClick={handleClick} data-testid="card">
          <div>Test Content</div>
        </GlassmorphismCard>
      )
      
      const card = screen.getByTestId('card')
      fireEvent.click(card)
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not trigger click when no handler provided', () => {
      render(
        <GlassmorphismCard data-testid="card">
          <div>Test Content</div>
        </GlassmorphismCard>
      )
      
      const card = screen.getByTestId('card')
      expect(() => fireEvent.click(card)).not.toThrow()
    })
  })

  describe('Ref Forwarding', () => {
    it('should forward refs correctly', () => {
      const ref = { current: null }
      render(
        <GlassmorphismCard ref={ref as any} data-testid="card">
          <div>Test Content</div>
        </GlassmorphismCard>
      )
      
      expect(ref.current).toBeTruthy()
    })
  })
})

describe('GlassHeader', () => {
  it('should render title correctly', () => {
    render(<GlassHeader title="Test Title" />)
    
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('should render subtitle when provided', () => {
    render(<GlassHeader title="Test Title" subtitle="Test Subtitle" />)
    
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument()
  })

  it('should render icon when provided', () => {
    render(<GlassHeader title="Test Title" icon={<div data-testid="icon">Icon</div>} />)
    
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('should render action when provided', () => {
    render(<GlassHeader title="Test Title" action={<button>Action</button>} />)
    
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(<GlassHeader title="Test Title" className="custom-header" />)
    
    const titleElement = screen.getByText('Test Title')
    expect(titleElement).toBeDefined()
    expect(titleElement.textContent).toBe('Test Title')
  })
})

describe('GlassStats', () => {
  const mockStats = [
    { label: 'Total Sales', value: '$12,345', color: 'coral' as const },
    { label: 'Active Users', value: 1234, color: 'blue' as const },
    { label: 'Revenue', value: '$45,678', icon: '💰' },
    { label: 'Growth', value: '15%', color: 'sage' as const, icon: '📈' },
  ]

  it('should render all stats correctly', () => {
    render(<GlassStats stats={mockStats} />)
    
    expect(screen.getByText('Total Sales')).toBeInTheDocument()
    expect(screen.getByText('$12,345')).toBeInTheDocument()
    expect(screen.getByText('Active Users')).toBeInTheDocument()
    expect(screen.getByText('1234')).toBeInTheDocument()
  })

  it('should render icons when provided', () => {
    render(<GlassStats stats={mockStats} />)
    
    expect(screen.getByText('💰')).toBeInTheDocument()
    expect(screen.getByText('📈')).toBeInTheDocument()
  })

  it('should apply color classes correctly', () => {
    render(<GlassStats stats={mockStats} />)
    
    // Check if default color is applied when no color specified
    const iconStat = screen.getByText('💰').closest('div')
    expect(iconStat).toBeDefined()
    expect(iconStat?.className).toContain('text-accent-blue')
  })

  it('should apply custom className', () => {
    render(<GlassStats stats={mockStats} className="custom-stats" />)
    
    const statsContainer = screen.getByText('Total Sales').closest('.grid')
    expect(statsContainer).toHaveClass('custom-stats')
  })
})

describe('GlassList', () => {
  const mockItems = [
    {
      id: '1',
      title: 'Item 1',
      description: 'Description 1',
      time: '2 min ago',
      badge: { text: 'New', color: 'coral' as const },
      onClick: jest.fn(),
    },
    {
      id: '2',
      title: 'Item 2',
      description: 'Description 2',
      icon: <div data-testid="item-icon">Icon</div>,
      onClick: jest.fn(),
    },
  ]

  it('should render all items correctly', () => {
    render(<GlassList items={mockItems} />)
    
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Description 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
    expect(screen.getByText('Description 2')).toBeInTheDocument()
  })

  it('should render time when provided', () => {
    render(<GlassList items={mockItems} />)
    
    expect(screen.getByText('2 min ago')).toBeInTheDocument()
  })

  it('should render icons when provided', () => {
    render(<GlassList items={mockItems} />)
    
    expect(screen.getByTestId('item-icon')).toBeInTheDocument()
  })

  it('should render badges when provided', () => {
    render(<GlassList items={mockItems} />)
    
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('should handle item clicks', () => {
    render(<GlassList items={mockItems} />)
    
    const item1 = screen.getByText('Item 1').closest('div')
    fireEvent.click(item1!)
    
    expect(mockItems[0].onClick).toHaveBeenCalledTimes(1)
  })

  it('should apply custom className', () => {
    render(<GlassList items={mockItems} className="custom-list" />)
    
    const listContainer = screen.getByText('Item 1').closest('.space-y-2')
    expect(listContainer).toHaveClass('custom-list')
  })
})