import {
  StationInfo,
  TelemetryData,
  EnergyData,
  EquipmentItem,
  LogisticsData,
  EnvironmentalData,
  AlertItem,
  OperationalInsight,
  HourlyEnergyPoint,
  SimulationParams,
  StationId
} from '../types';

export const initialStations: Record<StationId, StationInfo> = {
  maitri: {
    id: 'maitri',
    name: 'Maitri Research Station',
    code: 'IND-ANT-02',
    latitude: -70.765833,
    longitude: 11.735833,
    altitude_m: 130.0,
    region: 'Schirmacher Oasis, Queen Maud Land',
    commissioned_year: 1989,
    winter_capacity: 25,
    summer_capacity: 65,
    current_occupancy: 23,
    comms_satellite: 'GSAT-7A / Inmarsat-C',
    description: "India's second permanent Antarctic research base, situated in an ice-free rocky oasis on the shores of Lake Priyadarshini. Specializes in meteorology, geomagnetism, and glaciology.",
    status: 'OPERATIONAL'
  },
  bharati: {
    id: 'bharati',
    name: 'Bharati Research Station',
    code: 'IND-ANT-03',
    latitude: -69.408056,
    longitude: 76.187222,
    altitude_m: 35.0,
    region: 'Larsemann Hills, Prydz Bay',
    commissioned_year: 2012,
    winter_capacity: 24,
    summer_capacity: 47,
    current_occupancy: 21,
    comms_satellite: 'Dedicated VSAT Ku-Band / NRSC Earth Station',
    description: 'State-of-the-art third Antarctic base constructed on aerodynamic stilts using 134 interlinked containers. Equipped with cutting-edge oceanography, atmospheric chemistry, and satellite telemetry labs.',
    status: 'OPERATIONAL'
  }
};

export const defaultSimParams: Record<StationId, SimulationParams> = {
  maitri: {
    station_id: 'maitri',
    weather_condition: 'MODERATE',
    fuel_level_pct: 74.5,
    battery_soc_pct: 82.0,
    gen2_fault: false,
    comms_status: 'OPTIMAL',
    outside_temp_c: -26.4
  },
  bharati: {
    station_id: 'bharati',
    weather_condition: 'CALM',
    fuel_level_pct: 88.2,
    battery_soc_pct: 94.0,
    gen2_fault: false,
    comms_status: 'OPTIMAL',
    outside_temp_c: -18.2
  }
};

