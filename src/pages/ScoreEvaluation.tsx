import { useMemo, useState } from 'react';
import { useScoreProjection, useSaveProjection } from '../hooks/useScoreProjection';
import { useSubjects } from '../hooks/useSubjects';
import { useMockTests } from '../hooks/useMockTests';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Zap, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  RefreshCcw,
  Save,
  Trophy,
  History
} from 'lucide-react';
import WhatIfSimulator from '../components/score/WhatIfSimulator';
import PageSkeleton from '../components/ui/PageSkeleton';
import { TARGET_SCORE, CURRENT_SCORE, RANK_VS_SCORE_2024, GATE_WEIGHTAGE_HISTORY } from '../lib/constants';
import { cn, interpolateRank } from '@/lib/utils';
import { toast } from 'sonner';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  LineChart,
  Line,
  Legend
} from 'recharts';

export default function ScoreEvaluation() {
  const { projectedScore, breakdown, loading: projectionLoading, refetch } = useScoreProjection();
  const { data: subjects, loading: subjectsLoading } = useSubjects();
  const { data: mocks, loading: mocksLoading } = useMockTests();
  const { saveProjection, loading: saving } = useSaveProjection();
  
  const [visibleSubjects, setVisibleSubjects] = useState<string[]>(['TOC', 'OS', 'DBMS', 'CN', 'ALGO']);

  const isLoading = projectionLoading || subjectsLoading || mocksLoading;

  const estimatedRank = useMemo(() => interpolateRank(projectedScore), [projectedScore]);

  const cutoffInfo = useMemo(() => {
    if (estimatedRank <= 100) return "Typically satisfies cutoff for IIT Kanpur/Bombay (CS)";
    if (estimatedRank <= 200) return "Typically satisfies cutoff for IIT Kharagpur/Madras (CS)";
    if (estimatedRank <= 350) return "Typically satisfies cutoff for IIT Roorkee/Guwahati (CS)";
    if (estimatedRank <= 600) return "Typically satisfies cutoff for New IITs / Top NITs";
    return "Aim for < 500 rank for Old IIT CS programs";
  }, [estimatedRank]);

  const handleSaveSnapshot = async () => {
    const res = await saveProjection({
      projected_score: projectedScore,
      confidence_level: 'medium',
      basis: 'Topics + Mocks + PYQ',
      subjects_completed: subjects?.filter(s => (s.topics?.filter(t => t.status === 'completed').length || 0) === (s.topics?.length || 0)).length || 0,
      total_subjects: 12
    });
    if (res.success) toast.success('Score snapshot saved!');
  };

  const gapAnalysis = useMemo(() => {
    if (!subjects || !breakdown) return [];
    
    return subjects
      .map(s => {
        const projected = breakdown[s.short_code] || 0;
        const gap = s.gate_weightage_marks - projected;
        const topicsTodo = s.topics?.filter(t => t.status !== 'completed') || [];
        const estHours = topicsTodo.reduce((acc, t) => acc + (t.estimated_hours || 0), 0);
        
        return {
          ...s,
          projected,
          gap,
          estHours,
          priorityScore: gap * s.gate_weightage_marks // Weighted gap
        };
      })
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, 5);
  }, [subjects, breakdown]);

  if (isLoading) return <PageSkeleton />;

  const overallProgress = Math.round(((projectedScore - CURRENT_SCORE) / (TARGET_SCORE - CURRENT_SCORE)) * 100);

  // Weightage history chart data
  const historyData = GATE_WEIGHTAGE_HISTORY.years.map((year, i) => {
    const point: any = { year };
    Object.keys(GATE_WEIGHTAGE_HISTORY.subjects).forEach(sub => {
      point[sub] = (GATE_WEIGHTAGE_HISTORY.subjects as any)[sub][i];
    });
    return point;
  });

  const subjectColors: Record<string, string> = {
    TOC: "#6366f1",
    OS: "#10b981",
    DBMS: "#f59e0b",
    CN: "#f43f5e",
    ALGO: "#8b5cf6",
    CD: "#ec4899",
    COA: "#06b6d4",
    PROG: "#14b8a6",
    DS: "#f97316",
    DL: "#3b82f6"
  };

  const toggleSubject = (sub: string) => {
    setVisibleSubjects(prev => 
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    );
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Score Evaluation</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Real-time rank estimation & bottleneck analysis</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="h-9 font-bold border-slate-200 dark:border-slate-800">
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button size="sm" onClick={handleSaveSnapshot} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 h-9 font-bold">
            <Save className="mr-2 h-4 w-4" /> Save Snapshot
          </Button>
        </div>
      </div>

      {/* Main Projection Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Trophy className="h-40 w-40 text-indigo-600" />
          </div>
          <CardContent className="p-8 md:p-10 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                <Badge className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border-none font-black px-3 py-1 text-[10px] tracking-widest uppercase">
                  PROJECTED GATE SCORE
                </Badge>
                <div className="flex items-baseline gap-4">
                  <span className="text-8xl font-black text-slate-900 dark:text-white tracking-tighter">
                    {projectedScore}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-emerald-500 flex items-center gap-1">
                      <ArrowUpRight className="h-5 w-5" /> +{projectedScore - CURRENT_SCORE}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Growth</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <span>Target: {TARGET_SCORE}</span>
                    <span>{overallProgress}% COMPLETE</span>
                  </div>
                  <Progress value={overallProgress} className="h-3 bg-slate-100 dark:bg-slate-800" />
                </div>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-3xl p-8 border border-indigo-100 dark:border-indigo-900/50 flex flex-col items-center text-center space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">Estimated AIR</div>
                  <div className="text-5xl font-black text-slate-900 dark:text-white">~{estimatedRank}</div>
                </div>
                <div className="text-[10px] font-bold text-slate-500 max-w-[180px]">
                  {cutoffInfo}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confidence Card */}
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Model Confidence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center text-center space-y-2">
               <div className="text-4xl font-black text-emerald-500">HIGH</div>
               <p className="text-xs text-slate-500 font-medium">Based on exhaustive data from all {subjects?.length} subjects.</p>
            </div>
            <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-800">
               <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Baseline Marks</span>
                  <span className="text-sm font-black">{CURRENT_SCORE}</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Mocks Analyzed</span>
                  <span className="text-sm font-black">{mocks?.length || 0}</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Topics Tracked</span>
                  <span className="text-sm font-black">{subjects?.reduce((acc, s) => acc + (s.topics?.length || 0), 0)}</span>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rank vs Marks Chart */}
      <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base font-black flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" /> Rank Projection Curve (2024-2026 Data)
          </CardTitle>
          <CardDescription className="text-xs">Interpolated AIR based on current projected marks. Shaded areas represent Old IIT CS cutoffs.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={RANK_VS_SCORE_2024} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRank" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="marks" 
                  reversed 
                  type="number" 
                  domain={[30, 100]} 
                  tick={{ fontSize: 10, fontWeight: 700 }}
                  label={{ value: 'GATE Marks', position: 'insideBottom', offset: -5, fontSize: 10, fontWeight: 800 }}
                />
                <YAxis 
                  dataKey="rank" 
                  tick={{ fontSize: 10, fontWeight: 700 }}
                  label={{ value: 'Rank (AIR)', angle: -90, position: 'insideLeft', fontSize: 10, fontWeight: 800 }}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-800">
                          <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">AIR ESTIMATE</div>
                          <div className="text-sm font-bold">Marks: {payload[0].payload.marks}</div>
                          <div className="text-sm font-bold">Rank: ~{payload[0].payload.rank}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="rank" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRank)" 
                />
                <ReferenceLine x={projectedScore} stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" label={{ value: 'You', position: 'top', fill: '#f43f5e', fontSize: 10, fontWeight: 900 }} />
                <ReferenceLine x={75} stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" label={{ value: 'Target', position: 'top', fill: '#10b981', fontSize: 10, fontWeight: 900 }} />
                {/* Shaded bands for IITs */}
                <ReferenceLine x={75} stroke="transparent" label={{ value: 'IIT KANPUR', position: 'insideTopRight', fill: '#6366f1', fontSize: 8, fontWeight: 900, opacity: 0.5 }} />
                <ReferenceLine x={70} stroke="transparent" label={{ value: 'IIT ROORKEE', position: 'insideTopRight', fill: '#f59e0b', fontSize: 8, fontWeight: 900, opacity: 0.5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Subject Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="border-b border-slate-50 dark:border-slate-800">
              <CardTitle className="text-base font-black flex items-center gap-2 uppercase tracking-widest">
                <CheckCircle2 className="h-5 w-5 text-indigo-500" /> Subject Readiness
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50 dark:divide-slate-800">
                {subjects?.map(s => {
                  const score = breakdown[s.short_code] || 0;
                  const pct = Math.round((score / s.gate_weightage_marks) * 100);
                  const gap = s.gate_weightage_marks - score;
                  return (
                    <div key={s.id} className="p-4 flex items-center justify-between group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          {s.short_code}
                        </div>
                        <div className="flex-1 max-w-[200px]">
                          <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{s.name}</div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.gate_weightage_marks} Marks</div>
                        </div>
                        <div className="hidden md:block flex-1 max-w-[150px]">
                           <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500" style={{ width: `${pct}%` }} />
                           </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-sm font-black text-slate-900 dark:text-white">{score.toFixed(1)}</div>
                        <div className={cn(
                          "text-[9px] font-black uppercase tracking-widest",
                          gap > 3 ? "text-rose-500" : gap > 1 ? "text-amber-500" : "text-emerald-500"
                        )}>
                          -{gap.toFixed(1)} Gap
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Weightage History */}
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base font-black flex items-center gap-2 uppercase tracking-widest">
                    <History className="h-5 w-5 text-indigo-600" /> GATE Weightage History
                  </CardTitle>
                  <CardDescription className="text-xs font-medium">Last 10 GATE sessions subject-wise marks</CardDescription>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {Object.keys(GATE_WEIGHTAGE_HISTORY.subjects).map(sub => (
                  <Badge 
                    key={sub}
                    variant={visibleSubjects.includes(sub) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer text-[9px] font-bold px-2 py-0.5",
                      visibleSubjects.includes(sub) ? "" : "opacity-50"
                    )}
                    style={{ 
                      backgroundColor: visibleSubjects.includes(sub) ? subjectColors[sub] : 'transparent',
                      borderColor: subjectColors[sub],
                      color: visibleSubjects.includes(sub) ? '#fff' : subjectColors[sub]
                    }}
                    onClick={() => toggleSubject(sub)}
                  >
                    {sub}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="year" tick={{ fontSize: 9, fontWeight: 700 }} />
                    <YAxis tick={{ fontSize: 9, fontWeight: 700 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '10px', color: '#fff' }}
                      itemStyle={{ padding: '2px 0' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: 700, paddingTop: '20px' }} />
                    {Object.keys(GATE_WEIGHTAGE_HISTORY.subjects).map(sub => (
                      <Line 
                        key={sub}
                        type="monotone" 
                        dataKey={sub} 
                        stroke={subjectColors[sub]} 
                        strokeWidth={2} 
                        dot={{ r: 3 }} 
                        activeDot={{ r: 5 }}
                        hide={!visibleSubjects.includes(sub)}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottlenecks */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-base font-black flex items-center gap-2 uppercase tracking-widest">
                <AlertCircle className="h-5 w-5 text-rose-500" /> ROI Priority List
              </CardTitle>
              <p className="text-xs text-slate-500 font-medium">Subjects with the highest potential score gain</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {gapAnalysis.map((item) => (
                <div key={item.id} className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 space-y-3 group hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 tracking-widest uppercase">{item.short_code}</span>
                    <Badge variant="outline" className="text-[10px] font-black text-rose-500 border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20">-{item.gap.toFixed(1)} MARKS</Badge>
                  </div>
                  <div className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                    {item.name}
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-indigo-500" /> ~{item.estHours}h task</span>
                    <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /> High ROI</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <WhatIfSimulator 
            subjects={subjects || []} 
            baseProjectedScore={projectedScore} 
            initialBreakdown={breakdown} 
          />
        </div>
      </div>
    </div>
  );
}
