'use client';

import { ReactNode } from 'react';
import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Avatar } from '@heroui/avatar';
import { 
  MessageCircle, 
  Phone, 
  Video, 
  Settings, 
  Share,
  MoreVertical
} from 'lucide-react';

interface ContentWorkspaceProps {
  children?: ReactNode;
  className?: string;
}

export function ContentWorkspace({ children, className = '' }: ContentWorkspaceProps) {
  return (
    <main className={`content-workspace ${className}`}>
      {/* Workspace Header */}
      <div className="workspace-header">
        <div className="workspace-header-content">
          <div className="workspace-title-section">
            <h1 className="workspace-title">
              Kitchen Renovation Quote
            </h1>
            <p className="workspace-subtitle">
              Active conversation • Last updated 2 hours ago
            </p>
          </div>
          
          <div className="workspace-actions">
            <Button
              isIconOnly
              variant="ghost"
              className="glass-button-small"
              size="sm"
            >
              <Phone size={16} />
            </Button>
            <Button
              isIconOnly
              variant="ghost"
              className="glass-button-small"
              size="sm"
            >
              <Video size={16} />
            </Button>
            <Button
              isIconOnly
              variant="ghost"
              className="glass-button-small"
              size="sm"
            >
              <Share size={16} />
            </Button>
            <Button
              isIconOnly
              variant="ghost"
              className="glass-button-small"
              size="sm"
            >
              <MoreVertical size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Workspace Content */}
      <div className="workspace-content">
        {children || (
          <div className="workspace-placeholder">
            <Card className="glass-card workspace-welcome-card">
              <CardBody className="welcome-content">
                <div className="welcome-icon">
                  <MessageCircle size={64} className="text-primary" />
                </div>
                <h2 className="welcome-title">
                  Welcome to Your AI Business Assistant
                </h2>
                <p className="welcome-description">
                  Your intelligent business partner is ready to help manage customers, 
                  automate workflows, and grow your business. Select a conversation 
                  from the sidebar to get started.
                </p>
                <div className="welcome-stats">
                  <div className="stat-item">
                    <span className="stat-number">24/7</span>
                    <span className="stat-label">AI Availability</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">95%</span>
                    <span className="stat-label">Lead Response Rate</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">10+</span>
                    <span className="stat-label">Hours Saved Weekly</span>
                  </div>
                </div>
                <Button 
                  className="glass-button welcome-cta"
                  size="lg"
                  startContent={<MessageCircle size={20} />}
                >
                  Start New Conversation
                </Button>
              </CardBody>
            </Card>
          </div>
        )}
      </div>

      {/* Workspace Footer */}
      <div className="workspace-footer">
        <div className="workspace-footer-content">
          <div className="footer-info">
            <Avatar 
              size="sm" 
              className="footer-avatar"
              src="/avatars/ai-assistant.png"
              name="AI Assistant"
            />
            <div className="footer-status">
              <span className="status-text">AI Assistant is online</span>
              <span className="status-indicator online"></span>
            </div>
          </div>
          
          <div className="footer-actions">
            <Button
              variant="ghost"
              className="glass-button-small"
              size="sm"
              startContent={<Settings size={14} />}
            >
              Configure AI
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}