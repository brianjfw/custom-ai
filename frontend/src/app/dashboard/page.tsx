import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-surface-alt">
      {/* Header */}
      <header className="glass-nav p-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-glass">
              Business Dashboard
            </h1>
            <p className="text-glass-secondary">
              Welcome to your AI-powered business platform
            </p>
          </div>
          <div className="flex items-center gap-4">
            <UserButton 
              appearance={{
                elements: {
                  userButtonBox: "glass-card p-2",
                  userButtonTrigger: "glass-avatar",
                  userButtonPopoverCard: "glass-card border border-white/20 shadow-lg shadow-black/10",
                  userButtonPopoverActionButton: "glass-button-secondary text-glass hover:bg-white/20",
                  userButtonPopoverActionButtonText: "text-glass",
                  userButtonPopoverFooter: "border-t border-white/10",
                }
              }}
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Welcome Section */}
        <div className="glass-section mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-accent-coral to-accent-blue flex items-center justify-center">
              <span className="text-2xl">🚀</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-glass">
                Welcome to Your SMB Platform
              </h2>
              <p className="text-glass-secondary">
                Your AI-powered business operations center is ready
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent-coral/20 flex items-center justify-center">
                <span className="text-xl">🤖</span>
              </div>
              <h3 className="text-lg font-semibold text-glass mb-2">
                AI Assistant
              </h3>
              <p className="text-glass-secondary text-sm">
                Ready to help with customer inquiries
              </p>
            </div>
            
            <div className="glass-card text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent-blue/20 flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-glass mb-2">
                Analytics
              </h3>
              <p className="text-glass-secondary text-sm">
                Business insights at your fingertips
              </p>
            </div>
            
            <div className="glass-card text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent-sage/20 flex items-center justify-center">
                <span className="text-xl">⚙️</span>
              </div>
              <h3 className="text-lg font-semibold text-glass mb-2">
                Automation
              </h3>
              <p className="text-glass-secondary text-sm">
                Streamline your operations
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-container">
          <h2 className="text-xl font-bold text-glass mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="glass-button-primary text-left p-4">
              <div className="w-8 h-8 mb-2 rounded-lg bg-accent-coral/20 flex items-center justify-center">
                <span className="text-sm">👥</span>
              </div>
              <div className="text-sm font-medium">Add Customer</div>
            </button>
            
            <button className="glass-button-secondary text-left p-4">
              <div className="w-8 h-8 mb-2 rounded-lg bg-accent-blue/20 flex items-center justify-center">
                <span className="text-sm">📋</span>
              </div>
              <div className="text-sm font-medium">Create Job</div>
            </button>
            
            <button className="glass-button-secondary text-left p-4">
              <div className="w-8 h-8 mb-2 rounded-lg bg-accent-amber/20 flex items-center justify-center">
                <span className="text-sm">💰</span>
              </div>
              <div className="text-sm font-medium">Send Invoice</div>
            </button>
            
            <button className="glass-button-secondary text-left p-4">
              <div className="w-8 h-8 mb-2 rounded-lg bg-accent-sage/20 flex items-center justify-center">
                <span className="text-sm">📈</span>
              </div>
              <div className="text-sm font-medium">View Reports</div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}