import { format, differenceInDays, parseISO } from 'date-fns';
import { EXAM_DATE } from '../lib/constants';
import TodayCard from '../components/dashboard/TodayCard';
import ScoreGauge from '../components/dashboard/ScoreGauge';
import StudyHeatmap from '../components/dashboard/StudyHeatmap';
import MockTrendChart from '../components/dashboard/MockTrendChart';
import StreakCard from '../components/dashboard/StreakCard';
import UpcomingTopics from '../components/dashboard/UpcomingTopics';
import RecentNotes from '../components/dashboard/RecentNotes';
import MistakesWidget from '../components/dashboard/MistakesWidget';
import { Button } from '../components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDailyLogs } from '../hooks/useDailyLogs';
import { useMockTests } from '../hooks/useMockTests';
import { useScoreProjection } from '../hooks/useScoreProjection';
import PageSkeleton from '../components/ui/PageSkeleton';

export default function Dashboard() {
  const navigate = useNavigate();
  const { loading: logsLoading } = useDailyLogs();
  const { loading: mocksLoading } = useMockTests();
  const { loading: projectionLoading } = useScoreProjection();
  
  const daysLeft = differenceInDays(parseISO(EXAM_DATE), new Date());

  const isLoading = logsLoading || mocksLoading || projectionLoading;

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {format(new Date(), 'EEEE, MMMM d, yyyy')} · <span className="text-indigo-600 dark:text-indigo-400 font-bold">{daysLeft} days</span> to GATE
          </p>
        </div>
        <Button 
          onClick={() => navigate('/log')} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-100 dark:shadow-none transition-all hover:scale-105 active:scale-95 font-bold h-11 px-6 rounded-xl"
        >
          <Plus className="mr-2 h-5 w-5" /> Log Study Session
        </Button>
      </div>

      {/* Row 1: Today Summary & Score Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-5 lg:col-span-4">
          <TodayCard />
        </div>
        <div className="md:col-span-7 lg:col-span-8">
          <ScoreGauge />
        </div>
      </div>

      {/* Row 2: Heatmap (Full Width) */}
      <StudyHeatmap />

      {/* Row 3: Mock Trend & Streak */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <MockTrendChart />
        </div>
        <div className="lg:col-span-5">
          <StreakCard />
        </div>
      </div>

      {/* Row 4: Recommendations, Notes, & Mistakes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 pb-12">
        <div className="lg:col-span-4">
          <UpcomingTopics />
        </div>
        <div className="lg:col-span-4">
          <RecentNotes />
        </div>
        <div className="lg:col-span-4">
          <MistakesWidget />
        </div>
      </div>
    </div>
  );
}
