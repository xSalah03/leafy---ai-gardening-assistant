import React from 'react';
import { Leaf, Search, MessageSquare, History, Bell, Sun, Moon, Monitor } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

interface HeaderProps {
  activeTab: 'home' | 'chat' | 'history' | 'reminders';
  setActiveTab: (tab: 'home' | 'chat' | 'history' | 'reminders') => void;
  pendingCount: number;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, pendingCount, theme, setTheme }) => {
  const toggleTheme = () => {
    if (theme === 'system') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else setTheme('system');
  };

  const getThemeIcon = () => {
    if (theme === 'system') return <Monitor size={20} />;
    if (theme === 'light') return <Sun size={20} />;
    return <Moon size={20} />;
  };

  const getThemeTitle = () => {
    if (theme === 'system') return "Currently: System Mode. Click for Light Mode.";
    if (theme === 'light') return "Currently: Light Mode. Click for Dark Mode.";
    return "Currently: Dark Mode. Click for System Mode.";
  };

  return (
    <header className="sticky top-0 z-50 bg-white/70 dark:bg-stone-900/80 backdrop-blur-xl border-b border-stone-100 dark:border-stone-800 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => setActiveTab('home')}
          title="Return to Leafy Home"
        >
          <div className="bg-emerald-600 dark:bg-emerald-500 p-2 rounded-xl text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 group-hover:scale-105 transition-transform">
            <Leaf size={24} />
          </div>
          <span className="font-serif text-2xl font-bold tracking-tight text-emerald-900 dark:text-emerald-100">Leafy</span>
        </div>
        
        <nav className="flex items-center gap-1 sm:gap-4">
          <button 
            onClick={() => setActiveTab('home')}
            title="Search and identify plants with AI"
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold transition-all ${
              activeTab === 'home' 
                ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 shadow-sm' 
                : 'text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800'
            }`}
          >
            <Search size={18} />
            <span className="hidden md:inline">Identify</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('reminders')}
            title="View your plant care schedules and reminders"
            className={`relative flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold transition-all ${
              activeTab === 'reminders' 
                ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 shadow-sm' 
                : 'text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800'
            }`}
          >
            <Bell size={18} />
            <span className="hidden md:inline">Care</span>
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-rose-500 text-white text-[10px] flex items-center justify-center rounded-full font-black border-2 border-white dark:border-stone-900 shadow-sm animate-bounce">
                {pendingCount}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab('chat')}
            title="Chat with Leafy AI Botanist"
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold transition-all ${
              activeTab === 'chat' 
                ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 shadow-sm' 
                : 'text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800'
            }`}
          >
            <MessageSquare size={18} />
            <span className="hidden md:inline">Chat</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('history')}
            title="View your botanical journal and history"
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold transition-all ${
              activeTab === 'history' 
                ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 shadow-sm' 
                : 'text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800'
            }`}
          >
            <History size={18} />
            <span className="hidden md:inline">Journal</span>
          </button>

          <div className="w-[1px] h-6 bg-stone-200 dark:bg-stone-800 mx-1" />

          <button 
            onClick={toggleTheme}
            title={getThemeTitle()}
            className="p-2.5 rounded-full text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all flex items-center justify-center"
          >
            {getThemeIcon()}
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;