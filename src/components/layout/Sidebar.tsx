import { useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  BookOpen, 
  CalendarDays, 
  FileText, 
  ClipboardList, 
  TrendingUp, 
  Settings2,
  PanelLeftClose,
  PanelLeftOpen,
  GraduationCap,
  Video,
  type LucideIcon
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAppStore } from '../../store/useAppStore';
import { COMBOS } from '../../lib/constants';
import { Progress } from '../ui/progress';
import { differenceInDays } from 'date-fns';
import { useEffect, useState } from 'react';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Study Plan', path: '/plan', icon: Map },
  { label: 'Subjects & Topics', path: '/subjects', icon: BookOpen },
  { label: 'Daily Log', path: '/log', icon: CalendarDays },
  { label: 'Notes', path: '/notes', icon: FileText },
  { label: 'Resource Library', path: '/resources', icon: Video },
  { label: 'Mock Tests', path: '/mocks', icon: ClipboardList },
  { label: 'Score Evaluation', path: '/score', icon: TrendingUp },
  { label: 'Settings', path: '/settings', icon: Settings2 },
];

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar, setMobileSidebarOpen } = useAppStore();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Find current combo
  const today = new Date();
  const currentCombo = COMBOS.find(c => c.status === 'current') || COMBOS[0];

  const calculateYearProgress = () => {
    const start = new Date(2026, 3, 10);
    const end = new Date(2027, 1, 1);
    const totalDays = differenceInDays(end, start);
    const elapsedDays = differenceInDays(today, start);
    return Math.min(100, Math.max(0, Math.round((elapsedDays / totalDays) * 100)));
  };

  const progress = calculateYearProgress();

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 z-30 flex flex-col",
        sidebarOpen && !isMobile ? "w-60" : "w-16",
        isMobile && "w-64" // Full width when inside mobile Sheet
      )}
    >
      {/* Branding */}
      <div className="h-14 flex items-center px-4 border-b border-slate-200 dark:border-slate-800 overflow-hidden">
        <GraduationCap className="h-8 w-8 text-indigo-600 flex-shrink-0" />
        {(sidebarOpen || isMobile) && (
          <span className="ml-3 font-bold text-lg text-slate-900 dark:text-white whitespace-nowrap">
            GATE 2027
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const isActive = item.path === '/' 
            ? location.pathname === '/' 
            : location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => {
                if (isMobile) setMobileSidebarOpen(false);
              }}
              className={cn(
                "flex items-center h-10 px-3 rounded-md transition-colors relative group",
                isActive 
                  ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-indigo-600 dark:text-indigo-400")} />
              {(sidebarOpen || isMobile) && (
                <span className="ml-3 font-medium text-sm whitespace-nowrap">
                  {item.label}
                </span>
              )}
              {isActive && (
                <div className="absolute left-0 w-1 h-6 bg-indigo-600 dark:bg-indigo-400 rounded-r-full" />
              )}
              {!sidebarOpen && !isMobile && (
                <div className="absolute left-14 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Phase Card (Now Combo Card) */}
      {(sidebarOpen || isMobile) && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {currentCombo.name}
              </span>
              <span className="text-[10px] font-medium text-slate-400">
                {currentCombo.period}
              </span>
            </div>
            <div className="text-xs font-semibold mb-2 text-slate-900 dark:text-white truncate">
              {currentCombo.subjects.join(' + ')}
            </div>
            <Progress value={progress} className="h-1.5" />
            <div className="mt-1 text-[10px] text-right text-slate-500">
              Year Progress: {progress}%
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      {!isMobile && (
        <button
          onClick={toggleSidebar}
          className="h-12 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
        </button>
      )}
    </aside>
  );
}