export function computeMockTelemetry(stationId: StationId, sim: SimulationParams): TelemetryData {
  const isMaitri = stationId === 'maitri';
  let temp = isMaitri ? -26.4 : -18.2;
  let wind = 28.0;
  let gust = 41.0;
  let press = 984.0;
  let hum = 65.0;
  let snow = isMaitri ? 45.0 : 38.0;

  if (sim.weather_condition === 'CALM') {
    temp = isMaitri ? -21.0 : -14.0;
    wind = 12.5;
    gust = 18.0;
    press = 998.2;
    hum = 48.0;
  } else if (sim.weather_condition === 'BLIZZARD') {
    temp = isMaitri ? -34.5 : -28.0;
    wind = 58.5;
    gust = 74.0;
    press = 961.0;
    hum = 88.0;
    snow += 65.0;
  } else if (sim.weather_condition === 'SEVERE_STORM') {
    temp = isMaitri ? -42.0 : -35.0;
    wind = 84.0;
    gust = 106.0;
    press = 948.0;
    hum = 95.0;
    snow += 120.0;
  }

  if (sim.outside_temp_c !== undefined) {
    temp = sim.outside_temp_c;
  }

  const windChill = Math.round(13.12 + 0.6215 * temp - 11.37 * Math.pow(wind, 0.16) + 0.3965 * temp * Math.pow(wind, 0.16));
  const baseDemand = isMaitri ? 82.0 : 96.0;
  const stormExtra = (sim.weather_condition === 'BLIZZARD' || sim.weather_condition === 'SEVERE_STORM') ? 24.0 : 0;
  const powerDemand = baseDemand + stormExtra;
  const powerGen = sim.gen2_fault ? Math.max(powerDemand - 12.0, 68.0) : powerDemand + 14.0;

  const totalCap = isMaitri ? 180000 : 220000;
  const currentFuelLiters = (sim.fuel_level_pct / 100) * totalCap;
  const burn = stormExtra > 0 ? 520 : 440;
  const supplyDays = Math.floor(currentFuelLiters / burn);

  let activeAlerts = 0;
  if (sim.gen2_fault) activeAlerts++;
  if (sim.weather_condition === 'BLIZZARD' || sim.weather_condition === 'SEVERE_STORM') activeAlerts++;
  if (sim.fuel_level_pct < 35) activeAlerts++;
  if (sim.battery_soc_pct < 30) activeAlerts++;
  if (sim.comms_status !== 'OPTIMAL') activeAlerts++;

  return {
    station_id: stationId,
    timestamp: new Date().toISOString(),
    ambient_temp_c: Math.round(temp * 10) / 10,
    wind_speed_knots: Math.round(wind * 10) / 10,
    wind_gust_knots: Math.round(gust * 10) / 10,
    wind_direction_deg: isMaitri ? 165 : 140,
    wind_chill_c: windChill,
    pressure_hpa: Math.round(press * 10) / 10,
    relative_humidity_pct: hum,
    solar_irradiance_wm2: !isMaitri && sim.weather_condition === 'CALM' ? 180 : 25,
    snow_accumulation_cm: Math.round(snow),
    ice_thickness_m: isMaitri ? 2.15 : 1.85,
    current_occupancy: isMaitri ? 23 : 21,
    power_demand_kw: Math.round(powerDemand * 10) / 10,
    power_generated_kw: Math.round(powerGen * 10) / 10,
    fuel_level_pct: Math.round(sim.fuel_level_pct * 10) / 10,
    battery_soc_pct: Math.round(sim.battery_soc_pct * 10) / 10,
    supply_days_remaining: supplyDays,
    active_alerts_count: activeAlerts
  };
}

