import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '../../db';
import { communicationMessages } from '../../db/schema';

// Types for webhook events
export interface TwilioWebhookEvent {
  MessageSid: string;
  MessageStatus: string;
  To: string;
  From: string;
  Body?: string;
  MessageDirection: 'inbound' | 'outbound';
  ErrorCode?: string;
  ErrorMessage?: string;
  DateSent?: string;
  DateReceived?: string;
}

export interface SendGridWebhookEvent {
  email: string;
  timestamp: number;
  event: 'delivered' | 'open' | 'click' | 'bounce' | 'dropped' | 'spam_report' | 'unsubscribe';
  'smtp-id': string;
  sg_event_id: string;
  sg_message_id: string;
  reason?: string;
  status?: string;
  url?: string;
  useragent?: string;
}

export interface ZoomWebhookEvent {
  event: string;
  payload: {
    account_id: string;
    object: {
      uuid: string;
      id: string;
      host_id: string;
      topic: string;
      type: number;
      start_time: string;
      duration: number;
      timezone: string;
    };
  };
}

// Validation schemas
const twilioWebhookSchema = z.object({
  MessageSid: z.string(),
  MessageStatus: z.string(),
  To: z.string(),
  From: z.string(),
  Body: z.string().optional(),
  MessageDirection: z.enum(['inbound', 'outbound']),
  ErrorCode: z.string().optional(),
  ErrorMessage: z.string().optional(),
  DateSent: z.string().optional(),
  DateReceived: z.string().optional(),
});

const sendGridWebhookSchema = z.object({
  email: z.string().email(),
  timestamp: z.number(),
  event: z.enum(['delivered', 'open', 'click', 'bounce', 'dropped', 'spam_report', 'unsubscribe']),
  'smtp-id': z.string(),
  sg_event_id: z.string(),
  sg_message_id: z.string(),
  reason: z.string().optional(),
  status: z.string().optional(),
  url: z.string().optional(),
  useragent: z.string().optional(),
});

const zoomWebhookSchema = z.object({
  event: z.string(),
  payload: z.object({
    account_id: z.string(),
    object: z.object({
      uuid: z.string(),
      id: z.string(),
      host_id: z.string(),
      topic: z.string(),
      type: z.number(),
      start_time: z.string(),
      duration: z.number(),
      timezone: z.string(),
    }),
  }),
});

/**
 * Webhook Handlers - Process events from communication providers
 * 
 * This module handles incoming webhooks from Twilio, SendGrid, and Zoom,
 * processing communication events and updating the database accordingly.
 */
export class WebhookHandlers {
  /**
   * Handle Twilio SMS/Voice webhooks
   */
  static async handleTwilioWebhook(request: NextRequest): Promise<NextResponse> {
    try {
      // Parse the form data from Twilio
      const formData = await request.formData();
      const webhookData: Record<string, string> = {};
      
      for (const [key, value] of formData.entries()) {
        webhookData[key] = value.toString();
      }

      // Validate webhook data
      const validatedData = twilioWebhookSchema.parse(webhookData);

      // Process the webhook event
      await this.processTwilioEvent(validatedData);

      return new NextResponse('OK', { status: 200 });
    } catch (error) {
      console.error('Twilio webhook error:', error);
      return new NextResponse('Bad Request', { status: 400 });
    }
  }

  /**
   * Handle SendGrid email webhooks
   */
  static async handleSendGridWebhook(request: NextRequest): Promise<NextResponse> {
    try {
      const events: SendGridWebhookEvent[] = await request.json();

      // Process each event
      for (const event of events) {
        const validatedEvent = sendGridWebhookSchema.parse(event);
        await this.processSendGridEvent(validatedEvent);
      }

      return new NextResponse('OK', { status: 200 });
    } catch (error) {
      console.error('SendGrid webhook error:', error);
      return new NextResponse('Bad Request', { status: 400 });
    }
  }

  /**
   * Handle Zoom meeting webhooks
   */
  static async handleZoomWebhook(request: NextRequest): Promise<NextResponse> {
    try {
      const webhookData = await request.json();
      const validatedData = zoomWebhookSchema.parse(webhookData);

      // Process the webhook event
      await this.processZoomEvent(validatedData);

      return new NextResponse('OK', { status: 200 });
    } catch (error) {
      console.error('Zoom webhook error:', error);
      return new NextResponse('Bad Request', { status: 400 });
    }
  }

