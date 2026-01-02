import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import FlowEditor from './views/FlowEditor';
import FlowPlayer from './views/FlowPlayer';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route 
            path="/edit/:id" 
            element={<FlowEditor />} 
          />
          <Route 
            path="/ai-create" 
            element={<FlowEditor isAiMode={true} />} 
          />
          <Route 
            path="/play/:id" 
            element={<FlowPlayer />} 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;