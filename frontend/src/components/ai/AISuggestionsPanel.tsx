'use client';

import React, { useState } from 'react';
import { Card, CardBody, CardHeader, Button, Chip, Skeleton } from '@heroui/react';
import { trpc } from '@/lib/trpc';
import { clsx } from 'clsx';

type SuggestionTopic = 'sales' | 'marketing' | 'finance' | 'operations' | 'general';

interface AISuggestionsPanelProps {
  className?: string;
  onSuggestionClick?: (suggestion: string) => void;
}

const topicConfig = {
  sales: {
    label: 'Sales',
    icon: '💼',
    color: 'primary' as const,
  },
  marketing: {
    label: 'Marketing', 
    icon: '📢',
    color: 'secondary' as const,
  },
  finance: {
    label: 'Finance',
    icon: '💰',
    color: 'success' as const,
  },
  operations: {
    label: 'Operations',
    icon: '⚙️',
    color: 'warning' as const,
  },
  general: {
    label: 'General',
    icon: '💡',
    color: 'default' as const,
  },
};

export default function AISuggestionsPanel({ className, onSuggestionClick }: AISuggestionsPanelProps) {
  const [selectedTopic, setSelectedTopic] = useState<SuggestionTopic>('general');

  // tRPC query for suggestions
  const { data: suggestions, isLoading, error } = trpc.ai.getSuggestions.useQuery({
    topic: selectedTopic,
    businessType: 'general',
  });

  return (
    <Card className={clsx('glassmorphism-card h-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-gray-800">
            🤖 AI Business Insights
          </h3>
          <p className="text-sm text-gray-600">
            Personalized recommendations for your business
          </p>
        </div>
      </CardHeader>

      <CardBody className="pt-0">
        {/* Topic Selection */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(Object.entries(topicConfig) as [SuggestionTopic, typeof topicConfig[SuggestionTopic]][]).map(([topic, config]) => (
            <Chip
              key={topic}
              variant={selectedTopic === topic ? 'solid' : 'bordered'}
              color={selectedTopic === topic ? config.color : 'default'}
              size="sm"
              className={clsx(
                'cursor-pointer transition-all',
                selectedTopic === topic 
                  ? 'glassmorphism-button-active' 
                  : 'glassmorphism-chip hover:glassmorphism-chip-hover'
              )}
              onClick={() => setSelectedTopic(topic)}
            >
              <span className="flex items-center gap-1">
                <span>{config.icon}</span>
                <span>{config.label}</span>
              </span>
            </Chip>
          ))}
        </div>

        {/* Suggestions List */}
        <div className="space-y-3">
          {isLoading ? (
            // Loading skeleton
            [...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full rounded-lg" />
                <Skeleton className="h-3 w-4/5 rounded-lg" />
              </div>
            ))
          ) : error ? (
            <div className="glassmorphism-surface rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">
                Unable to load suggestions at this time.
              </p>
            </div>
          ) : (
            suggestions?.suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={clsx(
                  'glassmorphism-surface rounded-lg p-3 transition-all cursor-pointer',
                  'hover:glassmorphism-surface-hover hover:scale-[1.02]'
                )}
                onClick={() => onSuggestionClick?.(suggestion)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-primary-400 to-secondary-400 flex items-center justify-center">
                    <span className="text-xs text-white font-semibold">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 leading-relaxed">
                      {suggestion}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Action Button */}
        <div className="mt-6">
          <Button
            color="primary"
            variant="bordered"
            size="sm"
            className="w-full glassmorphism-button"
            onClick={() => onSuggestionClick?.(`I'd like to learn more about ${selectedTopic} optimization strategies for my business.`)}
          >
            Ask AI About {topicConfig[selectedTopic].label}
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 space-y-2">
          <p className="text-xs text-gray-500 font-medium">Quick Actions</p>
          {[
            'Analyze my business performance',
            'Create a growth strategy',
            'Help with customer retention',
          ].map((action) => (
            <Button
              key={action}
              variant="light"
              size="sm"
              className="w-full justify-start text-left h-auto p-2 glassmorphism-button-light"
              onClick={() => onSuggestionClick?.(action)}
            >
              <span className="text-xs text-gray-700 truncate">{action}</span>
            </Button>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}