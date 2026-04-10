import { useState, useMemo } from 'react';
import { useMockTests, useDeleteMockTest } from '../hooks/useMockTests';
import { useSubjects } from '../hooks/useSubjects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  TrendingUp, 
  Target, 
  BarChart2, 
  ExternalLink
} from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import MockTestForm from '../components/mocks/MockTestForm';
import MockAnalysis from '../components/mocks/MockAnalysis';
import PageSkeleton from '@/components/ui/PageSkeleton';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function MockTests() {
  const { data: mocks, loading: mocksLoading, refetch } = useMockTests();
  const { data: subjects, loading: subjectsLoading } = useSubjects();
  const { deleteMock } = useDeleteMockTest();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const isLoading = mocksLoading || subjectsLoading;

  const stats = useMemo(() => {
    if (!mocks || mocks.length === 0) return { total: 0, avg: 0, best: 0 };
    const best = Math.max(...mocks.map(m => m.scored_marks));
    const avg = mocks.reduce((acc, m) => acc + m.scored_marks, 0) / mocks.length;
    return { total: mocks.length, avg: avg.toFixed(1), best };
  }, [mocks]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this mock test result?')) {
      const res = await deleteMock(id);
      if (res.success) refetch();
    }
  };

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Mock Tests</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Analyze your performance and track your growth
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="mr-2 h-4 w-4" /> Add Test Result
            </Button>
          </DialogTrigger>
          <MockTestForm onSuccess={() => { setIsFormOpen(false); refetch(); }} />
        </Dialog>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <BarChart2 className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Mocks</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Average Score</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.avg}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Best Score</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.best}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test History Table */}
      <Card className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="border-b border-slate-50 dark:border-slate-800 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold">Test History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-slate-800">
                  <th className="px-6 py-4">Test Details</th>
                  <th className="px-6 py-4">Series</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4">Accuracy</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {mocks?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic text-sm">
                      No mock tests recorded yet.
                    </td>
                  </tr>
                ) : (
                  mocks?.map((mock) => {
                    const pct = (mock.scored_marks / mock.total_marks) * 100;
                    return (
                      <tr key={mock.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 dark:text-white">{mock.test_name}</div>
                          <div className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">{format(new Date(mock.test_date), 'PPP')}</div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="text-[10px] font-bold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                            {mock.test_series}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className={cn(
                            "inline-flex items-center px-2 py-1 rounded-md text-xs font-black",
                            pct >= 70 ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400" :
                            pct >= 50 ? "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400" :
                            "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400"
                          )}>
                            {mock.scored_marks} / {mock.total_marks}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-indigo-500" 
                                style={{ width: `${(mock.correct / mock.attempted) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                              {Math.round((mock.correct / mock.attempted) * 100)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Sheet>
                              <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </SheetTrigger>
                              <MockAnalysis mock={mock} subjects={subjects || []} />
                            </Sheet>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-slate-400 hover:text-rose-500"
                              onClick={() => handleDelete(mock.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
