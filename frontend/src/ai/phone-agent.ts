import { z } from 'zod';
import { speechProcessor, TranscriptionResult, AudioProcessingResult } from './speech-processing';
import { conversationHandler, ConversationContext, ConversationResponse } from './conversation-handler';
import { workflowOrchestrator } from './workflow-orchestrator';

// Types for phone agent
export interface PhoneCall {
  callId: string;
  conversationId: string;
  callerId?: string;
  callerName?: string;
  businessId: string;
  startTime: Date;
  endTime?: Date;
  status: 'incoming' | 'connected' | 'on_hold' | 'transferred' | 'completed' | 'failed';
  duration?: number;
  recordings?: {
    audioUrl: string;
    transcriptUrl?: string;
    duration: number;
  }[];
  summary?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  escalationReason?: string;
  transferredTo?: string;
}

export interface PhoneAgentConfig {
  businessId: string;
  welcomeMessage?: string;
  maxCallDuration?: number; // minutes
  enableRecording?: boolean;
  autoTranscription?: boolean;
  voiceId?: string;
  language?: string;
  emergencyKeywords?: string[];
  transferConditions?: {
    maxFailedAttempts?: number;
    escalationKeywords?: string[];
    humanRequestKeywords?: string[];
  };
}

export interface CallMetrics {
  totalCalls: number;
  answeredCalls: number;
  missedCalls: number;
  averageCallDuration: number;
  averageResponseTime: number;
  customerSatisfactionScore?: number;
  appointmentsBooked: number;
  leadsCaptured: number;
  escalationRate: number;
}

// Validation schemas
const callStatusSchema = z.enum(['incoming', 'connected', 'on_hold', 'transferred', 'completed', 'failed']);
const sentimentSchema = z.enum(['positive', 'neutral', 'negative']);

export class PhoneAgent {
  private config: PhoneAgentConfig;
  private activeCalls: Map<string, PhoneCall> = new Map();
  private callHistory: PhoneCall[] = [];
  private isInitialized: boolean = false;
  private metrics: CallMetrics;

