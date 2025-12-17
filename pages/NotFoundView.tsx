import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, MoveLeft } from 'lucide-react';

const NotFoundView: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in zoom-in-95 duration-700">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full" />
        <div className="relative h-24 w-24 bg-white dark:bg-stone-900 rounded-3xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xl border border-stone-100 dark:border-stone-800">
          <Compass size={48} className="animate-[spin_10s_linear_infinite]" />
        </div>
      </div>
      
      <h1 className="text-8xl font-serif font-bold text-stone-200 dark:text-stone-800 mb-2 leading-none">404</h1>
      <h2 className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-4">The path is overgrown</h2>
      <p className="text-stone-500 dark:text-stone-400 max-w-sm mx-auto mb-10 font-medium leading-relaxed">
        It seems you've wandered off the trail. This botanical branch doesn't exist yet, or it has been relocated.
      </p>
      
      <Link 
        to="/" 
        className="group flex items-center gap-3 px-8 py-4 bg-emerald-600 dark:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 dark:shadow-none active:scale-95"
      >
        <MoveLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to the Garden
      </Link>
    </div>
  );
};

export default NotFoundView;
