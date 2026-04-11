import { useState, useEffect, useCallback } from 'react';
import type { Note, Subject } from '../../types';
import { useUpdateNote, useTogglePin } from '../../hooks/useNotes';
import { useTopics } from '../../hooks/useTopics';
import { marked } from 'marked';
import { 
  Bold, 
  Italic, 
  List, 
  Code, 
  Pin, 
  PinOff,
  Loader2,
  CheckCircle,
  Hash
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

interface NoteEditorProps {
  note: Note;
  subjects: Subject[];
  onUpdate: () => void;
  onTitleChange?: (id: string, title: string) => void;
  onContentChange?: (id: string, content: string) => void;
}

export default function NoteEditor({ note, subjects, onUpdate, onTitleChange, onContentChange }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [subjectId, setSubjectId] = useState(note.subject_id || '');
  const [topicId, setTopicId] = useState(note.topic_id || '');
  const [tags, setTags] = useState(note.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [pinning, setPinning] = useState(false);
  
  const updateNote = useUpdateNote();
  const togglePin = useTogglePin();
  const { data: topics } = useTopics(subjectId);

  // Sync state when note changes
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setSubjectId(note.subject_id || '');
    setTopicId(note.topic_id || '');
    setTags(note.tags || []);
    setIsDirty(false);
  }, [note.id]);

  const handleSave = useCallback(async () => {
    if (!isDirty && !saveStatus) return;
    
    setSaveStatus('saving');
    const success = await updateNote(note.id, {
      title,
      content,
      subject_id: subjectId || null,
      topic_id: topicId || null,
      tags
    });

    if (success) {
      setSaveStatus('saved');
      setIsDirty(false);
      onUpdate();
      setTimeout(() => setSaveStatus('idle'), 2000);
    } else {
      setSaveStatus('idle');
    }
  }, [note.id, title, content, subjectId, topicId, tags, isDirty, updateNote, onUpdate, saveStatus]);

  // Autosave
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isDirty) handleSave();
    }, 1500);
    return () => clearTimeout(timer);
  }, [isDirty, handleSave]);

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('note-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    const newContent = `${before}${prefix}${selection}${suffix}${after}`;
    setContent(newContent);
    setIsDirty(true);
    if (onContentChange) onContentChange(note.id, newContent);
    
    // Reset focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        const newTags = [...tags, tagInput.trim()];
        setTags(newTags);
        setIsDirty(true);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
    setIsDirty(true);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <select 
            value={subjectId} 
            onChange={(e) => { 
              setSubjectId(e.target.value); 
              setTopicId('');
              setIsDirty(true); 
            }}
            className="h-8 w-[140px] px-2 rounded-md border border-input bg-background text-[10px] font-bold uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">SUBJECT</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.short_code}</option>)}
          </select>

          <select 
            value={topicId} 
            onChange={(e) => { setTopicId(e.target.value); setIsDirty(true); }}
            disabled={!subjectId}
            className="h-8 w-[140px] px-2 rounded-md border border-input bg-background text-[10px] font-bold uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
          >
            <option value="">TOPIC</option>
            {topics?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertMarkdown('**', '**')}><Bold className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertMarkdown('_', '_')}><Italic className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertMarkdown('- ')}><List className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertMarkdown('`', '`')}><Code className="h-4 w-4" /></Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
            {saveStatus === 'saving' ? (
              <><Loader2 className="h-3 w-3 animate-spin" /> SAVING...</>
            ) : saveStatus === 'saved' ? (
              <><CheckCircle className="h-3 w-3 text-emerald-500" /> SAVED</>
            ) : isDirty ? (
              <span className="text-amber-500">UNSAVED CHANGES</span>
            ) : (
              <span>ALL CHANGES SAVED</span>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("h-8 w-8", note.is_pinned && "text-amber-500 hover:text-amber-600")}
            onClick={async () => {
              setPinning(true);
              try {
                await togglePin(note.id, note.is_pinned);
                onUpdate();
              } finally {
                setPinning(false);
              }
            }}
            disabled={pinning}
          >
            {note.is_pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-8 pt-6 pb-2">
          <Input 
            value={title} 
            onChange={(e) => { 
              setTitle(e.target.value); 
              setIsDirty(true); 
              if (onTitleChange) onTitleChange(note.id, e.target.value);
            }}
            placeholder="Note Title"
            className="text-3xl font-black border-none focus-visible:ring-0 px-0 h-auto placeholder:text-slate-200 dark:placeholder:text-slate-800"
          />
          
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {tags.map(tag => (
              <Badge key={tag} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-rose-50 hover:text-rose-600 border-none cursor-pointer group" onClick={() => removeTag(tag)}>
                <Hash className="h-2.5 w-2.5 mr-1" /> {tag}
                <span className="ml-1 opacity-0 group-hover:opacity-100">×</span>
              </Badge>
            ))}
            <input 
              type="text"
              placeholder="Add tag..."
              className="text-xs bg-transparent border-none focus:outline-none w-24 text-slate-400"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={addTag}
            />
          </div>
        </div>

        <Tabs defaultValue="edit" className="flex-1 flex flex-col overflow-hidden">
          <div className="px-8 border-b border-slate-50 dark:border-slate-900">
            <TabsList className="bg-transparent h-10 p-0 gap-6">
              <TabsTrigger value="edit" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-0 text-[10px] font-black uppercase tracking-widest">
                Edit
              </TabsTrigger>
              <TabsTrigger value="preview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-0 text-[10px] font-black uppercase tracking-widest">
                Preview
              </TabsTrigger>
              <TabsTrigger value="split" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-0 text-[10px] font-black uppercase tracking-widest hidden md:flex">
                Split View
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="edit" className="flex-1 m-0 p-0 overflow-hidden">
            <Textarea 
              id="note-textarea"
              value={content}
              onChange={(e) => { 
                setContent(e.target.value); 
                setIsDirty(true); 
                if (onContentChange) onContentChange(note.id, e.target.value);
              }}
              placeholder="Start writing your thoughts..."
              className="w-full h-full resize-none border-none focus-visible:ring-0 p-8 font-mono text-sm leading-relaxed"
            />
          </TabsContent>

          <TabsContent value="preview" className="flex-1 m-0 p-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div 
                className="prose prose-slate dark:prose-invert max-w-none p-8"
                dangerouslySetInnerHTML={{ __html: marked(content || '_Nothing to preview_') }}
              />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="split" className="flex-1 m-0 p-0 overflow-hidden">
            <div className="grid grid-cols-2 h-full divide-x divide-slate-100 dark:divide-slate-900">
              <Textarea 
                value={content}
                onChange={(e) => { 
                  setContent(e.target.value); 
                  setIsDirty(true); 
                  if (onContentChange) onContentChange(note.id, e.target.value);
                }}
                className="w-full h-full resize-none border-none focus-visible:ring-0 p-8 font-mono text-sm"
              />
              <ScrollArea className="h-full">
                <div 
                  className="prose prose-slate dark:prose-invert max-w-none p-8"
                  dangerouslySetInnerHTML={{ __html: marked(content || '_Nothing to preview_') }}
                />
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="p-4 border-t border-slate-50 dark:border-slate-900 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <div>{content.trim().split(/\s+/).filter(Boolean).length} words</div>
        <div>Last updated {new Date(note.updated_at).toLocaleString()}</div>
      </div>
    </div>
  );
}
