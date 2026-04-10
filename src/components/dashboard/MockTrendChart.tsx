import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useMockTests } from '../../hooks/useMockTests';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { CURRENT_SCORE } from '../../lib/constants';

export default function MockTrendChart() {
  const { data: mocks, loading } = useMockTests();
  const navigate = useNavigate();

  const chartData = mocks
    ?.slice(0, 10)
    .reverse()
    .map(m => ({
      name: m.test_name,
      score: (m.scored_marks / m.total_marks) * 100,
      fullDate: m.test_date,
      series: m.test_series
    }));

  if (loading) return <Skeleton className="h-[300px] w-full" />;

  const hasMocks = chartData && chartData.length > 0;

  return (
    <Card className="overflow-hidden border-none shadow-sm bg-white dark:bg-slate-900">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Mock Test Trend</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate('/mocks')} className="text-xs text-indigo-600 dark:text-indigo-400">
          View all
        </Button>
      </CardHeader>
      <CardContent>
        {!hasMocks ? (
          <div className="h-[200px] flex flex-col items-center justify-center text-center space-y-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No mock tests recorded yet</p>
            <Button size="sm" onClick={() => navigate('/mocks')} className="bg-indigo-600 hover:bg-indigo-700 font-bold text-[10px] h-8 uppercase tracking-widest px-4">
              Add first mock
            </Button>
          </div>
        ) : (
          <div className="w-full overflow-hidden">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="fullDate" 
                  tick={{ fontSize: 10 }} 
                  axisLine={false} 
                  tickLine={false}
                  tickFormatter={(str) => {
                    const d = new Date(str);
                    return `${d.getDate()}/${d.getMonth() + 1}`;
                  }}
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    fontSize: '12px'
                  }} 
                />
                <ReferenceLine y={75} stroke="#10b981" strokeDasharray="3 3" label={{ position: 'right', value: '75%', fontSize: 10, fill: '#10b981' }} />
                <ReferenceLine y={(CURRENT_SCORE/1000)*100} stroke="#f43f5e" strokeDasharray="3 3" label={{ position: 'right', value: 'Base', fontSize: 10, fill: '#f43f5e' }} />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#6366f1" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
