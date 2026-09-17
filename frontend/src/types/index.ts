export type StationId = 'maitri' | 'bharati';

export interface StationInfo {
  id: StationId;
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  altitude_m: number;
  region: string;
  commissioned_year: number;
  winter_capacity: number;
  summer_capacity: number;
  current_occupancy: number;
  comms_satellite: string;
  description: string;
  status: string;
}

export interface TelemetryData {
  station_id: StationId;
  timestamp: string;
  ambient_temp_c: number;
  wind_speed_knots: number;
  wind_gust_knots: number;
  wind_direction_deg: number;
  wind_chill_c: number;
  pressure_hpa: number;
  relative_humidity_pct: number;
  solar_irradiance_wm2: number;
  snow_accumulation_cm: number;
  ice_thickness_m: number;
  current_occupancy: number;
  power_demand_kw: number;
  power_generated_kw: number;
  fuel_level_pct: number;
  battery_soc_pct: number;
  supply_days_remaining: number;
  active_alerts_count: number;
}

export interface GensetInfo {
  id: string;
  name: string;
  rated_kw: number;
  output_kw: number;
  status: 'RUNNING' | 'STANDBY' | 'MAINTENANCE' | 'FAULT';
  fuel_rate_lph: number;
  temp_c: number;
  vibration_mms: number;
  runtime_hours: number;
}

export interface HourlyEnergyPoint {
  time: string;
  diesel_kw: number;
  solar_kw: number;
  battery_kw: number;
  total_generation_kw: number;
  base_load_kw: number;
  science_load_kw: number;
  total_consumption_kw: number;
}

export interface EnergyData {
  station_id: StationId;
  diesel_generators: GensetInfo[];
  solar_pv_kw: number;
  battery_soc_pct: number;
  battery_net_flow_kw: number;
  total_production_kw: number;
  total_consumption_kw: number;
  grid_stability_pct: number;
  hourly_history_24h: HourlyEnergyPoint[];
}

export interface EquipmentItem {
  id: string;
  name: string;
  subsystem: 'POWER' | 'HVAC' | 'WATER' | 'COMMS' | 'SCIENTIFIC';
  status: 'NORMAL' | 'WATCH' | 'CRITICAL';
  temperature_c: number;
  vibration_mms: number;
  operating_hours: number;
  last_serviced: string;
  next_inspection_days: number;
  diagnostic_note: string;
}

export interface InventoryStockItem {
  id: string;
  category: 'FUEL' | 'FOOD' | 'MEDICINE' | 'SCIENTIFIC' | 'CRITICAL_SPARES';
  name: string;
  current_stock: number;
  max_capacity: number;
  unit: string;
  daily_burn: number;
  reorder_point: number;
  days_remaining: number;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
}

export interface VoyageSchedule {
  id: string;
  mission: string;
  transit_mode: 'POLAR_VESSEL' | 'AIR_CARGO' | 'TRAVERSE';
  vessel_or_flight: string;
  origin_port: string;
  destination: string;
  departure_date: string;
  eta: string;
  days_to_eta: number;
  cargo_tons: number;
  status: string;
  weather_viable: boolean;
  tracking_stage: 'PORT_PREP' | 'SOUTHERN_OCEAN' | 'FAST_ICE_APPROACH' | 'OFF_LOADING' | 'SECURED' | 'PRE_FLIGHT_WINDOW' | 'STAGING_ICE_SHELF';
}

export interface LogisticsData {
  station_id: StationId;
  inventory: InventoryStockItem[];
  schedules: VoyageSchedule[];
  overall_resupply_risk: 'LOW' | 'ELEVATED' | 'CRITICAL';
  critical_stock_count: number;
  supply_days_autonomy: number;
}

export interface EnvironmentalTrendPoint {
  timestamp: string;
  temperature_c: number;
  wind_chill_c: number;
  wind_speed_knots: number;
  wind_gust_knots: number;
  air_quality_pm25: number;
  station_co2_ppm: number;
  co_emissions_ppm: number;
  ice_thickness_m: number;
  snow_accumulation_cm: number;
}

export interface EnvironmentalThresholdAlert {
  severity: 'WARNING' | 'CRITICAL';
  title: string;
  message: string;
}

export interface EnvironmentalData {
  station_id: StationId;
  current: EnvironmentalTrendPoint;
  trends_24h: EnvironmentalTrendPoint[];
  threshold_alerts: EnvironmentalThresholdAlert[];
}

export interface AlertItem {
  id: string;
  station_id: StationId;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  subsystem: string;
  title: string;
  detail: string;
  timestamp: string;
  acknowledged?: boolean;
}

export interface OperationalInsight {
  station_id: StationId;
  health_index_pct: number;
  readiness_status: 'MISSION_READY' | 'CAUTION_ADVISED' | 'EMERGENCY_DEFENSE';
  executive_summary: string;
  key_recommendations: string[];
  critical_anomalies: string[];
  power_balance_eval: string;
  weather_impact_advisory: string;
}

export interface SimulationParams {
  station_id: StationId;
  weather_condition: 'CALM' | 'MODERATE' | 'BLIZZARD' | 'SEVERE_STORM';
  fuel_level_pct: number;
  battery_soc_pct: number;
  gen2_fault: boolean;
  comms_status: 'OPTIMAL' | 'DEGRADED' | 'BLACKOUT';
  outside_temp_c?: number;
}
