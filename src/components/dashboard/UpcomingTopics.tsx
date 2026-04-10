import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { COMBOS } from '../../lib/constants';
import { useSubjects } from '../../hooks/useSubjects';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function UpcomingTopics() {
  const navigate = useNavigate();
  const { data: subjects } = useSubjects();

  const recommendedTopics = useMemo(() => {
    if (!subjects) return [];
    
    // Find current combo subjects that are not completed
    const currentCombo = COMBOS.find(c => c.status === 'current') || COMBOS[0];
    const comboSubjects = subjects.filter(s => s.combo_id === currentCombo.id);
    
    const topics: any[] = [];
    comboSubjects.forEach(subject => {
      subject.topics?.filter(t => t.status !== 'completed').slice(0, 2).forEach(topic => {
        topics.push({
          ...topic,
          subjectName: subject.name,
          subjectCode: subject.short_code,
          color: subject.color_hex
        });
      });
    });

    return topics.slice(0, 3);
  }, [subjects]);

  return (
    <Card className="overflow-hidden border-none shadow-sm bg-white dark:bg-slate-900">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Recommended Topics</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate('/plan')} className="text-xs text-indigo-600 dark:text-indigo-400">
          View plan
        </Button>
      </CardHeader>
      <CardContent className="px-0">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {recommendedTopics.length > 0 ? (
            recommendedTopics.map((topic, i) => (
              <div key={i} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between">
                <div className="flex gap-3 items-start">
                  <div className="mt-1 h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
                        {topic.name}
                      </span>
                      <Badge variant="outline" className="text-[9px] py-0 h-4 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                        {topic.subjectCode}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {topic.estimated_hours} hrs
                      </span>
                      <span className={cn(
                        "font-bold uppercase tracking-wider",
                        topic.priority === 'high' ? "text-rose-500" : topic.priority === 'medium' ? "text-amber-500" : "text-slate-400"
                      )}>
                        {topic.priority} PRIORITY
                      </span>
                    </div>
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => navigate('/log')} className="h-8 w-8 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 font-medium italic">
              No recommendations available. Complete your daily log to get started!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
