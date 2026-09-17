import React, { useState, useEffect, useCallback } from 'react';
import {
  StationId,
  StationInfo,
  TelemetryData,
  EnergyData,
  EquipmentItem,
  LogisticsData,
  EnvironmentalData,
  AlertItem,
  OperationalInsight,
  SimulationParams
} from './types';
import { apiService } from './services/api';
import { initialStations, defaultSimParams } from './services/mockData';
import { Header } from './components/common/Header';
import { OverviewTab } from './components/overview/OverviewTab';
import { InfrastructureTab } from './components/infrastructure/InfrastructureTab';
import { LogisticsTab } from './components/logistics/LogisticsTab';
import { EnvironmentalTab } from './components/environmental/EnvironmentalTab';
import { SimulationModal } from './components/admin/SimulationModal';
import { Radio, AlertTriangle } from 'lucide-react';

export function App() {
  const [currentStationId, setCurrentStationId] = useState<StationId>('maitri');
  const [activeTab, setActiveTab] = useState<'overview' | 'infrastructure' | 'logistics' | 'environmental'>('overview');
  const [isSimulationOpen, setIsSimulationOpen] = useState<boolean>(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  // Station data state
  const [stations, setStations] = useState<Record<StationId, StationInfo>>(initialStations);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [energy, setEnergy] = useState<EnergyData | null>(null);
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [logistics, setLogistics] = useState<LogisticsData | null>(null);
  const [environmental, setEnvironmental] = useState<EnvironmentalData | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [insight, setInsight] = useState<OperationalInsight | null>(null);

  const loadData = useCallback(async (sid: StationId) => {
    try {
      const [tData, eData, eqData, logData, envData, altData, insData] = await Promise.all([
        apiService.getTelemetry(sid),
        apiService.getEnergy(sid),
        apiService.getEquipment(sid),
        apiService.getLogistics(sid),
        apiService.getEnvironmental(sid),
        apiService.getAlerts(sid),
        apiService.getOperationalInsights(sid)
      ]);

      setTelemetry(tData);
      setEnergy(eData);
      setEquipment(eqData);
      setLogistics(logData);
      setEnvironmental(envData);
      setAlerts(altData);
      setInsight(insData);
      setBackendOnline(apiService.getBackendStatus());
    } catch (err) {
      console.error('Error loading telemetry:', err);
    }
  }, []);

  // Initial load and station change effect
  useEffect(() => {
    loadData(currentStationId);
    // Poll every 8 seconds for dynamic state
    const timer = setInterval(() => {
      loadData(currentStationId);
    }, 8000);
    return () => clearInterval(timer);
  }, [currentStationId, loadData]);

  // Handle simulation parameter updates
  const handleSimulationApply = (newParams: SimulationParams) => {
    apiService.setSimParams(newParams);
    // Reload data immediately
    loadData(currentStationId);
  };

  const handleSimulationReset = () => {
    apiService.setSimParams(defaultSimParams[currentStationId]);
    loadData(currentStationId);
  };

  return (
    <div className="min-h-screen bg-[#060b13] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-900">
      {/* Top Header */}
      <Header
        currentStationId={currentStationId}
        onStationChange={(id) => setCurrentStationId(id)}
        stations={stations}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        alerts={alerts}
        onOpenSimulation={() => setIsSimulationOpen(true)}
        backendOnline={backendOnline}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {telemetry && energy && logistics && environmental && insight ? (
          <>
            {activeTab === 'overview' && (
              <OverviewTab
                currentStationId={currentStationId}
                onStationChange={(id) => setCurrentStationId(id)}
                stations={stations}
                telemetry={telemetry}
                energy={energy}
                insight={insight}
                alerts={alerts}
              />
            )}

            {activeTab === 'infrastructure' && (
              <InfrastructureTab
                currentStationId={currentStationId}
                energy={energy}
                equipment={equipment}
                telemetry={telemetry}
                alerts={alerts}
              />
            )}

            {activeTab === 'logistics' && (
              <LogisticsTab
                currentStationId={currentStationId}
                logistics={logistics}
                telemetry={telemetry}
              />
            )}

            {activeTab === 'environmental' && (
              <EnvironmentalTab
                currentStationId={currentStationId}
                environmental={environmental}
                telemetry={telemetry}
                onExportCsv={() => apiService.exportCsv(currentStationId)}
              />
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
            <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
            <p className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
              Connecting to PolarTwin Telemetry Link...
            </p>
          </div>
        )}
      </main>

      {/* Admin Simulation Modal */}
      <SimulationModal
        isOpen={isSimulationOpen}
        onClose={() => setIsSimulationOpen(false)}
        currentStationId={currentStationId}
        simParams={apiService.getSimParams(currentStationId)}
        onApplyChanges={handleSimulationApply}
        onReset={handleSimulationReset}
      />

      {/* Footer */}
      <footer className="border-t border-[#13233b] py-4 bg-[#050910] text-[11px] text-slate-500 font-mono text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>PolarTwin // Digital Twin Framework for Maitri &amp; Bharati Antarctic Research Stations</span>
          <span className="text-cyan-400">National Centre for Polar and Ocean Research (NCPOR)</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
