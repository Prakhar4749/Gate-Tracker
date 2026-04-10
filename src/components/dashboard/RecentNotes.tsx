import { useNavigate } from 'react-router-dom';
import { useNotes } from '../../hooks/useNotes';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';
import { FileText, Pin, ExternalLink } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';

export default function RecentNotes() {
  const navigate = useNavigate();
  const { data: notes, loading } = useNotes();

  const displayNotes = (notes || [])
    .sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    })
    .slice(0, 5);

  if (loading) return <Skeleton className="h-[200px] w-full" />;

  return (
    <Card className="overflow-hidden border-none shadow-sm bg-white dark:bg-slate-900">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Recent Notes</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate('/notes')} className="text-xs text-indigo-600 dark:text-indigo-400">
          View all
        </Button>
      </CardHeader>
      <CardContent className="px-0">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {displayNotes.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">No notes created yet.</div>
          ) : (
            displayNotes.map((note) => (
              <div key={note.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between group">
                <div className="flex gap-3 items-start overflow-hidden">
                  <div className="mt-1 h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {note.title}
                      </span>
                      {note.is_pinned && <Pin className="h-3 w-3 text-amber-500 fill-amber-500" />}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      {note.subject_id && (
                        <Badge variant="outline" className="text-[8px] py-0 h-4 px-1 leading-none bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                          {note.subject?.short_code || 'SUB'}
                        </Badge>
                      )}
                      <span>{formatDistanceToNow(parseISO(note.updated_at))} ago</span>
                    </div>
                  </div>
                </div>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => navigate('/notes', { state: { noteId: note.id } })}
                  className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
