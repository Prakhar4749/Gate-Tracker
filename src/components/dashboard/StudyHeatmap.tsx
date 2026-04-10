import { useMemo } from 'react';
import { 
  format, 
  eachDayOfInterval, 
  subMonths, 
  startOfToday, 
  endOfToday, 
  isSameDay, 
  parseISO,
  startOfMonth,
  getDay
} from 'date-fns';
import { useDailyLogs } from '../../hooks/useDailyLogs';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { cn } from '../../lib/utils';

export default function StudyHeatmap() {
  const { data: logs, loading } = useDailyLogs();

  const heatmapData = useMemo(() => {
    const today = startOfToday();
    const sixMonthsAgo = subMonths(today, 5); // 6 months total including current
    const startOfInterval = startOfMonth(sixMonthsAgo);
    const interval = eachDayOfInterval({ start: startOfInterval, end: endOfToday() });

    return interval.map(date => {
      const dayLog = logs?.filter(log => isSameDay(parseISO(log.log_date), date));
      const hours = dayLog?.reduce((acc, log) => acc + log.hours_studied, 0) || 0;
      return { date, hours };
    });
  }, [logs]);

  const stats = useMemo(() => {
    if (!logs) return { days: 0, hours: 0, avg: 0 };
    const totalHours = logs.reduce((acc, log) => acc + log.hours_studied, 0);
    const uniqueDays = new Set(logs.map(log => log.log_date)).size;
    const avg = uniqueDays > 0 ? totalHours / uniqueDays : 0;
    return { days: uniqueDays, hours: totalHours, avg: avg.toFixed(1) };
  }, [logs]);

  if (loading) return <Skeleton className="h-[200px] w-full" />;

  // Group by weeks for easier rendering
  const weeks: { date: Date, hours: number }[][] = [];
  let currentWeek: { date: Date, hours: number }[] = [];

  heatmapData.forEach((day, _i) => {
    if (getDay(day.date) === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  });
  if (currentWeek.length > 0) weeks.push(currentWeek);

  const getColor = (hours: number) => {
    if (hours === 0) return 'bg-slate-100 dark:bg-slate-800/50';
    if (hours < 0.5) return 'bg-indigo-100 dark:bg-indigo-950/40';
    if (hours < 1) return 'bg-indigo-300 dark:bg-indigo-700/60';
    if (hours < 2) return 'bg-indigo-500 dark:bg-indigo-500/80';
    return 'bg-indigo-700 dark:bg-indigo-400';
  };

  const hasData = logs && logs.length > 0;

  return (
    <Card className="overflow-hidden border-none shadow-sm bg-white dark:bg-slate-900">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Study Heatmap (Last 6 Months)</CardTitle>
      </CardHeader>
      <CardContent className="relative">
        {!hasData && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-[1px]">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm">
              Start studying to see your heatmap
            </p>
          </div>
        )}
        <div className={cn("overflow-x-auto pb-2 scrollbar-hide", !hasData && "opacity-20 grayscale")}>
          <div className="flex gap-1 min-w-max">
            {/* Day Labels */}
            <div className="flex flex-col justify-around pr-2 text-[9px] text-slate-400 font-bold">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>

            {/* Grid */}
            <div className="flex gap-1">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1">
                  {/* Month Label */}
                  {getDay(week[0].date) === 0 && (wi === 0 || format(week[0].date, 'MMM') !== format(weeks[wi-1][0].date, 'MMM')) ? (
                    <div className="absolute -top-4 text-[9px] text-slate-400 font-bold whitespace-nowrap">
                       {format(week[0].date, 'MMM')}
                    </div>
                  ) : null}
                  
                  {/* Fill empty slots if first week starts mid-week */}
                  {wi === 0 && week.length < 7 && Array.from({ length: 7 - week.length }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-3 w-3" />
                  ))}

                  {week.map((day, di) => (
                    <div
                      key={di}
                      className={cn(
                        "h-3 w-3 rounded-sm transition-all duration-300 cursor-pointer hover:ring-1 hover:ring-indigo-400 group relative",
                        getColor(day.hours)
                      )}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                        {format(day.date, 'MMM d')}: {day.hours} hrs
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
           <div className="flex gap-4">
              <span><strong>{stats.days}</strong> days studied</span>
              <span><strong>{stats.hours.toFixed(1)}</strong> total hours</span>
              <span><strong>{stats.avg}</strong> avg hrs/day</span>
           </div>
           <div className="flex items-center gap-1 text-[10px]">
              <span>Less</span>
              <div className="h-2 w-2 rounded-sm bg-slate-100 dark:bg-slate-800" />
              <div className="h-2 w-2 rounded-sm bg-indigo-100 dark:bg-indigo-900" />
              <div className="h-2 w-2 rounded-sm bg-indigo-300 dark:bg-indigo-700" />
              <div className="h-2 w-2 rounded-sm bg-indigo-500 dark:bg-indigo-500" />
              <div className="h-2 w-2 rounded-sm bg-indigo-700 dark:bg-indigo-300" />
              <span>More</span>
           </div>
        </div>
      </CardContent>
    </Card>
  );
}
