-- ============================================================================
-- CHANGE REQUEST TICKETING SYSTEM
-- For franchise owners to request menu/recipe changes from brand owner
-- ============================================================================

-- ============================================================================
-- 1. CHANGE_TICKETS TABLE
-- ============================================================================
CREATE TYPE ticket_type AS ENUM (
  'recipe_change',      -- Request to modify brand recipe
  'menu_addition',      -- Request to add new item to menu
  'price_change',       -- Request to change pricing
  'modifier_change',    -- Request to change modifiers
  'feature_request',    -- General feature request
  'bug_report',         -- Report an issue
  'other'               -- Other requests
);

CREATE TYPE ticket_priority AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

CREATE TYPE ticket_status_enum AS ENUM (
  'open',               -- Newly created
  'in_review',          -- Being reviewed by brand owner
  'approved',           -- Change approved
  'rejected',           -- Change rejected
  'implemented',        -- Change has been implemented
  'closed'              -- Ticket closed
);

CREATE TABLE change_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Ticket info
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  ticket_type ticket_type NOT NULL,
  priority ticket_priority DEFAULT 'medium',
  
  -- Reference to related entity
  reference_id UUID, -- Recipe ID, Menu Item ID, etc.
  reference_type VARCHAR(50), -- 'recipe', 'menu_item', 'category', etc.
  
  -- Current vs Proposed changes (JSONB)
  current_data JSONB,
  proposed_changes JSONB,
  /* Example for recipe change:
    current_data: {
      "ingredients": [...],
      "instructions": "...",
      "prep_time": 30
    }
    proposed_changes: {
      "ingredients": [...updated list...],
      "reason": "Local sourcing of ingredients"
    }
  */
  
  -- Requester
  created_by UUID NOT NULL REFERENCES users(id),
  
  -- Assignment
  assigned_to UUID REFERENCES users(id),
  assigned_at TIMESTAMPTZ,
  
  -- Status workflow
  status ticket_status_enum DEFAULT 'open',
  
  -- Review/Decision
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  decision_notes TEXT,
  
  -- Implementation
  implemented_by UUID REFERENCES users(id),
  implemented_at TIMESTAMPTZ,
  
  -- Attachments
  attachments JSONB DEFAULT '[]',
  /* Example:
    [
      {
        "url": "https://...",
        "filename": "image.jpg",
        "uploaded_at": "2024-01-01T00:00:00Z"
      }
    ]
  */
  
  -- Tags for categorization
  tags TEXT[],
  
  -- SLA tracking
  due_date DATE,
  resolved_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tickets_org ON change_tickets(organization_id);
CREATE INDEX idx_tickets_created_by ON change_tickets(created_by);
CREATE INDEX idx_tickets_assigned_to ON change_tickets(assigned_to);
CREATE INDEX idx_tickets_status ON change_tickets(status);
CREATE INDEX idx_tickets_type ON change_tickets(ticket_type);
CREATE INDEX idx_tickets_priority ON change_tickets(priority);
CREATE INDEX idx_tickets_reference ON change_tickets(reference_type, reference_id) 
  WHERE reference_id IS NOT NULL;

ALTER TABLE change_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tickets from their organization"
  ON change_tickets FOR SELECT
  USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid OR
    created_by = auth.uid() OR
    assigned_to = auth.uid()
  );

CREATE POLICY "Users can create tickets"
  ON change_tickets FOR INSERT
  WITH CHECK (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid AND
    created_by = auth.uid()
  );

CREATE POLICY "Ticket owners can update their tickets"
  ON change_tickets FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Admins can manage all tickets"
  ON change_tickets FOR ALL
  USING (
    (auth.jwt() ->> 'role') IN ('admin', 'owner')
  );

