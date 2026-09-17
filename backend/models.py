from typing import List, Optional
from pydantic import BaseModel, Field

class StationOverview(BaseModel):
    id: str
    name: str
    code: str
    latitude: float
    longitude: float
    altitude_m: float
    region: str
    commissioned_year: int
    winter_capacity: int
    summer_capacity: int
    current_occupancy: int
    comms_satellite: str
    description: str
    status: str

class TelemetrySnapshot(BaseModel):
    station_id: str
    timestamp: str
    ambient_temp_c: float
    wind_speed_knots: float
    wind_direction_deg: int
    wind_chill_c: float
    pressure_hpa: float
    relative_humidity_pct: float
    solar_irradiance_wm2: float
    snow_accumulation_cm: float
    ice_thickness_m: float
    current_occupancy: int
    power_demand_kw: float
    power_generated_kw: float
    fuel_level_pct: float
    battery_soc_pct: float
    supply_days_remaining: int
    active_alerts_count: int

class GensetInfo(BaseModel):
    id: str
    name: str
    rated_kw: float
    output_kw: float
    status: str  # RUNNING, STANDBY, MAINTENANCE, FAULT
    fuel_rate_lph: float
    temp_c: float
    vibration_mms: float
    runtime_hours: float

class HourlyEnergyPoint(BaseModel):
    time: str
    diesel_kw: float
    solar_kw: float
    battery_kw: float
    total_generation_kw: float
    base_load_kw: float
    science_load_kw: float
    total_consumption_kw: float

class EnergySystemResponse(BaseModel):
    station_id: str
    diesel_generators: List[GensetInfo]
    solar_pv_kw: float
    battery_soc_pct: float
    battery_net_flow_kw: float
    total_production_kw: float
    total_consumption_kw: float
    grid_stability_pct: float
    hourly_history_24h: List[HourlyEnergyPoint]

class EquipmentHealthItem(BaseModel):
    id: str
    name: str
    subsystem: str  # POWER, HVAC, WATER, COMMS, SCIENTIFIC
    status: str  # NORMAL, WATCH, CRITICAL
    temperature_c: float
    vibration_mms: float
    operating_hours: float
    last_serviced: str
    next_inspection_days: int
    diagnostic_note: str

class InventoryStockItem(BaseModel):
    id: str
    category: str
    name: str
    current_stock: float
    max_capacity: float
    unit: str
    daily_burn: float
    reorder_point: float
    days_remaining: int
    risk_level: str  # LOW, MODERATE, HIGH, CRITICAL

class VoyageSchedule(BaseModel):
    id: str
    mission: str
    transit_mode: str  # POLAR_VESSEL, AIR_CARGO, TRAVERSE
    vessel_or_flight: str
    origin_port: str
    destination: str
    departure_date: str
    eta: str
    days_to_eta: int
    cargo_tons: float
    status: str
    weather_viable: bool
    tracking_stage: str  # PORT_PREP, SOUTHERN_OCEAN, FAST_ICE_APPROACH, OFF_LOADING, SECURED

class LogisticsResponse(BaseModel):
    station_id: str
    inventory: List[InventoryStockItem]
    schedules: List[VoyageSchedule]
    overall_resupply_risk: str  # LOW, ELEVATED, CRITICAL
    critical_stock_count: int
    supply_days_autonomy: int

class EnvironmentalReading(BaseModel):
    timestamp: str
    temperature_c: float
    wind_chill_c: float
    wind_speed_knots: float
    wind_gust_knots: float
    air_quality_pm25: float
    station_co2_ppm: float
    co_emissions_ppm: float
    ice_thickness_m: float
    snow_accumulation_cm: float

class AlertItem(BaseModel):
    id: str
    station_id: str
    severity: str  # INFO, WARNING, CRITICAL
    subsystem: str
    title: str
    detail: str
    timestamp: str
    acknowledged: bool = False

class SimulationUpdateRequest(BaseModel):
    station_id: Optional[str] = "maitri"
    weather_condition: Optional[str] = None  # CALM, MODERATE, BLIZZARD, SEVERE_STORM
    fuel_level_pct: Optional[float] = None
    battery_soc_pct: Optional[float] = None
    gen2_fault: Optional[bool] = None
    comms_status: Optional[str] = None  # OPTIMAL, DEGRADED, BLACKOUT
    outside_temp_c: Optional[float] = None

class OperationalInsightResponse(BaseModel):
    station_id: str
    health_index_pct: int
    readiness_status: str  # MISSION_READY, CAUTION_ADVISED, EMERGENCY_DEFENSE
    executive_summary: str
    key_recommendations: List[str]
    critical_anomalies: List[str]
    power_balance_eval: str
    weather_impact_advisory: str
