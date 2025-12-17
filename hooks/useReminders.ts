import { useCallback } from 'react';
import useLocalStorage from './useLocalStorage';
import { Reminder } from '../types';

export function useReminders() {
  const [reminders, setReminders] = useLocalStorage<Reminder[]>('leafy-reminders', []);

  const addReminder = useCallback((reminder: Reminder) => {
    setReminders(prev => [...prev, reminder]);
  }, [setReminders]);

  const completeReminder = useCallback((id: string) => {
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
  }, [setReminders]);

  const removeReminder = useCallback((id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  }, [setReminders]);

  const updateInterval = useCallback((id: string, newInterval: number) => {
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
  }, [setReminders]);

  const pendingCount = (reminders || []).filter(r => r.nextDue < Date.now()).length;

  return {
    reminders,
    addReminder,
    completeReminder,
    removeReminder,
    updateInterval,
    pendingCount,
  } as const;
}

export default useReminders;
