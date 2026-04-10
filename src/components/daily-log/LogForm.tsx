import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import type { DailyLog } from '../../types';
import { useCreateDailyLog, useUpdateDailyLog } from '../../hooks/useDailyLogs';
import { useSubjects } from '../../hooks/useSubjects';
import { useTopics } from '../../hooks/useTopics';
import { usePracticeResources } from '../../hooks/usePracticeResources';
import { 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { Loader2, PlayCircle, Calendar } from 'lucide-react';

const formSchema = z.object({
  log_date: z.string(),
  subject_id: z.string().min(1, "Subject is required"),
  topic_id: z.string().nullable(),
  hours_studied: z.number().min(0.5).max(16),
  pyqs_solved: z.number().min(0),
  pyqs_correct: z.number().min(0),
  productivity_score: z.number().min(1).max(10),
  mood: z.enum(['great', 'okay', 'tired', 'stressed']),
  notes: z.string().default(''),
  topics_covered: z.array(z.string()).default([])
}).refine(data => data.pyqs_correct <= data.pyqs_solved, {
  message: "Correct PYQs cannot exceed total solved",
  path: ["pyqs_correct"]
});

interface LogFormProps {
  initialData?: DailyLog | null;
  selectedDate: string;
  onSuccess: () => void;
}

export default function LogForm({ initialData, selectedDate, onSuccess }: LogFormProps) {
  const { data: subjects = [] } = useSubjects();
  const { createLog, loading: creating } = useCreateDailyLog();
  const { updateLog, loading: updating } = useUpdateDailyLog();
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      log_date: selectedDate,
      subject_id: initialData?.subject_id || '',
      topic_id: initialData?.topic_id || null,
      hours_studied: initialData?.hours_studied || 1,
      pyqs_solved: initialData?.pyqs_solved || 0,
      pyqs_correct: initialData?.pyqs_correct || 0,
      productivity_score: initialData?.productivity_score || 7,
      mood: (initialData?.mood as "great" | "okay" | "tired" | "stressed") || 'okay',
      notes: initialData?.notes || '',
      topics_covered: initialData?.topics_covered || []
    }
  });

  const selectedSubjectId = form.watch('subject_id');
  const { data: topics = [] } = useTopics(selectedSubjectId);
  const { resources: subjectResources } = usePracticeResources(selectedSubjectId);

  const selectedSubject = useMemo(() => 
    subjects?.find(s => s.id === selectedSubjectId), 
    [subjects, selectedSubjectId]
  );

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    let res;
    if (initialData?.id) {
      res = await updateLog(initialData.id, values);
    } else {
      res = await createLog(values);
    }

    if (res.success) {
      toast.success(initialData?.id ? 'Log updated!' : 'Log created!');
      onSuccess();
    } else {
      toast.error(res.error || 'Something went wrong');
    }
  };

  const moodEmoji: Record<string, string> = {
    great: '😊',
    okay: '😐',
    tired: '😴',
    stressed: '😰'
  };

  return (
    <DialogContent 
      className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto"
    >
      <DialogHeader>
        <DialogTitle>{initialData?.id ? 'Edit Study Log' : 'Log Study Session'}</DialogTitle>
        <DialogDescription>
          Record your study hours, subjects, and productivity for {format(new Date(selectedDate), 'PPP')}.
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-4">
            
            {/* 1. Date (read-only) */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
               <Calendar className="w-4 h-4 text-slate-400" />
               <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Logging for: {format(new Date(selectedDate), 'PPP')}
               </span>
            </div>

            {/* Row 1: Subject + Topic — side by side on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="subject_id"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel>Subject</FormLabel>
                    <select
                      {...field}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        form.setValue('topic_id', null);
                      }}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                    >
                      <option value="">Select subject</option>
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="topic_id"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel>Main Topic (Optional)</FormLabel>
                    <select
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value || null)}
                      disabled={!selectedSubjectId}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                    >
                      <option value="">Select topic (optional)</option>
                      {topics.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {selectedSubjectId && subjectResources.length > 0 && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900">
                <PlayCircle className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <span className="text-xs text-indigo-700 dark:text-indigo-300">
                  {subjectResources.length} practice sessions available for this subject.
                </span>
                <Link
                  to={`/resources?subject=${selectedSubject?.short_code}`}
                  className="ml-auto text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline whitespace-nowrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  Open →
                </Link>
              </div>
            )}

            {/* Row 2: Hours + PYQs Solved + PYQs Correct — three columns */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="hours_studied"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel>Hours</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.5" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pyqs_solved"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel>PYQs Solved</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pyqs_correct"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel>Correct</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 3: Mood — full width */}
            <FormField
              control={form.control}
              name="mood"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel>How was your focus?</FormLabel>
                  <div className="flex gap-3">
                    {(['great', 'okay', 'tired', 'stressed'] as const).map((m) => (
                      <Button
                        key={m}
                        type="button"
                        variant={field.value === m ? 'default' : 'outline'}
                        className="flex-1 h-12 text-xl"
                        onClick={() => field.onChange(m)}
                      >
                        {moodEmoji[m]}
                      </Button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Row 4: Productivity Score — full width */}
            <FormField
              control={form.control}
              name="productivity_score"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <div className="flex justify-between">
                    <FormLabel>Productivity Score</FormLabel>
                    <span className="text-xs font-bold text-indigo-600">{field.value}/10</span>
                  </div>
                  <FormControl>
                    <Slider 
                      min={1} 
                      max={10} 
                      step={1} 
                      value={[field.value]} 
                      onValueChange={(val: number[]) => field.onChange(val[0])} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Row 5: Notes — full width */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel>Study Notes (Markdown)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Key concepts learned, doubts, or plan for tomorrow..." 
                      className="min-h-[100px] resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <DialogFooter>
            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              disabled={creating || updating}
            >
              {(creating || updating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData?.id ? 'Update Log' : 'Save Study Log'}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
