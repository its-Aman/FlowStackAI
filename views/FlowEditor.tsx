import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, GripVertical, Trash2, Plus, Wand2, Save, X, Clock, AlignLeft, Smile, Loader2 } from 'lucide-react';
import { Flow, FlowStep } from '../types';
import { generateRoutine } from '../services/geminiService';
import { flowService } from '../services/flowService';

interface FlowEditorProps {
  isAiMode?: boolean;
}

const COLORS = [
  'from-blue-500 to-indigo-500',
  'from-purple-500 to-pink-500',
  'from-orange-500 to-red-500',
  'from-emerald-500 to-teal-500',
  'from-slate-500 to-slate-700'
];

const FlowEditor: React.FC<FlowEditorProps> = ({ isAiMode = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new' || isAiMode;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [draggedStepIndex, setDraggedStepIndex] = useState<number | null>(null);
  
  const [flow, setFlow] = useState<Flow>({
    id: Math.random().toString(36).substr(2, 9),
    title: '',
    description: '',
    icon: '⚡',
    color: COLORS[0],
    steps: [],
    totalDuration: 0,
    tags: []
  });

  useEffect(() => {
    const fetchFlow = async () => {
        if (id && id !== 'new') {
            setIsLoading(true);
            try {
                const data = await flowService.getById(id);
                if (data) setFlow(data);
                else navigate('/'); // Handle not found
            } catch (e) {
                console.error("Error fetching flow", e);
            } finally {
                setIsLoading(false);
            }
        }
    };
    fetchFlow();
  }, [id, navigate]);

  useEffect(() => {
    const total = flow.steps.reduce((acc, step) => acc + step.duration, 0);
    setFlow(prev => ({ ...prev, totalDuration: total }));
  }, [flow.steps]);

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsLoading(true);
    try {
      const generated = await generateRoutine(aiPrompt);
      setFlow(prev => ({
        ...prev,
        title: generated.title,
        description: generated.description,
        icon: generated.icon || '✨',
        steps: generated.steps
      }));
    } catch (e) {
      alert("AI Generation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const addStep = () => {
    const newStep: FlowStep = {
      id: Math.random().toString(36).substr(2, 9),
      title: '',
      duration: 300,
      description: ''
    };
    setFlow(prev => ({ ...prev, steps: [...prev.steps, newStep] }));
  };

  const updateStep = (stepId: string, field: keyof FlowStep, value: any) => {
    setFlow(prev => ({
      ...prev,
      steps: prev.steps.map(s => s.id === stepId ? { ...s, [field]: value } : s)
    }));
  };

  const removeStep = (stepId: string) => {
    setFlow(prev => ({
      ...prev,
      steps: prev.steps.filter(s => s.id !== stepId)
    }));
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
      // Prevent drag if interacting with inputs
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
          e.preventDefault();
          return;
      }
      setDraggedStepIndex(index);
      e.dataTransfer.effectAllowed = "move";
      // Optional: Remove ghost image opacity or set custom image
      // e.dataTransfer.setDragImage(e.currentTarget, 0, 0);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
      e.preventDefault();
      if (draggedStepIndex === null) return;
      if (draggedStepIndex === index) return;

      const newSteps = [...flow.steps];
      const draggedItem = newSteps[draggedStepIndex];
      newSteps.splice(draggedStepIndex, 1);
      newSteps.splice(index, 0, draggedItem);

      setFlow(prev => ({ ...prev, steps: newSteps }));
      setDraggedStepIndex(index);
  };

  const handleDragEnd = () => {
      setDraggedStepIndex(null);
  };

  const handleSave = async () => {
    if (!flow.title) {
      alert("Please enter a title");
      return;
    }
    
    setIsSaving(true);
    
    const finalFlow = {
        ...flow,
        description: flow.description || "No description"
    };

    try {
        if (isNew && id !== 'new') {
            // New flow created via AI route or standard new
            await flowService.create(finalFlow);
        } else if (isNew && id === 'new') {
            await flowService.create(finalFlow);
        } else {
            // Update existing
            await flowService.update(finalFlow);
        }
        navigate('/');
    } catch (e) {
        alert('Failed to save flow');
    } finally {
        setIsSaving(false);
    }
  };

  const formatDuration = (seconds: number) => {
      const min = Math.floor(seconds / 60);
      const sec = seconds % 60;
      if (sec === 0) return `${min}m`;
      return `${min}m ${sec}s`;
  };

  if (isLoading && !isNew) {
      return (
        <div className="h-screen w-full flex items-center justify-center bg-slate-950 text-slate-500">
            <Loader2 className="animate-spin" />
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-slate-950/90 backdrop-blur-xl z-30 border-b border-slate-800/50">
        <div className="flex items-center justify-between p-4 max-w-md mx-auto w-full">
            <button onClick={() => navigate('/')} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors">
            <ArrowLeft size={22} />
            </button>
            <h2 className="font-semibold text-white">{isNew ? 'Create Flow' : 'Edit Flow'}</h2>
            <button 
            onClick={handleSave}
            disabled={isSaving}
            className="text-indigo-400 font-semibold text-sm px-3 py-1.5 hover:bg-indigo-900/20 rounded-lg transition-colors disabled:opacity-50"
            >
            {isSaving ? 'Saving...' : 'Save'}
            </button>
        </div>
      </div>

      <div className="p-5 pb-32 flex-1 max-w-md mx-auto w-full">
        {/* AI Generator */}
        {isNew && (
            <div className="mb-8 p-1 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/10">
                <div className="bg-slate-900 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3 text-indigo-300">
                        <Wand2 size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">AI Generator</span>
                    </div>
                    <div className="flex gap-2">
                        <input 
                        type="text" 
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="e.g. '30 min HIIT workout'"
                        className="flex-1 bg-slate-800 border-none rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500"
                        />
                        <button 
                        onClick={handleAiGenerate}
                        disabled={isLoading || !aiPrompt}
                        className="bg-white text-indigo-600 px-3 rounded-lg font-medium disabled:opacity-50"
                        >
                        {isLoading ? '...' : <Wand2 size={18} />}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Metadata */}
        <div className="space-y-6 mb-10">
            <div className="flex gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl shrink-0">
                    <input 
                        value={flow.icon || '⚡'}
                        onChange={(e) => setFlow(prev => ({...prev, icon: e.target.value}))}
                        className="w-full h-full bg-transparent text-center focus:outline-none cursor-pointer"
                        maxLength={2}
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Flow Name</label>
                    <input 
                        value={flow.title}
                        onChange={(e) => setFlow(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full bg-transparent border-0 border-b border-slate-800 px-0 py-2 text-xl font-bold text-white focus:ring-0 focus:border-indigo-500 placeholder-slate-700 transition-colors"
                        placeholder="Name your routine"
                    />
                </div>
            </div>
            
            <div>
                 <input 
                    value={flow.description}
                    onChange={(e) => setFlow(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 placeholder-slate-600"
                    placeholder="Short description (optional)..."
                />
            </div>
            
            <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Color Theme</label>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {COLORS.map(color => (
                <button
                    key={color}
                    onClick={() => setFlow(prev => ({ ...prev, color }))}
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} transition-all flex-shrink-0 ${flow.color === color ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-950' : 'opacity-60 hover:opacity-100'}`}
                />
                ))}
            </div>
            </div>
        </div>

        {/* Steps */}
        <div>
            <div className="flex items-center justify-between mb-4">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Timeline</label>
                <div className="text-xs font-medium px-2 py-1 rounded bg-slate-800 text-indigo-300">
                    Total: {formatDuration(flow.totalDuration)}
                </div>
            </div>

            <div className="relative space-y-0">
                {/* Timeline Line */}
                <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-800 z-0"></div>

                {flow.steps.map((step, index) => (
                    <div 
                        key={step.id} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`relative z-10 flex gap-4 group transition-all duration-200 ${draggedStepIndex === index ? 'opacity-40 scale-[0.98]' : 'opacity-100'}`}
                    >
                        {/* Drag Handle & Indicator */}
                        <div className="mt-4 w-12 flex-shrink-0 flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing hover:scale-105 transition-transform">
                             <GripVertical size={16} className="text-slate-600 mb-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                             <div className="w-3 h-3 rounded-full bg-slate-700 border-2 border-slate-950 group-hover:bg-indigo-500 transition-colors"></div>
                        </div>
                        
                        <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl p-4 mb-3 group-hover:border-slate-700 transition-colors">
                            <div className="flex justify-between items-start gap-2 mb-2">
                                <input 
                                    value={step.title}
                                    onChange={(e) => updateStep(step.id, 'title', e.target.value)}
                                    className="flex-1 bg-transparent text-white font-medium focus:outline-none placeholder-slate-600"
                                    placeholder="Step Name"
                                    autoFocus={step.title === ''}
                                />
                                <button 
                                    onClick={() => removeStep(step.id)}
                                    className="text-slate-600 hover:text-red-400 p-1"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                            
                            <input 
                                value={step.description || ''}
                                onChange={(e) => updateStep(step.id, 'description', e.target.value)}
                                className="w-full bg-transparent text-xs text-slate-400 focus:outline-none placeholder-slate-700 mb-3"
                                placeholder="Instructions..."
                            />

                            <div className="flex items-center gap-2">
                                <div className="flex items-center bg-slate-950 rounded-lg px-2 py-1 border border-slate-800">
                                    <Clock size={12} className="text-indigo-400 mr-2" />
                                    <input 
                                        type="number"
                                        value={step.duration / 60}
                                        onChange={(e) => {
                                            const val = parseFloat(e.target.value);
                                            const seconds = isNaN(val) ? 0 : Math.round(val * 60);
                                            updateStep(step.id, 'duration', seconds);
                                        }}
                                        className="bg-transparent w-12 text-xs text-right text-white focus:outline-none"
                                        placeholder="5"
                                    />
                                    <span className="text-xs text-slate-500 ml-1">min</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button 
                onClick={addStep}
                className="w-full mt-4 py-4 border border-dashed border-slate-800 rounded-xl text-slate-500 flex items-center justify-center gap-2 hover:bg-slate-900/50 hover:border-slate-700 hover:text-indigo-400 transition-all font-medium text-sm"
            >
                <Plus size={16} /> Add New Step
            </button>
        </div>
      </div>
    </div>
  );
};

export default FlowEditor;