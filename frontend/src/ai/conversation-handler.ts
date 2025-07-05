import { z } from 'zod';
import { contextEngine } from './context-engine';
import { workflowOrchestrator } from './workflow-orchestrator';

// Types for conversation management
export interface ConversationContext {
  conversationId: string;
  customerId?: string;
  businessId: string;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  channel: 'phone' | 'chat' | 'video';
  language: string;
  customerInfo?: {
    name?: string;
    phone?: string;
    email?: string;
    previousInteractions?: number;
    customerType?: 'new' | 'returning' | 'vip';
  };
  businessContext?: {
    businessName?: string;
    businessType?: string;
    businessHours?: { start: string; end: string };
    services?: string[];
    currentPromotions?: string[];
    availableTimeSlots?: string[];
    averageResponseTime?: string;
  };
  conversationState: 'active' | 'on_hold' | 'transferred' | 'completed';
  sentiment?: 'positive' | 'neutral' | 'negative';
  urgency?: 'low' | 'medium' | 'high' | 'urgent';
  intent?: string;
  entities?: Record<string, any>;
}

export interface ConversationMessage {
  id: string;
  timestamp: Date;
  type: 'user' | 'agent' | 'system';
  content: string;
  metadata?: {
    confidence?: number;
    intent?: string;
    entities?: Record<string, any>;
    sentiment?: string;
    audioUrl?: string;
    transcriptionId?: string;
    actions?: Array<{
      type: string;
      data: any;
      executeImmediately?: boolean;
    }>;
  };
}

export interface ConversationResponse {
  text: string;
  intent: string;
  confidence: number;
  actions?: Array<{
    type: string;
    data: any;
    executeImmediately?: boolean;
  }>;
  suggestedResponses?: string[];
  escalationRequired?: boolean;
  transferReason?: string;
  followUpRequired?: boolean;
  appointmentDetails?: {
    service?: string;
    date?: string;
    time?: string;
    duration?: number;
    estimatedCost?: number;
  };
}

// Validation schemas
const intentSchema = z.enum([
  'greeting',
  'appointment_booking',
  'service_inquiry',
  'pricing_request',
  'availability_check',
  'existing_appointment',
  'complaint',
  'compliment',
  'emergency',
  'technical_support',
  'payment_inquiry',
  'cancellation',
  'reschedule',
  'information_request',
  'callback_request',
  'escalation_request',
  'goodbye'
]);

const entitySchema = z.object({
  service: z.string().optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  urgency: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  budget: z.number().optional(),
  duration: z.number().optional()
});

export class ConversationHandler {
  private conversations: Map<string, ConversationContext> = new Map();
  private messageHistory: Map<string, ConversationMessage[]> = new Map();
  private businessContext: any = null;

  constructor() {
    this.initializeBusinessContext();
  }

  private async initializeBusinessContext(): Promise<void> {
    try {
      // Get business context from Context Engine
      // For now using default context - will integrate with Context Engine later
      this.businessContext = this.getDefaultBusinessContext();
    } catch (error) {
      console.error('Failed to initialize business context:', error);
      this.businessContext = this.getDefaultBusinessContext();
    }
  }

  private getDefaultBusinessContext() {
    return {
      businessName: 'Professional Services',
      businessType: 'service_provider',
      businessHours: { start: '9:00', end: '17:00' },
      services: ['consultation', 'maintenance', 'installation'],
      averageResponseTime: '15 minutes',
      availableTimeSlots: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM']
    };
  }

  // Start a new conversation
  async startConversation(params: {
    businessId: string;
    channel: 'phone' | 'chat' | 'video';
    customerPhone?: string;
    language?: string;
  }): Promise<ConversationContext> {
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Check if customer exists
    let customerInfo = undefined;
    if (params.customerPhone) {
      customerInfo = await this.getCustomerInfo(params.customerPhone);
    }

    const context: ConversationContext = {
      conversationId,
      businessId: params.businessId,
      sessionId,
      startTime: new Date(),
      channel: params.channel,
      language: params.language || 'en-US',
      customerInfo,
      businessContext: this.businessContext,
      conversationState: 'active',
      sentiment: 'neutral',
      urgency: 'medium'
    };

    this.conversations.set(conversationId, context);
    this.messageHistory.set(conversationId, []);

    // Log conversation start
    await this.logSystemMessage(conversationId, 'Conversation started');

    return context;
  }

