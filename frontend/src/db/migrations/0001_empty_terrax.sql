CREATE TABLE "customer_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"type" text NOT NULL,
	"label" text,
	"street" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"zip_code" text NOT NULL,
	"country" text DEFAULT 'US' NOT NULL,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"service_zone" text,
	"access_instructions" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_interactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"type" text NOT NULL,
	"subject" text,
	"description" text,
	"direction" text NOT NULL,
	"channel" text,
	"duration" integer,
	"outcome" text,
	"sentiment" text,
	"ai_summary" text,
	"key_points" jsonb,
	"follow_up_required" boolean DEFAULT false NOT NULL,
	"follow_up_date" timestamp,
	"follow_up_notes" text,
	"interaction_date" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_relationships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_customer_id" uuid NOT NULL,
	"child_customer_id" uuid NOT NULL,
	"relationship_type" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_tag_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"name" text NOT NULL,
	"color" text DEFAULT '#4ecdc4' NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text,
	"phone" text,
	"company_name" text,
	"job_title" text,
	"industry" text,
	"address" jsonb,
	"status" text DEFAULT 'prospect' NOT NULL,
	"customer_type" text DEFAULT 'individual' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"credit_limit" numeric(12, 2),
	"current_balance" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"lifetime_value" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"marketing_opt_in" boolean DEFAULT false NOT NULL,
	"communication_preferences" jsonb DEFAULT '{"email":true,"sms":false,"phone":true,"push":false,"preferredTime":"business_hours","frequency":"as_needed"}'::jsonb NOT NULL,
	"ai_insights" jsonb,
	"custom_fields" jsonb,
	"referral_source" text,
	"referred_by" uuid,
	"acquisition_cost" numeric(10, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_contacted_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "communication_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"period" text NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"channel_metrics" jsonb,
	"campaign_performance" jsonb,
	"customer_engagement" jsonb,
	"ai_insights" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communication_automations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"trigger_type" text NOT NULL,
	"trigger_conditions" jsonb NOT NULL,
	"template_id" uuid,
	"channel" text NOT NULL,
	"frequency" text DEFAULT 'once' NOT NULL,
	"max_sends_per_customer" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"trigger_count" integer DEFAULT 0 NOT NULL,
	"success_count" integer DEFAULT 0 NOT NULL,
	"failure_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_triggered_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "communication_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"channel" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"scheduled_at" timestamp,
	"start_date" timestamp,
	"end_date" timestamp,
	"target_audience" jsonb,
	"subject" text,
	"content" text NOT NULL,
	"ai_optimized" boolean DEFAULT false NOT NULL,
	"personalize_content" boolean DEFAULT false NOT NULL,
	"sent_count" integer DEFAULT 0 NOT NULL,
	"delivered_count" integer DEFAULT 0 NOT NULL,
	"open_count" integer DEFAULT 0 NOT NULL,
	"click_count" integer DEFAULT 0 NOT NULL,
	"conversion_count" integer DEFAULT 0 NOT NULL,
	"budget" numeric(10, 2),
	"cost" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communication_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"customer_id" uuid,
	"campaign_id" uuid,
	"template_id" uuid,
	"type" text NOT NULL,
	"channel" text NOT NULL,
	"direction" text NOT NULL,
	"recipients" jsonb,
	"subject" text,
	"content" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"external_id" text,
	"external_status" text,
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"opened_at" timestamp,
	"clicked_at" timestamp,
	"error_message" text,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"sentiment" text,
	"ai_summary" text,
	"engagement_score" numeric(5, 2),
	"cost" numeric(8, 4) DEFAULT '0.0000' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communication_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"email_settings" jsonb,
	"sms_settings" jsonb,
	"voice_settings" jsonb,
	"push_settings" jsonb,
	"general_settings" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communication_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"subject" text,
	"content" text NOT NULL,
	"channel" text NOT NULL,
	"language" text DEFAULT 'en' NOT NULL,
	"ai_enhanced" boolean DEFAULT false NOT NULL,
	"personalizable" boolean DEFAULT true NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "availability_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"weekly_schedule" jsonb NOT NULL,
	"holidays" jsonb,
	"booking_rules" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"customer_id" uuid,
	"service_id" uuid,
	"request_type" text NOT NULL,
	"preferred_date" timestamp,
	"preferred_time" text,
	"alternative_dates" jsonb,
	"contact_info" jsonb,
	"service_notes" text,
	"special_requests" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"response" text,
	"responded_at" timestamp,
	"converted_event_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "calendar_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"customer_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"event_type" text NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"all_day" boolean DEFAULT false NOT NULL,
	"recurring" boolean DEFAULT false NOT NULL,
	"recurrence_rule" text,
	"recurrence_end_date" timestamp,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"location" jsonb,
	"service_details" jsonb,
	"assigned_team_members" jsonb,
	"reminders" jsonb,
	"ai_insights" jsonb,
	"external_id" text,
	"external_source" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text,
	"price" numeric(10, 2),
	"pricing_type" text DEFAULT 'fixed' NOT NULL,
	"duration" integer NOT NULL,
	"buffer_time" integer DEFAULT 0 NOT NULL,
	"available_schedule_id" uuid,
	"requirements" jsonb,
	"booking_settings" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "time_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"block_type" text NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"recurring" boolean DEFAULT false NOT NULL,
	"recurrence_rule" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"amount" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"category" text NOT NULL,
	"subcategory" text,
	"tax_deductible" boolean DEFAULT true NOT NULL,
	"tax_category" text,
	"payment_method" text NOT NULL,
	"vendor" text,
	"receipt_url" text,
	"receipt_number" text,
	"event_id" uuid,
	"status" text DEFAULT 'pending' NOT NULL,
	"approved_by" text,
	"approved_at" timestamp,
	"expense_date" timestamp DEFAULT now() NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "financial_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"period" text NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"total_revenue" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"paid_revenue" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"outstanding_revenue" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"total_expenses" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"gross_profit" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"net_profit" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"profit_margin" numeric(5, 4) DEFAULT '0.0000' NOT NULL,
	"total_invoices" integer DEFAULT 0 NOT NULL,
	"paid_invoices" integer DEFAULT 0 NOT NULL,
	"overdue_invoices" integer DEFAULT 0 NOT NULL,
	"total_customers" integer DEFAULT 0 NOT NULL,
	"new_customers" integer DEFAULT 0 NOT NULL,
	"average_order_value" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"revenue_by_category" jsonb,
	"expenses_by_category" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"quantity" numeric(10, 2) DEFAULT '1.00' NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total_price" numeric(12, 2) NOT NULL,
	"taxable" boolean DEFAULT true NOT NULL,
	"tax_rate" numeric(5, 4) DEFAULT '0.0000' NOT NULL,
	"discount_amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"event_id" uuid,
	"invoice_number" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"subtotal" numeric(12, 2) NOT NULL,
	"tax_amount" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"discount_amount" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"total" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"tax_rate" numeric(5, 4) DEFAULT '0.0000' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"invoice_date" timestamp DEFAULT now() NOT NULL,
	"due_date" timestamp NOT NULL,
	"payment_terms" text DEFAULT 'net_30' NOT NULL,
	"payment_instructions" text,
	"auto_reminders" boolean DEFAULT true NOT NULL,
	"notes" text,
	"internal_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"sent_at" timestamp,
	"paid_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"invoice_id" uuid,
	"payment_number" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"payment_method" text NOT NULL,
	"payment_details" jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"payment_date" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp,
	"processing_fee" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"net_amount" numeric(12, 2) NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tax_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"default_tax_rate" numeric(5, 4) DEFAULT '0.0000' NOT NULL,
	"tax_name" text DEFAULT 'Tax' NOT NULL,
	"tax_number" text,
	"tax_rates" jsonb,
	"business_info" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"period" text NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"total_conversations" integer DEFAULT 0 NOT NULL,
	"total_messages" integer DEFAULT 0 NOT NULL,
	"total_tokens" integer DEFAULT 0 NOT NULL,
	"avg_conversation_length" numeric(8, 2) DEFAULT '0.00' NOT NULL,
	"avg_response_time" numeric(8, 2) DEFAULT '0.00' NOT NULL,
	"success_rate" numeric(5, 4) DEFAULT '0.0000' NOT NULL,
	"customer_satisfaction" numeric(3, 2) DEFAULT '0.00' NOT NULL,
	"conversions_generated" integer DEFAULT 0 NOT NULL,
	"appointments_scheduled" integer DEFAULT 0 NOT NULL,
	"issues_resolved" integer DEFAULT 0 NOT NULL,
	"escalations_required" integer DEFAULT 0 NOT NULL,
	"channel_performance" jsonb,
	"top_intents" jsonb,
	"total_cost" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"cost_per_conversation" numeric(8, 2) DEFAULT '0.00' NOT NULL,
	"cost_per_message" numeric(8, 4) DEFAULT '0.0000' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"customer_id" uuid,
	"title" text NOT NULL,
	"summary" text,
	"ai_model" text DEFAULT 'gpt-4' NOT NULL,
	"system_prompt" text,
	"conversation_type" text NOT NULL,
	"channel" text NOT NULL,
	"business_context" jsonb,
	"status" text DEFAULT 'active' NOT NULL,
	"metadata" jsonb,
	"total_messages" integer DEFAULT 0 NOT NULL,
	"total_tokens" integer DEFAULT 0 NOT NULL,
	"avg_response_time" numeric(8, 2) DEFAULT '0.00' NOT NULL,
	"customer_satisfaction" integer,
	"conversation_quality" numeric(3, 2),
	"outcome" text,
	"actions_taken" jsonb,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp,
	"last_message_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"original_content" text,
	"processed_content" text,
	"ai_model" text DEFAULT 'gpt-4' NOT NULL,
	"token_count" integer DEFAULT 0 NOT NULL,
	"processing_time" numeric(8, 2) DEFAULT '0.00' NOT NULL,
	"intent" text,
	"entities" jsonb,
	"sentiment" text,
	"sentiment_score" numeric(3, 2),
	"message_type" text DEFAULT 'text' NOT NULL,
	"attachments" jsonb,
	"function_call" jsonb,
	"relevance_score" numeric(3, 2),
	"helpfulness_score" numeric(3, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_interactions" ADD CONSTRAINT "customer_interactions_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_interactions" ADD CONSTRAINT "customer_interactions_business_id_users_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_relationships" ADD CONSTRAINT "customer_relationships_parent_customer_id_customers_id_fk" FOREIGN KEY ("parent_customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_relationships" ADD CONSTRAINT "customer_relationships_child_customer_id_customers_id_fk" FOREIGN KEY ("child_customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_tag_assignments" ADD CONSTRAINT "customer_tag_assignments_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_tag_assignments" ADD CONSTRAINT "customer_tag_assignments_tag_id_customer_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."customer_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_tags" ADD CONSTRAINT "customer_tags_business_id_users_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_business_id_users_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_referred_by_customers_id_fk" FOREIGN KEY ("referred_by") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_analytics" ADD CONSTRAINT "communication_analytics_business_id_users_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_automations" ADD CONSTRAINT "communication_automations_business_id_users_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_automations" ADD CONSTRAINT "communication_automations_template_id_communication_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."communication_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_campaigns" ADD CONSTRAINT "communication_campaigns_business_id_users_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_messages" ADD CONSTRAINT "communication_messages_business_id_users_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_messages" ADD CONSTRAINT "communication_messages_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_messages" ADD CONSTRAINT "communication_messages_campaign_id_communication_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."communication_campaigns"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_messages" ADD CONSTRAINT "communication_messages_template_id_communication_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."communication_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_settings" ADD CONSTRAINT "communication_settings_business_id_users_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_templates" ADD CONSTRAINT "communication_templates_business_id_users_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "availability_schedules" ADD CONSTRAINT "availability_schedules_business_id_users_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_requests" ADD CONSTRAINT "booking_requests_business_id_users_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_requests" ADD CONSTRAINT "booking_requests_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_requests" ADD CONSTRAINT "booking_requests_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_requests" ADD CONSTRAINT "booking_requests_converted_event_id_calendar_events_id_fk" FOREIGN KEY ("converted_event_id") REFERENCES "public"."calendar_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_business_id_users_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_business_id_users_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_available_schedule_id_availability_schedules_id_fk" FOREIGN KEY ("available_schedule_id") REFERENCES "public"."availability_schedules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_blocks" ADD CONSTRAINT "time_blocks_business_id_users_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_business_id_users_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_event_id_calendar_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."calendar_events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_analytics" ADD CONSTRAINT "financial_analytics_business_id_users_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_business_id_users_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_event_id_calendar_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."calendar_events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_business_id_users_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_settings" ADD CONSTRAINT "tax_settings_business_id_users_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_analytics" ADD CONSTRAINT "ai_analytics_business_id_users_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_business_id_users_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_conversation_id_ai_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."ai_conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "customer_addresses_customer_id_idx" ON "customer_addresses" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "customer_addresses_type_idx" ON "customer_addresses" USING btree ("type");--> statement-breakpoint
CREATE INDEX "customer_addresses_city_state_idx" ON "customer_addresses" USING btree ("city","state");--> statement-breakpoint
CREATE INDEX "customer_addresses_lat_lng_idx" ON "customer_addresses" USING btree ("latitude","longitude");--> statement-breakpoint
CREATE INDEX "customer_interactions_customer_id_idx" ON "customer_interactions" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "customer_interactions_business_id_idx" ON "customer_interactions" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "customer_interactions_type_idx" ON "customer_interactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "customer_interactions_interaction_date_idx" ON "customer_interactions" USING btree ("interaction_date");--> statement-breakpoint
CREATE INDEX "customer_relationships_parent_customer_id_idx" ON "customer_relationships" USING btree ("parent_customer_id");--> statement-breakpoint
CREATE INDEX "customer_relationships_child_customer_id_idx" ON "customer_relationships" USING btree ("child_customer_id");--> statement-breakpoint
CREATE INDEX "customer_tag_assignments_customer_id_idx" ON "customer_tag_assignments" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "customer_tag_assignments_tag_id_idx" ON "customer_tag_assignments" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "customer_tags_business_id_idx" ON "customer_tags" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "customer_tags_name_idx" ON "customer_tags" USING btree ("name");--> statement-breakpoint
CREATE INDEX "customers_business_id_idx" ON "customers" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "customers_email_idx" ON "customers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "customers_phone_idx" ON "customers" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "customers_status_idx" ON "customers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "customers_customer_type_idx" ON "customers" USING btree ("customer_type");--> statement-breakpoint
CREATE INDEX "customers_company_name_idx" ON "customers" USING btree ("company_name");--> statement-breakpoint
CREATE INDEX "communication_analytics_business_id_idx" ON "communication_analytics" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "communication_analytics_period_idx" ON "communication_analytics" USING btree ("period","period_start");--> statement-breakpoint
CREATE INDEX "communication_automations_business_id_idx" ON "communication_automations" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "communication_automations_trigger_type_idx" ON "communication_automations" USING btree ("trigger_type");--> statement-breakpoint
CREATE INDEX "communication_automations_is_active_idx" ON "communication_automations" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "communication_campaigns_business_id_idx" ON "communication_campaigns" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "communication_campaigns_status_idx" ON "communication_campaigns" USING btree ("status");--> statement-breakpoint
CREATE INDEX "communication_campaigns_scheduled_at_idx" ON "communication_campaigns" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "communication_messages_business_id_idx" ON "communication_messages" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "communication_messages_customer_id_idx" ON "communication_messages" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "communication_messages_campaign_id_idx" ON "communication_messages" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "communication_messages_status_idx" ON "communication_messages" USING btree ("status");--> statement-breakpoint
CREATE INDEX "communication_messages_channel_idx" ON "communication_messages" USING btree ("channel");--> statement-breakpoint
CREATE INDEX "communication_messages_sent_at_idx" ON "communication_messages" USING btree ("sent_at");--> statement-breakpoint
CREATE INDEX "communication_settings_business_id_idx" ON "communication_settings" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "communication_templates_business_id_idx" ON "communication_templates" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "communication_templates_category_idx" ON "communication_templates" USING btree ("category");--> statement-breakpoint
CREATE INDEX "communication_templates_channel_idx" ON "communication_templates" USING btree ("channel");--> statement-breakpoint
CREATE INDEX "availability_schedules_business_id_idx" ON "availability_schedules" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "booking_requests_business_id_idx" ON "booking_requests" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "booking_requests_customer_id_idx" ON "booking_requests" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "booking_requests_status_idx" ON "booking_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "booking_requests_preferred_date_idx" ON "booking_requests" USING btree ("preferred_date");--> statement-breakpoint
CREATE INDEX "calendar_events_business_id_idx" ON "calendar_events" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "calendar_events_customer_id_idx" ON "calendar_events" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "calendar_events_start_time_idx" ON "calendar_events" USING btree ("start_time");--> statement-breakpoint
CREATE INDEX "calendar_events_status_idx" ON "calendar_events" USING btree ("status");--> statement-breakpoint
CREATE INDEX "calendar_events_event_type_idx" ON "calendar_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "services_business_id_idx" ON "services" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "services_category_idx" ON "services" USING btree ("category");--> statement-breakpoint
CREATE INDEX "time_blocks_business_id_idx" ON "time_blocks" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "time_blocks_start_time_idx" ON "time_blocks" USING btree ("start_time");--> statement-breakpoint
CREATE INDEX "time_blocks_block_type_idx" ON "time_blocks" USING btree ("block_type");--> statement-breakpoint
CREATE INDEX "expenses_business_id_idx" ON "expenses" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "expenses_category_idx" ON "expenses" USING btree ("category");--> statement-breakpoint
CREATE INDEX "expenses_status_idx" ON "expenses" USING btree ("status");--> statement-breakpoint
CREATE INDEX "expenses_expense_date_idx" ON "expenses" USING btree ("expense_date");--> statement-breakpoint
CREATE INDEX "financial_analytics_business_id_idx" ON "financial_analytics" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "financial_analytics_period_idx" ON "financial_analytics" USING btree ("period","period_start");--> statement-breakpoint
CREATE INDEX "invoice_items_invoice_id_idx" ON "invoice_items" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "invoices_business_id_idx" ON "invoices" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "invoices_customer_id_idx" ON "invoices" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "invoices_status_idx" ON "invoices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "invoices_due_date_idx" ON "invoices" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "invoices_invoice_number_idx" ON "invoices" USING btree ("invoice_number");--> statement-breakpoint
CREATE INDEX "payments_business_id_idx" ON "payments" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "payments_customer_id_idx" ON "payments" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "payments_invoice_id_idx" ON "payments" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payments_payment_date_idx" ON "payments" USING btree ("payment_date");--> statement-breakpoint
CREATE INDEX "tax_settings_business_id_idx" ON "tax_settings" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "ai_analytics_business_id_idx" ON "ai_analytics" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "ai_analytics_period_idx" ON "ai_analytics" USING btree ("period","period_start");--> statement-breakpoint
CREATE INDEX "ai_conversations_business_id_idx" ON "ai_conversations" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "ai_conversations_customer_id_idx" ON "ai_conversations" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "ai_conversations_status_idx" ON "ai_conversations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ai_conversations_conversation_type_idx" ON "ai_conversations" USING btree ("conversation_type");--> statement-breakpoint
CREATE INDEX "ai_conversations_started_at_idx" ON "ai_conversations" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "ai_messages_conversation_id_idx" ON "ai_messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "ai_messages_role_idx" ON "ai_messages" USING btree ("role");--> statement-breakpoint
CREATE INDEX "ai_messages_created_at_idx" ON "ai_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "business_profiles_user_id_idx" ON "business_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "business_profiles_industry_idx" ON "business_profiles" USING btree ("industry");--> statement-breakpoint
CREATE INDEX "users_clerk_id_idx" ON "users" USING btree ("clerk_id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");