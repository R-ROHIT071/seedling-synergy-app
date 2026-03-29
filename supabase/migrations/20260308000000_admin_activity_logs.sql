-- Admin Activity Logs Migration
-- Create admin_logs table to track all user actions for audit purposes

CREATE TABLE admin_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout', etc.
  entity_type TEXT NOT NULL, -- 'user', 'product', 'order', 'verification', 'forum', etc.
  entity_id UUID, -- ID of the affected entity
  old_values JSONB, -- Previous values for updates
  new_values JSONB, -- New values for creates/updates
  metadata JSONB, -- Additional context (IP, user agent, etc.)
  performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Admin who performed the action
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view logs
CREATE POLICY "Admins can view all logs" ON admin_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- System can insert logs (via service role)
CREATE POLICY "Service can insert logs" ON admin_logs
  FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_admin_logs_user_id ON admin_logs(user_id);
CREATE INDEX idx_admin_logs_entity_type ON admin_logs(entity_type);
CREATE INDEX idx_admin_logs_entity_id ON admin_logs(entity_id);
CREATE INDEX idx_admin_logs_created_at ON admin_logs(created_at DESC);
CREATE INDEX idx_admin_logs_action_type ON admin_logs(action_type);

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  p_user_id UUID,
  p_action_type TEXT,
  p_entity_type TEXT,
  p_entity_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL,
  p_performed_by UUID DEFAULT auth.uid()
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO admin_logs (
    user_id,
    action_type,
    entity_type,
    entity_id,
    old_values,
    new_values,
    metadata,
    performed_by
  ) VALUES (
    p_user_id,
    p_action_type,
    p_entity_type,
    p_entity_id,
    p_old_values,
    p_new_values,
    p_metadata,
    p_performed_by
  )
  RETURNING id INTO log_id;

  RETURN log_id;
END;
$$;