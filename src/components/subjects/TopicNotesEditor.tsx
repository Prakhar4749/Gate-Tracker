import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '../ui/sheet';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { useUpdateTopicNotes } from '../../hooks/useTopics';
import { usePracticeResources } from '../../hooks/usePracticeResources';
import { marked } from 'marked';
import { Save, Eye, Edit3, Loader2, CheckCircle, ListVideo, PlayCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface TopicNotesEditorProps {
  topicId: string;
  topicName: string;
  initialNotes: string;
  subjectId: string;
}

export default function TopicNotesEditor({ topicId, topicName, initialNotes, subjectId }: TopicNotesEditorProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [isDirty, setIsDirty] = useState(false);
  const updateNotes = useUpdateTopicNotes();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const { resources } = usePracticeResources(subjectId);

  const handleSave = useCallback(async () => {
    if (!isDirty) return;
    
    setSaveStatus('saving');
    setIsLoading(true);
    try {
      await updateNotes(topicId, notes);
      setSaveStatus('saved');
      setIsDirty(false);
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      setSaveStatus('idle');
      toast.error('Failed to save notes');
    } finally {
      setIsLoading(false);
    }
  }, [topicId, notes, isDirty, updateNotes]);

  // Autosave logic (2 seconds debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isDirty) handleSave();
    }, 2000);

    return () => clearTimeout(timer);
  }, [notes, isDirty, handleSave]);

  const wordCount = notes.trim().split(/\s+/).filter(Boolean).length;
  const charCount = notes.length;

  return (
    <SheetContent className="sm:max-w-[600px] flex flex-col h-full">
      <SheetHeader className="pb-4 border-b">
        <SheetTitle className="flex items-center justify-between">
          <span className="truncate pr-4">{topicName}</span>
          <div className="flex items-center gap-2">
            {saveStatus === 'saving' && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
            {saveStatus === 'saved' && <CheckCircle className="h-4 w-4 text-emerald-500" />}
            <Button size="sm" onClick={handleSave} disabled={!isDirty || isLoading}>
              <Save className="h-4 w-4 mr-2" /> Save
            </Button>
          </div>
        </SheetTitle>
        <SheetDescription className="text-xs">
          Edit and preview your study notes for this topic.
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 overflow-hidden py-4">
        <Tabs defaultValue="edit" className="h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="edit" className="flex items-center gap-2">
                <Edit3 className="h-3.5 w-3.5" /> Edit
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-3.5 w-3.5" /> Preview
              </TabsTrigger>
            </TabsList>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {wordCount} words · {charCount} characters
            </div>
          </div>

          <TabsContent value="edit" className="flex-1 mt-0">
            <Textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setIsDirty(true);
              }}
              placeholder="Write your study notes here using markdown..."
              className="h-full resize-none font-mono text-sm border-none focus-visible:ring-0 p-0"
            />
          </TabsContent>

          <TabsContent value="preview" className="flex-1 mt-0 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <div 
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: marked(notes || '_No notes yet. Start typing!_') }}
              />
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      <SheetFooter className="pt-4 border-t flex flex-col gap-4">
        <div className="space-y-3 w-full">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Related Practice Sessions</span>
            <Link 
              to={`/resources?subject=${resources[0]?.subject?.short_code || ''}`} 
              className="text-[10px] font-bold text-indigo-600 hover:underline uppercase"
            >
              See All →
            </Link>
          </div>
          <div className="space-y-1.5">
            {resources.slice(0, 3).map(res => (
              <div key={res.id} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  {res.resource_type === 'youtube_playlist' ? <ListVideo className="h-3.5 w-3.5 text-indigo-500" /> : <PlayCircle className="h-3.5 w-3.5 text-rose-500" />}
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {res.resource_type === 'youtube_playlist' ? 'Practice Playlist' : `Session #${res.sort_order}`}
                  </span>
                </div>
                <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            ))}
            {resources.length === 0 && <p className="text-[10px] text-slate-400 italic">No resources found for this subject.</p>}
          </div>
        </div>
        <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-50 dark:border-slate-900 w-full">
          Markdown supported: # H1, **bold**, *italic*, `code`, - list
        </div>
      </SheetFooter>
    </SheetContent>
  );
}