export function computeMockEnergy(stationId: StationId, sim: SimulationParams): EnergyData {
  const isMaitri = stationId === 'maitri';
  const isBadWeather = sim.weather_condition === 'BLIZZARD' || sim.weather_condition === 'SEVERE_STORM';

  const gensets = isMaitri
    ? [
        {
          id: 'MTR-DG-1',
          name: 'DG-1 (Cummins 125 kVA)',
          rated_kw: 100,
          output_kw: 68.5,
          status: 'RUNNING' as const,
          fuel_rate_lph: 18.2,
          temp_c: 84.2,
          vibration_mms: 2.8,
          runtime_hours: 8420.5
        },
        {
          id: 'MTR-DG-2',
          name: 'DG-2 (Cummins 125 kVA)',
          rated_kw: 100,
          output_kw: sim.gen2_fault ? 0 : isBadWeather ? 34.0 : 0,
          status: sim.gen2_fault ? ('FAULT' as const) : isBadWeather ? ('RUNNING' as const) : ('STANDBY' as const),
          fuel_rate_lph: sim.gen2_fault || !isBadWeather ? 0 : 9.8,
          temp_c: sim.gen2_fault ? 108.6 : 78.4,
          vibration_mms: sim.gen2_fault ? 8.4 : 2.1,
          runtime_hours: 6140.0
        },
        {
          id: 'MTR-DG-3',
          name: 'DG-3 (Cummins 125 kVA Emergency)',
          rated_kw: 100,
          output_kw: sim.gen2_fault ? 48.0 : 0,
          status: sim.gen2_fault ? ('RUNNING' as const) : ('STANDBY' as const),
          fuel_rate_lph: sim.gen2_fault ? 13.5 : 0,
          temp_c: sim.gen2_fault ? 79.5 : 24.0,
          vibration_mms: sim.gen2_fault ? 2.4 : 0,
          runtime_hours: 2340.2
        }
      ]
    : [
        {
          id: 'BHT-DG-1',
          name: 'DG-1 (Volvo Penta 160 kVA)',
          rated_kw: 130,
          output_kw: 74.0,
          status: 'RUNNING' as const,
          fuel_rate_lph: 20.4,
          temp_c: 81.5,
          vibration_mms: 1.9,
          runtime_hours: 7120.0
        },
        {
          id: 'BHT-DG-2',
          name: 'DG-2 (Volvo Penta 160 kVA)',
          rated_kw: 130,
          output_kw: sim.gen2_fault ? 0 : isBadWeather ? 38.0 : 0,
          status: sim.gen2_fault ? ('FAULT' as const) : isBadWeather ? ('RUNNING' as const) : ('STANDBY' as const),
          fuel_rate_lph: sim.gen2_fault || !isBadWeather ? 0 : 10.5,
          temp_c: sim.gen2_fault ? 112.4 : 76.8,
          vibration_mms: sim.gen2_fault ? 8.8 : 1.8,
          runtime_hours: 5890.4
        },
        {
          id: 'BHT-DG-3',
          name: 'DG-3 (Volvo Penta 160 kVA Peaker)',
          rated_kw: 130,
          output_kw: sim.gen2_fault ? 44.0 : 0,
          status: sim.gen2_fault ? ('RUNNING' as const) : ('STANDBY' as const),
          fuel_rate_lph: sim.gen2_fault ? 12.0 : 0,
          temp_c: sim.gen2_fault ? 80.0 : 22.0,
          vibration_mms: sim.gen2_fault ? 2.0 : 0,
          runtime_hours: 1980.0
        }
      ];

  const solar = !isMaitri ? (sim.weather_condition === 'CALM' ? 32.5 : sim.weather_condition === 'MODERATE' ? 14.2 : 1.5) : 3.2;
  const totalDiesel = gensets.reduce((acc, g) => acc + g.output_kw, 0);
  const totalLoad = isMaitri ? 84.0 : 104.0;
  const flow = sim.gen2_fault ? 16.0 : -8.5;

  const history: HourlyEnergyPoint[] = [];
  const hours = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
  hours.forEach((time, idx) => {
    const isDay = idx >= 3 && idx <= 8;
    const sol = !isMaitri && isDay ? (sim.weather_condition === 'CALM' ? 28 + Math.sin(idx) * 8 : 8) : 2;
    const base = isMaitri ? 52 + Math.sin(idx * 0.5) * 6 : 64 + Math.sin(idx * 0.5) * 8;
    const sci = 28 + Math.cos(idx * 0.7) * 5;
    const cons = Math.round(base + sci + (isBadWeather ? 18 : 0));
    const diesel = Math.round(Math.max(35, cons - sol + (idx % 2 === 0 ? 4 : -3)));
    history.push({
      time,
      diesel_kw: diesel,
      solar_kw: Math.round(sol * 10) / 10,
      battery_kw: Math.round(Math.abs(flow) * (0.8 + 0.2 * Math.sin(idx)) * 10) / 10,
      total_generation_kw: Math.round((diesel + sol) * 10) / 10,
      base_load_kw: Math.round(base),
      science_load_kw: Math.round(sci),
      total_consumption_kw: cons
    });
  });

  return {
    station_id: stationId,
    diesel_generators: gensets,
    solar_pv_kw: Math.round(solar * 10) / 10,
    battery_soc_pct: Math.round(sim.battery_soc_pct * 10) / 10,
    battery_net_flow_kw: Math.round(flow * 10) / 10,
    total_production_kw: Math.round((totalDiesel + solar) * 10) / 10,
    total_consumption_kw: Math.round(totalLoad * 10) / 10,
    grid_stability_pct: sim.gen2_fault ? 86.2 : 99.4,
    hourly_history_24h: history
  };
}

