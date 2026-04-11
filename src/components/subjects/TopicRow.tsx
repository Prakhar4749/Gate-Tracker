import { formatDistanceToNow, parseISO } from 'date-fns';
import { 
  FileText, 
  Clock, 
  BarChart2, 
  ChevronRight, 
  ChevronDown,
  
  
  CheckCircle2,
  Circle,
  
  AlertCircle
} from 'lucide-react';
import { useState } from 'react';
import type { Topic, StatusType } from '../../types';
import { cn, getStatusColor } from '../../lib/utils';
import { useUpdateTopicStatus } from '../../hooks/useTopics';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Sheet, SheetTrigger } from '../ui/sheet';
import TopicNotesEditor from './TopicNotesEditor';
import { toast } from 'sonner';

interface TopicRowProps {
  topic: Topic;
  onStatusChange: () => void;
}

export default function TopicRow({ topic, onStatusChange }: TopicRowProps) {
  const updateStatus = useUpdateTopicStatus();
  const [isLoading, setIsLoading] = useState(false);
  const [showSubtopics, setShowSubtopics] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setIsLoading(true);
    try {
      await updateStatus(topic.id, newStatus as StatusType);
      toast.success(`Updated ${topic.name} to ${newStatus.replace('_', ' ')}`);
      onStatusChange();
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-rose-600 bg-rose-50 dark:bg-rose-950 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      case 'medium': return 'text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      default: return 'text-slate-600 bg-slate-50 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="group border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div className="flex flex-col md:flex-row md:items-center py-4 px-4 gap-4 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
        
        {/* Name and Basic Info */}
        <div className="flex-1 flex items-start gap-3 min-w-0">
          <div className="mt-1">
            {topic.status === 'completed' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500 fill-emerald-50" />
            ) : topic.status === 'in_progress' ? (
              <Circle className="h-5 w-5 text-blue-500 fill-blue-50 animate-pulse" />
            ) : topic.status === 'needs_revision' ? (
              <AlertCircle className="h-5 w-5 text-amber-500 fill-amber-50" />
            ) : (
              <Circle className="h-5 w-5 text-slate-300" />
            )}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors">
              {topic.name}
            </h4>
            <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {topic.estimated_hours}h
              </span>
              <span className="flex items-center gap-1">
                <BarChart2 className="h-3 w-3" /> {topic.pyq_count} PYQs
              </span>
              {topic.last_studied_at && (
                <span>Studied {formatDistanceToNow(parseISO(topic.last_studied_at))} ago</span>
              )}
            </div>
          </div>
        </div>

        {/* Status and Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider font-bold py-0.5", getPriorityColor(topic.priority))}>
            {topic.priority}
          </Badge>

          <select
            value={topic.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={isLoading}
            className={cn(
              "h-8 px-2 pr-7 rounded-md border border-input bg-background text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring dark:bg-slate-900 dark:border-slate-700 cursor-pointer",
              getStatusColor(topic.status)
            )}
          >
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="needs_revision">Needs Revision</option>
          </select>

          <div className="flex items-center gap-1">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950">
                  <FileText className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <TopicNotesEditor 
                topicId={topic.id} 
                topicName={topic.name} 
                initialNotes={topic.notes || ''} 
                subjectId={topic.subject_id}
              />
            </Sheet>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowSubtopics(!showSubtopics)}
              className={cn("h-8 w-8 text-slate-400", showSubtopics && "text-indigo-600")}
            >
              {showSubtopics ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Subtopics dropdown */}
      {showSubtopics && topic.subtopics && topic.subtopics.length > 0 && (
        <div className="bg-slate-50/80 dark:bg-slate-900/50 px-12 py-3 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex flex-wrap gap-2">
            {topic.subtopics.map((st, i) => (
              <Badge key={i} variant="outline" className="bg-white dark:bg-slate-800 text-[10px] font-medium border-slate-200 dark:border-slate-700">
                {st}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
