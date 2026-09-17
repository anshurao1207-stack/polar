import React from 'react';
import {
  StationId,
  StationInfo,
  TelemetryData,
  EnergyData,
  OperationalInsight,
  AlertItem
} from '../../types';
import { PolarMap } from './PolarMap';
import { IsometricStationTwin } from './IsometricStationTwin';
import { AiOperationalInsight } from './AiOperationalInsight';
import {
  Thermometer,
  Wind,
  Users,
  Zap,
  Fuel,
  ShieldAlert,
  Clock,
  Radio,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';

interface OverviewTabProps {
  currentStationId: StationId;
  onStationChange: (id: StationId) => void;
  stations: Record<StationId, StationInfo>;
  telemetry: TelemetryData;
  energy: EnergyData;
  insight: OperationalInsight;
  alerts: AlertItem[];
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  currentStationId,
  onStationChange,
  stations,
  telemetry,
  energy,
  insight,
  alerts
}) => {
  const station = stations[currentStationId];
  const isStorm = telemetry.wind_speed_knots >= 45;
  const isLowFuel = telemetry.fuel_level_pct < 35;

  return (
    <div className="space-y-6 pb-12">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* 1. Temperature & Wind Chill */}
        <div className="glass-panel rounded-xl p-3.5 border border-[#1e3354] hover:border-cyan-500/50 transition">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Outside Temp</span>
            <Thermometer className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono tracking-tight">
            {telemetry.ambient_temp_c}°C
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Chill: {telemetry.wind_chill_c}°C</span>
            <span className="text-cyan-400 font-mono text-[10px]">
              {telemetry.ambient_temp_c < -30 ? 'EXTREME' : 'SUB-ZERO'}
            </span>
          </div>
        </div>

        {/* 2. Wind Speed & Gusts */}
        <div className="glass-panel rounded-xl p-3.5 border border-[#1e3354] hover:border-cyan-500/50 transition">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Wind Speed</span>
            <Wind className={`w-4 h-4 ${isStorm ? 'text-amber-400 animate-spin' : 'text-cyan-400'}`} />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono tracking-tight flex items-baseline gap-1">
            <span>{telemetry.wind_speed_knots}</span>
            <span className="text-xs font-normal text-slate-400">kts</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Gust: {telemetry.wind_gust_knots} kts</span>
            <span className={`text-[10px] font-mono px-1 rounded ${isStorm ? 'bg-amber-950 text-amber-300' : 'text-slate-400'}`}>
              {isStorm ? 'GALE' : 'BREEZE'}
            </span>
          </div>
        </div>

        {/* 3. Station Occupancy */}
        <div className="glass-panel rounded-xl p-3.5 border border-[#1e3354] hover:border-cyan-500/50 transition">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Occupancy</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono tracking-tight flex items-baseline gap-1">
            <span>{telemetry.current_occupancy}</span>
            <span className="text-xs font-normal text-slate-400">/ {station?.winter_capacity}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Winter Over</span>
            <span className="text-emerald-400 font-mono text-[10px]">ALL LOGGED</span>
          </div>
        </div>

        {/* 4. Power Grid Available */}
        <div className="glass-panel rounded-xl p-3.5 border border-[#1e3354] hover:border-cyan-500/50 transition">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Power Grid</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono tracking-tight flex items-baseline gap-1">
            <span>{telemetry.power_generated_kw}</span>
            <span className="text-xs font-normal text-slate-400">kW</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Load: {telemetry.power_demand_kw} kW</span>
            <span className="text-cyan-400 font-mono text-[10px]">
              {energy.battery_soc_pct}% BESS
            </span>
          </div>
        </div>

        {/* 5. Supply Days Autonomy */}
        <div className="glass-panel rounded-xl p-3.5 border border-[#1e3354] hover:border-cyan-500/50 transition">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Autonomy</span>
            <Fuel className={`w-4 h-4 ${isLowFuel ? 'text-red-400' : 'text-cyan-400'}`} />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono tracking-tight flex items-baseline gap-1">
            <span>{telemetry.supply_days_remaining}</span>
            <span className="text-xs font-normal text-slate-400">days</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Fuel: {telemetry.fuel_level_pct}%</span>
            <span className={`text-[10px] font-mono ${isLowFuel ? 'text-red-400 font-bold' : 'text-emerald-400'}`}>
              {isLowFuel ? 'LOW' : 'SECURE'}
            </span>
          </div>
        </div>

        {/* 6. Active Alerts Status */}
        <div className="glass-panel rounded-xl p-3.5 border border-[#1e3354] hover:border-cyan-500/50 transition">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Alarms</span>
            <ShieldAlert className={`w-4 h-4 ${telemetry.active_alerts_count > 0 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`} />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono tracking-tight flex items-baseline gap-1">
            <span>{telemetry.active_alerts_count}</span>
            <span className="text-xs font-normal text-slate-400">Active</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Total Logged</span>
            <span className="text-slate-400 font-mono text-[10px]">{alerts.length} Records</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Polar Map (Left) & 3D Isometric Station Twin (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-6 h-[460px]">
          <PolarMap
            currentStationId={currentStationId}
            onStationSelect={onStationChange}
            stations={stations}
            telemetry={telemetry}
          />
        </div>

        <div className="lg:col-span-6 h-[460px]">
          <IsometricStationTwin
            stationId={currentStationId}
            telemetry={telemetry}
            energy={energy}
          />
        </div>
      </div>

      {/* AI Operational Insight Advisory Panel */}
      <div>
        <AiOperationalInsight insight={insight} />
      </div>
    </div>
  );
};
