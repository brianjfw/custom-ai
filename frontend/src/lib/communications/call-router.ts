import { z } from 'zod';
import { createPhoneAgent, PhoneAgent, PhoneCall, CallMetrics } from '../../ai/phone-agent';

// Types for call routing
export interface CallRoute {
  id: string;
  name: string;
  pattern: RegExp | string;
  priority: number;
  businessId: string;
  phoneAgent: PhoneAgent;
  isActive: boolean;
  createdAt: Date;
  lastUsed?: Date;
  callCount: number;
}

export interface IncomingCall {
  callId: string;
  fromNumber: string;
  toNumber: string;
  callerName?: string;
  callDirection: 'inbound' | 'outbound';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface CallRoutingRule {
  id: string;
  name: string;
  conditions: {
    timeOfDay?: { start: string; end: string };
    dayOfWeek?: number[]; // 0-6, Sunday=0
    callerNumberPattern?: string;
    businessId?: string;
    department?: string;
  };
  action: {
    type: 'route_to_agent' | 'route_to_human' | 'play_message' | 'take_voicemail';
    agentId?: string;
    humanExtension?: string;
    messageText?: string;
    voicemailGreeting?: string;
  };
  priority: number;
  isActive: boolean;
}

// Validation schemas
const callDirectionSchema = z.enum(['inbound', 'outbound']);
const routingActionSchema = z.enum(['route_to_agent', 'route_to_human', 'play_message', 'take_voicemail']);

export class CallRouter {
  private routes: Map<string, CallRoute> = new Map();
  private routingRules: CallRoutingRule[] = [];
  private defaultRoute: CallRoute | null = null;
  private isInitialized: boolean = false;
  private callHistory: IncomingCall[] = [];

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      this.isInitialized = true;
      console.log('Call Router initialized successfully');
    } catch (error) {
      console.error('Call Router initialization failed:', error);
      this.isInitialized = false;
    }
  }

  // Register a new call route
  async registerRoute(config: {
    name: string;
    pattern: RegExp | string;
    priority: number;
    businessId: string;
    phoneAgentConfig?: any;
    isDefault?: boolean;
  }): Promise<CallRoute> {
    if (!this.isInitialized) {
      throw new Error('Call Router not initialized');
    }

    const routeId = `route_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create phone agent for this route
    const phoneAgent = createPhoneAgent({
      businessId: config.businessId,
      ...config.phoneAgentConfig
    });

    const route: CallRoute = {
      id: routeId,
      name: config.name,
      pattern: config.pattern,
      priority: config.priority,
      businessId: config.businessId,
      phoneAgent,
      isActive: true,
      createdAt: new Date(),
      callCount: 0
    };

    this.routes.set(routeId, route);

    // Set as default route if specified
    if (config.isDefault || this.routes.size === 1) {
      this.defaultRoute = route;
    }

    console.log(`Route registered: ${config.name} (${routeId})`);
    return route;
  }

  // Add routing rule
  addRoutingRule(rule: Omit<CallRoutingRule, 'id'>): string {
    const ruleId = `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullRule: CallRoutingRule = {
      id: ruleId,
      ...rule
    };

    this.routingRules.push(fullRule);
    
    // Sort rules by priority (higher number = higher priority)
    this.routingRules.sort((a, b) => b.priority - a.priority);

    console.log(`Routing rule added: ${rule.name} (${ruleId})`);
    return ruleId;
  }

  // Route incoming call
  async routeCall(incomingCall: Omit<IncomingCall, 'callId' | 'timestamp'>): Promise<{
    route: CallRoute;
    phoneCall: PhoneCall;
    action: string;
  }> {
    if (!this.isInitialized) {
      throw new Error('Call Router not initialized');
    }

    // Create full incoming call object
    const call: IncomingCall = {
      callId: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...incomingCall
    };

    // Add to call history
    this.callHistory.push(call);

    try {
      // Apply routing rules
      const matchedRule = this.findMatchingRule(call);
      
      if (matchedRule) {
        return await this.executeRoutingRule(call, matchedRule);
      }

      // Find best matching route
      const route = this.findBestRoute(call);
      
      if (!route) {
        throw new Error('No suitable route found for call');
      }

      // Route to AI phone agent
      const phoneCall = await route.phoneAgent.handleIncomingCall({
        callerId: call.fromNumber,
        callerName: call.callerName,
        phoneNumber: call.fromNumber
      });

      // Update route statistics
      route.callCount++;
      route.lastUsed = new Date();

      console.log(`Call routed: ${call.callId} -> ${route.name}`);

      return {
        route,
        phoneCall,
        action: 'route_to_agent'
      };
    } catch (error) {
      console.error(`Call routing failed for ${call.callId}:`, error);
      
      // Fallback to default route
      if (this.defaultRoute) {
        const phoneCall = await this.defaultRoute.phoneAgent.handleIncomingCall({
          callerId: call.fromNumber,
          callerName: call.callerName,
          phoneNumber: call.fromNumber
        });

        return {
          route: this.defaultRoute,
          phoneCall,
          action: 'fallback_route'
        };
      }

      throw error;
    }
  }

  // Find matching routing rule
  private findMatchingRule(call: IncomingCall): CallRoutingRule | null {
    for (const rule of this.routingRules) {
      if (!rule.isActive) continue;

      // Check time of day
      if (rule.conditions.timeOfDay) {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        if (currentTime < rule.conditions.timeOfDay.start || currentTime > rule.conditions.timeOfDay.end) {
          continue;
        }
      }

      // Check day of week
      if (rule.conditions.dayOfWeek) {
        const dayOfWeek = new Date().getDay();
        if (!rule.conditions.dayOfWeek.includes(dayOfWeek)) {
          continue;
        }
      }

      // Check caller number pattern
      if (rule.conditions.callerNumberPattern) {
        const pattern = new RegExp(rule.conditions.callerNumberPattern);
        if (!pattern.test(call.fromNumber)) {
          continue;
        }
      }

      // Check business ID
      if (rule.conditions.businessId) {
        // Would need to determine business ID from call context
        // For now, skip this check
      }

      return rule;
    }

    return null;
  }

  // Execute routing rule action
  private async executeRoutingRule(call: IncomingCall, rule: CallRoutingRule): Promise<any> {
    switch (rule.action.type) {
      case 'route_to_agent':
        if (rule.action.agentId) {
          const route = this.routes.get(rule.action.agentId);
          if (route) {
            const phoneCall = await route.phoneAgent.handleIncomingCall({
              callerId: call.fromNumber,
              callerName: call.callerName,
              phoneNumber: call.fromNumber
            });

            return {
              route,
              phoneCall,
              action: 'route_to_agent'
            };
          }
        }
        break;

      case 'route_to_human':
        // Would integrate with human agent system
        console.log(`Routing to human extension: ${rule.action.humanExtension}`);
        return {
          route: null,
          phoneCall: null,
          action: 'route_to_human',
          extension: rule.action.humanExtension
        };

      case 'play_message':
        // Would play a custom message
        console.log(`Playing message: ${rule.action.messageText}`);
        return {
          route: null,
          phoneCall: null,
          action: 'play_message',
          message: rule.action.messageText
        };

      case 'take_voicemail':
        // Would start voicemail recording
        console.log(`Taking voicemail with greeting: ${rule.action.voicemailGreeting}`);
        return {
          route: null,
          phoneCall: null,
          action: 'take_voicemail',
          greeting: rule.action.voicemailGreeting
        };
    }

    // Fallback to default routing
    return this.findBestRoute(call);
  }

  // Find best matching route
  private findBestRoute(call: IncomingCall): CallRoute | null {
    const activeRoutes = Array.from(this.routes.values()).filter(route => route.isActive);
    
    if (activeRoutes.length === 0) {
      return this.defaultRoute;
    }

    // Try to match by pattern
    for (const route of activeRoutes) {
      if (this.matchesPattern(call, route.pattern)) {
        return route;
      }
    }

    // Sort by priority and return highest
    const sortedRoutes = activeRoutes.sort((a, b) => b.priority - a.priority);
    return sortedRoutes[0] || this.defaultRoute;
  }

  // Check if call matches route pattern
  private matchesPattern(call: IncomingCall, pattern: RegExp | string): boolean {
    if (typeof pattern === 'string') {
      return call.toNumber.includes(pattern) || call.fromNumber.includes(pattern);
    } else {
      return pattern.test(call.toNumber) || pattern.test(call.fromNumber) || 
             (call.callerName && pattern.test(call.callerName));
    }
  }

  // Get route by ID
  getRoute(routeId: string): CallRoute | undefined {
    return this.routes.get(routeId);
  }

  // Get all routes
  getAllRoutes(): CallRoute[] {
    return Array.from(this.routes.values());
  }

  // Get active routes
  getActiveRoutes(): CallRoute[] {
    return Array.from(this.routes.values()).filter(route => route.isActive);
  }

  // Update route
  updateRoute(routeId: string, updates: Partial<CallRoute>): boolean {
    const route = this.routes.get(routeId);
    if (!route) {
      return false;
    }

    Object.assign(route, updates);
    return true;
  }

  // Deactivate route
  deactivateRoute(routeId: string): boolean {
    const route = this.routes.get(routeId);
    if (!route) {
      return false;
    }

    route.isActive = false;
    return true;
  }

  // Activate route
  activateRoute(routeId: string): boolean {
    const route = this.routes.get(routeId);
    if (!route) {
      return false;
    }

    route.isActive = true;
    return true;
  }

  // Remove route
  removeRoute(routeId: string): boolean {
    const route = this.routes.get(routeId);
    if (!route) {
      return false;
    }

    // If this was the default route, clear it
    if (this.defaultRoute?.id === routeId) {
      this.defaultRoute = null;
    }

    return this.routes.delete(routeId);
  }

  // Set default route
  setDefaultRoute(routeId: string): boolean {
    const route = this.routes.get(routeId);
    if (!route) {
      return false;
    }

    this.defaultRoute = route;
    return true;
  }

  // Get routing statistics
  getRoutingStats(): {
    totalCalls: number;
    totalRoutes: number;
    activeRoutes: number;
    routeDistribution: Array<{ routeName: string; callCount: number; percentage: number }>;
    callsLast24Hours: number;
  } {
    const totalCalls = this.callHistory.length;
    const totalRoutes = this.routes.size;
    const activeRoutes = this.getActiveRoutes().length;

    // Calculate route distribution
    const routeStats = Array.from(this.routes.values()).map(route => ({
      routeName: route.name,
      callCount: route.callCount,
      percentage: totalCalls > 0 ? (route.callCount / totalCalls) * 100 : 0
    }));

    // Calls in last 24 hours
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    const callsLast24Hours = this.callHistory.filter(call => call.timestamp >= twentyFourHoursAgo).length;

    return {
      totalCalls,
      totalRoutes,
      activeRoutes,
      routeDistribution: routeStats,
      callsLast24Hours
    };
  }

  // Get call history
  getCallHistory(limit?: number): IncomingCall[] {
    const history = [...this.callHistory].reverse(); // Most recent first
    return limit ? history.slice(0, limit) : history;
  }

  // Get routing rules
  getRoutingRules(): CallRoutingRule[] {
    return [...this.routingRules];
  }

  // Update routing rule
  updateRoutingRule(ruleId: string, updates: Partial<CallRoutingRule>): boolean {
    const ruleIndex = this.routingRules.findIndex(rule => rule.id === ruleId);
    if (ruleIndex === -1) {
      return false;
    }

    this.routingRules[ruleIndex] = { ...this.routingRules[ruleIndex], ...updates };
    
    // Re-sort by priority
    this.routingRules.sort((a, b) => b.priority - a.priority);
    
    return true;
  }

  // Remove routing rule
  removeRoutingRule(ruleId: string): boolean {
    const ruleIndex = this.routingRules.findIndex(rule => rule.id === ruleId);
    if (ruleIndex === -1) {
      return false;
    }

    this.routingRules.splice(ruleIndex, 1);
    return true;
  }

  // Health check
  isHealthy(): boolean {
    return this.isInitialized && this.routes.size > 0;
  }
}

