import { useMemo } from 'react';
import { 
  format, 
  eachDayOfInterval, 
  startOfWeek, 
  endOfWeek, 
  parseISO, 
  startOfMonth, 
  endOfMonth,
  differenceInDays,
  isToday,
} from 'date-fns';
import { useDailyLogs } from '@/hooks/useDailyLogs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Flame, Trophy, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StreakCard() {
  const { data: logs, loading } = useDailyLogs();

  const streakInfo = useMemo(() => {
    if (!logs || logs.length === 0) return { current: 0, longest: 0, week: [], monthCount: 0, monthTotal: 1 };

    // Unique sorted dates descending
    const dates = Array.from(new Set(logs.map(log => log.log_date))).sort((a, b) => b.localeCompare(a));
    
    // Calculate current streak
    let current = 0;
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(new Date(new Date().setDate(new Date().getDate() - 1)), 'yyyy-MM-dd');
    
    if (dates[0] === today || dates[0] === yesterday) {
      current = 1;
      for (let i = 0; i < dates.length - 1; i++) {
        const d1 = parseISO(dates[i]);
        const d2 = parseISO(dates[i+1]);
        if (differenceInDays(d1, d2) === 1) {
          current++;
        } else {
          break;
        }
      }
    }

    // Longest streak
    let longest = 0;
    let temp = 1;
    for (let i = 0; i < dates.length - 1; i++) {
      const d1 = parseISO(dates[i]);
      const d2 = parseISO(dates[i+1]);
      if (differenceInDays(d1, d2) === 1) {
        temp++;
      } else {
        longest = Math.max(longest, temp);
        temp = 1;
      }
    }
    longest = Math.max(longest, temp);

    // This week's study (7 slots)
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const weekData = weekDays.map(day => {
      const studied = dates.includes(format(day, 'yyyy-MM-dd'));
      return { day, studied };
    });

    // Month summary
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const monthStudiedCount = monthDays.filter(day => dates.includes(format(day, 'yyyy-MM-dd'))).length;

    return { current, longest, week: weekData, monthCount: monthStudiedCount, monthTotal: monthDays.length || 1 };
  }, [logs]);

  if (loading) return <Skeleton className="h-[200px] w-full" />;

  const getMotivationalMessage = (streak: number) => {
    if (streak === 0) return "Start a new streak today!";
    if (streak < 3) return "Great start! Keep it up!";
    if (streak < 7) return "You're on fire! Don't stop now!";
    return "Legendary consistency! Focus on the goal.";
  };

  return (
    <Card className="overflow-hidden border-none shadow-sm bg-white dark:bg-slate-900">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>Streak Tracker</span>
          <Flame className={cn("h-4 w-4", streakInfo.current > 0 ? "text-orange-500 fill-orange-500" : "text-slate-400")} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
               {streakInfo.current} <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Days</span>
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
               {getMotivationalMessage(streakInfo.current)}
            </span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg flex flex-col items-center min-w-[60px]">
             <Trophy className="h-4 w-4 text-amber-500 mb-1" />
             <span className="text-xs font-bold text-slate-900 dark:text-white">{streakInfo.longest}</span>
             <span className="text-[8px] font-bold text-slate-400 uppercase">Best</span>
          </div>
        </div>

        <div className="space-y-2">
           <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>This Week</span>
              <div className="flex gap-1">
                 {streakInfo.week.map((d, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "h-4 w-4 rounded-sm flex items-center justify-center text-[8px]",
                        d.studied 
                          ? "bg-indigo-600 text-white" 
                          : isToday(d.day) ? "border border-indigo-200 dark:border-indigo-800 text-slate-400" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                      )}
                    >
                       {format(d.day, 'EEEEE')}
                    </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
           <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Calendar className="h-3 w-3" />
              <span>This month: <strong>{streakInfo.monthCount}/{streakInfo.monthTotal}</strong> days</span>
           </div>
           <div className="h-1.5 w-20 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500" 
                style={{ width: `${(streakInfo.monthCount / streakInfo.monthTotal) * 100}%` }}
              />
           </div>
        </div>
      </CardContent>
    </Card>
  );
}
