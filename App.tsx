import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ImageUpload from './components/ImageUpload';
import PlantCard from './components/PlantCard';
import ChatInterface from './components/ChatInterface';
import RemindersList from './components/RemindersList';
import { PlantDetails, Reminder } from './types';
import { identifyPlant } from './services/geminiService';
import { TreePine, Calendar, ArrowRight, Heart, BellRing, Trash2, Sprout, Sparkles, Share2 } from 'lucide-react';

type Route = 'home' | 'chat' | 'history' | 'reminders';
type Theme = 'light' | 'dark' | 'system';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Route>('home');
  const [currentPlant, setCurrentPlant] = useState<PlantDetails | null>(null);
  const [lastImage, setLastImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<PlantDetails[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  
  // Theme state initialized from localStorage with 'system' as default
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('leafy-theme') as Theme) || 'system';
  });

  // Handle route management via hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '') as Route;
      const validRoutes: Route[] = ['home', 'chat', 'history', 'reminders'];
      if (validRoutes.includes(hash)) {
        setActiveTab(hash);
      } else {
        setActiveTab('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Tri-state Theme Management Logic
  useEffect(() => {
    const root = window.document.documentElement;
    
    const applyTheme = () => {
      const isDark = 
        theme === 'dark' || 
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();
    localStorage.setItem('leafy-theme', theme);

    // If in system mode, listen for OS theme changes
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  const navigateTo = (route: Route) => {
    window.location.hash = `#/${route}`;
  };

  useEffect(() => {
    const savedHistory = localStorage.getItem('leafy-history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    
    const savedReminders = localStorage.getItem('leafy-reminders');
    if (savedReminders) setReminders(JSON.parse(savedReminders));
  }, []);

  useEffect(() => {
    localStorage.setItem('leafy-reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('leafy-history', JSON.stringify(history));
  }, [history]);

  const saveToHistory = (plant: PlantDetails, image?: string) => {
    const newEntry = { ...plant, imageUrl: image };
    setHistory(prev => [newEntry, ...prev].slice(0, 50));
  };

  const deleteFromHistory = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Remove this plant from your journal?")) {
      setHistory(prev => prev.filter(p => p.id !== id));
      if (currentPlant?.id === id) {
        setCurrentPlant(null);
        setLastImage(null);
      }
    }
  };

  const handleShare = async (e: React.MouseEvent, plant: PlantDetails) => {
    e.stopPropagation();
    
    const text = `I found a ${plant.commonName} (${plant.scientificName})! 🌿\n\n${plant.description}\n\nIdentified with Leafy AI.`;
    
    try {
      if (navigator.share) {
        const shareData: any = {
          title: `Leafy: ${plant.commonName}`,
          text: text
        };

        if (plant.imageUrl && navigator.canShare) {
          try {
            const response = await fetch(plant.imageUrl);
            const blob = await response.blob();
            const extension = blob.type.split('/')[1] || 'jpg';
            const file = new File([blob], `plant.${extension}`, { type: blob.type });
            const fileShareData = { ...shareData, files: [file] };
            
            if (navigator.canShare(fileShareData)) {
              await navigator.share(fileShareData);
              return;
            }
          } catch (err) {
            // Fallback to text only
          }
        }
        
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(text);
        alert("Plant summary copied to clipboard!");
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error("Share failed:", err);
      }
    }
  };

  const handleIdentification = async (base64: string) => {
    setIsLoading(true);
    setCurrentPlant(null);
    setLastImage(`data:image/jpeg;base64,${base64}`);

    try {
      const result = await identifyPlant(base64);
      setCurrentPlant(result);
      saveToHistory(result, `data:image/jpeg;base64,${base64}`);
    } catch (error) {
      console.error("Identification failed:", error);
      alert("Botany failure! I couldn't identify this plant. Make sure the photo is clear.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetReminder = (type: 'water' | 'fertilizer', interval: number) => {
    if (!currentPlant) return;
    
    const now = Date.now();
    const newReminder: Reminder = {
      id: Math.random().toString(36).substr(2, 9),
      plantId: currentPlant.id,
      plantName: currentPlant.commonName,
      type,
      intervalDays: interval,
      lastDone: now,
      nextDue: now + (interval * 24 * 60 * 60 * 1000),
      history: [now]
    };

    setReminders(prev => [...prev, newReminder]);
  };

  const completeReminder = (id: string) => {
    setReminders(prev => prev.map(r => {
      if (r.id === id) {
        const now = Date.now();
        const newHistory = [now, ...(r.history || [])].slice(0, 20);
        return {
          ...r,
          lastDone: now,
          nextDue: now + (r.intervalDays * 24 * 60 * 60 * 1000),
          history: newHistory
        };
      }
      return r;
    }));
  };

  const removeReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const updateInterval = (id: string, newInterval: number) => {
    setReminders(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          intervalDays: newInterval,
          nextDue: r.lastDone + (newInterval * 24 * 60 * 60 * 1000)
        };
      }
      return r;
    }));
  };

  const pendingRemindersCount = reminders.filter(r => r.nextDue < Date.now()).length;

  return (
    <div className="min-h-screen flex flex-col bg-stone-50/50 dark:bg-stone-950 transition-colors duration-300">
      <Header 
        activeTab={activeTab} 
        setActiveTab={navigateTo} 
        pendingCount={pendingRemindersCount}
        theme={theme}
        setTheme={setTheme}
      />

      <main className={`flex-1 max-w-5xl mx-auto w-full px-6 transition-all duration-500 ${activeTab === 'chat' ? 'py-4 sm:py-6' : 'py-12'}`}>
        {activeTab === 'home' && (
          <div className="space-y-20">
            {!currentPlant && !isLoading && (
              <section className="text-center space-y-6 animate-in fade-in slide-in-from-top-4 duration-1000">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm mb-4 border border-emerald-100 dark:border-emerald-800/50">
                  <Sparkles size={12} />
                  Next-Gen Botany
                </div>
                <h1 className="text-5xl sm:text-7xl font-serif font-bold text-stone-900 dark:text-stone-100 leading-[1.1]">Nurture Your Nature</h1>
                <p className="text-stone-500 dark:text-stone-400 text-xl max-w-xl mx-auto font-medium leading-relaxed">
                  Scan any plant for expert identity and care schedules tailored to your home environment.
                </p>
              </section>
            )}

            {!currentPlant && (
              <ImageUpload onImageCaptured={handleIdentification} isLoading={isLoading} />
            )}

            {currentPlant && (
              <div className="space-y-8">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">Botany Report</h2>
                    <p className="text-stone-500 dark:text-stone-400 font-medium">Results generated by Leafy AI Engine</p>
                  </div>
                  <button 
                    onClick={() => { setCurrentPlant(null); setLastImage(null); }}
                    className="group px-6 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-bold flex items-center gap-2 shadow-sm transition-all hover:shadow-md"
                  >
                    Analyze New <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                <PlantCard 
                  plant={currentPlant} 
                  image={lastImage || undefined}
                  onClose={() => setCurrentPlant(null)} 
                  onSetReminder={handleSetReminder}
                  activeReminders={reminders.filter(r => r.plantId === currentPlant.id)}
                />
              </div>
            )}

            {!currentPlant && !isLoading && history.length > 0 && (
              <section className="space-y-8 animate-in fade-in duration-1000 delay-300">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">Recent Discoveries</h2>
                    <p className="text-stone-500 dark:text-stone-400 text-sm">Your latest botanical encounters</p>
                  </div>
                  <button onClick={() => navigateTo('history')} className="text-emerald-600 dark:text-emerald-400 hover:underline text-sm font-black uppercase tracking-widest">See Full Journal</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  {history.slice(0, 4).map((item) => (
                    <div 
                      key={item.id} 
                      className="group cursor-pointer space-y-4"
                      onClick={() => { setCurrentPlant(item); setLastImage(item.imageUrl || null); }}
                    >
                      <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-white dark:bg-stone-900 shadow-sm border border-stone-100 dark:border-stone-800 group-hover:shadow-xl group-hover:shadow-emerald-500/10 transition-all duration-500">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.commonName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-200 dark:text-stone-700"><TreePine size={48} /></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors truncate">{item.commonName}</h3>
                        <p className="text-stone-400 dark:text-stone-500 text-xs font-bold uppercase tracking-widest truncate">{item.scientificName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {activeTab === 'reminders' && (
          <div className="space-y-12 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-serif font-bold text-stone-900 dark:text-stone-100">Care Center</h2>
                <p className="text-stone-500 dark:text-stone-400 text-lg">Personalized schedules for your indoor oasis.</p>
              </div>
              <div className="h-16 w-16 bg-rose-50 dark:bg-rose-900/20 rounded-[1.5rem] flex items-center justify-center text-rose-500 dark:text-rose-400 shadow-sm border border-rose-100 dark:border-rose-900/50">
                <BellRing size={32} />
              </div>
            </div>
            <RemindersList 
              reminders={reminders} 
              onComplete={completeReminder} 
              onRemove={removeReminder} 
              onUpdateInterval={updateInterval}
            />
          </div>
        )}

        {activeTab === 'chat' && <ChatInterface />}

        {activeTab === 'history' && (
          <div className="space-y-12 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-serif font-bold text-stone-900 dark:text-stone-100">Botanical Journal</h2>
                <p className="text-stone-500 dark:text-stone-400 text-lg">Your curated collection of {history.length} species.</p>
              </div>
              <div className="h-16 w-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-[1.5rem] flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-emerald-900/50">
                <Calendar size={32} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {history.map((item) => (
                <div 
                  key={item.id} 
                  className="group bg-white dark:bg-stone-900 p-6 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all cursor-pointer flex gap-6 relative overflow-hidden"
                  onClick={() => { setCurrentPlant(item); setLastImage(item.imageUrl || null); navigateTo('home'); }}
                >
                  <div className="h-32 w-32 shrink-0 rounded-3xl overflow-hidden bg-stone-50 dark:bg-stone-800 shadow-inner">
                    {item.imageUrl && <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-md">
                        <Sprout size={12} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Species Entry</span>
                    </div>
                    <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 truncate mb-1">{item.commonName}</h3>
                    <p className="text-stone-400 dark:text-stone-500 text-sm font-medium truncate italic">{item.scientificName}</p>
                    <div className="mt-3 flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-500">
                      <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                      <span className="h-1 w-1 bg-stone-300 dark:bg-stone-700 rounded-full" />
                      <span className="text-emerald-600 dark:text-emerald-400">View Report</span>
                    </div>
                  </div>
                  
                  <div className="absolute top-4 right-4 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 translate-y-0 sm:translate-y-2 sm:group-hover:translate-y-0">
                    <button 
                      onClick={(e) => handleShare(e, item)}
                      className="p-2.5 text-stone-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-2xl transition-all"
                      title="Share discovery"
                    >
                      <Share2 size={18} />
                    </button>
                    <button 
                      onClick={(e) => deleteFromHistory(e, item.id)}
                      className="p-2.5 text-stone-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-2xl transition-all"
                      title="Delete entry"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <div className="col-span-full py-32 text-center border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-[3rem] bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm animate-in fade-in zoom-in-95">
                   <div className="h-24 w-24 bg-stone-100/50 dark:bg-stone-800/50 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-300 dark:text-stone-600" title="No journal entries yet">
                      <Sprout size={48} strokeWidth={1} />
                   </div>
                   <h3 className="text-2xl font-serif font-bold text-stone-400 dark:text-stone-500 mb-2">Begin Your Collection</h3>
                   <p className="text-stone-400 dark:text-stone-600 font-medium max-w-sm mx-auto px-6">Snap a photo of your first plant to start your botanical legacy.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="mt-auto py-12 border-t border-stone-100 dark:border-stone-800 text-center bg-white/50 dark:bg-stone-900/50 backdrop-blur-md">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-stone-400 dark:text-stone-500 text-xs font-medium">
            <span>Leafy v2.5 — Made with</span>
            <Heart size={14} className="text-rose-400 fill-rose-400 animate-pulse" />
            <span>for botanical enthusiasts</span>
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-300 dark:text-stone-600">Empowering Gardeners Worldwide</p>
        </div>
      </footer>
    </div>
  );
};

export default App;