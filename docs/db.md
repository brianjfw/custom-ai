# Database Architecture: AI-Powered Operating System for SMBs

## Executive Summary

Our database architecture is designed to support millions of SMBs with their complex, interconnected business data while maintaining enterprise-grade performance, security, and reliability. Built on a multi-tenant, cloud-native foundation with intelligent data modeling, the system seamlessly scales from single-user businesses to large multi-location enterprises while providing the Context Engine with the rich, structured data needed for AI-powered insights and automation.

## Core Database Strategy

### Multi-Tenant Architecture Design

**Hybrid Tenancy Model:**
- **Shared Database, Shared Schema:** Cost-effective scaling for millions of SMBs
- **Tenant Isolation:** Row-level security with `tenant_id` on every table
- **Premium Isolation:** Dedicated database instances for enterprise customers
- **Data Sovereignty:** Geographic data residency compliance (US, Canada, EU)

**Tenant Management:**
```sql
-- Core tenant structure
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name VARCHAR(255) NOT NULL,
    industry_vertical VARCHAR(100),
    plan_tier VARCHAR(50) DEFAULT 'starter',
    region VARCHAR(10) DEFAULT 'us-east',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    settings JSONB DEFAULT '{}',
    subscription_status VARCHAR(50) DEFAULT 'active'
);

-- Row Level Security implementation
CREATE POLICY tenant_isolation ON customers
    FOR ALL TO application_role
    USING (tenant_id = current_setting('app.tenant_id')::UUID);
```

### Database Technology Stack

**Primary Database Systems:**
- **PostgreSQL 15+** - Primary transactional database with JSONB for flexibility
- **TimescaleDB** - Time-series data for analytics and business intelligence
- **Redis Cluster** - High-performance caching and real-time data
- **Elasticsearch** - Full-text search and business intelligence
- **ClickHouse** - Analytics warehouse for aggregated reporting

**Data Architecture:**
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │   TimescaleDB    │    │   ClickHouse    │
│  (Operational)  │───▶│  (Time Series)   │───▶│  (Analytics)    │
│                 │    │                  │    │                 │
│ • Customers     │    │ • Events         │    │ • Aggregated    │
│ • Jobs          │    │ • Metrics        │    │ • Reports       │
│ • Finances      │    │ • Logs           │    │ • Dashboards    │
│ • Communications│    │ • Activities     │    │ • Insights      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Core Data Models

### Business Entity Schema

**Business/Tenant Core:**
```sql
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    legal_name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    industry_type VARCHAR(100),
    business_type VARCHAR(100), -- 'home_services', 'personal_care', 'professional', etc.
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    timezone VARCHAR(50) DEFAULT 'America/New_York',
    address JSONB, -- Flexible address structure
    business_hours JSONB, -- Weekly schedule
    settings JSONB DEFAULT '{}',
    branding JSONB DEFAULT '{}', -- Colors, logos, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Automatic website analysis for easy setup
CREATE TABLE business_website_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    website_url VARCHAR(500),
    analysis_data JSONB, -- AI-extracted business info
    confidence_score DECIMAL(3,2),
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Customer Relationship Management

**Customer Entity:**
```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    business_id UUID NOT NULL REFERENCES businesses(id),
    customer_type VARCHAR(50) DEFAULT 'individual', -- 'individual', 'business'
    
    -- Personal Information
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    secondary_phone VARCHAR(20),
    
    -- Address Information
    addresses JSONB DEFAULT '[]', -- Multiple addresses support
    preferred_address_id VARCHAR(50),
    
    -- Relationship Data
    customer_since DATE,
    last_interaction_at TIMESTAMP WITH TIME ZONE,
    lifetime_value DECIMAL(12,2) DEFAULT 0,
    total_jobs INTEGER DEFAULT 0,
    
    -- Communication Preferences
    communication_preferences JSONB DEFAULT '{}',
    marketing_consent BOOLEAN DEFAULT false,
    
    -- AI-Generated Insights
    customer_insights JSONB DEFAULT '{}', -- AI analysis, preferences, etc.
    risk_score DECIMAL(3,2), -- Churn prediction
    
    -- Metadata
    source VARCHAR(100), -- 'website', 'referral', 'manual', etc.
    tags TEXT[],
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for performance
    CONSTRAINT customers_tenant_email_unique UNIQUE (tenant_id, email),
    CONSTRAINT customers_tenant_phone_unique UNIQUE (tenant_id, phone)
);

-- Customer interaction history
CREATE TABLE customer_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    interaction_type VARCHAR(100), -- 'call', 'email', 'sms', 'meeting', 'job'
    direction VARCHAR(20), -- 'inbound', 'outbound'
    channel VARCHAR(50), -- 'phone', 'email', 'website', 'social'
    subject VARCHAR(255),
    content TEXT,
    metadata JSONB DEFAULT '{}',
    ai_summary TEXT, -- AI-generated summary
    sentiment_score DECIMAL(3,2), -- AI sentiment analysis
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Job and Project Management

