import csv
import io
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from models import (
    SimulationUpdateRequest,
    StationOverview,
    TelemetrySnapshot,
    EnergySystemResponse,
    LogisticsResponse,
    OperationalInsightResponse
)
from data_engine import engine

app = FastAPI(
    title="PolarTwin Mission Control API",
    description="Digital Twin Framework for Maitri & Bharati Antarctic Research Stations",
    version="1.0.0"
)

# Enable CORS for seamless local frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def get_root():
    return {
        "framework": "PolarTwin: Digital Twin Framework",
        "stations": ["maitri", "bharati"],
        "status": "ONLINE",
        "docs_url": "/docs"
    }

@app.get("/api/stations")
def get_all_stations():
    return engine.get_stations()

@app.get("/api/stations/{station_id}")
def get_station_detail(station_id: str):
    stations = engine.get_stations()
    for s in stations:
        if s["id"] == station_id.lower():
            return s
    raise HTTPException(status_code=404, detail="Station not found")

@app.get("/api/stations/{station_id}/telemetry")
def get_station_telemetry(station_id: str):
    return engine.get_telemetry(station_id)

@app.get("/api/stations/{station_id}/energy")
def get_station_energy(station_id: str):
    return engine.get_energy_systems(station_id)

@app.get("/api/stations/{station_id}/infrastructure")
def get_station_infrastructure(station_id: str):
    return engine.get_infrastructure_health(station_id)

@app.get("/api/stations/{station_id}/logistics")
def get_station_logistics(station_id: str):
    return engine.get_logistics(station_id)

@app.get("/api/stations/{station_id}/environmental")
def get_station_environmental(station_id: str):
    return engine.get_environmental_data(station_id)

@app.get("/api/stations/{station_id}/alerts")
def get_station_alerts(station_id: str):
    return engine.get_alerts(station_id)

@app.get("/api/ai/insights/{station_id}")
def get_operational_insights(station_id: str):
    return engine.get_ai_insights(station_id)

@app.post("/api/simulation/adjust")
def update_simulation_state(req: SimulationUpdateRequest):
    sid = req.station_id or "maitri"
    updates = {}
    if req.weather_condition is not None:
        updates["weather_condition"] = req.weather_condition
    if req.fuel_level_pct is not None:
        updates["fuel_level_pct"] = req.fuel_level_pct
    if req.battery_soc_pct is not None:
        updates["battery_soc_pct"] = req.battery_soc_pct
    if req.gen2_fault is not None:
        updates["gen2_fault"] = req.gen2_fault
    if req.comms_status is not None:
        updates["comms_status"] = req.comms_status
    if req.outside_temp_c is not None:
        updates["outside_temp_c"] = req.outside_temp_c

    updated_cfg = engine.update_simulation(sid, updates)
    return {
        "status": "UPDATED",
        "station_id": sid,
        "current_simulation_config": updated_cfg,
        "active_telemetry": engine.get_telemetry(sid),
        "ai_insights": engine.get_ai_insights(sid)
    }

@app.post("/api/simulation/reset")
def reset_simulation():
    engine.reset_state()
    return {"status": "RESET_TO_NOMINAL"}

@app.get("/api/stations/{station_id}/export/csv")
def export_environmental_csv(station_id: str):
    env_data = engine.get_environmental_data(station_id)
    history = env_data.get("trends_24h", [])

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Station", "Timestamp_UTC", "Ambient_Temp_C", "Wind_Chill_C",
        "Wind_Speed_Knots", "Wind_Gust_Knots", "Air_Quality_PM25_ugm3",
        "Station_CO2_PPM", "Combustion_CO_PPM", "Ice_Thickness_Meters", "Snow_Accumulation_CM"
    ])
    for row in history:
        writer.writerow([
            station_id.upper(),
            row.get("timestamp"),
            row.get("temperature_c"),
            row.get("wind_chill_c"),
            row.get("wind_speed_knots"),
            row.get("wind_gust_knots"),
            row.get("air_quality_pm25"),
            row.get("station_co2_ppm"),
            row.get("co_emissions_ppm"),
            row.get("ice_thickness_m"),
            row.get("snow_accumulation_cm")
        ])

    output.seek(0)
    filename = f"polartwin_{station_id}_environmental_{int(row.get('wind_speed_knots', 0))}.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