  /**
   * Process Twilio webhook events
   */
  private static async processTwilioEvent(event: TwilioWebhookEvent): Promise<void> {
    try {
      // Handle inbound messages
      if (event.MessageDirection === 'inbound' && event.Body) {
        await this.createInboundMessage({
          externalId: event.MessageSid,
          type: 'sms',
          direction: 'inbound',
          from: event.From,
          to: event.To,
          content: event.Body,
          status: 'received',
          receivedAt: event.DateReceived ? new Date(event.DateReceived) : new Date(),
        });
      }

      // Handle status updates for outbound messages
      if (event.MessageDirection === 'outbound') {
        await this.updateMessageStatus({
          externalId: event.MessageSid,
          status: event.MessageStatus,
          errorCode: event.ErrorCode,
          errorMessage: event.ErrorMessage,
          deliveredAt: event.DateSent ? new Date(event.DateSent) : undefined,
        });
      }
    } catch (error) {
      console.error('Error processing Twilio event:', error);
    }
  }

  /**
   * Process SendGrid webhook events
   */
  private static async processSendGridEvent(event: SendGridWebhookEvent): Promise<void> {
    try {
      const eventData = {
        externalId: event.sg_message_id,
        status: this.mapSendGridEventToStatus(event.event),
        eventType: event.event,
        timestamp: new Date(event.timestamp * 1000),
        reason: event.reason,
        url: event.url,
        userAgent: event.useragent,
      };

      await this.updateEmailStatus(eventData);
    } catch (error) {
      console.error('Error processing SendGrid event:', error);
    }
  }

  /**
   * Process Zoom webhook events
   */
  private static async processZoomEvent(event: ZoomWebhookEvent): Promise<void> {
    try {
      switch (event.event) {
        case 'meeting.started':
          await this.handleMeetingStarted(event.payload);
          break;
        case 'meeting.ended':
          await this.handleMeetingEnded(event.payload);
          break;
        case 'meeting.participant_joined':
          await this.handleParticipantJoined(event.payload);
          break;
        case 'meeting.participant_left':
          await this.handleParticipantLeft(event.payload);
          break;
        default:
          console.log(`Unhandled Zoom event: ${event.event}`);
      }
    } catch (error) {
      console.error('Error processing Zoom event:', error);
    }
  }