**Jobs/Projects Core:**
```sql
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    business_id UUID NOT NULL REFERENCES businesses(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    
    -- Job Identification
    job_number VARCHAR(100) UNIQUE, -- Auto-generated or custom
    title VARCHAR(255) NOT NULL,
    description TEXT,
    job_type VARCHAR(100), -- Industry-specific types
    priority VARCHAR(20) DEFAULT 'medium',
    
    -- Scheduling
    scheduled_start TIMESTAMP WITH TIME ZONE,
    scheduled_end TIMESTAMP WITH TIME ZONE,
    actual_start TIMESTAMP WITH TIME ZONE,
    actual_end TIMESTAMP WITH TIME ZONE,
    estimated_duration INTERVAL,
    
    -- Location
    service_address JSONB,
    location_notes TEXT,
    travel_time INTERVAL,
    
    -- Status and Workflow
    status VARCHAR(50) DEFAULT 'quoted', -- 'quoted', 'scheduled', 'in_progress', 'completed', 'cancelled'
    workflow_stage VARCHAR(100),
    completion_percentage INTEGER DEFAULT 0,
    
    -- Financial
    quoted_amount DECIMAL(12,2),
    final_amount DECIMAL(12,2),
    cost_of_goods DECIMAL(12,2),
    labor_cost DECIMAL(12,2),
    profit_margin DECIMAL(5,2),
    
    -- Team Assignment
    assigned_team_members UUID[], -- Array of user IDs
    primary_assignee UUID REFERENCES users(id),
    
    -- AI Insights
    complexity_score DECIMAL(3,2), -- AI-assessed job complexity
    risk_factors JSONB DEFAULT '{}',
    optimization_suggestions JSONB DEFAULT '{}',
    
    -- Metadata
    tags TEXT[],
    custom_fields JSONB DEFAULT '{}',
    attachments JSONB DEFAULT '[]', -- File references
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job materials and inventory
CREATE TABLE job_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    job_id UUID NOT NULL REFERENCES jobs(id),
    material_name VARCHAR(255),
    quantity DECIMAL(10,2),
    unit VARCHAR(50),
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(12,2),
    supplier VARCHAR(255),
    notes TEXT
);

-- Job status history for workflow tracking
CREATE TABLE job_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    job_id UUID NOT NULL REFERENCES jobs(id),
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    changed_by UUID REFERENCES users(id),
    change_reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Financial Management

**Financial Transactions:**
```sql
CREATE TABLE financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    business_id UUID NOT NULL REFERENCES businesses(id),
    
    -- Transaction Core
    transaction_type VARCHAR(50), -- 'invoice', 'payment', 'expense', 'refund'
    transaction_number VARCHAR(100),
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Relationships
    customer_id UUID REFERENCES customers(id),
    job_id UUID REFERENCES jobs(id),
    invoice_id UUID REFERENCES invoices(id),
    
    -- Categorization
    category VARCHAR(100), -- 'revenue', 'materials', 'labor', 'overhead'
    subcategory VARCHAR(100),
    account_code VARCHAR(50), -- For accounting integration
    
    -- Status and Timing
    status VARCHAR(50), -- 'pending', 'completed', 'failed', 'cancelled'
    transaction_date DATE NOT NULL,
    due_date DATE,
    paid_date DATE,
    
    -- Payment Details
    payment_method VARCHAR(50), -- 'cash', 'check', 'credit_card', 'ach', 'stripe'
    payment_processor VARCHAR(50),
    processor_transaction_id VARCHAR(255),
    
    -- Tax Information
    tax_amount DECIMAL(12,2) DEFAULT 0,
    tax_rate DECIMAL(5,4),
    tax_exempt BOOLEAN DEFAULT false,
    
    -- AI Insights
    ai_category_confidence DECIMAL(3,2), -- Confidence in AI categorization
    anomaly_score DECIMAL(3,2), -- Unusual transaction detection
    
    -- Metadata
    description TEXT,
    notes TEXT,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices and estimates
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    business_id UUID NOT NULL REFERENCES businesses(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    job_id UUID REFERENCES jobs(id),
    
    -- Invoice Details
    invoice_type VARCHAR(20) DEFAULT 'invoice', -- 'estimate', 'invoice', 'recurring'
    invoice_number VARCHAR(100) UNIQUE,
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled'
    
    -- Financial
    subtotal DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    amount_paid DECIMAL(12,2) DEFAULT 0,
    
    -- Dates
    issue_date DATE NOT NULL,
    due_date DATE,
    sent_date DATE,
    viewed_date DATE,
    paid_date DATE,
    
    -- Terms and Conditions
    payment_terms VARCHAR(100),
    late_fee_percentage DECIMAL(5,2),
    discount_terms VARCHAR(255),
    notes TEXT,
    
    -- Document Generation
    pdf_url VARCHAR(500),
    online_payment_url VARCHAR(500),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice line items
CREATE TABLE invoice_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    item_type VARCHAR(50), -- 'service', 'material', 'labor', 'fee'
    sort_order INTEGER DEFAULT 0
);
```

### Communication and Marketing

**Multi-Modal Communications:**
```sql
CREATE TABLE communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    business_id UUID NOT NULL REFERENCES businesses(id),
    
    -- Participants
    sender_id UUID REFERENCES users(id), -- Internal user or system
    recipient_type VARCHAR(20), -- 'customer', 'team', 'external'
    recipient_id UUID, -- customer_id, user_id, or external contact
    recipient_info JSONB, -- For external contacts
    
    -- Communication Details
    communication_type VARCHAR(50), -- 'email', 'sms', 'call', 'video_call', 'chat', 'social'
    direction VARCHAR(20), -- 'inbound', 'outbound'
    subject VARCHAR(255),
    content TEXT,
    
    -- Multi-Modal Support
    content_type VARCHAR(50) DEFAULT 'text', -- 'text', 'html', 'voice', 'video', 'image'
    attachments JSONB DEFAULT '[]', -- File references
    media_urls JSONB DEFAULT '[]', -- Voice recordings, videos
    
    -- Status and Tracking
    status VARCHAR(50), -- 'draft', 'sent', 'delivered', 'read', 'replied', 'failed'
    delivery_status JSONB DEFAULT '{}', -- Provider-specific delivery info
    read_at TIMESTAMP WITH TIME ZONE,
    replied_at TIMESTAMP WITH TIME ZONE,
    
    -- AI Analysis
    ai_generated BOOLEAN DEFAULT false,
    ai_model_used VARCHAR(100),
    sentiment_score DECIMAL(3,2),
    intent_classification VARCHAR(100),
    auto_response_used BOOLEAN DEFAULT false,
    
    -- Threading and Context
    thread_id UUID, -- For grouping related messages
    reply_to_id UUID REFERENCES communications(id),
    campaign_id UUID, -- For marketing campaigns
    
    -- External Integration
    external_id VARCHAR(255), -- Provider-specific ID
    provider VARCHAR(50), -- 'twilio', 'sendgrid', 'zoom', etc.
    provider_metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Communication templates for AI generation
CREATE TABLE communication_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    business_id UUID NOT NULL REFERENCES businesses(id),
    
    template_name VARCHAR(255) NOT NULL,
    template_type VARCHAR(50), -- 'welcome', 'reminder', 'follow_up', 'invoice'
    communication_type VARCHAR(50), -- 'email', 'sms', 'call_script'
    
    subject_template TEXT,
    content_template TEXT,
    variables JSONB DEFAULT '{}', -- Available template variables
    
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Calendar and Scheduling

