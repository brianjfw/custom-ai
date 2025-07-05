import { testMessage, formatMessage } from "@/lib/test-utils";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="min-h-screen bg-glass-gradient relative overflow-hidden">
      {/* Enhanced background effects */}
      <div className="absolute inset-0 bg-glass-gradient-sunset opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-blue/40 to-transparent" />
      
      {/* Floating background elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-accent-blue/10 rounded-full blur-xl animate-glass-float" />
      <div className="absolute top-40 right-20 w-24 h-24 bg-accent-coral/10 rounded-full blur-xl animate-glass-float" style={{animationDelay: '2s'}} />
      <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-accent-sage/10 rounded-full blur-xl animate-glass-float" style={{animationDelay: '4s'}} />
      
      <div className="relative z-10 p-6">
        {/* Enhanced Header Section */}
        <header className="glass-nav p-8 mb-8 relative overflow-hidden animate-glass-slide-up">
          {/* Header background effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-accent-blue/5 via-accent-sage/5 to-accent-coral/5 pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-blue/40 to-transparent" />
          
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-glass-xl bg-gradient-to-br from-accent-coral to-accent-blue flex items-center justify-center animate-glass-float">
                  <span className="text-white text-2xl font-bold relative z-10">AI</span>
                </div>
                <div className="absolute inset-0 rounded-glass-xl bg-gradient-to-br from-accent-coral to-accent-blue opacity-30 blur-md animate-glass-glow" />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-glass mb-2 tracking-tight">
                  AI-Powered SMB Platform
                </h1>
                <p className="text-glass-secondary text-xl font-medium">
                  Modern glassmorphism design system showcase
                </p>
              </div>
            </div>
            
            {/* Breadcrumb with version info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-glass-secondary">Showcase</span>
                <span className="text-glass-muted">•</span>
                <span className="text-glass font-medium">Design System</span>
                <span className="text-glass-muted">•</span>
                <span className="text-accent-blue">v2.1.0</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="glass-badge bg-accent-sage/20 text-accent-sage border border-accent-sage/30 animate-glass-glow">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent-sage rounded-full animate-pulse" />
                    Production Ready
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-sage/40 to-transparent" />
        </header>

        <div className="max-w-7xl mx-auto">
          {/* Success Message */}
          <div className="glass-notification-success mb-8 animate-glass-slide-in-left delay-glass-1">
            <div className="flex items-center gap-3">
              <span className="text-xl">✨</span>
              <div className="flex-1">
                <p className="text-glass font-semibold mb-1">
                  {formatMessage(testMessage)}
                </p>
                <p className="text-glass-secondary text-sm">
                  Comprehensive glassmorphism design system successfully loaded
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Feature Card 1 - Enhanced */}
            <div className="glass-card glass-hover animate-glass-scale delay-glass-1 relative overflow-hidden group">
              {/* Card background effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent-coral/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-glass-normal" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-glass-lg bg-accent-coral/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-glass-normal">
                    <span className="text-3xl">🤖</span>
                  </div>
                  <div className="glass-badge bg-accent-coral/20 text-accent-coral border border-accent-coral/30">
                    24/7 Active
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-glass mb-3 group-hover:text-gradient-coral transition-all duration-glass-normal">
                  24/7 AI Front Desk
                </h3>
                <p className="text-glass-secondary mb-6 leading-relaxed">
                  Never miss a lead with our intelligent AI receptionist that handles 
                  customer inquiries, quotes, and bookings around the clock.
                </p>
                
                <div className="flex items-center gap-3">
                  <button className="glass-button-primary flex-1 group-hover:animate-glass-glow">
                    Learn More
                  </button>
                  <button className="glass-button p-2">
                    <span className="text-glass">→</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Feature Card 2 - Enhanced */}
            <div className="glass-card glass-hover animate-glass-scale delay-glass-2 relative overflow-hidden group">
              {/* Card background effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-glass-normal" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-glass-lg bg-accent-blue/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-glass-normal">
                    <span className="text-3xl">⚡</span>
                  </div>
                  <div className="glass-badge bg-accent-blue/20 text-accent-blue border border-accent-blue/30">
                    Automated
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-glass mb-3 group-hover:text-gradient-blue transition-all duration-glass-normal">
                  Automated Back Office
                </h3>
                <p className="text-glass-secondary mb-6 leading-relaxed">
                  Streamline your operations with unified CRM, automated invoicing, 
                  and intelligent workflow management.
                </p>
                
                <div className="flex items-center gap-3">
                  <button className="glass-button-secondary flex-1">
                    Explore Features
                  </button>
                  <button className="glass-button p-2">
                    <span className="text-glass">→</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Feature Card 3 - Enhanced */}
            <div className="glass-card glass-hover animate-glass-scale delay-glass-3 relative overflow-hidden group">
              {/* Card background effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent-sage/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-glass-normal" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-glass-lg bg-accent-sage/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-glass-normal">
                    <span className="text-3xl">📊</span>
                  </div>
                  <div className="glass-badge bg-accent-sage/20 text-accent-sage border border-accent-sage/30">
                    AI-Powered
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-glass mb-3 group-hover:text-gradient-sage transition-all duration-glass-normal">
                  Intelligent Co-Pilot
                </h3>
                <p className="text-glass-secondary mb-6 leading-relaxed">
                  Get real-time insights into your business finances with AI-powered 
                  analytics and predictive forecasting.
                </p>
                
                <div className="flex items-center gap-3">
                  <button className="glass-button-secondary flex-1">
                    View Dashboard
                  </button>
                  <button className="glass-button p-2">
                    <span className="text-glass">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Design System Showcase */}
          <div className="glass-section mb-12 animate-glass-slide-up delay-glass-4 relative overflow-hidden">
            {/* Section background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-glass-light/20 to-transparent pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-blue/30 to-transparent" />
            
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-glass mb-8 flex items-center gap-4">
                <span className="text-2xl">🎨</span>
                Design System Components
                <div className="flex-1 h-px bg-gradient-to-r from-glass-border to-transparent" />
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Enhanced Input Demo */}
                <div className="glass-card animate-glass-slide-in-left delay-glass-1">
                  <label className="block text-glass font-medium mb-3 flex items-center gap-2">
                    <span className="text-lg">📝</span>
                    Glass Input Components
                  </label>
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Enter your business name..." 
                      className="glass-input glass-focus"
                    />
                    <select className="glass-select glass-focus">
                      <option>Choose business type...</option>
                      <option>Restaurant</option>
                      <option>Retail</option>
                      <option>Service</option>
                    </select>
                  </div>
                </div>

                {/* Enhanced Badge Demo */}
                <div className="glass-card animate-glass-slide-in-left delay-glass-2">
                  <p className="text-glass font-medium mb-3 flex items-center gap-2">
                    <span className="text-lg">🏷️</span>
                    Status Badges
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    <span className="glass-badge bg-accent-sage/20 text-accent-sage border border-accent-sage/30 animate-glass-glow">
                      Active
                    </span>
                    <span className="glass-badge bg-accent-amber/20 text-accent-amber border border-accent-amber/30">
                      Pending
                    </span>
                    <span className="glass-badge bg-accent-coral/20 text-accent-coral border border-accent-coral/30">
                      Urgent
                    </span>
                    <span className="glass-badge bg-accent-blue/20 text-accent-blue border border-accent-blue/30">
                      Beta
                    </span>
                  </div>
                </div>

                {/* Enhanced Button Demo */}
                <div className="glass-card animate-glass-slide-in-left delay-glass-3">
                  <p className="text-glass font-medium mb-3 flex items-center gap-2">
                    <span className="text-lg">🔘</span>
                    Button Variants
                  </p>
                  <div className="space-y-3">
                    <button className="glass-button-primary w-full">
                      Primary Action
                    </button>
                    <button className="glass-button-secondary w-full">
                      Secondary Action
                    </button>
                    <button className="glass-button w-full">
                      Ghost Button
                    </button>
                  </div>
                </div>

                {/* Enhanced Progress Demo */}
                <div className="glass-card animate-glass-slide-in-left delay-glass-4 md:col-span-2 lg:col-span-1">
                  <p className="text-glass font-medium mb-3 flex items-center gap-2">
                    <span className="text-lg">📈</span>
                    Progress Indicators
                  </p>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-glass-secondary">Project Progress</span>
                        <span className="text-glass">75%</span>
                      </div>
                      <div className="glass-progress-bar">
                        <div className="glass-progress-fill" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-glass-secondary">Revenue Goal</span>
                        <span className="text-glass">90%</span>
                      </div>
                      <div className="glass-progress-bar">
                        <div className="glass-progress-fill" style={{ width: '90%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Loading Demo */}
                <div className="glass-card animate-glass-slide-in-left delay-glass-5">
                  <p className="text-glass font-medium mb-3 flex items-center gap-2">
                    <span className="text-lg">⏳</span>
                    Loading States
                  </p>
                  <div className="space-y-4">
                    <div className="glass-loading-dots">
                      <div className="glass-loading-dot"></div>
                      <div className="glass-loading-dot"></div>
                      <div className="glass-loading-dot"></div>
                    </div>
                    
                    <div className="glass-spinner mx-auto"></div>
                    
                    <div className="space-y-2">
                      <div className="glass-skeleton h-4 w-3/4"></div>
                      <div className="glass-skeleton h-4 w-1/2"></div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Notification Demo */}
                <div className="glass-card animate-glass-slide-in-left delay-glass-6">
                  <p className="text-glass font-medium mb-3 flex items-center gap-2">
                    <span className="text-lg">🔔</span>
                    Notifications
                  </p>
                  <div className="space-y-3">
                    <div className="glass-notification-success p-3">
                      <p className="text-glass text-sm">Operation successful</p>
                    </div>
                    <div className="glass-notification-warning p-3">
                      <p className="text-glass text-sm">Warning message</p>
                    </div>
                    <div className="glass-notification-error p-3">
                      <p className="text-glass text-sm">Error occurred</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Tech Stack Info */}
          <div className="glass-container animate-glass-slide-up delay-glass-5 relative overflow-hidden">
            {/* Container background effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-accent-blue/5 to-accent-sage/5 pointer-events-none" />
            
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-glass mb-8 text-center">
                Modern Tech Stack
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { icon: '⚛️', name: 'Next.js 15', description: 'React Framework' },
                  { icon: '🎨', name: 'HeroUI', description: 'Component Library' },
                  { icon: '💎', name: 'Tailwind CSS', description: 'Styling Framework' },
                  { icon: '⚡', name: 'TypeScript', description: 'Type Safety' }
                ].map((tech) => (
                  <div key={tech.name} className={cn(
                    "text-center group cursor-pointer",
                    "animate-glass-scale"
                  )}>
                    <div className="glass-avatar-lg w-20 h-20 mx-auto mb-4 flex items-center justify-center group-hover:animate-glass-glow transition-all duration-glass-normal">
                      <span className="text-4xl group-hover:scale-110 transition-transform duration-glass-normal">{tech.icon}</span>
                    </div>
                    <h3 className="text-glass font-semibold mb-1 group-hover:text-gradient-blue transition-all duration-glass-normal">
                      {tech.name}
                    </h3>
                    <p className="text-glass-secondary text-sm">{tech.description}</p>
                  </div>
                ))}
              </div>
              
              {/* Performance metrics */}
              <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { metric: '<3s', label: 'Load Time' },
                  { metric: '98%', label: 'Performance' },
                  { metric: 'AA', label: 'Accessibility' },
                  { metric: '100%', label: 'Type Safe' }
                ].map((stat, index) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl font-bold text-gradient-blue mb-1">
                      {stat.metric}
                    </div>
                    <div className="text-glass-secondary text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <footer className="glass-nav mt-16 p-8 relative overflow-hidden animate-glass-slide-up delay-glass-6">
        {/* Footer background effects */}
        <div className="absolute inset-0 bg-gradient-to-t from-glass-light/20 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-sage/30 to-transparent" />
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-8 h-8 rounded-glass-md bg-gradient-to-br from-accent-coral to-accent-blue flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <h3 className="text-glass font-semibold text-lg">SMB Platform</h3>
          </div>
          
          <p className="text-glass-secondary mb-6">
            Built with modern glassmorphism design system • Next.js 15 + HeroUI + Tailwind CSS
          </p>
          
          <div className="flex items-center justify-center gap-6">
            <div className="glass-badge bg-accent-blue/20 text-accent-blue border border-accent-blue/30">
              v2.1.0
            </div>
            <div className="glass-badge bg-accent-sage/20 text-accent-sage border border-accent-sage/30">
              Production Ready
            </div>
            <div className="glass-badge bg-accent-coral/20 text-accent-coral border border-accent-coral/30">
              Premium
            </div>
          </div>
        </div>
        
        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-coral/30 to-transparent" />
      </footer>
      
      {/* Enhanced bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-blue/40 to-transparent" />
    </div>
  );
}
