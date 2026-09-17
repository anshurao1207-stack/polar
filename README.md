# PolarTwin: Digital Twin Framework for Maitri & Bharati Antarctic Research Stations

**PolarTwin** is a mission-control digital twin application developed for researchers, station engineers, and expedition planners supporting India's Antarctic research stations:
- **Maitri Research Station** (70°45′57″S, 11°44′09″E, Schirmacher Oasis, Queen Maud Land)
- **Bharati Research Station** (69°24′29″S, 76°11′14″E, Larsemann Hills, Prydz Bay)

Operated under the mandate of the **National Centre for Polar and Ocean Research (NCPOR)**, Ministry of Earth Sciences, PolarTwin bridges physical station telemetry with interactive virtual models, real-time energy flow tracking, logistics supply-chain simulations, and AI-driven operational decision support.

---

## ❄️ Key Features

### 1. Overview Dashboard
- **Station Toggle**: Seamlessly switch between Maitri and Bharati stations with automatic telemetry, environmental, and architectural synchronization.
- **Mission Critical KPIs**: Real-time readouts for ambient temperature, wind chill, wind speed/gusts, winter-over occupancy, power microgrid balance, and supply autonomy.
- **Interactive Antarctic Polar Map**: Polar projection (Stereographic 90°S) with coastline geometries, ice shelf boundaries (Amery/Prydz Bay, Weddell Sea), station markers, elevation indicators, and distance vectors.
- **3D Isometric Digital Twin**: Lightweight, high-performance canvas visualizer illustrating station architecture:
  - *Bharati*: Aerodynamic elevated container superstructure on structural steel stilts, rooftop bifacial solar field, Volvo Penta power pod, and NRSC satellite tracking radome.
  - *Maitri*: Iconic yellow habitat complex, Lake Priyadarshini heated freshwater pipeline, Cummins genset blocks, and fuel storage berm.
- **AI Operational Decision Support**: Automated multi-factor heuristic engine evaluating grid stability, storm risk, fuel burn optimization, and red-egress safety protocols.

### 2. Infrastructure & Energy
- **Microgrid Subsystem Telemetry**: Real-time status cards for Diesel Generators (DG1, DG2, DG3 with vibration, lube oil temperature, fuel consumption, and status), Solar PV generation, 150 kWh BESS battery bank, freshwater/desalination, waste-heat glycol recovery loops, and VSAT satellite tracking.
- **24-Hour Energy Production vs Consumption**: Stacked area & line charts comparing diesel output, solar offset, and load demands.
- **Equipment Health Matrix**: Diagnostic table with status flags (`Normal`, `Watch`, `Critical`), vibration levels (mm/s), operating temperatures, runtime hours, and overhaul countdowns.
- **Automatic Maintenance Alarms**: Instant visual warnings when machinery crosses safety thresholds.

### 3. Logistics & Resupply
- **Expedition Inventory Gauges**: Stock levels and daily burn rates for polar diesel (winterized ATF/HSD), freeze-dried rations, emergency surgical medical kits, science cryogens (liquid He/N2), and critical engine spares.
- **Vessel & Flight Schedules**: Real-time tracking of upcoming relief icebreakers (*MV Vasiliy Golovnin*), intercontinental ski cargo flights (*IL-76TD-90VD*), and heavy PistenBully traverse convoys.
- **Resupply Risk Index**: Automated risk score based on sea-ice thickness, weather windows, and days of autonomy buffer.
- **Multi-Stage Tracking Pipeline**: 5-stage cargo tracking from Port of Cape Town staging to Antarctic ice-shelf offloading and station bunkering.

### 4. Environmental Monitoring
- **Atmospheric & Cryospheric Trends**: 24-hour historical curves for temperature, wind chill, wind gusts, PM2.5 particulate, indoor module CO2, genset stack CO emissions, snow accumulation, and ice thickness.
- **Safety Threshold Alarms**: Severe gale warnings, deep-freeze outdoor exposure limits, and flue emission alerts.
- **CSV Telemetry Export**: One-click data download formatted for scientific research and NCPOR telemetry logging.

