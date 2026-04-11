import { useScoreProjection, useSaveProjection } from '../hooks/useScoreProjection';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  RefreshCcw,
  Save,
  Trophy,
  Info,
  ChevronRight,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import WhatIfSimulator from '../components/score/WhatIfSimulator';
import PageSkeleton from '../components/ui/PageSkeleton';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine
} from 'recharts';
import { GATE_2026_CSE_MARKS_RANK } from '../lib/utils';

export default function ScoreEvaluation() {
  const { 
    estimatedRawMarks, gateScore, estimatedRank, confidence,
    mockCount, topicsStarted,
    reachableIITs, subjectProjections, topGapSubjects,
    loading, refetch
  } = useScoreProjection();
  
  const { saveProjection, loading: saving } = useSaveProjection();

  const confidenceConfig = {
    very_low: { color: 'rose',   text: 'Very low confidence — Add mock tests to improve accuracy', icon: '⚠️' },
    low:      { color: 'amber',  text: 'Low confidence — Based on topic completion only', icon: '📊' },
    medium:   { color: 'blue',   text: 'Medium confidence — Based on mock data', icon: '📈' },
    high:     { color: 'emerald',text: 'High confidence — Based on 3+ mock tests', icon: '✅' },
  };

  const handleSaveSnapshot = async () => {
    const res = await saveProjection({
      projected_score: gateScore,
      confidence_level: confidence as any,
      basis: 'Stage 3 Engine (Marks vs Rank vs Score)',
      subjects_completed: subjectProjections.filter(s => s.topicCompletion === 1).length,
      total_subjects: subjectProjections.length
    });
    if (res.success) toast.success('Score snapshot saved!');
  };

  if (loading) return <PageSkeleton />;

  // Section 0 — Empty State
  if (mockCount === 0 && topicsStarted === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 px-4">
        <div className="h-24 w-24 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center text-5xl">📊</div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">No data to predict yet</h2>
          <p className="text-slate-500 max-w-md mx-auto font-medium">
            Start logging your study sessions and add mock test results.
            The more data you add, the more accurate your score prediction will be.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl h-11 px-6">
            <Link to="/log"><Plus className="mr-2 h-5 w-5" /> Add Study Log</Link>
          </Button>
          <Button asChild variant="outline" className="font-bold rounded-xl h-11 px-6 border-slate-200 dark:border-slate-800">
            <Link to="/mocks">Add Mock Test</Link>
          </Button>
        </div>
      </div>
    );
  }

  const conf = confidenceConfig[confidence as keyof typeof confidenceConfig];
  const simulationInitialBreakdown = Object.fromEntries(
    subjectProjections.map(s => [s.subject.short_code, s.projectedMarks])
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Prediction Engine v2</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium italic">Powered by official GATE 2026 CS data models</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="h-9 font-bold border-slate-200 dark:border-slate-800 rounded-xl">
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button size="sm" onClick={handleSaveSnapshot} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 h-9 font-bold rounded-xl px-4">
            <Save className="mr-2 h-4 w-4" /> Save Snapshot
          </Button>
        </div>
      </div>

      {/* Section 1 — Hero Score Card */}
      <Card className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Trophy className="h-48 w-48 text-indigo-600" />
        </div>
        <CardContent className="p-8 md:p-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center text-center lg:text-left">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Est. Raw Marks</span>
              <div className="text-6xl font-black text-slate-900 dark:text-white">{estimatedRawMarks}<span className="text-xl text-slate-400 ml-1">/100</span></div>
            </div>
            <div className="space-y-2 lg:border-x border-slate-100 dark:border-slate-800 lg:px-8">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">GATE Score</span>
              <div className="text-6xl font-black text-indigo-600 dark:text-indigo-400">{gateScore}<span className="text-xl opacity-50 ml-1">/1000</span></div>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Estimated AIR</span>
              <div className="text-6xl font-black text-slate-900 dark:text-white">~{estimatedRank}</div>
            </div>
          </div>

          <div className="mt-10 space-y-6">
            <div className="relative h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 bottom-0 left-0 bg-indigo-600 transition-all duration-1000 ease-out rounded-full"
                style={{ width: `${estimatedRawMarks}%` }}
              />
              {/* Target Markers */}
              <div className="absolute top-0 bottom-0 w-0.5 bg-indigo-400 z-20" style={{ left: `${marksGapToScore(750)}%` }}>
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-black text-indigo-500 whitespace-nowrap">TARGET 750</div>
              </div>
              <div className="absolute top-0 bottom-0 w-0.5 bg-emerald-500 z-20" style={{ left: `${marksGapToScore(800)}%` }}>
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-black text-emerald-500 whitespace-nowrap">TARGET 800</div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <Badge className={cn(
                "px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded-lg border-none",
                conf.color === 'rose' && "bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400",
                conf.color === 'amber' && "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
                conf.color === 'blue' && "bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
                conf.color === 'emerald' && "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
              )}>
                {conf.icon} {conf.text}
              </Badge>
              {(confidence === 'very_low' || confidence === 'low') && (
                <Button asChild variant="link" className="h-auto p-0 text-xs font-bold text-indigo-600 hover:text-indigo-700">
                  <Link to="/mocks">Add Mock Test <ChevronRight className="h-3 w-3 ml-1" /></Link>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Section 2 — IIT Admission Chances */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden h-full">
            <CardHeader>
              <CardTitle className="text-base font-black flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" /> IIT Admission Potential
              </CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold tracking-widest">M.Tech CSE General Category</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 px-4 pb-6">
              {reachableIITs.map(iit => (
                <div key={iit.name} className={cn(
                  "flex items-center justify-between p-3 rounded-2xl border transition-all",
                  iit.reachable  ? 'border-emerald-100 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-950/20' :
                  iit.borderline ? 'border-amber-100 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-950/20' :
                                   'border-slate-50 bg-slate-50/30 dark:border-slate-800/50 dark:bg-slate-900/30 opacity-60'
                )}>
                  <div>
                    <p className="font-black text-sm text-slate-900 dark:text-white">{iit.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold tracking-tight">Min marks: ~{iit.minMarks}</p>
                  </div>
                  <div className="text-right">
                    {iit.reachable ? (
                      <Badge className="bg-emerald-500 text-white border-none text-[8px] font-black uppercase tracking-widest py-0.5">Qualified</Badge>
                    ) : iit.borderline ? (
                      <span className="text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase">~{iit.gap} gap</span>
                    ) : (
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">+{iit.gap} needed</span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Section 3 — Subject Breakdown Table */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden h-full">
            <CardHeader className="border-b border-slate-50 dark:border-slate-800">
              <CardTitle className="text-base font-black flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-600" /> Prediction Breakdown by Subject
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                      <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Completion</th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mock Acc.</th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Readiness</th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Proj. Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {subjectProjections.map((s) => (
                      <tr key={s.subject.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-900 dark:text-white uppercase">{s.subject.short_code}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight line-clamp-1">{s.subject.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 w-8">{Math.round(s.topicCompletion * 100)}%</span>
                            <div className="h-1 w-12 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-slate-400" style={{ width: `${s.topicCompletion * 100}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {s.hasMockData ? (
                            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">{Math.round((s.mockAccuracy || 0) * 100)}%</span>
                          ) : (
                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">No Mocks</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Badge className={cn(
                            "text-[10px] font-black rounded-lg border-none px-2 py-0.5",
                            s.readiness >= 0.7 ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" :
                            s.readiness >= 0.4 ? "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400" :
                                                "bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                          )}>
                            {Math.round(s.readiness * 100)}%
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-black text-slate-900 dark:text-white">{s.projectedMarks.toFixed(1)}</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Max: {s.maxMarks}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Section 4 — Priority Gap Analysis */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-base font-black flex items-center gap-2">
                <Plus className="h-5 w-5 text-rose-500" /> ROI Priority List (Gap Analysis)
              </CardTitle>
              <CardDescription className="text-xs font-medium">Subjects with the highest potential score gain to reach target marks.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Fix these subjects to reach target fastest:</p>
              {topGapSubjects.map((item) => (
                <div key={item.subject.id} className="p-4 rounded-2xl border border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex justify-between items-center group hover:border-indigo-200 dark:hover:border-indigo-900 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900 dark:text-white">{item.subject.name}</span>
                      <Badge variant="secondary" className="text-[8px] font-black px-1.5 py-0">+{item.gap.toFixed(1)} MARKS</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                      <span className="flex items-center gap-1">ROI HIGH</span>
                      <span>Readiness: {Math.round(item.readiness * 100)}%</span>
                    </div>
                  </div>
                  <Button asChild size="sm" variant="ghost" className="h-8 w-8 rounded-full p-0 text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50">
                    <Link to="/subjects"><ChevronRight className="h-4 w-4" /></Link>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Section 7 — Marks Required Reference */}
          <Card className="border-none shadow-sm bg-indigo-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Info className="h-16 w-16" />
            </div>
            <CardHeader>
              <CardTitle className="text-base font-black">Success Benchmarks</CardTitle>
              <CardDescription className="text-indigo-100 text-xs">Official 2026 Raw Marks → Score → Rank Mapping</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <div className="space-y-3">
                {[700, 750, 800, 850].map(score => {
                  const marks = marksGapToScore(score);
                  const isCurrent = Math.abs(gateScore - score) < 25;
                  return (
                    <div key={score} className={cn(
                      "flex items-center justify-between p-3 rounded-xl border border-white/10",
                      isCurrent ? "bg-white/20 border-white/30" : "bg-white/5"
                    )}>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">GATE Score</span>
                        <span className="text-lg font-black">{score}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Need Marks</span>
                        <div className="text-base font-bold">~{marks}/100</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[9px] font-medium italic opacity-70">Note: Actual rank/score depends on the relative performance of all candidates in your session.</p>
            </CardContent>
          </Card>
        </div>

        {/* Section 5 — What-If Simulator */}
        <div className="lg:col-span-7">
          <WhatIfSimulator 
            subjects={subjectProjections.map(s => s.subject)} 
            baseProjectedScore={gateScore} 
            initialBreakdown={simulationInitialBreakdown} 
          />
          
          {/* Section 6 — Score History Chart */}
          <Card className="mt-8 border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base font-black flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-600" /> Rank Projection Curve (IITG 2026 Data)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={GATE_2026_CSE_MARKS_RANK} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRankProj" x1="0" y1="0" x2="0" y2="1">
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
                    />
                    <YAxis 
                      dataKey="rank" 
                      tick={{ fontSize: 10, fontWeight: 700 }}
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-800">
                              <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">AIR ESTIMATE</div>
                              <div className="text-sm font-bold">Marks: {payload[0].payload.marks}</div>
                              <div className="text-sm font-bold">Rank: ~{payload[0].payload.rank}</div>
                              <div className="text-[10px] font-medium text-slate-400">Score: {payload[0].payload.score}</div>
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
                      fill="url(#colorRankProj)" 
                    />
                    <ReferenceLine x={estimatedRawMarks} stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" label={{ value: 'You', position: 'top', fill: '#f43f5e', fontSize: 10, fontWeight: 900 }} />
                    <ReferenceLine x={marksGapToScore(750)} stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" label={{ value: 'Target', position: 'top', fill: '#10b981', fontSize: 10, fontWeight: 900 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function marksGapToScore(targetScore: number): number {
  const Mq = 30; const Mt = 85; const Sq = 350; const St = 900;
  if (targetScore <= Sq) return Mq;
  const marks = Mq + ((targetScore - Sq) * (Mt - Mq)) / (St - Sq);
  return Math.round(Math.min(Math.max(marks, 0), 100));
}
