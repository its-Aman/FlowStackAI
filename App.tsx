import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import FlowEditor from './views/FlowEditor';
import FlowPlayer from './views/FlowPlayer';
import { Flow } from './types';

// Initial Seed Data
const DEFAULT_FLOWS: Flow[] = [
  {
    id: 'morning-routine',
    title: 'Morning Momentum',
    description: 'Start the day with clarity and energy.',
    icon: '🌅',
    color: 'from-orange-500 to-amber-500',
    totalDuration: 900,
    tags: ['Morning', 'Wellness'],
    steps: [
      { id: 's1', title: 'Hydrate', duration: 60, description: 'Drink a full glass of water.' },
      { id: 's2', title: 'Stretch', duration: 300, description: 'Light yoga or dynamic stretching.' },
      { id: 's3', title: 'Meditation', duration: 300, description: 'Focus on breath.' },
      { id: 's4', title: 'Plan Day', duration: 240, description: 'Write down top 3 goals.' },
    ],
  },
  {
    id: 'deep-work',
    title: 'Deep Work Block',
    description: 'Intense focus session for coding or writing.',
    icon: '🧠',
    color: 'from-blue-600 to-indigo-600',
    totalDuration: 3000,
    tags: ['Work', 'Focus'],
    steps: [
      { id: 'dw1', title: 'Clear Distractions', duration: 120, description: 'Close tabs, phone away.' },
      { id: 'dw2', title: 'Focus Sprint 1', duration: 1500, description: 'Single task focus.' },
      { id: 'dw3', title: 'Short Break', duration: 300, description: 'Walk away from screen.' },
      { id: 'dw4', title: 'Focus Sprint 2', duration: 1080, description: 'Wrap up or continue.' },
    ],
  },
  {
    id: 'pomodoro',
    title: 'Classic Pomodoro',
    description: 'Standard 25/5 interval stack.',
    icon: '🍅',
    color: 'from-red-500 to-rose-500',
    totalDuration: 1800,
    tags: ['Technique'],
    steps: [
      { id: 'p1', title: 'Focus', duration: 1500, description: 'Work on one task.' },
      { id: 'p2', title: 'Break', duration: 300, description: 'Stretch and relax.' },
    ]
  }
];

const App: React.FC = () => {
  const [flows, setFlows] = useState<Flow[]>(() => {
    const saved = localStorage.getItem('flowstack_flows');
    return saved ? JSON.parse(saved) : DEFAULT_FLOWS;
  });

  useEffect(() => {
    localStorage.setItem('flowstack_flows', JSON.stringify(flows));
  }, [flows]);

  const addFlow = (flow: Flow) => {
    setFlows(prev => [flow, ...prev]);
  };

  const updateFlow = (updatedFlow: Flow) => {
    setFlows(prev => prev.map(f => f.id === updatedFlow.id ? updatedFlow : f));
  };

  const deleteFlow = (id: string) => {
    setFlows(prev => prev.filter(f => f.id !== id));
  };

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard flows={flows} onDelete={deleteFlow} />} />
          <Route 
            path="/edit/:id" 
            element={<FlowEditor flows={flows} onSave={updateFlow} onCreate={addFlow} />} 
          />
          <Route 
            path="/ai-create" 
            element={<FlowEditor flows={flows} onSave={updateFlow} onCreate={addFlow} isAiMode={true} />} 
          />
          <Route 
            path="/play/:id" 
            element={<FlowPlayer flows={flows} />} 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
