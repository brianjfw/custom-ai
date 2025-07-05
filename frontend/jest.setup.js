// Import testing library matchers
import '@testing-library/jest-dom'

// Add TextEncoder/TextDecoder polyfills for Node.js environment
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    query: {},
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Mock Next.js fonts completely
jest.mock('next/font/google', () => ({
  Inter: () => ({
    className: 'inter-font',
    style: { fontFamily: 'Inter' },
  }),
  Geist: () => ({
    className: 'geist-font',
    style: { fontFamily: 'Geist' },
    variable: '--font-geist-sans',
  }),
  Geist_Mono: () => ({
    className: 'geist-mono-font',
    style: { fontFamily: 'Geist Mono' },
    variable: '--font-geist-mono',
  }),
}))

// Mock environment variables
process.env = {
  ...process.env,
  NODE_ENV: 'test',
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'test_pk_123',
  CLERK_SECRET_KEY: 'test_sk_123',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
}

// Global test utilities
global.console = {
  ...console,
  // Suppress console.warn in tests unless needed
  warn: jest.fn(),
  // Keep console.error for debugging
  error: console.error,
  log: console.log,
}

// Mock fetch for API tests
global.fetch = jest.fn()

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock crypto for UUID generation in tests
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substring(2, 15),
  },
})

// Mock Date.now for consistent testing
const mockDate = new Date('2024-01-15T10:00:00Z')
global.Date.now = jest.fn(() => mockDate.getTime())

// Suppress console warnings during tests
const originalWarn = console.warn
console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('React.act')) {
    return
  }
  originalWarn(...args)
}

// Mock superjson to avoid ES module issues
jest.mock('superjson', () => ({
  default: {
    stringify: jest.fn((obj) => JSON.stringify(obj)),
    parse: jest.fn((str) => JSON.parse(str)),
  },
  stringify: jest.fn((obj) => JSON.stringify(obj)),
  parse: jest.fn((str) => JSON.parse(str)),
}))

// Mock Neon database to avoid connection issues
jest.mock('@neondatabase/serverless', () => ({
  neon: jest.fn(() => jest.fn()),
  Pool: jest.fn(),
}))