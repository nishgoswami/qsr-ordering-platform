-- PRODUCTION: Auto-Approve Admin User
-- Run this AFTER the admin user signs up
-- Replace YOUR_EMAIL with the actual admin email

UPDATE restaurants 
SET 
    approval_status = 'approved',
    is_active = true,
    subscription_status = 'active',
    subscription_tier = 'pro', -- Give admin full access
    approved_at = NOW(),
    approved_by = id -- Self-approved
WHERE email = 'YOUR_EMAIL_HERE'
RETURNING id, name, email, approval_status, is_active;

-- Verify the update worked
SELECT 
    r.id,
    r.name,
    r.email,
    r.approval_status,
    r.is_active,
    s.first_name || ' ' || s.last_name as owner_name,
    s.role
FROM restaurants r
JOIN staff s ON s.restaurant_id = r.id
WHERE r.email = 'YOUR_EMAIL_HERE';
