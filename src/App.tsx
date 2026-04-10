import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useEffect } from 'react';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import StudyPlan from './pages/StudyPlan';
import Subjects from './pages/Subjects';
import DailyLog from './pages/DailyLog';
import Notes from './pages/Notes';
import Resources from './pages/Resources';
import MockTests from './pages/MockTests';
import ScoreEvaluation from './pages/ScoreEvaluation';
import Settings from './pages/Settings';

function App() {
  useEffect(() => {
    const theme = localStorage.getItem('gate-tracker-theme') || 'light';
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, []);

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="plan" element={<StudyPlan />} />
          <Route path="subjects" element={<Subjects />} />
          <Route path="log" element={<DailyLog />} />
          <Route path="notes" element={<Notes />} />
          <Route path="resources" element={<Resources />} />
          <Route path="mocks" element={<MockTests />} />
          <Route path="score" element={<ScoreEvaluation />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
export default App;
