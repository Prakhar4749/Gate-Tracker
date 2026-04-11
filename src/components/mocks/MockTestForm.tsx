import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { useCreateMockTest } from '@/hooks/useMockTests';
import { useSubjects } from '@/hooks/useSubjects';
import { parseMockText } from '@/lib/mockParser';
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
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, Zap, ClipboardList, Info } from 'lucide-react';

const formSchema = z.object({
  test_name: z.string().min(1, "Test name is required"),
  test_series: z.string().min(1, "Series is required"),
  test_date: z.string(),
  total_marks: z.number().min(1),
  scored_marks: z.number(),
  total_questions: z.number().min(1),
  attempted: z.number().min(0),
  correct: z.number().min(0),
  wrong: z.number().min(0),
  time_taken_minutes: z.number().min(1),
  subject_scores: z.record(z.string(), z.number()),
  notes: z.string().optional()
});

interface MockTestFormProps {
  onSuccess: () => void;
}

export default function MockTestForm({ onSuccess }: MockTestFormProps) {
  const createMock = useCreateMockTest();
  const { data: subjects } = useSubjects();
  const [importText, setImportText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      test_name: '',
      test_series: 'Custom',
      test_date: format(new Date(), 'yyyy-MM-dd'),
      total_marks: 100,
      scored_marks: 0,
      total_questions: 65,
      attempted: 0,
      correct: 0,
      wrong: 0,
      time_taken_minutes: 180,
      subject_scores: {},
      notes: ''
    }
  });

  const subjectScores = form.watch('subject_scores');

  const handleImport = () => {
    if (!importText.trim()) return;
    const parsed = parseMockText(importText);
    
    // Fill form with parsed values
    form.setValue('test_series', parsed.test_series);
    form.setValue('scored_marks', parsed.scored_marks);
    form.setValue('total_marks', parsed.total_marks);
    form.setValue('attempted', parsed.attempted);
    form.setValue('correct', parsed.correct);
    form.setValue('wrong', parsed.wrong);
    form.setValue('subject_scores', parsed.subject_scores);
    
    toast.success('Result parsed! Please verify and save.');
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSaving(true);
    try {
      const res = await createMock({
        ...values,
        notes: values.notes || '',
        topic_errors: {},
        raw_import_data: { raw: importText }
      });

      if (res) {
        toast.success('Mock test added!');
        onSuccess();
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DialogContent 
      className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto"
    >
      <DialogHeader>
        <DialogTitle>Add Mock Test Result</DialogTitle>
        <DialogDescription>
          Enter your mock test scores manually or paste the result text to import.
        </DialogDescription>
      </DialogHeader>

      <Tabs defaultValue="manual" className="py-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" /> Manual Entry
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Zap className="h-4 w-4" /> Paste to Import
          </TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-4 pt-4">
          <div className="bg-indigo-50 dark:bg-indigo-950/30 p-3 rounded-lg flex gap-3 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
            <Info className="h-5 w-5 flex-shrink-0" />
            <p className="text-xs font-medium">
              Paste your result page text from Testbook, Made Easy, or GATE Academy. Our parser will extract the scores for you.
            </p>
          </div>
          <Textarea 
            placeholder="Paste result text here..." 
            className="min-h-[200px] font-mono text-[10px]"
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
          />
          <Button onClick={handleImport} className="w-full bg-indigo-600 hover:bg-indigo-700">
            Parse Text
          </Button>
        </TabsContent>

        <TabsContent value="manual">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="test_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Test Name</FormLabel>
                      <FormControl><Input placeholder="Full Length Mock 1" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="test_series"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Test Series</FormLabel>
                      <select
                        {...field}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                      >
                        <option value="Testbook">Testbook</option>
                        <option value="Made Easy">Made Easy</option>
                        <option value="GATE Academy">GATE Academy</option>
                        <option value="Custom">Custom / Other</option>
                      </select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="scored_marks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marks Scored</FormLabel>
                      <FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="total_marks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Marks</FormLabel>
                      <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="correct"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correct</FormLabel>
                      <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="attempted"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Attempted</FormLabel>
                      <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Subject-wise Marks</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {subjects?.map(sub => (
                    <div key={sub.id} className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase">{sub.short_code}</Label>
                      <Input 
                        type="number" 
                        step="0.01" 
                        className="h-8 text-xs" 
                        placeholder="Marks"
                        value={subjectScores[sub.short_code] || 0}
                        onChange={(e) => {
                          const current = form.getValues('subject_scores');
                          form.setValue('subject_scores', { ...current, [sub.short_code]: parseFloat(e.target.value) });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Mock Result
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </DialogContent>
  );
}