### 5. Admin / Simulation Lab
- **Interactive Perturbation Controls**:
  - Weather Condition: Calm, Moderate, Blizzard, Severe Storm
  - Polar Fuel Reserves: 10% to 100%
  - Battery Bank SOC: 15% to 100%
  - Auxiliary Genset DG-2 Fault Injection: High vibration (>8.4 mm/s) & thermal runaway
  - Satellite Communications: Optimal, Degraded, Blackout
- **Instant Reactive Updates**: Changes apply across the digital twin immediately with 0ms perceived lag.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, Recharts, HTML5 Canvas 3D Isometric Visualizer.
- **Backend**: Python 3.14, FastAPI, Uvicorn, Pydantic v2.
- **Database Architecture**: PostgreSQL production schema (`backend/schema.sql`) with time-series indexing.

---

## 🚀 Quick Setup Instructions

### Prerequisites
- **Node.js** v18+ and `pnpm` (or `npm`)
- **Python** 3.10+ with `pip`

### Step 1: Start the FastAPI Backend
```bash
cd backend
python -m pip install -r requirements.txt
python main.py
```
*The backend starts at `http://127.0.0.1:8000` with interactive API docs at `http://127.0.0.1:8000/docs`.*

### Step 2: Start the React Frontend
```bash
cd frontend
pnpm install
pnpm run dev
```
*The frontend starts at `http://localhost:5173` with instant hot reloading and API proxying.*

### Step 3: Verify the System
Run the backend test suite:
```bash
python backend/test_api.py
```

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API status & station directory |
| `GET` | `/api/stations` | List all stations with coordinates and metadata |
| `GET` | `/api/stations/{id}` | Detailed profile for `maitri` or `bharati` |
| `GET` | `/api/stations/{id}/telemetry` | Real-time sensor snapshot |
| `GET` | `/api/stations/{id}/energy` | Subsystem metrics and 24h hourly history |
| `GET` | `/api/stations/{id}/infrastructure` | Equipment condition & vibration diagnostics |
| `GET` | `/api/stations/{id}/logistics` | Inventory levels, schedules, and risk rating |
| `GET` | `/api/stations/{id}/environmental` | Meteorology, air quality, ice/snow trends |
| `GET` | `/api/stations/{id}/alerts` | Active station alarms |
| `GET` | `/api/ai/insights/{id}` | AI operational recommendations & anomalies |
| `POST` | `/api/simulation/adjust` | Update simulation parameters dynamically |
| `POST` | `/api/simulation/reset` | Reset simulation state to nominal baseline |
| `GET` | `/api/stations/{id}/export/csv` | Download 24h environmental readings as CSV |

---

## 🗄️ PostgreSQL Database Schema

The database schema is located at `backend/schema.sql`. It defines:
1. `stations`: Metadata, GPS coordinates, altitude, capacity, comms satellite.
2. `telemetry_readings`: Time-series sensor data (temperature, wind, power, fuel, battery).
3. `energy_subsystems`: Generators, solar PV, BESS storage, and runtime hours.
4. `equipment_health`: Machinery health status (`NORMAL`, `WATCH`, `CRITICAL`), vibration, and thermal logs.
5. `inventory_stocks`: Polar diesel, food, medical kits, and science cryogens with daily burn rates.
6. `resupply_schedules`: Icebreaker voyages, ski cargo flights, and overland traverse convoys.
7. `alerts`: Active mission alarms and incident logs.

---

## 🏛️ Station Specifications

| Metric | Maitri Research Station | Bharati Research Station |
|---|---|---|
| **Location** | Schirmacher Oasis, Queen Maud Land | Larsemann Hills, Prydz Bay |
| **Coordinates** | 70°45′57″S, 11°44′09″E | 69°24′29″S, 76°11′14″E |
| **Altitude** | 130 meters AMSL | 35 meters AMSL |
| **Commissioned** | 1989 (38th year) | 2012 (14th year) |
| **Primary Power** | 3x 125 kVA Cummins Gensets | 3x 160 kVA Volvo Penta + 35 kW Bifacial Solar |
| **Energy Storage** | Lead-acid / Li-ion test bank | 150 kWh LiFePO4 BESS |
| **Water Supply** | Lake Priyadarshini meltwater intake | Seawater Reverse Osmosis Desalination |
| **Satellite Link** | GSAT-7A / Inmarsat-C | Dedicated VSAT Ku-Band / NRSC Ground Station |
| **Winter Capacity** | 25 Expeditioners | 24 Expeditioners |
