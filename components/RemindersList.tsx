
import React, { useState, useMemo } from 'react';
import { Reminder } from '../types';
import { 
  Droplets, Sprout, CheckCircle2, AlertCircle, Clock, Sparkles, 
  Check, SortAsc, CalendarDays, Trash2, X, Edit2, Save, 
  LayoutGrid, ListFilter, AlertTriangle, Calendar, History, ChevronDown
} from 'lucide-react';

interface RemindersListProps {
  reminders: Reminder[];
  onComplete: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdateInterval: (id: string, newInterval: number) => void;
}

interface TaskGroup {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  earliestDue: number;
  sections: {
    type: 'water' | 'fertilizer';
    label: string;
    icon: React.ReactNode;
    color: string;
    tasks: Reminder[];
  }[];
}

type SortMode = 'name' | 'urgency';
type GroupMode = 'plant' | 'type';

const RemindersList: React.FC<RemindersListProps> = ({ reminders, onComplete, onRemove, onUpdateInterval }) => {
  const now = Date.now();
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('urgency');
  const [groupMode, setGroupMode] = useState<GroupMode>('plant');
  const [deletingReminder, setDeletingReminder] = useState<Reminder | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [saveSuccessId, setSaveSuccessId] = useState<string | null>(null);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);

  const handleCompleteWithAnimation = (id: string) => {
    setCompletingId(id);
    setTimeout(() => {
      onComplete(id);
      setCompletingId(null);
    }, 1000);
  };

  const startEditing = (reminder: Reminder) => {
    setEditingId(reminder.id);
    setEditValue(reminder.intervalDays.toString());
    setSaveSuccessId(null);
  };

  const saveEdit = (id: string) => {
    const val = parseInt(editValue);
    if (!isNaN(val) && val > 0) {
      onUpdateInterval(id, val);
      setSaveSuccessId(id);
      setTimeout(() => {
        setSaveSuccessId(null);
        setEditingId(null);
      }, 800);
    }
  };

  const toggleHistory = (id: string) => {
    setExpandedHistoryId(prev => prev === id ? null : id);
  };

  const displayGroups = useMemo(() => {
    if (groupMode === 'plant') {
      const groupsMap = reminders.reduce((acc, reminder) => {
        if (!acc[reminder.plantId]) {
          acc[reminder.plantId] = {
            id: reminder.plantId,
            title: reminder.plantName,
            icon: <Sprout size={18} />,
            accentColor: 'bg-emerald-600 dark:bg-emerald-500',
            accentBg: 'bg-emerald-50/50 dark:bg-emerald-900/20',
            accentBorder: 'border-emerald-100 dark:border-emerald-800/30',
            earliestDue: Infinity,
            sections: [
              { type: 'water', label: 'Hydration Schedule', icon: <Droplets size={14} />, color: 'text-blue-400 dark:text-blue-300', tasks: [] },
              { type: 'fertilizer', label: 'Nutrition Schedule', icon: <Sprout size={14} />, color: 'text-emerald-400 dark:text-emerald-300', tasks: [] }
            ]
          };
        }
        
        const sectionIdx = reminder.type === 'water' ? 0 : 1;
        acc[reminder.plantId].sections[sectionIdx].tasks.push(reminder);

        if (reminder.nextDue < acc[reminder.plantId].earliestDue) {
          acc[reminder.plantId].earliestDue = reminder.nextDue;
        }
        
        return acc;
      }, {} as Record<string, TaskGroup>);

      return Object.values(groupsMap).sort((a: TaskGroup, b: TaskGroup) => {
        if (sortMode === 'name') return a.title.localeCompare(b.title);
        return a.earliestDue - b.earliestDue;
      });
    } else {
      const waterTasks = reminders.filter(r => r.type === 'water');
      const fertilizerTasks = reminders.filter(r => r.type === 'fertilizer');

      const groups: TaskGroup[] = [];

      if (waterTasks.length > 0) {
        groups.push({
          id: 'group-water',
          title: 'Hydration Queue',
          subtitle: `${waterTasks.length} plants waiting for water`,
          icon: <Droplets size={18} />,
          accentColor: 'bg-blue-600 dark:bg-blue-500',
          accentBg: 'bg-blue-50/50 dark:bg-blue-900/20',
          accentBorder: 'border-blue-100 dark:border-blue-800/30',
          earliestDue: Math.min(...waterTasks.map(r => r.nextDue)),
          sections: [
            { type: 'water', label: 'All Waterings', icon: <Droplets size={14} />, color: 'text-blue-400 dark:text-blue-300', tasks: waterTasks }
          ]
        });
      }

      if (fertilizerTasks.length > 0) {
        groups.push({
          id: 'group-fertilizer',
          title: 'Nutrition Queue',
          subtitle: `${fertilizerTasks.length} plants waiting for fertilizer`,
          icon: <Sprout size={18} />,
          accentColor: 'bg-emerald-600 dark:bg-emerald-500',
          accentBg: 'bg-emerald-50/50 dark:bg-emerald-900/20',
          accentBorder: 'border-emerald-100 dark:border-emerald-800/30',
          earliestDue: Math.min(...fertilizerTasks.map(r => r.nextDue)),
          sections: [
            { type: 'fertilizer', label: 'All Feedings', icon: <Sprout size={14} />, color: 'text-emerald-400 dark:text-emerald-300', tasks: fertilizerTasks }
          ]
        });
      }

      return groups.sort((a, b) => {
        if (sortMode === 'name') return a.title.localeCompare(b.title);
        return a.earliestDue - b.earliestDue;
      });
    }
  }, [reminders, sortMode, groupMode]);

  if (reminders.length === 0) {
    return (
      <div className="py-32 text-center border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-[3rem] bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm animate-in fade-in zoom-in-95">
        <div className="h-24 w-24 bg-stone-100/50 dark:bg-stone-800/50 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-300 dark:text-stone-600" title="No tasks pending">
          <Clock size={48} strokeWidth={1} />
        </div>
        <h3 className="text-2xl font-serif font-bold text-stone-400 dark:text-stone-500 mb-2">Your Garden is Self-Sufficient</h3>
        <p className="text-stone-400 dark:text-stone-600 font-medium max-w-sm mx-auto px-6">Identify a plant and set a reminder to see your care schedule here.</p>
      </div>
    );
  }

  const renderTask = (reminder: Reminder) => {
    const totalInterval = reminder.intervalDays * 24 * 60 * 60 * 1000;
    const timeElapsed = now - reminder.lastDone;
    const progress = Math.min(100, Math.max(0, (timeElapsed / totalInterval) * 100));
    const isOverdue = now >= reminder.nextDue;
    
    const getDaysDiff = (targetDate: number) => {
      const d1 = new Date();
      d1.setHours(0, 0, 0, 0);
      const d2 = new Date(targetDate);
      d2.setHours(0, 0, 0, 0);
      return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    };

    const daysDiff = getDaysDiff(reminder.nextDue);
    const isCompleting = completingId === reminder.id;
    const isEditing = editingId === reminder.id;
    const isHistoryExpanded = expandedHistoryId === reminder.id;

    const confettiColors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

    const getDueStatusLabel = () => {
      if (isCompleting) return 'Well Done!';
      if (daysDiff < 0) return `Overdue by ${Math.abs(daysDiff)} ${Math.abs(daysDiff) === 1 ? 'day' : 'days'}`;
      if (daysDiff === 0) return 'Due Today';
      if (daysDiff === 1) return 'Due Tomorrow';
      return `Due in ${daysDiff} days`;
    };

    const nextDueDateStr = new Date(reminder.nextDue).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });

    const historyDates = reminder.history ? [...reminder.history].sort((a, b) => b - a) : [reminder.lastDone];

    return (
      <div 
        key={reminder.id} 
        className={`relative px-6 py-6 transition-all duration-700 ${
          isCompleting ? 'bg-emerald-50/70 dark:bg-emerald-900/40 scale-[1.01] shadow-lg shadow-emerald-500/5' : 
          isOverdue ? 'bg-rose-50/30 dark:bg-rose-900/10' : 
          'hover:bg-stone-50/30 dark:hover:bg-stone-800/30'
        }`}
      >
        <div className="flex gap-4 relative">
          {/* Overdue Indicator Strip */}
          {isOverdue && !isCompleting && (
            <div className="absolute -left-6 top-0 bottom-0 w-1.5 bg-rose-500 shadow-[2px_0_8px_rgba(244,63,94,0.4)]" />
          )}

          {/* Action Icon with Celebratory Confetti */}
          <div className={`relative h-16 w-16 rounded-[1.25rem] flex items-center justify-center shrink-0 transition-all duration-500 ${
            isCompleting ? 'bg-emerald-500 text-white shadow-lg ring-4 ring-emerald-500/20 animate-glow' : 
            isOverdue ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50 ring-4 ring-rose-50/50 dark:ring-rose-900/20' :
            reminder.type === 'water' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30'
          }`}>
            {isCompleting ? (
              <>
                <Check size={32} className="animate-check-pop z-10" />
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute h-2 w-2 rounded-full animate-confetti"
                    style={{
                      backgroundColor: confettiColors[i % confettiColors.length],
                      '--tx': `${(Math.random() - 0.5) * 160}px`,
                      '--ty': `${(Math.random() - 0.5) * 160}px`,
                      animationDelay: `${Math.random() * 0.2}s`
                    } as React.CSSProperties}
                  />
                ))}
              </>
            ) : isOverdue ? (
              <AlertTriangle size={28} className="animate-pulse" />
            ) : (
              reminder.type === 'water' ? <Droplets size={28} /> : <Sprout size={28} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-3">
              <div className="flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${isCompleting ? 'text-emerald-600' : 'text-stone-400 dark:text-stone-500'}`}>
                    {isCompleting ? 'Botanist approved' : (groupMode === 'type' ? reminder.plantName : 'Care Cycle')}
                  </span>
                  {!isCompleting && !isEditing && (
                    <>
                      <button 
                        onClick={() => startEditing(reminder)}
                        className="p-1 text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        title="Adjust care frequency (days)"
                      >
                        <Edit2 size={10} />
                      </button>
                      <button 
                        onClick={() => toggleHistory(reminder.id)}
                        className={`p-1 transition-colors flex items-center gap-1 ${isHistoryExpanded ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400'}`}
                        title="View care history"
                      >
                        <History size={10} />
                      </button>
                    </>
                  )}
                </div>

                {isEditing ? (
                  <div className="flex items-center gap-1.5 animate-in slide-in-from-left-2 mt-1">
                    <span className="text-sm font-bold text-stone-500">Every</span>
                    <input 
                      type="number" 
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-14 px-2 py-1 border-2 border-emerald-200 dark:border-emerald-800 rounded-lg text-sm font-bold text-emerald-700 dark:text-emerald-400 outline-none focus:border-emerald-500 bg-white dark:bg-stone-800"
                      autoFocus
                      disabled={saveSuccessId === reminder.id}
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit(reminder.id)}
                    />
                    <span className="text-sm font-bold text-stone-500">days</span>
                    <button 
                      onClick={() => saveEdit(reminder.id)} 
                      className={`p-1.5 rounded-lg transition-all ${saveSuccessId === reminder.id ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'}`}
                      disabled={saveSuccessId === reminder.id}
                      title="Save new interval"
                    >
                      {saveSuccessId === reminder.id ? <Check size={18} className="animate-check-pop" /> : <Save size={18} />}
                    </button>
                    {saveSuccessId !== reminder.id && (
                      <button 
                        onClick={() => setEditingId(null)} 
                        className="p-1.5 text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-lg"
                        title="Discard changes"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-black transition-all duration-500 shadow-sm border ${
                      isCompleting ? 'bg-emerald-500 text-white border-emerald-600' :
                      isOverdue ? 'bg-rose-600 text-white border-rose-700 animate-pulse' :
                      daysDiff === 0 ? 'bg-amber-400 text-white border-amber-500' :
                      daysDiff === 1 ? 'bg-blue-500 text-white border-blue-600' :
                      'bg-stone-800 dark:bg-stone-700 text-white border-stone-900 dark:border-stone-600'
                    }`}>
                      {isOverdue ? <AlertCircle size={16} /> : <Calendar size={16} />}
                      {getDueStatusLabel()}
                    </div>
                    {!isCompleting && (
                      <div className="flex items-center gap-2 text-stone-400 dark:text-stone-500 text-xs font-bold">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          Scheduled for {nextDueDateStr}
                        </span>
                        <span className="h-1 w-1 bg-stone-300 dark:bg-stone-700 rounded-full" />
                        <span className="italic">Every {reminder.intervalDays}d</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="text-right">
                <span className={`text-[10px] font-black uppercase tracking-tighter transition-colors duration-500 ${isCompleting ? 'text-emerald-500' : progress > 85 ? 'text-rose-500 font-black' : 'text-stone-400 dark:text-stone-600'}`}>
                   {isCompleting ? 'Growth: 100%' : `Cycle: ${Math.round(progress)}%`}
                </span>
              </div>
            </div>

            <div className="relative w-full h-3 bg-stone-100 dark:bg-stone-800 rounded-full mb-6 mt-2 shadow-inner">
              <div 
                className={`absolute top-0 left-0 h-full transition-all duration-[1000ms] rounded-full ${
                  isCompleting ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/50' :
                  isOverdue ? 'bg-gradient-to-r from-rose-500 to-rose-700' : 
                  reminder.type === 'water' ? 'bg-gradient-to-r from-blue-400 to-blue-600' : 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                }`}
                style={{ width: isCompleting ? '100%' : `${progress}%` }}
              />
              {!isCompleting && (
                <div 
                  className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-[1000ms] flex items-center justify-center h-6 w-6 rounded-full bg-white dark:bg-stone-800 shadow-lg border-2 ${
                    isOverdue ? 'border-rose-500 text-rose-500' : reminder.type === 'water' ? 'border-blue-500 text-blue-500' : 'border-emerald-500 text-emerald-500'
                  }`}
                  style={{ left: `${progress}%` }}
                >
                  {reminder.type === 'water' ? <Droplets size={12} /> : <Sprout size={12} />}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => handleCompleteWithAnimation(reminder.id)}
                disabled={isCompleting || isEditing}
                title="Mark this specific task as finished"
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm transition-all duration-500 overflow-hidden ${
                  isCompleting 
                    ? 'bg-emerald-500 text-white cursor-default scale-95 opacity-90' 
                    : isOverdue 
                      ? 'bg-stone-900 dark:bg-stone-700 text-white hover:bg-black dark:hover:bg-stone-600 shadow-xl shadow-stone-200 dark:shadow-stone-900/50 hover:-translate-y-0.5' 
                      : 'bg-stone-900 dark:bg-stone-700 text-white hover:bg-stone-800 dark:hover:bg-stone-600 shadow-md hover:-translate-y-0.5'
                } ${isEditing ? 'opacity-30 cursor-not-allowed' : ''}`}
              >
                {isCompleting ? <Sparkles size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                <span>{isCompleting ? 'Logged Successfully' : isOverdue ? 'Address Immediately' : 'Mark Task Done'}</span>
              </button>
              {!isCompleting && (
                <button 
                  onClick={() => setDeletingReminder(reminder)}
                  className="px-5 bg-stone-50 dark:bg-stone-800 text-stone-300 dark:text-stone-600 border border-stone-200 dark:border-stone-700 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-900/40 transition-all"
                  title="Permanently remove this care schedule"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Expanded History Section */}
        {isHistoryExpanded && !isCompleting && (
          <div className="mt-6 border-t border-stone-100 dark:border-stone-800 pt-4 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2 mb-3">
              <History size={14} className="text-emerald-500 dark:text-emerald-400" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-500">Care Log</h4>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {historyDates.map((date, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-stone-50 dark:bg-stone-800/50 rounded-xl text-sm border border-stone-100 dark:border-stone-800">
                  <div className="flex items-center gap-3">
                     <div className={`h-2 w-2 rounded-full ${idx === 0 ? 'bg-emerald-500' : 'bg-stone-300 dark:bg-stone-700'}`} />
                     <span className="font-bold text-stone-600 dark:text-stone-300">
                       {new Date(date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                     </span>
                  </div>
                  <span className="text-stone-400 dark:text-stone-600 font-mono text-xs">
                    {new Date(date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-32">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div className="bg-stone-100 dark:bg-stone-800 p-1.5 rounded-2xl flex gap-1 shadow-inner w-full sm:w-auto">
          <button
            onClick={() => setGroupMode('plant')}
            title="Group tasks by plant species"
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              groupMode === 'plant' 
              ? 'bg-white dark:bg-stone-700 text-emerald-700 dark:text-emerald-300 shadow-sm' 
              : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300'
            }`}
          >
            <LayoutGrid size={14} />
            By Plant
          </button>
          <button
            onClick={() => setGroupMode('type')}
            title="Group tasks by care type (Watering/Feeding)"
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              groupMode === 'type' 
              ? 'bg-white dark:bg-stone-700 text-emerald-700 dark:text-emerald-300 shadow-sm' 
              : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300'
            }`}
          >
            <ListFilter size={14} />
            By Type
          </button>
        </div>

        <div className="bg-stone-100 dark:bg-stone-800 p-1.5 rounded-2xl flex gap-1 shadow-inner w-full sm:w-auto">
          <button
            onClick={() => setSortMode('urgency')}
            title="Sort tasks by soonest due date first"
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              sortMode === 'urgency' 
              ? 'bg-white dark:bg-stone-700 text-emerald-700 dark:text-emerald-300 shadow-sm' 
              : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300'
            }`}
          >
            <Clock size={14} />
            Urgency
          </button>
          <button
            onClick={() => setSortMode('name')}
            title="Sort tasks alphabetically by plant name"
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              sortMode === 'name' 
              ? 'bg-white dark:bg-stone-700 text-emerald-700 dark:text-emerald-300 shadow-sm' 
              : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300'
            }`}
          >
            <SortAsc size={14} />
            A-Z
          </button>
        </div>
      </div>

      <div className="space-y-10">
        {displayGroups.map((group) => {
          const totalTasks = group.sections.reduce((sum, s) => sum + s.tasks.length, 0);
          const hasOverdue = group.earliestDue < now;
          
          return (
            <div key={group.id} className={`bg-white dark:bg-stone-900 rounded-[2.5rem] border transition-all duration-500 overflow-hidden animate-in fade-in slide-in-from-bottom-2 ${
              hasOverdue ? 'border-rose-200 dark:border-rose-900/50 shadow-xl shadow-rose-500/10' : 'border-stone-100 dark:border-stone-800 shadow-sm'
            }`}>
              <div className={`px-8 py-7 border-b flex items-center justify-between ${
                hasOverdue ? 'bg-rose-50/50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-900/30' : group.accentBg + ' ' + group.accentBorder
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110 ${
                    hasOverdue ? 'bg-rose-500 shadow-rose-200 dark:shadow-rose-900/20' : group.accentColor + ' shadow-stone-100 dark:shadow-none'
                  }`}>
                    {group.icon}
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-stone-800 dark:text-stone-100 leading-tight">{group.title}</h3>
                    {group.subtitle && <p className="text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-[0.2em] mt-1">{group.subtitle}</p>}
                  </div>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 bg-white dark:bg-stone-800 rounded-full border text-[10px] font-black uppercase tracking-widest shadow-sm ${
                  hasOverdue ? 'border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400' : 'border-stone-100 dark:border-stone-700 text-stone-400 dark:text-stone-500'
                }`}>
                  <span className={`h-2 w-2 rounded-full ${hasOverdue ? 'bg-rose-500 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
                  {hasOverdue ? 'Attention Required' : `${totalTasks} Active Task${totalTasks !== 1 ? 's' : ''}`}
                </div>
              </div>
              
              <div className="divide-y divide-stone-50 dark:divide-stone-800">
                {group.sections.map(section => section.tasks.length > 0 && (
                  <div key={section.label} className="bg-white dark:bg-stone-900">
                    <div className="px-8 pt-6 pb-2 flex items-center gap-2">
                      <span className={section.color}>{section.icon}</span>
                      <span className="text-[11px] font-black text-stone-400 dark:text-stone-600 uppercase tracking-[0.25em]">{section.label}</span>
                    </div>
                    {section.tasks.map(renderTask)}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {deletingReminder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] w-full max-w-sm shadow-2xl p-8 animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="flex justify-between items-start mb-6">
              <div className="h-14 w-14 bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400 rounded-[1.25rem] flex items-center justify-center">
                <AlertCircle size={32} />
              </div>
              <button 
                onClick={() => setDeletingReminder(null)}
                title="Close dialog"
                className="p-2.5 text-stone-300 dark:text-stone-600 hover:text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-2xl transition-all"
              >
                <X size={24} />
              </button>
            </div>
            
            <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">Remove care task?</h3>
            <p className="text-stone-500 dark:text-stone-400 text-base leading-relaxed mb-8">
              Are you sure you want to stop tracking <span className="font-bold text-stone-800 dark:text-stone-200">{deletingReminder.type === 'water' ? 'watering' : 'fertilizing'}</span> for <span className="font-bold text-stone-800 dark:text-stone-200">{deletingReminder.plantName}</span>? Your history for this schedule will be lost.
            </p>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setDeletingReminder(null)}
                className="flex-1 py-4 px-4 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-2xl font-black text-sm hover:bg-stone-200 dark:hover:bg-stone-700 transition-all"
              >
                Keep Task
              </button>
              <button 
                onClick={() => {
                  onRemove(deletingReminder.id);
                  setDeletingReminder(null);
                }}
                className="flex-1 py-4 px-4 bg-rose-600 text-white rounded-2xl font-black text-sm hover:bg-rose-700 shadow-xl shadow-rose-200 dark:shadow-rose-900/30 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RemindersList;
