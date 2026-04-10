import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSubjects } from '../hooks/useSubjects';
import { usePracticeResources, useWatchedResources } from '../hooks/usePracticeResources';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  ExternalLink, 
  CheckCircle2, 
  Circle, 
  PlayCircle,
  Shuffle,
  Filter,
  ListVideo,
  Clock,
  CheckCircle,
  Search,
  ArrowRight
  } from 'lucide-react';
  import { cn, getYoutubeThumbnail } from '../lib/utils';
  import { toast } from 'sonner';
  import { Skeleton } from '@/components/ui/skeleton';

  export default function Resources() {

  const [searchParams] = useSearchParams();
  const { data: subjects, loading: subjectsLoading } = useSubjects();

  const defaultSubject = searchParams.get('subject') || 'all';
  const [activeSubject, setActiveSubject] = useState(defaultSubject);

  // Find subject ID if short_code was passed in URL
  const activeSubjectId = useMemo(() => {
    if (activeSubject === 'all') return 'all';
    const found = subjects?.find(s => s.short_code === activeSubject || s.id === activeSubject);
    return found?.id || activeSubject;
  }, [subjects, activeSubject]);

  const { resources, loading: resourcesLoading } = usePracticeResources(activeSubjectId);
  const { watched, toggleWatched } = useWatchedResources();

  const [filter, setFilter] = useState<'all' | 'playlist' | 'video' | 'unwatched'>('all');
  const [search, setSearch] = useState('');

  // Update active subject when URL param changes
  useEffect(() => {
    const param = searchParams.get('subject');
    if (param) setActiveSubject(param);
  }, [searchParams]);

  const filteredResources = useMemo(() => {
    return (resources || []).filter(res => {
      const matchesSearch = res.url.toLowerCase().includes(search.toLowerCase()) || 
                           res.subject?.name.toLowerCase().includes(search.toLowerCase());

      const isWatched = watched.has(res.id);

      if (filter === 'playlist') return matchesSearch && res.resource_type === 'youtube_playlist';
      if (filter === 'video') return matchesSearch && res.resource_type !== 'youtube_playlist';
      if (filter === 'unwatched') return matchesSearch && !isWatched;
      return matchesSearch;
    });
  }, [resources, filter, search, watched]);

  const handleToggleWatched = async (resourceId: string) => {
    await toggleWatched(resourceId);
    toast.success(watched.has(resourceId) ? 'Marked as unwatched' : 'Marked as watched');
  };

  const handleRandomPick = () => {
    const unwatched = resources.filter(r => !watched.has(r.id));
    const pool = unwatched.length > 0 ? unwatched : resources;

    if (pool.length === 0) {
      toast.error('No resources available to pick from.');
      return;
    }

    const random = pool[Math.floor(Math.random() * pool.length)];
    window.open(random.url, '_blank');
    toast.success(`Picked: ${random.resource_type.replace('youtube_', '').toUpperCase()} for ${random.subject?.short_code}`);
  };

  // Stats calculation
  const totalResources = resources.length;
  const watchedCount = resources.filter(r => watched.has(r.id)).length;
  const playlistCount = resources.filter(r => r.resource_type === 'youtube_playlist').length;
  const practiceHours = Math.round(watchedCount * 1.5); // Estimate 1.5h per session

  if (subjectsLoading) return (
    <div className="space-y-8 p-8">
      <Skeleton className="h-12 w-64" />
      <div className="grid grid-cols-4 gap-4"><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /></div>
      <Skeleton className="h-64 w-full" />
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            📚 Resource Library
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            1000+ Topper-recommended practice sessions from YouTube
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Resources" value={totalResources} icon={<PlayCircle className="h-4 w-4" />} />
        <StatCard label="Watched" value={watchedCount} icon={<CheckCircle2 className="h-4 w-4" />} color="emerald" />
        <StatCard label="Playlists" value={playlistCount} icon={<ListVideo className="h-4 w-4" />} color="indigo" />
        <StatCard label="Practice Hours" value={`~${practiceHours}h`} icon={<Clock className="h-4 w-4" />} color="amber" />
      </div>
      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search resources or subjects..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-hide">
          <FilterButton active={filter === 'all'} onClick={() => setFilter('all')} label="All" />
          <FilterButton active={filter === 'playlist'} onClick={() => setFilter('playlist')} label="Playlists" />
          <FilterButton active={filter === 'video'} onClick={() => setFilter('video')} label="Videos" />
          <FilterButton active={filter === 'unwatched'} onClick={() => setFilter('unwatched')} label="Unwatched" />
        </div>
      </div>

      <Tabs value={activeSubject} onValueChange={setActiveSubject} className="space-y-6">
        <div className="overflow-x-auto pb-2 scrollbar-hide">
          <TabsList className="bg-transparent h-auto p-0 flex gap-2">
            <TabsTrigger 
              value="all" 
              className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:border-indigo-600 data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-200 dark:data-[state=active]:shadow-none transition-all font-bold text-xs uppercase tracking-widest"
            >
              All Subjects
            </TabsTrigger>
            {subjects?.map(s => {
              // Calculate progress per subject tab if needed, but for now just label
              return (
                <TabsTrigger 
                  key={s.id} 
                  value={s.short_code}
                  className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:border-indigo-600 transition-all font-bold text-xs uppercase tracking-widest"
                >
                  {s.short_code}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <TabsContent value={activeSubject} className="mt-0 space-y-6">
          {/* Random Pick Callout */}
          <button
            onClick={handleRandomPick}
            className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-all group"
          >
            <Shuffle className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            <span className="font-black text-sm uppercase tracking-widest">Pick a random unwatched {activeSubject === 'all' ? 'revision' : activeSubject} session</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {resourcesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-72 w-full rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((res) => (
                <ResourceCard 
                  key={res.id} 
                  resource={res} 
                  isWatched={watched.has(res.id)}
                  onToggleWatched={() => handleToggleWatched(res.id)}
                />
              ))}
            </div>
          )}

          {!resourcesLoading && filteredResources.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50/50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <div className="h-16 w-16 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center mb-4 shadow-sm">
                <Filter className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No resources found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Try adjusting your filters or subject selection.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ label, value, icon, color = 'indigo' }: { label: string, value: string | number, icon: React.ReactNode, color?: string }) {
  const colors: Record<string, string> = {
    indigo: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400',
    emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400',
    amber: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400',
  };

  return (
    <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
      <CardContent className="p-4 flex items-center gap-4">
        <div className={cn("p-2.5 rounded-xl", colors[color])}>
          {icon}
        </div>
        <div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
          <div className="text-xl font-black text-slate-900 dark:text-white">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function FilterButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
        active 
          ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none" 
          : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200"
      )}
    >
      {label}
    </button>
  );
}

function ResourceCard({ resource, isWatched, onToggleWatched }: { resource: any, isWatched: boolean, onToggleWatched: () => void }) {
  const thumbnailUrl = getYoutubeThumbnail(resource.url);

  return (
    <div className={cn(
      "group relative rounded-2xl border transition-all duration-300 overflow-hidden bg-white dark:bg-slate-900",
      isWatched 
        ? "border-emerald-200 dark:border-emerald-900/50" 
        : "border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-xl hover:shadow-indigo-500/5"
    )}>
      {/* Thumbnail Area */}
      <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden">
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt="" 
            className={cn(
              "w-full h-full object-cover transition-transform duration-500 group-hover:scale-110",
              isWatched && "opacity-60 grayscale-[0.5]"
            )}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
            <ListVideo className="w-10 h-10 text-white opacity-20" />
          </div>
        )}

        {/* Watched Overlay */}
        {isWatched && (
          <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center backdrop-blur-[1px]">
            <div className="bg-emerald-500 text-white p-2 rounded-full shadow-lg scale-110 animate-in zoom-in-50">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        )}

        {/* Status Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <Badge className={cn(
            "border-none font-black text-[8px] tracking-[0.15em] px-2 py-0.5 shadow-sm",
            resource.resource_type === 'youtube_playlist' ? "bg-indigo-600" : 
            resource.resource_type === 'youtube_live' ? "bg-rose-600" : "bg-amber-500"
          )}>
            {resource.resource_type === 'youtube_playlist' ? 'PLAYLIST' : 
             resource.resource_type === 'youtube_live' ? 'LIVE' : 'PRACTICE'}
          </Badge>
        </div>

        {/* Watch Toggle Button */}
        <button
          onClick={(e) => { e.preventDefault(); onToggleWatched(); }}
          className={cn(
            "absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all shadow-sm",
            isWatched 
              ? "bg-emerald-500 text-white" 
              : "bg-white/90 dark:bg-slate-900/90 text-slate-400 hover:text-indigo-600 hover:scale-110"
          )}
        >
          {isWatched ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
        </button>

        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-2 py-0.5 rounded-lg border border-white/10">
          SESSION #{resource.sort_order}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] font-black border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 px-2 py-0">
            {resource.subjects?.short_code || 'CS'}
          </Badge>
          <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {resource.resource_type === 'youtube_playlist' ? 'Multiple Sessions' : '1.5h Estimated'}
          </span>
        </div>

        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {resource.resource_type === 'youtube_playlist' 
            ? `${resource.subject?.name} Complete Practice Playlist`
            : `${resource.subject?.name} Practice Session #${resource.sort_order}`
          }
        </h3>

        <a 
          href={resource.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-between w-full group/btn"
        >
          <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest group-hover/btn:translate-x-1 transition-transform">
            Watch Session →
          </span>
          <ExternalLink className="w-3 h-3 text-slate-300 dark:text-slate-700" />
        </a>
      </div>
    </div>
  );
}
