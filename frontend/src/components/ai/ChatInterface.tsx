'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardBody, CardHeader, Button, Input, Avatar, Skeleton, ScrollShadow, Spinner } from '@heroui/react';
import { trpc } from '@/lib/trpc';
import { clsx } from 'clsx';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  conversationId?: string;
  className?: string;
  enableAnimations?: boolean;
  showHeader?: boolean;
  onMessageSent?: (message: string) => void;
}

export default function ChatInterface({ 
  conversationId, 
  className, 
  enableAnimations = true,
  showHeader = true,
  onMessageSent 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI business assistant. I can help you with operations, finances, marketing strategies, and more. What would you like to discuss today?',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Enhanced entrance animation
  useEffect(() => {
    if (enableAnimations) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [enableAnimations]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mock AI response generation
  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const responses = [
      `That's an interesting question about "${userMessage}". Based on current business trends, I'd recommend focusing on customer retention strategies and optimizing your operational efficiency.`,
      `Great point! For businesses like yours, I suggest implementing data-driven decision making. Would you like me to analyze your current metrics?`,
      `I understand your concern about "${userMessage}". Let me help you create a strategic plan to address this effectively.`,
      `Excellent question! Here are some actionable insights: First, consider your market positioning. Second, analyze your competition. Third, optimize your customer journey.`,
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    onMessageSent?.(userMessage.content);

    try {
      const aiResponse = await generateAIResponse(userMessage.content);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant', 
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble processing your request right now. Please try again later.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className={cn(
      "flex flex-col h-full",
      enableAnimations && !isVisible && "opacity-0",
      enableAnimations && isVisible && "animate-glass-fade-in",
      className
    )}>
      {/* Enhanced Chat Header */}
      {showHeader && (
        <div className={cn(
          "glass-card mb-4 relative overflow-hidden",
          enableAnimations && "animate-glass-slide-up delay-glass-1"
        )}>
          {/* Header background effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-accent-blue/10 to-accent-coral/10 pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-blue/40 to-transparent" />
          
          <div className="relative z-10 p-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-accent-blue to-accent-coral flex items-center justify-center animate-glass-float">
                  <span className="text-white text-xl font-bold">AI</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent-sage rounded-full border-2 border-white animate-pulse" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-glass mb-1">AI Business Assistant</h3>
                <p className="text-glass-secondary text-sm">
                  Ready to help optimize your business operations • Online
                </p>
              </div>
              <div className="glass-badge bg-accent-sage/20 text-accent-sage border border-accent-sage/30">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent-sage rounded-full animate-pulse" />
                  Active
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Messages Area */}
      <div className={cn(
        "glass-card flex-1 mb-4 relative overflow-hidden",
        enableAnimations && "animate-glass-scale delay-glass-2"
      )}>
        {/* Messages background effects */}
        <div className="absolute inset-0 bg-glass-gradient-dawn opacity-30 pointer-events-none" />
        
        <ScrollShadow className="h-full max-h-[600px] p-6 relative z-10">
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-4 group',
                  message.role === 'user' ? 'justify-end' : 'justify-start',
                  enableAnimations && 'animate-glass-slide-up',
                  enableAnimations && `delay-glass-${Math.min(index + 1, 6)}`
                )}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-accent-blue to-accent-coral flex items-center justify-center">
                      <span className="text-white font-bold text-sm">AI</span>
                    </div>
                  </div>
                )}
                
                <div
                  className={cn(
                    'max-w-[75%] glass-card relative overflow-hidden transition-all duration-glass-normal',
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-accent-coral to-accent-coral-light text-white border-accent-coral/30 ml-auto'
                      : 'glass-hover',
                    'group-hover:shadow-glass-lg group-hover:scale-[1.02]'
                  )}
                >
                  {/* Message background effects */}
                  {message.role === 'assistant' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-glass-light/10 to-transparent pointer-events-none" />
                  )}
                  
                  <div className="relative z-10 p-4">
                    <p className={cn(
                      "text-sm leading-relaxed whitespace-pre-wrap",
                      message.role === 'user' ? "text-white" : "text-glass"
                    )}>
                      {message.content}
                    </p>
                    <time className={cn(
                      'text-xs mt-3 block font-medium',
                      message.role === 'user' ? 'text-white/80' : 'text-glass-secondary'
                    )}>
                      {formatTime(message.timestamp)}
                    </time>
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-accent-sage to-accent-amber flex items-center justify-center">
                      <span className="text-white font-bold text-sm">U</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Enhanced Loading State */}
            {isLoading && (
              <div className="flex gap-4 justify-start animate-glass-fade-in">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-accent-blue to-accent-coral flex items-center justify-center">
                    <span className="text-white font-bold text-sm">AI</span>
                  </div>
                </div>
                <div className="glass-card max-w-[75%] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-accent-blue/10 to-accent-coral/10 pointer-events-none" />
                  <div className="relative z-10 p-4">
                    <div className="flex items-center gap-3">
                      <div className="glass-loading-dots">
                        <div className="glass-loading-dot"></div>
                        <div className="glass-loading-dot"></div>
                        <div className="glass-loading-dot"></div>
                      </div>
                      <span className="text-glass-secondary text-sm font-medium">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollShadow>
      </div>

      {/* Enhanced Input Area */}
      <div className={cn(
        "glass-card relative overflow-hidden",
        enableAnimations && "animate-glass-slide-up delay-glass-3"
      )}>
        {/* Input background effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-glass-light/10 to-glass-light/5 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-coral/40 to-transparent" />
        
        <div className="relative z-10 p-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about your business operations, finances, marketing strategies..."
                size="lg"
                disabled={isLoading}
                variant="bordered"
                classNames={{
                  base: "max-w-full",
                  mainWrapper: "h-full",
                  input: cn(
                    "text-glass text-base leading-relaxed",
                    "placeholder:text-glass-secondary"
                  ),
                  inputWrapper: cn(
                    "glass min-h-[60px] py-3 px-4",
                    "border-glass-border hover:border-accent-blue/50",
                    "focus-within:border-accent-blue focus-within:shadow-glass-lg",
                    "transition-all duration-glass-normal"
                  ),
                }}
                endContent={
                  <div className="flex items-center gap-2">
                    <div className="text-glass-secondary text-xs">
                      {inputMessage.length}/500
                    </div>
                  </div>
                }
              />
            </div>
            <Button
              onClick={handleSendMessage}
              isDisabled={!inputMessage.trim() || isLoading}
              isLoading={isLoading}
              size="lg"
              className={cn(
                "glass-button-primary min-w-[120px] h-[60px] font-semibold",
                "hover:shadow-glass-xl hover:scale-105 transition-all duration-glass-normal",
                !inputMessage.trim() || isLoading ? "opacity-50 cursor-not-allowed" : ""
              )}
              endContent={
                !isLoading && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )
              }
            >
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </div>
          
          {/* Quick Action Suggestions */}
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              'Analyze my business performance',
              'Create a growth strategy',
              'Help with customer retention',
              'Financial planning advice'
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInputMessage(suggestion)}
                disabled={isLoading}
                className={cn(
                  "glass-button text-xs px-3 py-2 opacity-60 hover:opacity-100",
                  "transition-all duration-glass-normal hover:scale-105",
                  isLoading && "pointer-events-none opacity-30"
                )}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}