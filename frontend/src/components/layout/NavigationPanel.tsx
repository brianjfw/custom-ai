'use client';

import { useState } from 'react';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Divider } from '@heroui/divider';
import { 
  Search, 
  MessageCircle, 
  Settings, 
  Plus,
  Clock,
  Calendar,
  Archive
} from 'lucide-react';
import { GlassmorphismCard } from '../ui/GlassmorphismCard';

interface NavigationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ConversationGroup {
  title: string;
  conversations: ConversationItem[];
}

interface ConversationItem {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  isActive?: boolean;
  unreadCount?: number;
}

export function NavigationPanel({ isOpen }: NavigationPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock conversation data - will be replaced with real data
  const conversationGroups: ConversationGroup[] = [
    {
      title: 'Today',
      conversations: [
        {
          id: '1',
          title: 'Kitchen Renovation Quote',
          lastMessage: 'AI: I\'ve prepared a detailed quote for your kitchen renovation...',
          timestamp: '2 hours ago',
          isActive: true,
          unreadCount: 2
        },
        {
          id: '2',
          title: 'Bathroom Plumbing Issue',
          lastMessage: 'Customer: The sink is still leaking after...',
          timestamp: '4 hours ago'
        }
      ]
    },
    {
      title: 'Yesterday',
      conversations: [
        {
          id: '3',
          title: 'HVAC Maintenance Schedule',
          lastMessage: 'AI: I\'ve scheduled your quarterly HVAC maintenance...',
          timestamp: 'Yesterday 3:45 PM'
        },
        {
          id: '4',
          title: 'Electrical Outlet Installation',
          lastMessage: 'Customer: Thank you for the quick response...',
          timestamp: 'Yesterday 1:22 PM'
        }
      ]
    },
    {
      title: 'Last Week',
      conversations: [
        {
          id: '5',
          title: 'Deck Construction Project',
          lastMessage: 'AI: The materials have been ordered and should arrive...',
          timestamp: '5 days ago'
        },
        {
          id: '6',
          title: 'Roof Inspection Report',
          lastMessage: 'Customer: The inspection report looks comprehensive...',
          timestamp: '6 days ago'
        }
      ]
    }
  ];

  const filteredGroups = conversationGroups.map(group => ({
    ...group,
    conversations: group.conversations.filter(conv =>
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(group => group.conversations.length > 0);

  return (
    <>
      <nav className={`navigation-panel ${isOpen ? 'open' : ''}`}>
        <div className="nav-header">
          <div className="nav-header-content">
            <h2 className="nav-title">Conversations</h2>
            <Button
              isIconOnly
              variant="ghost"
              className="glass-button-small"
              size="sm"
            >
              <Plus size={16} />
            </Button>
          </div>
          
          <div className="nav-search">
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<Search size={16} className="text-default-400" />}
              className="glass-input"
              variant="bordered"
            />
          </div>
        </div>

        <div className="nav-content">
          {filteredGroups.map((group, groupIndex) => (
            <div key={group.title} className="conversation-group">
              <div className="group-header">
                <h3 className="group-title">
                  {group.title === 'Today' && <Clock size={14} />}
                  {group.title === 'Yesterday' && <Calendar size={14} />}
                  {group.title === 'Last Week' && <Archive size={14} />}
                  {group.title}
                </h3>
                <span className="group-count">
                  {group.conversations.length}
                </span>
              </div>

              <div className="conversation-list">
                {group.conversations.map((conversation) => (
                  <GlassmorphismCard
                    key={conversation.id}
                    className={`conversation-card ${conversation.isActive ? 'active' : ''}`}
                    hoverable
                    clickable
                  >
                    <div className="conversation-content">
                      <div className="conversation-header">
                        <h4 className="conversation-title">
                          {conversation.title}
                        </h4>
                        {conversation.unreadCount && (
                          <span className="unread-badge">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      
                      <p className="conversation-preview">
                        {conversation.lastMessage}
                      </p>
                      
                      <div className="conversation-meta">
                        <span className="conversation-time">
                          {conversation.timestamp}
                        </span>
                        <MessageCircle size={12} className="conversation-icon" />
                      </div>
                    </div>
                  </GlassmorphismCard>
                ))}
              </div>

              {groupIndex < filteredGroups.length - 1 && (
                <Divider className="group-divider" />
              )}
            </div>
          ))}

          {filteredGroups.length === 0 && (
            <div className="empty-state">
              <MessageCircle size={48} className="empty-icon" />
              <h3 className="empty-title">No conversations found</h3>
              <p className="empty-description">
                {searchQuery ? 'Try adjusting your search terms' : 'Start a new conversation to get started'}
              </p>
            </div>
          )}
        </div>

        <div className="nav-footer">
          <Button
            variant="ghost"
            className="glass-button nav-footer-button"
            startContent={<Settings size={16} />}
          >
            Settings
          </Button>
        </div>
      </nav>
    </>
  );
}