-- ============================================================================
-- 2. TICKET_COMMENTS TABLE
-- ============================================================================
CREATE TABLE ticket_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES change_tickets(id) ON DELETE CASCADE,
  
  -- Comment content
  comment_text TEXT NOT NULL,
  
  -- Author
  created_by UUID NOT NULL REFERENCES users(id),
  
  -- Attachments
  attachments JSONB DEFAULT '[]',
  
  -- Internal notes (visible only to admins/managers)
  is_internal BOOLEAN DEFAULT false,
  
  -- Edited tracking
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ticket_comments_ticket ON ticket_comments(ticket_id, created_at);
CREATE INDEX idx_ticket_comments_author ON ticket_comments(created_by);

ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments on accessible tickets"
  ON ticket_comments FOR SELECT
  USING (
    ticket_id IN (
      SELECT id FROM change_tickets
      WHERE organization_id = (auth.jwt() ->> 'organization_id')::uuid
        OR created_by = auth.uid()
        OR assigned_to = auth.uid()
    )
    AND (
      is_internal = false OR
      (auth.jwt() ->> 'role') IN ('admin', 'owner', 'manager')
    )
  );

CREATE POLICY "Users can add comments to accessible tickets"
  ON ticket_comments FOR INSERT
  WITH CHECK (
    created_by = auth.uid() AND
    ticket_id IN (
      SELECT id FROM change_tickets
      WHERE organization_id = (auth.jwt() ->> 'organization_id')::uuid
        OR created_by = auth.uid()
        OR assigned_to = auth.uid()
    )
  );

CREATE POLICY "Authors can update their comments"
  ON ticket_comments FOR UPDATE
  USING (created_by = auth.uid());

-- ============================================================================
-- 3. TICKET_ACTIVITY_LOG TABLE
-- ============================================================================
CREATE TYPE activity_type AS ENUM (
  'created',
  'status_changed',
  'priority_changed',
  'assigned',
  'commented',
  'approved',
  'rejected',
  'implemented',
  'closed'
);

CREATE TABLE ticket_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES change_tickets(id) ON DELETE CASCADE,
  
  -- Activity details
  activity_type activity_type NOT NULL,
  
  -- Changes made
  old_value TEXT,
  new_value TEXT,
  
  -- Actor
  performed_by UUID REFERENCES users(id),
  
  -- Additional data
  metadata JSONB,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ticket_activity_ticket ON ticket_activity_log(ticket_id, created_at DESC);