**Advanced Scheduling System:**
```sql
CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    business_id UUID NOT NULL REFERENCES businesses(id),
    
    -- Event Details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(100), -- 'job', 'meeting', 'block', 'personal'
    
    -- Timing
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    all_day BOOLEAN DEFAULT false,
    timezone VARCHAR(50),
    
    -- Recurrence
    is_recurring BOOLEAN DEFAULT false,
    recurrence_rule VARCHAR(500), -- RFC 5545 RRULE
    recurrence_end_date DATE,
    
    -- Relationships
    customer_id UUID REFERENCES customers(id),
    job_id UUID REFERENCES jobs(id),
    created_by UUID REFERENCES users(id),
    
    -- Participants
    assigned_users UUID[], -- Array of assigned team members
    external_participants JSONB DEFAULT '[]',
    
    -- Location and Virtual
    location_type VARCHAR(20), -- 'on_site', 'virtual', 'office'
    location_address JSONB,
    virtual_meeting_url VARCHAR(500),
    virtual_meeting_id VARCHAR(100),
    
    -- Status
    status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled'
    confirmation_status VARCHAR(50), -- 'pending', 'confirmed', 'declined'
    
    -- AI Optimization
    travel_time_minutes INTEGER,
    optimal_start_time TIMESTAMP WITH TIME ZONE, -- AI-suggested time
    scheduling_confidence DECIMAL(3,2),
    
    -- Metadata
    priority INTEGER DEFAULT 3, -- 1-5 scale
    tags TEXT[],
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calendar availability and business hours
CREATE TABLE calendar_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    business_id UUID NOT NULL REFERENCES businesses(id),
    user_id UUID REFERENCES users(id), -- NULL for business-wide availability
    
    -- Time Slots
    day_of_week INTEGER, -- 0-6, Sunday = 0
    start_time TIME,
    end_time TIME,
    
    -- Availability Rules
    available BOOLEAN DEFAULT true,
    max_concurrent_bookings INTEGER DEFAULT 1,
    buffer_time_minutes INTEGER DEFAULT 0,
    
    -- Date Ranges
    effective_from DATE,
    effective_to DATE,
    
    -- Override specific dates
    date_override DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Team and User Management

**User and Role System:**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    business_id UUID NOT NULL REFERENCES businesses(id),
    
    -- Authentication
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255), -- For local authentication
    
    -- Profile Information
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(255),
    title VARCHAR(100),
    department VARCHAR(100),
    
    -- Avatar and Branding
    avatar_url VARCHAR(500),
    profile_color VARCHAR(7), -- Hex color for UI personalization
    
    -- Permissions and Access
    role VARCHAR(50) DEFAULT 'employee', -- 'owner', 'admin', 'manager', 'employee', 'contractor'
    permissions JSONB DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    
    -- Contact Information
    emergency_contact JSONB,
    work_schedule JSONB, -- Weekly work hours
    hourly_rate DECIMAL(8,2),
    
    -- Skills and Specializations
    skills TEXT[],
    certifications JSONB DEFAULT '[]',
    service_areas TEXT[], -- Geographic or service type areas
    
    -- Performance Metrics
    job_completion_rate DECIMAL(5,2),
    customer_satisfaction_score DECIMAL(3,2),
    average_job_duration INTERVAL,
    
    -- AI Insights
    performance_insights JSONB DEFAULT '{}',
    training_recommendations JSONB DEFAULT '[]',
    
    -- Authentication Metadata
    last_login_at TIMESTAMP WITH TIME ZONE,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    phone_verified_at TIMESTAMP WITH TIME ZONE,
    two_factor_enabled BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team assignments and hierarchies
CREATE TABLE team_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    team_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    role_in_team VARCHAR(50), -- 'lead', 'member', 'supervisor'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE
);
```

### Document and Media Management

**File and Document Storage:**
```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    business_id UUID NOT NULL REFERENCES businesses(id),
    
    -- File Information
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255),
    file_type VARCHAR(100), -- 'image', 'document', 'video', 'audio', 'other'
    mime_type VARCHAR(100),
    file_size_bytes BIGINT,
    file_url VARCHAR(500),
    
    -- Relationships
    related_entity_type VARCHAR(50), -- 'customer', 'job', 'invoice', 'user'
    related_entity_id UUID,
    
    -- Organization
    folder_path VARCHAR(500),
    tags TEXT[],
    description TEXT,
    
    -- AI-Powered Analysis
    ai_extracted_text TEXT, -- OCR results
    ai_content_summary TEXT,
    ai_detected_entities JSONB DEFAULT '{}', -- Names, dates, amounts, etc.
    ai_classification VARCHAR(100), -- Document type classification
    confidence_score DECIMAL(3,2),
    
    -- Access Control
    visibility VARCHAR(20) DEFAULT 'private', -- 'private', 'team', 'customer'
    shared_with UUID[], -- Array of user IDs
    public_url VARCHAR(500), -- For customer-shared documents
    
    -- Version Control
    version INTEGER DEFAULT 1,
    parent_document_id UUID REFERENCES documents(id),
    is_latest_version BOOLEAN DEFAULT true,
    
    -- Metadata
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document processing status
CREATE TABLE document_processing_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    document_id UUID NOT NULL REFERENCES documents(id),
    processing_type VARCHAR(50), -- 'ocr', 'classification', 'extraction'
    status VARCHAR(50), -- 'pending', 'processing', 'completed', 'failed'
    result JSONB,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);
```

## Analytics and Business Intelligence

### Time-Series Data for Analytics

**Business Metrics (TimescaleDB):**
```sql
CREATE TABLE business_metrics (
    time TIMESTAMPTZ NOT NULL,
    tenant_id UUID NOT NULL,
    business_id UUID NOT NULL,
    metric_type VARCHAR(100) NOT NULL, -- 'revenue', 'jobs_completed', 'customer_acquired'
    metric_name VARCHAR(100) NOT NULL,
    value DECIMAL(15,4),
    dimensions JSONB DEFAULT '{}', -- Additional context like location, employee, etc.
    metadata JSONB DEFAULT '{}'
);

-- Create hypertable for time-series optimization
SELECT create_hypertable('business_metrics', 'time', chunk_time_interval => INTERVAL '1 week');

-- Event tracking for AI learning
CREATE TABLE business_events (
    time TIMESTAMPTZ NOT NULL,
    tenant_id UUID NOT NULL,
    business_id UUID NOT NULL,
    event_type VARCHAR(100) NOT NULL, -- 'page_view', 'button_click', 'form_submit'
    event_name VARCHAR(100),
    user_id UUID,
    customer_id UUID,
    job_id UUID,
    properties JSONB DEFAULT '{}',
    session_id VARCHAR(100)
);

SELECT create_hypertable('business_events', 'time', chunk_time_interval => INTERVAL '1 day');
```

### AI Training and Context Data

**AI Context Storage:**
```sql
CREATE TABLE ai_context_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    business_id UUID NOT NULL REFERENCES businesses(id),
    
    -- Context Identification
    context_type VARCHAR(100), -- 'customer_profile', 'business_summary', 'workflow_state'
    context_key VARCHAR(255), -- Unique identifier for this context
    
    -- AI-Generated Content
    context_data JSONB NOT NULL,
    embeddings VECTOR(1536), -- For semantic search
    confidence_score DECIMAL(3,2),
    
    -- Metadata
    generated_by VARCHAR(100), -- AI model used
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE
);

-- Create index for vector similarity search
CREATE INDEX ON ai_context_cache USING ivfflat (embeddings vector_cosine_ops);

-- AI conversation history for learning
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    business_id UUID NOT NULL REFERENCES businesses(id),
    user_id UUID REFERENCES users(id),
    
    -- Conversation Context
    conversation_type VARCHAR(100), -- 'customer_inquiry', 'business_question', 'workflow_help'
    session_id VARCHAR(100),
    
    -- Message Details
    message_order INTEGER,
    role VARCHAR(20), -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    
    -- AI Metadata
    model_used VARCHAR(100),
    tokens_used INTEGER,
    response_time_ms INTEGER,
    feedback_score INTEGER, -- User rating 1-5
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Integration and External Data

### External System Connections

**Integration Management:**
```sql
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    business_id UUID NOT NULL REFERENCES businesses(id),
    
    -- Integration Details
    provider VARCHAR(100) NOT NULL, -- 'quickbooks', 'stripe', 'google_calendar'
    integration_type VARCHAR(50), -- 'accounting', 'payment', 'calendar', 'crm'
    display_name VARCHAR(255),
    
    -- Connection Status
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'connected', 'error', 'disconnected'
    last_sync_at TIMESTAMP WITH TIME ZONE,
    next_sync_at TIMESTAMP WITH TIME ZONE,
    sync_frequency INTERVAL DEFAULT '15 minutes',
    
    -- Authentication
    auth_type VARCHAR(50), -- 'oauth2', 'api_key', 'username_password'
    encrypted_credentials BYTEA, -- Encrypted auth tokens/keys
    refresh_token_encrypted BYTEA,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Configuration
    sync_settings JSONB DEFAULT '{}',
    field_mappings JSONB DEFAULT '{}',
    enabled_features TEXT[],
    
    -- Error Handling
    last_error TEXT,
    error_count INTEGER DEFAULT 0,
    retry_after TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sync logs for monitoring
