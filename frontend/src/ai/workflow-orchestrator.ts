import { z } from 'zod';
import { contextEngine, BusinessContext } from './context-engine';
import { db } from '../db';
import { users, customers, communicationMessages, calendarEvents, invoices } from '../db/schema';
import { eq, and, desc, sql, gt } from 'drizzle-orm';

// Types for workflow automation
export interface WorkflowTrigger {
  id: string;
  type: 'time_based' | 'event_based' | 'condition_based' | 'manual';
  name: string;
  description: string;
  conditions: WorkflowCondition[];
  schedule?: WorkflowSchedule;
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'exists' | 'not_exists';
  value: string | number | boolean | null;
  dataSource: 'customer' | 'event' | 'invoice' | 'communication' | 'business';
}

export interface WorkflowSchedule {
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  time?: string; // HH:MM format
  dayOfWeek?: number; // 0-6, Sunday=0
  dayOfMonth?: number; // 1-31
  timezone: string;
}

export interface WorkflowAction {
  id: string;
  type: 'send_email' | 'send_sms' | 'create_event' | 'update_customer' | 'create_invoice' | 'ai_analyze' | 'webhook' | 'delay';
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  retryConfig?: WorkflowRetryConfig;
}

export interface WorkflowRetryConfig {
  maxRetries: number;
  retryDelay: number; // milliseconds
  backoffMultiplier: number;
}

export interface WorkflowDefinition {
  id: string;
  businessId: string;
  name: string;
  description: string;
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
  isActive: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  businessId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  triggeredBy: string;
  triggeredAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  context: Record<string, unknown>;
  actionResults: WorkflowActionResult[];
}

export interface WorkflowActionResult {
  actionId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startedAt?: Date;
  completedAt?: Date;
  result?: Record<string, unknown>;
  error?: string;
  retryCount: number;
}

export interface WorkflowExecutionRequest {
  workflowId: string;
  businessId: string;
  triggeredBy: string;
  context?: Record<string, unknown>;
}

// Validation schemas
const workflowTriggerSchema = z.object({
  id: z.string(),
  type: z.enum(['time_based', 'event_based', 'condition_based', 'manual']),
  name: z.string(),
  description: z.string(),
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.enum(['equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'not_contains', 'exists', 'not_exists']),
    value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
    dataSource: z.enum(['customer', 'event', 'invoice', 'communication', 'business']),
  })),
  schedule: z.object({
    frequency: z.enum(['once', 'daily', 'weekly', 'monthly', 'yearly']),
    time: z.string().optional(),
    dayOfWeek: z.number().min(0).max(6).optional(),
    dayOfMonth: z.number().min(1).max(31).optional(),
    timezone: z.string(),
  }).optional(),
});

const workflowActionSchema = z.object({
  id: z.string(),
  type: z.enum(['send_email', 'send_sms', 'create_event', 'update_customer', 'create_invoice', 'ai_analyze', 'webhook', 'delay']),
  name: z.string(),
  description: z.string(),
  parameters: z.record(z.unknown()),
  retryConfig: z.object({
    maxRetries: z.number(),
    retryDelay: z.number(),
    backoffMultiplier: z.number(),
  }).optional(),
});

const workflowDefinitionSchema = z.object({
  id: z.string(),
  businessId: z.string(),
  name: z.string(),
  description: z.string(),
  trigger: workflowTriggerSchema,
  actions: z.array(workflowActionSchema),
  isActive: z.boolean(),
  version: z.number(),
  tags: z.array(z.string()),
});

const workflowExecutionRequestSchema = z.object({
  workflowId: z.string(),
  businessId: z.string(),
  triggeredBy: z.string(),
  context: z.record(z.unknown()).optional(),
});

/**
 * Workflow Orchestrator - Automates business processes and workflows
 * 
 * This system takes business context from the Context Engine and orchestrates
 * complex, multi-step workflows automatically. It can handle everything from
 * simple email sequences to complex business process automation.
 */
