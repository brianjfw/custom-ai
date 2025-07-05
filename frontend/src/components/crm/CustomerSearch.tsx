'use client';

import React, { useState, useEffect } from 'react';
import { Input, Button, Kbd } from '@heroui/react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface CustomerSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
}

export function CustomerSearch({
  value,
  onChange,
  placeholder = 'Search customers...',
  onFocus,
  onBlur,
  className = ''
}: CustomerSearchProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    // Load search history from localStorage
    const saved = localStorage.getItem('customerSearchHistory');
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse search history:', error);
      }
    }
  }, []);

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleClear = () => {
    onChange('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear();
    } else if (e.key === 'Enter' && value.trim()) {
      // Save to search history
      const newHistory = [value.trim(), ...searchHistory.filter(h => h !== value.trim())].slice(0, 5);
      setSearchHistory(newHistory);
      localStorage.setItem('customerSearchHistory', JSON.stringify(newHistory));
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onValueChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        startContent={
          <MagnifyingGlassIcon 
            className={`w-4 h-4 transition-colors duration-200 ${
              isFocused ? 'text-blue-500' : 'text-gray-400'
            }`}
          />
        }
        endContent={
          value && (
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onPress={handleClear}
              className="min-w-6 w-6 h-6 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-4 h-4" />
            </Button>
          )
        }
        classNames={{
          base: "transition-all duration-200",
          mainWrapper: "h-full",
          input: "text-sm",
          inputWrapper: [
            "glass-input",
            "transition-all duration-200",
            isFocused ? "glass-input-focused" : "",
            "hover:glass-input-hover",
            "group-data-[focused=true]:glass-input-focused",
            "!cursor-text"
          ],
        }}
        className="glass-search-input"
      />
      
      {/* Search shortcut hint */}
      <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-opacity duration-200 ${
        value || isFocused ? 'opacity-0' : 'opacity-60'
      }`}>
        <div className="flex items-center gap-1 text-xs text-foreground/50">
          <Kbd className="px-1.5 py-0.5 text-xs">⌘</Kbd>
          <Kbd className="px-1.5 py-0.5 text-xs">K</Kbd>
        </div>
      </div>
    </div>
  );
}

// Add search-specific CSS classes
const searchStyles = `
  .glass-search-input {
    position: relative;
  }

  .glass-input-focused {
    transform: translateY(-1px);
    box-shadow: 0 0 0 3px rgba(78, 205, 196, 0.1), 
                0 10px 25px -5px rgba(0, 0, 0, 0.1),
                0 0 0 1px rgba(78, 205, 196, 0.2);
  }

  .glass-input-hover {
    transform: translateY(-0.5px);
  }

  .glass-search-input input::placeholder {
    color: rgba(var(--foreground-rgb), 0.5);
    transition: color 0.2s ease;
  }

  .glass-search-input:focus-within input::placeholder {
    color: rgba(var(--foreground-rgb), 0.3);
  }

  .glass-search-input .heroui-input-wrapper {
    transition: all 0.2s ease;
  }

  .glass-search-input:focus-within .heroui-input-wrapper {
    background: rgba(var(--background-rgb), 0.95);
    backdrop-filter: blur(20px);
  }
`;

// Inject styles if not already present
if (typeof document !== 'undefined' && !document.querySelector('#customer-search-styles')) {
  const styleElement = document.createElement('style');
  styleElement.id = 'customer-search-styles';
  styleElement.textContent = searchStyles;
  document.head.appendChild(styleElement);
}