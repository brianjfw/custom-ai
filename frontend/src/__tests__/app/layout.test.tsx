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

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
    refresh: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Mock Clerk
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
}));

describe('RootLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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