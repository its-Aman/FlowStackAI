import React from 'react';
import { Home, Plus, Settings, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  // Hide nav on player screen for immersion
  const isPlayer = location.pathname.includes('/play');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <main className="flex-1 w-full max-w-md mx-auto relative flex flex-col">
        {children}
      </main>

      {!isPlayer && (
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
          <nav className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-full shadow-2xl px-6 py-3 flex items-center gap-8 pointer-events-auto">
            <button
              onClick={() => navigate('/')}
              className={`flex flex-col items-center gap-1 transition-colors ${
                isActive('/') ? 'text-indigo-400' : 'text-slate-400 hover:text-indigo-300'
              }`}
            >
              <Home size={22} />
              <span className="text-[10px] font-medium">Home</span>
            </button>
            
            <button
              onClick={() => navigate('/edit/new')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-full shadow-lg shadow-indigo-600/30 transform transition-transform active:scale-95 -mt-6 border-4 border-slate-950"
            >
              <Plus size={28} strokeWidth={3} />
            </button>

             <button
              onClick={() => navigate('/ai-create')} // Placeholder for AI route or modal trigger
              className={`flex flex-col items-center gap-1 transition-colors ${
                isActive('/ai-create') ? 'text-indigo-400' : 'text-slate-400 hover:text-indigo-300'
              }`}
            >
              <Sparkles size={22} />
              <span className="text-[10px] font-medium">Magic</span>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default Layout;
