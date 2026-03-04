import React, { useState, useEffect, useMemo } from 'react';
import { Settings as SettingsIcon, LayoutDashboard, Droplets, Info } from 'lucide-react';
import { SprinklerSettings, DailySummary, FlumeDataPoint } from './types';
import { fetchAndProcessFlumeData } from './utils/dataProcessor';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DEFAULT_SETTINGS: SprinklerSettings = {
  timers: [
    {
      id: 't1',
      name: 'Timer 1',
      programs: [
        {
          id: 'p1',
          name: 'Program 1',
          startTime: '02:01:00',
          stations: [
            { id: 's1', name: '01', duration: 10 },
            { id: 's2', name: '02', duration: 15 },
            { id: 's3', name: '03', duration: 15 },
            { id: 's4', name: '04', duration: 15 },
            { id: 's5', name: '05', duration: 15 },
            { id: 's6', name: '06', duration: 15 },
            { id: 's7', name: '07', duration: 15 },
            { id: 's8', name: '08', duration: 15 },
            { id: 's9', name: '09', duration: 10 },
            { id: 's10', name: '10', duration: 15 },
            { id: 's11', name: '11', duration: 15 },
            { id: 's12', name: '12', duration: 6 },
          ],
        },
      ],
    },
    {
      id: 't2',
      name: 'Timer 2',
      programs: [
        {
          id: 'p2',
          name: 'Program 1',
          startTime: '06:30:00',
          stations: [
            { id: 's1', name: '01', duration: 0 },
            { id: 's2', name: '02', duration: 0 },
            { id: 's3', name: '03', duration: 6 },
            { id: 's4', name: '04', duration: 15 },
            { id: 's5', name: '05', duration: 0 },
            { id: 's6', name: '06', duration: 0 },
            { id: 's7', name: '07', duration: 5 },
            { id: 's8', name: '08', duration: 5 },
            { id: 's9', name: '09', duration: 5 },
            { id: 's10', name: '10', duration: 0 },
            { id: 's11', name: '11', duration: 0 },
            { id: 's12', name: '12', duration: 3 },
            { id: 's13', name: '13', duration: 0 },
            { id: 's14', name: '14', duration: 0 },
            { id: 's15', name: '15', duration: 0 },
            { id: 's16', name: '16', duration: 0 },
            { id: 's17', name: '17', duration: 0 },
            { id: 's18', name: '18', duration: 0 },
            { id: 's19', name: '19', duration: 3 },
            { id: 's20', name: '20', duration: 3 },
            { id: 's21', name: '21', duration: 3 },
            { id: 's22', name: '22', duration: 3 },
            { id: 's23', name: '23', duration: 3 },
            { id: 's24', name: '24', duration: 3 },
            { id: 's25', name: '25', duration: 3 },
          ],
        },
      ],
    },
  ],
  sprinklerOnThreshold: 500,
  gpu: 748,
  gpuCost: 10.47,
};

const DATA_URL = 'https://raw.githubusercontent.com/DeDuva/sprinkler/main/export_2023-05-27T01_00_00.000_2023-06-19T08_00_00.000.csv';

export default function App() {
  const [settings, setSettings] = useState<SprinklerSettings>(() => {
    const saved = localStorage.getItem('sprinkler_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'settings'>('dashboard');
  const [data, setData] = useState<{ data: FlumeDataPoint[]; summaries: DailySummary[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('sprinkler_settings', JSON.stringify(settings));
    loadData();
  }, [settings]);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await fetchAndProcessFlumeData(DATA_URL, settings);
      setData(result);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load Flume data. Please check the URL or your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#141414] font-sans">
      {/* Sidebar / Navigation */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-[#141414]/10 p-6 flex flex-col gap-8 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#5A5A40] rounded-xl flex items-center justify-center text-white">
            <Droplets size={24} />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">SprinklerFun</h1>
        </div>

        <nav className="flex flex-col gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
              activeTab === 'dashboard' ? "bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/20" : "hover:bg-[#141414]/5 text-[#141414]/60"
            )}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
              activeTab === 'settings' ? "bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/20" : "hover:bg-[#141414]/5 text-[#141414]/60"
            )}
          >
            <SettingsIcon size={20} />
            <span className="font-medium">Settings</span>
          </button>
        </nav>

        <div className="mt-auto p-4 bg-[#5A5A40]/5 rounded-2xl border border-[#5A5A40]/10">
          <div className="flex items-center gap-2 text-[#5A5A40] mb-2">
            <Info size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Quick Info</span>
          </div>
          <p className="text-xs text-[#141414]/60 leading-relaxed">
            Data is fetched from Flume meter at 1-min intervals. Sprinkler usage is estimated based on your schedule.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="ml-64 p-8 min-h-screen">
        {loading && !data ? (
          <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-[#5A5A40]/20 border-t-[#5A5A40] rounded-full animate-spin" />
            <p className="text-[#141414]/60 font-medium italic serif">Analyzing water patterns...</p>
          </div>
        ) : error ? (
          <div className="h-[80vh] flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
              <Info size={32} />
            </div>
            <h2 className="text-2xl font-semibold">Something went wrong</h2>
            <p className="text-[#141414]/60 max-w-md">{error}</p>
            <button onClick={loadData} className="mt-4 px-6 py-2 bg-[#5A5A40] text-white rounded-full hover:bg-[#4A4A30] transition-colors">
              Try Again
            </button>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && data && (
              <Dashboard data={data.data} summaries={data.summaries} settings={settings} />
            )}
            {activeTab === 'settings' && (
              <Settings settings={settings} onSave={setSettings} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