  /**
   * Create inbound message record
   */
  private static async createInboundMessage(messageData: {
    externalId: string;
    type: string;
    direction: string;
    from: string;
    to: string;
    content: string;
    status: string;
    receivedAt: Date;
  }): Promise<void> {
    try {
      // In a real implementation, you would need to determine the business ID
      // based on the phone number or other identifier
      const businessId = await this.getBusinessIdFromPhoneNumber(messageData.to);
      
      if (!businessId) {
        console.warn(`No business found for phone number: ${messageData.to}`);
        return;
      }

      await db.insert(communicationMessages).values({
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        businessId,
        customerId: await this.getCustomerIdFromPhoneNumber(messageData.from, businessId),
        type: messageData.type,
        direction: messageData.direction,
        subject: '', // SMS messages don't have subjects
        content: messageData.content,
        status: messageData.status,
        externalId: messageData.externalId,
        metadata: {
          from: messageData.from,
          to: messageData.to,
          receivedAt: messageData.receivedAt.toISOString(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`Inbound ${messageData.type} message created: ${messageData.externalId}`);
    } catch (error) {
      console.error('Error creating inbound message:', error);
    }
  }

  /**
   * Update message status
   */
  private static async updateMessageStatus(statusData: {
    externalId: string;
    status: string;
    errorCode?: string;
    errorMessage?: string;
    deliveredAt?: Date;
  }): Promise<void> {
    try {
      const updateData: any = {
        status: statusData.status,
        updatedAt: new Date(),
      };

      if (statusData.errorCode || statusData.errorMessage) {
        updateData.metadata = {
          errorCode: statusData.errorCode,
          errorMessage: statusData.errorMessage,
        };
      }

      if (statusData.deliveredAt) {
        updateData.deliveredAt = statusData.deliveredAt;
      }

      // Update the message in the database
      // Note: This is a simplified implementation - you'd need proper update logic
      console.log(`Message status updated: ${statusData.externalId} -> ${statusData.status}`);
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  }

  /**
   * Update email status
   */
  private static async updateEmailStatus(eventData: {
    externalId: string;
    status: string;
    eventType: string;
    timestamp: Date;
    reason?: string;
    url?: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      // Update email status in database
      // Note: This is a simplified implementation
      console.log(`Email event processed: ${eventData.externalId} -> ${eventData.eventType}`);
    } catch (error) {
      console.error('Error updating email status:', error);
    }
  }

  /**
   * Handle meeting started event
   */
  private static async handleMeetingStarted(payload: any): Promise<void> {
    console.log(`Zoom meeting started: ${payload.object.topic} (${payload.object.uuid})`);
    // Implement meeting started logic
  }

  /**
   * Handle meeting ended event
   */
  private static async handleMeetingEnded(payload: any): Promise<void> {
    console.log(`Zoom meeting ended: ${payload.object.topic} (${payload.object.uuid})`);
    // Implement meeting ended logic
  }

  /**
   * Handle participant joined event
   */
  private static async handleParticipantJoined(payload: any): Promise<void> {
    console.log(`Participant joined meeting: ${payload.object.uuid}`);
    // Implement participant joined logic
  }

  /**
   * Handle participant left event
   */
  private static async handleParticipantLeft(payload: any): Promise<void> {
    console.log(`Participant left meeting: ${payload.object.uuid}`);
    // Implement participant left logic
  }

  /**
   * Get business ID from phone number
   */
  private static async getBusinessIdFromPhoneNumber(phoneNumber: string): Promise<string | null> {
    // In a real implementation, you would query the database to find
    // which business owns this phone number
    // For now, return a mock business ID
    return 'mock_business_id';
  }

  /**
   * Get customer ID from phone number
   */
  private static async getCustomerIdFromPhoneNumber(phoneNumber: string, businessId: string): Promise<string | null> {
    // In a real implementation, you would query the database to find
    // the customer with this phone number for the given business
    // For now, return a mock customer ID
    return 'mock_customer_id';
  }

  /**
   * Map SendGrid event types to internal status
   */
  private static mapSendGridEventToStatus(event: string): string {
    switch (event) {
      case 'delivered':
        return 'delivered';
      case 'open':
        return 'opened';
      case 'click':
        return 'clicked';
      case 'bounce':
        return 'bounced';
      case 'dropped':
        return 'failed';
      case 'spam_report':
        return 'spam';
      case 'unsubscribe':
        return 'unsubscribed';
      default:
        return 'unknown';
    }
  }

  /**
   * Verify webhook signature (for production)
   */
  static verifyTwilioSignature(signature: string, url: string, params: Record<string, string>): boolean {
    // In production, implement proper Twilio signature verification
    // For now, return true for development
    console.log('Twilio signature verification (mock):', signature);
    return true;
  }

  /**
   * Verify SendGrid webhook signature (for production)
   */
  static verifySendGridSignature(signature: string, timestamp: string, payload: string): boolean {
    // In production, implement proper SendGrid signature verification
    // For now, return true for development
    console.log('SendGrid signature verification (mock):', signature);
    return true;
  }

  /**
   * Verify Zoom webhook signature (for production)
   */
  static verifyZoomSignature(signature: string, timestamp: string, payload: string): boolean {
    // In production, implement proper Zoom signature verification
    // For now, return true for development
    console.log('Zoom signature verification (mock):', signature);
    return true;
  }
}

// Utility functions for webhook handling
export const webhookUtils = {
  /**
   * Parse Twilio webhook data from form
   */
  parseTwilioFormData: (formData: FormData): Record<string, string> => {
    const data: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      data[key] = value.toString();
    }
    return data;
  },

  /**
   * Validate webhook timestamp
   */
  isValidTimestamp: (timestamp: number, toleranceSeconds: number = 300): boolean => {
    const now = Math.floor(Date.now() / 1000);
    const diff = Math.abs(now - timestamp);
    return diff <= toleranceSeconds;
  },

  /**
   * Format phone number for storage
   */
  formatPhoneNumber: (phoneNumber: string): string => {
    // Remove all non-digit characters and add +1 if needed
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    }
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    }
    return phoneNumber; // Return as-is if format is unclear
  },

  /**
   * Extract business context from webhook data
   */
  extractBusinessContext: (webhookData: any): { businessId?: string; customerId?: string } => {
    // In a real implementation, extract business and customer IDs
    // from the webhook data based on phone numbers, email addresses, etc.
    return {
      businessId: 'mock_business_id',
      customerId: 'mock_customer_id',
    };
  },
};