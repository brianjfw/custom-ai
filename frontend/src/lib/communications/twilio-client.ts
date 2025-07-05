import { Twilio } from 'twilio';
import { z } from 'zod';

// Types for Twilio operations
export interface SMSMessage {
  to: string;
  body: string;
  from?: string;
  mediaUrl?: string[];
  messagingServiceSid?: string;
}

export interface VoiceCall {
  to: string;
  from: string;
  url: string;
  method?: 'GET' | 'POST';
  fallbackUrl?: string;
  statusCallback?: string;
  timeout?: number;
  machineDetection?: boolean;
}

export interface SMSResponse {
  sid: string;
  status: string;
  to: string;
  from: string;
  body: string;
  dateSent: Date;
  price?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface VoiceResponse {
  sid: string;
  status: string;
  to: string;
  from: string;
  duration?: number;
  price?: string;
  errorCode?: string;
  errorMessage?: string;
}

// Validation schemas
const smsMessageSchema = z.object({
  to: z.string().min(1, 'Phone number is required'),
  body: z.string().min(1, 'Message body is required').max(1600, 'Message too long'),
  from: z.string().optional(),
  mediaUrl: z.array(z.string().url()).optional(),
  messagingServiceSid: z.string().optional(),
});

const voiceCallSchema = z.object({
  to: z.string().min(1, 'Phone number is required'),
  from: z.string().min(1, 'From number is required'),
  url: z.string().url('Valid URL is required'),
  method: z.enum(['GET', 'POST']).optional(),
  fallbackUrl: z.string().url().optional(),
  statusCallback: z.string().url().optional(),
  timeout: z.number().min(5).max(600).optional(),
  machineDetection: z.boolean().optional(),
});

/**
 * Twilio Client - Handles SMS and voice communication
 * 
 * This client provides a unified interface for sending SMS messages and making voice calls
 * through Twilio's API. It includes comprehensive error handling, validation, and logging.
 */
export class TwilioClient {
  private client: Twilio;
  private accountSid: string;
  private authToken: string;
  private defaultFromNumber: string;
  private messagingServiceSid?: string;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.defaultFromNumber = process.env.TWILIO_FROM_NUMBER || '';
    this.messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

    if (!this.accountSid || !this.authToken) {
      console.warn('Twilio credentials not found. SMS and voice features will be disabled.');
      // Create a mock client for development
      this.client = {} as Twilio;
    } else {
      this.client = new Twilio(this.accountSid, this.authToken);
    }
  }