ALTER TABLE ticket_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activity for accessible tickets"
  ON ticket_activity_log FOR SELECT
  USING (
    ticket_id IN (
      SELECT id FROM change_tickets
      WHERE organization_id = (auth.jwt() ->> 'organization_id')::uuid
        OR created_by = auth.uid()
        OR assigned_to = auth.uid()
    )
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get ticket statistics for organization
CREATE OR REPLACE FUNCTION get_ticket_stats(org_id UUID)
RETURNS TABLE(
  total_tickets BIGINT,
  open_tickets BIGINT,
  in_review_tickets BIGINT,
  approved_tickets BIGINT,
  rejected_tickets BIGINT,
  avg_resolution_days DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_tickets,
    COUNT(*) FILTER (WHERE status = 'open') as open_tickets,
    COUNT(*) FILTER (WHERE status = 'in_review') as in_review_tickets,
    COUNT(*) FILTER (WHERE status = 'approved') as approved_tickets,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected_tickets,
    AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 86400) FILTER (WHERE resolved_at IS NOT NULL) as avg_resolution_days
  FROM change_tickets
  WHERE organization_id = org_id;
END;
$$ LANGUAGE plpgsql;

-- Get user's ticket queue
CREATE OR REPLACE FUNCTION get_user_ticket_queue(user_id_param UUID)
RETURNS TABLE(
  ticket_id UUID,
  title VARCHAR,
  ticket_type ticket_type,
  priority ticket_priority,
  status ticket_status_enum,
  created_at TIMESTAMPTZ,
  days_open INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ct.id,
    ct.title,
    ct.ticket_type,
    ct.priority,
    ct.status,
    ct.created_at,
    (EXTRACT(EPOCH FROM (NOW() - ct.created_at)) / 86400)::INTEGER as days_open
  FROM change_tickets ct
  WHERE 
    (ct.created_by = user_id_param OR ct.assigned_to = user_id_param)
    AND ct.status NOT IN ('closed', 'implemented')
  ORDER BY 
    CASE ct.priority
      WHEN 'urgent' THEN 1
      WHEN 'high' THEN 2
      WHEN 'medium' THEN 3
      WHEN 'low' THEN 4
    END,
    ct.created_at;
END;
$$ LANGUAGE plpgsql;

-- Get overdue tickets
CREATE OR REPLACE FUNCTION get_overdue_tickets(org_id UUID)
RETURNS TABLE(
  ticket_id UUID,
  title VARCHAR,
  priority ticket_priority,
  assigned_to_name VARCHAR,
  due_date DATE,
  days_overdue INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ct.id,
    ct.title,
    ct.priority,
    u.full_name,
    ct.due_date,
    (CURRENT_DATE - ct.due_date)::INTEGER as days_overdue
  FROM change_tickets ct
  LEFT JOIN users u ON u.id = ct.assigned_to
  WHERE 
    ct.organization_id = org_id
    AND ct.status NOT IN ('closed', 'implemented')
    AND ct.due_date < CURRENT_DATE
  ORDER BY days_overdue DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Log ticket activity on status change
CREATE OR REPLACE FUNCTION log_ticket_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Log status changes
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO ticket_activity_log (ticket_id, activity_type, old_value, new_value, performed_by)
    VALUES (NEW.id, 'status_changed', OLD.status::TEXT, NEW.status::TEXT, auth.uid());
    
    -- Set resolved_at when status changes to closed/implemented
    IF NEW.status IN ('closed', 'implemented') AND OLD.status NOT IN ('closed', 'implemented') THEN
      NEW.resolved_at = NOW();
    END IF;
  END IF;
  
  -- Log priority changes
  IF TG_OP = 'UPDATE' AND OLD.priority IS DISTINCT FROM NEW.priority THEN
    INSERT INTO ticket_activity_log (ticket_id, activity_type, old_value, new_value, performed_by)
    VALUES (NEW.id, 'priority_changed', OLD.priority::TEXT, NEW.priority::TEXT, auth.uid());
  END IF;
  
  -- Log assignments
  IF TG_OP = 'UPDATE' AND OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
    INSERT INTO ticket_activity_log (ticket_id, activity_type, old_value, new_value, performed_by)
    VALUES (NEW.id, 'assigned', OLD.assigned_to::TEXT, NEW.assigned_to::TEXT, auth.uid());
  END IF;
  
  -- Log creation
  IF TG_OP = 'INSERT' THEN
    INSERT INTO ticket_activity_log (ticket_id, activity_type, performed_by)
    VALUES (NEW.id, 'created', NEW.created_by);
  END IF;
  
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ticket_activity_logger
  BEFORE INSERT OR UPDATE ON change_tickets
  FOR EACH ROW
  EXECUTE FUNCTION log_ticket_activity();

-- Update ticket's updated_at on new comment
CREATE OR REPLACE FUNCTION update_ticket_on_comment()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE change_tickets
  SET updated_at = NOW()
  WHERE id = NEW.ticket_id;
  
  INSERT INTO ticket_activity_log (ticket_id, activity_type, performed_by)
  VALUES (NEW.ticket_id, 'commented', NEW.created_by);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ticket_comment_updater
  AFTER INSERT ON ticket_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_on_comment();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE change_tickets IS 'Change request tickets for franchise owners to request modifications from brand owner';
COMMENT ON TABLE ticket_comments IS 'Comments and discussions on change tickets';
COMMENT ON TABLE ticket_activity_log IS 'Audit trail of all ticket changes and activities';

COMMENT ON COLUMN change_tickets.proposed_changes IS 'JSONB object with proposed modifications and reasoning';
COMMENT ON COLUMN ticket_comments.is_internal IS 'Internal notes visible only to admins/managers';
