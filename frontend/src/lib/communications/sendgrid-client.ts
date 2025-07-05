import sgMail from '@sendgrid/mail';
import { z } from 'zod';

// Types for SendGrid operations
export interface EmailMessage {
  to: string | string[];
  from?: string;
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, unknown>;
  attachments?: EmailAttachment[];
  categories?: string[];
  customArgs?: Record<string, string>;
}

export interface EmailAttachment {
  content: string; // Base64 encoded content
  filename: string;
  type?: string;
  disposition?: 'attachment' | 'inline';
  contentId?: string;
}

export interface EmailResponse {
  messageId: string;
  status: 'sent' | 'failed';
  to: string[];
  from: string;
  subject: string;
  sentAt: Date;
  errorMessage?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  dynamicFields: string[];
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  templateId: string;
  recipients: string[];
  scheduledAt?: Date;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
}

// Validation schemas
const emailMessageSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  from: z.string().email().optional(),
  subject: z.string().min(1, 'Subject is required'),
  text: z.string().optional(),
  html: z.string().optional(),
  templateId: z.string().optional(),
  dynamicTemplateData: z.record(z.unknown()).optional(),
  attachments: z.array(z.object({
    content: z.string(),
    filename: z.string(),
    type: z.string().optional(),
    disposition: z.enum(['attachment', 'inline']).optional(),
    contentId: z.string().optional(),
  })).optional(),
  categories: z.array(z.string()).optional(),
  customArgs: z.record(z.string()).optional(),
}).refine(data => data.text || data.html || data.templateId, {
  message: 'Either text, html, or templateId must be provided',
});

const emailTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  subject: z.string(),
  content: z.string(),
  dynamicFields: z.array(z.string()),
});

const emailCampaignSchema = z.object({
  id: z.string(),
  name: z.string(),
  subject: z.string(),
  templateId: z.string(),
  recipients: z.array(z.string().email()),
  scheduledAt: z.date().optional(),
  status: z.enum(['draft', 'scheduled', 'sent', 'failed']),
});

/**
 * SendGrid Client - Handles email communication
 * 
 * This client provides a unified interface for sending emails, managing templates,
 * and running email campaigns through SendGrid's API. It includes comprehensive
 * error handling, validation, and template management.
 */
export class SendGridClient {
  private apiKey: string;
  private defaultFromEmail: string;
  private defaultFromName: string;
  private templates: Map<string, EmailTemplate> = new Map();
  private campaigns: Map<string, EmailCampaign> = new Map();

  constructor() {
    this.apiKey = process.env.SENDGRID_API_KEY || '';
    this.defaultFromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com';
    this.defaultFromName = process.env.SENDGRID_FROM_NAME || 'Your Business';

    if (!this.apiKey) {
      console.warn('SendGrid API key not found. Email features will be disabled.');
    } else {
      sgMail.setApiKey(this.apiKey);
    }

    // Initialize with default templates
    this.initializeDefaultTemplates();
  }

  /**
   * Send single email
   */
  async sendEmail(message: EmailMessage): Promise<EmailResponse> {
    const validatedMessage = emailMessageSchema.parse(message);

    // If no API key, return mock response
    if (!this.apiKey) {
      return this.createMockEmailResponse(validatedMessage);
    }

    try {
      const emailData = {
        to: Array.isArray(validatedMessage.to) ? validatedMessage.to : [validatedMessage.to],
        from: {
          email: validatedMessage.from || this.defaultFromEmail,
          name: this.defaultFromName,
        },
        subject: validatedMessage.subject,
        text: validatedMessage.text,
        html: validatedMessage.html,
        templateId: validatedMessage.templateId,
        dynamicTemplateData: validatedMessage.dynamicTemplateData,
        attachments: validatedMessage.attachments,
        categories: validatedMessage.categories,
        customArgs: validatedMessage.customArgs,
      };

      const response = await sgMail.send(emailData);
      
      return {
        messageId: response[0].headers['x-message-id'] || `email_${Date.now()}`,
        status: 'sent',
        to: Array.isArray(validatedMessage.to) ? validatedMessage.to : [validatedMessage.to],
        from: validatedMessage.from || this.defaultFromEmail,
        subject: validatedMessage.subject,
        sentAt: new Date(),
      };
    } catch (error) {
      console.error('SendGrid email error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        messageId: `error_${Date.now()}`,
        status: 'failed',
        to: Array.isArray(validatedMessage.to) ? validatedMessage.to : [validatedMessage.to],
        from: validatedMessage.from || this.defaultFromEmail,
        subject: validatedMessage.subject,
        sentAt: new Date(),
        errorMessage,
      };
    }
  }

