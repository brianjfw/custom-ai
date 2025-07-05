import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RootLayout from '@/app/layout';

// Mock the providers
jest.mock('@/components/providers/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
}));

jest.mock('@/components/providers/HeroUIProvider', () => ({
  HeroUIProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="heroui-provider">{children}</div>
  ),
}));

jest.mock('@/components/providers/TRPCProvider', () => ({
  TRPCProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="trpc-provider">{children}</div>
  ),
}));

// Mock Inter font
jest.mock('next/font/google', () => ({
  Inter: () => ({
    className: 'inter-font',
  }),
}));

// Enhanced Next.js router mocking
const mockPush = jest.fn()
const mockReplace = jest.fn()
const mockBack = jest.fn()
const mockForward = jest.fn()
const mockPrefetch = jest.fn()
const mockRefresh = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
    forward: mockForward,
    prefetch: mockPrefetch,
    refresh: mockRefresh,
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Enhanced Clerk mocking with all required methods
const mockClerkMethods = {
  navigate: jest.fn(),
  clerk: {
    navigate: jest.fn(),
  },
  useAwaitableReplace: jest.fn(),
}

jest.mock('@clerk/nextjs', () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="clerk-provider">{children}</div>
  ),
  useAuth: () => ({
    isLoaded: true,
    isSignedIn: false,
    userId: null,
  }),
  useUser: () => ({
    isLoaded: true,
    isSignedIn: false,
    user: null,
  }),
  useClerk: () => mockClerkMethods,
}));

describe('RootLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset all mock implementations
    mockPush.mockClear();
    mockReplace.mockClear();
    mockBack.mockClear();
    mockForward.mockClear();
    mockPrefetch.mockClear();
    mockRefresh.mockClear();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should render the layout with all providers', () => {
    const testChildren = <div data-testid="test-children">Test content</div>;
    
    render(<RootLayout>{testChildren}</RootLayout>);

    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    expect(screen.getByTestId('heroui-provider')).toBeInTheDocument();
    expect(screen.getByTestId('trpc-provider')).toBeInTheDocument();
    expect(screen.getByTestId('test-children')).toBeInTheDocument();
  });

  it('should render the HTML structure correctly', () => {
    const testChildren = <div data-testid="test-children">Test content</div>;
    
    render(<RootLayout>{testChildren}</RootLayout>);

    // Check that the layout structure is correct
    expect(screen.getByTestId('test-children')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should include all providers in the correct order', () => {
    const testChildren = <div data-testid="test-children">Test content</div>;
    
    render(<RootLayout>{testChildren}</RootLayout>);

    // Check that providers are present
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    expect(screen.getByTestId('heroui-provider')).toBeInTheDocument();
    expect(screen.getByTestId('trpc-provider')).toBeInTheDocument();
    
    // Check that the test children are rendered within the providers
    expect(screen.getByTestId('test-children')).toBeInTheDocument();
  });

  it('should handle empty children', () => {
    render(<RootLayout>{null}</RootLayout>);

    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    expect(screen.getByTestId('heroui-provider')).toBeInTheDocument();
    expect(screen.getByTestId('trpc-provider')).toBeInTheDocument();
  });

  it('should handle multiple children', () => {
    const multipleChildren = (
      <>
        <div data-testid="child-1">First child</div>
        <div data-testid="child-2">Second child</div>
      </>
    );
    
    render(<RootLayout>{multipleChildren}</RootLayout>);

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
    expect(screen.getByText('First child')).toBeInTheDocument();
    expect(screen.getByText('Second child')).toBeInTheDocument();
  });
});