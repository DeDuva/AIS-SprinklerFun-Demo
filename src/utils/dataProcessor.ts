import { parse, ParseResult } from 'papaparse';
import { format, parseISO, addMinutes, isWithinInterval, set, getDay } from 'date-fns';
import { FlumeDataPoint, SprinklerSettings, DailySummary } from '../types';

export async function fetchAndProcessFlumeData(
  url: string,
  settings: SprinklerSettings
): Promise<{ data: FlumeDataPoint[]; summaries: DailySummary[] }> {
  return new Promise((resolve, reject) => {
    parse(url, {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (results: ParseResult<any>) => {
        const rawData = results.data;
        const processedData: FlumeDataPoint[] = rawData
          .filter((row: any) => row.datetime && row.gallons !== undefined)
          .map((row: any) => ({
            datetime: new Date(row.datetime),
            gallons: row.gallons,
            sprinkler: 'house',
            isSprinklerDay: false,
          }));

        // Group by date to determine sprinkler days
        const daysMap: Record<string, FlumeDataPoint[]> = {};
        processedData.forEach((point) => {
          const dateStr = format(point.datetime, 'yyyy-MM-dd');
          if (!daysMap[dateStr]) daysMap[dateStr] = [];
          daysMap[dateStr].push(point);
        });

        // Determine sprinkler days
        Object.keys(daysMap).forEach((dateStr) => {
          const dayPoints = daysMap[dateStr];
          
          // Check usage between 2AM and 8AM (approximate window)
          const morningUsage = dayPoints
            .filter((p) => {
              const hour = p.datetime.getHours();
              return hour >= 2 && hour < 8;
            })
            .reduce((sum, p) => sum + p.gallons, 0);

          if (morningUsage > settings.sprinklerOnThreshold) {
            dayPoints.forEach((p) => (p.isSprinklerDay = true));
          }
        });

        // Map sprinklers to data points
        processedData.forEach((point) => {
          if (!point.isSprinklerDay) return;

          const pointTimeStr = format(point.datetime, 'HH:mm:ss');
          
          settings.timers.forEach((timer) => {
            timer.programs.forEach((program) => {
              let currentStartTime = parseISO(`${format(point.datetime, 'yyyy-MM-dd')}T${program.startTime}`);
              
              program.stations.forEach((station) => {
                const stationEndTime = addMinutes(currentStartTime, station.duration);
                
                if (isWithinInterval(point.datetime, { start: currentStartTime, end: stationEndTime }) && station.duration > 0) {
                  point.sprinkler = `${timer.name}-${station.name}`;
                }
                
                currentStartTime = stationEndTime;
              });
            });
          });
        });

        // Create summaries
        const summaries: DailySummary[] = Object.keys(daysMap).map((dateStr) => {
          const dayPoints = daysMap[dateStr];
          const totalGallons = dayPoints.reduce((sum, p) => sum + p.gallons, 0);
          const sprinklerPoints = dayPoints.filter((p) => p.sprinkler !== 'house');
          const sprinklerGallons = sprinklerPoints.reduce((sum, p) => sum + p.gallons, 0);
          
          const bySprinkler: Record<string, number> = {};
          sprinklerPoints.forEach((p) => {
            if (p.sprinkler) {
              bySprinkler[p.sprinkler] = (bySprinkler[p.sprinkler] || 0) + p.gallons;
            }
          });

          return {
            date: dateStr,
            totalGallons,
            sprinklerGallons,
            isSprinklerDay: dayPoints[0].isSprinklerDay || false,
            bySprinkler,
          };
        });

        resolve({ data: processedData, summaries: summaries.sort((a, b) => a.date.localeCompare(b.date)) });
      },
      error: (error: any) => {
        reject(error);
      },
    });
  });
}