export class WorkflowOrchestrator {
  private workflows: Map<string, WorkflowDefinition> = new Map();
  private executionQueue: WorkflowExecution[] = [];
  private activeExecutions: Map<string, WorkflowExecution> = new Map();
  private maxConcurrentExecutions = 10;

  constructor() {
    // Initialize with default workflow templates
    this.initializeDefaultWorkflows();
    
    // Start the execution processor
    this.startExecutionProcessor();
  }

  /**
   * Register a new workflow definition
   */
  async registerWorkflow(workflow: WorkflowDefinition): Promise<void> {
    const validatedWorkflow = workflowDefinitionSchema.parse(workflow);
    this.workflows.set(validatedWorkflow.id, validatedWorkflow);
    
    console.log(`Workflow registered: ${validatedWorkflow.name} (${validatedWorkflow.id})`);
  }

  /**
   * Execute a workflow immediately
   */
  async executeWorkflow(request: WorkflowExecutionRequest): Promise<string> {
    const validatedRequest = workflowExecutionRequestSchema.parse(request);
    
    const workflow = this.workflows.get(validatedRequest.workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${validatedRequest.workflowId}`);
    }

    if (!workflow.isActive) {
      throw new Error(`Workflow is inactive: ${validatedRequest.workflowId}`);
    }

    // Create execution record
    const execution: WorkflowExecution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workflowId: workflow.id,
      businessId: validatedRequest.businessId,
      status: 'pending',
      triggeredBy: validatedRequest.triggeredBy,
      triggeredAt: new Date(),
      context: validatedRequest.context || {},
      actionResults: workflow.actions.map(action => ({
        actionId: action.id,
        status: 'pending',
        retryCount: 0,
      })),
    };

    // Add to execution queue
    this.executionQueue.push(execution);
    
    console.log(`Workflow execution queued: ${execution.id} for workflow ${workflow.name}`);
    
    return execution.id;
  }

  /**
   * Check if workflow trigger conditions are met
   */
  async evaluateTrigger(
    trigger: WorkflowTrigger,
    businessId: string,
    context: Record<string, unknown> = {}
  ): Promise<boolean> {
    if (trigger.type === 'manual') {
      return true; // Manual triggers are always valid when explicitly called
    }

    // Get current business context
    const businessContext = await contextEngine.processQuery({
      businessId,
      queryType: 'business_analysis',
      query: 'Get current business state for workflow evaluation',
    });

    // Evaluate each condition
    for (const condition of trigger.conditions) {
      const isConditionMet = await this.evaluateCondition(condition, businessContext, context);
      if (!isConditionMet) {
        return false;
      }
    }

    return true;
  }

  /**
   * Evaluate a single workflow condition
   */
  private async evaluateCondition(
    condition: WorkflowCondition,
    businessContext: any,
    executionContext: Record<string, unknown>
  ): Promise<boolean> {
    let actualValue: unknown;

    // Get the actual value based on data source
    switch (condition.dataSource) {
      case 'customer':
        actualValue = await this.getCustomerValue(condition.field, businessContext.businessId);
        break;
      case 'event':
        actualValue = await this.getEventValue(condition.field, businessContext.businessId);
        break;
      case 'invoice':
        actualValue = await this.getInvoiceValue(condition.field, businessContext.businessId);
        break;
      case 'communication':
        actualValue = await this.getCommunicationValue(condition.field, businessContext.businessId);
        break;
      case 'business':
        actualValue = this.getBusinessValue(condition.field, businessContext);
        break;
      default:
        actualValue = executionContext[condition.field];
    }

    // Evaluate the condition
    return this.compareValues(actualValue, condition.operator, condition.value);
  }

  /**
   * Compare values based on operator
   */
  private compareValues(actual: unknown, operator: string, expected: unknown): boolean {
    switch (operator) {
      case 'equals':
        return actual === expected;
      case 'not_equals':
        return actual !== expected;
      case 'greater_than':
        return Number(actual) > Number(expected);
      case 'less_than':
        return Number(actual) < Number(expected);
      case 'contains':
        return String(actual).includes(String(expected));
      case 'not_contains':
        return !String(actual).includes(String(expected));
      case 'exists':
        return actual !== null && actual !== undefined;
      case 'not_exists':
        return actual === null || actual === undefined;
      default:
        return false;
    }
  }

  /**
   * Execute a single workflow action
   */
  private async executeAction(
    action: WorkflowAction,
    execution: WorkflowExecution,
    businessContext: BusinessContext
  ): Promise<WorkflowActionResult> {
    const actionResult: WorkflowActionResult = {
      actionId: action.id,
      status: 'running',
      startedAt: new Date(),
      retryCount: 0,
    };

    try {
      let result: Record<string, unknown> = {};

      switch (action.type) {
        case 'send_email':
          result = await this.executeSendEmailAction(action, execution, businessContext);
          break;
        case 'send_sms':
          result = await this.executeSendSmsAction(action, execution, businessContext);
          break;
        case 'create_event':
          result = await this.executeCreateEventAction(action, execution, businessContext);
          break;
        case 'update_customer':
          result = await this.executeUpdateCustomerAction(action, execution, businessContext);
          break;
        case 'create_invoice':
          result = await this.executeCreateInvoiceAction(action, execution, businessContext);
          break;
        case 'ai_analyze':
          result = await this.executeAiAnalyzeAction(action, execution, businessContext);
          break;
        case 'webhook':
          result = await this.executeWebhookAction(action, execution, businessContext);
          break;
        case 'delay':
          result = await this.executeDelayAction(action, execution, businessContext);
          break;
        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }

      actionResult.status = 'completed';
      actionResult.completedAt = new Date();
      actionResult.result = result;

    } catch (error) {
      actionResult.status = 'failed';
      actionResult.completedAt = new Date();
      actionResult.error = error instanceof Error ? error.message : String(error);

      // Handle retries if configured
      if (action.retryConfig && actionResult.retryCount < action.retryConfig.maxRetries) {
        actionResult.retryCount++;
        actionResult.status = 'pending';
        
        // Schedule retry with backoff
        const delay = action.retryConfig.retryDelay * Math.pow(action.retryConfig.backoffMultiplier, actionResult.retryCount - 1);
        setTimeout(() => {
          this.executeAction(action, execution, businessContext);
        }, delay);
      }
    }

    return actionResult;
  }

  /**
   * Process the execution queue
   */
  private startExecutionProcessor(): void {
    setInterval(async () => {
      // Process pending executions
      while (this.executionQueue.length > 0 && this.activeExecutions.size < this.maxConcurrentExecutions) {
        const execution = this.executionQueue.shift();
        if (execution) {
          this.activeExecutions.set(execution.id, execution);
          await this.processExecution(execution);
        }
      }
    }, 1000); // Check every second
  }

  /**
   * Process a single workflow execution
   */
  private async processExecution(execution: WorkflowExecution): Promise<void> {
    try {
      execution.status = 'running';
      execution.startedAt = new Date();

      const workflow = this.workflows.get(execution.workflowId);
      if (!workflow) {
        throw new Error(`Workflow not found: ${execution.workflowId}`);
      }

      // Get business context
      const businessContext = await contextEngine.processQuery({
        businessId: execution.businessId,
        queryType: 'business_analysis',
        query: 'Get current business state for workflow execution',
      });

      // Execute actions sequentially
      for (let i = 0; i < workflow.actions.length; i++) {
        const action = workflow.actions[i];
        const actionResult = await this.executeAction(action, execution, businessContext as any);
        execution.actionResults[i] = actionResult;

        // Stop execution if action failed and no retry is pending
        if (actionResult.status === 'failed') {
          execution.status = 'failed';
          execution.error = `Action ${action.name} failed: ${actionResult.error}`;
          break;
        }
      }

      // Mark as completed if all actions succeeded
      if (execution.status === 'running') {
        execution.status = 'completed';
      }

      execution.completedAt = new Date();

    } catch (error) {
      execution.status = 'failed';
      execution.completedAt = new Date();
      execution.error = error instanceof Error ? error.message : String(error);
    } finally {
      // Remove from active executions
      this.activeExecutions.delete(execution.id);
      
      console.log(`Workflow execution ${execution.status}: ${execution.id}`);
    }
  }

  /**
   * Initialize default workflow templates
   */
  private initializeDefaultWorkflows(): void {
    // Customer Follow-up Workflow
    const customerFollowUpWorkflow: WorkflowDefinition = {
      id: 'customer_followup',
      businessId: '*', // Template for all businesses
      name: 'Customer Follow-up Sequence',
      description: 'Automatically follow up with customers after service completion',
      trigger: {
        id: 'service_completed',
        type: 'event_based',
        name: 'Service Completed',
        description: 'Triggered when a calendar event is marked as completed',
        conditions: [
          {
            field: 'status',
            operator: 'equals',
            value: 'completed',
            dataSource: 'event',
          },
        ],
      },
      actions: [
        {
          id: 'send_thank_you_email',
          type: 'send_email',
          name: 'Send Thank You Email',
          description: 'Send a personalized thank you email to the customer',
          parameters: {
            template: 'thank_you_template',
            delay: 3600000, // 1 hour delay
          },
        },
        {
          id: 'schedule_review_request',
          type: 'delay',
          name: 'Wait for Review Request',
          description: 'Wait 3 days before requesting a review',
          parameters: {
            delay: 259200000, // 3 days
          },
        },
        {
          id: 'request_review',
          type: 'send_email',
          name: 'Request Customer Review',
          description: 'Ask customer to leave a review',
          parameters: {
            template: 'review_request_template',
          },
        },
      ],
      isActive: true,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: ['customer_retention', 'reviews', 'automation'],
    };

    // Invoice Reminder Workflow
    const invoiceReminderWorkflow: WorkflowDefinition = {
      id: 'invoice_reminder',
      businessId: '*',
      name: 'Automated Invoice Reminders',
      description: 'Send payment reminders for overdue invoices',
      trigger: {
        id: 'invoice_overdue',
        type: 'time_based',
        name: 'Daily Invoice Check',
        description: 'Check for overdue invoices daily',
        conditions: [
          {
            field: 'status',
            operator: 'equals',
            value: 'overdue',
            dataSource: 'invoice',
          },
        ],
        schedule: {
          frequency: 'daily',
          time: '09:00',
          timezone: 'UTC',
        },
      },
      actions: [
        {
          id: 'send_payment_reminder',
          type: 'send_email',
          name: 'Send Payment Reminder',
          description: 'Send a polite payment reminder email',
          parameters: {
            template: 'payment_reminder_template',
          },
        },
        {
          id: 'update_customer_status',
          type: 'update_customer',
          name: 'Update Customer Status',
          description: 'Mark customer as having outstanding payments',
          parameters: {
            status: 'payment_pending',
          },
        },
      ],
      isActive: true,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: ['finance', 'collections', 'automation'],
    };

    // Register default workflows
    this.workflows.set(customerFollowUpWorkflow.id, customerFollowUpWorkflow);
    this.workflows.set(invoiceReminderWorkflow.id, invoiceReminderWorkflow);

    console.log('Default workflows initialized:', Array.from(this.workflows.keys()));
  }

  // Action execution methods (stubs - would be implemented with actual integrations)
  private async executeSendEmailAction(_action: WorkflowAction, _execution: WorkflowExecution, _context: BusinessContext): Promise<Record<string, unknown>> {
    // TODO: Integrate with email service
    return { status: 'sent', timestamp: new Date().toISOString() };
  }

  private async executeSendSmsAction(_action: WorkflowAction, _execution: WorkflowExecution, _context: BusinessContext): Promise<Record<string, unknown>> {
    // TODO: Integrate with SMS service
    return { status: 'sent', timestamp: new Date().toISOString() };
  }

  private async executeCreateEventAction(_action: WorkflowAction, _execution: WorkflowExecution, _context: BusinessContext): Promise<Record<string, unknown>> {
    // TODO: Create calendar event
    return { eventId: 'evt_' + Date.now(), status: 'created' };
  }

  private async executeUpdateCustomerAction(_action: WorkflowAction, _execution: WorkflowExecution, _context: BusinessContext): Promise<Record<string, unknown>> {
    // TODO: Update customer record
    return { customerId: 'updated', timestamp: new Date().toISOString() };
  }

  private async executeCreateInvoiceAction(_action: WorkflowAction, _execution: WorkflowExecution, _context: BusinessContext): Promise<Record<string, unknown>> {
    // TODO: Create invoice
    return { invoiceId: 'inv_' + Date.now(), status: 'created' };
  }

  private async executeAiAnalyzeAction(action: WorkflowAction, execution: WorkflowExecution, _context: BusinessContext): Promise<Record<string, unknown>> {
    // Use Context Engine for AI analysis
    const result = await contextEngine.processQuery({
      businessId: execution.businessId,
      queryType: 'business_analysis',
      query: String(action.parameters.query || 'Analyze current business state'),
    });

    return {
      analysis: result.contextualAnswer,
      insights: result.businessInsights,
      recommendations: result.recommendedActions,
    };
  }

  private async executeWebhookAction(_action: WorkflowAction, _execution: WorkflowExecution, _context: BusinessContext): Promise<Record<string, unknown>> {
    // TODO: Make webhook call
    return { status: 'called', timestamp: new Date().toISOString() };
  }

  private async executeDelayAction(action: WorkflowAction, _execution: WorkflowExecution, _context: BusinessContext): Promise<Record<string, unknown>> {
    const delay = Number(action.parameters.delay) || 1000;
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ status: 'completed', delay, timestamp: new Date().toISOString() });
      }, delay);
    });
  }

  // Data retrieval methods (stubs - would query actual database)
  private async getCustomerValue(field: string, businessId: string): Promise<unknown> {
    // TODO: Query customer data from database
    return null;
  }

  private async getEventValue(field: string, businessId: string): Promise<unknown> {
    // TODO: Query event data from database
    return null;
  }

  private async getInvoiceValue(field: string, businessId: string): Promise<unknown> {
    // TODO: Query invoice data from database
    return null;
  }

  private async getCommunicationValue(field: string, businessId: string): Promise<unknown> {
    // TODO: Query communication data from database
    return null;
  }

  private getBusinessValue(field: string, businessContext: any): unknown {
    // Extract value from business context
    return businessContext[field];
  }

  /**
   * Get workflow execution status
   */
  getExecutionStatus(executionId: string): WorkflowExecution | undefined {
    return this.activeExecutions.get(executionId);
  }

  /**
   * Get all workflows for a business
   */
  getWorkflows(businessId: string): WorkflowDefinition[] {
    return Array.from(this.workflows.values()).filter(
      workflow => workflow.businessId === businessId || workflow.businessId === '*'
    );
  }

  /**
   * Cancel a workflow execution
   */
  cancelExecution(executionId: string): boolean {
    const execution = this.activeExecutions.get(executionId);
    if (execution && execution.status === 'running') {
      execution.status = 'cancelled';
      execution.completedAt = new Date();
      this.activeExecutions.delete(executionId);
      return true;
    }
    return false;
  }
}

// Export the singleton instance
export const workflowOrchestrator = new WorkflowOrchestrator();