import { useState, useMemo } from 'react';
import { 
  SUBJECT_LIFECYCLE_STEPS, 
  COMBOS, 
  EXAM_DATE 
} from '../lib/constants';
import { useSubjects, useUpdateSubjectLifecycle } from '../hooks/useSubjects';
import { useDailyLogs } from '../hooks/useDailyLogs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  History, 
  Target,
  Flame,
  User,
  Info,
  PlayCircle,
  LayoutDashboard
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { format, differenceInDays, parseISO } from 'date-fns';
import { toast } from 'sonner';

export default function StudyPlan() {
  const { data: subjects, refetch: refetchSubjects } = useSubjects();
  const { data: logs } = useDailyLogs();
  const { updateLifecycle } = useUpdateSubjectLifecycle();
  const [activeComboId, setActiveComboId] = useState(1);

  const daysLeft = differenceInDays(parseISO(EXAM_DATE), new Date());

  // Derived state
  const comboSubjects = useMemo(() => subjects?.filter(s => s.combo_id === activeComboId) || [], [subjects, activeComboId]);
  const completedSubjects = useMemo(() => subjects?.filter(s => (s.lifecycle_step || 0) >= 10) || [], [subjects]);
  const track1Subject = useMemo(() => subjects?.find(s => s.combo_id !== 0 && (s.lifecycle_step || 0) < 10) || comboSubjects[0], [subjects, comboSubjects]);

  const comboProgress = useMemo(() => {
    if (comboSubjects.length === 0) return 0;
    const totalSteps = comboSubjects.length * 10;
    const completedSteps = comboSubjects.reduce((acc, s) => acc + (s.lifecycle_step || 0), 0);
    return Math.round((completedSteps / totalSteps) * 100);
  }, [comboSubjects]);

  const currentCombo = useMemo(() => COMBOS.find(c => c.id === activeComboId) || COMBOS[0], [activeComboId]);

  const handleStepUpdate = async (subjectId: string, step: number) => {
    const res = await updateLifecycle(subjectId, step);
    if (res.success) {
      toast.success('Strategy updated');
      refetchSubjects();
    }
  };

  const getSubjectDaysSpent = (subjectId: string) => {
    if (!logs) return 0;
    const subjectLogs = logs.filter(l => l.subject_id === subjectId);
    return subjectLogs.reduce((acc, l) => acc + l.hours_studied, 0) / 6; // assuming 6h/day avg
  };

  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Strategy Plan</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Topper's 3-Track System · {daysLeft} days to GATE</p>
        </div>
      </div>

      {/* Section 1: 3-Track Daily System Banner */}
      <Card className="border-none shadow-xl shadow-indigo-100/50 dark:shadow-none bg-gradient-to-br from-indigo-600 to-indigo-800 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Target className="h-32 w-32" />
        </div>
        <CardHeader className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Current Daily Strategy</span>
          </div>
          <CardTitle className="text-2xl font-black">Track Your 3-Track Day</CardTitle>
          <CardDescription className="text-indigo-100 font-medium">Split your {format(new Date(), 'EEEE')} study hours into these parallel tracks.</CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Track 1 */}
            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <Badge className="bg-indigo-500 text-[9px] font-black tracking-widest border-none">TRACK 1</Badge>
                <span className="text-[10px] font-bold text-indigo-200">MORNING</span>
              </div>
              <div className="text-sm font-black mb-1">New Subject Theory</div>
              <div className="text-xs text-indigo-100 mb-3 opacity-80">{track1Subject?.name || 'Loading...'}</div>
              <div className="flex items-center gap-2 text-[10px] font-bold">
                 <CheckCircle2 className="h-3 w-3" /> Step {track1Subject?.lifecycle_step || 0}/10 Done
              </div>
            </div>

            {/* Track 2 */}
            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <Badge className="bg-emerald-500 text-[9px] font-black tracking-widest border-none">TRACK 2</Badge>
                <span className="text-[10px] font-bold text-indigo-200">AFTERNOON</span>
              </div>
              <div className="text-sm font-black mb-1">Maths & Aptitude</div>
              <div className="text-xs text-indigo-100 mb-3 opacity-80">EM / DM / Aptitude — Rotate daily</div>
              <div className="flex items-center gap-2 text-[10px] font-bold">
                 <Clock className="h-3 w-3" /> 2–3 Hours Daily
              </div>
            </div>

            {/* Track 3 */}
            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <Badge className="bg-amber-500 text-[9px] font-black tracking-widest border-none">TRACK 3</Badge>
                <span className="text-[10px] font-bold text-indigo-200">EVENING</span>
              </div>
              <div className="text-sm font-black mb-1">Revision & Practice</div>
              <div className="text-xs text-indigo-100 mb-3 opacity-80">
                {completedSubjects.length > 0 
                  ? `${completedSubjects.length} subjects ready for revision` 
                  : 'Complete subjects to start Track 3'}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold">
                 <Flame className="h-3 w-3" /> workbook session
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Combo Timeline */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
          <Calendar className="h-4 w-4 text-indigo-600" /> Combo Timeline (Medium Learner)
        </h3>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {COMBOS.map((combo) => (
            <button
              key={combo.id}
              onClick={() => setActiveComboId(combo.id)}
              className={cn(
                "min-w-[240px] p-5 rounded-2xl border transition-all text-left group shrink-0 relative overflow-hidden",
                activeComboId === combo.id 
                  ? "bg-white dark:bg-slate-900 border-indigo-600 shadow-xl shadow-indigo-100/50 dark:shadow-none ring-2 ring-indigo-600/10" 
                  : "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-indigo-300"
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className={cn(
                  "text-[9px] font-black uppercase tracking-widest",
                  activeComboId === combo.id ? "bg-indigo-600 text-white border-none" : "text-slate-400"
                )}>
                  {combo.name}
                </Badge>
                {combo.status === 'current' && (
                  <motion.div 
                    animate={{ opacity: [1, 0.5, 1] }} 
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="h-2 w-2 rounded-full bg-amber-500" 
                  />
                )}
              </div>
              <div className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                {combo.subjects.join(' + ')}
              </div>
              <div className="text-[10px] text-slate-500 font-bold mb-4">{combo.period}</div>
              
              <div className="space-y-1.5">
                <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Progress</span>
                  <span>{combo.id === activeComboId ? comboProgress : 0}%</span>
                </div>
                <Progress value={combo.id === activeComboId ? comboProgress : 0} className="h-1" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Section 3 & 4: Combo Detail & Lifecycle Checklist */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black">Combo {activeComboId}: Subject Deep Dive</CardTitle>
                <CardDescription className="text-xs font-medium">{currentCombo?.period} · {currentCombo?.note || 'Focus on depth and practice.'}</CardDescription>
              </div>
              <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border-none font-bold">
                 {currentCombo.subjects.length} Subjects
              </Badge>
            </CardHeader>
            <CardContent className="space-y-8">
              {comboSubjects.map((subject) => {
                const daysSpent = getSubjectDaysSpent(subject.id);
                const idealDays = subject.ideal_days_medium || 30;
                const daysRemaining = Math.max(0, idealDays - daysSpent);
                
                return (
                  <div key={subject.id} className="space-y-6 pb-8 border-b border-slate-50 dark:border-slate-800 last:border-0 last:pb-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                           <h4 className="text-base font-black text-slate-900 dark:text-white">{subject.name}</h4>
                           <Badge variant="outline" className="text-[9px] font-bold border-slate-200 text-slate-400">{subject.short_code}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
                           <div className="flex items-center gap-1"><User className="h-3 w-3" /> {subject.primary_teacher}</div>
                           <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {idealDays} days plan</div>
                           <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
                              <Link to={`/resources?subject=${subject.short_code}`} className="flex items-center gap-1 text-rose-500 hover:underline">
                                 <PlayCircle className="h-3 w-3" /> Practice Resources
                              </Link>
                           </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="text-right">
                            <div className="text-xs font-black text-slate-900 dark:text-white">~{daysSpent.toFixed(1)} Days</div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Time Spent</div>
                         </div>
                         <div className="h-8 w-px bg-slate-100 dark:bg-slate-800" />
                         <div className="text-right">
                            <div className="text-xs font-black text-indigo-600 dark:text-indigo-400">~{daysRemaining.toFixed(1)} Days</div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Remaining</div>
                         </div>
                      </div>
                    </div>

                    {/* Lifecycle Stepper */}
                    <div className="space-y-4">
                       <div className="flex justify-between items-center px-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Subject Lifecycle Step {subject.lifecycle_step || 0}/10</span>
                          <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">
                             {subject.lifecycle_step === 10 ? 'COMPLETED' : 'IN PROGRESS'}
                          </span>
                       </div>
                       <div className="grid grid-cols-10 gap-1.5 h-2">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <button
                              key={i}
                              onClick={() => handleStepUpdate(subject.id, i + 1)}
                              className={cn(
                                "h-full rounded-full transition-all duration-300",
                                (subject.lifecycle_step || 0) > i 
                                  ? "bg-indigo-600 shadow-sm shadow-indigo-200" 
                                  : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                              )}
                            />
                          ))}
                       </div>
                       
                       {/* Section 4: Lifecycle Checklist Detail */}
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mt-4 pt-4 bg-slate-50/50 dark:bg-slate-900/50 p-4 rounded-xl">
                          {SUBJECT_LIFECYCLE_STEPS.map((step) => (
                            <div key={step.step} className="flex items-start gap-3 py-1.5">
                              <Checkbox 
                                id={`step-${subject.id}-${step.step}`}
                                checked={(subject.lifecycle_step || 0) >= step.step}
                                onCheckedChange={(checked) => {
                                  if (checked) handleStepUpdate(subject.id, step.step);
                                  else handleStepUpdate(subject.id, step.step - 1);
                                }}
                                className="mt-0.5 border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                              />
                              <div className="grid gap-0.5">
                                <label 
                                  htmlFor={`step-${subject.id}-${step.step}`}
                                  className={cn(
                                    "text-[11px] font-bold leading-none cursor-pointer",
                                    (subject.lifecycle_step || 0) >= step.step ? "text-slate-900 dark:text-white" : "text-slate-500"
                                  )}
                                >
                                  {step.label}
                                </label>
                                <p className="text-[9px] text-slate-400 font-medium">{step.description}</p>
                              </div>
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-8">
          {/* Section 5: Weekly Revision Picker (Track 3) */}
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="bg-amber-500 text-white p-5">
              <div className="flex items-center gap-2 mb-1">
                <History className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Track 3 Pool</span>
              </div>
              <CardTitle className="text-base font-black">Revision Planner</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-3">
                <p className="text-xs font-medium text-slate-500 leading-relaxed">
                  Every week, pick 2 completed subjects for a random revision session. Solve 1000+ practice session questions.
                </p>
                <div className="flex flex-wrap gap-2">
                  {completedSubjects.length > 0 ? (
                    completedSubjects.map(s => (
                      <Badge key={s.id} variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold py-1">
                        {s.short_code}
                      </Badge>
                    ))
                  ) : (
                    <div className="text-[10px] font-bold text-slate-400 italic">No subjects completed yet.</div>
                  )}
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full h-10 border-dashed border-amber-200 dark:border-amber-900 text-amber-600 dark:text-amber-400 hover:bg-amber-50 hover:text-amber-700 font-bold text-xs"
                disabled={completedSubjects.length < 2}
              >
                Generate Revision Session
              </Button>
            </CardContent>
          </Card>

          {/* Section 6: Test Strategy Reminder */}
          <Card className="border-none shadow-sm bg-slate-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <LayoutDashboard className="h-16 w-16" />
            </div>
            <CardContent className="p-6 space-y-4 relative z-10">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-widest">
                <LayoutDashboard className="h-4 w-4" /> Test Strategy
              </div>
              <div className="space-y-4">
                 <div className="flex gap-3">
                    <div className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                       <CheckCircle2 className="h-3 w-3" />
                    </div>
                    <p className="text-[11px] font-medium leading-relaxed">Start topic-wise tests after 2 workbooks + 2 times PYQs.</p>
                 </div>
                 <div className="flex gap-3">
                    <div className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                       <CheckCircle2 className="h-3 w-3" />
                    </div>
                    <p className="text-[11px] font-medium leading-relaxed">Don't wait for December. Give tests early to find gaps.</p>
                 </div>
              </div>
              <div className="pt-2">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-xs font-black h-9 uppercase tracking-widest">
                  View Recommended Tests
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Topper's Secret Note */}
          <div className="bg-indigo-50 dark:bg-indigo-950/30 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 space-y-3">
             <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase tracking-widest">
                <Info className="h-3.5 w-3.5" /> Topper's Secret
             </div>
             <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed italic">
               "Consistency in Track 2 (Maths) is what separates top 500 from the rest. Do it every single day, even for 1 hour."
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
