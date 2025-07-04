import React from 'react'
import { Button, Card, CardBody, CardHeader, Input, Chip, Avatar, Badge } from '@heroui/react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-glass-primary to-glass-background">
      {/* Hero Section with Glassmorphism */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold glass-text-primary mb-6">
            AI-Powered SMB Platform
          </h1>
          <p className="text-xl glass-text-secondary max-w-2xl mx-auto">
            The first true AI-powered operating system designed to give small business owners their time back
          </p>
        </div>

        {/* Feature Cards with HeroUI + Glassmorphism */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="glass-card glass-card-hover">
            <CardHeader className="pb-0 pt-6 px-6 flex-col items-start">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-4">
                <span className="text-white font-bold text-xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                24/7 AI Front Desk
              </h3>
            </CardHeader>
            <CardBody className="px-6 pt-0">
              <p className="text-default-500">
                Never miss a lead with our AI-powered receptionist that handles customer inquiries, 
                provides quotes, and books appointments automatically.
              </p>
              <Chip color="secondary" variant="flat" className="mt-4">
                AI Powered
              </Chip>
            </CardBody>
          </Card>

          <Card className="glass-card glass-card-hover">
            <CardHeader className="pb-0 pt-6 px-6 flex-col items-start">
              <div className="w-12 h-12 bg-warning rounded-full flex items-center justify-center mb-4">
                <span className="text-white font-bold text-xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Automated Back Office
              </h3>
            </CardHeader>
            <CardBody className="px-6 pt-0">
              <p className="text-default-500">
                Eliminate hours of manual work with unified CRM, automated invoicing, 
                and seamless job management from inquiry to payment.
              </p>
              <Chip color="warning" variant="flat" className="mt-4">
                Automation
              </Chip>
            </CardBody>
          </Card>

          <Card className="glass-card glass-card-hover">
            <CardHeader className="pb-0 pt-6 px-6 flex-col items-start">
              <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center mb-4">
                <span className="text-white font-bold text-xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Intelligent Co-Pilot
              </h3>
            </CardHeader>
            <CardBody className="px-6 pt-0">
              <p className="text-default-500">
                Make data-driven decisions with real-time financial insights, 
                cash flow forecasting, and AI-powered business intelligence.
              </p>
              <Chip color="success" variant="flat" className="mt-4">
                Analytics
              </Chip>
            </CardBody>
          </Card>
        </div>

        {/* HeroUI Components Demo */}
        <Card className="glass-panel glass-spacing-2xl mb-16">
          <CardHeader>
            <div className="text-center w-full">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                HeroUI + Glassmorphism Integration
              </h2>
              <p className="text-default-500">
                Showcasing HeroUI components with our glassmorphism design system
              </p>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Interactive Elements */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-foreground">HeroUI Components</h3>
                
                <div className="space-y-4">
                  <Button color="primary" size="lg" className="w-full">
                    Primary Button
                  </Button>
                  
                  <Button color="secondary" variant="bordered" size="lg" className="w-full">
                    Secondary Button
                  </Button>
                  
                  <Input 
                    type="text" 
                    label="Email"
                    placeholder="Enter your email..."
                    variant="bordered"
                    color="primary"
                  />
                  
                  <Input 
                    type="password" 
                    label="Password"
                    placeholder="Enter password..."
                    variant="bordered"
                    color="primary"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <Avatar 
                    src="https://i.pravatar.cc/150?u=a042581f4e29026024d" 
                    size="lg"
                  />
                  <div>
                    <p className="font-semibold text-foreground">John Doe</p>
                    <p className="text-small text-default-500">Product Manager</p>
                  </div>
                  <Badge content="5" color="danger">
                    <div className="w-8 h-8 bg-default-200 rounded-full" />
                  </Badge>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-foreground">Status & Feedback</h3>
                
                <div className="flex flex-wrap gap-2">
                  <Chip color="success" variant="flat">Active</Chip>
                  <Chip color="warning" variant="flat">Pending</Chip>
                  <Chip color="danger" variant="flat">Error</Chip>
                  <Chip color="primary" variant="flat">Processing</Chip>
                </div>

                <Card className="bg-content2/50 backdrop-blur-md">
                  <CardHeader className="pb-0">
                    <h4 className="font-medium text-foreground">Sample Statistics</h4>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-small text-default-500">Revenue</span>
                        <span className="text-small font-semibold text-success">+15.3%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-small text-default-500">Customers</span>
                        <span className="text-small font-semibold text-warning">+8.1%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-small text-default-500">Tasks</span>
                        <span className="text-small font-semibold text-primary">+12.4%</span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="glass-card glass-spacing-xl inline-block">
            <CardBody className="text-center">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Ready to Transform Your Business?
              </h3>
              <p className="text-default-500 mb-6">
                Join thousands of SMB owners who've reclaimed their time with our AI platform
              </p>
              <div className="flex gap-4 justify-center">
                <Button color="primary" size="lg" className="font-semibold">
                  Get Started Today
                </Button>
                <Button variant="bordered" size="lg" className="font-semibold">
                  Learn More
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
