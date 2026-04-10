import type { Note, Subject } from '../../types';
import { cn } from '../../lib/utils';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Pin, Search, Plus, Trash2, Tag } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';

interface NoteListProps {
  notes: Note[];
  selectedNoteId?: string;
  onSelectNote: (id: string) => void;
  onNewNote: () => void;
  onDeleteNote: (id: string) => void;
  search: string;
  onSearchChange: (val: string) => void;
  subjects: Subject[];
}

export default function NoteList({ 
  notes, 
  selectedNoteId, 
  onSelectNote, 
  onNewNote, 
  onDeleteNote,
  search,
  onSearchChange,
  subjects
}: NoteListProps) {
  
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  return (
    <div className="flex flex-col h-full border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">My Notes</h2>
          <Button size="sm" onClick={onNewNote} className="h-8 bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-1" /> New
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search title, content..." 
            className="pl-9 h-9 text-xs"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="divide-y divide-slate-50 dark:divide-slate-900">
          {sortedNotes.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No notes found.
            </div>
          ) : (
            sortedNotes.map((note) => {
              const subject = subjects.find(s => s.id === note.subject_id);
              return (
                <div 
                  key={note.id}
                  onClick={() => onSelectNote(note.id)}
                  className={cn(
                    "p-4 cursor-pointer transition-colors group relative",
                    selectedNoteId === note.id 
                      ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-l-4 border-indigo-600" 
                      : "hover:bg-slate-50 dark:hover:bg-slate-900 border-l-4 border-transparent"
                  )}
                >
                  <div className="flex items-start justify-between mb-1">
                    <h3 className={cn(
                      "text-sm font-bold truncate pr-6",
                      selectedNoteId === note.id ? "text-indigo-600" : "text-slate-900 dark:text-white"
                    )}>
                      {note.title || 'Untitled Note'}
                    </h3>
                    {note.is_pinned && <Pin className="h-3 w-3 text-amber-500 fill-amber-500" />}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    {subject && (
                      <Badge variant="outline" className="text-[8px] py-0 h-4 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        {subject.short_code}
                      </Badge>
                    )}
                    <span className="text-[10px] text-slate-400 font-medium">
                      {formatDistanceToNow(parseISO(note.updated_at))} ago
                    </span>
                  </div>

                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map((tag, i) => (
                        <div key={i} className="flex items-center gap-0.5 text-[9px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          <Tag className="h-2 w-2" /> {tag}
                        </div>
                      ))}
                    </div>
                  )}

                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteNote(note.id); }}
                    className="absolute right-2 bottom-2 p-1.5 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
