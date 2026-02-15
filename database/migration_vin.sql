
-- SWIFTPOLICY VIN INTELLIGENCE SCHEMA
-- Module: VIN Vehicle Lookup
-- Version: 1.0.0

CREATE TABLE IF NOT EXISTS vehicle_vin_cache (
    vin VARCHAR(17) PRIMARY KEY,
    make VARCHAR(100),
    model VARCHAR(100),
    year INT,
    fuel_type VARCHAR(50),
    engine_size VARCHAR(50),
    body_type VARCHAR(50),
    color VARCHAR(50),
    vehicle_type VARCHAR(50),
    source VARCHAR(50), -- e.g., 'OFFICIAL_VIN_API', 'MANUAL_AUDIT'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optimize for real-time validation checks
CREATE INDEX IF NOT EXISTS idx_vin_lookup ON vehicle_vin_cache(vin);

-- Optional: Audit log for VIN lookup attempts
CREATE TABLE IF NOT EXISTS vin_lookup_logs (
    id SERIAL PRIMARY KEY,
    vin VARCHAR(17),
    status VARCHAR(20), -- 'SUCCESS', 'NOT_FOUND', 'INVALID', 'ERROR'
    source VARCHAR(50),
    response_time_ms INT,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
