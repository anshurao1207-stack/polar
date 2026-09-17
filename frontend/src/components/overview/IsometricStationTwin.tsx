import React, { useState, useRef, useEffect } from 'react';
import { StationId, TelemetryData, EnergyData } from '../../types';
import { Box, Layers, Eye, Cpu, Zap, Activity, ShieldCheck, AlertOctagon } from 'lucide-react';

interface IsometricStationTwinProps {
  stationId: StationId;
  telemetry: TelemetryData;
  energy: EnergyData;
}

interface ModuleInfo {
  id: string;
  name: string;
  role: string;
  status: 'NORMAL' | 'WATCH' | 'CRITICAL';
  metric: string;
  x: number;
  y: number;
  w: number;
  h: number;
  d: number;
  color: string;
}

export const IsometricStationTwin: React.FC<IsometricStationTwinProps> = ({
  stationId,
  telemetry,
  energy
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeModule, setActiveModule] = useState<ModuleInfo | null>(null);
  const [wireframeMode, setWireframeMode] = useState<boolean>(false);

  const isMaitri = stationId === 'maitri';
  const hasGenFault = energy.diesel_generators.some((g) => g.status === 'FAULT');
  const isStorm = telemetry.wind_speed_knots >= 45;

  // Define architectural modules based on real station blueprints
  const modules: ModuleInfo[] = isMaitri
    ? [
        {
          id: 'mtr-main',
          name: 'Main Habitat & Living Complex',
          role: 'Life Support, Bunks, Galley, Medical Ward',
          status: 'NORMAL',
          metric: `${telemetry.current_occupancy} Personnel / 25 Capacity`,
          x: 0,
          y: 0,
          w: 120,
          h: 40,
          d: 70,
          color: '#eab308' // Maitri's iconic yellow steel construction
        },
        {
          id: 'mtr-gen',
          name: 'Cummins Diesel Generator Block',
          role: '3x 125 kVA Gensets, Glycol Heat Recovery',
          status: hasGenFault ? 'CRITICAL' : 'NORMAL',
          metric: `${energy.total_production_kw} kW Output | Temp ${hasGenFault ? '108°C' : '82°C'}`,
          x: -110,
          y: -40,
          w: 70,
          h: 30,
          d: 50,
          color: hasGenFault ? '#ef4444' : '#3b82f6'
        },
        {
          id: 'mtr-fuel',
          name: 'Bulk Polar Fuel Berm (ATF/HSD)',
          role: 'Cryo-stabilized Storage Bladders',
          status: telemetry.fuel_level_pct < 35 ? 'WATCH' : 'NORMAL',
          metric: `${telemetry.fuel_level_pct}% Level (${telemetry.supply_days_remaining} Days)`,
          x: -120,
          y: 60,
          w: 80,
          h: 18,
          d: 60,
          color: '#0284c7'
        },
        {
          id: 'mtr-water',
          name: 'Lake Priyadarshini Intake Pump',
          role: 'Heated Freshwater Pipeline',
          status: isStorm ? 'WATCH' : 'NORMAL',
          metric: 'Trace Heating ON | 3.8°C Flow',
          x: 110,
          y: -50,
          w: 45,
          h: 22,
          d: 40,
          color: '#06b6d4'
        },
        {
          id: 'mtr-sat',
          name: 'GSAT-7A Dish & Science Lab',
          role: 'Earth Magnetics & Upper Atmosphere',
          status: 'NORMAL',
          metric: 'Carrier SNR 17.2 dB Nominal',
          x: 100,
          y: 50,
          w: 50,
          h: 28,
          d: 45,
          color: '#6366f1'
        }
      ]
    : [
        {
          id: 'bht-pod-main',
          name: 'Main Aerodynamic Superstructure',
          role: '134 Integrated ISO Pods on Elevated Stilts',
          status: 'NORMAL',
          metric: `${telemetry.current_occupancy} Personnel / 24 Capacity`,
          x: 0,
          y: 0,
          w: 140,
          h: 46,
          d: 80,
          color: '#0284c7' // Bharati's sleek ocean-blue modern shell
        },
        {
          id: 'bht-solar',
          name: 'Bifacial Rooftop Solar Field',
          role: '35 kW Photovoltaic Sub-zero Array',
          status: 'NORMAL',
          metric: `${energy.solar_pv_kw} kW Active Output`,
          x: 0,
          y: -4,
          w: 125,
          h: 8,
          d: 65,
          color: '#06b6d4'
        },
        {
          id: 'bht-gen-pod',
          name: 'Volvo Penta Power & BESS Pod',
          role: '3x 160 kVA Gensets + 150 kWh Storage',
          status: hasGenFault ? 'CRITICAL' : 'NORMAL',
          metric: `${energy.total_production_kw} kW Grid Load | BESS ${energy.battery_soc_pct}%`,
          x: -120,
          y: -20,
          w: 65,
          h: 36,
          d: 55,
          color: hasGenFault ? '#ef4444' : '#2563eb'
        },
        {
          id: 'bht-radome',
          name: 'NRSC Satellite Tracking Radome',
          role: 'High-Throughput X/S-Band Downlink Dome',
          status: 'NORMAL',
          metric: 'Direct Polar Pass Tracking Active',
          x: 110,
          y: -40,
          w: 45,
          h: 42,
          d: 45,
          color: '#a855f7'
        },
        {
          id: 'bht-desal',
          name: 'Seawater Reverse Osmosis Plant',
          role: 'Desalination & Glycol Heating Loop',
          status: 'NORMAL',
          metric: 'Output 2,400 L/Day Potable',
          x: 95,
          y: 60,
          w: 55,
          h: 26,
          d: 50,
          color: '#0ea5e9'
        }
      ];

  // Isometric projection helper
  const projectIso = (x: number, y: number, z: number, originX: number, originY: number) => {
    // 30 degree isometric projection
    const isoX = originX + (x - y) * Math.cos(Math.PI / 6);
    const isoY = originY + (x + y) * Math.sin(Math.PI / 6) - z;
    return { x: isoX, y: isoY };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let tick = 0;

    const render = () => {
      tick += 0.03;
      const width = canvas.width;
      const height = canvas.height;
      const originX = width / 2;
      const originY = height / 2 + 20;

      ctx.clearRect(0, 0, width, height);

      // Draw polar terrain foundation grid
      ctx.strokeStyle = '#10223b';
      ctx.lineWidth = 1;
      const gridSize = 14;
      const step = 25;

      for (let i = -gridSize / 2; i <= gridSize / 2; i++) {
        const p1 = projectIso(i * step, (-gridSize / 2) * step, 0, originX, originY);
        const p2 = projectIso(i * step, (gridSize / 2) * step, 0, originX, originY);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        const p3 = projectIso((-gridSize / 2) * step, i * step, 0, originX, originY);
        const p4 = projectIso((gridSize / 2) * step, i * step, 0, originX, originY);
        ctx.beginPath();
        ctx.moveTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.stroke();
      }

      // Draw elevation terrain contour
      ctx.fillStyle = isMaitri ? '#101d2d' : '#0c1a2d';
      ctx.strokeStyle = '#1e385b';
      ctx.lineWidth = 1.2;

      const c1 = projectIso(-170, -130, -5, originX, originY);
      const c2 = projectIso(170, -130, -5, originX, originY);
      const c3 = projectIso(170, 130, -5, originX, originY);
      const c4 = projectIso(-170, 130, -5, originX, originY);

      ctx.beginPath();
      ctx.moveTo(c1.x, c1.y);
      ctx.lineTo(c2.x, c2.y);
      ctx.lineTo(c3.x, c3.y);
      ctx.lineTo(c4.x, c4.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Bharati: draw elevated support stilts
      if (!isMaitri) {
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2.5;
        const stiltOffsets = [
          [-55, -28],
          [55, -28],
          [-55, 28],
          [55, 28],
          [0, 0]
        ];
        stiltOffsets.forEach(([sx, sy]) => {
          const base = projectIso(sx, sy, 0, originX, originY);
          const top = projectIso(sx, sy, 22, originX, originY);
          ctx.beginPath();
          ctx.moveTo(base.x, base.y);
          ctx.lineTo(top.x, top.y);
          ctx.stroke();
          // Stilt pad
          ctx.fillStyle = '#64748b';
          ctx.beginPath();
          ctx.arc(base.x, base.y, 3, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Sort modules for correct painter's algorithm depth (back to front)
      const sortedModules = [...modules].sort((a, b) => a.x + a.y - (b.x + b.y));

      sortedModules.forEach((m) => {
        const isHovered = activeModule?.id === m.id;
        const elevationZ = !isMaitri && m.id === 'bht-pod-main' ? 22 : !isMaitri && m.id === 'bht-solar' ? 68 : 0;

        const p = {
          // Bottom 4 vertices
          b0: projectIso(m.x - m.w / 2, m.y - m.d / 2, elevationZ, originX, originY),
          b1: projectIso(m.x + m.w / 2, m.y - m.d / 2, elevationZ, originX, originY),
          b2: projectIso(m.x + m.w / 2, m.y + m.d / 2, elevationZ, originX, originY),
          b3: projectIso(m.x - m.w / 2, m.y + m.d / 2, elevationZ, originX, originY),
          // Top 4 vertices
          t0: projectIso(m.x - m.w / 2, m.y - m.d / 2, elevationZ + m.h, originX, originY),
          t1: projectIso(m.x + m.w / 2, m.y - m.d / 2, elevationZ + m.h, originX, originY),
          t2: projectIso(m.x + m.w / 2, m.y + m.d / 2, elevationZ + m.h, originX, originY),
          t3: projectIso(m.x - m.w / 2, m.y + m.d / 2, elevationZ + m.h, originX, originY)
        };

        // Draw isometric block faces:
        // Left face (t3, t0, b0, b3)
        ctx.fillStyle = isHovered ? '#38bdf8' : m.status === 'CRITICAL' ? '#b91c1c' : m.color;
        ctx.globalAlpha = wireframeMode ? 0.2 : 0.85;

        // Top face
        ctx.beginPath();
        ctx.moveTo(p.t0.x, p.t0.y);
        ctx.lineTo(p.t1.x, p.t1.y);
        ctx.lineTo(p.t2.x, p.t2.y);
        ctx.lineTo(p.t3.x, p.t3.y);
        ctx.closePath();
        ctx.fillStyle = isHovered ? '#7dd3fc' : m.status === 'CRITICAL' ? '#ef4444' : m.color;
        ctx.fill();
        ctx.strokeStyle = isHovered ? '#ffffff' : '#38bdf8';
        ctx.lineWidth = isHovered ? 2 : 1;
        ctx.stroke();

        // Right face
        ctx.beginPath();
        ctx.moveTo(p.t1.x, p.t1.y);
        ctx.lineTo(p.t2.x, p.t2.y);
        ctx.lineTo(p.b2.x, p.b2.y);
        ctx.lineTo(p.b1.x, p.b1.y);
        ctx.closePath();
        ctx.fillStyle = isHovered ? '#0284c7' : m.status === 'CRITICAL' ? '#7f1d1d' : '#0369a1';
        ctx.fill();
        ctx.stroke();

        // Front-left face
        ctx.beginPath();
        ctx.moveTo(p.t2.x, p.t2.y);
        ctx.lineTo(p.t3.x, p.t3.y);
        ctx.lineTo(p.b3.x, p.b3.y);
        ctx.lineTo(p.b2.x, p.b2.y);
        ctx.closePath();
        ctx.fillStyle = isHovered ? '#0369a1' : m.status === 'CRITICAL' ? '#991b1b' : '#075985';
        ctx.fill();
        ctx.stroke();

        ctx.globalAlpha = 1.0;

        // Live beacon pulse above each module
        const beacon = projectIso(m.x, m.y, elevationZ + m.h + 8, originX, originY);
        const pulseSize = 3 + Math.sin(tick + m.x) * 1.5;

        ctx.fillStyle = m.status === 'CRITICAL' ? '#ef4444' : m.status === 'WATCH' ? '#f59e0b' : '#10b981';
        ctx.beginPath();
        ctx.arc(beacon.x, beacon.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();

        // Label on top
        if (isHovered || m.status === 'CRITICAL') {
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(m.name.split(' ')[0], beacon.x, beacon.y - 8);
        }
      });

      // Subtle atmospheric snow particle drift
      if (isStorm) {
        ctx.fillStyle = 'rgba(224, 242, 254, 0.6)';
        for (let s = 0; s < 25; s++) {
          const sx = ((tick * 150 + s * 37) % width);
          const sy = ((tick * 90 + s * 23) % height);
          ctx.fillRect(sx, sy, 2.5, 1.2);
        }
      }

      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [stationId, hasGenFault, isStorm, activeModule, wireframeMode, isMaitri]);

  return (
    <div className="relative glass-panel rounded-2xl p-4 sm:p-5 border border-[#1e3354] flex flex-col justify-between h-full overflow-hidden">
      {/* Visualizer Top Bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
            Station 3D Isometric Digital Twin
          </h3>
          <span className="text-[10px] bg-cyan-950/80 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800 font-mono">
            {isMaitri ? 'OASIS COMPOUND' : 'STILT POD MATRIX'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setWireframeMode(!wireframeMode)}
            className={`px-2 py-1 rounded text-[10px] font-mono border transition ${
              wireframeMode
                ? 'bg-cyan-900/60 border-cyan-500 text-cyan-300'
                : 'bg-[#091220] border-[#1e3354] text-slate-400 hover:text-slate-200'
            }`}
          >
            {wireframeMode ? 'SOLID' : 'WIREFRAME'}
          </button>
        </div>
      </div>

      {/* HTML5 Canvas Isometric Rendering */}
      <div className="relative w-full aspect-[4/3] max-h-[340px] flex items-center justify-center bg-[#070e1a]/90 rounded-xl border border-[#172a45] overflow-hidden">
        <canvas
          ref={canvasRef}
          width={520}
          height={380}
          className="w-full h-full object-contain cursor-pointer"
          onMouseMove={(e) => {
            // Check bounding approximation
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = (e.clientX - rect.left) / rect.width;
            if (relX < 0.35) {
              setActiveModule(modules[1]);
            } else if (relX > 0.65) {
              setActiveModule(modules[3] || modules[2]);
            } else {
              setActiveModule(modules[0]);
            }
          }}
          onMouseLeave={() => setActiveModule(null)}
        />

        {/* Live HUD Module Status Overlay */}
        <div className="absolute bottom-2 left-2 right-2 p-2.5 rounded-lg bg-[#071120]/90 border border-cyan-500/30 backdrop-blur-md flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2.5">
            <div
              className={`w-3 h-3 rounded-full flex items-center justify-center ${
                activeModule?.status === 'CRITICAL'
                  ? 'bg-red-500 animate-ping'
                  : activeModule?.status === 'WATCH'
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
            />
            <div>
              <span className="font-bold text-slate-100 block">
                {activeModule?.name || (isMaitri ? 'Maitri Living & Science Complex' : 'Bharati Aerodynamic Main Pod')}
              </span>
              <span className="text-[11px] text-slate-400 font-mono block">
                {activeModule?.role || (isMaitri ? 'Central research station module' : '134 interlocked modules on stilts')}
              </span>
            </div>
          </div>

          <div className="text-right font-mono text-[11px]">
            <span className="text-slate-400 block text-[10px]">REAL-TIME TELEMETRY</span>
            <span className="text-cyan-300 font-semibold">
              {activeModule?.metric || `${energy.total_production_kw} kW Grid Load`}
            </span>
          </div>
        </div>
      </div>

      {/* Module Quick Selector Buttons */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 mt-3 text-[11px]">
        {modules.map((m) => {
          const isSelected = activeModule?.id === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setActiveModule(m)}
              className={`px-2 py-1.5 rounded-lg border text-left truncate transition ${
                isSelected
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200'
                  : m.status === 'CRITICAL'
                  ? 'bg-red-950/60 border-red-700 text-red-300 animate-pulse'
                  : 'bg-[#091220] border-[#1e3354] text-slate-300 hover:border-slate-600'
              }`}
            >
              <span className="block font-semibold truncate text-[10px]">{m.name.split(' ')[0]}</span>
              <span
                className={`text-[9px] font-mono ${
                  m.status === 'CRITICAL'
                    ? 'text-red-400'
                    : m.status === 'WATCH'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {m.status}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
