'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardBody, Input, Button, Avatar, Spinner, ScrollShadow } from '@heroui/react';
import { trpc } from '@/lib/trpc';
import { clsx } from 'clsx';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatInterfaceProps {
  conversationId?: string;
  className?: string;
}

export default function ChatInterface({ conversationId, className }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      content: "Hello! I'm your AI business assistant. I can help you with customer management, financial insights, marketing strategies, and operational optimization. What would you like to discuss today?",
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // tRPC mutations
  const sendMessageMutation = trpc.ai.sendMessage.useMutation();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      content: inputMessage.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send to AI
      const response = await sendMessageMutation.mutateAsync({
        message: userMessage.content,
        conversationId,
        context: {
          businessType: 'general',
          currentPage: 'dashboard',
        },
      });

      // Add AI response
      const aiMessage: Message = {
        id: response.id,
        content: response.message,
        role: 'assistant',
        timestamp: response.timestamp,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        content: 'Sorry, I encountered an error. Please try again or check that your OpenAI API key is configured.',
        role: 'assistant',
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

  return (
    <div className={clsx('flex flex-col h-full', className)}>
      {/* Chat Header */}
      <Card className="glassmorphism-card mb-4">
        <CardBody className="py-3">
          <div className="flex items-center gap-3">
            <Avatar
              src="/ai-avatar.png"
              fallback="AI"
              className="w-10 h-10 bg-gradient-to-r from-primary-400 to-secondary-400"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">AI Business Assistant</h3>
              <p className="text-sm text-gray-600">
                Ready to help optimize your business operations
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Messages Area */}
      <Card className="glassmorphism-card flex-1 mb-4">
        <CardBody className="p-0">
          <ScrollShadow className="h-full max-h-[600px] p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={clsx(
                    'flex gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <Avatar
                      src="/ai-avatar.png"
                      fallback="AI"
                      size="sm"
                      className="bg-gradient-to-r from-primary-400 to-secondary-400"
                    />
                  )}
                  
                  <div
                    className={clsx(
                      'max-w-[80%] rounded-lg px-4 py-3',
                      message.role === 'user'
                        ? 'bg-primary-500 text-white ml-auto'
                        : 'glassmorphism-surface text-gray-800'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                    <time className={clsx(
                      'text-xs mt-2 block',
                      message.role === 'user' ? 'text-white/70' : 'text-gray-500'
                    )}>
                      {message.timestamp.toLocaleTimeString()}
                    </time>
                  </div>

                  {message.role === 'user' && (
                    <Avatar
                      fallback="U"
                      size="sm"
                      className="bg-gradient-to-r from-coral-400 to-blue-400"
                    />
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <Avatar
                    src="/ai-avatar.png"
                    fallback="AI"
                    size="sm"
                    className="bg-gradient-to-r from-primary-400 to-secondary-400"
                  />
                  <div className="glassmorphism-surface rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Spinner size="sm" />
                      <span className="text-sm text-gray-600">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollShadow>
        </CardBody>
      </Card>

      {/* Input Area */}
      <Card className="glassmorphism-card">
        <CardBody className="p-4">
          <div className="flex gap-3">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about your business operations, finances, marketing..."
              className="flex-1"
              size="lg"
              disabled={isLoading}
              classNames={{
                input: 'text-gray-800',
                inputWrapper: 'glassmorphism-input border-white/20',
              }}
            />
            <Button
              onClick={handleSendMessage}
              isDisabled={!inputMessage.trim() || isLoading}
              isLoading={isLoading}
              color="primary"
              size="lg"
              className="px-8 glassmorphism-button"
            >
              Send
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}