CREATE TABLE integration_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    integration_id UUID NOT NULL REFERENCES integrations(id),
    
    sync_type VARCHAR(50), -- 'full', 'incremental', 'manual'
    status VARCHAR(50), -- 'started', 'completed', 'failed'
    
    records_processed INTEGER DEFAULT 0,
    records_created INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    
    error_details JSONB,
    
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);
```

## Performance Optimization

### Indexing Strategy

```sql
-- Performance indexes for common queries

-- Customer lookups
CREATE INDEX idx_customers_tenant_email ON customers(tenant_id, email);
CREATE INDEX idx_customers_tenant_phone ON customers(tenant_id, phone);
CREATE INDEX idx_customers_search ON customers USING gin(to_tsvector('english', first_name || ' ' || last_name || ' ' || company_name));

-- Job queries
CREATE INDEX idx_jobs_tenant_status ON jobs(tenant_id, status);
CREATE INDEX idx_jobs_customer_date ON jobs(customer_id, scheduled_start);
CREATE INDEX idx_jobs_assigned_users ON jobs USING gin(assigned_team_members);

-- Financial queries
CREATE INDEX idx_transactions_tenant_date ON financial_transactions(tenant_id, transaction_date);
CREATE INDEX idx_transactions_customer ON financial_transactions(customer_id, transaction_date);
CREATE INDEX idx_invoices_status_due ON invoices(tenant_id, status, due_date);

-- Communication indexes
CREATE INDEX idx_communications_recipient ON communications(tenant_id, recipient_type, recipient_id);
CREATE INDEX idx_communications_thread ON communications(thread_id, created_at);
CREATE INDEX idx_communications_search ON communications USING gin(to_tsvector('english', subject || ' ' || content));

-- Calendar indexes
CREATE INDEX idx_calendar_events_time ON calendar_events(tenant_id, start_time, end_time);
CREATE INDEX idx_calendar_events_assigned ON calendar_events USING gin(assigned_users);

-- Partitioning for large tables
CREATE TABLE business_metrics_2024 PARTITION OF business_metrics
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

### Database Performance Tuning

**Connection Pooling:**
```sql
-- pgBouncer configuration for connection pooling
-- Max connections per database: 100
-- Pool size: 20
-- Pool mode: transaction
```

**Query Optimization:**
```sql
-- Materialized views for common analytics
CREATE MATERIALIZED VIEW customer_lifetime_value AS
SELECT 
    c.tenant_id,
    c.id as customer_id,
    c.first_name,
    c.last_name,
    COUNT(j.id) as total_jobs,
    SUM(j.final_amount) as total_revenue,
    AVG(j.final_amount) as avg_job_value,
    MAX(j.scheduled_start) as last_job_date
FROM customers c
LEFT JOIN jobs j ON c.id = j.customer_id
WHERE c.tenant_id = j.tenant_id
GROUP BY c.tenant_id, c.id, c.first_name, c.last_name;

-- Refresh materialized views nightly
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY customer_lifetime_value;
    -- Add other materialized views
END;
$$ LANGUAGE plpgsql;
```

## Security and Compliance

### Data Encryption and Security

**Encryption at Rest:**
```sql
-- Transparent Data Encryption (TDE) for sensitive columns
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt sensitive customer data
CREATE OR REPLACE FUNCTION encrypt_pii(data TEXT)
RETURNS BYTEA AS $$
BEGIN
    RETURN pgp_sym_encrypt(data, current_setting('app.encryption_key'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrypt function for application use
CREATE OR REPLACE FUNCTION decrypt_pii(encrypted_data BYTEA)
RETURNS TEXT AS $$
BEGIN
    RETURN pgp_sym_decrypt(encrypted_data, current_setting('app.encryption_key'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Row Level Security (RLS):**
```sql
-- Enable RLS on all tenant tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policies for tenant isolation
CREATE POLICY tenant_customers ON customers
    FOR ALL TO application_role
    USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY tenant_jobs ON jobs
    FOR ALL TO application_role
    USING (tenant_id = current_setting('app.tenant_id')::UUID);

-- Additional policies for user-level access control
CREATE POLICY user_document_access ON documents
    FOR SELECT TO application_role
    USING (
        tenant_id = current_setting('app.tenant_id')::UUID AND
        (visibility = 'team' OR uploaded_by = current_setting('app.user_id')::UUID)
    );
```

### Audit and Compliance

**Audit Trail System:**
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    
    -- Action Details
    action VARCHAR(50) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'VIEW'
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    
    -- User Information
    user_id UUID,
    user_email VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    
    -- Change Details
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    
    -- Context
    session_id VARCHAR(100),
    request_id VARCHAR(100),
    source VARCHAR(50), -- 'web', 'mobile', 'api', 'system'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger function for automatic audit logging
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (tenant_id, action, table_name, record_id, old_values, user_id)
        VALUES (OLD.tenant_id, 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD), current_setting('app.user_id', true)::UUID);
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (tenant_id, action, table_name, record_id, old_values, new_values, user_id)
        VALUES (NEW.tenant_id, 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW), current_setting('app.user_id', true)::UUID);
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (tenant_id, action, table_name, record_id, new_values, user_id)
        VALUES (NEW.tenant_id, 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW), current_setting('app.user_id', true)::UUID);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER customers_audit AFTER INSERT OR UPDATE OR DELETE ON customers
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();
```

## Backup and Disaster Recovery

### Backup Strategy

**Automated Backups:**
```bash
# PostgreSQL backup configuration
# Full backup daily at 2 AM
pg_dump --verbose --no-owner --no-acl --compress=9 \
    --file="/backups/$(date +%Y%m%d)_full_backup.sql.gz" \
    smb_platform_production

# Point-in-time recovery with WAL archiving
archive_mode = on
archive_command = 'aws s3 cp %p s3://smb-platform-wal-archive/%f'
wal_level = replica
```

**Cross-Region Replication:**
- Primary database in us-east-1
- Read replica in us-west-2
- Disaster recovery replica in eu-west-1
- Automated failover with 30-second RTO

### Data Retention Policies

