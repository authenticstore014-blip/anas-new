
-- SWIFTPOLICY CLIENT MANAGEMENT SCHEMA
-- Module: Admin User Management
-- Version: 1.1.0

-- 1. Ensure User Status Support
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='status') THEN
        ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'Active';
    END IF;
END $$;

-- 2. Audit Logging for Administrative Actions
CREATE TABLE IF NOT EXISTS user_audit_logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    admin_id VARCHAR(50) NOT NULL,
    admin_email VARCHAR(100),
    target_user_id VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL, -- 'STATUS_CHANGE', 'PWD_RESET', 'SOFT_DELETE'
    details TEXT,
    ip_address VARCHAR(45),
    reason TEXT
);

-- 3. Optimization
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON user_audit_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_user_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_status ON users(status);

-- 4. Initial Role Seeding (Safety Check)
-- INSERT INTO users (id, name, email, role, status) 
-- VALUES ('admin-gen-1', 'System Admin', 'admin@swiftpolicy.co.uk', 'admin', 'Active')
-- ON CONFLICT (email) DO NOTHING;
