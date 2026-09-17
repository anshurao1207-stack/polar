import React, { useState, useEffect } from 'react';
import {
  Radio,
  Sliders,
  AlertTriangle,
  Compass,
  Zap,
  Package,
  Activity,
  ShieldAlert,
  Server
} from 'lucide-react';
import { StationId, StationInfo, AlertItem } from '../../types';

interface HeaderProps {
  currentStationId: StationId;
  onStationChange: (id: StationId) => void;
  stations: Record<StationId, StationInfo>;
  activeTab: 'overview' | 'infrastructure' | 'logistics' | 'environmental';
  onTabChange: (tab: 'overview' | 'infrastructure' | 'logistics' | 'environmental') => void;
  alerts: AlertItem[];
  onOpenSimulation: () => void;
  backendOnline: boolean | null;
}

export const Header: React.FC<HeaderProps> = ({
  currentStationId,
  onStationChange,
  stations,
  activeTab,
  onTabChange,
  alerts,
  onOpenSimulation,
  backendOnline
}) => {
  const [utcTime, setUtcTime] = useState<string>('');
  const [stationTime, setStationTime] = useState<string>('');

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace('GMT', 'UTC'));
      // Antarctic stations: Bharati is UTC+5 (Mawson approx), Maitri is UTC+0 to UTC+2
      const offsetHours = currentStationId === 'bharati' ? 5 : 0;
      const stDate = new Date(now.getTime() + offsetHours * 3600 * 1000);
      setStationTime(
        `${stDate.getUTCHours().toString().padStart(2, '0')}:${stDate
          .getUTCMinutes()
          .toString()
          .padStart(2, '0')}:${stDate.getUTCSeconds().toString().padStart(2, '0')} (UTC${offsetHours >= 0 ? '+' : ''}${offsetHours})`
      );
    };
    updateClocks();
    const timer = setInterval(updateClocks, 1000);
    return () => clearInterval(timer);
  }, [currentStationId]);

  const activeCriticals = alerts.filter((a) => a.severity === 'CRITICAL').length;
  const activeWarnings = alerts.filter((a) => a.severity === 'WARNING').length;

  const currentStation = stations[currentStationId];

  return (
    <header className="sticky top-0 z-40 bg-[#070d18]/90 backdrop-blur-md border-b border-[#1e3354]">
      {/* Top Banner: Status & Quick Telemetry Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          {/* Logo & Station Title */}
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-lg bg-gradient-to-br from-[#0e2a47] to-[#164e63] border border-cyan-500/40 shadow-lg shadow-cyan-950/50">
              <Compass className="w-6 h-6 text-cyan-400 animate-spin-slow" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#070d18] animate-pulse" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400 hud-font">
                  POLARTWIN // NCPOR
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-cyan-950 text-cyan-300 border border-cyan-800">
                  DIGITAL TWIN v1.0
                </span>
                {backendOnline === true && (
                  <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                    <Server className="w-2.5 h-2.5" />
                    <span>FASTAPI LIVE</span>
                  </span>
                )}
                {backendOnline === false && (
                  <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] bg-blue-950 text-blue-300 border border-blue-800">
                    <Radio className="w-2.5 h-2.5" />
                    <span>EDGE SIMULATED</span>
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
                <span>{currentStation?.name || 'Antarctic Station'}</span>
                <span className="text-xs text-slate-400 font-normal px-2 py-0.5 bg-slate-800/80 rounded border border-slate-700">
                  {currentStation?.code}
                </span>
              </h1>
            </div>
          </div>

          {/* Station Switcher Pills */}
          <div className="flex items-center bg-[#0b1526] p-1 rounded-xl border border-[#1e3354]">
            <button
              onClick={() => onStationChange('maitri')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                currentStationId === 'maitri'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-900/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#13233d]'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Maitri Station</span>
              <span className="text-[10px] opacity-75 font-mono">70°S</span>
            </button>
            <button
              onClick={() => onStationChange('bharati')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                currentStationId === 'bharati'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-900/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#13233d]'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Bharati Station</span>
              <span className="text-[10px] opacity-75 font-mono">69°S</span>
            </button>
          </div>

          {/* Telemetry Clock & Simulation Action */}
          <div className="flex items-center space-x-3 text-xs">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-slate-400 font-mono text-[11px]">{utcTime}</span>
              <span className="text-cyan-400 font-mono text-[11px] font-semibold">STATION {stationTime}</span>
            </div>

            {/* Alert Indicator */}
            {(activeCriticals > 0 || activeWarnings > 0) && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-950/70 border border-red-800 text-red-300 font-mono text-xs animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span>
                  {activeCriticals > 0 ? `${activeCriticals} CRIT` : ''} {activeWarnings > 0 ? `${activeWarnings} WARN` : ''}
                </span>
              </div>
            )}

            {/* Admin / Simulation Controls Trigger */}
            <button
              onClick={onOpenSimulation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-900/50 to-blue-900/50 hover:from-cyan-800/70 hover:to-blue-800/70 text-cyan-300 border border-cyan-700/60 transition shadow-sm font-medium"
              title="Open Simulation Control Lab"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Simulation Lab</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 border-t border-[#1e3354]/60 pt-2 pb-2 overflow-x-auto">
          <button
            onClick={() => onTabChange('overview')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#0f1f38]'
            }`}
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>01. Overview Dashboard</span>
          </button>

          <button
            onClick={() => onTabChange('infrastructure')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'infrastructure'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#0f1f38]'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>02. Infrastructure & Energy</span>
          </button>

          <button
            onClick={() => onTabChange('logistics')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'logistics'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#0f1f38]'
            }`}
          >
            <Package className="w-4 h-4 text-emerald-400" />
            <span>03. Logistics & Resupply</span>
          </button>

          <button
            onClick={() => onTabChange('environmental')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'environmental'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#0f1f38]'
            }`}
          >
            <Activity className="w-4 h-4 text-sky-400" />
            <span>04. Environmental Monitoring</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
