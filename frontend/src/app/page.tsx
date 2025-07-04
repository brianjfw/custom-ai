import { testMessage, formatMessage } from "@/lib/test-utils";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-surface-alt p-6">
      {/* Header Section */}
      <header className="glass-nav p-6 mb-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-glass mb-2">
            AI-Powered SMB Platform
          </h1>
          <p className="text-glass-secondary text-lg">
            Modern glassmorphism design system showcase
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto">
        {/* Success Message */}
        <div className="glass-notification-success mb-8">
          <p className="text-glass font-semibold">
            {formatMessage(testMessage)}
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Feature Card 1 */}
          <div className="glass-card glass-hover">
            <div className="w-12 h-12 rounded-full bg-accent-coral/20 flex items-center justify-center mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-xl font-semibold text-glass mb-2">
              24/7 AI Front Desk
            </h3>
            <p className="text-glass-secondary mb-4">
              Never miss a lead with our intelligent AI receptionist that handles 
              customer inquiries, quotes, and bookings around the clock.
            </p>
            <button className="glass-button-primary">
              Learn More
            </button>
          </div>

          {/* Feature Card 2 */}
          <div className="glass-card glass-hover">
            <div className="w-12 h-12 rounded-full bg-accent-blue/20 flex items-center justify-center mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-semibold text-glass mb-2">
              Automated Back Office
            </h3>
            <p className="text-glass-secondary mb-4">
              Streamline your operations with unified CRM, automated invoicing, 
              and intelligent workflow management.
            </p>
            <button className="glass-button-secondary">
              Explore Features
            </button>
          </div>

          {/* Feature Card 3 */}
          <div className="glass-card glass-hover">
            <div className="w-12 h-12 rounded-full bg-accent-sage/20 flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold text-glass mb-2">
              Intelligent Co-Pilot
            </h3>
            <p className="text-glass-secondary mb-4">
              Get real-time insights into your business finances with AI-powered 
              analytics and predictive forecasting.
            </p>
            <button className="glass-button-secondary">
              View Dashboard
            </button>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="glass-section mb-8">
          <h2 className="text-2xl font-bold text-glass mb-6">
            Design System Components
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Demo */}
            <div>
              <label className="block text-glass font-medium mb-2">
                Glass Input Example
              </label>
              <input 
                type="text" 
                placeholder="Enter your business name..." 
                className="glass-input"
              />
            </div>

            {/* Badge Demo */}
            <div>
              <p className="text-glass font-medium mb-2">Status Badges</p>
              <div className="flex gap-2 flex-wrap">
                <span className="glass-badge bg-accent-sage/20 text-accent-sage">
                  Active
                </span>
                <span className="glass-badge bg-accent-amber/20 text-accent-amber">
                  Pending
                </span>
                <span className="glass-badge bg-accent-coral/20 text-accent-coral">
                  Urgent
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar Demo */}
          <div className="mt-6">
            <p className="text-glass font-medium mb-2">Progress Example</p>
            <div className="glass-progress-bar">
              <div className="glass-progress-fill" style={{ width: '75%' }}></div>
            </div>
          </div>
        </div>

        {/* Tech Stack Info */}
        <div className="glass-container">
          <h2 className="text-2xl font-bold text-glass mb-4">
            Modern Tech Stack
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="glass-avatar w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                <span className="text-2xl">⚛️</span>
              </div>
              <p className="text-glass-secondary text-sm">Next.js 15</p>
            </div>
            <div className="text-center">
              <div className="glass-avatar w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                <span className="text-2xl">🎨</span>
              </div>
              <p className="text-glass-secondary text-sm">HeroUI</p>
            </div>
            <div className="text-center">
              <div className="glass-avatar w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                <span className="text-2xl">💎</span>
              </div>
              <p className="text-glass-secondary text-sm">Tailwind CSS</p>
            </div>
            <div className="text-center">
              <div className="glass-avatar w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <p className="text-glass-secondary text-sm">TypeScript</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="glass-nav mt-12 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-glass-secondary">
            Built with modern glassmorphism design system • Next.js 15 + HeroUI + Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}
