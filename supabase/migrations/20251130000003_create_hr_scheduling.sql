-- ============================================================================
-- HUMAN RESOURCES & SCHEDULING
-- Staff scheduling, time-off requests, and shift management
-- ============================================================================

-- ============================================================================
-- 1. SHIFTS TABLE
-- ============================================================================
CREATE TYPE shift_status AS ENUM (
  'scheduled',      -- Shift is scheduled
  'in_progress',    -- Staff clocked in
  'completed',      -- Shift finished
  'cancelled',      -- Shift cancelled
  'no_show'         -- Staff didn't show up
);

CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Shift details
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  -- Actual times (clock in/out)
  actual_start_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ,
  
  -- Break times
  break_duration_minutes INTEGER DEFAULT 0,
  actual_break_minutes INTEGER DEFAULT 0,
  
  -- Position/Role for this shift
  position VARCHAR(100), -- e.g., 'Kitchen Manager', 'Server', 'Cashier'
  
  -- Location (for multi-location organizations)
  location_id UUID REFERENCES organizations(id),
  
  -- Notes
  notes TEXT,
  
  -- Status
  status shift_status DEFAULT 'scheduled',
  
  -- Approval (for shift swaps or changes)
  requires_approval BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shifts_org ON shifts(organization_id);
CREATE INDEX idx_shifts_user ON shifts(user_id);
CREATE INDEX idx_shifts_date ON shifts(shift_date);
CREATE INDEX idx_shifts_status ON shifts(status);
CREATE INDEX idx_shifts_location ON shifts(location_id) WHERE location_id IS NOT NULL;

ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view their own shifts"
  ON shifts FOR SELECT
  USING (
    user_id = auth.uid() OR
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
  );

CREATE POLICY "Managers can manage all shifts"
  ON shifts FOR ALL
  USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid AND
    (auth.jwt() ->> 'role') IN ('admin', 'owner', 'manager')
  );

CREATE POLICY "Staff can clock in/out"
  ON shifts FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- 2. TIME_OFF_REQUESTS TABLE
-- ============================================================================
CREATE TYPE time_off_type AS ENUM (
  'vacation',
  'sick',
  'personal',
  'unpaid',
  'bereavement',
  'other'
);

CREATE TYPE request_status AS ENUM (
  'pending',
  'approved',
  'denied',
  'cancelled'
);

CREATE TABLE time_off_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Request details
  request_type time_off_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- Timing
  is_full_day BOOLEAN DEFAULT true,
  start_time TIME,
  end_time TIME,
  
  -- Total hours/days
  total_hours DECIMAL(5, 2),
  total_days INTEGER GENERATED ALWAYS AS (end_date - start_date + 1) STORED,
  
  -- Request info
  reason TEXT,
  notes TEXT,
  
  -- Approval workflow
  status request_status DEFAULT 'pending',
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_time_off_org ON time_off_requests(organization_id);
CREATE INDEX idx_time_off_user ON time_off_requests(user_id);
CREATE INDEX idx_time_off_status ON time_off_requests(status);
CREATE INDEX idx_time_off_dates ON time_off_requests(start_date, end_date);

ALTER TABLE time_off_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view their own requests"
  ON time_off_requests FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Staff can create requests"
  ON time_off_requests FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
  );

CREATE POLICY "Managers can view all requests"
  ON time_off_requests FOR SELECT
  USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid AND
    (auth.jwt() ->> 'role') IN ('admin', 'owner', 'manager')
  );

CREATE POLICY "Managers can approve/deny requests"
  ON time_off_requests FOR UPDATE
  USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid AND
    (auth.jwt() ->> 'role') IN ('admin', 'owner', 'manager')
  );

-- ============================================================================
-- 3. STAFF_AVAILABILITY TABLE
-- ============================================================================
CREATE TABLE staff_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Day of week (0=Sunday, 1=Monday, etc.)
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  
  -- Availability window
  available_start TIME NOT NULL,
  available_end TIME NOT NULL,
  
  -- Status
  is_available BOOLEAN DEFAULT true,
  
  -- Notes
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate entries
  UNIQUE(user_id, day_of_week)
);

CREATE INDEX idx_staff_availability_user ON staff_availability(user_id);

ALTER TABLE staff_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage their availability"
  ON staff_availability FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Managers can view all availability"
  ON staff_availability FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM users 
      WHERE organization_id = (auth.jwt() ->> 'organization_id')::uuid
    )
  );

-- ============================================================================
-- 4. SHIFT_SWAPS TABLE
-- ============================================================================
CREATE TABLE shift_swaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Original shift
  original_shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  original_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Swap details
  swap_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Request
  reason TEXT,
  
  -- Approval
  status request_status DEFAULT 'pending',
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shift_swaps_original_shift ON shift_swaps(original_shift_id);
CREATE INDEX idx_shift_swaps_status ON shift_swaps(status);

ALTER TABLE shift_swaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view swaps involving them"
  ON shift_swaps FOR SELECT
  USING (
    original_user_id = auth.uid() OR
    swap_user_id = auth.uid()
  );

CREATE POLICY "Staff can request swaps"
  ON shift_swaps FOR INSERT
  WITH CHECK (original_user_id = auth.uid());