export function computeMockEquipment(stationId: StationId, sim: SimulationParams): EquipmentItem[] {
  const isMaitri = stationId === 'maitri';
  return [
    {
      id: `${stationId.toUpperCase()}-POW-DG1`,
      name: 'Main Genset DG-1',
      subsystem: 'POWER',
      status: 'NORMAL',
      temperature_c: 82.4,
      vibration_mms: 2.2,
      operating_hours: 8420.0,
      last_serviced: '2026-08-14',
      next_inspection_days: 18,
      diagnostic_note: 'Lube oil pressure stable at 4.2 bar; exhaust temp nominal.'
    },
    {
      id: `${stationId.toUpperCase()}-POW-DG2`,
      name: 'Aux Genset DG-2',
      subsystem: 'POWER',
      status: sim.gen2_fault ? 'CRITICAL' : 'NORMAL',
      temperature_c: sim.gen2_fault ? 109.8 : 77.1,
      vibration_mms: sim.gen2_fault ? 8.4 : 1.9,
      operating_hours: 6140.0,
      last_serviced: '2026-07-28',
      next_inspection_days: sim.gen2_fault ? 0 : 4,
      diagnostic_note: sim.gen2_fault
        ? 'CRITICAL: High harmonic vibration (>8.4 mm/s) & bearing thermal spike. Tripped.'
        : 'Standby sync controller responding within 120ms.'
    },
    {
      id: `${stationId.toUpperCase()}-BESS-01`,
      name: 'Lithium Iron BESS Bank',
      subsystem: 'POWER',
      status: sim.battery_soc_pct < 30 ? 'WATCH' : 'NORMAL',
      temperature_c: 19.5,
      vibration_mms: 0.1,
      operating_hours: 12840.0,
      last_serviced: '2026-06-02',
      next_inspection_days: 42,
      diagnostic_note: sim.battery_soc_pct < 30
        ? 'Low SOC reserve state warning. Grid charge priority active.'
        : 'Cell balance delta 0.012V across 192 cells.'
    },
    {
      id: `${stationId.toUpperCase()}-WTR-PLANT`,
      name: isMaitri ? 'Priyadarshini Lake Intake Pump' : 'Desalination RO High-Pressure Unit',
      subsystem: 'WATER',
      status: sim.weather_condition === 'BLIZZARD' || sim.weather_condition === 'SEVERE_STORM' ? 'WATCH' : 'NORMAL',
      temperature_c: 3.8,
      vibration_mms: 1.4,
      operating_hours: 4210.0,
      last_serviced: '2026-08-29',
      next_inspection_days: 12,
      diagnostic_note: 'Pipeline trace-heating active (1.8 kWt) preventing slush freeze-up.'
    },
    {
      id: `${stationId.toUpperCase()}-HVAC-RECOV`,
      name: 'Waste Heat Recovery Glycol Circuit',
      subsystem: 'HVAC',
      status: 'NORMAL',
      temperature_c: 72.0,
      vibration_mms: 1.1,
      operating_hours: 15400.0,
      last_serviced: '2026-08-01',
      next_inspection_days: 25,
      diagnostic_note: 'Thermal loop circulating at 68 L/min; module ambient +21.5°C.'
    },
    {
      id: `${stationId.toUpperCase()}-COMMS-SAT`,
      name: isMaitri ? 'GSAT-7A Dish Antenna' : 'NRSC Ground Telemetry Radome',
      subsystem: 'COMMS',
      status: sim.comms_status === 'BLACKOUT' ? 'CRITICAL' : sim.comms_status === 'DEGRADED' ? 'WATCH' : 'NORMAL',
      temperature_c: -12.4,
      vibration_mms: sim.weather_condition === 'SEVERE_STORM' ? 4.2 : 0.8,
      operating_hours: 21000.0,
      last_serviced: '2026-05-18',
      next_inspection_days: 60,
      diagnostic_note:
        sim.comms_status === 'BLACKOUT'
          ? 'CRITICAL: Link carrier lost. Autonomous beacon mode triggered.'
          : sim.comms_status === 'DEGRADED'
          ? 'High bit error rate (BER 1.2e-4). Bulk transfers queued.'
          : 'Carrier SNR 17.2 dB nominal. Ground station tracking locked.'
    },
    {
      id: `${stationId.toUpperCase()}-SCI-MET`,
      name: 'Atmospheric Physics Acoustic Sounder (SODAR)',
      subsystem: 'SCIENTIFIC',
      status: 'NORMAL',
      temperature_c: sim.outside_temp_c ?? -24.0,
      vibration_mms: 0.6,
      operating_hours: 9840.0,
      last_serviced: '2026-07-15',
      next_inspection_days: 35,
      diagnostic_note: 'Boundary layer inversion acoustic echoes streaming to science NAS.'
    }
  ];
}

