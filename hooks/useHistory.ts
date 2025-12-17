import { useCallback } from 'react';
import useLocalStorage from './useLocalStorage';
import { PlantDetails } from '../types';

export function useHistory() {
  const [history, setHistory] = useLocalStorage<PlantDetails[]>('leafy-history', []);

  const addEntry = useCallback((entry: PlantDetails) => {
    setHistory(prev => [entry, ...prev].slice(0, 50));
  }, [setHistory]);

  const removeEntry = useCallback((id: string) => {
    setHistory(prev => prev.filter(p => p.id !== id));
  }, [setHistory]);

  const clearHistory = useCallback(() => setHistory([]), [setHistory]);

  return {
    history,
    addEntry,
    removeEntry,
    clearHistory,
  } as const;
}

export default useHistory;
