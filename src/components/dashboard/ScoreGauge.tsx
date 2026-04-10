import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import { useScoreProjection } from '../../hooks/useScoreProjection';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { TARGET_SCORE, CURRENT_SCORE } from '../../lib/constants';
import { TrendingUp } from 'lucide-react';

export default function ScoreGauge() {
  const { projectedScore, breakdown, loading } = useScoreProjection();

  if (loading) return <Skeleton className="h-[200px] w-full" />;

  const isInitial = projectedScore === 0 || projectedScore === CURRENT_SCORE;
  const displayScore = isInitial ? CURRENT_SCORE : projectedScore;

  const data = [
    { name: 'Baseline', value: CURRENT_SCORE, fill: '#f43f5e' },
    { name: 'Projected', value: displayScore, fill: '#f59e0b' },
    { name: 'Target', value: TARGET_SCORE, fill: '#10b981' }
  ];

  // Normalized values for the radial chart (0-100)
  const chartData = data.map(d => ({
    ...d,
    value: (d.value / TARGET_SCORE) * 100
  }));

  const marksNeeded = Math.max(0, TARGET_SCORE - displayScore);

  return (
    <Card className="overflow-hidden border-none shadow-sm bg-white dark:bg-slate-900">
      <CardHeader className="pb-0">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          Readiness Gauge
          <TrendingUp className="h-3 w-3 text-slate-400" />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="w-full overflow-hidden">
          <div className="h-[180px] w-full relative min-h-[180px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="60%" 
                outerRadius="100%" 
                barSize={10} 
                data={chartData} 
                startAngle={180} 
                endAngle={0}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar
                  background
                  dataKey="value"
                  cornerRadius={5}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-2 text-center">
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {displayScore}
              </div>
              <div className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">
                {isInitial ? 'Baseline' : 'Projected'}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center -mt-4 mb-4">
          <p className="text-[10px] font-medium text-slate-500">
            {isInitial 
              ? `Log study sessions to see your projected score.`
              : `Need ${marksNeeded} more marks to reach 750`
            }
          </p>
        </div>

        {/* Subject Mini Breakdown */}
        <div className="w-full grid grid-cols-6 gap-1 px-2">
          {Object.entries(breakdown).map(([code, score]) => {
            const readiness = Math.min(100, (score / 10) * 100); 
            return (
              <div key={code} className="space-y-1 group relative">
                <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-sm overflow-hidden flex flex-col justify-end">
                   <div 
                    className="bg-indigo-500/60 dark:bg-indigo-400/40 w-full transition-all duration-500" 
                    style={{ height: `${readiness}%` }}
                   />
                </div>
                <div className="text-[8px] text-center font-bold text-slate-400 truncate uppercase">
                  {code}
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-900 text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  {code}: {Math.round(readiness)}%
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
