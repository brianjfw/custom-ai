import Image from "next/image";
import { Button, Card, CardBody, CardHeader, Badge, Chip } from "@heroui/react";

export default function Home() {
  return (
    <div className="min-h-screen gradient-primary">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-72 h-72 bg-accent-coral rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-64 h-64 bg-accent-blue rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-accent-amber rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-60 h-60 bg-accent-sage rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        {/* Hero Section */}
        <header className="text-center mb-16">
          <Badge 
            content="New" 
            color="secondary" 
            className="mb-4"
          >
            <Chip color="primary" variant="flat" className="mb-4">
              🚀 AI-Powered Platform
            </Chip>
          </Badge>
          <h1 className="text-5xl font-bold text-text-primary mb-4 tracking-tight">
            AI-Powered Operating System
          </h1>
          <p className="text-xl text-text-secondary mb-8 max-w-2xl">
            The first true AI-powered platform designed for small businesses. 
            Unify your operations, automate chaos, and accelerate growth.
          </p>
        </header>

        {/* HeroUI Cards Demo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl">
          {/* AI Voice Agent Card */}
          <Card className="backdrop-blur-md bg-white/60 border border-white/20">
            <CardHeader className="pb-0 pt-6 px-6 flex-col items-start">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground">24/7 AI Front Desk</h3>
            </CardHeader>
            <CardBody className="px-6 py-0">
              <p className="text-default-500 leading-relaxed">
                Never miss a lead again. Our AI agent handles calls, answers questions, 
                and books appointments while you focus on your craft.
              </p>
            </CardBody>
          </Card>

          {/* Automated Back Office Card */}
          <Card className="backdrop-blur-md bg-white/60 border border-white/20">
            <CardHeader className="pb-0 pt-6 px-6 flex-col items-start">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground">Automated Back Office</h3>
            </CardHeader>
            <CardBody className="px-6 py-0">
              <p className="text-default-500 leading-relaxed">
                Eliminate administrative chaos with unified CRM, automated invoicing, 
                and intelligent workflow management.
              </p>
            </CardBody>
          </Card>

          {/* Intelligence Dashboard Card */}
          <Card className="backdrop-blur-md bg-white/60 border border-white/20">
            <CardHeader className="pb-0 pt-6 px-6 flex-col items-start">
              <div className="w-16 h-16 bg-gradient-to-br from-warning-400 to-warning-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground">Intelligence Dashboard</h3>
            </CardHeader>
            <CardBody className="px-6 py-0">
              <p className="text-default-500 leading-relaxed">
                Get real-time insights into your business performance with 
                AI-powered analytics and financial forecasting.
              </p>
            </CardBody>
          </Card>
        </div>

        {/* CTA Section with HeroUI Components */}
        <div className="mt-16 text-center">
          <Card className="backdrop-blur-md bg-white/80 border border-white/30 max-w-2xl">
            <CardHeader className="text-center pb-0">
              <h2 className="text-2xl font-semibold text-foreground">
                Ready to Transform Your Business?
              </h2>
            </CardHeader>
            <CardBody className="text-center">
              <p className="text-default-500 mb-6">
                Join thousands of SMBs who have reclaimed their time and accelerated their growth.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  color="primary" 
                  size="lg"
                  className="bg-primary/90 backdrop-blur-md"
                >
                  Start Free Trial
                </Button>
                <Button 
                  variant="bordered" 
                  size="lg"
                  className="border-primary/30 backdrop-blur-md"
                >
                  Watch Demo
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Features Preview with HeroUI */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl">
          <Card className="backdrop-blur-md bg-white/40 border border-white/20 text-center">
            <CardBody className="py-4">
              <div className="text-2xl font-bold text-secondary mb-1">10+</div>
              <div className="text-sm text-default-500">Hours Saved Weekly</div>
            </CardBody>
          </Card>
          <Card className="backdrop-blur-md bg-white/40 border border-white/20 text-center">
            <CardBody className="py-4">
              <div className="text-2xl font-bold text-primary mb-1">20%</div>
              <div className="text-sm text-default-500">Revenue Increase</div>
            </CardBody>
          </Card>
          <Card className="backdrop-blur-md bg-white/40 border border-white/20 text-center">
            <CardBody className="py-4">
              <div className="text-2xl font-bold text-warning mb-1">&lt; 30s</div>
              <div className="text-sm text-default-500">Lead Response Time</div>
            </CardBody>
          </Card>
          <Card className="backdrop-blur-md bg-white/40 border border-white/20 text-center">
            <CardBody className="py-4">
              <div className="text-2xl font-bold text-success mb-1">24/7</div>
              <div className="text-sm text-default-500">AI Availability</div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-default-500">
        <p>© 2024 AI-Powered SMB Platform. Built with Next.js, TypeScript, HeroUI, and Glassmorphism.</p>
      </footer>
    </div>
  );
}
