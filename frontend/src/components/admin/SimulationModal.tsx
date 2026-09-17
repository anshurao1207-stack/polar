import React, { useState } from 'react';
import { StationId, SimulationParams } from '../../types';
import {
  Sliders,
  X,
  CloudSnow,
  Fuel,
  BatteryCharging,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Radio,
  CheckCircle2,
  Flame,
  Wind
} from 'lucide-react';

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStationId: StationId;
  simParams: SimulationParams;
  onApplyChanges: (params: SimulationParams) => void;
  onReset: () => void;
}

export const SimulationModal: React.FC<SimulationModalProps> = ({
  isOpen,
  onClose,
  currentStationId,
  simParams,
  onApplyChanges,
  onReset
}) => {
  const [params, setParams] = useState<SimulationParams>({ ...simParams });

  if (!isOpen) return null;

  const handleChange = <K extends keyof SimulationParams>(key: K, value: SimulationParams[K]) => {
    const updated = { ...params, [key]: value };
    setParams(updated);
    // Instant reactive update to parent dashboard!
    onApplyChanges(updated);
  };

  const applyPreset = (preset: 'NOMINAL' | 'BLIZZARD' | 'GEN_FAULT' | 'FUEL_CRISIS') => {
    let updated: SimulationParams;
    if (preset === 'NOMINAL') {
      updated = {
        station_id: currentStationId,
        weather_condition: 'CALM',
        fuel_level_pct: 88.0,
        battery_soc_pct: 92.0,
        gen2_fault: false,
        comms_status: 'OPTIMAL',
        outside_temp_c: currentStationId === 'maitri' ? -21.0 : -14.0
      };
    } else if (preset === 'BLIZZARD') {
      updated = {
        station_id: currentStationId,
        weather_condition: 'BLIZZARD',
        fuel_level_pct: params.fuel_level_pct,
        battery_soc_pct: 65.0,
        gen2_fault: false,
        comms_status: 'OPTIMAL',
        outside_temp_c: currentStationId === 'maitri' ? -34.5 : -28.0
      };
    } else if (preset === 'GEN_FAULT') {
      updated = {
        ...params,
        gen2_fault: true
      };
    } else {
      // FUEL_CRISIS
      updated = {
        ...params,
        fuel_level_pct: 22.0,
        battery_soc_pct: 32.0
      };
    }
    setParams(updated);
    onApplyChanges(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#081220] border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/80 p-6 overflow-hidden">
        {/* Glow Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1b3152]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/50 text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Simulation Lab & Perturbation Engine</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-300 font-mono border border-cyan-700">
                  {currentStationId.toUpperCase()} TWIN
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Tweak live telemetry parameters; alerts and AI insights adapt instantaneously
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#11233d] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Quick Scenario Buttons */}
        <div className="mt-4 mb-5">
          <span className="text-[11px] font-mono text-slate-400 block uppercase mb-2">
            Mission Scenario Presets:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => applyPreset('NOMINAL')}
              className="p-2 rounded-lg bg-[#0c1a2e] hover:bg-[#132742] border border-emerald-700/60 text-emerald-300 text-xs font-mono transition text-left"
            >
              <span className="block font-bold">01. Nominal State</span>
              <span className="text-[10px] text-slate-400">Calm & Balanced</span>
            </button>
            <button
              onClick={() => applyPreset('BLIZZARD')}
              className="p-2 rounded-lg bg-[#0c1a2e] hover:bg-[#132742] border border-cyan-700/60 text-cyan-300 text-xs font-mono transition text-left"
            >
              <span className="block font-bold">02. Polar Blizzard</span>
              <span className="text-[10px] text-slate-400">58 kts, -35°C</span>
            </button>
            <button
              onClick={() => applyPreset('GEN_FAULT')}
              className="p-2 rounded-lg bg-[#0c1a2e] hover:bg-[#132742] border border-red-700/60 text-red-300 text-xs font-mono transition text-left"
            >
              <span className="block font-bold">03. DG-2 Overheat</span>
              <span className="text-[10px] text-slate-400">Vibration spike</span>
            </button>
            <button
              onClick={() => applyPreset('FUEL_CRISIS')}
              className="p-2 rounded-lg bg-[#0c1a2e] hover:bg-[#132742] border border-amber-700/60 text-amber-300 text-xs font-mono transition text-left"
            >
              <span className="block font-bold">04. Resupply Crisis</span>
              <span className="text-[10px] text-slate-400">Fuel at 22%</span>
            </button>
          </div>
        </div>

        {/* Detailed Sliders and Controls */}
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
          {/* 1. Weather Severity */}
          <div className="p-3.5 rounded-xl bg-[#091526] border border-[#182942]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Wind className="w-4 h-4 text-cyan-400" />
                <span>Weather Severity & Storm Scale:</span>
              </span>
              <span className="text-xs font-mono text-cyan-300 font-semibold">
                {params.weather_condition}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(['CALM', 'MODERATE', 'BLIZZARD', 'SEVERE_STORM'] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => handleChange('weather_condition', w)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-mono transition ${
                    params.weather_condition === w
                      ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-950'
                      : 'bg-[#0b1b30] text-slate-400 hover:text-slate-200 border border-[#162a42]'
                  }`}
                >
                  {w.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Fuel Reserve Level */}
          <div className="p-3.5 rounded-xl bg-[#091526] border border-[#182942]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Fuel className="w-4 h-4 text-cyan-400" />
                <span>Polar Fuel Reserves:</span>
              </span>
              <span
                className={`text-xs font-mono font-bold ${
                  params.fuel_level_pct < 35 ? 'text-red-400 animate-pulse' : 'text-cyan-300'
                }`}
              >
                {params.fuel_level_pct}% Available
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="1"
              value={params.fuel_level_pct}
              onChange={(e) => handleChange('fuel_level_pct', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>10% (Critical)</span>
              <span>50% (Standard)</span>
              <span>100% (Fully Bunkered)</span>
            </div>
          </div>

          {/* 3. Battery State of Charge */}
          <div className="p-3.5 rounded-xl bg-[#091526] border border-[#182942]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <BatteryCharging className="w-4 h-4 text-emerald-400" />
                <span>BESS Battery Bank SOC:</span>
              </span>
              <span
                className={`text-xs font-mono font-bold ${
                  params.battery_soc_pct < 30 ? 'text-amber-400' : 'text-emerald-300'
                }`}
              >
                {params.battery_soc_pct}% Charge
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="100"
              step="1"
              value={params.battery_soc_pct}
              onChange={(e) => handleChange('battery_soc_pct', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          {/* 4. Generator 2 Mechanical Health Trigger */}
          <div className="p-3.5 rounded-xl bg-[#091526] border border-[#182942] flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>Auxiliary Genset DG-2 Mechanical Fault:</span>
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Simulate severe bearing vibration (&gt;8.4 mm/s) &amp; thermal overload
              </span>
            </div>

            <button
              onClick={() => handleChange('gen2_fault', !params.gen2_fault)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition ${
                params.gen2_fault
                  ? 'bg-red-950 text-red-300 border-red-700 animate-pulse'
                  : 'bg-emerald-950 text-emerald-300 border-emerald-800'
              }`}
            >
              {params.gen2_fault ? 'FAULT ACTIVE' : 'NOMINAL'}
            </button>
          </div>

          {/* 5. Comms Link Status */}
          <div className="p-3.5 rounded-xl bg-[#091526] border border-[#182942]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Radio className="w-4 h-4 text-indigo-400" />
                <span>Satellite Ku-Band Comms Link:</span>
              </span>
              <span className="text-xs font-mono text-cyan-300 font-semibold">
                {params.comms_status}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['OPTIMAL', 'DEGRADED', 'BLACKOUT'] as const).map((stat) => (
                <button
                  key={stat}
                  onClick={() => handleChange('comms_status', stat)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-mono transition ${
                    params.comms_status === stat
                      ? stat === 'BLACKOUT'
                        ? 'bg-red-700 text-white font-bold'
                        : stat === 'DEGRADED'
                        ? 'bg-amber-600 text-white font-bold'
                        : 'bg-emerald-600 text-white font-bold'
                      : 'bg-[#0b1b30] text-slate-400 hover:text-slate-200 border border-[#162a42]'
                  }`}
                >
                  {stat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-5 pt-4 border-t border-[#1b3152] flex items-center justify-between">
          <button
            onClick={() => {
              onReset();
              setParams({ ...simParams });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs shadow-lg shadow-cyan-950/40 transition"
          >
            Close &amp; Inspect Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
