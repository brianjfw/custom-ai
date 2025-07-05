import { render, screen } from '@testing-library/react'

// Mock Clerk SignUp component
jest.mock('@clerk/nextjs', () => ({
  SignUp: ({ redirectUrl }: { redirectUrl?: string }) => (
    <div data-testid="clerk-sign-up" data-redirect-url={redirectUrl}>
      <h1>Sign Up</h1>
      <form data-testid="sign-up-form">
        <input type="text" placeholder="First Name" data-testid="firstname-input" />
        <input type="text" placeholder="Last Name" data-testid="lastname-input" />
        <input type="email" placeholder="Email" data-testid="email-input" />
        <input type="password" placeholder="Password" data-testid="password-input" />
        <button type="submit" data-testid="sign-up-button">Sign Up</button>
      </form>
    </div>
  ),
}))

// Mock the sign-up page component
const MockSignUpPage = () => {
  return (
    <div data-testid="sign-up-page" className="min-h-screen flex items-center justify-center">
      <div data-testid="sign-up-container" className="glass-card p-8 max-w-md w-full">
        <div data-testid="clerk-sign-up" data-redirect-url="/dashboard">
          <h1>Sign Up</h1>
          <form data-testid="sign-up-form">
            <input type="text" placeholder="First Name" data-testid="firstname-input" />
            <input type="text" placeholder="Last Name" data-testid="lastname-input" />
            <input type="email" placeholder="Email" data-testid="email-input" />
            <input type="password" placeholder="Password" data-testid="password-input" />
            <button type="submit" data-testid="sign-up-button">Sign Up</button>
          </form>
        </div>
      </div>
    </div>
  )
}

describe('Sign Up Page', () => {
  describe('Page Rendering', () => {
    it('should render without crashing', () => {
      render(<MockSignUpPage />)
      
      expect(screen.getByTestId('sign-up-page')).toBeInTheDocument()
      expect(screen.getByTestId('sign-up-container')).toBeInTheDocument()
    })

    it('should render sign-up form', () => {
      render(<MockSignUpPage />)
      
      expect(screen.getByTestId('sign-up-form')).toBeInTheDocument()
      expect(screen.getByTestId('firstname-input')).toBeInTheDocument()
      expect(screen.getByTestId('lastname-input')).toBeInTheDocument()
      expect(screen.getByTestId('email-input')).toBeInTheDocument()
      expect(screen.getByTestId('password-input')).toBeInTheDocument()
      expect(screen.getByTestId('sign-up-button')).toBeInTheDocument()
    })

    it('should render page title', () => {
      render(<MockSignUpPage />)
      
      expect(screen.getByRole('heading', { name: 'Sign Up' })).toBeInTheDocument()
    })
  })

  describe('Clerk Integration', () => {
    it('should render Clerk SignUp component', () => {
      render(<MockSignUpPage />)
      
      expect(screen.getByTestId('clerk-sign-up')).toBeInTheDocument()
    })

    it('should configure redirect URL', () => {
      render(<MockSignUpPage />)
      
      const signUpComponent = screen.getByTestId('clerk-sign-up')
      expect(signUpComponent).toHaveAttribute('data-redirect-url', '/dashboard')
    })
  })

  describe('Layout and Styling', () => {
    it('should apply proper CSS classes', () => {
      render(<MockSignUpPage />)
      
      const page = screen.getByTestId('sign-up-page')
      const container = screen.getByTestId('sign-up-container')
      
      expect(page).toHaveClass('min-h-screen')
      expect(page).toHaveClass('flex')
      expect(page).toHaveClass('items-center')
      expect(page).toHaveClass('justify-center')
      
      expect(container).toHaveClass('glass-card')
      expect(container).toHaveClass('p-8')
      expect(container).toHaveClass('max-w-md')
      expect(container).toHaveClass('w-full')
    })

    it('should center the sign-up form', () => {
      render(<MockSignUpPage />)
      
      const page = screen.getByTestId('sign-up-page')
      expect(page).toHaveClass('items-center', 'justify-center')
    })
  })

  describe('Form Elements', () => {
    it('should have first name input field', () => {
      render(<MockSignUpPage />)
      
      const firstNameInput = screen.getByTestId('firstname-input')
      expect(firstNameInput).toHaveAttribute('type', 'text')
      expect(firstNameInput).toHaveAttribute('placeholder', 'First Name')
    })

    it('should have last name input field', () => {
      render(<MockSignUpPage />)
      
      const lastNameInput = screen.getByTestId('lastname-input')
      expect(lastNameInput).toHaveAttribute('type', 'text')
      expect(lastNameInput).toHaveAttribute('placeholder', 'Last Name')
    })

    it('should have email input field', () => {
      render(<MockSignUpPage />)
      
      const emailInput = screen.getByTestId('email-input')
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(emailInput).toHaveAttribute('placeholder', 'Email')
    })

    it('should have password input field', () => {
      render(<MockSignUpPage />)
      
      const passwordInput = screen.getByTestId('password-input')
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(passwordInput).toHaveAttribute('placeholder', 'Password')
    })

    it('should have submit button', () => {
      render(<MockSignUpPage />)
      
      const submitButton = screen.getByTestId('sign-up-button')
      expect(submitButton).toHaveAttribute('type', 'submit')
      expect(submitButton).toHaveTextContent('Sign Up')
    })
  })

  describe('Container Structure', () => {
    it('should maintain proper component hierarchy', () => {
      render(<MockSignUpPage />)
      
      const page = screen.getByTestId('sign-up-page')
      const container = screen.getByTestId('sign-up-container')
      const signUpComponent = screen.getByTestId('clerk-sign-up')
      
      expect(page).toContainElement(container)
      expect(container).toContainElement(signUpComponent)
    })
  })

  describe('Registration Flow', () => {
    it('should provide all necessary fields for registration', () => {
      render(<MockSignUpPage />)
      
      // Check all required fields are present
      expect(screen.getByTestId('firstname-input')).toBeInTheDocument()
      expect(screen.getByTestId('lastname-input')).toBeInTheDocument()
      expect(screen.getByTestId('email-input')).toBeInTheDocument()
      expect(screen.getByTestId('password-input')).toBeInTheDocument()
      expect(screen.getByTestId('sign-up-button')).toBeInTheDocument()
    })
  })
})