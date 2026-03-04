import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  Cell, PieChart, Pie, Sector
} from 'recharts';
import { format, parseISO, isSameDay } from 'date-fns';
import { FlumeDataPoint, DailySummary, SprinklerSettings } from '../types';
import { Droplets, Calendar, DollarSign, Activity, ChevronRight, ChevronLeft } from 'lucide-react';

interface DashboardProps {
  data: FlumeDataPoint[];
  summaries: DailySummary[];
  settings: SprinklerSettings;
}

const COLORS = [
  '#5A5A40', '#8E9299', '#DDB7B1', '#718DBF', '#E84D60', 
  '#F27D26', '#00FF00', '#FF4444', '#4A4A30', '#151619'
];

export default function Dashboard({ data, summaries, settings }: DashboardProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(summaries[summaries.length - 1]?.date || null);

  const stats = useMemo(() => {
    const totalGallons = summaries.reduce((sum, s) => sum + s.totalGallons, 0);
    const sprinklerGallons = summaries.reduce((sum, s) => sum + s.sprinklerGallons, 0);
    const totalUnits = totalGallons / settings.gpu;
    const sprinklerUnits = sprinklerGallons / settings.gpu;
    const totalCost = totalUnits * settings.gpuCost;
    
    return {
      totalGallons,
      sprinklerGallons,
      totalUnits,
      sprinklerUnits,
      totalCost,
      sprinklerPercent: (sprinklerGallons / totalGallons) * 100
    };
  }, [summaries, settings]);

  const selectedDayData = useMemo(() => {
    if (!selectedDate) return null;
    const summary = summaries.find(s => s.date === selectedDate);
    if (!summary) return null;

    const sprinklerUsage = Object.entries(summary.bySprinkler).map(([name, gallons]) => ({
      name,
      gallons: Math.round(gallons * 10) / 10
    })).sort((a, b) => b.gallons - a.gallons);

    return {
      summary,
      sprinklerUsage
    };
  }, [selectedDate, summaries]);

  const flowRateData = useMemo(() => {
    const sprinklerFlows: Record<string, { total: number, count: number }> = {};
    
    data.forEach(p => {
      if (p.sprinkler && p.sprinkler !== 'house') {
        if (!sprinklerFlows[p.sprinkler]) {
          sprinklerFlows[p.sprinkler] = { total: 0, count: 0 };
        }
        sprinklerFlows[p.sprinkler].total += p.gallons;
        sprinklerFlows[p.sprinkler].count += 1;
      }
    });

    return Object.entries(sprinklerFlows)
      .map(([name, stats]) => ({
        name,
        gpm: Math.round((stats.total / stats.count) * 100) / 100
      }))
      .sort((a, b) => b.gpm - a.gpm);
  }, [data]);

  const sprinklerNames = useMemo(() => {
    const names = new Set<string>();
    summaries.forEach(s => {
      Object.keys(s.bySprinkler).forEach(name => names.add(name));
    });
    return Array.from(names);
  }, [summaries]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Consumption" 
          value={`${stats.totalGallons.toLocaleString()} gal`} 
          subValue={`${stats.totalUnits.toFixed(2)} units`}
          icon={<Droplets className="text-[#5A5A40]" />}
        />
        <StatCard 
          title="Sprinkler Usage" 
          value={`${stats.sprinklerGallons.toLocaleString()} gal`} 
          subValue={`${stats.sprinklerUnits.toFixed(2)} units (${stats.sprinklerPercent.toFixed(1)}%)`}
          icon={<Activity className="text-[#5A5A40]" />}
        />
        <StatCard 
          title="Estimated Cost" 
          value={`$${stats.totalCost.toFixed(2)}`} 
          subValue={`Based on $${settings.gpuCost}/unit`}
          icon={<DollarSign className="text-[#5A5A40]" />}
        />
        <StatCard 
          title="Time Period" 
          value={`${summaries.length} Days`} 
          subValue={`${format(parseISO(summaries[0].date), 'MMM d')} - ${format(parseISO(summaries[summaries.length-1].date), 'MMM d')}`}
          icon={<Calendar className="text-[#5A5A40]" />}
        />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Consumption Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-[#141414]/5 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-semibold tracking-tight">Daily Water Consumption</h3>
              <p className="text-sm text-[#141414]/50">Blue bars indicate sprinkler activity</p>
            </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summaries} onClick={(data) => data && data.activePayload && setSelectedDate(data.activePayload[0].payload.date)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => format(parseISO(val), 'MMM d')}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#14141466' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#14141466' }}
                />
                <Tooltip 
                  cursor={{ fill: '#5A5A400A' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white p-4 rounded-2xl shadow-xl border border-[#141414]/5">
                          <p className="font-semibold mb-1">{format(parseISO(d.date), 'EEEE, MMM d')}</p>
                          <p className="text-sm text-[#141414]/60">Total: {d.totalGallons.toFixed(1)} gal</p>
                          <p className="text-sm text-[#5A5A40] font-medium">Sprinklers: {d.sprinklerGallons.toFixed(1)} gal</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="totalGallons" radius={[6, 6, 0, 0]}>
                  {summaries.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isSprinklerDay ? '#5A5A40' : '#8E929933'} 
                      className="cursor-pointer transition-opacity hover:opacity-80"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sprinkler Flow Rates */}
        <div className="bg-white p-8 rounded-3xl border border-[#141414]/5 shadow-sm">
          <h3 className="text-xl font-semibold tracking-tight mb-8">Sprinkler Flow Rates (GPM)</h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {flowRateData.map((item, idx) => (
              <div key={item.name} className="group">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-[#141414]/80">{item.name}</span>
                  <span className="text-[#5A5A40] font-semibold">{item.gpm} GPM</span>
                </div>
                <div className="w-full bg-[#141414]/5 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#5A5A40] rounded-full transition-all duration-500" 
                    style={{ width: `${(item.gpm / Math.max(...flowRateData.map(f => f.gpm))) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDayData && (
        <div className="bg-white p-8 rounded-3xl border border-[#141414]/5 shadow-sm animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#5A5A40]/10 rounded-2xl flex items-center justify-center text-[#5A5A40]">
                <Calendar size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-semibold tracking-tight">
                  Details for {format(parseISO(selectedDate!), 'MMMM d, yyyy')}
                </h3>
                <p className="text-[#141414]/50">
                  {selectedDayData.summary.isSprinklerDay ? 'Sprinkler activity detected' : 'Normal household usage'}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
               <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#141414]/40 mb-1">Daily Total</p>
                  <p className="text-2xl font-bold">{selectedDayData.summary.totalGallons.toFixed(1)} gal</p>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-widest text-[#141414]/40 mb-6">Sprinkler Breakdown</h4>
              {selectedDayData.sprinklerUsage.length > 0 ? (
                <div className="space-y-6">
                  {selectedDayData.sprinklerUsage.map((item, idx) => (
                    <div key={item.name} className="flex items-center gap-4">
                      <div className="w-2 h-10 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <div className="flex-1">
                        <div className="flex justify-between items-end mb-1">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-sm font-bold">{item.gallons} gal</span>
                        </div>
                        <div className="w-full bg-[#141414]/5 h-1.5 rounded-full">
                          <div 
                            className="h-full rounded-full" 
                            style={{ 
                              width: `${(item.gallons / selectedDayData.summary.sprinklerGallons) * 100}%`,
                              backgroundColor: COLORS[idx % COLORS.length]
                            }} 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center border-2 border-dashed border-[#141414]/10 rounded-3xl">
                  <p className="text-[#141414]/40 italic">No sprinkler usage on this day</p>
                </div>
              )}
            </div>

            <div className="h-[300px]">
               <h4 className="text-sm font-semibold uppercase tracking-widest text-[#141414]/40 mb-6">Usage Distribution</h4>
               {selectedDayData.sprinklerUsage.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                       data={[
                         ...selectedDayData.sprinklerUsage,
                         { name: 'House', gallons: selectedDayData.summary.totalGallons - selectedDayData.summary.sprinklerGallons }
                       ]}
                       cx="50%"
                       cy="50%"
                       innerRadius={60}
                       outerRadius={100}
                       paddingAngle={5}
                       dataKey="gallons"
                     >
                       {[...selectedDayData.sprinklerUsage, { name: 'House', gallons: 0 }].map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={index === selectedDayData.sprinklerUsage.length ? '#8E929933' : COLORS[index % COLORS.length]} />
                       ))}
                     </Pie>
                     <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white p-3 rounded-xl shadow-lg border border-[#141414]/5">
                                <p className="font-semibold text-sm">{payload[0].name}</p>
                                <p className="text-xs text-[#141414]/60">{payload[0].value} gal</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                     />
                   </PieChart>
                 </ResponsiveContainer>
               ) : (
                 <div className="h-full flex items-center justify-center bg-[#141414]/5 rounded-3xl">
                    <p className="text-[#141414]/40">100% Household Usage</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, subValue, icon }: { title: string, value: string, subValue: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-[#141414]/5 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 bg-[#5A5A40]/5 rounded-xl flex items-center justify-center">
          {icon}
        </div>
      </div>
      <h4 className="text-xs font-semibold uppercase tracking-widest text-[#141414]/40 mb-1">{title}</h4>
      <p className="text-2xl font-bold text-[#141414] mb-1">{value}</p>
      <p className="text-xs text-[#141414]/50 font-medium">{subValue}</p>
    </div>
  );
}
