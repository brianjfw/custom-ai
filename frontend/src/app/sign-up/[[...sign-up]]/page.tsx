import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-surface-alt flex items-center justify-center p-6">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent-blue/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-accent-sage/10 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 right-3/4 w-64 h-64 bg-accent-amber/10 rounded-full blur-3xl"></div>
      </div>

      {/* Sign-up container */}
      <div className="relative z-10">
        <div className="glass-container mb-8 text-center">
          <h1 className="text-3xl font-bold text-glass mb-2">
            Join the Future of Business
          </h1>
          <p className="text-glass-secondary text-lg">
            Create your AI-powered business platform account
          </p>
        </div>

        <div className="glass-card p-8 w-full max-w-md mx-auto">
          <SignUp
            appearance={{
              elements: {
                formButtonPrimary: 
                  'bg-gradient-to-r from-accent-blue to-accent-sage text-white font-medium py-3 px-6 rounded-2xl backdrop-blur-sm border border-white/20 shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20 transition-all duration-300 transform hover:scale-105',
                formButtonSecondary: 
                  'bg-white/10 backdrop-blur-md text-glass font-medium py-3 px-6 rounded-2xl border border-white/20 shadow-lg shadow-black/10 hover:bg-white/20 hover:shadow-xl hover:shadow-black/20 transition-all duration-300 transform hover:scale-105',
                formFieldInput: 
                  'bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 text-glass placeholder:text-glass-secondary shadow-lg shadow-black/10 focus:border-accent-blue focus:shadow-xl focus:shadow-accent-blue/20 transition-all duration-300',
                formFieldLabel: 
                  'text-glass font-medium mb-2 block',
                card: 
                  'bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-lg shadow-black/10 p-0',
                headerTitle: 
                  'text-glass text-2xl font-bold',
                headerSubtitle: 
                  'text-glass-secondary',
                socialButtonsBlockButton: 
                  'bg-white/10 backdrop-blur-md text-glass font-medium py-3 px-6 rounded-2xl border border-white/20 shadow-lg shadow-black/10 hover:bg-white/20 hover:shadow-xl hover:shadow-black/20 transition-all duration-300 transform hover:scale-105',
                dividerLine: 
                  'bg-white/20',
                dividerText: 
                  'text-glass-secondary',
                footerActionLink: 
                  'text-accent-blue hover:text-accent-sage transition-colors duration-300',
                identityPreviewText: 
                  'text-glass-secondary',
                identityPreviewEditButton: 
                  'text-accent-blue hover:text-accent-sage transition-colors duration-300',
                formResendCodeLink: 
                  'text-accent-blue hover:text-accent-sage transition-colors duration-300',
                otpCodeFieldInput: 
                  'bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-glass text-center font-semibold shadow-lg shadow-black/10 focus:border-accent-blue focus:shadow-xl focus:shadow-accent-blue/20 transition-all duration-300',
                alertText: 
                  'text-glass-secondary',
                formFieldWarningText: 
                  'text-accent-coral',
                formFieldSuccessText: 
                  'text-accent-sage',
                formFieldErrorText: 
                  'text-accent-coral',
                formFieldHintText: 
                  'text-glass-secondary text-sm',
                formFieldAction: 
                  'text-accent-blue hover:text-accent-sage transition-colors duration-300',
              },
              layout: {
                socialButtonsPlacement: 'top',
                socialButtonsVariant: 'blockButton',
                termsPageUrl: '/terms',
                privacyPageUrl: '/privacy',
              },
            }}
            redirectUrl="/dashboard"
            signInUrl="/sign-in"
          />
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-glass-secondary">
            Already have an account?{' '}
            <a 
              href="/sign-in" 
              className="text-accent-blue hover:text-accent-sage transition-colors duration-300 font-medium"
            >
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}