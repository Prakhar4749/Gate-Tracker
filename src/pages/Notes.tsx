import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useNotes, useCreateNote, useDeleteNote } from '../hooks/useNotes';
import { useSubjects } from '../hooks/useSubjects';
import NoteList from '../components/notes/NoteList';
import NoteEditor from '../components/notes/NoteEditor';
import PageSkeleton from '../components/ui/PageSkeleton';
import { 
  FileText, 
  Plus, 
  XCircle, 
  Calculator, 
  AlertTriangle, 
  FileEdit,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { NoteType } from '../types';

export default function Notes() {
  const location = useLocation();
  const { data: notes, loading: notesLoading, refetch } = useNotes();
  const { data: subjects, loading: subjectsLoading } = useSubjects();
  const { createNote } = useCreateNote();
  const { deleteNote } = useDeleteNote();
  
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const isLoading = notesLoading || subjectsLoading;

  // Handle initial selection from navigation state (e.g. from Dashboard)
  useEffect(() => {
    if (location.state?.noteId) {
      setSelectedNoteId(location.state.noteId);
    }
  }, [location.state]);

  const filteredNotes = useMemo(() => {
    if (!notes) return [];
    return notes.filter(n => {
      const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) ||
                           n.content.toLowerCase().includes(search.toLowerCase()) ||
                           n.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      
      const matchesType = typeFilter === 'all' || n.note_type === typeFilter;
      
      return matchesSearch && matchesType;
    });
  }, [notes, search, typeFilter]);

  const selectedNote = useMemo(() => {
    return notes?.find(n => n.id === selectedNoteId);
  }, [notes, selectedNoteId]);

  const handleNewNote = async (type: NoteType = 'general') => {
    const defaultTitles: Record<NoteType, string> = {
      general: 'Untitled Note',
      mistake: 'Mistake Analysis',
      formula: 'Important Formula',
      weak_topic: 'Weak Topic Concept'
    };

    const res = await createNote({
      title: defaultTitles[type],
      content: '',
      subject_id: null,
      topic_id: null,
      tags: type !== 'general' ? [type] : [],
      is_pinned: false,
      note_type: type
    });

    if (res.success) {
      setSelectedNoteId(res.data.id);
      toast.success(`${type.replace('_', ' ').toUpperCase()} note created`);
      refetch();
    } else {
      toast.error('Failed to create note');
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      const res = await deleteNote(id);
      if (res.success) {
        toast.success('Note deleted');
        if (selectedNoteId === id) setSelectedNoteId(null);
        refetch();
      }
    }
  };

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Mistakes Notebook</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Keep a separate record of mistakes, formulas, and weak spots.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => handleNewNote('general')} variant="outline" className="h-9 text-[10px] font-bold uppercase tracking-widest border-slate-200 dark:border-slate-800 gap-2">
            <FileEdit className="h-3.5 w-3.5" /> General
          </Button>
          <Button onClick={() => handleNewNote('mistake')} variant="outline" className="h-9 text-[10px] font-bold uppercase tracking-widest border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 gap-2">
            <XCircle className="h-3.5 w-3.5" /> Mistake
          </Button>
          <Button onClick={() => handleNewNote('formula')} variant="outline" className="h-9 text-[10px] font-bold uppercase tracking-widest border-indigo-200 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 gap-2">
            <Calculator className="h-3.5 w-3.5" /> Formula
          </Button>
          <Button onClick={() => handleNewNote('weak_topic')} variant="outline" className="h-9 text-[10px] font-bold uppercase tracking-widest border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 gap-2">
            <AlertTriangle className="h-3.5 w-3.5" /> Weak Topic
          </Button>
        </div>
      </div>

      <div className="h-[calc(100vh-220px)] flex bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none">
        {/* Sidebar */}
        <div className="w-80 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="p-4 border-b border-slate-100 dark:border-slate-900 space-y-4">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input 
                  className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl h-9 pl-9 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none" 
                  placeholder="Search notes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
             <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
                {['all', 'general', 'mistake', 'formula', 'weak_topic'].map((type) => (
                  <Badge 
                    key={type}
                    onClick={() => setTypeFilter(type)}
                    className={cn(
                      "cursor-pointer px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest border-none whitespace-nowrap",
                      typeFilter === type ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    )}
                  >
                    {type.replace('_', ' ')}
                  </Badge>
                ))}
             </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <NoteList 
              notes={filteredNotes} 
              selectedNoteId={selectedNoteId || undefined}
              onSelectNote={setSelectedNoteId}
              onNewNote={() => handleNewNote('general')}
              onDeleteNote={handleDeleteNote}
              search={search}
              onSearchChange={setSearch}
              subjects={subjects || []}
            />
          </div>
        </div>

        {/* Main Editor */}
        <div className="flex-1 min-w-0 bg-slate-50/30 dark:bg-slate-900/10">
          {selectedNote ? (
            <NoteEditor 
              note={selectedNote} 
              subjects={subjects || []} 
              onUpdate={refetch} 
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] mb-8 shadow-sm border border-slate-100 dark:border-slate-800">
                <FileText className="h-16 w-16 text-slate-200" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Your Strategic Notebook</h2>
              <p className="text-sm text-slate-500 max-w-xs mb-10 font-medium leading-relaxed">
                Pick a note from the list or create a specialized note to track your progress and mistakes.
              </p>
              <div className="flex flex-col gap-3 w-full max-w-[200px]">
                <Button onClick={() => handleNewNote('mistake')} className="w-full bg-rose-600 hover:bg-rose-700 font-bold uppercase tracking-widest text-[10px] h-10 shadow-lg shadow-rose-200 dark:shadow-none">
                  <XCircle className="h-4 w-4 mr-2" /> Log a Mistake
                </Button>
                <Button onClick={() => handleNewNote('general')} variant="outline" className="w-full font-bold uppercase tracking-widest text-[10px] h-10 border-slate-200 dark:border-slate-800">
                  <Plus className="h-4 w-4 mr-2" /> General Note
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