```sql
-- Automated data cleanup procedures
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Delete old audit logs (keep 7 years for compliance)
    DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '7 years';
    
    -- Archive old business events (keep 2 years active)
    INSERT INTO business_events_archive 
    SELECT * FROM business_events 
    WHERE time < NOW() - INTERVAL '2 years';
    
    DELETE FROM business_events WHERE time < NOW() - INTERVAL '2 years';
    
    -- Clean up expired AI context cache
    DELETE FROM ai_context_cache WHERE expires_at < NOW();
    
    -- Archive completed jobs older than 5 years
    UPDATE jobs SET archived = true 
    WHERE status = 'completed' AND actual_end < NOW() - INTERVAL '5 years';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup to run weekly
SELECT cron.schedule('weekly-cleanup', '0 2 * * 0', 'SELECT cleanup_old_data();');
```

## Schema Migration Strategy

### Zero-Downtime Migration Framework

**Migration Orchestration:**
```typescript
// Automated schema migration with rollback capabilities
interface MigrationPlan {
  version: string;
  description: string;
  breaking_changes: boolean;
  rollback_safe: boolean;
  estimated_duration: number; // minutes
  dependencies: string[];
  validation_queries: string[];
}

class MigrationOrchestrator {
  async executeMigration(plan: MigrationPlan): Promise<MigrationResult> {
    // 1. Pre-migration validation
    await this.validatePreConditions(plan);
    
    // 2. Create migration checkpoint
    const checkpoint = await this.createCheckpoint();
    
    // 3. Apply schema changes with safety checks
    try {
      if (plan.breaking_changes) {
        await this.executeBreakingMigration(plan);
      } else {
        await this.executeAdditiveMigration(plan);
      }
      
      // 4. Validate migration success
      await this.validatePostMigration(plan);
      
      // 5. Update Context Engine schema cache
      await this.refreshContextEngineSchema();
      
      return { status: 'success', checkpoint };
    } catch (error) {
      // 6. Automatic rollback on failure
      await this.rollbackToCheckpoint(checkpoint);
      throw new MigrationError(error, checkpoint);
    }
  }
  
  private async executeBreakingMigration(plan: MigrationPlan): Promise<void> {
    // Blue-green migration for breaking changes
    const blueDatabase = this.getCurrentDatabase();
    const greenDatabase = await this.createGreenDatabase();
    
    // 1. Apply new schema to green database
    await this.applySchemaChanges(greenDatabase, plan);
    
    // 2. Sync data from blue to green with transformations
    await this.syncDataWithTransformations(blueDatabase, greenDatabase, plan);
    
    // 3. Switch traffic to green database
    await this.switchTrafficToGreen(greenDatabase);
    
    // 4. Monitor for issues and rollback if needed
    await this.monitorPostMigration(greenDatabase, blueDatabase);
  }
}
```

**Migration Testing Pipeline:**
```yaml
# Automated migration testing in CI/CD
migration_testing:
  pre_migration_tests:
    - "performance_baseline_capture"
    - "data_integrity_snapshot"
    - "api_contract_validation"
    
  migration_simulation:
    - "run_migration_on_production_replica"
    - "validate_application_compatibility"
    - "measure_migration_duration"
    - "test_rollback_procedures"
    
  post_migration_tests:
    - "data_integrity_verification"
    - "performance_regression_testing"
    - "api_endpoint_validation"
    - "context_engine_functionality"
    
  rollback_testing:
    - "simulate_rollback_scenarios"
    - "validate_data_consistency_after_rollback"
    - "test_application_recovery"
```

**Backward Compatibility Framework:**
```sql
-- Dual-write pattern for breaking changes
-- Example: Renaming 'customer_phone' to 'primary_phone'

-- Phase 1: Add new column (non-breaking)
ALTER TABLE customers ADD COLUMN primary_phone VARCHAR(20);

-- Phase 2: Dual-write to both columns (application layer)
-- Write to both customer_phone and primary_phone
-- Read from customer_phone (existing behavior)

-- Phase 3: Migrate existing data
UPDATE customers 
SET primary_phone = customer_phone 
WHERE primary_phone IS NULL;

-- Phase 4: Switch reads to new column (application layer)
-- Read from primary_phone instead of customer_phone

-- Phase 5: Drop old column (breaking - after validation period)
-- ALTER TABLE customers DROP COLUMN customer_phone;
```

## Change Data Capture (CDC) Pipeline

### Real-Time Data Streaming

**CDC Architecture:**
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │     Debezium     │    │  Apache Kafka   │
│   (Primary DB)  │───▶│   (CDC Source)   │───▶│   (Event Bus)   │
│                 │    │                  │    │                 │
│ • WAL Logs      │    │ • Log Mining     │    │ • Partitioned   │
│ • Row Changes   │    │ • Schema Mgmt    │    │ • Durable       │
│ • Transactions │    │ • Transforms     │    │ • Scalable      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                        │                        │
        ▼                        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Read Replicas  │    │   Context Engine │    │   Analytics     │
│                 │    │   (Real-time)    │    │   Warehouse     │
│ • Query Offload │    │ • Event Processing│   │ • Data Lake     │
│ • Reporting     │    │ • AI Training    │    │ • BI Tools      │
│ • Backup/DR     │    │ • Notifications  │    │ • Compliance    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

**Event-Driven Business Logic:**
```typescript
// Business event processing from CDC stream
interface BusinessEvent {
  tenant_id: string;
  entity_type: 'customer' | 'job' | 'invoice' | 'payment';
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  before: Record<string, any>;
  after: Record<string, any>;
  timestamp: string;
  transaction_id: string;
}

class BusinessEventProcessor {
  async processEvent(event: BusinessEvent): Promise<void> {
    switch (event.entity_type) {
      case 'customer':
        await this.processCustomerEvent(event);
        break;
      case 'payment':
        await this.processPaymentEvent(event);
        break;
      case 'job':
        await this.processJobEvent(event);
        break;
    }
  }
  
  private async processCustomerEvent(event: BusinessEvent): Promise<void> {
    if (event.operation === 'CREATE') {
      // New customer onboarding workflow
      await this.contextEngine.indexNewCustomer(event.after);
      await this.emailService.sendWelcomeEmail(event.after.email);
      await this.analyticsService.trackCustomerAcquisition(event.tenant_id);
    }
    
    if (event.operation === 'UPDATE' && this.hasContactInfoChanged(event)) {
      // Update all connected systems when contact info changes
      await this.syncToQuickBooks(event.tenant_id, event.after);
      await this.syncToMailchimp(event.tenant_id, event.after);
      await this.updateCommunicationPreferences(event.after);
    }
  }
  
  private async processPaymentEvent(event: BusinessEvent): Promise<void> {
    if (event.operation === 'CREATE' && event.after.status === 'completed') {
      // Payment received - trigger business workflows
      await this.updateCashFlowForecast(event.tenant_id, event.after.amount);
      await this.checkMilestoneAchievements(event.tenant_id);
      await this.updateCustomerLifetimeValue(event.after.customer_id);
      
      // AI-powered insights
      await this.contextEngine.analyzePaymentPatterns(event.tenant_id);
      await this.generateRevenueInsights(event.tenant_id);
    }
  }
}
```

