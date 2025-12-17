import React, { useState, useCallback, useMemo, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import { PlantDetails, Reminder } from './types';
import { identifyPlant } from './services/geminiService';
import { Heart } from 'lucide-react';
import useHistory from './hooks/useHistory';
import useReminders from './hooks/useReminders';
import { useTheme } from './hooks/useTheme';
const Home = lazy(() => import('./pages/Home'));
const HistoryPage = lazy(() => import('./pages/History'));
const RemindersPage = lazy(() => import('./pages/Reminders'));
const NotFoundView = lazy(() => import('./pages/NotFoundView'));
const ChatInterface = lazy(() => import('./components/ChatInterface'));
import { sharePlant } from './utils/share';
import Loading from './components/Loading';

const App: React.FC = () => {
  const [currentPlant, setCurrentPlant] = useState<PlantDetails | null>(null);
  const [lastImage, setLastImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { history, addEntry, removeEntry } = useHistory();
  const { reminders, addReminder, completeReminder, removeReminder, updateInterval, pendingCount } = useReminders();
  const [theme, setTheme] = useTheme();

  // Theme and localStorage persistence are handled by hooks.

  const saveToHistory = useCallback((plant: PlantDetails, image?: string) => {
    const newEntry = { ...plant, imageUrl: image } as PlantDetails;
    addEntry(newEntry);
  }, [addEntry]);

  const deleteFromHistory = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Remove this plant from your journal?")) {
      removeEntry(id);
      if (currentPlant?.id === id) {
        setCurrentPlant(null);
        setLastImage(null);
      }
    }
  }, [removeEntry, currentPlant]);

  const handleShare = useCallback(async (e: React.MouseEvent, plant: PlantDetails) => {
    e.stopPropagation();
    try {
      const res = await sharePlant(plant);
      if (res && (res as any).copied) {
        alert('Plant summary copied to clipboard!');
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') console.error('Share failed:', err);
    }
  }, []);

  const handleIdentification = useCallback(async (base64: string) => {
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
  }, [saveToHistory]);

  const handleSetReminder = useCallback((type: 'water' | 'fertilizer', interval: number) => {
    if (!currentPlant) return;
    const now = Date.now();
    const id = (globalThis.crypto && (globalThis.crypto as any).randomUUID)
      ? (globalThis.crypto as any).randomUUID()
      : Math.random().toString(36).slice(2, 11);

    const newReminder: Reminder = {
      id,
      plantId: currentPlant.id,
      plantName: currentPlant.commonName,
      type,
      intervalDays: interval,
      lastDone: now,
      nextDue: now + (interval * 24 * 60 * 60 * 1000),
      history: [now]
    };
    addReminder(newReminder);
  }, [currentPlant, addReminder]);

  const pendingRemindersCount = useMemo(() => pendingCount, [pendingCount]);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50/50 dark:bg-stone-950 transition-colors duration-300">
      <Header 
        pendingCount={pendingRemindersCount}
        theme={theme}
        setTheme={setTheme}
      />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
        <Suspense fallback={<Loading />}>
          <Routes>
          <Route path="/" element={
            <Home
              currentPlant={currentPlant}
              isLoading={isLoading}
              history={history}
              lastImage={lastImage}
              onIdentify={handleIdentification}
              setCurrentPlant={setCurrentPlant}
              setLastImage={setLastImage}
              onSetReminder={handleSetReminder}
              reminders={reminders}
            />
          } />

          <Route path="/reminders" element={<RemindersPage reminders={reminders} onComplete={completeReminder} onRemove={removeReminder} onUpdateInterval={updateInterval} />} />

          <Route path="/chat" element={<ChatInterface />} />

          <Route path="/history" element={<HistoryPage history={history} setCurrentPlant={setCurrentPlant} setLastImage={setLastImage} onShare={handleShare} onDelete={deleteFromHistory} />} />

          {/* Catch-all 404 Route */}
          <Route path="*" element={<NotFoundView />} />
          </Routes>
        </Suspense>
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