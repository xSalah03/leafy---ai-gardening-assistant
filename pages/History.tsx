import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Sprout, Share2, Trash2 } from 'lucide-react';
import { PlantDetails } from '../types';

interface Props {
  history: PlantDetails[];
  setCurrentPlant: (p: PlantDetails | null) => void;
  setLastImage: (s: string | null) => void;
  onShare: (e: React.MouseEvent, plant: PlantDetails) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
}

const HistoryPage: React.FC<Props> = ({ history, setCurrentPlant, setLastImage, onShare, onDelete }) => {
  const navigate = useNavigate();

  return (
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
            onClick={() => { setCurrentPlant(item); setLastImage(item.imageUrl || null); navigate('/'); }}
          >
            <div className="h-32 w-32 shrink-0 rounded-3xl overflow-hidden bg-stone-50 dark:bg-stone-800 shadow-inner">
              {item.imageUrl && <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.commonName} />}
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
                onClick={(e) => onShare(e, item)}
                className="p-2.5 text-stone-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-2xl transition-all"
                title="Share discovery"
              >
                <Share2 size={18} />
              </button>
              <button 
                onClick={(e) => onDelete(e, item.id)}
                className="p-2.5 text-stone-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-2xl transition-all"
                title="Delete entry"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryPage;