export function computeMockLogistics(stationId: StationId, sim: SimulationParams): LogisticsData {
  const isMaitri = stationId === 'maitri';
  const totalCap = isMaitri ? 180000 : 220000;
  const currentFuel = Math.round((sim.fuel_level_pct / 100) * totalCap);
  const burn = sim.weather_condition === 'BLIZZARD' || sim.weather_condition === 'SEVERE_STORM' ? 520 : 440;
  const fuelDays = Math.floor(currentFuel / burn);

  const inventory = [
    {
      id: 'STK-FUEL-POLAR',
      category: 'FUEL' as const,
      name: 'Polar Winterized ATF / Special Low-Pour HSD',
      current_stock: currentFuel,
      max_capacity: totalCap,
      unit: 'Liters',
      daily_burn: burn,
      reorder_point: 45000,
      days_remaining: fuelDays,
      risk_level: fuelDays < 35 ? ('CRITICAL' as const) : fuelDays < 70 ? ('HIGH' as const) : fuelDays < 120 ? ('MODERATE' as const) : ('LOW' as const)
    },
    {
      id: 'STK-FOOD-RAT',
      category: 'FOOD' as const,
      name: 'Freeze-Dried & High-Calorie Polar Rations',
      current_stock: 7850,
      max_capacity: 10000,
      unit: 'Kg',
      daily_burn: 34.5,
      reorder_point: 2500,
      days_remaining: 227,
      risk_level: 'LOW' as const
    },
    {
      id: 'STK-MED-ESS',
      category: 'MEDICINE' as const,
      name: 'Emergency Surgical Packs & Trauma Anesthetics',
      current_stock: 142,
      max_capacity: 160,
      unit: 'Kits',
      daily_burn: 0.15,
      reorder_point: 40,
      days_remaining: 940,
      risk_level: 'LOW' as const
    },
    {
      id: 'STK-SCI-CRY',
      category: 'SCIENTIFIC' as const,
      name: 'Liquid Helium & Nitrogen Pressurized Dewars',
      current_stock: 38,
      max_capacity: 60,
      unit: 'Cylinders',
      daily_burn: 0.28,
      reorder_point: 15,
      days_remaining: 135,
      risk_level: 'MODERATE' as const
    },
    {
      id: 'STK-SPR-GEN',
      category: 'CRITICAL_SPARES' as const,
      name: 'Cummins/Volvo Turbochargers, Injectors & Alternator Sets',
      current_stock: 18,
      max_capacity: 24,
      unit: 'Sets',
      daily_burn: 0.05,
      reorder_point: 6,
      days_remaining: 360,
      risk_level: 'LOW' as const
    }
  ];

  const schedules = [
    {
      id: 'VOY-44-VASILIY',
      mission: '44th Indian Antarctic Expedition Resupply Voyage',
      transit_mode: 'POLAR_VESSEL' as const,
      vessel_or_flight: 'MV Vasiliy Golovnin (Class-Arc7 Cargo Icebreaker)',
      origin_port: 'Port of Cape Town, South Africa',
      destination: `${isMaitri ? 'Maitri' : 'Bharati'} Fast Ice Offload Anchorage`,
      departure_date: '2026-11-20',
      eta: '2026-12-08',
      days_to_eta: 81,
      cargo_tons: 640.0,
      status: 'STAGING_CARGO',
      weather_viable: true,
      tracking_stage: 'PORT_PREP' as const
    },
    {
      id: 'FLT-DROMLAN-04',
      mission: 'DROMLAN Polar Airlift Network Flight #4',
      transit_mode: 'AIR_CARGO' as const,
      vessel_or_flight: 'Ilyushin IL-76TD-90VD (Heavy Ski Cargo)',
      origin_port: 'Cape Town Int Airport (CPT)',
      destination: isMaitri ? 'Novo Blue Ice Runway (Schirmacher)' : 'Larsemann Hills Skiway',
      departure_date: '2026-10-14',
      eta: '2026-10-14',
      days_to_eta: 26,
      cargo_tons: 18.5,
      status: 'SCHEDULED',
      weather_viable: sim.weather_condition === 'CALM' || sim.weather_condition === 'MODERATE',
      tracking_stage: 'PRE_FLIGHT_WINDOW' as const
    },
    {
      id: 'TRV-PISTON-02',
      mission: 'Shelter & Fuel Bladder Traverse Convoy',
      transit_mode: 'TRAVERSE' as const,
      vessel_or_flight: 'Kässbohrer PistenBully 300 Polar Convoy (4 Vehicles)',
      origin_port: 'India Bay Ice Shelf Depot',
      destination: `${isMaitri ? 'Maitri' : 'Bharati'} Main Complex`,
      departure_date: '2026-09-24',
      eta: '2026-09-27',
      days_to_eta: 6,
      cargo_tons: 42.0,
      status: sim.weather_condition === 'BLIZZARD' || sim.weather_condition === 'SEVERE_STORM' ? 'HOLD_AT_DEPOT' : 'EN_ROUTE',
      weather_viable: sim.weather_condition !== 'BLIZZARD' && sim.weather_condition !== 'SEVERE_STORM',
      tracking_stage: 'STAGING_ICE_SHELF' as const
    }
  ];

  const critCount = inventory.filter((i) => i.risk_level === 'HIGH' || i.risk_level === 'CRITICAL').length;
  const overallRisk = fuelDays < 45 || critCount >= 2 ? ('CRITICAL' as const) : fuelDays < 90 || critCount >= 1 ? ('ELEVATED' as const) : ('LOW' as const);

  return {
    station_id: stationId,
    inventory,
    schedules,
    overall_resupply_risk: overallRisk,
    critical_stock_count: critCount,
    supply_days_autonomy: fuelDays
  };
}

