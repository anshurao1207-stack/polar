import React, { useState } from 'react';
import { StationId, StationInfo, TelemetryData } from '../../types';
import { Compass, Navigation, MapPin, Maximize2, Wind, Thermometer, Users } from 'lucide-react';

interface PolarMapProps {
  currentStationId: StationId;
  onStationSelect: (id: StationId) => void;
  stations: Record<StationId, StationInfo>;
  telemetry: TelemetryData;
}

export const PolarMap: React.FC<PolarMapProps> = ({
  currentStationId,
  onStationSelect,
  stations,
  telemetry
}) => {
  const [hoveredStation, setHoveredStation] = useState<StationId | null>(null);

  // Antarctic polar projection positions in 400x400 SVG space:
  // Center is South Pole (90°S) at (200, 200).
  // Maitri: ~70.76°S, 11.74°E -> Sector facing Atlantic/Indian side (~11° angle from Prime Meridian).
  // Distance from pole for 70.8°S is roughly (90 - 70.76) * 6.5 = 125 px.
  // Maitri coordinates: x = 200 + 125 * sin(11.7°) = 225, y = 200 - 125 * cos(11.7°) = 77
  // Bharati: ~69.41°S, 76.19°E -> East Antarctica / Prydz Bay (~76° angle).
  // Distance from pole for 69.4°S is roughly (90 - 69.41) * 6.5 = 134 px.
  // Bharati coordinates: x = 200 + 134 * sin(76.2°) = 330, y = 200 - 134 * cos(76.2°) = 168

  const maitriCoords = { x: 226, y: 78 };
  const bharatiCoords = { x: 330, y: 168 };

  return (
    <div className="relative glass-panel rounded-2xl p-4 sm:p-5 border border-[#1e3354] overflow-hidden flex flex-col justify-between h-full">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Navigation className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
            Antarctic Polar Projection
          </h3>
          <span className="text-[10px] bg-cyan-950/80 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800 font-mono">
            STEREO 90°S
          </span>
        </div>

        <div className="flex items-center space-x-2 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Telemetry Locked</span>
          </span>
        </div>
      </div>

      {/* SVG Polar Map Container */}
      <div className="relative w-full aspect-square max-h-[360px] mx-auto flex items-center justify-center">
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full select-none filter drop-shadow-[0_0_15px_rgba(34,211,238,0.15)]"
        >
          <defs>
            {/* Ice Continent Gradient */}
            <radialGradient id="antarcticIceGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e3a5f" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#142c4a" stopOpacity="0.75" />
              <stop offset="85%" stopColor="#0b1b30" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#081324" stopOpacity="0.2" />
            </radialGradient>

            {/* Glowing station radar waves */}
            <radialGradient id="radarPulse" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#0284c7" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background Polar Graticule Circles (60°S, 70°S, 80°S) */}
          <circle cx="200" cy="200" r="190" fill="none" stroke="#172b47" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="200" cy="200" r="130" fill="none" stroke="#1d375a" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="200" cy="200" r="65" fill="none" stroke="#254673" strokeWidth="1" strokeDasharray="2 2" />

          {/* Meridian Radial Lines */}
          <line x1="200" y1="10" x2="200" y2="390" stroke="#172b47" strokeWidth="1" strokeDasharray="2 4" />
          <line x1="10" y1="200" x2="390" y2="200" stroke="#172b47" strokeWidth="1" strokeDasharray="2 4" />
          <line x1="65" y1="65" x2="335" y2="335" stroke="#172b47" strokeWidth="0.75" strokeDasharray="2 4" />
          <line x1="65" y1="335" x2="335" y2="65" stroke="#172b47" strokeWidth="0.75" strokeDasharray="2 4" />

          {/* Coordinates Legend */}
          <text x="204" y="24" fill="#64748b" fontSize="8" fontFamily="monospace">0° (Prime Meridian)</text>
          <text x="375" y="196" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="end">90°E</text>
          <text x="204" y="386" fill="#64748b" fontSize="8" fontFamily="monospace">180°</text>
          <text x="14" y="196" fill="#64748b" fontSize="8" fontFamily="monospace">90°W</text>
          <text x="204" y="204" fill="#38bdf8" fontSize="8" fontFamily="monospace">90°S South Pole</text>

          {/* Antarctic Continent Realistic Contour Silhouette */}
          <path
            d="M 220 50 
               C 255 55, 290 85, 315 120 
               C 340 150, 355 180, 345 220 
               C 335 255, 295 285, 275 310 
               C 255 330, 220 335, 195 330 
               C 165 325, 140 295, 125 265 
               C 110 235, 95 210, 85 180 
               C 70 140, 95 105, 115 80 
               C 140 55, 180 45, 220 50 Z"
            fill="url(#antarcticIceGrad)"
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />

          {/* Ice Shelf Outlines (Ross, Ronne, Amery Ice Shelf) */}
          <path
            d="M 290 145 C 315 160, 320 185, 305 200 C 290 205, 275 180, 290 145 Z"
            fill="#0ea5e9"
            fillOpacity="0.12"
            stroke="#0ea5e9"
            strokeWidth="0.8"
            strokeDasharray="2 2"
          />
          <text x="300" y="180" fill="#0284c7" fontSize="7" fontFamily="monospace">Prydz Bay / Amery</text>

          <path
            d="M 125 210 C 135 235, 150 240, 160 220 C 150 200, 135 200, 125 210 Z"
            fill="#0ea5e9"
            fillOpacity="0.12"
            stroke="#0ea5e9"
            strokeWidth="0.8"
            strokeDasharray="2 2"
          />
          <text x="125" y="240" fill="#0284c7" fontSize="7" fontFamily="monospace">Weddell Sea</text>

          {/* Center South Pole Pin */}
          <circle cx="200" cy="200" r="3" fill="#38bdf8" />
          <circle cx="200" cy="200" r="6" fill="none" stroke="#38bdf8" strokeWidth="0.75" opacity="0.6" />

          {/* Inter-station Traverse Line */}
          <line
            x1={maitriCoords.x}
            y1={maitriCoords.y}
            x2={bharatiCoords.x}
            y2={bharatiCoords.y}
            stroke="#0ea5e9"
            strokeWidth="1.2"
            strokeDasharray="3 4"
            opacity="0.5"
          />
          <text
            x={(maitriCoords.x + bharatiCoords.x) / 2 + 10}
            y={(maitriCoords.y + bharatiCoords.y) / 2 - 10}
            fill="#0284c7"
            fontSize="7"
            fontFamily="monospace"
          >
            Air Route ~3,000 km
          </text>

          {/* ======================================================== */}
          {/* STATION 1: MAITRI */}
          {/* ======================================================== */}
          <g
            className="cursor-pointer transition-transform duration-200"
            onClick={() => onStationSelect('maitri')}
            onMouseEnter={() => setHoveredStation('maitri')}
            onMouseLeave={() => setHoveredStation(null)}
          >
            {/* Active Highlight Glow */}
            {currentStationId === 'maitri' && (
              <>
                <circle cx={maitriCoords.x} cy={maitriCoords.y} r="22" fill="url(#radarPulse)" className="animate-pulse" />
                <circle cx={maitriCoords.x} cy={maitriCoords.y} r="14" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="3 2" />
              </>
            )}

            {/* Station Icon Dot */}
            <circle
              cx={maitriCoords.x}
              cy={maitriCoords.y}
              r="6"
              fill={currentStationId === 'maitri' ? '#22d3ee' : '#0284c7'}
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            <circle cx={maitriCoords.x} cy={maitriCoords.y} r="2" fill="#070d18" />

            {/* Label */}
            <rect
              x={maitriCoords.x - 42}
              y={maitriCoords.y - 28}
              width="84"
              height="16"
              rx="4"
              fill="#0b1526"
              stroke={currentStationId === 'maitri' ? '#22d3ee' : '#1e3354'}
              strokeWidth="1"
              opacity="0.92"
            />
            <text
              x={maitriCoords.x}
              y={maitriCoords.y - 17}
              fill={currentStationId === 'maitri' ? '#22d3ee' : '#cbd5e1'}
              fontSize="8.5"
              fontWeight="bold"
              fontFamily="monospace"
              textAnchor="middle"
            >
              MAITRI (70°45′S)
            </text>
          </g>

          {/* ======================================================== */}
          {/* STATION 2: BHARATI */}
          {/* ======================================================== */}
          <g
            className="cursor-pointer transition-transform duration-200"
            onClick={() => onStationSelect('bharati')}
            onMouseEnter={() => setHoveredStation('bharati')}
            onMouseLeave={() => setHoveredStation(null)}
          >
            {/* Active Highlight Glow */}
            {currentStationId === 'bharati' && (
              <>
                <circle cx={bharatiCoords.x} cy={bharatiCoords.y} r="22" fill="url(#radarPulse)" className="animate-pulse" />
                <circle cx={bharatiCoords.x} cy={bharatiCoords.y} r="14" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="3 2" />
              </>
            )}

            {/* Station Icon Dot */}
            <circle
              cx={bharatiCoords.x}
              cy={bharatiCoords.y}
              r="6"
              fill={currentStationId === 'bharati' ? '#22d3ee' : '#0284c7'}
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            <circle cx={bharatiCoords.x} cy={bharatiCoords.y} r="2" fill="#070d18" />

            {/* Label */}
            <rect
              x={bharatiCoords.x - 44}
              y={bharatiCoords.y + 12}
              width="88"
              height="16"
              rx="4"
              fill="#0b1526"
              stroke={currentStationId === 'bharati' ? '#22d3ee' : '#1e3354'}
              strokeWidth="1"
              opacity="0.92"
            />
            <text
              x={bharatiCoords.x}
              y={bharatiCoords.y + 23}
              fill={currentStationId === 'bharati' ? '#22d3ee' : '#cbd5e1'}
              fontSize="8.5"
              fontWeight="bold"
              fontFamily="monospace"
              textAnchor="middle"
            >
              BHARATI (69°24′S)
            </text>
          </g>
        </svg>
      </div>

      {/* Selected Station Polar Coordinate Telemetry Bar */}
      <div className="mt-3 p-2.5 rounded-xl bg-[#091220] border border-[#1e3354] flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <div>
            <span className="font-semibold text-slate-200">
              {stations[currentStationId]?.name}
            </span>
            <span className="text-slate-400 text-[11px] block font-mono">
              {stations[currentStationId]?.region}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 font-mono text-[11px]">
          <div className="text-right">
            <span className="text-slate-400 block text-[10px]">LAT / LON</span>
            <span className="text-cyan-300 font-semibold">
              {stations[currentStationId]?.latitude.toFixed(4)}°S / {stations[currentStationId]?.longitude.toFixed(4)}°E
            </span>
          </div>
          <div className="text-right pl-3 border-l border-slate-800">
            <span className="text-slate-400 block text-[10px]">ELEVATION</span>
            <span className="text-emerald-400 font-semibold">
              +{stations[currentStationId]?.altitude_m}m AMSL
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
