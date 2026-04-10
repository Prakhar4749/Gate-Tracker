import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Subject, Topic } from '../../types';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ChevronDown, ChevronUp, ListVideo, PlayCircle } from 'lucide-react';
import TopicRow from './TopicRow';
import { cn, getStrengthColor } from '../../lib/utils';
import { usePracticeResources } from '../../hooks/usePracticeResources';

interface SubjectCardProps {
  subject: Subject & { topics: Topic[] };
  onTopicUpdate: () => void;
}

export default function SubjectCard({ subject, onTopicUpdate }: SubjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { resources } = usePracticeResources(subject.id);

  const completedTopics = subject.topics.filter(t => t.status === 'completed').length;
  const totalTopics = subject.topics.length;
  const completionPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  const getPhaseColor = (phase: number) => {
    switch (phase) {
      case 1: return 'bg-indigo-500';
      case 2: return 'bg-emerald-500';
      case 3: return 'bg-amber-500';
      case 4: return 'bg-rose-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <Card className="overflow-hidden border-none shadow-sm bg-white dark:bg-slate-900 group">
      <CardHeader 
        className="p-5 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex flex-col gap-4">
          {/* Top Row: Badges and Expand */}
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={cn("text-[10px] font-bold border-none text-white", getPhaseColor(subject.phase))}>
                PHASE {subject.phase}
              </Badge>
              <Badge variant="secondary" className={cn("text-[10px] font-bold border-none uppercase", getStrengthColor(subject.strength_level))}>
                {subject.strength_level}
              </Badge>
              <Badge variant="outline" className="text-[10px] font-bold border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500">
                ~{subject.gate_weightage_marks} MARKS
              </Badge>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 group-hover:text-indigo-600">
              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
          </div>

          {/* Middle Row: Name and Progress */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span className="text-indigo-600 font-black">{subject.short_code}</span>
                {subject.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {completedTopics} of {totalTopics} topics completed
              </p>
            </div>
            <div className="w-full md:w-48 space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                <span>Completion</span>
                <span>{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2 bg-slate-100 dark:bg-slate-800" />
            </div>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-0 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-slate-50/30 dark:bg-slate-900/30 flex items-center justify-between px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
            <span>Topic Name</span>
            <div className="flex items-center gap-12 pr-12 hidden md:flex">
              <span>Priority</span>
              <span className="w-32 text-center">Status</span>
              <span>Actions</span>
            </div>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {subject.topics.map(topic => (
              <TopicRow key={topic.id} topic={topic} onStatusChange={onTopicUpdate} />
            ))}
          </div>

          {/* Practice Resources Section */}
          <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Practice Resources
              </span>
              <Link
                to={`/resources?subject=${subject.short_code}`}
                className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline uppercase tracking-tighter"
              >
                View all {resources.length} →
              </Link>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {resources.slice(0, 3).map(resource => (
                <a
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 text-xs font-medium text-slate-600 dark:text-slate-300 transition-all hover:shadow-sm"
                >
                  {resource.resource_type === 'youtube_playlist'
                    ? <ListVideo className="w-3.5 h-3.5 text-indigo-500" />
                    : <PlayCircle className="w-3.5 h-3.5 text-rose-500" />
                  }
                  {resource.resource_type === 'youtube_playlist' ? 'Playlist' : `Session #${resource.sort_order}`}
                </a>
              ))}
              {resources.length === 0 && (
                <p className="text-[10px] font-bold text-slate-400 uppercase italic">No resources available yet.</p>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
