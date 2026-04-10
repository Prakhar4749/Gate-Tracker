import { useState, useMemo } from 'react';
import { useSubjects } from '../hooks/useSubjects';
import SubjectCard from '../components/subjects/SubjectCard';
import PageSkeleton from '../components/ui/PageSkeleton';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectPortal
} from '@/components/ui/select';
import { Search, BookOpen, CheckCircle2, LayoutGrid } from 'lucide-react';

export default function Subjects() {
  const { data: subjects, loading, refetch } = useSubjects();
  const [search, setSearch] = useState('');
  const [phaseFilter, setPhaseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [strengthFilter, setStrengthFilter] = useState('all');

  const filteredSubjects = useMemo(() => {
    if (!subjects) return [];

    return subjects
      .filter(s => phaseFilter === 'all' || s.phase === parseInt(phaseFilter))
      .filter(s => strengthFilter === 'all' || s.strength_level === strengthFilter)
      .map(s => {
        const filteredTopics = s.topics?.filter(t => 
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          s.name.toLowerCase().includes(search.toLowerCase())
        ) || [];

        const finalTopics = statusFilter === 'all' 
          ? filteredTopics 
          : filteredTopics.filter(t => t.status === statusFilter);

        return { ...s, topics: finalTopics };
      })
      .filter(s => s.topics.length > 0 || (search === '' && phaseFilter === 'all' && statusFilter === 'all' && strengthFilter === 'all'));
  }, [subjects, search, phaseFilter, statusFilter, strengthFilter]);

  const stats = useMemo(() => {
    if (!subjects) return { completedSubjects: 0, overallPct: 0 };
    
    let totalTopics = 0;
    let completedTopics = 0;
    let subjectsDone = 0;

    subjects.forEach(s => {
      const topics = s.topics || [];
      totalTopics += topics.length;
      const done = topics.filter(t => t.status === 'completed').length;
      completedTopics += done;
      if (topics.length > 0 && done === topics.length) subjectsDone++;
    });

    return {
      completedSubjects: subjectsDone,
      overallPct: totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0
    };
  }, [subjects]);

  if (loading) return <PageSkeleton />;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Subjects & Topics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Track your progress across all 12 GATE CS subjects
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <div className="flex flex-col">
              <span className="text-xs font-black text-slate-900 dark:text-white leading-none">{stats.completedSubjects}/12</span>
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Subjects Done</span>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-sm">
            <LayoutGrid className="h-5 w-5 text-indigo-500" />
            <div className="flex flex-col">
              <span className="text-xs font-black text-slate-900 dark:text-white leading-none">{stats.overallPct}%</span>
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Overall Progress</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search topics..." 
            className="pl-9 h-10 text-sm rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phase</span>
            <Select value={phaseFilter} onValueChange={setPhaseFilter}>
              <SelectTrigger className="h-10 w-[110px] text-xs rounded-xl font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectPortal>
                <SelectContent position="popper" className="z-[9999]" style={{ zIndex: 9999 }}>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="1">Phase 1</SelectItem>
                  <SelectItem value="2">Phase 2</SelectItem>
                  <SelectItem value="3">Phase 3</SelectItem>
                  <SelectItem value="4">Phase 4</SelectItem>
                </SelectContent>
              </SelectPortal>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 w-[140px] text-xs rounded-xl font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectPortal>
                <SelectContent position="popper" className="z-[9999]" style={{ zIndex: 9999 }}>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="needs_revision">Needs Revision</SelectItem>
                </SelectContent>
              </SelectPortal>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strength</span>
            <Select value={strengthFilter} onValueChange={setStrengthFilter}>
              <SelectTrigger className="h-10 w-[120px] text-xs rounded-xl font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectPortal>
                <SelectContent position="popper" className="z-[9999]" style={{ zIndex: 9999 }}>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="strong">Strong</SelectItem>
                  <SelectItem value="focus">Focus</SelectItem>
                  <SelectItem value="build">Build</SelectItem>
                </SelectContent>
              </SelectPortal>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSubjects.length > 0 ? (
          filteredSubjects.map(subject => (
            <SubjectCard 
              key={subject.id} 
              subject={subject as any} 
              onTopicUpdate={refetch} 
            />
          ))
        ) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-full mb-4">
              <BookOpen className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">No subjects found</h3>
            <p className="text-sm text-slate-500 max-w-xs mx-auto font-medium">
              Try adjusting your filters or search terms to find what you're looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
