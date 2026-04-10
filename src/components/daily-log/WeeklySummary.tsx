import { useMemo } from 'react';
import { 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isSameDay, 
  parseISO 
} from 'date-fns';
import type { DailyLog, Subject } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  ResponsiveContainer, 
  Cell,
  Tooltip
} from 'recharts';
import { Clock, CheckCircle2, Zap, Flame } from 'lucide-react';

interface WeeklySummaryProps {
  logs: DailyLog[];
  subjects: Subject[];
}

export default function WeeklySummary({ logs, subjects }: WeeklySummaryProps) {
  const weeklyData = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const end = endOfWeek(new Date(), { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });

    return days.map(day => {
      const dayLogs = logs.filter(log => isSameDay(parseISO(log.log_date), day));
      const hours = dayLogs.reduce((acc, log) => acc + log.hours_studied, 0);
      return {
        day: format(day, 'EEE'),
        hours,
        fullDate: format(day, 'MMM d')
      };
    });
  }, [logs]);

  const stats = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const end = endOfWeek(new Date(), { weekStartsOn: 1 });
    const weekLogs = logs.filter(log => {
      const d = parseISO(log.log_date);
      return d >= start && d <= end;
    });

    const totalHours = weekLogs.reduce((acc, log) => acc + log.hours_studied, 0);
    const totalSolved = weekLogs.reduce((acc, log) => acc + log.pyqs_solved, 0);
    const totalCorrect = weekLogs.reduce((acc, log) => acc + log.pyqs_correct, 0);
    const avgProd = weekLogs.length > 0 
      ? weekLogs.reduce((acc, log) => acc + log.productivity_score, 0) / weekLogs.length 
      : 0;
    
    const uniqueSubjects = new Set(weekLogs.map(l => l.subject_id).filter(Boolean));
    const subjectNames = Array.from(uniqueSubjects).map(id => subjects.find(s => s.id === id)?.short_code).filter(Boolean);

    return {
      totalHours,
      accuracy: totalSolved > 0 ? Math.round((totalCorrect / totalSolved) * 100) : 0,
      avgProd: avgProd.toFixed(1),
      subjectNames,
      daysStudied: weekLogs.length
    };
  }, [logs, subjects]);

  return (
    <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center justify-between">
          Weekly Progress
          <Badge variant="outline" className="text-[10px] bg-slate-50 dark:bg-slate-800">
            {format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'MMM d')} - {format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'MMM d')}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <Clock className="h-3 w-3 text-indigo-500" /> Total Time
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{stats.totalHours}h</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Accuracy
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{stats.accuracy}%</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <Zap className="h-3 w-3 text-amber-500" /> Productivity
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{stats.avgProd}</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <Flame className="h-3 w-3 text-orange-500" /> Consistency
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{stats.daysStudied}/7d</div>
          </div>
        </div>

        {/* Chart */}
        <div className="w-full overflow-hidden">
          <div className="h-[120px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} 
              />
              <Tooltip 
                cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-xl font-bold">
                        {payload[0].value} hours
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                {weeklyData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.hours > 0 ? '#6366f1' : '#f1f5f9'} 
                    className={entry.hours === 0 ? 'dark:fill-slate-800' : ''}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        </div>

        {/* Subjects Covered */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Subjects this week</span>
          <div className="flex flex-wrap gap-2">
            {stats.subjectNames.length > 0 ? stats.subjectNames.map((name, i) => (
              <Badge key={i} variant="secondary" className="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-none text-[10px]">
                {name}
              </Badge>
            )) : (
              <span className="text-xs text-slate-400 italic">No subjects logged yet.</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