// Export singleton instance
export const callRouter = new CallRouter();

// Export utility functions
export const callRouterUtils = {
  parsePhoneNumber: (phoneNumber: string): { 
    formatted: string; 
    countryCode?: string; 
    areaCode?: string; 
    number: string; 
  } => {
    // Simple phone number parsing
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return {
        formatted: `+1 (${cleaned.substr(1, 3)}) ${cleaned.substr(4, 3)}-${cleaned.substr(7, 4)}`,
        countryCode: '1',
        areaCode: cleaned.substr(1, 3),
        number: cleaned.substr(4)
      };
    } else if (cleaned.length === 10) {
      return {
        formatted: `(${cleaned.substr(0, 3)}) ${cleaned.substr(3, 3)}-${cleaned.substr(6, 4)}`,
        areaCode: cleaned.substr(0, 3),
        number: cleaned.substr(3)
      };
    }

    return {
      formatted: phoneNumber,
      number: cleaned
    };
  },

  generateCallReport: (routes: CallRoute[], timeRange: 'day' | 'week' | 'month' = 'day') => {
    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case 'day':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    const totalCalls = routes.reduce((sum, route) => sum + route.callCount, 0);
    const routeMetrics = routes.map(route => ({
      name: route.name,
      callCount: route.callCount,
      utilization: totalCalls > 0 ? (route.callCount / totalCalls * 100).toFixed(1) + '%' : '0%',
      isActive: route.isActive,
      lastUsed: route.lastUsed?.toLocaleDateString() || 'Never'
    }));

    return {
      timeRange,
      totalCalls,
      activeRoutes: routes.filter(r => r.isActive).length,
      totalRoutes: routes.length,
      routeMetrics
    };
  },

  validateRoutingRule: (rule: Partial<CallRoutingRule>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!rule.name) {
      errors.push('Rule name is required');
    }

    if (!rule.action?.type) {
      errors.push('Action type is required');
    }

    if (rule.action?.type === 'route_to_agent' && !rule.action.agentId) {
      errors.push('Agent ID is required for route_to_agent action');
    }

    if (rule.action?.type === 'route_to_human' && !rule.action.humanExtension) {
      errors.push('Human extension is required for route_to_human action');
    }

    if (rule.conditions?.timeOfDay) {
      const { start, end } = rule.conditions.timeOfDay;
      if (!start || !end) {
        errors.push('Both start and end times are required for time-based routing');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};