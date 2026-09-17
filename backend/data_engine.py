import datetime
import math
import random
from typing import Dict, Any, List

class PolarTwinEngine:
    def __init__(self):
        self.reset_state()

    def reset_state(self):
        self.simulation_overrides: Dict[str, Dict[str, Any]] = {
            "maitri": {
                "weather_condition": "MODERATE",  # CALM, MODERATE, BLIZZARD, SEVERE_STORM
                "fuel_level_pct": 74.5,
                "battery_soc_pct": 82.0,
                "gen2_fault": False,
                "comms_status": "OPTIMAL",
                "outside_temp_c": -26.4,
            },
            "bharati": {
                "weather_condition": "CALM",
                "fuel_level_pct": 88.2,
                "battery_soc_pct": 94.0,
                "gen2_fault": False,
                "comms_status": "OPTIMAL",
                "outside_temp_c": -18.2,
            }
        }

    def update_simulation(self, station_id: str, updates: Dict[str, Any]):
        sid = station_id.lower()
        if sid not in self.simulation_overrides:
            sid = "maitri"
        for k, v in updates.items():
            if v is not None and k in self.simulation_overrides[sid]:
                self.simulation_overrides[sid][k] = v
        return self.simulation_overrides[sid]

    def get_stations(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": "maitri",
                "name": "Maitri Research Station",
                "code": "IND-ANT-02",
                "latitude": -70.765833,
                "longitude": 11.735833,
                "altitude_m": 130.0,
                "region": "Schirmacher Oasis, Queen Maud Land",
                "commissioned_year": 1989,
                "winter_capacity": 25,
                "summer_capacity": 65,
                "current_occupancy": 23,
                "comms_satellite": "GSAT-7A / Inmarsat-C",
                "description": "India's second permanent Antarctic research base, situated in an ice-free rocky oasis on the shores of Lake Priyadarshini. Specializes in meteorology, geomagnetism, and glaciology.",
                "status": "OPERATIONAL"
            },
            {
                "id": "bharati",
                "name": "Bharati Research Station",
                "code": "IND-ANT-03",
                "latitude": -69.408056,
                "longitude": 76.187222,
                "altitude_m": 35.0,
                "region": "Larsemann Hills, Prydz Bay",
                "commissioned_year": 2012,
                "winter_capacity": 24,
                "summer_capacity": 47,
                "current_occupancy": 21,
                "comms_satellite": "Dedicated VSAT Ku-Band / NRSC Earth Station",
                "description": "State-of-the-art third Antarctic base constructed on aerodynamic stilts using 134 interlinked containers. Equipped with cutting-edge oceanography, atmospheric chemistry, and satellite telemetry labs.",
                "status": "OPERATIONAL"
            }
        ]

    def get_telemetry(self, station_id: str) -> Dict[str, Any]:
        sid = station_id.lower()
        if sid not in self.simulation_overrides:
            sid = "maitri"
        cfg = self.simulation_overrides[sid]

        # Calculate dynamics based on weather condition
        weather = cfg["weather_condition"]
        if weather == "CALM":
            base_temp = -14.0 if sid == "bharati" else -21.0
            wind_spd = 12.5
            wind_dir = 145
            pressure = 998.2
            humidity = 48.0
            snow_cm = 42.0
            wind_gust = 18.0
        elif weather == "MODERATE":
            base_temp = -18.5 if sid == "bharati" else -26.5
            wind_spd = 28.0
            wind_dir = 160
            pressure = 984.0
            humidity = 65.0
            snow_cm = 58.0
            wind_gust = 41.0
        elif weather == "BLIZZARD":
            base_temp = -28.0 if sid == "bharati" else -34.5
            wind_spd = 58.5
            wind_dir = 185
            pressure = 961.0
            humidity = 88.0
            snow_cm = 112.0
            wind_gust = 74.0
        else:  # SEVERE_STORM
            base_temp = -35.0 if sid == "bharati" else -42.0
            wind_spd = 84.0
            wind_dir = 195
            pressure = 948.0
            humidity = 95.0
            snow_cm = 185.0
            wind_gust = 106.0

        outside_temp = cfg["outside_temp_c"] if cfg.get("outside_temp_c") is not None else base_temp
        # Wind chill approx formula
        wind_chill = round(13.12 + 0.6215 * outside_temp - 11.37 * (wind_spd ** 0.16) + 0.3965 * outside_temp * (wind_spd ** 0.16), 1)

        # Power demands
        base_demand = 82.0 if sid == "maitri" else 96.0
        if weather in ["BLIZZARD", "SEVERE_STORM"]:
            base_demand += 24.0  # extra heating & trace heaters

        # Gen2 fault impacts
        gen_fault = cfg["gen2_fault"]
        power_gen = base_demand + 12.0 if not gen_fault else max(base_demand - 15.0, 65.0)

        fuel_pct = cfg["fuel_level_pct"]
        battery_soc = cfg["battery_soc_pct"]

        # Daily autonomy estimation: ~450L / day nominal
        fuel_liters = (fuel_pct / 100.0) * (180000.0 if sid == "maitri" else 220000.0)
        daily_burn = 520.0 if weather in ["BLIZZARD", "SEVERE_STORM"] else 440.0
        autonomy_days = int(fuel_liters / daily_burn)

        alerts = self.get_alerts(sid)

        return {
            "station_id": sid,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "ambient_temp_c": round(outside_temp, 1),
            "wind_speed_knots": round(wind_spd, 1),
            "wind_gust_knots": round(wind_gust, 1),
            "wind_direction_deg": wind_dir,
            "wind_chill_c": wind_chill,
            "pressure_hpa": round(pressure, 1),
            "relative_humidity_pct": round(humidity, 1),
            "solar_irradiance_wm2": 180.0 if sid == "bharati" and weather == "CALM" else 25.0,
            "snow_accumulation_cm": round(snow_cm, 1),
            "ice_thickness_m": 2.15 if sid == "maitri" else 1.85,
            "current_occupancy": 23 if sid == "maitri" else 21,
            "power_demand_kw": round(base_demand, 1),
            "power_generated_kw": round(power_gen, 1),
            "fuel_level_pct": round(fuel_pct, 1),
            "battery_soc_pct": round(battery_soc, 1),
            "supply_days_remaining": autonomy_days,
            "active_alerts_count": len([a for a in alerts if a["severity"] in ["WARNING", "CRITICAL"]])
        }

    def get_energy_systems(self, station_id: str) -> Dict[str, Any]:
        sid = station_id.lower()
        if sid not in self.simulation_overrides:
            sid = "maitri"
        cfg = self.simulation_overrides[sid]

        gen2_fault = cfg["gen2_fault"]
        weather = cfg["weather_condition"]

        # Gensets configuration
        if sid == "maitri":
            gensets = [
                {
                    "id": "MTR-DG-1",
                    "name": "DG-1 (Cummins 125 kVA)",
                    "rated_kw": 100.0,
                    "output_kw": 68.5,
                    "status": "RUNNING",
                    "fuel_rate_lph": 18.2,
                    "temp_c": 84.2,
                    "vibration_mms": 2.8,
                    "runtime_hours": 8420.5
                },
                {
                    "id": "MTR-DG-2",
                    "name": "DG-2 (Cummins 125 kVA)",
                    "rated_kw": 100.0,
                    "output_kw": 0.0 if gen2_fault else (32.0 if weather != "CALM" else 0.0),
                    "status": "FAULT" if gen2_fault else ("RUNNING" if weather != "CALM" else "STANDBY"),
                    "fuel_rate_lph": 0.0 if gen2_fault or weather == "CALM" else 9.5,
                    "temp_c": 108.6 if gen2_fault else 78.4,
                    "vibration_mms": 7.9 if gen2_fault else 2.1,
                    "runtime_hours": 6140.0
                },
                {
                    "id": "MTR-DG-3",
                    "name": "DG-3 (Cummins 125 kVA Emergency)",
                    "rated_kw": 100.0,
                    "output_kw": 45.0 if gen2_fault else 0.0,
                    "status": "RUNNING" if gen2_fault else "STANDBY",
                    "fuel_rate_lph": 12.8 if gen2_fault else 0.0,
                    "temp_c": 79.5 if gen2_fault else 24.0,
                    "vibration_mms": 2.4 if gen2_fault else 0.0,
                    "runtime_hours": 2340.2
                }
            ]
            solar_pv = 4.5 if weather == "CALM" else 0.5
        else:
            # Bharati
            gensets = [
                {
                    "id": "BHT-DG-1",
                    "name": "DG-1 (Volvo Penta 160 kVA)",
                    "rated_kw": 130.0,
                    "output_kw": 74.0,
                    "status": "RUNNING",
                    "fuel_rate_lph": 20.4,
                    "temp_c": 81.5,
                    "vibration_mms": 1.9,
                    "runtime_hours": 7120.0
                },
                {
                    "id": "BHT-DG-2",
                    "name": "DG-2 (Volvo Penta 160 kVA)",
                    "rated_kw": 130.0,
                    "output_kw": 0.0 if gen2_fault else (35.0 if weather in ["BLIZZARD", "SEVERE_STORM"] else 0.0),
                    "status": "FAULT" if gen2_fault else ("RUNNING" if weather in ["BLIZZARD", "SEVERE_STORM"] else "STANDBY"),
                    "fuel_rate_lph": 0.0 if gen2_fault or weather not in ["BLIZZARD", "SEVERE_STORM"] else 10.2,
                    "temp_c": 112.4 if gen2_fault else 76.8,
                    "vibration_mms": 8.4 if gen2_fault else 1.8,
                    "runtime_hours": 5890.4
                },
                {
                    "id": "BHT-DG-3",
                    "name": "DG-3 (Volvo Penta 160 kVA Peaker)",
                    "rated_kw": 130.0,
                    "output_kw": 40.0 if gen2_fault else 0.0,
                    "status": "RUNNING" if gen2_fault else "STANDBY",
                    "fuel_rate_lph": 11.2 if gen2_fault else 0.0,
                    "temp_c": 80.0 if gen2_fault else 22.0,
                    "vibration_mms": 2.0 if gen2_fault else 0.0,
                    "runtime_hours": 1980.0
                }
            ]
            solar_pv = 32.5 if weather == "CALM" else (14.0 if weather == "MODERATE" else 1.2)

        total_diesel = sum(g["output_kw"] for g in gensets)
        battery_soc = cfg["battery_soc_pct"]
        bess_flow = -12.0 if (total_diesel + solar_pv > 105.0 and battery_soc < 95.0) else (18.0 if gen2_fault else 4.0)

        total_gen = total_diesel + solar_pv + max(0, -bess_flow)
        total_load = 86.0 if sid == "maitri" else 102.0
        if weather in ["BLIZZARD", "SEVERE_STORM"]:
            total_load += 22.0

        # Generate realistic 24h history curve
        history = []
        now = datetime.datetime.now(datetime.timezone.utc)
        for i in range(24, 0, -1):
            pt_time = (now - datetime.timedelta(hours=i)).strftime("%H:00")
            hour_val = int(pt_time.split(":")[0])
            # Solar peak around solar noon 10:00 - 15:00
            solar_factor = max(0.0, math.sin(math.radians((hour_val - 6) * 15))) if (6 <= hour_val <= 18) else 0.0
            pt_solar = round((28.0 if sid == "bharati" else 6.0) * solar_factor * (0.85 if weather == "CALM" else 0.2), 1)
            pt_base = round(48.0 + 4.0 * math.sin(i), 1)
            pt_sci = round(34.0 + 6.0 * math.cos(i), 1)
            pt_cons = round(pt_base + pt_sci + (18.0 if weather in ["BLIZZARD", "SEVERE_STORM"] else 4.0), 1)
            pt_diesel = round(max(30.0, pt_cons - pt_solar + (random.uniform(-2, 3))), 1)
            history.append({
                "time": pt_time,
                "diesel_kw": pt_diesel,
                "solar_kw": pt_solar,
                "battery_kw": round(abs(bess_flow) * (0.7 + 0.3 * math.sin(i)), 1),
                "total_generation_kw": round(pt_diesel + pt_solar, 1),
                "base_load_kw": pt_base,
                "science_load_kw": pt_sci,
                "total_consumption_kw": pt_cons
            })

        stability = 99.4 if not gen2_fault else 84.6

        return {
            "station_id": sid,
            "diesel_generators": gensets,
            "solar_pv_kw": round(solar_pv, 1),
            "battery_soc_pct": round(battery_soc, 1),
            "battery_net_flow_kw": round(bess_flow, 1),
            "total_production_kw": round(total_gen, 1),
            "total_consumption_kw": round(total_load, 1),
            "grid_stability_pct": stability,
            "hourly_history_24h": history
        }

    def get_infrastructure_health(self, station_id: str) -> List[Dict[str, Any]]:
        sid = station_id.lower()
        if sid not in self.simulation_overrides:
            sid = "maitri"
        cfg = self.simulation_overrides[sid]

        gen2_fault = cfg["gen2_fault"]
        comms_stat = cfg["comms_status"]

        items = [
            {
                "id": f"{sid.upper()}-POW-DG1",
                "name": "Main Genset DG-1",
                "subsystem": "POWER",
                "status": "NORMAL",
                "temperature_c": 82.4,
                "vibration_mms": 2.2,
                "operating_hours": 8420.0,
                "last_serviced": "2026-08-14",
                "next_inspection_days": 18,
                "diagnostic_note": "Lube oil pressure stable at 4.2 bar; exhaust temp nominal."
            },
            {
                "id": f"{sid.upper()}-POW-DG2",
                "name": "Aux Genset DG-2",
                "subsystem": "POWER",
                "status": "CRITICAL" if gen2_fault else "NORMAL",
                "temperature_c": 109.8 if gen2_fault else 77.1,
                "vibration_mms": 8.4 if gen2_fault else 1.9,
                "operating_hours": 6140.0,
                "last_serviced": "2026-07-28",
                "next_inspection_days": 4 if not gen2_fault else 0,
                "diagnostic_note": "CRITICAL bearing oscillation & thermal runaway detected!" if gen2_fault else "Standby sync controller responding within 120ms."
            },
            {
                "id": f"{sid.upper()}-BESS-01",
                "name": "Lithium Iron BESS Bank",
                "subsystem": "POWER",
                "status": "WATCH" if cfg["battery_soc_pct"] < 30.0 else "NORMAL",
                "temperature_c": 19.5,
                "vibration_mms": 0.1,
                "operating_hours": 12840.0,
                "last_serviced": "2026-06-02",
                "next_inspection_days": 42,
                "diagnostic_note": "Low reserve state" if cfg["battery_soc_pct"] < 30.0 else "Cell balance variation delta 0.012V across 192 cells."
            },
            {
                "id": f"{sid.upper()}-WTR-RO1",
                "name": "Lake Meltwater Intake" if sid == "maitri" else "Desalination RO Plant",
                "subsystem": "WATER",
                "status": "WATCH" if cfg["weather_condition"] in ["BLIZZARD", "SEVERE_STORM"] else "NORMAL",
                "temperature_c": 3.8,
                "vibration_mms": 1.4,
                "operating_hours": 4210.0,
                "last_serviced": "2026-08-29",
                "next_inspection_days": 12,
                "diagnostic_note": "Intake trace heating active to prevent sub-zero slush icing."
            },
            {
                "id": f"{sid.upper()}-HVAC-LOOP",
                "name": "Glycol Waste Heat Recovery Loop",
                "subsystem": "HVAC",
                "status": "NORMAL",
                "temperature_c": 72.0,
                "vibration_mms": 1.1,
                "operating_hours": 15400.0,
                "last_serviced": "2026-08-01",
                "next_inspection_days": 25,
                "diagnostic_note": "Heat exchanger transfer rate 94.2 kWt to living modules."
            },
            {
                "id": f"{sid.upper()}-COM-SAT",
                "name": "Radome Ku-Band Uplink",
                "subsystem": "COMMS",
                "status": "CRITICAL" if comms_stat == "BLACKOUT" else ("WATCH" if comms_stat == "DEGRADED" else "NORMAL"),
                "temperature_c": -12.4,
                "vibration_mms": 0.8,
                "operating_hours": 21000.0,
                "last_serviced": "2026-05-18",
                "next_inspection_days": 60,
                "diagnostic_note": "Satellite link severed - ionospheric disturbance" if comms_stat == "BLACKOUT" else ("High packet loss (18.4%)" if comms_stat == "DEGRADED" else "Carrier SNR 16.8 dB; NRSC ground station linked.")
            },
            {
                "id": f"{sid.upper()}-SCI-MET",
                "name": "Automated Weather Observation Mast",
                "subsystem": "SCIENTIFIC",
                "status": "NORMAL",
                "temperature_c": cfg["outside_temp_c"],
                "vibration_mms": 3.4 if cfg["weather_condition"] in ["BLIZZARD", "SEVERE_STORM"] else 0.7,
                "operating_hours": 9840.0,
                "last_serviced": "2026-07-15",
                "next_inspection_days": 35,
                "diagnostic_note": "Ultrasonic anemometer heater on. Data feed sync 100%."
            }
        ]
        return items

    def get_logistics(self, station_id: str) -> Dict[str, Any]:
        sid = station_id.lower()
        if sid not in self.simulation_overrides:
            sid = "maitri"
        cfg = self.simulation_overrides[sid]

        fuel_pct = cfg["fuel_level_pct"]
        fuel_stock = round((fuel_pct / 100.0) * (180000.0 if sid == "maitri" else 220000.0), 0)
        fuel_days = int(fuel_stock / (520.0 if cfg["weather_condition"] in ["BLIZZARD", "SEVERE_STORM"] else 440.0))

        inventory = [
            {
                "id": "STK-FUEL-POLAR",
                "category": "FUEL",
                "name": "Polar ATF / High-Speed Diesel (Winterized)",
                "current_stock": fuel_stock,
                "max_capacity": 180000.0 if sid == "maitri" else 220000.0,
                "unit": "Liters",
                "daily_burn": 440.0,
                "reorder_point": 45000.0,
                "days_remaining": fuel_days,
                "risk_level": "CRITICAL" if fuel_days < 35 else ("HIGH" if fuel_days < 70 else ("MODERATE" if fuel_days < 120 else "LOW"))
            },
            {
                "id": "STK-FOOD-RAT",
                "category": "FOOD",
                "name": "Dehydrated & Frozen Rations (Packaged)",
                "current_stock": 7850.0,
                "max_capacity": 10000.0,
                "unit": "Kg",
                "daily_burn": 34.5,
                "reorder_point": 2500.0,
                "days_remaining": 227,
                "risk_level": "LOW"
            },
            {
                "id": "STK-MED-ESS",
                "category": "MEDICINE",
                "name": "Emergency Surgical & Trauma Medical Packs",
                "current_stock": 142.0,
                "max_capacity": 160.0,
                "unit": "Kits",
                "daily_burn": 0.15,
                "reorder_point": 40.0,
                "days_remaining": 940,
                "risk_level": "LOW"
            },
            {
                "id": "STK-SCI-CRY",
                "category": "SCIENTIFIC",
                "name": "Liquid Helium & Nitrogen Dewar Flasks",
                "current_stock": 38.0,
                "max_capacity": 60.0,
                "unit": "Cylinders",
                "daily_burn": 0.28,
                "reorder_point": 15.0,
                "days_remaining": 135,
                "risk_level": "MODERATE"
            },
            {
                "id": "STK-SPR-GEN",
                "category": "CRITICAL_SPARES",
                "name": "Genset Alternators, Turbochargers & Filters",
                "current_stock": 18.0,
                "max_capacity": 24.0,
                "unit": "Sets",
                "daily_burn": 0.05,
                "reorder_point": 6.0,
                "days_remaining": 360,
                "risk_level": "LOW"
            }
        ]

        schedules = [
            {
                "id": "VOY-44-VASILIY",
                "mission": "44th Indian Antarctic Expedition Main Voyage",
                "transit_mode": "POLAR_VESSEL",
                "vessel_or_flight": "MV Vasiliy Golovnin (Charter Icebreaker)",
                "origin_port": "Port of Cape Town, South Africa",
                "destination": f"{sid.capitalize()} Fast Ice Anchorage",
                "departure_date": "2026-11-20",
                "eta": "2026-12-08",
                "days_to_eta": 81,
                "cargo_tons": 640.0,
                "status": "IN_PREPARATION",
                "weather_viable": True,
                "tracking_stage": "PORT_PREP"
            },
            {
                "id": "FLT-DROMLAN-04",
                "mission": "DROMLAN Intercontinental Airlift #4",
                "transit_mode": "AIR_CARGO",
                "vessel_or_flight": "IL-76TD-90VD (Ski-Equipped Cargo)",
                "origin_port": "Cape Town International (CPT)",
                "destination": "ALCI Blue Ice Runway (Novo)",
                "departure_date": "2026-10-14",
                "eta": "2026-10-14",
                "days_to_eta": 26,
                "cargo_tons": 18.5,
                "status": "SCHEDULED",
                "weather_viable": cfg["weather_condition"] in ["CALM", "MODERATE"],
                "tracking_stage": "PRE_FLIGHT_WINDOW"
            },
            {
                "id": "TRV-PISTON-02",
                "mission": "Heavy Overland PistenBully Convoy",
                "transit_mode": "TRAVERSE",
                "vessel_or_flight": "Kässbohrer PistenBully 300 Polar x4",
                "origin_port": "India Bay Shelf Depot",
                "destination": f"{sid.capitalize()} Main Bunker",
                "departure_date": "2026-09-24",
                "eta": "2026-09-27",
                "days_to_eta": 6,
                "cargo_tons": 42.0,
                "status": "STANDBY_FOR_WEATHER" if cfg["weather_condition"] in ["BLIZZARD", "SEVERE_STORM"] else "CLEARED_FOR_TRAVERSE",
                "weather_viable": cfg["weather_condition"] not in ["BLIZZARD", "SEVERE_STORM"],
                "tracking_stage": "STAGING_ICE_SHELF"
            }
        ]

        crit_count = sum(1 for it in inventory if it["risk_level"] in ["HIGH", "CRITICAL"])
        overall_risk = "CRITICAL" if fuel_days < 45 or crit_count >= 2 else ("ELEVATED" if fuel_days < 90 or crit_count >= 1 else "LOW")

        return {
            "station_id": sid,
            "inventory": inventory,
            "schedules": schedules,
            "overall_resupply_risk": overall_risk,
            "critical_stock_count": crit_count,
            "supply_days_autonomy": fuel_days
        }

    def get_environmental_data(self, station_id: str) -> Dict[str, Any]:
        sid = station_id.lower()
        if sid not in self.simulation_overrides:
            sid = "maitri"
        cfg = self.simulation_overrides[sid]

        weather = cfg["weather_condition"]
        outside_temp = cfg["outside_temp_c"]

        history = []
        now = datetime.datetime.now(datetime.timezone.utc)
        for i in range(24, 0, -1):
            pt_dt = now - datetime.timedelta(hours=i)
            t_str = pt_dt.strftime("%H:00")
            h_var = math.sin(i * 0.4)
            t_curr = round(outside_temp + 2.5 * h_var, 1)
            w_spd = round(22.0 + 12.0 * math.cos(i * 0.3) + (35.0 if weather in ["BLIZZARD", "SEVERE_STORM"] else 0.0), 1)
            w_gust = round(w_spd * 1.35, 1)
            w_chill = round(13.12 + 0.6215 * t_curr - 11.37 * (w_spd ** 0.16) + 0.3965 * t_curr * (w_spd ** 0.16), 1)
            history.append({
                "timestamp": t_str,
                "temperature_c": t_curr,
                "wind_chill_c": w_chill,
                "wind_speed_knots": w_spd,
                "wind_gust_knots": w_gust,
                "air_quality_pm25": round(1.2 + 0.4 * abs(h_var), 2),
                "station_co2_ppm": round(412.0 + 18.0 * (1.0 if i < 12 else 0.4), 1),
                "co_emissions_ppm": round(2.1 + (1.2 if cfg["gen2_fault"] else 0.2), 2),
                "ice_thickness_m": round(2.10 + 0.01 * math.sin(i * 0.1), 2) if sid == "maitri" else round(1.82 + 0.01 * math.sin(i * 0.1), 2),
                "snow_accumulation_cm": round(45.0 + (i * 1.8 if weather in ["BLIZZARD", "SEVERE_STORM"] else 0.2), 1)
            })

        latest = history[-1]
        threshold_alerts = []
        if latest["wind_speed_knots"] >= 50.0:
            threshold_alerts.append({
                "severity": "CRITICAL",
                "title": "Category 2/3 Severe Gale Alert",
                "message": f"Sustained wind speed {latest['wind_speed_knots']} knots. Outside egress strictly forbidden."
            })
        if latest["temperature_c"] <= -35.0:
            threshold_alerts.append({
                "severity": "WARNING",
                "title": "Extreme Deep Freeze Egress Protocol",
                "message": f"Ambient temperature {latest['temperature_c']}°C. Mandatory heated suit check for external tasks."
            })
        if cfg["gen2_fault"]:
            threshold_alerts.append({
                "severity": "WARNING",
                "title": "Combustion Exhaust Flue Elevated CO",
                "message": "Elevated carbon monoxide and particulate reading detected on generator stack manifold."
            })

        return {
            "station_id": sid,
            "current": latest,
            "trends_24h": history,
            "threshold_alerts": threshold_alerts
        }

    def get_alerts(self, station_id: str) -> List[Dict[str, Any]]:
        sid = station_id.lower()
        if sid not in self.simulation_overrides:
            sid = "maitri"
        cfg = self.simulation_overrides[sid]

        alerts = []
        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

        if cfg["gen2_fault"]:
            alerts.append({
                "id": "ALT-POW-002",
                "station_id": sid,
                "severity": "CRITICAL",
                "subsystem": "POWER",
                "title": "Genset DG-2 High Vibration & Bearing Thermal Runaway",
                "detail": "Vibration sensor detected 8.4 mm/s (threshold: 4.5 mm/s). Engine safety governor tripped. Backup DG-3 auto-cranked.",
                "timestamp": now_iso,
                "acknowledged": False
            })

        if cfg["weather_condition"] in ["BLIZZARD", "SEVERE_STORM"]:
            alerts.append({
                "id": "ALT-ENV-001",
                "station_id": sid,
                "severity": "CRITICAL" if cfg["weather_condition"] == "SEVERE_STORM" else "WARNING",
                "subsystem": "WEATHER",
                "title": "Severe Blizzard Emergency Protocol Active",
                "detail": f"Barometric pressure dropping sharply; gusts exceeding {75 if cfg['weather_condition'] == 'BLIZZARD' else 100} kts. Life lines rigged; all personnel accounted for in main modules.",
                "timestamp": now_iso,
                "acknowledged": True
            })

        if cfg["fuel_level_pct"] < 35.0:
            alerts.append({
                "id": "ALT-LOG-004",
                "station_id": sid,
                "severity": "CRITICAL" if cfg["fuel_level_pct"] < 20.0 else "WARNING",
                "subsystem": "LOGISTICS",
                "title": "Polar Diesel Reserve Below Operational Buffer",
                "detail": f"Fuel bunker capacity at {cfg['fuel_level_pct']}%. Recommend switching auxiliary research modules to load-shedding mode.",
                "timestamp": now_iso,
                "acknowledged": False
            })

        if cfg["battery_soc_pct"] < 35.0:
            alerts.append({
                "id": "ALT-POW-009",
                "station_id": sid,
                "severity": "WARNING",
                "subsystem": "ENERGY",
                "title": "BESS Battery Bank Low State of Charge",
                "detail": f"Storage bank SOC at {cfg['battery_soc_pct']}%. Inverter switching to grid-charge priority.",
                "timestamp": now_iso,
                "acknowledged": False
            })

        if cfg["comms_status"] == "BLACKOUT":
            alerts.append({
                "id": "ALT-COM-001",
                "station_id": sid,
                "severity": "CRITICAL",
                "subsystem": "COMMS",
                "title": "Complete Satellite Comms Uplink Blackout",
                "detail": "Primary Ku-band and secondary Iridium links non-responsive. Engaging autonomous failover logging mode.",
                "timestamp": now_iso,
                "acknowledged": False
            })
        elif cfg["comms_status"] == "DEGRADED":
            alerts.append({
                "id": "ALT-COM-002",
                "station_id": sid,
                "severity": "INFO",
                "subsystem": "COMMS",
                "title": "Satellite Bandwidth Throttled (Degraded)",
                "detail": "High packet jitter detected due to solar magnetic burst. Scientific bulk data transfer throttled.",
                "timestamp": now_iso,
                "acknowledged": True
            })

        # Baseline system info alert if clean
        if not alerts:
            alerts.append({
                "id": "ALT-SYS-NOMINAL",
                "station_id": sid,
                "severity": "INFO",
                "subsystem": "SYSTEM",
                "title": "Station Telemetry Nominal",
                "detail": "All primary and secondary microgrid, environmental, and life support parameters operate within envelope.",
                "timestamp": now_iso,
                "acknowledged": True
            })

        return alerts

    def get_ai_insights(self, station_id: str) -> Dict[str, Any]:
        sid = station_id.lower()
        if sid not in self.simulation_overrides:
            sid = "maitri"
        cfg = self.simulation_overrides[sid]

        weather = cfg["weather_condition"]
        fuel = cfg["fuel_level_pct"]
        soc = cfg["battery_soc_pct"]
        gen_fault = cfg["gen2_fault"]
        comms = cfg["comms_status"]

        # Calculate health score
        health = 98
        if gen_fault:
            health -= 25
        if weather == "SEVERE_STORM":
            health -= 20
        elif weather == "BLIZZARD":
            health -= 12
        if fuel < 30.0:
            health -= 18
        elif fuel < 50.0:
            health -= 8
        if soc < 30.0:
            health -= 10
        if comms == "BLACKOUT":
            health -= 15
        elif comms == "DEGRADED":
            health -= 5

        health = max(18, min(100, health))

        recs = []
        anomalies = []

        if gen_fault:
            anomalies.append("DG-2 forced shutdown due to high bearing vibration (8.4 mm/s).")
            recs.append("Isolate DG-2 fuel injector rail and dispatch mechanical engineer for harmonic vibration inspection.")
            recs.append("Verify DG-3 governor frequency stability under peak dinner hour load (18:00 - 20:30 UTC).")

        if weather in ["BLIZZARD", "SEVERE_STORM"]:
            anomalies.append(f"Antarctic gale advisory: gusts exceeding {80 if weather == 'BLIZZARD' else 105} knots.")
            recs.append("Initiate Red Egress protocol: restrict all inter-building movement unless hooked to steel safety guide ropes.")
            recs.append("Pre-heat auxiliary trace heating circuits on freshwater transfer pipelines to prevent flash freezing.")
        else:
            recs.append("Weather window is favorable: schedule outdoor antenna calibration and solar panel snow brushing.")

        if fuel < 40.0:
            recs.append(f"Fuel reserves at {fuel}%: defer non-essential cryocooler cycles and schedule priority fuel bladders on next PistenBully traverse.")

        if soc < 40.0 and sid == "bharati":
            recs.append("Prioritize daytime BESS trickle charge from bifacial solar arrays before 17:00 local time.")

        if not recs:
            recs.append("Grid operating at peak thermodynamic efficiency (41.2%). Continue scheduled 250-hour genset oil sampling.")
            recs.append("Oceanographic & upper atmospheric sounding radar data stream verified with NCPOR Goa.")

        summary = (
            f"PolarTwin Digital Twin AI for {sid.capitalize()}: Station health index is rated at {health}%. "
            f"Power balance is currently {'constrained due to DG-2 offline' if gen_fault else 'fully stabilized with reserve headroom'}. "
            f"Weather environment is {weather.lower().replace('_', ' ')}, with {int((fuel/100)*180000/440)} days of mission autonomy."
        )

        readiness = "MISSION_READY" if health >= 80 else ("CAUTION_ADVISED" if health >= 55 else "EMERGENCY_DEFENSE")

        return {
            "station_id": sid,
            "health_index_pct": health,
            "readiness_status": readiness,
            "executive_summary": summary,
            "key_recommendations": recs,
            "critical_anomalies": anomalies,
            "power_balance_eval": "CRITICAL DEFICIT - RUNNING ON SINGLE GENSET + BESS" if gen_fault else "NOMINAL BALANCED GENERATION",
            "weather_impact_advisory": "HIGH RISK: Structural wind buffeting and whiteout risk" if weather in ["BLIZZARD", "SEVERE_STORM"] else "LOW RISK: Standard polar operating conditions"
        }

engine = PolarTwinEngine()