export function computeMockEnvironmental(stationId: StationId, sim: SimulationParams): EnvironmentalData {
  const isMaitri = stationId === 'maitri';
  const trends: EnvironmentalData['trends_24h'] = [];
  const hours = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
  const baseTemp = sim.outside_temp_c ?? (isMaitri ? -26.4 : -18.2);
  const isStorm = sim.weather_condition === 'BLIZZARD' || sim.weather_condition === 'SEVERE_STORM';

  hours.forEach((h, idx) => {
    const t = Math.round((baseTemp + Math.sin(idx * 0.5) * 3) * 10) / 10;
    const wSpd = Math.round((isStorm ? 62 + Math.cos(idx) * 14 : 22 + Math.cos(idx) * 8) * 10) / 10;
    const gust = Math.round(wSpd * 1.35 * 10) / 10;
    const chill = Math.round(13.12 + 0.6215 * t - 11.37 * Math.pow(wSpd, 0.16) + 0.3965 * t * Math.pow(wSpd, 0.16));
    trends.push({
      timestamp: h,
      temperature_c: t,
      wind_chill_c: chill,
      wind_speed_knots: wSpd,
      wind_gust_knots: gust,
      air_quality_pm25: Math.round((1.1 + 0.2 * (idx % 3)) * 100) / 100,
      station_co2_ppm: Math.round(412 + Math.sin(idx) * 14),
      co_emissions_ppm: Math.round((sim.gen2_fault ? 3.4 : 1.8 + Math.cos(idx) * 0.2) * 10) / 10,
      ice_thickness_m: isMaitri ? 2.15 : 1.85,
      snow_accumulation_cm: Math.round(42 + (isStorm ? idx * 4.5 : idx * 0.2))
    });
  });

  const current = trends[trends.length - 1];
  const thresholdAlerts: EnvironmentalData['threshold_alerts'] = [];

  if (current.wind_speed_knots >= 50) {
    thresholdAlerts.push({
      severity: 'CRITICAL',
      title: 'Category 2/3 Severe Gale Advisory',
      message: `Sustained wind speed ${current.wind_speed_knots} knots. Outside egress strictly forbidden; life-ropes tensioned.`
    });
  }
  if (current.temperature_c <= -32) {
    thresholdAlerts.push({
      severity: 'WARNING',
      title: 'Deep Freeze Polar Protocol Active',
      message: `Ambient temperature ${current.temperature_c}°C with wind chill ${current.wind_chill_c}°C. Maximum 15 min outdoor exposure.`
    });
  }
  if (sim.gen2_fault) {
    thresholdAlerts.push({
      severity: 'WARNING',
      title: 'Genset Exhaust Stack CO Spike',
      message: 'Elevated carbon monoxide and particulate levels recorded on generator flue manifold.'
    });
  }

  return {
    station_id: stationId,
    current,
    trends_24h: trends,
    threshold_alerts: thresholdAlerts
  };
}

