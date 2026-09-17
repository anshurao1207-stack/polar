import React from 'react';
import { OperationalInsight } from '../../types';
import {
  BrainCircuit,
  ShieldCheck,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Wind,
  Zap,
  TrendingUp,
  Cpu
} from 'lucide-react';

interface AiOperationalInsightProps {
  insight: OperationalInsight;
}

export const AiOperationalInsight: React.FC<AiOperationalInsightProps> = ({ insight }) => {
  const isHealthy = insight.health_index_pct >= 80;
  const isCaution = insight.health_index_pct >= 55 && insight.health_index_pct < 80;

  return (
    <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 shadow-lg shadow-cyan-950/20 relative overflow-hidden">
      {/* Background Subtle Tech Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e3354] pb-4 mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-950 to-blue-950 border border-cyan-500/40 text-cyan-400">
            <BrainCircuit className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-100 tracking-tight">
                AI Operational Decision Support
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                SYNAPSE-ANTARCTIC 4.2
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Autonomous telemetry reasoning & operational risk synthesis
            </p>
          </div>
        </div>

        {/* Health Score & Status Badge */}
        <div className="flex items-center space-x-4 self-start sm:self-auto">
          <div className="flex items-center space-x-2">
            <div className="relative w-11 h-11 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={
                    isHealthy
                      ? 'text-cyan-400'
                      : isCaution
                      ? 'text-amber-400'
                      : 'text-red-500'
                  }
                  strokeDasharray={`${insight.health_index_pct}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xs font-bold text-slate-100 font-mono">
                {insight.health_index_pct}%
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Health Index</span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded border inline-block ${
                  isHealthy
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                    : isCaution
                    ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                    : 'bg-red-950/80 text-red-300 border-red-800 animate-pulse'
                }`}
              >
                {insight.readiness_status.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="p-3.5 rounded-xl bg-[#091424] border border-[#1b3152] mb-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
        <span className="font-semibold text-cyan-300 mr-2">Digital Twin Assessment:</span>
        {insight.executive_summary}
      </div>

      {/* Grid: Recommendations & Anomaly Flags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recommended Actions */}
        <div className="p-3.5 rounded-xl bg-[#081220] border border-[#1e3354]">
          <div className="flex items-center space-x-2 mb-2.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Recommended Protocol Actions
            </h4>
          </div>
          <ul className="space-y-2">
            {insight.key_recommendations.map((rec, i) => (
              <li key={i} className="flex items-start space-x-2 text-xs text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Critical Anomalies & System Advisories */}
        <div className="p-3.5 rounded-xl bg-[#081220] border border-[#1e3354] flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Active Anomaly Flags & Diagnostics
              </h4>
            </div>
            {insight.critical_anomalies.length > 0 ? (
              <ul className="space-y-2">
                {insight.critical_anomalies.map((anom, i) => (
                  <li key={i} className="flex items-start space-x-2 text-xs text-red-300 bg-red-950/40 p-2 rounded border border-red-900/60">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                    <span>{anom}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-emerald-400 bg-emerald-950/40 p-2.5 rounded border border-emerald-900/60 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero mechanical, thermal, or microgrid faults detected across primary sensors.</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#1a2d47] text-[11px] font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">POWER BALANCE</span>
              <span className="text-cyan-300 truncate block font-medium">
                {insight.power_balance_eval}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">WEATHER ADVISORY</span>
              <span className="text-amber-300 truncate block font-medium">
                {insight.weather_impact_advisory}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