  // Process incoming message and generate response
  async processMessage(conversationId: string, message: string, metadata: any = {}): Promise<ConversationResponse> {
    const context = this.conversations.get(conversationId);
    if (!context) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    try {
      // Add user message to history
      await this.addMessage(conversationId, {
        type: 'user',
        content: message,
        metadata
      });

      // Analyze message for intent and entities
      const analysis = await this.analyzeMessage(message, context);
      
      // Update conversation context
      await this.updateConversationContext(conversationId, analysis);

      // Generate appropriate response
      const response = await this.generateResponse(context, analysis);

      // Add agent response to history
      await this.addMessage(conversationId, {
        type: 'agent',
        content: response.text,
        metadata: {
          intent: response.intent,
          confidence: response.confidence,
          actions: response.actions
        }
      });

      // Execute any immediate actions
      if (response.actions) {
        await this.executeActions(conversationId, response.actions);
      }

      return response;
    } catch (error) {
      console.error('Message processing failed:', error);
      
      // Fallback response
      return {
        text: "I apologize, but I'm having trouble processing your request right now. Let me connect you with a human agent who can help you better.",
        intent: 'escalation_request',
        confidence: 0.5,
        escalationRequired: true,
        transferReason: 'technical_error'
      };
    }
  }

  // Analyze message for intent and entities
  private async analyzeMessage(message: string, context: ConversationContext): Promise<{
    intent: string;
    entities: Record<string, any>;
    sentiment: string;
    confidence: number;
  }> {
    const lowercaseMessage = message.toLowerCase();
    
    // Intent classification with business context
    let intent = 'information_request';
    let confidence = 0.7;
    
    // Greeting patterns
    if (/^(hi|hello|hey|good morning|good afternoon|good evening)/.test(lowercaseMessage)) {
      intent = 'greeting';
      confidence = 0.95;
    }
    // Appointment booking patterns
    else if (/(schedule|book|appointment|meeting|visit|come in|available|slot)/.test(lowercaseMessage)) {
      intent = 'appointment_booking';
      confidence = 0.9;
    }
    // Service inquiry patterns
    else if (/(service|help|what do you|do you offer|provide|need)/.test(lowercaseMessage)) {
      intent = 'service_inquiry';
      confidence = 0.85;
    }
    // Pricing patterns
    else if (/(price|cost|how much|quote|estimate|rate|fee)/.test(lowercaseMessage)) {
      intent = 'pricing_request';
      confidence = 0.9;
    }
    // Emergency patterns
    else if (/(emergency|urgent|asap|immediately|broke|not working|help)/.test(lowercaseMessage)) {
      intent = 'emergency';
      confidence = 0.95;
    }
    // Goodbye patterns
    else if (/(bye|goodbye|thank you|thanks|that's all|have a good)/.test(lowercaseMessage)) {
      intent = 'goodbye';
      confidence = 0.9;
    }

    // Extract entities
    const entities = this.extractEntities(message);
    
    // Sentiment analysis (basic)
    const sentiment = this.analyzeSentiment(message);

    return {
      intent,
      entities,
      sentiment,
      confidence
    };
  }

  // Extract entities from message
  private extractEntities(message: string): Record<string, any> {
    const entities: Record<string, any> = {};
    
    // Extract phone numbers
    const phoneRegex = /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
    const phoneMatch = message.match(phoneRegex);
    if (phoneMatch) {
      entities.phone = phoneMatch[0];
    }

    // Extract email addresses
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emailMatch = message.match(emailRegex);
    if (emailMatch) {
      entities.email = emailMatch[0];
    }

    // Extract names (basic pattern)
    const nameRegex = /my name is ([A-Za-z\s]+)|i'm ([A-Za-z\s]+)|this is ([A-Za-z\s]+)/i;
    const nameMatch = message.match(nameRegex);
    if (nameMatch) {
      entities.name = nameMatch[1] || nameMatch[2] || nameMatch[3];
    }

    // Extract time references
    const timeRegex = /(\d{1,2}:\d{2}(?:\s?[ap]m)?)|(\d{1,2}\s?[ap]m)|(morning|afternoon|evening|noon)/gi;
    const timeMatch = message.match(timeRegex);
    if (timeMatch) {
      entities.time = timeMatch[0];
    }

    // Extract date references
    const dateRegex = /(today|tomorrow|next week|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}\/\d{1,2}\/?\d{0,4})/gi;
    const dateMatch = message.match(dateRegex);
    if (dateMatch) {
      entities.date = dateMatch[0];
    }

    return entities;
  }

