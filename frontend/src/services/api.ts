import {
  StationInfo,
  TelemetryData,
  EnergyData,
  EquipmentItem,
  LogisticsData,
  EnvironmentalData,
  AlertItem,
  OperationalInsight,
  SimulationParams,
  StationId
} from '../types';
import {
  initialStations,
  defaultSimParams,
  computeMockTelemetry,
  computeMockEnergy,
  computeMockEquipment,
  computeMockLogistics,
  computeMockEnvironmental,
  computeMockAlerts,
  computeMockInsights
} from './mockData';

const BASE_URL = '';

class PolarTwinApiService {
  private localSimParams: Record<StationId, SimulationParams> = { ...defaultSimParams };
  private isBackendAvailable: boolean | null = null;

  private async tryFetch<T>(url: string, fallback: () => T): Promise<T> {
    try {
      const res = await fetch(`${BASE_URL}${url}`, {
        signal: AbortSignal.timeout(1500)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.isBackendAvailable = true;
      return data as T;
    } catch {
      this.isBackendAvailable = false;
      return fallback();
    }
  }

  getBackendStatus(): boolean | null {
    return this.isBackendAvailable;
  }

  getSimParams(stationId: StationId): SimulationParams {
    return this.localSimParams[stationId];
  }

  setSimParams(params: SimulationParams) {
    this.localSimParams[params.station_id] = { ...params };
    // Synchronize to backend asynchronously if available
    fetch(`${BASE_URL}/api/simulation/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    }).catch(() => {
      // Ignored if offline
    });
  }

  async getStations(): Promise<StationInfo[]> {
    return this.tryFetch('/api/stations', () => Object.values(initialStations));
  }

  async getStation(stationId: StationId): Promise<StationInfo> {
    return this.tryFetch(`/api/stations/${stationId}`, () => initialStations[stationId]);
  }

  async getTelemetry(stationId: StationId): Promise<TelemetryData> {
    return this.tryFetch(`/api/stations/${stationId}/telemetry`, () =>
      computeMockTelemetry(stationId, this.localSimParams[stationId])
    );
  }

  async getEnergy(stationId: StationId): Promise<EnergyData> {
    return this.tryFetch(`/api/stations/${stationId}/energy`, () =>
      computeMockEnergy(stationId, this.localSimParams[stationId])
    );
  }

  async getEquipment(stationId: StationId): Promise<EquipmentItem[]> {
    return this.tryFetch(`/api/stations/${stationId}/infrastructure`, () =>
      computeMockEquipment(stationId, this.localSimParams[stationId])
    );
  }

  async getLogistics(stationId: StationId): Promise<LogisticsData> {
    return this.tryFetch(`/api/stations/${stationId}/logistics`, () =>
      computeMockLogistics(stationId, this.localSimParams[stationId])
    );
  }

  async getEnvironmental(stationId: StationId): Promise<EnvironmentalData> {
    return this.tryFetch(`/api/stations/${stationId}/environmental`, () =>
      computeMockEnvironmental(stationId, this.localSimParams[stationId])
    );
  }

  async getAlerts(stationId: StationId): Promise<AlertItem[]> {
    return this.tryFetch(`/api/stations/${stationId}/alerts`, () =>
      computeMockAlerts(stationId, this.localSimParams[stationId])
    );
  }

  async getOperationalInsights(stationId: StationId): Promise<OperationalInsight> {
    return this.tryFetch(`/api/ai/insights/${stationId}`, () =>
      computeMockInsights(stationId, this.localSimParams[stationId])
    );
  }

  exportCsv(stationId: StationId) {
    const env = computeMockEnvironmental(stationId, this.localSimParams[stationId]);
    const headers = [
      'Station',
      'Timestamp_UTC',
      'Ambient_Temp_C',
      'Wind_Chill_C',
      'Wind_Speed_Knots',
      'Wind_Gust_Knots',
      'Air_Quality_PM25_ugm3',
      'Station_CO2_PPM',
      'Combustion_CO_PPM',
      'Ice_Thickness_Meters',
      'Snow_Accumulation_CM'
    ];

    const rows = env.trends_24h.map((r) => [
      stationId.toUpperCase(),
      r.timestamp,
      r.temperature_c,
      r.wind_chill_c,
      r.wind_speed_knots,
      r.wind_gust_knots,
      r.air_quality_pm25,
      r.station_co2_ppm,
      r.co_emissions_ppm,
      r.ice_thickness_m,
      r.snow_accumulation_cm
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `polartwin_${stationId}_telemetry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const apiService = new PolarTwinApiService();
