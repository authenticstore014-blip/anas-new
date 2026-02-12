# SwiftPolicy MID Integration Middleware

## Overview
This module handles the real-time and batch submission of policy data to the UK Motor Insurers' Bureau (MIB) Motor Insurance Database (MID).

## Integration Method
- **Protocol**: HTTPS POST with XML Payload (Soap 1.1/1.2).
- **Endpoint**: `https://api.mib.org.uk/mid/upload/v3` (Production).
- **Authentication**: HMAC-SHA256 Signed Headers + Insurer Certificate.

## Data Flow
1. **Trigger**: `midQueue.submit(policyId)` called in purchase flow.
2. **Queue**: Policy is added to `mid_submissions` with `Pending` status.
3. **Job Processor**: Background worker picks up `Pending` records every 60s.
4. **Validation**: VRM, Dates, and Cover Type are verified against MIB XSD.
5. **Submission**: XML payload transmitted via encrypted channel.
6. **Persistence**: HTTP response codes and MIB transaction IDs logged to `mid_submissions`.

## Error Handling & Retries
- **Soft Fail (5xx/Network)**: Automatically retried up to 3 times at 5-minute intervals.
- **Hard Fail (4xx/Validation)**: Submission marked as `Failed`. Internal alert triggered for manual review.
- **Manual Override**: Admins can force re-submission via the `/admin/mid-status` dashboard.

## Compliance
- Adheres to **Continuous Insurance Enforcement (CIE)** regulations.
- Complies with **GDPR** data processing requirements.
- Transactions logged for 7 years for auditing.
