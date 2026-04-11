import { useState } from 'react';
import { format, isToday, parseISO } from 'date-fns';
import { Clock, CheckCircle2, Plus } from 'lucide-react';
import { useDailyLogs, useCreateDailyLog } from '@/hooks/useDailyLogs';
import { useSubjects } from '@/hooks/useSubjects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function TodayCard() {
  const { data: logs, loading, refetch } = useDailyLogs();
  const { data: subjects } = useSubjects();
  const createLog = useCreateDailyLog();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form State
  const [subjectId, setSubjectId] = useState('');
  const [hours, setHours] = useState('1');
  const [pyqs, setPyqs] = useState('0');
  const [mood, setMood] = useState<'great' | 'okay' | 'tired' | 'stressed'>('okay');

  const todayLog = logs?.find(log => isToday(parseISO(log.log_date)));

  const handleQuickLog = async () => {
    if (!subjectId) {
      toast.error('Please select a subject');
      return;
    }

    const res = await createLog({
      log_date: format(new Date(), 'yyyy-MM-dd'),
      subject_id: subjectId,
      topic_id: null,
      hours_studied: parseFloat(hours),
      topics_covered: [],
      notes: '',
      mood: mood,
      productivity_score: 7,
      pyqs_solved: parseInt(pyqs),
      pyqs_correct: Math.floor(parseInt(pyqs) * 0.8) // Heuristic for quick log
    });

    if (res.success) {
      toast.success('Study activity logged!');
      setIsDialogOpen(false);
      refetch();
    } else {
      toast.error('Failed to log activity');
    }
  };

  if (loading) return <Skeleton className="h-[200px] w-full" />;

  const moodEmoji: Record<string, string> = {
    great: '😊',
    okay: '😐',
    tired: '😴',
    stressed: '😰'
  };

  return (
    <Card className="overflow-hidden border-none shadow-sm bg-white dark:bg-slate-900">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium uppercase tracking-widest text-slate-400">Today's Activity</CardTitle>
        <div className="flex items-center gap-2">
           {todayLog && <Badge variant="secondary" className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-none font-bold text-[9px] tracking-widest uppercase">Logged</Badge>}
           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Quick Log Study</DialogTitle>
                <DialogDescription>
                  Record your study session quickly. You can add more details later in the log page.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="subject" className="text-right text-xs font-bold text-slate-500 uppercase">Subject</Label>
                  <Select onValueChange={setSubjectId}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="z-[200]">
                      {subjects?.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="hours" className="text-right text-xs font-bold text-slate-500 uppercase">Hours</Label>
                  <Input id="hours" type="number" step="0.5" value={hours} onChange={e => setHours(e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="pyqs" className="text-right text-xs font-bold text-slate-500 uppercase">PYQs</Label>
                  <Input id="pyqs" type="number" value={pyqs} onChange={e => setPyqs(e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right text-xs font-bold text-slate-500 uppercase">Mood</Label>
                  <div className="flex gap-2 col-span-3">
                    {(['great', 'okay', 'tired', 'stressed'] as const).map((m) => (
                      <Button
                        key={m}
                        variant={mood === m ? 'default' : 'outline'}
                        className="flex-1 px-0 text-lg"
                        onClick={() => setMood(m)}
                      >
                        {moodEmoji[m]}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleQuickLog} className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold uppercase tracking-widest text-xs h-10">Save Log</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {!todayLog ? (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="bg-white dark:bg-slate-900 p-3 rounded-full mb-3 shadow-sm">
              <Clock className="h-6 w-6 text-indigo-500" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-4">No study logged yet today.</p>
            <Button size="sm" onClick={() => setIsDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 font-bold text-[10px] h-8 uppercase tracking-widest px-4">
              Start Logging →
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Time Studied</span>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-4 w-4 text-indigo-500" />
                  <span className="text-xl font-black text-slate-900 dark:text-white">{todayLog.hours_studied} hrs</span>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Accuracy</span>
                <div className="flex items-center gap-2 mt-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    {todayLog.pyqs_solved > 0 
                      ? Math.round((todayLog.pyqs_correct / todayLog.pyqs_solved) * 100) 
                      : 0}%
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Today's Focus</span>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-white dark:bg-slate-900 border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 font-bold py-1">
                  {subjects?.find(s => s.id === todayLog.subject_id)?.name || 'Study Session'}
                </Badge>
                {todayLog.mood && (
                  <Badge variant="secondary" className="bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-none font-bold py-1">
                    Mood: {moodEmoji[todayLog.mood]}
                  </Badge>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
               <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                PYQs: {todayLog.pyqs_correct}/{todayLog.pyqs_solved}
               </span>
               <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Focus</span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={cn("h-1.5 w-3 rounded-full", i < (todayLog.productivity_score / 2) ? "bg-indigo-500" : "bg-slate-200 dark:bg-slate-700")} />
                    ))}
                  </div>
               </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