  constructor(config: PhoneAgentConfig) {
    this.config = {
      maxCallDuration: 30, // 30 minutes default
      enableRecording: true,
      autoTranscription: true,
      language: 'en-US',
      voiceId: 'EXAVITQu4vr4xnSDxMaL', // Bella voice
      emergencyKeywords: ['emergency', 'urgent', 'help', 'broken', 'leak', 'fire', 'danger'],
      transferConditions: {
        maxFailedAttempts: 3,
        escalationKeywords: ['manager', 'supervisor', 'human', 'person', 'representative'],
        humanRequestKeywords: ['speak to someone', 'talk to a person', 'human agent', 'real person']
      },
      ...config
    };
    
    this.metrics = {
      totalCalls: 0,
      answeredCalls: 0,
      missedCalls: 0,
      averageCallDuration: 0,
      averageResponseTime: 0,
      appointmentsBooked: 0,
      leadsCaptured: 0,
      escalationRate: 0
    };

    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // Initialize speech processing if not already done
      await speechProcessor;
      this.isInitialized = true;
      console.log('Phone Agent initialized successfully');
    } catch (error) {
      console.error('Phone Agent initialization failed:', error);
      this.isInitialized = false;
    }
  }

  // Handle incoming phone call
  async handleIncomingCall(params: {
    callerId?: string;
    callerName?: string;
    phoneNumber?: string;
  }): Promise<PhoneCall> {
    if (!this.isInitialized) {
      throw new Error('Phone Agent not initialized');
    }

    const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Start new conversation
    const conversation = await conversationHandler.startConversation({
      businessId: this.config.businessId,
      channel: 'phone',
      customerPhone: params.phoneNumber,
      language: this.config.language
    });

    const call: PhoneCall = {
      callId,
      conversationId: conversation.conversationId,
      callerId: params.callerId,
      callerName: params.callerName,
      businessId: this.config.businessId,
      startTime: new Date(),
      status: 'incoming'
    };

    this.activeCalls.set(callId, call);
    this.metrics.totalCalls++;

    console.log(`Incoming call: ${callId} from ${params.callerName || params.callerId || 'Unknown'}`);
    
    return call;
  }

  // Answer and start conversation
  async answerCall(callId: string): Promise<{
    success: boolean;
    welcomeMessage: string;
    audioResponse?: AudioProcessingResult;
  }> {
    const call = this.activeCalls.get(callId);
    if (!call) {
      throw new Error(`Call ${callId} not found`);
    }

    try {
      // Update call status
      call.status = 'connected';
      this.metrics.answeredCalls++;

      // Generate welcome message
      const welcomeMessage = this.config.welcomeMessage || 
        "Hello! Thank you for calling. I'm your AI assistant, and I'm here to help you 24/7. How can I assist you today?";

      // Convert to speech
      const audioResponse = await speechProcessor.synthesizeSpeech(welcomeMessage, {
        voiceId: this.config.voiceId
      });

      // Start conversation with welcome message
      await conversationHandler.processMessage(
        call.conversationId,
        '<<CALL_STARTED>>',
        { systemMessage: true, welcomeDelivered: true }
      );

      console.log(`Call answered: ${callId}`);

      return {
        success: true,
        welcomeMessage,
        audioResponse
      };
    } catch (error) {
      console.error(`Failed to answer call ${callId}:`, error);
      call.status = 'failed';
      
      return {
        success: false,
        welcomeMessage: 'I apologize, but I\'m having technical difficulties. Please try calling back in a moment.'
      };
    }
  }

  // Process audio input from caller
  async processAudioInput(callId: string, audioBuffer: ArrayBuffer): Promise<{
    transcription: TranscriptionResult;
    response: ConversationResponse;
    audioResponse?: AudioProcessingResult;
    shouldTransfer?: boolean;
    transferReason?: string;
  }> {
    const call = this.activeCalls.get(callId);
    if (!call) {
      throw new Error(`Call ${callId} not found`);
    }

    try {
      // Transcribe audio to text
      const transcription = await speechProcessor.transcribeAudio(audioBuffer, 'audio/wav');
      
      if (!transcription.text || transcription.text.trim().length === 0) {
        // No speech detected, return clarification
        const clarificationMessage = "I didn't catch that. Could you please repeat what you said?";
        const audioResponse = await speechProcessor.synthesizeSpeech(clarificationMessage, {
          voiceId: this.config.voiceId
        });
        
        return {
          transcription,
          response: {
            text: clarificationMessage,
            intent: 'clarification_request',
            confidence: 0.8
          },
          audioResponse
        };
      }

      // Check for emergency keywords
      const isEmergency = this.detectEmergency(transcription.text);
      if (isEmergency) {
        return await this.handleEmergencyCall(call, transcription);
      }

      // Check for transfer requests
      const shouldTransfer = this.shouldTransferCall(transcription.text);
      if (shouldTransfer) {
        return await this.initiateTransfer(call, transcription, 'customer_request');
      }

      // Process message through conversation handler
      const response = await conversationHandler.processMessage(
        call.conversationId,
        transcription.text,
        {
          confidence: transcription.confidence,
          audioTranscription: true,
          callId: callId
        }
      );

      // Check if response requires escalation
      if (response.escalationRequired) {
        return await this.initiateTransfer(call, transcription, response.transferReason || 'ai_escalation');
      }

      // Convert response to speech
      const audioResponse = await speechProcessor.synthesizeSpeech(response.text, {
        voiceId: this.config.voiceId
      });

      // Execute any workflow actions
      if (response.actions) {
        await this.executeCallActions(call, response.actions);
      }

      return {
        transcription,
        response,
        audioResponse
      };
    } catch (error) {
      console.error(`Audio processing failed for call ${callId}:`, error);
      
      // Fallback response
      const fallbackMessage = "I apologize, but I'm having trouble processing your request. Let me connect you with a human agent.";
      const audioResponse = await speechProcessor.synthesizeSpeech(fallbackMessage, {
        voiceId: this.config.voiceId
      });
      
      return {
        transcription: { text: '', confidence: 0 },
        response: {
          text: fallbackMessage,
          intent: 'escalation_request',
          confidence: 0.5,
          escalationRequired: true,
          transferReason: 'technical_error'
        },
        audioResponse,
        shouldTransfer: true,
        transferReason: 'technical_error'
      };
    }
  }

  // Detect emergency keywords
  private detectEmergency(text: string): boolean {
    const lowercaseText = text.toLowerCase();
    return this.config.emergencyKeywords!.some(keyword => 
      lowercaseText.includes(keyword.toLowerCase())
    );
  }

  // Check if call should be transferred to human
  private shouldTransferCall(text: string): boolean {
    const lowercaseText = text.toLowerCase();
    
    // Check escalation keywords
    const hasEscalationKeyword = this.config.transferConditions!.escalationKeywords!.some(keyword =>
      lowercaseText.includes(keyword.toLowerCase())
    );
    
    // Check human request keywords
    const hasHumanRequest = this.config.transferConditions!.humanRequestKeywords!.some(keyword =>
      lowercaseText.includes(keyword.toLowerCase())
    );
    
    return hasEscalationKeyword || hasHumanRequest;
  }

  // Handle emergency call escalation
  private async handleEmergencyCall(call: PhoneCall, transcription: TranscriptionResult): Promise<any> {
    const emergencyMessage = "I understand this is an emergency. I'm connecting you with our emergency response team right away. Please stay on the line.";
    
    // Update call for emergency escalation
    call.status = 'transferred';
    call.escalationReason = 'emergency';
    
    const audioResponse = await speechProcessor.synthesizeSpeech(emergencyMessage, {
      voiceId: this.config.voiceId
    });

    // Log emergency workflow trigger
    console.log('Emergency escalation triggered:', {
      callId: call.callId,
      conversationId: call.conversationId,
      transcription: transcription.text,
      timestamp: new Date().toISOString()
    });

    return {
      transcription,
      response: {
        text: emergencyMessage,
        intent: 'emergency',
        confidence: 0.98,
        escalationRequired: true,
        transferReason: 'emergency'
      },
      audioResponse,
      shouldTransfer: true,
      transferReason: 'emergency'
    };
  }

  // Initiate call transfer
  private async initiateTransfer(call: PhoneCall, transcription: TranscriptionResult, reason: string): Promise<any> {
    const transferMessage = "I'll connect you with one of our team members who can better assist you. Please hold for just a moment.";
    
    call.status = 'transferred';
    call.escalationReason = reason;
    this.metrics.escalationRate = (this.metrics.escalationRate * this.metrics.totalCalls + 1) / this.metrics.totalCalls;
    
    const audioResponse = await speechProcessor.synthesizeSpeech(transferMessage, {
      voiceId: this.config.voiceId
    });

    // Log transfer workflow trigger
    console.log('Call transfer triggered:', {
      callId: call.callId,
      conversationId: call.conversationId,
      reason: reason,
      transcript: transcription.text,
      timestamp: new Date().toISOString()
    });

    return {
      transcription,
      response: {
        text: transferMessage,
        intent: 'transfer',
        confidence: 0.95,
        escalationRequired: true,
        transferReason: reason
      },
      audioResponse,
      shouldTransfer: true,
      transferReason: reason
    };
  }

  // Execute call-specific actions
  private async executeCallActions(call: PhoneCall, actions: any[]): Promise<void> {
    for (const action of actions) {
      try {
        switch (action.type) {
          case 'book_appointment':
            await this.handleAppointmentBooking(call, action.data);
            break;
          case 'capture_lead':
            await this.handleLeadCapture(call, action.data);
            break;
          case 'send_information':
            await this.handleInformationRequest(call, action.data);
            break;
          case 'schedule_callback':
            await this.handleCallbackRequest(call, action.data);
            break;
          default:
            console.warn(`Unknown call action: ${action.type}`);
        }
      } catch (error) {
        console.error(`Call action execution failed: ${action.type}`, error);
      }
    }
  }

  // Handle appointment booking
  private async handleAppointmentBooking(call: PhoneCall, data: any): Promise<void> {
    this.metrics.appointmentsBooked++;
    console.log(`Appointment booked during call ${call.callId}:`, data);
    
    // Log appointment booking workflow trigger
    console.log('Appointment booking triggered:', {
      callId: call.callId,
      conversationId: call.conversationId,
      appointmentData: data,
      timestamp: new Date().toISOString()
    });
  }

  // Handle lead capture
  private async handleLeadCapture(call: PhoneCall, data: any): Promise<void> {
    this.metrics.leadsCaptured++;
    console.log(`Lead captured during call ${call.callId}:`, data);
    
    // Log lead capture workflow trigger
    console.log('Lead capture triggered:', {
      callId: call.callId,
      conversationId: call.conversationId,
      leadData: data,
      timestamp: new Date().toISOString()
    });
  }

  // Handle information requests
  private async handleInformationRequest(call: PhoneCall, data: any): Promise<void> {
    console.log(`Information requested during call ${call.callId}:`, data);
    
    // Log information sending workflow trigger
    console.log('Information sending triggered:', {
      callId: call.callId,
      conversationId: call.conversationId,
      informationRequest: data,
      timestamp: new Date().toISOString()
    });
  }

  // Handle callback requests
  private async handleCallbackRequest(call: PhoneCall, data: any): Promise<void> {
    console.log(`Callback scheduled during call ${call.callId}:`, data);
    
    // Log callback scheduling workflow trigger
    console.log('Callback scheduling triggered:', {
      callId: call.callId,
      conversationId: call.conversationId,
      callbackData: data,
      timestamp: new Date().toISOString()
    });
  }

  // End call and cleanup
  async endCall(callId: string, reason: string = 'completed'): Promise<void> {
    const call = this.activeCalls.get(callId);
    if (!call) {
      throw new Error(`Call ${callId} not found`);
    }

    // Update call status
    call.endTime = new Date();
    call.status = 'completed';
    call.duration = Math.floor((call.endTime.getTime() - call.startTime.getTime()) / 1000); // seconds

    // End conversation
    await conversationHandler.endConversationPublic(call.conversationId, reason);

    // Generate call summary
    const messages = conversationHandler.getMessageHistory(call.conversationId);
    call.summary = this.generateCallSummary(call, messages);

    // Update metrics
    this.updateMetrics(call);

    // Move to call history
    this.callHistory.push(call);
    this.activeCalls.delete(callId);

    console.log(`Call ended: ${callId}, Duration: ${call.duration}s, Reason: ${reason}`);
  }

  // Generate call summary
  private generateCallSummary(call: PhoneCall, messages: any[]): string {
    const userMessages = messages.filter(msg => msg.type === 'user');
    const intents = messages.map(msg => msg.metadata?.intent).filter(Boolean);
    const uniqueIntents = [...new Set(intents)];
    
    let summary = `Call with ${call.callerName || call.callerId || 'Unknown caller'} lasted ${call.duration} seconds. `;
    summary += `Customer had ${userMessages.length} interactions. `;
    summary += `Primary topics: ${uniqueIntents.join(', ')}. `;
    
    if (call.status === 'transferred') {
      summary += `Call was transferred due to: ${call.escalationReason}. `;
    }
    
    return summary;
  }

  // Update call metrics
  private updateMetrics(call: PhoneCall): void {
    const totalDuration = this.callHistory.reduce((sum, c) => sum + (c.duration || 0), 0) + (call.duration || 0);
    const totalCompleted = this.callHistory.length + 1;
    
    this.metrics.averageCallDuration = totalDuration / totalCompleted;
    
    // Update escalation rate
    const totalEscalations = this.callHistory.filter(c => c.status === 'transferred').length + 
                            (call.status === 'transferred' ? 1 : 0);
    this.metrics.escalationRate = totalEscalations / this.metrics.totalCalls;
  }

  // Get current metrics
  getMetrics(): CallMetrics {
    return { ...this.metrics };
  }

  // Get active calls
  getActiveCalls(): PhoneCall[] {
    return Array.from(this.activeCalls.values());
  }

  // Get call history
  getCallHistory(): PhoneCall[] {
    return [...this.callHistory];
  }

  // Get specific call
  getCall(callId: string): PhoneCall | undefined {
    return this.activeCalls.get(callId) || this.callHistory.find(call => call.callId === callId);
  }

  // Update configuration
  updateConfig(newConfig: Partial<PhoneAgentConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Health check
  isHealthy(): boolean {
    return this.isInitialized && speechProcessor !== null;
  }
}