export function computeMockAlerts(stationId: StationId, sim: SimulationParams): AlertItem[] {
  const alerts: AlertItem[] = [];
  const now = new Date().toLocaleTimeString();

  if (sim.gen2_fault) {
    alerts.push({
      id: 'ALT-POW-002',
      station_id: stationId,
      severity: 'CRITICAL',
      subsystem: 'POWER',
      title: 'Genset DG-2 High Vibration & Bearing Thermal Runaway',
      detail: 'Vibration sensor exceeded threshold (8.4 mm/s). Engine safety tripped; backup DG-3 auto-cranked.',
      timestamp: now,
      acknowledged: false
    });
  }

  if (sim.weather_condition === 'BLIZZARD' || sim.weather_condition === 'SEVERE_STORM') {
    alerts.push({
      id: 'ALT-ENV-001',
      station_id: stationId,
      severity: sim.weather_condition === 'SEVERE_STORM' ? 'CRITICAL' : 'WARNING',
      subsystem: 'WEATHER',
      title: 'Severe Blizzard Emergency Protocol Active',
      detail: 'Barometric pressure dropping sharply; gusts exceeding 75+ knots. Inter-building movement halted.',
      timestamp: now,
      acknowledged: true
    });
  }

  if (sim.fuel_level_pct < 35) {
    alerts.push({
      id: 'ALT-LOG-004',
      station_id: stationId,
      severity: sim.fuel_level_pct < 20 ? 'CRITICAL' : 'WARNING',
      subsystem: 'LOGISTICS',
      title: 'Polar Diesel Reserve Below Operational Buffer',
      detail: `Fuel storage tank at ${sim.fuel_level_pct}%. Defer non-essential science heaters and load shed auxiliary labs.`,
      timestamp: now,
      acknowledged: false
    });
  }

  if (sim.battery_soc_pct < 35) {
    alerts.push({
      id: 'ALT-POW-009',
      station_id: stationId,
      severity: 'WARNING',
      subsystem: 'ENERGY',
      title: 'BESS Battery Bank Low State of Charge',
      detail: `Storage bank SOC at ${sim.battery_soc_pct}%. Grid inverter prioritized for survival living modules.`,
      timestamp: now,
      acknowledged: false
    });
  }

  if (sim.comms_status === 'BLACKOUT') {
    alerts.push({
      id: 'ALT-COM-001',
      station_id: stationId,
      severity: 'CRITICAL',
      subsystem: 'COMMS',
      title: 'Complete Satellite Comms Uplink Blackout',
      detail: 'Primary Ku-band and secondary Iridium links severed. Autonomous failover logging active.',
      timestamp: now,
      acknowledged: false
    });
  } else if (sim.comms_status === 'DEGRADED') {
    alerts.push({
      id: 'ALT-COM-002',
      station_id: stationId,
      severity: 'INFO',
      subsystem: 'COMMS',
      title: 'Satellite Bandwidth Throttled (Degraded)',
      detail: 'Solar magnetic disturbance causing packet jitter. High-throughput science streams paused.',
      timestamp: now,
      acknowledged: true
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      id: 'ALT-SYS-NOMINAL',
      station_id: stationId,
      severity: 'INFO',
      subsystem: 'SYSTEM',
      title: 'Station Digital Twin Nominal',
      detail: 'All power generation, life support, environmental sensors, and telemetry are functioning within nominal parameters.',
      timestamp: now,
      acknowledged: true
    });
  }

  return alerts;
}

