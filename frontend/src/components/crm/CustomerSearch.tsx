'use client';

import { useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Select,
  SelectItem,
  Chip,
  Divider,
  Accordion,
  AccordionItem,
  Slider,
  Switch,
  DateRangePicker,
} from '@heroui/react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  UserIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { Customer } from '@/db/schema/customers';

interface CustomerSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  totalResults?: number;
  isLoading?: boolean;
}

export interface SearchFilters {
  query?: string;
  customerType?: 'individual' | 'business';
  status?: 'active' | 'inactive' | 'prospect' | 'churned';
  priority?: 'low' | 'medium' | 'high' | 'vip';
  industry?: string;
  city?: string;
  state?: string;
  tags?: string[];
  lifetimeValueRange?: [number, number];
  marketingOptIn?: boolean;
  hasEmail?: boolean;
  hasPhone?: boolean;
  createdDateRange?: {
    start: string;
    end: string;
  };
  lastContactedRange?: {
    start: string;
    end: string;
  };
}

const industries = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing',
  'Construction', 'Real Estate', 'Legal', 'Consulting', 'Other'
];

const states = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export function CustomerSearch({ onSearch, onClear, totalResults, isLoading }: CustomerSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const updateFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const addTag = () => {
    if (tagInput.trim() && !filters.tags?.includes(tagInput.trim())) {
      const newTags = [...(filters.tags || []), tagInput.trim()];
      updateFilter('tags', newTags);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = filters.tags?.filter(tag => tag !== tagToRemove) || [];
    updateFilter('tags', newTags.length > 0 ? newTags : undefined);
  };

  const clearFilters = () => {
    setFilters({});
    setTagInput('');
    onClear();
  };

  const hasActiveFilters = Object.keys(filters).some(key => 
    filters[key as keyof SearchFilters] !== undefined && 
    filters[key as keyof SearchFilters] !== '' &&
    !(Array.isArray(filters[key as keyof SearchFilters]) && filters[key as keyof SearchFilters]?.length === 0)
  );

  const activeFilterCount = Object.values(filters).filter(value => 
    value !== undefined && value !== '' && 
    !(Array.isArray(value) && value.length === 0)
  ).length;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2">
            <MagnifyingGlassIcon className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Customer Search</h3>
            {totalResults !== undefined && (
              <Chip size="sm" variant="flat" color="primary">
                {totalResults} results
              </Chip>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="light"
              startContent={<FunnelIcon className="w-4 h-4" />}
              onPress={() => setShowAdvanced(!showAdvanced)}
              color={showAdvanced ? 'primary' : 'default'}
            >
              Advanced {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Button>
            {hasActiveFilters && (
              <Button
                size="sm"
                variant="light"
                color="danger"
                startContent={<XMarkIcon className="w-4 h-4" />}
                onPress={clearFilters}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardBody className="space-y-4">
        {/* Basic Search */}
        <Input
          placeholder="Search customers by name, email, company..."
          value={filters.query || ''}
          onChange={(e) => updateFilter('query', e.target.value)}
          startContent={<MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />}
          classNames={{
            input: "glass-input",
            inputWrapper: "glass-input-wrapper",
          }}
        />

        {/* Quick Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            placeholder="Customer Type"
            selectedKeys={filters.customerType ? [filters.customerType] : []}
            onSelectionChange={(keys) => updateFilter('customerType', Array.from(keys)[0] as any)}
          >
            <SelectItem key="individual" value="individual">Individual</SelectItem>
            <SelectItem key="business" value="business">Business</SelectItem>
          </Select>
          
          <Select
            placeholder="Status"
            selectedKeys={filters.status ? [filters.status] : []}
            onSelectionChange={(keys) => updateFilter('status', Array.from(keys)[0] as any)}
          >
            <SelectItem key="active" value="active">Active</SelectItem>
            <SelectItem key="inactive" value="inactive">Inactive</SelectItem>
            <SelectItem key="prospect" value="prospect">Prospect</SelectItem>
            <SelectItem key="churned" value="churned">Churned</SelectItem>
          </Select>
          
          <Select
            placeholder="Priority"
            selectedKeys={filters.priority ? [filters.priority] : []}
            onSelectionChange={(keys) => updateFilter('priority', Array.from(keys)[0] as any)}
          >
            <SelectItem key="low" value="low">Low</SelectItem>
            <SelectItem key="medium" value="medium">Medium</SelectItem>
            <SelectItem key="high" value="high">High</SelectItem>
            <SelectItem key="vip" value="vip">VIP</SelectItem>
          </Select>
          
          <Select
            placeholder="Industry"
            selectedKeys={filters.industry ? [filters.industry] : []}
            onSelectionChange={(keys) => updateFilter('industry', Array.from(keys)[0] as string)}
          >
            {industries.map((industry) => (
              <SelectItem key={industry} value={industry}>
                {industry}
              </SelectItem>
            ))}
          </Select>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <>
            <Divider />
            <div className="space-y-6">
              <Accordion variant="splitted" className="glass-accordion">
                {/* Location Filters */}
                <AccordionItem
                  key="location"
                  aria-label="Location Filters"
                  title={
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="w-4 h-4" />
                      <span>Location</span>
                    </div>
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="City"
                      value={filters.city || ''}
                      onChange={(e) => updateFilter('city', e.target.value)}
                      classNames={{
                        input: "glass-input",
                        inputWrapper: "glass-input-wrapper",
                      }}
                    />
                    <Select
                      placeholder="State"
                      selectedKeys={filters.state ? [filters.state] : []}
                      onSelectionChange={(keys) => updateFilter('state', Array.from(keys)[0] as string)}
                    >
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                </AccordionItem>

                {/* Financial Filters */}
                <AccordionItem
                  key="financial"
                  aria-label="Financial Filters"
                  title={
                    <div className="flex items-center gap-2">
                      <CurrencyDollarIcon className="w-4 h-4" />
                      <span>Financial</span>
                    </div>
                  }
                >
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Lifetime Value Range: $
                        {filters.lifetimeValueRange ? 
                          `${filters.lifetimeValueRange[0].toLocaleString()} - $${filters.lifetimeValueRange[1].toLocaleString()}` : 
                          '0 - $100,000'
                        }
                      </label>
                      <Slider
                        step={1000}
                        minValue={0}
                        maxValue={100000}
                        value={filters.lifetimeValueRange || [0, 100000]}
                        onChange={(value) => updateFilter('lifetimeValueRange', value as [number, number])}
                        className="glass-slider"
                      />
                    </div>
                  </div>
                </AccordionItem>

                {/* Contact Information */}
                <AccordionItem
                  key="contact"
                  aria-label="Contact Information"
                  title={
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      <span>Contact Information</span>
                    </div>
                  }
                >
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-4">
                      <Switch
                        isSelected={filters.hasEmail || false}
                        onValueChange={(value) => updateFilter('hasEmail', value || undefined)}
                      >
                        Has Email
                      </Switch>
                      <Switch
                        isSelected={filters.hasPhone || false}
                        onValueChange={(value) => updateFilter('hasPhone', value || undefined)}
                      >
                        Has Phone
                      </Switch>
                      <Switch
                        isSelected={filters.marketingOptIn || false}
                        onValueChange={(value) => updateFilter('marketingOptIn', value || undefined)}
                      >
                        Marketing Opt-in
                      </Switch>
                    </div>
                  </div>
                </AccordionItem>

                {/* Tags */}
                <AccordionItem
                  key="tags"
                  aria-label="Tags"
                  title={
                    <div className="flex items-center gap-2">
                      <span>Tags</span>
                      {filters.tags && filters.tags.length > 0 && (
                        <Chip size="sm" variant="flat" color="primary">
                          {filters.tags.length}
                        </Chip>
                      )}
                    </div>
                  }
                >
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add tag"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        classNames={{
                          input: "glass-input",
                          inputWrapper: "glass-input-wrapper",
                        }}
                      />
                      <Button
                        color="primary"
                        variant="flat"
                        onPress={addTag}
                        isDisabled={!tagInput.trim()}
                      >
                        Add
                      </Button>
                    </div>
                    
                    {filters.tags && filters.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {filters.tags.map((tag) => (
                          <Chip
                            key={tag}
                            onClose={() => removeTag(tag)}
                            variant="flat"
                            color="primary"
                          >
                            {tag}
                          </Chip>
                        ))}
                      </div>
                    )}
                  </div>
                </AccordionItem>

                {/* Date Ranges */}
                <AccordionItem
                  key="dates"
                  aria-label="Date Ranges"
                  title={
                    <div className="flex items-center gap-2">
                      <CalendarDaysIcon className="w-4 h-4" />
                      <span>Date Ranges</span>
                    </div>
                  }
                >
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Customer Since
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          type="date"
                          placeholder="Start date"
                          value={filters.createdDateRange?.start || ''}
                          onChange={(e) => updateFilter('createdDateRange', {
                            start: e.target.value,
                            end: filters.createdDateRange?.end || ''
                          })}
                          classNames={{
                            input: "glass-input",
                            inputWrapper: "glass-input-wrapper",
                          }}
                        />
                        <Input
                          type="date"
                          placeholder="End date"
                          value={filters.createdDateRange?.end || ''}
                          onChange={(e) => updateFilter('createdDateRange', {
                            start: filters.createdDateRange?.start || '',
                            end: e.target.value
                          })}
                          classNames={{
                            input: "glass-input",
                            inputWrapper: "glass-input-wrapper",
                          }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Last Contacted
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          type="date"
                          placeholder="Start date"
                          value={filters.lastContactedRange?.start || ''}
                          onChange={(e) => updateFilter('lastContactedRange', {
                            start: e.target.value,
                            end: filters.lastContactedRange?.end || ''
                          })}
                          classNames={{
                            input: "glass-input",
                            inputWrapper: "glass-input-wrapper",
                          }}
                        />
                        <Input
                          type="date"
                          placeholder="End date"
                          value={filters.lastContactedRange?.end || ''}
                          onChange={(e) => updateFilter('lastContactedRange', {
                            start: filters.lastContactedRange?.start || '',
                            end: e.target.value
                          })}
                          classNames={{
                            input: "glass-input",
                            inputWrapper: "glass-input-wrapper",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </AccordionItem>
              </Accordion>
            </div>
          </>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Active Filters ({activeFilterCount}):
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => {
                if (!value || (Array.isArray(value) && value.length === 0)) return null;
                
                let displayValue = String(value);
                if (Array.isArray(value)) {
                  displayValue = value.join(', ');
                } else if (key === 'lifetimeValueRange' && Array.isArray(value)) {
                  displayValue = `$${value[0].toLocaleString()} - $${value[1].toLocaleString()}`;
                }
                
                return (
                  <Chip
                    key={key}
                    size="sm"
                    variant="flat"
                    color="secondary"
                    onClose={() => updateFilter(key as keyof SearchFilters, undefined)}
                  >
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}: {displayValue}
                  </Chip>
                );
              })}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}