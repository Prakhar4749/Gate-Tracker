import { useMemo } from 'react';
import { useNotes } from '../../hooks/useNotes';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { XCircle, ArrowRight, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';

export default function MistakesWidget() {
  const { data: notes } = useNotes({ noteType: 'mistake' });
  const navigate = useNavigate();

  const mistakesThisWeek = useMemo(() => {
    if (!notes) return [];
    const start = startOfWeek(new Date());
    const end = endOfWeek(new Date());
    
    return notes.filter(n => {
      const date = parseISO(n.created_at);
      return isWithinInterval(date, { start, end });
    });
  }, [notes]);

  return (
    <Card className="overflow-hidden border-none shadow-sm bg-white dark:bg-slate-900">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <XCircle className="h-4 w-4 text-rose-500" /> Mistakes This Week
        </CardTitle>
        <Badge variant="outline" className="bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900 font-bold">
          {mistakesThisWeek.length}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {mistakesThisWeek.length > 0 ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              You've logged {mistakesThisWeek.length} critical mistakes this week. Review them to avoid repeating in the next mock.
            </p>
            <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-100 dark:border-amber-900/50 flex gap-3 items-start">
               <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
               <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest leading-normal">
                 Next mock recommended: Sunday. Review these first!
               </p>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center space-y-2">
            <p className="text-xs text-slate-400 font-medium italic">No mistakes logged this week. Doing great!</p>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/notes')} 
          className="w-full text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
        >
          Open Mistakes Notebook <ArrowRight className="ml-2 h-3.5 w-3.5" />
        </Button>
      </CardContent>
    </Card>
  );
}