  // Basic sentiment analysis
  private analyzeSentiment(message: string): string {
    const positiveWords = ['great', 'good', 'excellent', 'wonderful', 'fantastic', 'pleased', 'happy', 'satisfied'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'disappointed', 'angry', 'frustrated', 'upset'];
    
    const words = message.toLowerCase().split(/\s+/);
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  // Generate appropriate response based on context and analysis
  private async generateResponse(context: ConversationContext, analysis: any): Promise<ConversationResponse> {
    const { intent, entities, sentiment, confidence } = analysis;
    
    switch (intent) {
      case 'greeting':
        return this.generateGreetingResponse(context);
      
      case 'appointment_booking':
        return this.generateAppointmentResponse(context, entities);
      
      case 'service_inquiry':
        return this.generateServiceInquiryResponse(context, entities);
      
      case 'pricing_request':
        return this.generatePricingResponse(context, entities);
      
      case 'emergency':
        return this.generateEmergencyResponse(context, entities);
      
      case 'goodbye':
        return this.generateGoodbyeResponse(context);
      
      default:
        return this.generateGeneralResponse(context, analysis);
    }
  }

  private generateGreetingResponse(context: ConversationContext): ConversationResponse {
    const businessName = context.businessContext?.businessName || 'our business';
    const customerName = context.customerInfo?.name ? `, ${context.customerInfo.name}` : '';
    
    return {
      text: `Hello${customerName}! Thank you for calling ${businessName}. I'm your AI assistant, and I'm here to help you 24/7. How can I assist you today?`,
      intent: 'greeting',
      confidence: 0.95,
      suggestedResponses: [
        "I'd like to schedule an appointment",
        "What services do you offer?",
        "I need a quote for some work",
        "I have an emergency situation"
      ]
    };
  }

  private generateAppointmentResponse(context: ConversationContext, entities: any): ConversationResponse {
    const availableSlots = context.businessContext?.availableTimeSlots || ['9:00 AM', '2:00 PM', '4:00 PM'];
    const services = context.businessContext?.services || ['consultation', 'service call'];
    
    let responseText = "I'd be happy to help you schedule an appointment! ";
    
    if (entities.service) {
      responseText += `I see you're interested in ${entities.service}. `;
    } else {
      responseText += `What type of service are you looking for? We offer ${services.join(', ')}. `;
    }
    
    if (entities.date) {
      responseText += `You mentioned ${entities.date}. `;
    }
    
    if (entities.time) {
      responseText += `And you mentioned ${entities.time}. `;
    }
    
    responseText += `Our available time slots are: ${availableSlots.join(', ')}. Which works best for you?`;
    
    return {
      text: responseText,
      intent: 'appointment_booking',
      confidence: 0.9,
      actions: [
        {
          type: 'check_availability',
          data: { date: entities.date, time: entities.time, service: entities.service }
        }
      ],
      appointmentDetails: {
        service: entities.service,
        date: entities.date,
        time: entities.time
      }
    };
  }

  private generateServiceInquiryResponse(context: ConversationContext, entities: any): ConversationResponse {
    const services = context.businessContext?.services || ['consultation', 'maintenance', 'installation'];
    
    return {
      text: `We offer a full range of professional services including ${services.join(', ')}. Each service is customized to meet your specific needs. What particular service are you interested in learning more about?`,
      intent: 'service_inquiry',
      confidence: 0.85,
      suggestedResponses: services.map(service => `Tell me about ${service}`)
    };
  }

  private generatePricingResponse(context: ConversationContext, entities: any): ConversationResponse {
    return {
      text: `I'd be happy to provide you with pricing information. Our rates vary depending on the specific service and scope of work. To give you an accurate quote, I'll need to understand your specific needs better. What type of service are you looking for?`,
      intent: 'pricing_request',
      confidence: 0.9,
      actions: [
        {
          type: 'gather_requirements',
          data: { service: entities.service }
        }
      ]
    };
  }

  private generateEmergencyResponse(context: ConversationContext, entities: any): ConversationResponse {
    return {
      text: `I understand this is an emergency situation. Let me connect you with our emergency service team right away. While I'm connecting you, can you briefly describe what's happening?`,
      intent: 'emergency',
      confidence: 0.95,
      actions: [
        {
          type: 'escalate_emergency',
          data: { urgency: 'urgent', entities },
          executeImmediately: true
        }
      ],
      escalationRequired: true,
      transferReason: 'emergency_situation'
    };
  }

  private generateGoodbyeResponse(context: ConversationContext): ConversationResponse {
    return {
      text: `Thank you for calling! It was great helping you today. If you need anything else, don't hesitate to call back. We're here 24/7. Have a wonderful day!`,
      intent: 'goodbye',
      confidence: 0.9,
      actions: [
        {
          type: 'end_conversation',
          data: { reason: 'customer_goodbye' }
        }
      ]
    };
  }

  private generateGeneralResponse(context: ConversationContext, analysis: any): ConversationResponse {
    return {
      text: `I want to make sure I understand your needs correctly. Could you provide a bit more detail about what you're looking for? I'm here to help with scheduling appointments, providing service information, or answering any questions you might have.`,
      intent: 'information_request',
      confidence: 0.6,
      suggestedResponses: [
        "I need to schedule an appointment",
        "What services do you offer?",
        "I need pricing information",
        "I have a question about my existing service"
      ]
    };
  }

  // Execute conversation actions
  private async executeActions(conversationId: string, actions: any[]): Promise<void> {
    for (const action of actions) {
      try {
        switch (action.type) {
          case 'check_availability':
            await this.checkAvailability(conversationId, action.data);
            break;
          case 'gather_requirements':
            await this.gatherRequirements(conversationId, action.data);
            break;
          case 'escalate_emergency':
            await this.escalateEmergency(conversationId, action.data);
            break;
          case 'end_conversation':
            await this.endConversation(conversationId, action.data);
            break;
          default:
            console.warn(`Unknown action type: ${action.type}`);
        }
      } catch (error) {
        console.error(`Action execution failed: ${action.type}`, error);
      }
    }
  }

  // Helper methods for actions
  private async checkAvailability(conversationId: string, data: any): Promise<void> {
    // Integration with calendar system would go here
    console.log(`Checking availability for: ${JSON.stringify(data)}`);
  }

  private async gatherRequirements(conversationId: string, data: any): Promise<void> {
    // Start requirements gathering workflow
    console.log(`Gathering requirements for: ${JSON.stringify(data)}`);
  }

  private async escalateEmergency(conversationId: string, data: any): Promise<void> {
    // Trigger emergency escalation workflow
    console.log(`Escalating emergency: ${JSON.stringify(data)}`);
    
    // Update conversation state
    const context = this.conversations.get(conversationId);
    if (context) {
      context.urgency = 'urgent';
      context.conversationState = 'transferred';
    }
  }

  private async endConversation(conversationId: string, data: any): Promise<void> {
    const context = this.conversations.get(conversationId);
    if (context) {
      context.endTime = new Date();
      context.conversationState = 'completed';
    }
  }

  // Utility methods
  private async addMessage(conversationId: string, message: Partial<ConversationMessage>): Promise<void> {
    const fullMessage: ConversationMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type: message.type || 'user',
      content: message.content || '',
      metadata: message.metadata || {}
    };

    const history = this.messageHistory.get(conversationId) || [];
    history.push(fullMessage);
    this.messageHistory.set(conversationId, history);
  }

