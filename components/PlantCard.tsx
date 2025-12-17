
import React, { useState, useEffect } from 'react';
import { Droplets, Sun, Thermometer, Sprout, ShieldAlert, Sparkles, Wind, Bell, Check, Zap, Loader2, Info, AlertTriangle } from 'lucide-react';
import { PlantDetails, Reminder } from '../types';
import { generatePlantImage, generateObjectImage } from '../services/geminiService';

interface PlantCardProps {
  plant: PlantDetails;
  image?: string;
  onClose?: () => void;
  onSetReminder?: (type: 'water' | 'fertilizer', interval: number) => void;
  activeReminders?: Reminder[];
}

const PlantCard: React.FC<PlantCardProps> = ({ plant, image, onClose, onSetReminder, activeReminders = [] }) => {
  const hasWaterReminder = activeReminders.some(r => r.type === 'water');
  const hasFertilizeReminder = activeReminders.some(r => r.type === 'fertilizer');
  
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Default to true for backward compatibility with old history items that lack the flag
  const isRealPlant = plant.isPlant !== false;

  useEffect(() => {
    // If a real image is provided, we don't need to generate one.
    if (image) {
      setGeneratedImage(null);
      setIsGenerating(false);
      return;
    }

    let active = true;
    setIsGenerating(true);
    setGeneratedImage(null);

    const generatorPromise = isRealPlant 
      ? generatePlantImage(plant.commonName, plant.description)
      : generateObjectImage(plant.commonName);

    generatorPromise
      .then((url) => {
        if (active && url) {
          setGeneratedImage(url);
        }
      })
      .finally(() => {
        if (active) setIsGenerating(false);
      });

    return () => {
      active = false;
    };
  }, [plant.id, image, plant.commonName, plant.description, isRealPlant]);

  const displayImage = image || generatedImage;

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-stone-900 rounded-[2rem] shadow-2xl overflow-hidden border border-stone-100 dark:border-stone-800 animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors">
      {/* Hero Section */}
      <div className="relative h-72 sm:h-96 overflow-hidden">
        {displayImage ? (
          <img 
            src={displayImage} 
            alt={plant.commonName} 
            className="w-full h-full object-cover animate-in fade-in duration-700" 
          />
        ) : (
          <div className={`w-full h-full flex flex-col items-center justify-center relative transition-colors ${isRealPlant ? 'bg-emerald-100 dark:bg-emerald-900/20' : 'bg-stone-100 dark:bg-stone-800'}`}>
            {isRealPlant ? (
              <>
                <Sprout size={80} className={`text-emerald-300 dark:text-emerald-700 ${isGenerating ? 'animate-pulse' : ''}`} />
                {isGenerating && (
                  <div className="absolute bottom-6 flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-stone-900/50 backdrop-blur-md rounded-full text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-widest shadow-sm animate-in fade-in slide-in-from-bottom-2">
                     <Loader2 size={14} className="animate-spin" />
                     Generating AI Preview
                  </div>
                )}
              </>
            ) : (
              <>
                <Info size={80} className={`text-stone-300 dark:text-stone-600 ${isGenerating ? 'animate-pulse' : ''}`} />
                {isGenerating && (
                  <div className="absolute bottom-6 flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-stone-900/50 backdrop-blur-md rounded-full text-stone-600 dark:text-stone-400 text-xs font-bold uppercase tracking-widest shadow-sm animate-in fade-in slide-in-from-bottom-2">
                     <Loader2 size={14} className="animate-spin" />
                     Generating Object Preview
                  </div>
                )}
              </>
            )}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="absolute bottom-8 left-8 right-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${isRealPlant ? 'bg-emerald-500' : 'bg-stone-500'}`}>
              {isRealPlant ? 'Identified Species' : 'Object Detected'}
            </span>
            {isRealPlant && <span className="text-emerald-200/90 text-sm italic font-medium tracking-wide">{plant.scientificName}</span>}
          </div>
          <h2 className="text-4xl sm:text-5xl font-serif font-bold leading-tight drop-shadow-lg">{plant.commonName}</h2>
        </div>

        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2.5 bg-white/10 backdrop-blur-xl rounded-full text-white hover:bg-white/30 transition-all border border-white/20"
          >
            <ShieldAlert size={24} className="rotate-45" />
          </button>
        )}
      </div>

      <div className="p-8 sm:p-10 space-y-12">
        {/* Description & Overview */}
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-emerald-500 rounded-full opacity-20" />
          <h3 className="flex items-center gap-2 text-xl font-bold text-stone-900 dark:text-stone-100 mb-4">
            <Sparkles size={24} className="text-emerald-500" />
            {isRealPlant ? "Botanist's Overview" : "Analysis"}
          </h3>
          <p className="text-stone-600 dark:text-stone-300 leading-relaxed text-lg italic pl-2">
            "{plant.description}"
          </p>
        </div>

        {!isRealPlant && (
          <div className="bg-stone-50 dark:bg-stone-800/50 rounded-[1.5rem] p-8 text-center border border-stone-200 dark:border-stone-700">
            <div className="mx-auto w-16 h-16 bg-white dark:bg-stone-800 rounded-full flex items-center justify-center text-stone-400 dark:text-stone-500 mb-4 shadow-sm">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-2">Care Schedule Unavailable</h3>
            <p className="text-stone-500 dark:text-stone-400 max-w-md mx-auto text-sm leading-relaxed">
              Leafy detected that this is likely not a living plant. Water tracking, fertilization schedules, and health diagnostics are disabled for non-botanical items.
            </p>
          </div>
        )}

        {isRealPlant && (
          <>
            {/* Schedule Care Dashboard */}
            <div className="bg-stone-50 dark:bg-stone-800/50 rounded-[1.5rem] p-6 border border-stone-100 dark:border-stone-800 shadow-inner">
              <div className="flex items-center justify-between mb-6">
                <h3 className="flex items-center gap-2 text-xs font-black text-stone-400 dark:text-stone-500 uppercase tracking-[0.2em]">
                  <Bell size={16} className="text-emerald-500" />
                  Smart Care Scheduler
                </h3>
                <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 bg-white dark:bg-stone-800 px-2 py-1 rounded border border-stone-200 dark:border-stone-700 uppercase">AI Recommended</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={() => onSetReminder?.('water', plant.care.suggestedWaterDays)}
                  disabled={hasWaterReminder}
                  className={`group flex items-center justify-between px-6 py-4 rounded-2xl font-bold transition-all ${
                    hasWaterReminder 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/30 cursor-default' 
                    : 'bg-white dark:bg-stone-800 text-blue-600 dark:text-blue-400 border-2 border-blue-100 dark:border-blue-900/30 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {hasWaterReminder ? <Check size={20} /> : <Droplets size={20} className="group-hover:animate-bounce" />}
                    <div className="text-left">
                      <div className="text-[10px] uppercase opacity-60">Hydration</div>
                      <div className="text-sm">{hasWaterReminder ? 'Water Tracking On' : `Every ${plant.care.suggestedWaterDays} Days`}</div>
                    </div>
                  </div>
                  {!hasWaterReminder && <Zap size={16} className="text-blue-300 dark:text-blue-500/50" />}
                </button>

                <button 
                  onClick={() => onSetReminder?.('fertilizer', plant.care.suggestedFertilizeDays)}
                  disabled={hasFertilizeReminder}
                  className={`group flex items-center justify-between px-6 py-4 rounded-2xl font-bold transition-all ${
                    hasFertilizeReminder 
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30 cursor-default' 
                    : 'bg-white dark:bg-stone-800 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {hasFertilizeReminder ? <Check size={20} /> : <Sprout size={20} className="group-hover:scale-125 transition-transform" />}
                    <div className="text-left">
                      <div className="text-[10px] uppercase opacity-60">Nutrition</div>
                      <div className="text-sm">{hasFertilizeReminder ? 'Feeding Set' : `Every ${plant.care.suggestedFertilizeDays} Days`}</div>
                    </div>
                  </div>
                  {!hasFertilizeReminder && <Zap size={16} className="text-emerald-300 dark:text-emerald-500/50" />}
                </button>
              </div>
            </div>

            {/* Care Matrix */}
            <div className="space-y-6">
               <h3 className="text-xs font-black text-stone-400 dark:text-stone-500 uppercase tracking-[0.2em] mb-4">Detailed Care Matrix</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Water Card */}
                <div className="group relative bg-blue-50/30 dark:bg-blue-900/10 rounded-3xl p-6 border border-blue-100/50 dark:border-blue-900/20 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors overflow-hidden">
                  <div className="absolute -right-4 -top-4 text-blue-100 dark:text-blue-900/40 group-hover:text-blue-200 dark:group-hover:text-blue-900/60 transition-colors">
                    <Droplets size={120} />
                  </div>
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shadow-sm">
                        <Droplets size={24} />
                      </div>
                      <h4 className="font-black text-blue-900 dark:text-blue-100 text-sm uppercase tracking-widest">Hydration</h4>
                    </div>
                    <p className="text-stone-700 dark:text-stone-300 text-sm leading-relaxed font-medium">{plant.care.water}</p>
                  </div>
                </div>

                {/* Light Card */}
                <div className="group relative bg-amber-50/30 dark:bg-amber-900/10 rounded-3xl p-6 border border-amber-100/50 dark:border-amber-900/20 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors overflow-hidden">
                  <div className="absolute -right-4 -top-4 text-amber-100 dark:text-amber-900/40 group-hover:text-amber-200 dark:group-hover:text-amber-900/60 transition-colors">
                    <Sun size={120} />
                  </div>
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center shadow-sm">
                        <Sun size={24} />
                      </div>
                      <h4 className="font-black text-amber-900 dark:text-amber-100 text-sm uppercase tracking-widest">Luminosity</h4>
                    </div>
                    <p className="text-stone-700 dark:text-stone-300 text-sm leading-relaxed font-medium">{plant.care.light}</p>
                  </div>
                </div>

                {/* Temperature Card */}
                <div className="group relative bg-rose-50/30 dark:bg-rose-900/10 rounded-3xl p-6 border border-rose-100/50 dark:border-rose-900/20 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors overflow-hidden">
                  <div className="absolute -right-4 -top-4 text-rose-100 dark:text-rose-900/40 group-hover:text-rose-200 dark:group-hover:text-rose-900/60 transition-colors">
                    <Thermometer size={120} />
                  </div>
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center shadow-sm">
                        <Thermometer size={24} />
                      </div>
                      <h4 className="font-black text-rose-900 dark:text-rose-100 text-sm uppercase tracking-widest">Climate</h4>
                    </div>
                    <p className="text-stone-700 dark:text-stone-300 text-sm leading-relaxed font-medium">{plant.care.temperature}</p>
                  </div>
                </div>

                {/* Soil/Fertilizer Card */}
                <div className="group relative bg-emerald-50/30 dark:bg-emerald-900/10 rounded-3xl p-6 border border-emerald-100/50 dark:border-emerald-900/20 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors overflow-hidden">
                  <div className="absolute -right-4 -top-4 text-emerald-100 dark:text-emerald-900/40 group-hover:text-emerald-200 dark:group-hover:text-emerald-900/60 transition-colors">
                    <Wind size={120} />
                  </div>
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shadow-sm">
                        <Wind size={24} />
                      </div>
                      <h4 className="font-black text-emerald-900 dark:text-emerald-100 text-sm uppercase tracking-widest">Environment</h4>
                    </div>
                    <p className="text-stone-700 dark:text-stone-300 text-sm leading-relaxed font-medium">{plant.care.soil}</p>
                  </div>
                </div>

              </div>
            </div>

            {plant.healthStatus && (
              <div className="bg-stone-900 dark:bg-black text-white rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                  <ShieldAlert size={120} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-emerald-500 rounded-lg">
                      <ShieldAlert size={20} className="text-white" />
                    </div>
                    <h4 className="font-black uppercase tracking-[0.2em] text-xs text-emerald-400">Professional Health Check</h4>
                  </div>
                  <p className="text-stone-300 leading-relaxed text-lg font-medium italic">
                    {plant.healthStatus}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PlantCard;
