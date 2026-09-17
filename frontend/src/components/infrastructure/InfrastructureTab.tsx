import React, { useState } from 'react';
import {
  StationId,
  EnergyData,
  EquipmentItem,
  TelemetryData,
  AlertItem
} from '../../types';
import {
  Zap,
  BatteryCharging,
  Sun,
  Droplets,
  Flame,
  Radio,
  AlertOctagon,
  CheckCircle2,
  Wrench,
  Activity,
  Filter,
  ShieldCheck,
  TrendingUp,
  Cpu
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

interface InfrastructureTabProps {
  currentStationId: StationId;
  energy: EnergyData;
  equipment: EquipmentItem[];
  telemetry: TelemetryData;
  alerts: AlertItem[];
}

export const InfrastructureTab: React.FC<InfrastructureTabProps> = ({
  currentStationId,
  energy,
  equipment,
  telemetry,
  alerts
}) => {
  const [subsystemFilter, setSubsystemFilter] = useState<string>('ALL');

  const filteredEquipment = equipment.filter((eq) =>
    subsystemFilter === 'ALL' ? true : eq.subsystem === subsystemFilter
  );

  const criticalEquip = equipment.filter((eq) => eq.status === 'CRITICAL');
  const watchEquip = equipment.filter((eq) => eq.status === 'WATCH');

  return (
    <div className="space-y-6 pb-12">
      {/* Critical Maintenance Alert Banner if any equipment is in Fault/Watch */}
      {(criticalEquip.length > 0 || watchEquip.length > 0) && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/80 backdrop-blur-md shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-900/60 rounded-lg text-red-400 border border-red-700">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-200">
                ACTIVE INFRASTRUCTURE MAINTENANCE ALERT
              </h4>
              <p className="text-xs text-red-300/80">
                {criticalEquip.length > 0
                  ? `${criticalEquip[0].name} has crossed critical safety thresholds (${criticalEquip[0].diagnostic_note})`
                  : `${watchEquip.length} components flagged for watch inspection.`}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-red-300 bg-red-900/80 px-2.5 py-1 rounded border border-red-700">
              GOVERNOR TRIPPED // ISOLATE FEED
            </span>
          </div>
        </div>
      )}

      {/* Subsystem Real-Time Status Cards (6 Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Diesel Generators Grid */}
        <div className="glass-panel rounded-xl p-4 border border-[#1e3354]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-blue-950 border border-blue-800 text-cyan-400">
                <Zap className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Diesel Gensets (Cummins/Volvo)
              </h4>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
              3 UNITS
            </span>
          </div>

          <div className="space-y-2">
            {energy.diesel_generators.map((gen) => (
              <div
                key={gen.id}
                className="p-2 rounded-lg bg-[#070e1b] border border-[#162740] flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-200">{gen.name.split(' ')[0]}</span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                        gen.status === 'RUNNING'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : gen.status === 'FAULT'
                          ? 'bg-red-950 text-red-300 border-red-800 animate-pulse'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {gen.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    Temp: {gen.temp_c}°C | Vib: {gen.vibration_mms} mm/s
                  </span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-sm font-bold text-cyan-300 block">{gen.output_kw} kW</span>
                  <span className="text-[10px] text-slate-500">{gen.fuel_rate_lph} L/h</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Solar Contribution */}
        <div className="glass-panel rounded-xl p-4 border border-[#1e3354] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-amber-950 border border-amber-800 text-amber-400">
                  <Sun className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Photovoltaic Solar Field
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300">
                BIFACIAL PV
              </span>
            </div>

            <div className="text-2xl font-bold text-slate-100 font-mono tracking-tight flex items-baseline gap-1.5 mb-2">
              <span>{energy.solar_pv_kw}</span>
              <span className="text-xs font-normal text-slate-400">kW active generation</span>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              {currentStationId === 'bharati'
                ? 'High-latitude bifacial tracking panels harvesting direct & high-albedo ice reflection.'
                : 'Auxiliary solar test array on roof of Maitri science container block.'}
            </p>
          </div>

          <div className="p-2 rounded-lg bg-[#070e1b] border border-[#162740] grid grid-cols-2 gap-2 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">SOLAR IRRADIANCE</span>
              <span className="text-amber-300 font-semibold">{telemetry.solar_irradiance_wm2} W/m²</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">GRID OFFSET</span>
              <span className="text-emerald-400 font-semibold">
                {Math.round((energy.solar_pv_kw / Math.max(1, energy.total_production_kw)) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* 3. Battery Storage (BESS) */}
        <div className="glass-panel rounded-xl p-4 border border-[#1e3354] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400">
                  <BatteryCharging className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  BESS Storage Buffer
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-300">
                150 kWh LiFePO4
              </span>
            </div>

            <div className="text-2xl font-bold text-slate-100 font-mono tracking-tight flex items-baseline gap-1.5 mb-2">
              <span>{energy.battery_soc_pct}%</span>
              <span className="text-xs font-normal text-slate-400">State of Charge</span>
            </div>

            {/* Battery bar meter */}
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-3 border border-slate-700">
              <div
                className={`h-full transition-all duration-500 ${
                  energy.battery_soc_pct > 50
                    ? 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                    : energy.battery_soc_pct > 25
                    ? 'bg-amber-400'
                    : 'bg-red-500'
                }`}
                style={{ width: `${energy.battery_soc_pct}%` }}
              />
            </div>
          </div>

          <div className="p-2 rounded-lg bg-[#070e1b] border border-[#162740] grid grid-cols-2 gap-2 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">NET FLOW</span>
              <span
                className={`font-semibold ${
                  energy.battery_net_flow_kw >= 0 ? 'text-cyan-400' : 'text-amber-400'
                }`}
              >
                {energy.battery_net_flow_kw >= 0 ? `+${energy.battery_net_flow_kw} kW (Discharging)` : `${energy.battery_net_flow_kw} kW (Charging)`}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">GRID STABILITY</span>
              <span className="text-emerald-400 font-semibold">{energy.grid_stability_pct}%</span>
            </div>
          </div>
        </div>

        {/* 4. Water Plant */}
        <div className="glass-panel rounded-xl p-4 border border-[#1e3354] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-sky-950 border border-sky-800 text-sky-400">
                <Droplets className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Freshwater & RO Systems
              </h4>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              ONLINE
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            {currentStationId === 'maitri'
              ? 'Meltwater pump line drawing from Lake Priyadarshini with multi-point heated conduits.'
              : 'Seawater Reverse Osmosis desalination system producing 2,400 liters/day potable water.'}
          </p>
          <div className="p-2 rounded-lg bg-[#070e1b] border border-[#162740] grid grid-cols-2 gap-2 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">INTAKE TEMP</span>
              <span className="text-cyan-300 font-semibold">+3.8°C</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">TRACE HEATING</span>
              <span className="text-emerald-400 font-semibold">1.8 kW ACTIVE</span>
            </div>
          </div>
        </div>

        {/* 5. Heating Loop */}
        <div className="glass-panel rounded-xl p-4 border border-[#1e3354] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-orange-950 border border-orange-800 text-orange-400">
                <Flame className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Glycol Heat Recovery
              </h4>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              COGEN 94 kWt
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Recaptures generator engine jacket & exhaust heat into pressurized glycol circulating loop to warm living modules.
          </p>
          <div className="p-2 rounded-lg bg-[#070e1b] border border-[#162740] grid grid-cols-2 gap-2 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">LOOP SUPPLY</span>
              <span className="text-orange-400 font-semibold">72.0°C</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">INDOOR AMBIENT</span>
              <span className="text-cyan-300 font-semibold">+21.5°C</span>
            </div>
          </div>
        </div>

        {/* 6. Satellite Communications */}
        <div className="glass-panel rounded-xl p-4 border border-[#1e3354] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-400">
                <Radio className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Satellite Ground Comms
              </h4>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              GEO TRACKING
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            High-speed link connecting polar stations to NCPOR Goa and Indian Space Research Organisation (ISRO).
          </p>
          <div className="p-2 rounded-lg bg-[#070e1b] border border-[#162740] grid grid-cols-2 gap-2 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">CARRIER SNR</span>
              <span className="text-emerald-400 font-semibold">17.2 dB (NOMINAL)</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">UPLINK LATENCY</span>
              <span className="text-cyan-300 font-semibold">580 ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Energy Production vs Consumption 24-Hour Chart */}
      <div className="glass-panel rounded-2xl p-5 border border-[#1e3354]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
                24-Hour Energy Production vs Consumption Profile
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Continuous microgrid telemetry: Diesel Generators + Solar PV Generation vs Total Load Demand (kW)
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-slate-300">Diesel (kW)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-amber-400" />
              <span className="text-slate-300">Solar PV</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-cyan-400 border border-white" />
              <span className="text-slate-300">Total Consumption</span>
            </div>
          </div>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={energy.hourly_history_24h} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="dieselColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="solarColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#162942" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
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
              <Area
                type="monotone"
                dataKey="diesel_kw"
                name="Diesel Gen (kW)"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#dieselColor)"
              />
              <Area
                type="monotone"
                dataKey="solar_kw"
                name="Solar Output (kW)"
                stroke="#f59e0b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#solarColor)"
              />
              <Line
                type="monotone"
                dataKey="total_consumption_kw"
                name="Consumption (kW)"
                stroke="#22d3ee"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#22d3ee' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Equipment-Health Table with Status: Normal, Watch, Critical */}
      <div className="glass-panel rounded-2xl p-5 border border-[#1e3354]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Wrench className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
                Equipment Health & Predictive Maintenance Matrix
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Condition monitoring with vibration analysis, operating temperature, and overhaul countdowns
            </p>
          </div>

          {/* Subsystem Filters */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0" />
            {['ALL', 'POWER', 'WATER', 'HVAC', 'COMMS', 'SCIENTIFIC'].map((sub) => (
              <button
                key={sub}
                onClick={() => setSubsystemFilter(sub)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition ${
                  subsystemFilter === sub
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                    : 'bg-[#091424] text-slate-400 hover:text-slate-200 border border-[#182a45]'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-[#162740]">
          <table className="min-w-full divide-y divide-[#182942] text-xs">
            <thead className="bg-[#081220] text-slate-400 font-mono text-[11px] uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Equipment / Unit</th>
                <th className="px-4 py-3 text-left">Subsystem</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Temp (°C)</th>
                <th className="px-4 py-3 text-right">Vibration (mm/s)</th>
                <th className="px-4 py-3 text-right">Operating Hours</th>
                <th className="px-4 py-3 text-right">Next Due</th>
                <th className="px-4 py-3 text-left">Diagnostics & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#13233b] bg-[#070e1b] text-slate-300">
              {filteredEquipment.map((item) => (
                <tr
                  key={item.id}
                  className={`transition hover:bg-[#0c192e] ${
                    item.status === 'CRITICAL' ? 'bg-red-950/20' : ''
                  }`}
                >
                  <td className="px-4 py-3 font-semibold text-slate-100 flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.status === 'CRITICAL'
                          ? 'bg-red-500 animate-ping'
                          : item.status === 'WATCH'
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                    />
                    <span>{item.name}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-400 text-[11px]">{item.subsystem}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                        item.status === 'CRITICAL'
                          ? 'bg-red-950 text-red-300 border-red-700 animate-pulse'
                          : item.status === 'WATCH'
                          ? 'bg-amber-950 text-amber-300 border-amber-700'
                          : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    <span
                      className={
                        item.temperature_c > 95
                          ? 'text-red-400 font-bold'
                          : item.temperature_c > 80
                          ? 'text-amber-300'
                          : 'text-slate-300'
                      }
                    >
                      {item.temperature_c}°C
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    <span
                      className={
                        item.vibration_mms > 4.5
                          ? 'text-red-400 font-bold'
                          : item.vibration_mms > 3.0
                          ? 'text-amber-300'
                          : 'text-slate-300'
                      }
                    >
                      {item.vibration_mms}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-400">
                    {item.operating_hours.toLocaleString()} h
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    <span
                      className={
                        item.next_inspection_days === 0
                          ? 'text-red-400 font-bold'
                          : item.next_inspection_days < 7
                          ? 'text-amber-300'
                          : 'text-slate-300'
                      }
                    >
                      {item.next_inspection_days === 0 ? 'OVERDUE' : `${item.next_inspection_days} d`}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs truncate max-w-xs" title={item.diagnostic_note}>
                    {item.diagnostic_note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
