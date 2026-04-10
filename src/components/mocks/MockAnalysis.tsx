import type { MockTest, Subject } from '../../types';
import { 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription 
} from '../ui/sheet';
import { Badge } from '../ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
   
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Clock, CheckCircle2, AlertCircle, TrendingUp, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { marked } from 'marked';
import { ScrollArea } from '../ui/scroll-area';

interface MockAnalysisProps {
  mock: MockTest;
  subjects: Subject[];
}

export default function MockAnalysis({ mock, subjects }: MockAnalysisProps) {
  const accuracy = mock.attempted > 0 ? Math.round((mock.correct / mock.attempted) * 100) : 0;
  const timePerQuestion = mock.attempted > 0 ? (mock.time_taken_minutes / mock.attempted).toFixed(1) : 0;

  const chartData = Object.entries(mock.subject_scores || {}).map(([code, score]) => {
    const subject = subjects.find(s => s.short_code === code);
    return {
      name: code,
      score: score,
      max: subject?.gate_weightage_marks || 10,
      fullScore: ((score / (subject?.gate_weightage_marks || 10)) * 100).toFixed(1)
    };
  }).sort((a, b) => b.score - a.score);

  return (
    <SheetContent className="sm:max-w-[600px] p-0 flex flex-col">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900 font-bold uppercase tracking-widest text-[10px]">
              {mock.test_series}
            </Badge>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{format(new Date(mock.test_date), 'PPP')}</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <SheetTitle className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">{mock.test_name}</SheetTitle>
              <SheetDescription className="text-sm text-slate-500 font-medium">Performance Analysis</SheetDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 leading-none">{mock.scored_marks}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">out of {mock.total_marks}</div>
            </div>
          </div>
        </SheetHeader>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8 pb-12">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 mb-2" />
              <div className="text-xl font-black">{accuracy}%</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase">Accuracy</div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
              <Clock className="h-5 w-5 text-indigo-500 mb-2" />
              <div className="text-xl font-black">{timePerQuestion}m</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase">Per Question</div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
              <AlertCircle className="h-5 w-5 text-rose-500 mb-2" />
              <div className="text-xl font-black">{mock.wrong}</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase">Incorrect</div>
            </div>
          </div>

          {/* Subject-wise Bar Chart */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-500" /> Subject Breakdown
              </h4>
            </div>
            <div className="h-[300px] w-full bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: -20, right: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                    axisLine={false} 
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 text-white p-2 rounded-lg shadow-xl text-[10px]">
                            <div className="font-bold border-b border-slate-700 pb-1 mb-1">{payload[0].payload.name}</div>
                            <div>Score: {payload[0].value} / {payload[0].payload.max}</div>
                            <div className="text-indigo-400 font-bold">{payload[0].payload.fullScore}% Accuracy</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={16}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={parseFloat(entry.fullScore) > 70 ? '#10b981' : parseFloat(entry.fullScore) > 50 ? '#f59e0b' : '#f43f5e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-500" /> Review Notes
            </h4>
            <div className="prose prose-sm dark:prose-invert max-w-none bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              {mock.notes ? (
                <div dangerouslySetInnerHTML={{ __html: marked(mock.notes) }} />
              ) : (
                <p className="text-slate-400 italic">No review notes recorded for this test.</p>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </SheetContent>
  );
}
