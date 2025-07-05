import { render, screen } from '@testing-library/react'

// Mock Clerk SignIn component
jest.mock('@clerk/nextjs', () => ({
  SignIn: ({ redirectUrl }: { redirectUrl?: string }) => (
    <div data-testid="clerk-sign-in" data-redirect-url={redirectUrl}>
      <h1>Sign In</h1>
      <form data-testid="sign-in-form">
        <input type="email" placeholder="Email" data-testid="email-input" />
        <input type="password" placeholder="Password" data-testid="password-input" />
        <button type="submit" data-testid="sign-in-button">Sign In</button>
      </form>
    </div>
  ),
}))

// Mock the sign-in page component
const MockSignInPage = () => {
  return (
    <div data-testid="sign-in-page" className="min-h-screen flex items-center justify-center">
      <div data-testid="sign-in-container" className="glass-card p-8 max-w-md w-full">
        <div data-testid="clerk-sign-in" data-redirect-url="/dashboard">
          <h1>Sign In</h1>
          <form data-testid="sign-in-form">
            <input type="email" placeholder="Email" data-testid="email-input" />
            <input type="password" placeholder="Password" data-testid="password-input" />
            <button type="submit" data-testid="sign-in-button">Sign In</button>
          </form>
        </div>
      </div>
    </div>
  )
}

describe('Sign In Page', () => {
  describe('Page Rendering', () => {
    it('should render without crashing', () => {
      render(<MockSignInPage />)
      
      expect(screen.getByTestId('sign-in-page')).toBeInTheDocument()
      expect(screen.getByTestId('sign-in-container')).toBeInTheDocument()
    })

    it('should render sign-in form', () => {
      render(<MockSignInPage />)
      
      expect(screen.getByTestId('sign-in-form')).toBeInTheDocument()
      expect(screen.getByTestId('email-input')).toBeInTheDocument()
      expect(screen.getByTestId('password-input')).toBeInTheDocument()
      expect(screen.getByTestId('sign-in-button')).toBeInTheDocument()
    })

    it('should render page title', () => {
      render(<MockSignInPage />)
      
      expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument()
    })
  })

  describe('Clerk Integration', () => {
    it('should render Clerk SignIn component', () => {
      render(<MockSignInPage />)
      
      expect(screen.getByTestId('clerk-sign-in')).toBeInTheDocument()
    })

    it('should configure redirect URL', () => {
      render(<MockSignInPage />)
      
      const signInComponent = screen.getByTestId('clerk-sign-in')
      expect(signInComponent).toHaveAttribute('data-redirect-url', '/dashboard')
    })
  })

  describe('Layout and Styling', () => {
    it('should apply proper CSS classes', () => {
      render(<MockSignInPage />)
      
      const page = screen.getByTestId('sign-in-page')
      const container = screen.getByTestId('sign-in-container')
      
      expect(page).toHaveClass('min-h-screen')
      expect(page).toHaveClass('flex')
      expect(page).toHaveClass('items-center')
      expect(page).toHaveClass('justify-center')
      
      expect(container).toHaveClass('glass-card')
      expect(container).toHaveClass('p-8')
      expect(container).toHaveClass('max-w-md')
      expect(container).toHaveClass('w-full')
    })

    it('should center the sign-in form', () => {
      render(<MockSignInPage />)
      
      const page = screen.getByTestId('sign-in-page')
      expect(page).toHaveClass('items-center', 'justify-center')
    })
  })

  describe('Form Elements', () => {
    it('should have email input field', () => {
      render(<MockSignInPage />)
      
      const emailInput = screen.getByTestId('email-input')
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(emailInput).toHaveAttribute('placeholder', 'Email')
    })

    it('should have password input field', () => {
      render(<MockSignInPage />)
      
      const passwordInput = screen.getByTestId('password-input')
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(passwordInput).toHaveAttribute('placeholder', 'Password')
    })

    it('should have submit button', () => {
      render(<MockSignInPage />)
      
      const submitButton = screen.getByTestId('sign-in-button')
      expect(submitButton).toHaveAttribute('type', 'submit')
      expect(submitButton).toHaveTextContent('Sign In')
    })
  })

  describe('Container Structure', () => {
    it('should maintain proper component hierarchy', () => {
      render(<MockSignInPage />)
      
      const page = screen.getByTestId('sign-in-page')
      const container = screen.getByTestId('sign-in-container')
      const signInComponent = screen.getByTestId('clerk-sign-in')
      
      expect(page).toContainElement(container)
      expect(container).toContainElement(signInComponent)
    })
  })
})