  /**
   * Send bulk emails
   */
  async sendBulkEmails(messages: EmailMessage[]): Promise<EmailResponse[]> {
    const responses = await Promise.allSettled(
      messages.map(message => this.sendEmail(message))
    );

    return responses.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        const message = messages[index];
        const to = Array.isArray(message.to) ? message.to : [message.to];
        return {
          messageId: `error_${Date.now()}_${index}`,
          status: 'failed' as const,
          to,
          from: message.from || this.defaultFromEmail,
          subject: message.subject,
          sentAt: new Date(),
          errorMessage: result.reason instanceof Error ? result.reason.message : 'Unknown error',
        };
      }
    });
  }

  /**
   * Send email using template
   */
  async sendTemplateEmail(
    templateId: string,
    to: string | string[],
    dynamicData: Record<string, unknown> = {}
  ): Promise<EmailResponse> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    return this.sendEmail({
      to,
      subject: template.subject,
      templateId,
      dynamicTemplateData: dynamicData,
    });
  }

  /**
   * Create email template
   */
  async createTemplate(template: EmailTemplate): Promise<void> {
    const validatedTemplate = emailTemplateSchema.parse(template);
    this.templates.set(validatedTemplate.id, validatedTemplate);
    
    console.log(`Email template created: ${validatedTemplate.name} (${validatedTemplate.id})`);
  }

  /**
   * Get email template
   */
  getTemplate(templateId: string): EmailTemplate | undefined {
    return this.templates.get(templateId);
  }

  /**
   * Get all templates
   */
  getAllTemplates(): EmailTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Delete email template
   */
  deleteTemplate(templateId: string): boolean {
    return this.templates.delete(templateId);
  }

  /**
   * Create email campaign
   */
  async createCampaign(campaign: EmailCampaign): Promise<void> {
    const validatedCampaign = emailCampaignSchema.parse(campaign);
    this.campaigns.set(validatedCampaign.id, validatedCampaign);
    
    console.log(`Email campaign created: ${validatedCampaign.name} (${validatedCampaign.id})`);
  }

  /**
   * Send email campaign
   */
  async sendCampaign(campaignId: string): Promise<EmailResponse[]> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      throw new Error(`Campaign not found: ${campaignId}`);
    }

    const template = this.templates.get(campaign.templateId);
    if (!template) {
      throw new Error(`Template not found for campaign: ${campaign.templateId}`);
    }

    // Send to all recipients
    const emailPromises = campaign.recipients.map(recipient => 
      this.sendEmail({
        to: recipient,
        subject: campaign.subject,
        templateId: campaign.templateId,
        categories: ['campaign', campaignId],
        customArgs: {
          campaign_id: campaignId,
          campaign_name: campaign.name,
        },
      })
    );

    const responses = await Promise.allSettled(emailPromises);
    
    // Update campaign status
    campaign.status = responses.every(r => r.status === 'fulfilled') ? 'sent' : 'failed';
    
    return responses.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          messageId: `campaign_error_${Date.now()}_${index}`,
          status: 'failed' as const,
          to: [campaign.recipients[index]],
          from: this.defaultFromEmail,
          subject: campaign.subject,
          sentAt: new Date(),
          errorMessage: result.reason instanceof Error ? result.reason.message : 'Unknown error',
        };
      }
    });
  }

  /**
   * Get campaign status
   */
  getCampaign(campaignId: string): EmailCampaign | undefined {
    return this.campaigns.get(campaignId);
  }

  /**
   * Get all campaigns
   */
  getAllCampaigns(): EmailCampaign[] {
    return Array.from(this.campaigns.values());
  }

  /**
   * Validate email address
   */
  validateEmailAddress(email: string): { isValid: boolean; reason?: string } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      return { isValid: false, reason: 'Email address is required' };
    }
    
    if (!emailRegex.test(email)) {
      return { isValid: false, reason: 'Invalid email format' };
    }
    
    if (email.length > 254) {
      return { isValid: false, reason: 'Email address too long' };
    }
    
    return { isValid: true };
  }

  /**
   * Create mock email response for development
   */
  private createMockEmailResponse(message: EmailMessage): EmailResponse {
    return {
      messageId: `mock_email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'sent',
      to: Array.isArray(message.to) ? message.to : [message.to],
      from: message.from || this.defaultFromEmail,
      subject: message.subject,
      sentAt: new Date(),
    };
  }

  /**
   * Initialize default email templates
   */
  private initializeDefaultTemplates(): void {
    // Welcome email template
    this.templates.set('welcome', {
      id: 'welcome',
      name: 'Welcome Email',
      subject: 'Welcome to {{businessName}}!',
      content: `
        <h1>Welcome {{customerName}}!</h1>
        <p>Thank you for choosing {{businessName}}. We're excited to work with you.</p>
        <p>Your appointment is scheduled for {{appointmentDate}} at {{appointmentTime}}.</p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
        <p>Best regards,<br>{{businessName}} Team</p>
      `,
      dynamicFields: ['customerName', 'businessName', 'appointmentDate', 'appointmentTime'],
    });

    // Thank you email template
    this.templates.set('thank_you', {
      id: 'thank_you',
      name: 'Thank You Email',
      subject: 'Thank you for your business!',
      content: `
        <h1>Thank You {{customerName}}!</h1>
        <p>We hope you're satisfied with our {{serviceType}} service.</p>
        <p>Service completed on: {{completionDate}}</p>
        <p>Total amount: {{totalAmount}}</p>
        <p>We'd love to hear your feedback about our service.</p>
        <p>Best regards,<br>{{businessName}} Team</p>
      `,
      dynamicFields: ['customerName', 'serviceType', 'completionDate', 'totalAmount', 'businessName'],
    });

    // Review request template
    this.templates.set('review_request', {
      id: 'review_request',
      name: 'Review Request Email',
      subject: 'How was your experience with {{businessName}}?',
      content: `
        <h1>Hi {{customerName}}!</h1>
        <p>We hope you're happy with the {{serviceType}} service we provided.</p>
        <p>Would you mind taking a moment to leave us a review? Your feedback helps us improve and helps other customers find us.</p>
        <p><a href="{{reviewUrl}}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Leave a Review</a></p>
        <p>Thank you for your time and for choosing {{businessName}}.</p>
        <p>Best regards,<br>{{businessName}} Team</p>
      `,
      dynamicFields: ['customerName', 'serviceType', 'reviewUrl', 'businessName'],
    });

    // Appointment reminder template
    this.templates.set('appointment_reminder', {
      id: 'appointment_reminder',
      name: 'Appointment Reminder',
      subject: 'Reminder: Your appointment with {{businessName}}',
      content: `
        <h1>Appointment Reminder</h1>
        <p>Hi {{customerName}},</p>
        <p>This is a friendly reminder about your upcoming appointment:</p>
        <ul>
          <li><strong>Service:</strong> {{serviceType}}</li>
          <li><strong>Date:</strong> {{appointmentDate}}</li>
          <li><strong>Time:</strong> {{appointmentTime}}</li>
          <li><strong>Location:</strong> {{businessAddress}}</li>
        </ul>
        <p>If you need to reschedule or cancel, please contact us at {{businessPhone}}.</p>
        <p>We look forward to seeing you!</p>
        <p>Best regards,<br>{{businessName}} Team</p>
      `,
      dynamicFields: ['customerName', 'serviceType', 'appointmentDate', 'appointmentTime', 'businessAddress', 'businessPhone', 'businessName'],
    });

    // Invoice email template
    this.templates.set('invoice', {
      id: 'invoice',
      name: 'Invoice Email',
      subject: 'Invoice #{{invoiceNumber}} from {{businessName}}',
      content: `
        <h1>Invoice #{{invoiceNumber}}</h1>
        <p>Hi {{customerName}},</p>
        <p>Thank you for your business! Please find your invoice details below:</p>
        <ul>
          <li><strong>Invoice Number:</strong> {{invoiceNumber}}</li>
          <li><strong>Service Date:</strong> {{serviceDate}}</li>
          <li><strong>Amount Due:</strong> {{totalAmount}}</li>
          <li><strong>Due Date:</strong> {{dueDate}}</li>
        </ul>
        <p>You can pay online at: <a href="{{paymentUrl}}">{{paymentUrl}}</a></p>
        <p>If you have any questions about this invoice, please contact us.</p>
        <p>Best regards,<br>{{businessName}} Team</p>
      `,
      dynamicFields: ['customerName', 'invoiceNumber', 'serviceDate', 'totalAmount', 'dueDate', 'paymentUrl', 'businessName'],
    });
  }

  /**
   * Check if SendGrid is properly configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Get configuration status
   */
  getConfigurationStatus(): { 
    configured: boolean; 
    apiKey: boolean; 
    fromEmail: boolean; 
    fromName: boolean; 
  } {
    return {
      configured: this.isConfigured(),
      apiKey: !!this.apiKey,
      fromEmail: !!this.defaultFromEmail,
      fromName: !!this.defaultFromName,
    };
  }
}

// Export singleton instance
export const sendGridClient = new SendGridClient();