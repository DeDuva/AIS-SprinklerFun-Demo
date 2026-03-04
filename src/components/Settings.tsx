import React, { useState } from 'react';
import { SprinklerSettings, Timer, Program, Station } from '../types';
import { Plus, Trash2, Clock, Droplets, Save, DollarSign, Activity } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SettingsProps {
  settings: SprinklerSettings;
  onSave: (settings: SprinklerSettings) => void;
}

export default function Settings({ settings, onSave }: SettingsProps) {
  const [localSettings, setLocalSettings] = useState<SprinklerSettings>(settings);

  const handleSave = () => {
    onSave(localSettings);
  };

  const addTimer = () => {
    const newTimer: Timer = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Timer ${localSettings.timers.length + 1}`,
      programs: [
        {
          id: Math.random().toString(36).substr(2, 9),
          name: 'Program 1',
          startTime: '00:00:00',
          stations: []
        }
      ]
    };
    setLocalSettings({ ...localSettings, timers: [...localSettings.timers, newTimer] });
  };

  const removeTimer = (timerId: string) => {
    setLocalSettings({
      ...localSettings,
      timers: localSettings.timers.filter(t => t.id !== timerId)
    });
  };

  const updateTimerName = (timerId: string, name: string) => {
    setLocalSettings({
      ...localSettings,
      timers: localSettings.timers.map(t => t.id === timerId ? { ...t, name } : t)
    });
  };

  const addStation = (timerId: string, programId: string) => {
    setLocalSettings({
      ...localSettings,
      timers: localSettings.timers.map(t => {
        if (t.id !== timerId) return t;
        return {
          ...t,
          programs: t.programs.map(p => {
            if (p.id !== programId) return p;
            const newStation: Station = {
              id: Math.random().toString(36).substr(2, 9),
              name: (p.stations.length + 1).toString().padStart(2, '0'),
              duration: 0
            };
            return { ...p, stations: [...p.stations, newStation] };
          })
        };
      })
    });
  };

  const updateStation = (timerId: string, programId: string, stationId: string, updates: Partial<Station>) => {
    setLocalSettings({
      ...localSettings,
      timers: localSettings.timers.map(t => {
        if (t.id !== timerId) return t;
        return {
          ...t,
          programs: t.programs.map(p => {
            if (p.id !== programId) return p;
            return {
              ...p,
              stations: p.stations.map(s => s.id === stationId ? { ...s, ...updates } : s)
            };
          })
        };
      })
    });
  };

  const removeStation = (timerId: string, programId: string, stationId: string) => {
    setLocalSettings({
      ...localSettings,
      timers: localSettings.timers.map(t => {
        if (t.id !== timerId) return t;
        return {
          ...t,
          programs: t.programs.map(p => {
            if (p.id !== programId) return p;
            return {
              ...p,
              stations: p.stations.filter(s => s.id !== stationId)
            };
          })
        };
      })
    });
  };

  const updateProgramStartTime = (timerId: string, programId: string, startTime: string) => {
    setLocalSettings({
      ...localSettings,
      timers: localSettings.timers.map(t => {
        if (t.id !== timerId) return t;
        return {
          ...t,
          programs: t.programs.map(p => p.id === programId ? { ...p, startTime } : p)
        };
      })
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-[#141414]/50">Configure your irrigation system parameters</p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-[#5A5A40] text-white rounded-2xl hover:bg-[#4A4A30] transition-all shadow-lg shadow-[#5A5A40]/20 font-semibold"
        >
          <Save size={20} />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* General Settings */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-[#141414]/5 shadow-sm">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Activity size={20} className="text-[#5A5A40]" />
              General Config
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-[#141414]/40 mb-2">Sprinkler Threshold (gal)</label>
                <input 
                  type="number" 
                  value={localSettings.sprinklerOnThreshold}
                  onChange={(e) => setLocalSettings({ ...localSettings, sprinklerOnThreshold: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl bg-[#141414]/5 border-none focus:ring-2 focus:ring-[#5A5A40] transition-all"
                />
                <p className="text-[10px] text-[#141414]/40 mt-1 italic">Minimum morning usage to trigger sprinkler detection</p>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-[#141414]/40 mb-2">Gallons Per Unit (GPU)</label>
                <input 
                  type="number" 
                  value={localSettings.gpu}
                  onChange={(e) => setLocalSettings({ ...localSettings, gpu: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl bg-[#141414]/5 border-none focus:ring-2 focus:ring-[#5A5A40] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-[#141414]/40 mb-2">Cost Per Unit ($)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#141414]/40">$</span>
                  <input 
                    type="number" 
                    step="0.01"
                    value={localSettings.gpuCost}
                    onChange={(e) => setLocalSettings({ ...localSettings, gpuCost: Number(e.target.value) })}
                    className="w-full pl-8 pr-4 py-3 rounded-xl bg-[#141414]/5 border-none focus:ring-2 focus:ring-[#5A5A40] transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timers Config */}
        <div className="lg:col-span-2 space-y-8">
          {localSettings.timers.map((timer) => (
            <div key={timer.id} className="bg-white p-8 rounded-3xl border border-[#141414]/5 shadow-sm group">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#5A5A40]/10 rounded-xl flex items-center justify-center text-[#5A5A40]">
                    <Clock size={20} />
                  </div>
                  <input 
                    value={timer.name}
                    onChange={(e) => updateTimerName(timer.id, e.target.value)}
                    className="text-xl font-bold bg-transparent border-none focus:ring-0 p-0 w-48"
                  />
                </div>
                <button 
                  onClick={() => removeTimer(timer.id)}
                  className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {timer.programs.map((program) => (
                <div key={program.id} className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-[#141414]/5 rounded-2xl">
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-1">Start Time</label>
                      <input 
                        type="time" 
                        step="1"
                        value={program.startTime}
                        onChange={(e) => updateProgramStartTime(timer.id, program.id, e.target.value)}
                        className="bg-transparent border-none focus:ring-0 p-0 font-mono text-lg"
                      />
                    </div>
                    <button 
                      onClick={() => addStation(timer.id, program.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-[#5A5A40] rounded-xl hover:bg-[#5A5A40] hover:text-white transition-all text-sm font-semibold shadow-sm"
                    >
                      <Plus size={16} />
                      Add Station
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {program.stations.map((station) => (
                      <div key={station.id} className="p-4 rounded-2xl border border-[#141414]/10 hover:border-[#5A5A40]/30 transition-all group/station relative">
                        <button 
                          onClick={() => removeStation(timer.id, program.id, station.id)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/station:opacity-100 transition-opacity shadow-lg"
                        >
                          <Trash2 size={12} />
                        </button>
                        <div className="flex items-center justify-between mb-3">
                           <input 
                            value={station.name}
                            onChange={(e) => updateStation(timer.id, program.id, station.id, { name: e.target.value })}
                            className="text-xs font-bold uppercase tracking-widest text-[#141414]/40 bg-transparent border-none focus:ring-0 p-0 w-12"
                          />
                          <Droplets size={14} className="text-[#5A5A40]/40" />
                        </div>
                        <div className="flex items-end gap-2">
                          <input 
                            type="number"
                            value={station.duration}
                            onChange={(e) => updateStation(timer.id, program.id, station.id, { duration: Number(e.target.value) })}
                            className="text-2xl font-bold bg-transparent border-none focus:ring-0 p-0 w-16"
                          />
                          <span className="text-xs text-[#141414]/40 font-medium pb-1">min</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}

          <button 
            onClick={addTimer}
            className="w-full py-6 border-2 border-dashed border-[#141414]/10 rounded-3xl text-[#141414]/40 hover:border-[#5A5A40]/30 hover:text-[#5A5A40] transition-all flex flex-col items-center justify-center gap-2 group"
          >
            <div className="w-12 h-12 bg-[#141414]/5 rounded-full flex items-center justify-center group-hover:bg-[#5A5A40]/10 transition-colors">
              <Plus size={24} />
            </div>
            <span className="font-semibold">Add New Timer</span>
          </button>
        </div>
      </div>
    </div>
  );
}