**Multi-Tenant CDC Isolation:**
```yaml
# Kafka topic partitioning strategy for multi-tenancy
kafka_configuration:
  topics:
    customer_events:
      partitions: 50  # Hash by tenant_id for isolation
      replication_factor: 3
      compression: "lz4"
      retention_hours: 168  # 7 days
      
    payment_events:
      partitions: 20
      replication_factor: 3
      cleanup_policy: "compact"  # Keep latest state per key
      
    job_events:
      partitions: 30
      replication_factor: 3
      segment_bytes: 1073741824  # 1GB segments
      
  consumer_groups:
    context_engine_processor:
      auto_offset_reset: "earliest"
      enable_auto_commit: false  # Manual offset management
      
    analytics_warehouse_sync:
      auto_offset_reset: "latest"
      max_poll_records: 500
      
    integration_sync:
      auto_offset_reset: "latest"
      session_timeout: 30000
```

## Data Governance & Lineage

### Comprehensive Data Catalog

**Automated Data Discovery:**
```typescript
// Automated data classification and tagging
interface DataAsset {
  schema_name: string;
  table_name: string;
  column_name: string;
  data_type: string;
  classification: 'public' | 'internal' | 'confidential' | 'restricted';
  pii_detected: boolean;
  business_context: string;
  data_lineage: LineageNode[];
  quality_score: number;
  last_accessed: Date;
  retention_policy: string;
}

class DataGovernanceEngine {
  async scanAndClassifyData(): Promise<DataAsset[]> {
    const tables = await this.getAllTables();
    const assets: DataAsset[] = [];
    
    for (const table of tables) {
      const columns = await this.getTableColumns(table);
      
      for (const column of columns) {
        const asset: DataAsset = {
          schema_name: table.schema,
          table_name: table.name,
          column_name: column.name,
          data_type: column.type,
          classification: await this.classifyColumn(column),
          pii_detected: await this.detectPII(column),
          business_context: await this.inferBusinessContext(table, column),
          data_lineage: await this.traceLineage(table, column),
          quality_score: await this.calculateQualityScore(table, column),
          last_accessed: await this.getLastAccessTime(table, column),
          retention_policy: await this.getRetentionPolicy(table, column)
        };
        assets.push(asset);
      }
    }
    
    return assets;
  }
  
  private async detectPII(column: ColumnInfo): Promise<boolean> {
    const piiPatterns = [
      /email/i,
      /phone/i,
      /ssn|social.security/i,
      /credit.card|card.number/i,
      /address/i,
      /name$/i
    ];
    
    const columnNameMatch = piiPatterns.some(pattern => 
      pattern.test(column.name)
    );
    
    if (columnNameMatch) {
      // Sample data to confirm PII
      const sampleData = await this.getSampleData(column, 100);
      return this.analyzeDataForPII(sampleData);
    }
    
    return false;
  }
  
  private async classifyColumn(column: ColumnInfo): Promise<string> {
    // Use AI to classify data sensitivity
    const prompt = `
      Classify the data sensitivity of this database column:
      Name: ${column.name}
      Type: ${column.type}
      Table: ${column.table}
      Sample values: ${await this.getSampleData(column, 5)}
      
      Classifications:
      - public: Safe to share publicly
      - internal: Internal business use only
      - confidential: Sensitive business data
      - restricted: Requires special handling (PII, financial)
    `;
    
    const classification = await this.aiService.classify(prompt);
    return classification;
  }
}
```

**Data Lineage Tracking:**
```sql
-- Automated lineage tracking for data transformations
CREATE TABLE data_lineage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_table VARCHAR(255) NOT NULL,
  source_column VARCHAR(255),
  target_table VARCHAR(255) NOT NULL,
  target_column VARCHAR(255),
  transformation_type VARCHAR(50), -- 'direct', 'aggregation', 'calculation', 'join'
  transformation_sql TEXT,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Example: Track that customer revenue is calculated from payments
INSERT INTO data_lineage (
  source_table, source_column, 
  target_table, target_column,
  transformation_type, transformation_sql
) VALUES (
  'payments', 'amount',
  'customer_analytics', 'lifetime_value',
  'aggregation',
  'SUM(payments.amount) WHERE payments.status = ''completed'''
);

-- Query to trace data lineage
WITH RECURSIVE lineage_trace AS (
  -- Base case: start with target column
  SELECT 
    source_table, source_column,
    target_table, target_column,
    transformation_type,
    1 as depth
  FROM data_lineage 
  WHERE target_table = 'customer_analytics' 
    AND target_column = 'lifetime_value'
    AND is_active = true
  
  UNION ALL
  
  -- Recursive case: trace back to sources
  SELECT 
    dl.source_table, dl.source_column,
    dl.target_table, dl.target_column,
    dl.transformation_type,
    lt.depth + 1
  FROM data_lineage dl
  JOIN lineage_trace lt ON dl.target_table = lt.source_table
  WHERE dl.is_active = true AND lt.depth < 10
)
SELECT * FROM lineage_trace ORDER BY depth;
```

**Data Quality Monitoring:**
```typescript
// Automated data quality checks
interface DataQualityRule {
  rule_id: string;
  table_name: string;
  column_name?: string;
  rule_type: 'completeness' | 'uniqueness' | 'validity' | 'consistency' | 'timeliness';
  expression: string;
  threshold: number;
  severity: 'warning' | 'error' | 'critical';
  notification_channels: string[];
}

const dataQualityRules: DataQualityRule[] = [
  {
    rule_id: 'customer_email_completeness',
    table_name: 'customers',
    column_name: 'email',
    rule_type: 'completeness',
    expression: 'COUNT(*) WHERE email IS NOT NULL / COUNT(*)',
    threshold: 0.95, // 95% of customers must have email
    severity: 'error',
    notification_channels: ['slack://data-team']
  },
  {
    rule_id: 'payment_amount_validity',
    table_name: 'payments',
    column_name: 'amount',
    rule_type: 'validity',
    expression: 'COUNT(*) WHERE amount > 0 AND amount < 1000000 / COUNT(*)',
    threshold: 0.99, // 99% of payments must be reasonable amounts
    severity: 'critical',
    notification_channels: ['pagerduty://finance-team', 'slack://data-team']
  },
  {
    rule_id: 'job_status_consistency',
    table_name: 'jobs',
    rule_type: 'consistency',
    expression: 'COUNT(*) WHERE status IN (''pending'', ''in_progress'', ''completed'', ''cancelled'') / COUNT(*)',
    threshold: 1.0, // 100% of jobs must have valid status
    severity: 'error',
    notification_channels: ['slack://engineering']
  }
];

class DataQualityMonitor {
  async runQualityChecks(): Promise<void> {
    for (const rule of dataQualityRules) {
      const score = await this.executeQualityCheck(rule);
      
      if (score < rule.threshold) {
        await this.reportQualityIssue(rule, score);
        
        if (rule.severity === 'critical') {
          await this.triggerDataQualityIncident(rule, score);
        }
      }
    }
  }
  
  private async executeQualityCheck(rule: DataQualityRule): Promise<number> {
    const query = `
      SELECT ${rule.expression} as quality_score
      FROM ${rule.table_name}
      WHERE tenant_id = $1
        AND created_at >= NOW() - INTERVAL '24 hours'
    `;
    
    const result = await this.database.query(query, [this.currentTenant]);
    return result.rows[0].quality_score;
  }
}
```