// Factory function for creating phone agent
export function createPhoneAgent(config: PhoneAgentConfig): PhoneAgent {
  return new PhoneAgent(config);
}

// Export utility functions
export const phoneAgentUtils = {
  formatCallDuration: (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  },

  analyzeCallMetrics: (metrics: CallMetrics) => {
    const answerRate = metrics.totalCalls > 0 ? (metrics.answeredCalls / metrics.totalCalls) * 100 : 0;
    const conversionRate = metrics.answeredCalls > 0 ? (metrics.appointmentsBooked / metrics.answeredCalls) * 100 : 0;
    
    return {
      answerRate: `${answerRate.toFixed(1)}%`,
      conversionRate: `${conversionRate.toFixed(1)}%`,
      escalationRate: `${(metrics.escalationRate * 100).toFixed(1)}%`,
      averageCallDuration: phoneAgentUtils.formatCallDuration(Math.floor(metrics.averageCallDuration)),
      performance: answerRate > 95 && metrics.escalationRate < 0.1 ? 'Excellent' : 
                  answerRate > 85 && metrics.escalationRate < 0.2 ? 'Good' : 'Needs Improvement'
    };
  },

  generateDailyReport: (calls: PhoneCall[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaysCalls = calls.filter(call => call.startTime >= today);
    const totalDuration = todaysCalls.reduce((sum, call) => sum + (call.duration || 0), 0);
    const appointments = todaysCalls.filter(call => 
      call.summary?.includes('appointment') || call.summary?.includes('scheduled')
    ).length;
    
    return {
      date: today.toDateString(),
      totalCalls: todaysCalls.length,
      totalDuration: phoneAgentUtils.formatCallDuration(totalDuration),
      appointmentsBooked: appointments,
      averageCallLength: todaysCalls.length > 0 ? 
        phoneAgentUtils.formatCallDuration(Math.floor(totalDuration / todaysCalls.length)) : '0:00'
    };
  }
};