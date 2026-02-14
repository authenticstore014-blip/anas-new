-- SWIFTPOLICY PRODUCTION VEHICLE REGISTRY SCHEMA
-- Supports caching, auditing, and multi-source data attribution.

CREATE TABLE IF NOT EXISTS vehicles (
    registration_number VARCHAR(10) PRIMARY KEY,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year_of_manufacture INT NOT NULL,
    fuel_type VARCHAR(20),
    vehicle_type VARCHAR(20) DEFAULT 'Car',
    vin VARCHAR(17),
    engine_size VARCHAR(15),
    color VARCHAR(30),
    source VARCHAR(30) DEFAULT 'OFFICIAL_API',
    is_commercial BOOLEAN DEFAULT FALSE,
    lookup_count INT DEFAULT 1,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optimization: Index registration for high-speed prefix searches (if applicable)
CREATE INDEX idx_vrm_search ON vehicles(registration_number);
CREATE INDEX idx_vehicle_source ON vehicles(source);

-- Audit Table for API Logs (Compliance)
CREATE TABLE IF NOT EXISTS vehicle_api_logs (
    id SERIAL PRIMARY KEY,
    registration VARCHAR(10),
    api_endpoint VARCHAR(100),
    status_code INT,
    response_time_ms INT,
    request_payload JSONB,
    response_payload JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);