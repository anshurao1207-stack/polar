-- PolarTwin PostgreSQL Schema
-- Digital Twin Framework for Maitri & Bharati Antarctic Research Stations
-- National Centre for Polar and Ocean Research (NCPOR) / Ministry of Earth Sciences

-- 1. STATIONS TABLE
CREATE TABLE IF NOT EXISTS stations (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    official_code VARCHAR(32) NOT NULL,
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    altitude_meters NUMERIC(6, 2) NOT NULL,
    region VARCHAR(128) NOT NULL,
    commissioned_year INTEGER NOT NULL,
    summer_capacity INTEGER NOT NULL,
    winter_capacity INTEGER NOT NULL,
    comms_sat VARCHAR(64) NOT NULL,
    status VARCHAR(32) DEFAULT 'OPERATIONAL',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TELEMETRY READINGS (Time-series / Hypertable ready)
CREATE TABLE IF NOT EXISTS telemetry_readings (
    id BIGSERIAL PRIMARY KEY,
    station_id VARCHAR(32) REFERENCES stations(id) ON DELETE CASCADE,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ambient_temp_c DECIMAL(5, 2) NOT NULL,
    wind_speed_knots DECIMAL(5, 2) NOT NULL,
    wind_direction_deg INTEGER NOT NULL,
    wind_chill_c DECIMAL(5, 2) NOT NULL,
    atmospheric_pressure_hpa DECIMAL(6, 2) NOT NULL,
    relative_humidity_pct DECIMAL(5, 2) NOT NULL,
    solar_irradiance_wm2 DECIMAL(6, 2) DEFAULT 0.0,
    snow_accumulation_cm DECIMAL(6, 2) DEFAULT 0.0,
    ice_thickness_m DECIMAL(4, 2) DEFAULT 0.0,
    occupancy_current INTEGER NOT NULL,
    power_demand_kw DECIMAL(6, 2) NOT NULL,
    power_generated_kw DECIMAL(6, 2) NOT NULL,
    fuel_level_pct DECIMAL(5, 2) NOT NULL,
    battery_soc_pct DECIMAL(5, 2) NOT NULL,
    supply_days_autonomy INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_telemetry_station_time ON telemetry_readings(station_id, recorded_at DESC);

-- 3. ENERGY SYSTEMS & GENSETS
CREATE TABLE IF NOT EXISTS energy_subsystems (
    id VARCHAR(64) PRIMARY KEY,
    station_id VARCHAR(32) REFERENCES stations(id) ON DELETE CASCADE,
    system_name VARCHAR(128) NOT NULL,
    system_type VARCHAR(64) NOT NULL, -- DIESEL_GENSET, SOLAR_ARRAY, BESS_BATTERY, HEAT_RECOVERY
    rated_capacity_kw DECIMAL(7, 2) NOT NULL,
    current_output_kw DECIMAL(7, 2) NOT NULL,
    operating_status VARCHAR(32) NOT NULL, -- RUNNING, STANDBY, MAINTENANCE, FAULT
    fuel_consumption_lph DECIMAL(5, 2) DEFAULT 0.0,
    efficiency_pct DECIMAL(5, 2) NOT NULL,
    runtime_hours NUMERIC(10, 2) NOT NULL,
    last_service_date DATE,
    next_service_due DATE
);

-- 4. EQUIPMENT HEALTH MONITORING
CREATE TABLE IF NOT EXISTS equipment_health (
    id VARCHAR(64) PRIMARY KEY,
    station_id VARCHAR(32) REFERENCES stations(id) ON DELETE CASCADE,
    component_name VARCHAR(128) NOT NULL,
    subsystem VARCHAR(64) NOT NULL, -- POWER, WATER_MAKER, HVAC, COMM, SCIENTIFIC
    health_status VARCHAR(16) NOT NULL CHECK (health_status IN ('NORMAL', 'WATCH', 'CRITICAL')),
    temperature_c DECIMAL(5, 2) NOT NULL,
    vibration_mms DECIMAL(5, 2) NOT NULL,
    operating_hours NUMERIC(10, 2) NOT NULL,
    firmware_version VARCHAR(32),
    alert_triggered BOOLEAN DEFAULT FALSE,
    last_inspected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_equip_status ON equipment_health(station_id, health_status);

-- 5. LOGISTICS & INVENTORY
CREATE TABLE IF NOT EXISTS inventory_stocks (
    id VARCHAR(64) PRIMARY KEY,
    station_id VARCHAR(32) REFERENCES stations(id) ON DELETE CASCADE,
    item_category VARCHAR(64) NOT NULL, -- FUEL_JET_A1, FUEL_HSD, FOOD_RATIONS, MEDICAL, SCIENCE_GASES, CRITICAL_SPARES
    item_name VARCHAR(128) NOT NULL,
    current_stock NUMERIC(12, 2) NOT NULL,
    max_capacity NUMERIC(12, 2) NOT NULL,
    unit_of_measure VARCHAR(32) NOT NULL,
    daily_burn_rate NUMERIC(8, 2) NOT NULL,
    reorder_threshold NUMERIC(12, 2) NOT NULL,
    days_remaining INTEGER NOT NULL,
    risk_level VARCHAR(16) DEFAULT 'LOW' CHECK (risk_level IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. RESUPPLY VOYAGES & FLIGHT SCHEDULES
CREATE TABLE IF NOT EXISTS resupply_schedules (
    id VARCHAR(64) PRIMARY KEY,
    mission_code VARCHAR(64) NOT NULL,
    destination_station_id VARCHAR(32) REFERENCES stations(id) ON DELETE CASCADE,
    transit_mode VARCHAR(32) NOT NULL, -- POLAR_RESEARCH_VESSEL, DROMLAN_CARGO_FLIGHT, HELICOPTER_TRAVERSE
    vessel_or_flight_name VARCHAR(128) NOT NULL,
    departure_port VARCHAR(128) NOT NULL,
    departure_date DATE NOT NULL,
    estimated_arrival DATE NOT NULL,
    status VARCHAR(32) NOT NULL, -- PRE_VOYAGE, IN_TRANSIT, BERTHED_ICE_SHELF, OFF_LOADING, COMPLETED, DELAYED
    cargo_payload_tons NUMERIC(8, 2) NOT NULL,
    passenger_count INTEGER DEFAULT 0,
    weather_window_viable BOOLEAN DEFAULT TRUE,
    notes TEXT
);

-- 7. ACTIVE ALERTS & MISSION INCIDENTS
CREATE TABLE IF NOT EXISTS alerts (
    id BIGSERIAL PRIMARY KEY,
    station_id VARCHAR(32) REFERENCES stations(id) ON DELETE CASCADE,
    code VARCHAR(64) NOT NULL,
    severity VARCHAR(16) NOT NULL CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL')),
    subsystem VARCHAR(64) NOT NULL,
    title VARCHAR(256) NOT NULL,
    detail TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    acknowledged BOOLEAN DEFAULT FALSE,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts(station_id, is_active, severity);

-- 8. INITIAL SEED DATA FOR DEMO / REFERENCE
INSERT INTO stations (id, name, official_code, latitude, longitude, altitude_meters, region, commissioned_year, summer_capacity, winter_capacity, comms_sat)
VALUES 
('maitri', 'Maitri Research Station', 'IND-ANT-02', -70.765833, 11.735833, 130.00, 'Schirmacher Oasis, Queen Maud Land', 1989, 65, 25, 'Inmarsat / GSAT-7A'),
('bharati', 'Bharati Research Station', 'IND-ANT-03', -69.408056, 76.187222, 35.00, 'Larsemann Hills, Prydz Bay', 2012, 47, 24, 'GSAT-7A / VSAT Ku-Band')
ON CONFLICT (id) DO NOTHING;
