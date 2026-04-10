import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useSubjects } from '../hooks/useSubjects';
import { useDailyLogs } from '../hooks/useDailyLogs';
import { useMockTests } from '../hooks/useMockTests';
import { useNotes } from '../hooks/useNotes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Database, 
  Download, 
  Trash2, 
  Moon, 
  Sun, 
  Monitor,
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const { theme, setTheme } = useAppStore();
  const { data: subjects } = useSubjects();
  const { data: logs } = useDailyLogs();
  const { data: mocks } = useMockTests();
  const { data: notes } = useNotes();

  const [profile, setProfile] = useState({
    name: 'Prakhar',
    targetIIT: 'IIT Kanpur',
    targetScore: 750,
    currentScore: 461
  });

  const handleExportData = () => {
    const fullData = {
      profile,
      subjects,
      logs,
      mocks,
      notes,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gate-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your profile, preferences, and data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation Sidebar */}
        <div className="space-y-1">
          <Button variant="ghost" className="w-full justify-start font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30">
            <User className="mr-2 h-4 w-4" /> Profile
          </Button>
          <Button variant="ghost" className="w-full justify-start font-medium text-slate-500">
            <Monitor className="mr-2 h-4 w-4" /> Appearance
          </Button>
          <Button variant="ghost" className="w-full justify-start font-medium text-slate-500">
            <Database className="mr-2 h-4 w-4" /> Data Management
          </Button>
          <Button variant="ghost" className="w-full justify-start font-medium text-slate-500">
            <ShieldCheck className="mr-2 h-4 w-4" /> Privacy & Security
          </Button>
        </div>

        {/* Content */}
        <div className="md:col-span-2 space-y-8">
          {/* Profile Section */}
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-base font-bold">Preparation Profile</CardTitle>
              <CardDescription>Your target goals used for score projections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="iit">Target IIT</Label>
                  <Input id="iit" value={profile.targetIIT} onChange={e => setProfile({...profile, targetIIT: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target">Target Score</Label>
                  <Input id="target" type="number" value={profile.targetScore} onChange={e => setProfile({...profile, targetScore: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current">Baseline Score (Self-Evaluation)</Label>
                  <Input id="current" type="number" value={profile.currentScore} onChange={e => setProfile({...profile, currentScore: parseInt(e.target.value)})} />
                </div>
              </div>
              <Button className="bg-indigo-600 hover:bg-indigo-700 px-8">Save Profile</Button>
            </CardContent>
          </Card>

          {/* Appearance Section */}
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-base font-bold">Appearance</CardTitle>
              <CardDescription>Customize the application's look and feel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Color Theme</Label>
                  <p className="text-[10px] text-slate-500 font-medium">Switch between light and dark modes</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                  <Button 
                    variant={theme === 'light' ? 'default' : 'ghost'} 
                    size="sm" 
                    className="h-8 text-[10px] font-bold"
                    onClick={() => setTheme('light')}
                  >
                    <Sun className="mr-2 h-3 w-3" /> LIGHT
                  </Button>
                  <Button 
                    variant={theme === 'dark' ? 'default' : 'ghost'} 
                    size="sm" 
                    className="h-8 text-[10px] font-bold"
                    onClick={() => setTheme('dark')}
                  >
                    <Moon className="mr-2 h-3 w-3" /> DARK
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Section */}
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden border-l-4 border-amber-500">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Database className="h-4 w-4 text-amber-500" /> Data Management
              </CardTitle>
              <CardDescription>Backup your study logs and notes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Download className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">Export as JSON</div>
                    <div className="text-[10px] text-slate-500 font-medium">Download a full backup of your preparation data</div>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportData} className="font-bold text-[10px]">EXPORT NOW</Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-rose-50/30 dark:bg-rose-950/10 rounded-xl border border-rose-100 dark:border-rose-900/30">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-950 flex items-center justify-center text-rose-600 dark:text-rose-400">
                    <Trash2 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-rose-600 dark:text-rose-400">Clear All Data</div>
                    <div className="text-[10px] text-slate-500 font-medium uppercase">Warning: This action is permanent</div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-rose-600 hover:text-rose-700 hover:bg-rose-100 dark:hover:bg-rose-900/20 font-bold text-[10px]">DELETE ALL</Button>
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <div className="pt-8 flex flex-col items-center text-center space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-200 dark:shadow-none">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <div className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm">GATE 2027 Tracker</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">Version 1.0.0 · Build 2026.04.10</div>
            </div>
            <div className="flex gap-4">
              <Button variant="ghost" size="sm" className="text-[10px] font-bold text-slate-500">
                <Globe className="mr-2 h-3 w-3" /> WEBSITE
              </Button>
              <Button variant="ghost" size="sm" className="text-[10px] font-bold text-slate-500">
                <ExternalLink className="mr-2 h-3 w-3" /> OFFICIAL GATE
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