export function computeMockInsights(stationId: StationId, sim: SimulationParams): OperationalInsight {
  let health = 98;
  if (sim.gen2_fault) health -= 25;
  if (sim.weather_condition === 'SEVERE_STORM') health -= 20;
  else if (sim.weather_condition === 'BLIZZARD') health -= 12;
  if (sim.fuel_level_pct < 30) health -= 18;
  else if (sim.fuel_level_pct < 50) health -= 8;
  if (sim.battery_soc_pct < 30) health -= 10;
  if (sim.comms_status === 'BLACKOUT') health -= 15;
  else if (sim.comms_status === 'DEGRADED') health -= 5;

  health = Math.max(18, Math.min(100, health));

  const recs: string[] = [];
  const anom: string[] = [];

  if (sim.gen2_fault) {
    anom.push('DG-2 forced shutdown due to abnormal bearing vibration (8.4 mm/s).');
    recs.push('Isolate DG-2 fuel injector rail and dispatch mechanical engineer for harmonic damper inspection.');
    recs.push('Verify DG-3 governor frequency stability during high dinner hour culinary & galley loads (18:00 - 20:30 UTC).');
  }

  if (sim.weather_condition === 'BLIZZARD' || sim.weather_condition === 'SEVERE_STORM') {
    anom.push(`Antarctic storm advisory: gusts exceeding ${sim.weather_condition === 'BLIZZARD' ? 75 : 105} knots.`);
    recs.push('Initiate Red Egress protocol: restrict all inter-building movement unless hooked to steel safety guide ropes.');
    recs.push('Pre-heat auxiliary trace heating circuits on freshwater transfer pipelines to prevent slush freeze.');
  } else {
    recs.push('Weather window is favorable: clear snow berms from solar bifacial collectors and calibrate radar dish.');
  }

  if (sim.fuel_level_pct < 40) {
    recs.push(`Fuel reserves at ${sim.fuel_level_pct}%: schedule priority fuel bladders on next PistenBully traverse.`);
  }

  if (sim.battery_soc_pct < 40 && stationId === 'bharati') {
    recs.push('Prioritize daytime BESS trickle charge from bifacial solar arrays before 17:00 local time.');
  }

  if (recs.length === 0) {
    recs.push('Grid operating at optimal thermodynamic efficiency (41.2%). Continue scheduled 250-hour genset oil sampling.');
    recs.push('Oceanographic & upper atmospheric sounding radar data stream verified with NCPOR Goa.');
  }

  const readiness = health >= 80 ? ('MISSION_READY' as const) : health >= 55 ? ('CAUTION_ADVISED' as const) : ('EMERGENCY_DEFENSE' as const);

  return {
    station_id: stationId,
    health_index_pct: health,
    readiness_status: readiness,
    executive_summary: `PolarTwin Digital Twin AI for ${stationId.toUpperCase()}: Overall station readiness rated at ${health}%. Power microgrid is ${
      sim.gen2_fault ? 'operating in redundancy mode on DG-3' : 'balanced with high stability'
    }. Current weather condition is ${sim.weather_condition.toLowerCase().replace('_', ' ')} with ${Math.floor(
      ((sim.fuel_level_pct / 100) * (stationId === 'maitri' ? 180000 : 220000)) / 440
    )} days of autonomy.`,
    key_recommendations: recs,
    critical_anomalies: anom,
    power_balance_eval: sim.gen2_fault ? 'CRITICAL DEFICIT - RUNNING ON EMERGENCY GENSET' : 'OPTIMAL LOAD BALANCE WITH SOLAR/BESS BUFFER',
    weather_impact_advisory:
      sim.weather_condition === 'BLIZZARD' || sim.weather_condition === 'SEVERE_STORM'
        ? 'HIGH STRUCTURAL BUFFETING & WHITEOUT RISK'
        : 'LOW RISK: STANDARD POLAR OPERATING CONDITIONS'
  };
}