CREATE POLICY "Managers can manage swaps"
  ON shift_swaps FOR ALL
  USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid AND
    (auth.jwt() ->> 'role') IN ('admin', 'owner', 'manager')
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get staff schedule for a date range
CREATE OR REPLACE FUNCTION get_staff_schedule(
  org_id UUID,
  start_date_param DATE,
  end_date_param DATE
)
RETURNS TABLE(
  shift_id UUID,
  staff_name VARCHAR,
  shift_date DATE,
  start_time TIME,
  end_time TIME,
  position VARCHAR,
  status shift_status
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    (u.full_name) as staff_name,
    s.shift_date,
    s.start_time,
    s.end_time,
    s.position,
    s.status
  FROM shifts s
  JOIN users u ON u.id = s.user_id
  WHERE 
    s.organization_id = org_id
    AND s.shift_date BETWEEN start_date_param AND end_date_param
  ORDER BY s.shift_date, s.start_time;
END;
$$ LANGUAGE plpgsql;

-- Check for scheduling conflicts
CREATE OR REPLACE FUNCTION check_shift_conflict(
  user_id_param UUID,
  shift_date_param DATE,
  start_time_param TIME,
  end_time_param TIME,
  exclude_shift_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO conflict_count
  FROM shifts
  WHERE 
    user_id = user_id_param
    AND shift_date = shift_date_param
    AND status NOT IN ('cancelled', 'no_show')
    AND (id != exclude_shift_id OR exclude_shift_id IS NULL)
    AND (
      (start_time, end_time) OVERLAPS (start_time_param, end_time_param)
    );
  
  RETURN conflict_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Calculate total hours worked in a period
CREATE OR REPLACE FUNCTION calculate_hours_worked(
  user_id_param UUID,
  start_date_param DATE,
  end_date_param DATE
)
RETURNS DECIMAL AS $$
DECLARE
  total_hours DECIMAL;
BEGIN
  SELECT COALESCE(SUM(
    EXTRACT(EPOCH FROM (actual_end_time - actual_start_time)) / 3600 - 
    (actual_break_minutes / 60.0)
  ), 0) INTO total_hours
  FROM shifts
  WHERE 
    user_id = user_id_param
    AND shift_date BETWEEN start_date_param AND end_date_param
    AND status = 'completed'
    AND actual_start_time IS NOT NULL
    AND actual_end_time IS NOT NULL;
  
  RETURN total_hours;
END;
$$ LANGUAGE plpgsql;

-- Get pending time-off requests
CREATE OR REPLACE FUNCTION get_pending_time_off_requests(org_id UUID)
RETURNS TABLE(
  request_id UUID,
  staff_name VARCHAR,
  request_type time_off_type,
  start_date DATE,
  end_date DATE,
  total_days INTEGER,
  reason TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tor.id,
    u.full_name,
    tor.request_type,
    tor.start_date,
    tor.end_date,
    tor.total_days,
    tor.reason,
    tor.created_at
  FROM time_off_requests tor
  JOIN users u ON u.id = tor.user_id
  WHERE 
    tor.organization_id = org_id
    AND tor.status = 'pending'
  ORDER BY tor.created_at;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Prevent scheduling during approved time off
CREATE OR REPLACE FUNCTION prevent_shift_during_time_off()
RETURNS TRIGGER AS $$
DECLARE
  time_off_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO time_off_count
  FROM time_off_requests
  WHERE 
    user_id = NEW.user_id
    AND status = 'approved'
    AND NEW.shift_date BETWEEN start_date AND end_date;
  
  IF time_off_count > 0 THEN
    RAISE EXCEPTION 'Cannot schedule shift during approved time off';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_time_off_before_shift
  BEFORE INSERT OR UPDATE ON shifts
  FOR EACH ROW
  EXECUTE FUNCTION prevent_shift_during_time_off();

-- Auto-update shift status when clocking in/out
CREATE OR REPLACE FUNCTION update_shift_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.actual_start_time IS NOT NULL AND NEW.actual_end_time IS NULL THEN
    NEW.status = 'in_progress';
  ELSIF NEW.actual_end_time IS NOT NULL THEN
    NEW.status = 'completed';
  END IF;
  
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER shift_status_update
  BEFORE UPDATE ON shifts
  FOR EACH ROW
  WHEN (OLD.actual_start_time IS DISTINCT FROM NEW.actual_start_time OR 
        OLD.actual_end_time IS DISTINCT FROM NEW.actual_end_time)
  EXECUTE FUNCTION update_shift_status();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE shifts IS 'Staff work shifts with scheduled and actual times';
COMMENT ON TABLE time_off_requests IS 'Time off requests (vacation, sick leave, etc.)';
COMMENT ON TABLE staff_availability IS 'Staff recurring weekly availability preferences';
COMMENT ON TABLE shift_swaps IS 'Shift swap requests between staff members';

COMMENT ON COLUMN shifts.actual_break_minutes IS 'Actual break time taken (calculated or manually entered)';
COMMENT ON FUNCTION check_shift_conflict IS 'Returns true if shift overlaps with existing shift for user';
