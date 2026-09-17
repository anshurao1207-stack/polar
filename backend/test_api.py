import sys
import os
sys.path.append(os.path.dirname(__file__))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_endpoints():
    # 1. Root
    r = client.get("/")
    assert r.status_code == 200, f"Root failed: {r.text}"
    assert "PolarTwin" in r.json()["framework"]

    # 2. Stations
    r = client.get("/api/stations")
    assert r.status_code == 200
    stations = r.json()
    assert len(stations) == 2
    ids = [s["id"] for s in stations]
    assert "maitri" in ids and "bharati" in ids

    # 3. Telemetry
    r = client.get("/api/stations/maitri/telemetry")
    assert r.status_code == 200
    t = r.json()
    assert t["station_id"] == "maitri"
    assert "ambient_temp_c" in t

    # 4. Energy
    r = client.get("/api/stations/maitri/energy")
    assert r.status_code == 200
    e = r.json()
    assert len(e["diesel_generators"]) == 3
    assert len(e["hourly_history_24h"]) == 24

    # 5. Infrastructure
    r = client.get("/api/stations/maitri/infrastructure")
    assert r.status_code == 200
    assert len(r.json()) > 0

    # 6. Logistics
    r = client.get("/api/stations/maitri/logistics")
    assert r.status_code == 200
    log = r.json()
    assert len(log["inventory"]) > 0
    assert len(log["schedules"]) > 0

    # 7. Environmental
    r = client.get("/api/stations/maitri/environmental")
    assert r.status_code == 200
    env = r.json()
    assert "current" in env
    assert len(env["trends_24h"]) == 24

    # 8. Alerts
    r = client.get("/api/stations/maitri/alerts")
    assert r.status_code == 200
    assert isinstance(r.json(), list)

    # 9. AI Insights
    r = client.get("/api/ai/insights/maitri")
    assert r.status_code == 200
    ins = r.json()
    assert ins["health_index_pct"] > 0
    assert len(ins["key_recommendations"]) > 0

    # 10. Simulation adjust
    r = client.post("/api/simulation/adjust", json={
        "station_id": "maitri",
        "weather_condition": "BLIZZARD",
        "gen2_fault": True
    })
    assert r.status_code == 200
    adj = r.json()
    assert adj["current_simulation_config"]["gen2_fault"] == True
    assert adj["active_telemetry"]["active_alerts_count"] > 0

    # 11. CSV Export
    r = client.get("/api/stations/maitri/export/csv")
    assert r.status_code == 200
    assert "text/csv" in r.headers["content-type"]
    assert "Station,Timestamp_UTC" in r.text

    print("ALL 11 BACKEND API TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_endpoints()