  /**
   * Send SMS message
   */
  async sendSMS(message: SMSMessage): Promise<SMSResponse> {
    const validatedMessage = smsMessageSchema.parse(message);

    // If no credentials, return mock response
    if (!this.accountSid || !this.authToken) {
      return this.createMockSMSResponse(validatedMessage);
    }

    try {
      const twilioMessage = await this.client.messages.create({
        body: validatedMessage.body,
        to: validatedMessage.to,
        from: validatedMessage.from || this.defaultFromNumber,
        mediaUrl: validatedMessage.mediaUrl,
        messagingServiceSid: validatedMessage.messagingServiceSid || this.messagingServiceSid,
      });

      return {
        sid: twilioMessage.sid,
        status: twilioMessage.status,
        to: twilioMessage.to,
        from: twilioMessage.from,
        body: twilioMessage.body,
        dateSent: twilioMessage.dateSent || new Date(),
        price: twilioMessage.price || undefined,
        errorCode: twilioMessage.errorCode?.toString() || undefined,
        errorMessage: twilioMessage.errorMessage || undefined,
      };
    } catch (error) {
      console.error('Twilio SMS error:', error);
      throw new Error(`Failed to send SMS: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Send bulk SMS messages
   */
  async sendBulkSMS(messages: SMSMessage[]): Promise<SMSResponse[]> {
    const responses = await Promise.allSettled(
      messages.map(message => this.sendSMS(message))
    );

    return responses.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`Bulk SMS failed for message ${index}:`, result.reason);
        return {
          sid: `error_${Date.now()}_${index}`,
          status: 'failed',
          to: messages[index].to,
          from: messages[index].from || this.defaultFromNumber,
          body: messages[index].body,
          dateSent: new Date(),
          errorMessage: result.reason instanceof Error ? result.reason.message : 'Unknown error',
        };
      }
    });
  }

  /**
   * Make voice call
   */
  async makeCall(call: VoiceCall): Promise<VoiceResponse> {
    const validatedCall = voiceCallSchema.parse(call);

    // If no credentials, return mock response
    if (!this.accountSid || !this.authToken) {
      return this.createMockVoiceResponse(validatedCall);
    }

    try {
      const twilioCall = await this.client.calls.create({
        to: validatedCall.to,
        from: validatedCall.from,
        url: validatedCall.url,
        method: validatedCall.method || 'POST',
        fallbackUrl: validatedCall.fallbackUrl,
        statusCallback: validatedCall.statusCallback,
        timeout: validatedCall.timeout,
        machineDetection: validatedCall.machineDetection ? 'Enable' : undefined,
      });

      return {
        sid: twilioCall.sid,
        status: twilioCall.status,
        to: twilioCall.to,
        from: twilioCall.from,
        duration: twilioCall.duration ? parseInt(twilioCall.duration) : undefined,
        price: twilioCall.price || undefined,
      };
    } catch (error) {
      console.error('Twilio voice call error:', error);
      throw new Error(`Failed to make call: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get message status
   */
  async getMessageStatus(messageSid: string): Promise<{ status: string; errorCode?: string; errorMessage?: string }> {
    if (!this.accountSid || !this.authToken) {
      return { status: 'delivered' }; // Mock response
    }

    try {
      const message = await this.client.messages(messageSid).fetch();
      return {
        status: message.status,
        errorCode: message.errorCode?.toString() || undefined,
        errorMessage: message.errorMessage || undefined,
      };
    } catch (error) {
      console.error('Twilio message status error:', error);
      throw new Error(`Failed to get message status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get call status
   */
  async getCallStatus(callSid: string): Promise<{ status: string; duration?: number; price?: string }> {
    if (!this.accountSid || !this.authToken) {
      return { status: 'completed', duration: 30 }; // Mock response
    }

    try {
      const call = await this.client.calls(callSid).fetch();
      return {
        status: call.status,
        duration: call.duration ? parseInt(call.duration) : undefined,
        price: call.price || undefined,
      };
    } catch (error) {
      console.error('Twilio call status error:', error);
      throw new Error(`Failed to get call status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate phone number
   */
  async validatePhoneNumber(phoneNumber: string): Promise<{ isValid: boolean; formattedNumber?: string; carrier?: string }> {
    if (!this.accountSid || !this.authToken) {
      return { isValid: true, formattedNumber: phoneNumber }; // Mock response
    }

    try {
      const lookup = await this.client.lookups.v2.phoneNumbers(phoneNumber).fetch();
      return {
        isValid: lookup.valid || false,
        formattedNumber: lookup.phoneNumber || undefined,
        carrier: 'N/A', // Carrier info requires additional Twilio add-on
      };
    } catch (error) {
      console.error('Twilio phone validation error:', error);
      return { isValid: false };
    }
  }

  /**
   * Create mock SMS response for development
   */
  private createMockSMSResponse(message: SMSMessage): SMSResponse {
    return {
      sid: `mock_sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'delivered',
      to: message.to,
      from: message.from || this.defaultFromNumber,
      body: message.body,
      dateSent: new Date(),
      price: '$0.0075',
    };
  }

  /**
   * Create mock voice response for development
   */
  private createMockVoiceResponse(call: VoiceCall): VoiceResponse {
    return {
      sid: `mock_call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'completed',
      to: call.to,
      from: call.from,
      duration: 30,
      price: '$0.02',
    };
  }

  /**
   * Check if Twilio is properly configured
   */
  isConfigured(): boolean {
    return !!(this.accountSid && this.authToken);
  }

  /**
   * Get account information
   */
  async getAccountInfo(): Promise<{ sid: string; friendlyName: string; status: string }> {
    if (!this.accountSid || !this.authToken) {
      return { sid: 'mock_account', friendlyName: 'Mock Account', status: 'active' };
    }

    try {
      const account = await this.client.api.accounts(this.accountSid).fetch();
      return {
        sid: account.sid,
        friendlyName: account.friendlyName,
        status: account.status,
      };
    } catch (error) {
      console.error('Twilio account info error:', error);
      throw new Error(`Failed to get account info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const twilioClient = new TwilioClient();