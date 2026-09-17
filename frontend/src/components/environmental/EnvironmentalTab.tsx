import React, { useState } from 'react';
import {
  StationId,
  EnvironmentalData,
  TelemetryData
} from '../../types';
import {
  Activity,
  Wind,
  Thermometer,
  Snowflake,
  Download,
  AlertTriangle,
  Flame,
  Layers,
  ShieldAlert,
  Gauge,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

interface EnvironmentalTabProps {
  currentStationId: StationId;
  environmental: EnvironmentalData;
  telemetry: TelemetryData;
  onExportCsv: () => void;
}

export const EnvironmentalTab: React.FC<EnvironmentalTabProps> = ({
  currentStationId,
  environmental,
  telemetry,
  onExportCsv
}) => {
  const [activeChart, setActiveChart] = useState<'METEOROLOGY' | 'AIR_QUALITY' | 'ICE_SNOW'>('METEOROLOGY');

  const cur = environmental.current;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Real-time environmental metrics & CSV export action */}
      <div className="glass-panel rounded-2xl p-5 border border-[#1e3354] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-base font-bold text-slate-100 uppercase tracking-tight">
              Antarctic Meteorological & Cryospheric Telemetry
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Continuous recording of atmospheric, air quality, ice core thickness, and genset emissions
          </p>
        </div>

        <button
          onClick={onExportCsv}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs shadow-lg shadow-cyan-950/40 transition shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export 24h Telemetry (CSV)</span>
        </button>
      </div>

      {/* Environmental Threshold Alarms */}
      {environmental.threshold_alerts.length > 0 ? (
        <div className="space-y-2">
          {environmental.threshold_alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex items-start space-x-3 backdrop-blur-md ${
                alert.severity === 'CRITICAL'
                  ? 'bg-red-950/40 border-red-700/80 text-red-200'
                  : 'bg-amber-950/40 border-amber-700/80 text-amber-200'
              }`}
            >
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider">{alert.title}</h4>
                <p className="text-xs mt-0.5 opacity-90">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800 text-emerald-300 flex items-center space-x-2 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>All environmental and atmospheric parameters within normal polar mission safety limits.</span>
        </div>
      )}

      {/* Real-Time Micro-Gauges (4 Columns) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Ambient & Chill */}
        <div className="glass-panel rounded-xl p-4 border border-[#1e3354]">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase">Temperature</span>
            <Thermometer className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {cur.temperature_c}°C
          </div>
          <div className="text-[11px] font-mono text-cyan-400 mt-1">
            Wind Chill: {cur.wind_chill_c}°C
          </div>
        </div>

        {/* Sustained Wind & Gusts */}
        <div className="glass-panel rounded-xl p-4 border border-[#1e3354]">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase">Wind Gusts</span>
            <Wind className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {cur.wind_gust_knots} <span className="text-xs font-normal text-slate-400">kts</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">
            Sustained: {cur.wind_speed_knots} kts
          </div>
        </div>

        {/* Air Quality & CO2 */}
        <div className="glass-panel rounded-xl p-4 border border-[#1e3354]">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase">Indoor CO2</span>
            <Gauge className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {cur.station_co2_ppm} <span className="text-xs font-normal text-slate-400">ppm</span>
          </div>
          <div className="text-[11px] font-mono text-emerald-400 mt-1">
            PM2.5: {cur.air_quality_pm25} µg/m³
          </div>
        </div>

        {/* Ice & Snow Cover */}
        <div className="glass-panel rounded-xl p-4 border border-[#1e3354]">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase">Ice Thickness</span>
            <Snowflake className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {cur.ice_thickness_m} <span className="text-xs font-normal text-slate-400">meters</span>
          </div>
          <div className="text-[11px] font-mono text-blue-400 mt-1">
            Snow Pack: {cur.snow_accumulation_cm} cm
          </div>
        </div>
      </div>

      {/* Trend Charts Section with Sub-Tab Toggles */}
      <div className="glass-panel rounded-2xl p-5 border border-[#1e3354]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
              24-Hour Environmental Dynamics Profile
            </h3>
            <p className="text-xs text-slate-400">
              Select time-series metrics to inspect high-latitude sensor trends
            </p>
          </div>

          <div className="flex items-center bg-[#091424] p-1 rounded-xl border border-[#172b47]">
            <button
              onClick={() => setActiveChart('METEOROLOGY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                activeChart === 'METEOROLOGY'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              METEOROLOGY
            </button>
            <button
              onClick={() => setActiveChart('AIR_QUALITY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                activeChart === 'AIR_QUALITY'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              AIR & EMISSIONS
            </button>
            <button
              onClick={() => setActiveChart('ICE_SNOW')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                activeChart === 'ICE_SNOW'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ICE & SNOW
            </button>
          </div>
        </div>

        {/* Chart View 1: Meteorology (Temp & Wind) */}
        {activeChart === 'METEOROLOGY' && (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={environmental.trends_24h} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#162942" />
                <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#071220',
                    borderColor: '#1e385e',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontFamily: 'monospace',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Line
                  type="monotone"
                  dataKey="temperature_c"
                  name="Ambient Temp (°C)"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="wind_chill_c"
                  name="Wind Chill (°C)"
                  stroke="#818cf8"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
                <Line
                  type="monotone"
                  dataKey="wind_speed_knots"
                  name="Wind Speed (kts)"
                  stroke="#22c55e"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="wind_gust_knots"
                  name="Wind Gust (kts)"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Chart View 2: Air Quality & Emissions */}
        {activeChart === 'AIR_QUALITY' && (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={environmental.trends_24h} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#162942" />
                <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#071220',
                    borderColor: '#1e385e',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontFamily: 'monospace',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Area
                  type="monotone"
                  dataKey="station_co2_ppm"
                  name="Station Pod CO2 (ppm)"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#co2Grad)"
                />
                <Line
                  type="monotone"
                  dataKey="co_emissions_ppm"
                  name="Genset Exhaust CO (ppm)"
                  stroke="#ef4444"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="air_quality_pm25"
                  name="Particulate PM2.5 (µg/m³)"
                  stroke="#38bdf8"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Chart View 3: Ice & Snow Cover */}
        {activeChart === 'ICE_SNOW' && (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={environmental.trends_24h} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#162942" />
                <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#071220',
                    borderColor: '#1e385e',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontFamily: 'monospace',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Line
                  type="monotone"
                  dataKey="snow_accumulation_cm"
                  name="Snow Pack (cm)"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                />
                <Line
                  type="monotone"
                  dataKey="ice_thickness_m"
                  name="Fast Ice Thickness (m)"
                  stroke="#6366f1"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