  private async logSystemMessage(conversationId: string, message: string): Promise<void> {
    await this.addMessage(conversationId, {
      type: 'system',
      content: message
    });
  }

  private async updateConversationContext(conversationId: string, analysis: any): Promise<void> {
    const context = this.conversations.get(conversationId);
    if (context) {
      context.intent = analysis.intent;
      context.entities = { ...context.entities, ...analysis.entities };
      context.sentiment = analysis.sentiment;
    }
  }

  private async getCustomerInfo(phone: string): Promise<any> {
    // In a real implementation, this would query the customer database
    return {
      name: 'John Doe',
      phone,
      email: 'john.doe@example.com',
      previousInteractions: 2,
      customerType: 'returning'
    };
  }

  // Public methods for conversation management
  public getConversation(conversationId: string): ConversationContext | undefined {
    return this.conversations.get(conversationId);
  }

  public getMessageHistory(conversationId: string): ConversationMessage[] {
    return this.messageHistory.get(conversationId) || [];
  }

  public async endConversationPublic(conversationId: string, reason: string = 'natural_end'): Promise<void> {
    const context = this.conversations.get(conversationId);
    if (context) {
      context.endTime = new Date();
      context.conversationState = 'completed';
      
      await this.logSystemMessage(conversationId, `Conversation ended: ${reason}`);
    }
  }

  public getActiveConversations(): ConversationContext[] {
    return Array.from(this.conversations.values()).filter(
      conv => conv.conversationState === 'active'
    );
  }
}

// Export singleton instance
export const conversationHandler = new ConversationHandler();

// Export utility functions
export const conversationUtils = {
  formatDuration: (start: Date, end?: Date): string => {
    const endTime = end || new Date();
    const duration = endTime.getTime() - start.getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  },

  extractConversationSummary: (messages: ConversationMessage[]): string => {
    const userMessages = messages.filter(msg => msg.type === 'user');
    const intents = messages.map(msg => msg.metadata?.intent).filter(Boolean);
    
    return `Conversation with ${userMessages.length} customer messages. Primary intents: ${[...new Set(intents)].join(', ')}`;
  },

  calculateConversationMetrics: (context: ConversationContext, messages: ConversationMessage[]) => {
    const duration = context.endTime ? 
      context.endTime.getTime() - context.startTime.getTime() : 
      Date.now() - context.startTime.getTime();
    
    const messageCount = messages.length;
    const userMessages = messages.filter(msg => msg.type === 'user').length;
    const agentMessages = messages.filter(msg => msg.type === 'agent').length;
    
    return {
      duration: Math.floor(duration / 1000), // seconds
      messageCount,
      userMessages,
      agentMessages,
      averageResponseTime: userMessages > 0 ? duration / userMessages : 0
    };
  }
};