## Data Lifecycle & Tiering

### Intelligent Storage Optimization

**Automated Data Tiering:**
```typescript
// Intelligent data lifecycle management
interface DataTieringPolicy {
  table_name: string;
  tiers: {
    hot: {
      duration: string; // '30 days'
      storage_class: 'ssd';
      access_pattern: 'frequent';
    };
    warm: {
      duration: string; // '90 days'
      storage_class: 'ssd_cached';
      access_pattern: 'occasional';
    };
    cold: {
      duration: string; // '1 year'
      storage_class: 'magnetic';
      access_pattern: 'rare';
    };
    archive: {
      duration: string; // '7 years'
      storage_class: 's3_glacier';
      access_pattern: 'compliance_only';
    };
  };
  business_rules: {
    retain_active_customers: boolean;
    comply_with_regulations: string[];
    preserve_audit_trail: boolean;
  };
}

const dataLifecyclePolicies: DataTieringPolicy[] = [
  {
    table_name: 'customer_interactions',
    tiers: {
      hot: { duration: '30 days', storage_class: 'ssd', access_pattern: 'frequent' },
      warm: { duration: '180 days', storage_class: 'ssd_cached', access_pattern: 'occasional' },
      cold: { duration: '2 years', storage_class: 'magnetic', access_pattern: 'rare' },
      archive: { duration: '7 years', storage_class: 's3_glacier', access_pattern: 'compliance_only' }
    },
    business_rules: {
      retain_active_customers: true,
      comply_with_regulations: ['GDPR', 'CCPA'],
      preserve_audit_trail: true
    }
  },
  {
    table_name: 'payment_transactions',
    tiers: {
      hot: { duration: '90 days', storage_class: 'ssd', access_pattern: 'frequent' },
      warm: { duration: '1 year', storage_class: 'ssd_cached', access_pattern: 'occasional' },
      cold: { duration: '7 years', storage_class: 'magnetic', access_pattern: 'rare' },
      archive: { duration: '10 years', storage_class: 's3_glacier', access_pattern: 'compliance_only' }
    },
    business_rules: {
      retain_active_customers: true,
      comply_with_regulations: ['SOX', 'PCI_DSS'],
      preserve_audit_trail: true
    }
  }
];

class DataLifecycleManager {
  async executeDataTiering(): Promise<void> {
    for (const policy of dataLifecyclePolicies) {
      // Move data to warm tier
      await this.moveToWarmTier(policy);
      
      // Move data to cold tier
      await this.moveToColdTier(policy);
      
      // Archive old data
      await this.archiveData(policy);
      
      // Delete data beyond retention period (with safeguards)
      await this.deleteExpiredData(policy);
    }
  }
  
  private async moveToWarmTier(policy: DataTieringPolicy): Promise<void> {
    const cutoffDate = this.calculateCutoffDate(policy.tiers.hot.duration);
    
    const warmCandidates = await this.database.query(`
      SELECT id, tenant_id, created_at 
      FROM ${policy.table_name}
      WHERE created_at < $1 
        AND storage_tier = 'hot'
        AND (
          CASE WHEN $2 THEN 
            tenant_id IN (SELECT id FROM tenants WHERE status = 'active')
          ELSE true END
        )
    `, [cutoffDate, policy.business_rules.retain_active_customers]);
    
    for (const record of warmCandidates.rows) {
      await this.transferToWarmStorage(policy.table_name, record.id);
    }
  }
  
  private async deleteExpiredData(policy: DataTieringPolicy): Promise<void> {
    // Calculate retention period based on compliance requirements
    const retentionPeriod = this.calculateRetentionPeriod(
      policy.business_rules.comply_with_regulations
    );
    
    const cutoffDate = this.calculateCutoffDate(retentionPeriod);
    
    // Safety check: require explicit approval for bulk deletions
    const deletionCandidates = await this.database.query(`
      SELECT COUNT(*) as count
      FROM ${policy.table_name}
      WHERE created_at < $1
        AND storage_tier = 'archive'
    `, [cutoffDate]);
    
    if (deletionCandidates.rows[0].count > 10000) {
      await this.requestDeletionApproval(policy.table_name, deletionCandidates.rows[0].count);
    } else {
      await this.executeDataDeletion(policy.table_name, cutoffDate);
    }
  }
}
```

**Compliance-Driven Retention:**
```yaml
# Regulatory compliance retention schedules
retention_policies:
  gdpr:
    description: "EU General Data Protection Regulation"
    default_retention: "6 years" # Statute of limitations
    right_to_erasure: true
    data_portability: true
    
  ccpa:
    description: "California Consumer Privacy Act"
    default_retention: "2 years" # Business records
    right_to_delete: true
    opt_out_sale: true
    
  sox:
    description: "Sarbanes-Oxley Act"
    financial_records: "7 years"
    audit_trails: "7 years"
    destruction_prohibited: true # During investigations
    
  pci_dss:
    description: "Payment Card Industry Data Security Standard"
    cardholder_data: "encrypt_or_delete_immediately"
    transaction_logs: "1 year"
    audit_logs: "1 year"
    
# Business-specific retention rules    
business_retention:
  customer_data:
    active_customers: "retain_indefinitely"
    inactive_customers: "7 years"
    deleted_customers: "30 days" # Grace period for recovery
    
  financial_data:
    invoices: "7 years" # Tax requirements
    payments: "7 years"
    tax_documents: "7 years"
    
  operational_data:
    job_records: "3 years"
    employee_records: "7 years"
    vendor_contracts: "contract_term + 7 years"
```

## Synthetic Data & Masking Framework

### Privacy-Preserving Development

