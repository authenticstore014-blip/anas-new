
# SwiftPolicy Admin Client Management Deployment Guide

## Overview
This module enables full administrative oversight of client accounts, including status control, credential resets, and audit logging.

## Deployment Checklist

### 1. Database Migration
Run the SQL script `database/migration_clients.sql` on your production instance.
- Adds `status` column to `users` if missing.
- Creates `user_audit_logs` table.
- Optimizes user lookup indices.

### 2. Backend Routing
Mount the new admin routes in your main Express app:
```javascript
const adminUserRoutes = require('./routes/adminUserRoutes');
app.use('/api/admin/users', adminMiddleware, adminUserRoutes);
```

### 3. Middleware Configuration
Ensure `adminRoleMiddleware.js` is active for all management routes.
- Verifies `role === 'admin'`.
- Validates JWT tokens.
- Prevents horizontal privilege escalation.

### 4. Zero-Downtime Strategy
1. **Prepare Phase**: Run DB migrations (Non-breaking).
2. **Deploy Phase**: Update backend services with new controllers.
3. **Frontend Phase**: Push updated `CustomerCenterPage` and `AuthContext`.
4. **Validation Phase**: Perform login test on suspended vs active accounts.

## Rollback Procedure
1. Revert application code to previous commit.
2. The DB changes (Column addition) are backward compatible and do not require rollback unless storage constraints exist.
