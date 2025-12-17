import React from 'react';
import { BellRing } from 'lucide-react';
import RemindersList from '../components/RemindersList';
import { Reminder } from '../types';

interface Props {
  reminders: Reminder[];
  onComplete: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdateInterval: (id: string, interval: number) => void;
}

const RemindersPage: React.FC<Props> = ({ reminders, onComplete, onRemove, onUpdateInterval }) => {
  return (
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
        onComplete={onComplete} 
        onRemove={onRemove} 
        onUpdateInterval={onUpdateInterval}
      />
    </div>
  );
};

export default RemindersPage;
