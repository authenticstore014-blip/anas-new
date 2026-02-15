
# SwiftPolicy Enterprise VIN Module Deployment Guide

## Prerequisites
- Cloud PostgreSQL or MySQL instance.
- Node.js v18+ environment.
- Official Vehicle Data Provider API Keys.

## 1. Database Migration
Execute the `database/migration_vin.sql` script on your production database. This creates the `vehicle_vin_cache` table and relevant performance indices.

## 2. Environment Variables
Add the following to your production `.env` or CI/CD secrets:
```bash
VIN_API_KEY=your_secured_key_here
VIN_API_URL=https://api.provider.com/v1/vin
DATABASE_URL=postgres://user:pass@host:5432/db
RATE_LIMIT_MAX=100
```

## 3. Backend Deployment
The VIN module is located in `/api/vin-lookup.js`. Ensure your Express application routes this path:
```javascript
import vinRouter from './api/vin-lookup';
app.use('/api', vinRouter);
```

## 4. Frontend Integration
The `QuotePage.tsx` has been updated to include the `VinLookupField`. This component handles debouncing and real-time state synchronization with the main form.

## 5. Security Checklist
- [x] CORS configured for `swiftpolicy.co.uk`.
- [x] Rate limiting enabled on `/api/vin-lookup`.
- [x] Winston logging active for audit trails.
- [x] VIN regex validation enforced at API entry.
- [x] Database prepared statements utilized via ORM/Driver.

## 6. Testing Pipeline
Run the provided test scripts in `/tests/vin.test.js` before finalizing deployment.
- `npm test tests/vin.test.js`
