import { useLocation } from 'react-router-dom';
import { Menu, Moon, Sun, Flame } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';
import { cn } from '../../lib/utils';
import { useAppStore } from '../../store/useAppStore';
import { useDailyLogs } from '../../hooks/useDailyLogs';
import { COMBOS, EXAM_DATE } from '../../lib/constants';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetTitle,
  SheetDescription 
} from '../ui/sheet';
import Sidebar from './Sidebar';

export default function Header() {
  const { theme, setTheme, mobileSidebarOpen, setMobileSidebarOpen } = useAppStore();
  const location = useLocation();
  const { data: logs } = useDailyLogs();

  // Get page title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/plan') return 'Study Plan';
    if (path === '/subjects') return 'Subjects & Topics';
    if (path === '/log') return 'Daily Log';
    if (path === '/notes') return 'Notes';
    if (path === '/mocks') return 'Mock Tests';
    if (path === '/score') return 'Score Evaluation';
    if (path === '/settings') return 'Settings';
    return 'GATE Tracker';
  };

  // Calculate Streak
  const calculateStreak = () => {
    if (!logs || logs.length === 0) return 0;
    
    // Get unique sorted dates
    const dates = Array.from(new Set(logs.map(log => log.log_date))).sort((a, b) => b.localeCompare(a));
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // If first log isn't today or yesterday, streak is 0
    const latestLogDate = new Date(dates[0]);
    latestLogDate.setHours(0, 0, 0, 0);
    const diff = differenceInDays(currentDate, latestLogDate);
    
    if (diff > 1) return 0;

    for (let i = 0; i < dates.length; i++) {
      const logDate = new Date(dates[i]);
      logDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(currentDate);
      expectedDate.setDate(currentDate.getDate() - i - (diff === 1 ? 0 : 0)); // Adjustment based on if started today or yesterday
      
      // Simpler approach: check if consecutive
      if (i === 0) {
        streak = 1;
      } else {
        const prevDate = new Date(dates[i-1]);
        const currDate = new Date(dates[i]);
        if (differenceInDays(prevDate, currDate) === 1) {
          streak++;
        } else {
          break;
        }
      }
    }
    return streak;
  };

  const streak = calculateStreak();
  const daysLeft = differenceInDays(parseISO(EXAM_DATE), new Date());

  // Find current combo for badge
  const currentCombo = COMBOS.find(c => c.status === 'current') || COMBOS[0];

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <header className="h-14 sticky top-0 z-20 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Mobile Sidebar */}
        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
            <SheetDescription className="sr-only">Sidebar menu for mobile navigation</SheetDescription>
            <Sidebar />
          </SheetContent>
        </Sheet>

        <h1 className="text-sm font-semibold text-slate-900 dark:text-white md:text-base">
          {getPageTitle()}
        </h1>

        <Badge variant="outline" className="hidden sm:flex ml-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800">
          {currentCombo.name} · {currentCombo.subjects[0]}
        </Badge>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Streak */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/50">
          <Flame className={cn("h-4 w-4", streak > 0 ? "text-orange-500 fill-orange-500" : "text-slate-400")} />
          <span className="text-xs font-bold text-orange-700 dark:text-orange-400">{streak}</span>
        </div>

        {/* Days Left */}
        <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100 border-none font-bold">
          {daysLeft}d to GATE
        </Badge>

        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full h-9 w-9">
          {theme === 'light' ? <Moon className="h-4 w-4 text-slate-600" /> : <Sun className="h-4 w-4 text-slate-400" />}
        </Button>
      </div>
    </header>
  );
}