**Data Masking Strategies:**
```typescript
// Intelligent data masking for non-production environments
interface MaskingRule {
  table_name: string;
  column_name: string;
  masking_strategy: 'encrypt' | 'tokenize' | 'substitute' | 'scramble' | 'nullify';
  preserve_format: boolean;
  preserve_relationships: boolean;
  masking_function: string;
}

const maskingRules: MaskingRule[] = [
  {
    table_name: 'customers',
    column_name: 'email',
    masking_strategy: 'substitute',
    preserve_format: true,
    preserve_relationships: true,
    masking_function: 'generate_fake_email_with_domain_preservation'
  },
  {
    table_name: 'customers',
    column_name: 'phone',
    masking_strategy: 'scramble',
    preserve_format: true,
    preserve_relationships: false,
    masking_function: 'scramble_phone_number'
  },
  {
    table_name: 'payments',
    column_name: 'credit_card_number',
    masking_strategy: 'tokenize',
    preserve_format: true,
    preserve_relationships: false,
    masking_function: 'tokenize_credit_card'
  },
  {
    table_name: 'jobs',
    column_name: 'customer_notes',
    masking_strategy: 'substitute',
    preserve_format: false,
    preserve_relationships: false,
    masking_function: 'generate_fake_service_notes'
  }
];

class DataMaskingEngine {
  async createMaskedDataset(sourceSchema: string, targetSchema: string): Promise<void> {
    // 1. Copy schema structure
    await this.copySchemaStructure(sourceSchema, targetSchema);
    
    // 2. Apply masking rules while preserving referential integrity
    for (const rule of maskingRules) {
      await this.applyMaskingRule(sourceSchema, targetSchema, rule);
    }
    
    // 3. Validate data consistency
    await this.validateMaskedData(targetSchema);
    
    // 4. Generate data quality report
    await this.generateMaskingReport(sourceSchema, targetSchema);
  }
  
  private async applyMaskingRule(
    sourceSchema: string, 
    targetSchema: string, 
    rule: MaskingRule
  ): Promise<void> {
    switch (rule.masking_strategy) {
      case 'substitute':
        await this.substituteData(sourceSchema, targetSchema, rule);
        break;
      case 'scramble':
        await this.scrambleData(sourceSchema, targetSchema, rule);
        break;
      case 'tokenize':
        await this.tokenizeData(sourceSchema, targetSchema, rule);
        break;
      case 'encrypt':
        await this.encryptData(sourceSchema, targetSchema, rule);
        break;
      case 'nullify':
        await this.nullifyData(sourceSchema, targetSchema, rule);
        break;
    }
  }
  
  private async substituteData(
    sourceSchema: string, 
    targetSchema: string, 
    rule: MaskingRule
  ): Promise<void> {
    // Generate realistic fake data that maintains referential integrity
    if (rule.preserve_relationships) {
      // Use consistent mapping to preserve relationships
      await this.database.query(`
        WITH consistent_mapping AS (
          SELECT 
            ${rule.column_name} as original_value,
            ${rule.masking_function}(${rule.column_name}, ROW_NUMBER() OVER (ORDER BY id)) as masked_value
          FROM ${sourceSchema}.${rule.table_name}
        )
        UPDATE ${targetSchema}.${rule.table_name} 
        SET ${rule.column_name} = cm.masked_value
        FROM consistent_mapping cm
        WHERE ${targetSchema}.${rule.table_name}.${rule.column_name} = cm.original_value
      `);
    } else {
      // Simple substitution without relationship preservation
      await this.database.query(`
        UPDATE ${targetSchema}.${rule.table_name}
        SET ${rule.column_name} = ${rule.masking_function}(${rule.column_name})
      `);
    }
  }
}
```

**Synthetic Data Generation:**
```python
# AI-powered synthetic data generation
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from faker import Faker
import numpy as np

class SyntheticDataGenerator:
    def __init__(self):
        self.fake = Faker()
        self.models = {}
        
    def generate_synthetic_customers(self, n_customers: int) -> pd.DataFrame:
        # Generate realistic customer data based on patterns from real data
        customers = []
        
        for _ in range(n_customers):
            # Geographic distribution based on real data patterns
            state = np.random.choice(['CA', 'TX', 'FL', 'NY', 'IL'], 
                                   p=[0.25, 0.15, 0.15, 0.20, 0.25])
            
            # Business size correlation
            business_type = np.random.choice(['residential', 'commercial'], 
                                           p=[0.7, 0.3])
            
            if business_type == 'commercial':
                avg_job_value = np.random.normal(2500, 800)
                jobs_per_month = np.random.poisson(8)
            else:
                avg_job_value = np.random.normal(450, 150)
                jobs_per_month = np.random.poisson(2)
            
            customer = {
                'first_name': self.fake.first_name(),
                'last_name': self.fake.last_name(),
                'email': self.fake.email(),
                'phone': self.fake.phone_number(),
                'address': self.fake.address(),
                'city': self.fake.city(),
                'state': state,
                'zip_code': self.fake.zipcode(),
                'business_type': business_type,
                'avg_job_value': max(50, avg_job_value),  # Minimum job value
                'jobs_per_month': jobs_per_month,
                'lifetime_value': avg_job_value * jobs_per_month * np.random.randint(6, 36),
                'acquisition_channel': np.random.choice([
                    'google_ads', 'facebook', 'referral', 'organic', 'yelp'
                ], p=[0.3, 0.2, 0.25, 0.15, 0.1]),
                'signup_date': self.fake.date_between(start_date='-2y', end_date='today')
            }
            customers.append(customer)
        
        return pd.DataFrame(customers)
    
    def generate_correlated_jobs(self, customers_df: pd.DataFrame) -> pd.DataFrame:
        # Generate job data that correlates with customer characteristics
        jobs = []
        
        for _, customer in customers_df.iterrows():
            # Generate jobs based on customer's expected frequency
            num_jobs = np.random.poisson(customer['jobs_per_month'] * 12)  # Annual jobs
            
            for _ in range(num_jobs):
                # Job value correlates with customer's average
                job_value = np.random.normal(customer['avg_job_value'], 
                                           customer['avg_job_value'] * 0.3)
                
                # Seasonal patterns for different service types
                month = np.random.randint(1, 13)
                if customer['business_type'] == 'residential':
                    # Higher demand in spring/summer for residential
                    seasonal_multiplier = 1.5 if month in [4, 5, 6, 7, 8] else 0.8
                else:
                    # More consistent for commercial
                    seasonal_multiplier = 1.0
                
                job_value *= seasonal_multiplier
                
                job = {
                    'customer_id': customer['id'] if 'id' in customer else customer.name,
                    'job_date': self.fake.date_between(
                        start_date=customer['signup_date'], 
                        end_date='today'
                    ),
                    'service_type': np.random.choice([
                        'lawn_care', 'landscaping', 'tree_service', 'irrigation'
                    ]),
                    'job_value': max(25, job_value),  # Minimum job value
                    'status': np.random.choice([
                        'completed', 'completed', 'completed', 'cancelled'
                    ], p=[0.9, 0.05, 0.03, 0.02]),
                    'payment_method': np.random.choice([
                        'credit_card', 'check', 'cash', 'bank_transfer'
                    ], p=[0.6, 0.2, 0.15, 0.05])
                }
                jobs.append(job)
        
        return pd.DataFrame(jobs)
    
    def preserve_statistical_properties(self, synthetic_df: pd.DataFrame, 
                                      real_df: pd.DataFrame) -> pd.DataFrame:
        # Ensure synthetic data maintains statistical properties of real data
        for column in synthetic_df.select_dtypes(include=[np.number]).columns:
            if column in real_df.columns:
                # Match distribution parameters
                real_mean = real_df[column].mean()
                real_std = real_df[column].std()
                synthetic_mean = synthetic_df[column].mean()
                synthetic_std = synthetic_df[column].std()
                
                # Adjust synthetic data to match real distribution
                synthetic_df[column] = (
                    (synthetic_df[column] - synthetic_mean) / synthetic_std * real_std + real_mean
                )
        
        return synthetic_df
```

This comprehensive database architecture provides the robust foundation needed to support millions of SMBs with their complex business operations while maintaining the performance, security, and reliability required for an enterprise-grade AI-powered operating system.
