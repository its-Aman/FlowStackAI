import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, SkipForward, Check, X, RotateCcw, Volume2, VolumeX, Plus, ArrowRight, Clock } from 'lucide-react';
import { Flow } from '../types';

interface FlowPlayerProps {
  flows: Flow[];
}

const FlowPlayer: React.FC<FlowPlayerProps> = ({ flows }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const flow = flows.find(f => f.id === id);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false); // New state for "Up Next" transition
  const [isCompleted, setIsCompleted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize
  useEffect(() => {
    if (flow && flow.steps && flow.steps.length > 0) {
      const step = flow.steps[currentStepIndex] || flow.steps[0];
      if (step) {
          setTimeLeft(step.duration);
      }
    }
  }, [flow]);

  // Timer Loop
  useEffect(() => {
    let interval: number | undefined;

    if (isActive && timeLeft > 0 && !isTransitioning) {
      interval = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive && !isTransitioning) {
      finishStep();
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, isTransitioning]);

  const playBeep = () => {
    if (!soundEnabled) return;
    try {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') ctx.resume();
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
        console.error("Audio play failed", e);
    }
  };

  const finishStep = () => {
      playBeep();
      setIsActive(false);
      
      if (flow && currentStepIndex < flow.steps.length - 1) {
          setIsTransitioning(true); // Show Transition Screen
      } else {
          setIsCompleted(true);
      }
  };

  const startNextStep = () => {
      setIsTransitioning(false);
      if (flow && currentStepIndex < flow.steps.length - 1) {
        const nextIndex = currentStepIndex + 1;
        setCurrentStepIndex(nextIndex);
        if (flow.steps[nextIndex]) {
            setTimeLeft(flow.steps[nextIndex].duration);
            setIsActive(true); // Auto start next? PRD says "Auto start after N seconds" but manual for MVP is safer
        }
      }
  };

  const addTime = (seconds: number) => {
    setTimeLeft(prev => prev + seconds);
    setIsActive(true); // Resume if paused
  };

  const toggleTimer = () => setIsActive(!isActive);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (!flow || !flow.steps[currentStepIndex]) return 0;
    const currentDuration = flow.steps[currentStepIndex].duration;
    if (currentDuration === 0) return 0;
    return Math.max(0, ((currentDuration - timeLeft) / currentDuration) * 100);
  };

  // Guard Clauses
  if (!flow) return <div className="p-10 text-center text-slate-500">Flow not found</div>;
  if (!flow.steps || flow.steps.length === 0) return <div className="p-10 text-center text-slate-500">No steps</div>;

  const currentStep = flow.steps[currentStepIndex];
  if (!currentStep) return null;

  // -- TRANSITION VIEW --
  if (isTransitioning) {
      const nextStep = flow.steps[currentStepIndex + 1];
      return (
        <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-8 relative overflow-hidden">
             <div className={`absolute inset-0 bg-gradient-to-br ${flow.color} opacity-30 blur-3xl`}></div>
             
             <div className="z-10 w-full max-w-md space-y-8 animate-fade-in-up">
                 <div className="text-center">
                    <div className="inline-block p-3 rounded-full bg-green-500/20 text-green-400 mb-4">
                        <Check size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Step Complete!</h2>
                    <p className="text-slate-400">Nice work. Take a breath.</p>
                 </div>

                 <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-2xl">
                     <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Up Next</div>
                     <h3 className="text-2xl font-bold text-white mb-1">{nextStep.title}</h3>
                     <p className="text-slate-400 text-sm mb-4">{nextStep.description || 'Get ready to focus.'}</p>
                     <div className="flex items-center gap-2 text-indigo-400 text-sm font-medium">
                        <Clock size={16} /> {Math.floor(nextStep.duration / 60)} min
                     </div>
                 </div>

                 <button 
                    onClick={startNextStep}
                    className="w-full py-4 bg-white text-slate-950 rounded-2xl font-bold text-lg hover:bg-slate-200 transition-colors shadow-lg flex items-center justify-center gap-2"
                 >
                    Start Next Task <ArrowRight size={20} />
                 </button>
             </div>
        </div>
      );
  }

  // -- COMPLETED VIEW --
  if (isCompleted) {
    return (
      <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${flow.color} opacity-20`}></div>
        <div className="z-10 text-center space-y-8 animate-fade-in-up">
          <div className="w-24 h-24 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)]">
            <Check size={48} strokeWidth={4} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Flow Complete</h1>
            <p className="text-slate-400 font-medium">You crushed {flow.title}!</p>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="px-10 py-4 bg-white text-slate-900 rounded-2xl font-bold hover:bg-slate-200 transition-colors shadow-xl"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // -- ACTIVE PLAYER VIEW --
  return (
    <div className="h-screen w-full bg-slate-950 flex flex-col relative overflow-hidden">
        {/* Immersive Background */}
        <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${flow.color} transition-all duration-1000`}></div>
        
        {/* Header */}
        <div className="z-20 p-6 flex justify-between items-center bg-gradient-to-b from-slate-950/50 to-transparent">
            <button onClick={() => navigate('/')} className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                <X size={24} />
            </button>
            <div className="flex flex-col items-center">
                 <span className="text-[10px] font-bold tracking-widest uppercase text-white/30">Step {currentStepIndex + 1} / {flow.steps.length}</span>
            </div>
            <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
            </button>
        </div>

        {/* Main Display */}
        <div className="flex-1 z-10 flex flex-col items-center justify-center p-8 text-center relative">
            
            {/* Timer Circle */}
            <div className="relative mb-12">
                {/* Breathing glow effect when active */}
                <div className={`absolute inset-0 rounded-full transition-opacity duration-1000 ${isActive ? 'animate-breathe opacity-100' : 'opacity-0'}`}></div>
                
                <svg className="w-72 h-72 transform -rotate-90 drop-shadow-2xl">
                    <circle
                        cx="144"
                        cy="144"
                        r="136"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        className="text-slate-800"
                    />
                    <circle
                        cx="144"
                        cy="144"
                        r="136"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 136}
                        strokeDashoffset={2 * Math.PI * 136 * (1 - getProgress() / 100)}
                        className="text-white transition-all duration-1000 ease-linear"
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-7xl font-light text-white tabular-nums tracking-tighter font-mono">
                        {formatTime(timeLeft)}
                    </span>
                    <button 
                        onClick={() => addTime(60)}
                        className="mt-4 flex items-center gap-1 text-xs font-medium text-white/30 hover:text-white hover:bg-white/10 px-3 py-1 rounded-full transition-colors"
                    >
                        <Plus size={12} /> 1m
                    </button>
                </div>
            </div>

            <div className="space-y-3 max-w-sm mx-auto animate-fade-in">
                <h2 className="text-3xl font-bold text-white leading-tight">{currentStep.title}</h2>
                {currentStep.description && (
                     <p className="text-lg text-slate-400 font-light leading-relaxed">{currentStep.description}</p>
                )}
            </div>
        </div>

        {/* Bottom Controls */}
        <div className="z-20 pb-12 pt-6 px-8 flex items-center justify-center gap-10 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
             <button 
                onClick={() => {
                    setTimeLeft(currentStep.duration);
                    setIsActive(false);
                }}
                className="group p-4 rounded-full text-slate-500 hover:text-white hover:bg-white/10 transition-all"
                title="Restart Step"
            >
                <RotateCcw size={24} className="group-active:-rotate-180 transition-transform duration-500" />
            </button>

            <button 
                onClick={toggleTimer}
                className="w-20 h-20 rounded-3xl bg-white text-slate-950 flex items-center justify-center hover:scale-105 hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] active:scale-95 transition-all"
            >
                {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
            </button>

            <button 
                onClick={finishStep}
                className="p-4 rounded-full text-slate-500 hover:text-white hover:bg-white/10 transition-all"
                title="Finish Step Early"
            >
                <Check size={24} />
            </button>
        </div>
        
        {/* Up Next Pill */}
        {currentStepIndex < flow.steps.length - 1 && flow.steps[currentStepIndex + 1] && (
            <div className="absolute top-24 left-0 right-0 flex justify-center z-10 pointer-events-none">
                <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/50 rounded-full px-4 py-1.5 flex items-center gap-2">
                    <span className="text-[10px] uppercase text-slate-500 font-bold">Next</span>
                    <span className="text-xs text-slate-300 font-medium truncate max-w-[150px]">{flow.steps[currentStepIndex + 1].title}</span>
                </div>
            </div>
        )}
    </div>
  );
};

export default FlowPlayer;