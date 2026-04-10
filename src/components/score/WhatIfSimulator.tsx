import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Slider } from '../ui/slider';
import type { Subject } from '../../types';

import { Button } from '../ui/button';
import { Info, Zap, Calculator } from 'lucide-react';

interface WhatIfSimulatorProps {
  subjects: Subject[];
  baseProjectedScore: number;
  initialBreakdown: Record<string, number>;
}

export default function WhatIfSimulator({ subjects, baseProjectedScore, initialBreakdown }: WhatIfSimulatorProps) {
  const [simulationData, setSimulationData] = useState<Record<string, number>>({});
  
  useEffect(() => {
    const initial: Record<string, number> = {};
    subjects.forEach(s => {
      // Readiness %
      const currentScore = initialBreakdown[s.short_code] || 0;
      initial[s.short_code] = Math.round((currentScore / s.gate_weightage_marks) * 100);
    });
    setSimulationData(initial);
  }, [subjects, initialBreakdown]);

  const simulatedTotal = subjects.reduce((acc, s) => {
    const readiness = simulationData[s.short_code] || 0;
    return acc + (s.gate_weightage_marks * (readiness / 100));
  }, 0);

  const diff = Math.round(simulatedTotal - baseProjectedScore);

  const applyScenario = (type: string) => {
    const newData = { ...simulationData };
    if (type === 'phase1') {
      subjects.filter(s => s.phase === 1).forEach(s => newData[s.short_code] = 85);
    } else if (type === 'pyq') {
      subjects.forEach(s => newData[s.short_code] = Math.min(100, (newData[s.short_code] || 0) + 15));
    }
    setSimulationData(newData);
  };

  return (
    <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
      <CardHeader className="bg-indigo-600 text-white p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Calculator className="h-5 w-5" /> What-If Simulator
          </CardTitle>
          <div className="text-right">
            <div className="text-3xl font-black leading-none">{Math.round(simulatedTotal)}</div>
            <div className="text-[10px] font-bold opacity-80 uppercase mt-1">Simulated Score</div>
          </div>
        </div>
        {diff !== 0 && (
          <div className="mt-4 flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg text-xs font-bold">
            <Zap className="h-3 w-3 fill-white" />
            Impact: {diff > 0 ? '+' : ''}{diff} marks vs current projection
          </div>
        )}
      </CardHeader>
      <CardContent className="p-6 space-y-8">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => applyScenario('phase1')} className="text-[10px] font-bold h-7">COMPLETE PHASE 1</Button>
          <Button variant="outline" size="sm" onClick={() => applyScenario('pyq')} className="text-[10px] font-bold h-7">MAX PYQ ACCURACY</Button>
          <Button variant="ghost" size="sm" onClick={() => {
             const reset: Record<string, number> = {};
             subjects.forEach(s => reset[s.short_code] = Math.round(((initialBreakdown[s.short_code] || 0) / s.gate_weightage_marks) * 100));
             setSimulationData(reset);
          }} className="text-[10px] font-bold h-7">RESET</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          {subjects.map(s => (
            <div key={s.id} className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{s.short_code}</span>
                  <span className="text-[10px] text-slate-400 font-medium truncate max-w-[100px]">{s.name}</span>
                </div>
                <span className="text-xs font-black text-indigo-600">{simulationData[s.short_code] || 0}%</span>
              </div>
              <Slider 
                value={[simulationData[s.short_code] || 0]} 
                onValueChange={(val) => setSimulationData(prev => ({ ...prev, [s.short_code]: val[0] }))}
                max={100}
                step={1}
              />
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex gap-3 items-start bg-slate-50/50 dark:bg-slate-900/50 -mx-6 -mb-6 p-6">
          <Info className="h-4 w-4 text-indigo-500 mt-0.5" />
          <p className="text-[10px] text-slate-500 leading-relaxed">
            This simulator estimates how your total score changes if you improve "Readiness" in specific subjects. Readiness is a mix of topic completion, mock accuracy, and PYQ practice.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
