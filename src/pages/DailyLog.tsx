import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { useDailyLogs } from '../hooks/useDailyLogs';
import { useSubjects } from '../hooks/useSubjects';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  Edit3
} from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import LogForm from '../components/daily-log/LogForm';
import WeeklySummary from '../components/daily-log/WeeklySummary';
import PageSkeleton from '../components/ui/PageSkeleton';
import { marked } from 'marked';

export default function DailyLog() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { data: logs, loading: logsLoading, refetch } = useDailyLogs();
  const { data: subjects, loading: subjectsLoading } = useSubjects();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const isLoading = logsLoading || subjectsLoading;

  const formattedSelectedDate = format(selectedDate, 'yyyy-MM-dd');
  const dayLog = logs?.find(l => l.log_date === formattedSelectedDate);

  const studiedDates = useMemo(() => {
    return logs?.map(l => parseISO(l.log_date)) || [];
  }, [logs]);

  const moodEmoji: Record<string, string> = {
    great: '😊',
    okay: '😐',
    tired: '😴',
    stressed: '😰'
  };

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Daily Study Log</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Track your daily consistency and focus
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 font-bold px-6 h-11 rounded-xl shadow-xl shadow-indigo-100 dark:shadow-none">
              <Plus className="mr-2 h-5 w-5" /> Add New Log
            </Button>
          </DialogTrigger>
          <LogForm 
            selectedDate={format(new Date(), 'yyyy-MM-dd')} 
            onSuccess={() => { setIsFormOpen(false); refetch(); }} 
          />
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Calendar and Weekly Summary */}
        <div className="lg:col-span-5 space-y-8">
          <Card className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-3xl">
            <CardContent className="p-6">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date: Date | undefined) => date && setSelectedDate(date)}
                className="w-full"
                modifiers={{
                  studied: studiedDates
                }}
                modifiersStyles={{
                  studied: { fontWeight: 'bold', color: '#6366f1' }
                }}
              />
            </CardContent>
          </Card>

          <WeeklySummary logs={logs || []} subjects={subjects || []} />
        </div>

        {/* Right: Log Detail */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 h-full flex flex-col rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-slate-50 dark:border-slate-800 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                    <CalendarIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black">{format(selectedDate, 'MMMM d, yyyy')}</CardTitle>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{format(selectedDate, 'EEEE')}</p>
                  </div>
                </div>
                {dayLog && (
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950">
                          <Edit3 className="h-5 w-5" />
                        </Button>
                      </DialogTrigger>
                      <LogForm 
                        initialData={dayLog} 
                        selectedDate={formattedSelectedDate} 
                        onSuccess={() => refetch()} 
                      />
                    </Dialog>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-8">
              {!dayLog ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-full mb-6 border border-slate-100 dark:border-slate-700">
                    <Clock className="h-10 w-10 text-slate-300" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">No study logged</h3>
                  <p className="text-sm text-slate-500 mb-8 max-w-xs font-medium leading-relaxed">
                    Consistency is key. You haven't recorded any study activity for this date yet.
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="h-11 px-8 rounded-xl border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest text-xs hover:bg-indigo-50">
                        Log for this day →
                      </Button>
                    </DialogTrigger>
                    <LogForm 
                      selectedDate={formattedSelectedDate} 
                      onSuccess={() => refetch()} 
                    />
                  </Dialog>
                </div>
              ) : (
                <div className="space-y-10">
                  {/* Top Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Time</span>
                      <div className="text-2xl font-black text-slate-900 dark:text-white">{dayLog.hours_studied}h</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Accuracy</span>
                      <div className="text-2xl font-black text-slate-900 dark:text-white">
                        {dayLog.pyqs_solved > 0 ? Math.round((dayLog.pyqs_correct / dayLog.pyqs_solved) * 100) : 0}%
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Prod.</span>
                      <div className="text-2xl font-black text-slate-900 dark:text-white">{dayLog.productivity_score}/10</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 text-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Mood</span>
                      <div className="text-3xl">{moodEmoji[dayLog.mood]}</div>
                    </div>
                  </div>

                  {/* Subject and Topic */}
                  <div className="grid gap-6">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Study Focus</div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-lg font-black text-slate-900 dark:text-white leading-none">
                            {subjects?.find(s => s.id === dayLog.subject_id)?.name || 'Unknown Subject'}
                          </span>
                          <Badge variant="outline" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-bold text-[10px] px-2 py-0.5">
                            {dayLog.topic?.name || 'Self Study'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="mt-1 h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">PYQ Performance</div>
                        <div className="text-base font-bold text-slate-700 dark:text-slate-300">
                          Solved <strong>{dayLog.pyqs_solved}</strong> questions, <strong>{dayLog.pyqs_correct}</strong> correct.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {dayLog.notes && (
                    <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Daily Retrospective</div>
                      <div 
                        className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 font-medium leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: marked(dayLog.notes) }}
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
