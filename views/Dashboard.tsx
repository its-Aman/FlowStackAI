import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Clock, MoreHorizontal, Trash2, Edit2, Zap, Layers, BarChart3, Calendar } from 'lucide-react';
import { Flow } from '../types';

interface DashboardProps {
  flows: Flow[];
  onDelete: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ flows, onDelete }) => {
  const navigate = useNavigate();

  const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    return `${min}m`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getDateString = () => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' });
  };

  return (
    <div className="p-6 pb-28 space-y-6 min-h-screen">
      
      {/* Header Section */}
      <header className="mt-4 animate-fade-in">
        <div className="flex justify-between items-start mb-6">
            <div>
                <h2 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                    <Calendar size={12} /> {getDateString()}
                </h2>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                    {getGreeting()}
                </h1>
            </div>
             <button 
                onClick={() => navigate('/ai-create')}
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 hover:scale-110 transition-transform"
            >
                <Zap size={20} fill="currentColor" />
            </button>
        </div>

        {/* Stats / Overview Card (Mock Data for PRD 'Stats' requirement) */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-5 flex justify-between items-center shadow-xl">
            <div>
                <div className="text-slate-400 text-xs font-medium mb-1">Focused Today</div>
                <div className="text-2xl font-bold text-white">45<span className="text-sm font-normal text-slate-500">m</span></div>
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <div>
                <div className="text-slate-400 text-xs font-medium mb-1">Tasks Done</div>
                <div className="text-2xl font-bold text-white">3</div>
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <div className="flex flex-col items-center">
                 <div className="text-slate-400 text-xs font-medium mb-1">Streak</div>
                 <div className="flex items-center gap-1 text-orange-400 font-bold">
                    <Zap size={14} fill="currentColor" /> 2
                 </div>
            </div>
        </div>
      </header>

      {/* Main Content: Stacks List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold text-lg">My Stacks</h3>
            <span className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded-full border border-slate-800">{flows.length}</span>
        </div>

        {flows.length === 0 ? (
          <div className="text-center py-16 px-6 rounded-3xl border border-slate-800/50 bg-slate-900/20 border-dashed">
            <Layers size={48} className="mx-auto mb-4 text-slate-700" />
            <h3 className="text-lg font-medium text-white mb-2">Build your first stack</h3>
            <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">Create a routine or use AI to generate a scientifically backed flow.</p>
            <button 
                onClick={() => navigate('/edit/new')}
                className="bg-white text-slate-900 hover:bg-slate-200 px-6 py-2.5 rounded-full text-sm font-bold transition-colors"
            >
                Create Stack
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {flows.map((flow) => (
                <div 
                key={flow.id} 
                onClick={() => navigate(`/play/${flow.id}`)}
                className="group relative bg-slate-900 border border-slate-800 rounded-3xl p-5 hover:border-indigo-500/50 transition-all cursor-pointer shadow-lg overflow-hidden"
                >
                <div className={`absolute inset-0 bg-gradient-to-br ${flow.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                
                <div className="flex items-start gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl shadow-inner border border-slate-700/50">
                        {flow.icon || '🌊'}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-lg text-white truncate pr-2">{flow.title}</h3>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); navigate(`/edit/${flow.id}`); }}
                                    className="p-1.5 bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                                >
                                    <Edit2 size={14} />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); if(window.confirm('Delete?')) onDelete(flow.id); }}
                                    className="p-1.5 bg-slate-800 rounded-lg text-slate-400 hover:text-red-400"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                        
                        <p className="text-slate-400 text-sm line-clamp-1 mb-3">{flow.description}</p>
                        
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-slate-500 bg-slate-950/50 px-2 py-1 rounded-md border border-slate-800">
                                {formatDuration(flow.totalDuration)}
                            </span>
                            <span className="text-xs font-medium text-slate-500">
                                {flow.steps.length} tasks
                            </span>
                        </div>
                    </div>
                </div>
                </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
