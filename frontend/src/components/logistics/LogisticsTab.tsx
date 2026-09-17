import React from 'react';
import {
  StationId,
  LogisticsData,
  TelemetryData,
  SimulationParams
} from '../../types';
import {
  Package,
  Ship,
  Plane,
  Truck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Fuel,
  ShieldCheck,
  AlertOctagon,
  ArrowRight,
  TrendingDown,
  Navigation
} from 'lucide-react';

interface LogisticsTabProps {
  currentStationId: StationId;
  logistics: LogisticsData;
  telemetry: TelemetryData;
}

export const LogisticsTab: React.FC<LogisticsTabProps> = ({
  currentStationId,
  logistics,
  telemetry
}) => {
  const isRiskHigh = logistics.overall_resupply_risk === 'CRITICAL';
  const isRiskElevated = logistics.overall_resupply_risk === 'ELEVATED';

  // Tracking stages for Antarctic supply chain
  const trackingStages = [
    { id: 'PORT_PREP', title: '01. Port Staging', loc: 'Cape Town Harbour' },
    { id: 'SOUTHERN_OCEAN', title: '02. Southern Ocean', loc: '40°S - 60°S Roaring Forties' },
    { id: 'FAST_ICE_APPROACH', title: '03. Fast Ice Shelf', loc: 'Prydz Bay / India Bay' },
    { id: 'OFF_LOADING', title: '04. Cargo Sled Offload', loc: 'Ice Shelf Ramp Depot' },
    { id: 'SECURED', title: '05. Station Bunkered', loc: 'Station Main Warehouse' }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Resupply Risk Indicator & Autonomy Buffer */}
      <div
        className={`glass-panel rounded-2xl p-5 border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          isRiskHigh
            ? 'border-red-600/80 bg-red-950/30'
            : isRiskElevated
            ? 'border-amber-600/80 bg-amber-950/30'
            : 'border-emerald-600/60 bg-emerald-950/20'
        }`}
      >
        <div className="flex items-center space-x-3.5">
          <div
            className={`p-3 rounded-xl border ${
              isRiskHigh
                ? 'bg-red-900/60 border-red-700 text-red-400 animate-pulse'
                : isRiskElevated
                ? 'bg-amber-900/60 border-amber-700 text-amber-400'
                : 'bg-emerald-900/60 border-emerald-700 text-emerald-400'
            }`}
          >
            {isRiskHigh ? (
              <AlertOctagon className="w-6 h-6" />
            ) : isRiskElevated ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <ShieldCheck className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-100">
                Antarctic Resupply Risk Index:
              </h3>
              <span
                className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${
                  isRiskHigh
                    ? 'bg-red-900 text-red-200 border-red-700 animate-pulse'
                    : isRiskElevated
                    ? 'bg-amber-900 text-amber-200 border-amber-700'
                    : 'bg-emerald-900 text-emerald-200 border-emerald-700'
                }`}
              >
                {logistics.overall_resupply_risk}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {isRiskHigh
                ? 'CRITICAL ALERT: Days of autonomy below safety window before next vessel berthing! Immediate conservation required.'
                : isRiskElevated
                ? 'CAUTION: Winter fuel or spare parts margin reduced. Monitor PistenBully traverse windows.'
                : 'NOMINAL: Rations, medical reserves, and fuel autonomy exceed remaining winter duration.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-5 font-mono text-xs self-end md:self-auto">
          <div className="text-right">
            <span className="text-slate-400 block text-[10px]">TOTAL AUTONOMY</span>
            <span className="text-xl font-bold text-cyan-300">
              {logistics.supply_days_autonomy} Days
            </span>
          </div>
          <div className="text-right pl-4 border-l border-slate-700">
            <span className="text-slate-400 block text-[10px]">CRITICAL STOCKS</span>
            <span
              className={`text-xl font-bold ${
                logistics.critical_stock_count > 0 ? 'text-red-400 animate-pulse' : 'text-emerald-400'
              }`}
            >
              {logistics.critical_stock_count} Items
            </span>
          </div>
        </div>
      </div>

      {/* Inventory Levels Grid */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Package className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Vital Expedition Inventory & Fuel Reserves
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {logistics.inventory.map((item) => {
            const fillPct = Math.round((item.current_stock / item.max_capacity) * 100);
            const isCrit = item.risk_level === 'CRITICAL' || item.risk_level === 'HIGH';

            return (
              <div
                key={item.id}
                className={`glass-panel rounded-xl p-4 border transition ${
                  isCrit ? 'border-red-700/80 bg-red-950/20' : 'border-[#1e3354] hover:border-cyan-500/50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">
                      {item.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-100">{item.name}</h4>
                  </div>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded border font-semibold ${
                      item.risk_level === 'CRITICAL'
                        ? 'bg-red-950 text-red-300 border-red-800 animate-pulse'
                        : item.risk_level === 'HIGH'
                        ? 'bg-amber-950 text-amber-300 border-amber-800'
                        : item.risk_level === 'MODERATE'
                        ? 'bg-blue-950 text-blue-300 border-blue-800'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    }`}
                  >
                    {item.risk_level}
                  </span>
                </div>

                {/* Stock readout */}
                <div className="flex items-baseline justify-between mb-2">
                  <div className="text-xl font-bold font-mono text-slate-100">
                    {item.current_stock.toLocaleString()}{' '}
                    <span className="text-xs font-normal text-slate-400">{item.unit}</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    Cap: {item.max_capacity.toLocaleString()}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-3 border border-slate-700">
                  <div
                    className={`h-full transition-all duration-500 ${
                      fillPct > 50
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                        : fillPct > 25
                        ? 'bg-amber-400'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${fillPct}%` }}
                  />
                </div>

                {/* Stats footer */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-2 border-t border-[#182942]">
                  <div>
                    <span className="text-slate-500 block text-[10px]">DAILY BURN</span>
                    <span className="text-slate-300">
                      {item.daily_burn} {item.unit}/day
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block text-[10px]">TIME REMAINING</span>
                    <span
                      className={`font-bold ${
                        item.days_remaining < 60 ? 'text-red-400' : 'text-emerald-400'
                      }`}
                    >
                      {item.days_remaining} Days
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shipment & Vessel Schedules */}
      <div className="glass-panel rounded-2xl p-5 border border-[#1e3354]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Ship className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
                Upcoming Vessel & Intercontinental Flight Schedules
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Expedition relief ships, ski cargo transports, and heavy polar traverse convoys
            </p>
          </div>
          <span className="text-xs font-mono bg-cyan-950 text-cyan-300 px-2.5 py-1 rounded border border-cyan-800">
            INDIAN ANTARCTIC EXPEDITION
          </span>
        </div>

        <div className="space-y-3">
          {logistics.schedules.map((sch) => (
            <div
              key={sch.id}
              className="p-3.5 rounded-xl bg-[#081220] border border-[#182a44] hover:border-cyan-500/50 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-[#0d1e33] border border-cyan-500/30 text-cyan-400 mt-0.5">
                  {sch.transit_mode === 'POLAR_VESSEL' ? (
                    <Ship className="w-4 h-4" />
                  ) : sch.transit_mode === 'AIR_CARGO' ? (
                    <Plane className="w-4 h-4" />
                  ) : (
                    <Truck className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs font-bold text-slate-100">{sch.vessel_or_flight}</h4>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {sch.mission}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono">
                    <span>Origin: {sch.origin_port}</span>
                    <span>→</span>
                    <span className="text-cyan-300">Dest: {sch.destination}</span>
                    <span>Payload: {sch.cargo_tons} Tons</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 self-end md:self-auto font-mono text-xs">
                <div className="text-right">
                  <span className="text-slate-500 block text-[10px]">ETA ARRIVAL</span>
                  <span className="text-slate-200 font-semibold">{sch.eta}</span>
                </div>

                <div className="text-right pl-3 border-l border-slate-800">
                  <span className="text-slate-500 block text-[10px]">COUNTDOWN</span>
                  <span className="text-cyan-400 font-bold">{sch.days_to_eta} Days</span>
                </div>

                <div className="text-right pl-3 border-l border-slate-800">
                  <span className="text-slate-500 block text-[10px]">WEATHER WINDOW</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                      sch.weather_viable
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : 'bg-red-950 text-red-300 border-red-800 animate-pulse'
                    }`}
                  >
                    {sch.weather_viable ? 'VIABLE' : 'STORM HOLD'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shipment & Equipment Tracking Multi-Stage Pipeline */}
      <div className="glass-panel rounded-2xl p-5 border border-[#1e3354]">
        <div className="flex items-center space-x-2 mb-3">
          <Navigation className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
            Resupply Cargo Pipeline & Overland Traverse Stages
          </h3>
        </div>

        <div className="relative mt-6">
          <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative z-10">
            {trackingStages.map((stage, idx) => {
              const isPast = idx < 2;
              const isCurrent = idx === 2;

              return (
                <div
                  key={stage.id}
                  className={`p-3 rounded-xl border text-center transition ${
                    isCurrent
                      ? 'bg-cyan-950/80 border-cyan-400 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-500/50'
                      : isPast
                      ? 'bg-[#0a1626] border-emerald-700/60 text-emerald-300'
                      : 'bg-[#070e1a] border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-center mb-1.5">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                        isCurrent
                          ? 'bg-cyan-400 text-slate-900 animate-bounce'
                          : isPast
                          ? 'bg-emerald-500 text-slate-900'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </div>
                  </div>
                  <h5 className="text-xs font-bold text-slate-100">{stage.title}</h5>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{stage.loc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
