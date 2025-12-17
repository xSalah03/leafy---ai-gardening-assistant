import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Leaf, Search, MessageSquare, History, Bell, Sun, Moon, Monitor } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

interface HeaderProps {
  pendingCount: number;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const Header: React.FC<HeaderProps> = ({ pendingCount, theme, setTheme }) => {
  const location = useLocation();
  const activeTab = location.pathname === '/' ? 'home' : location.pathname.slice(1);

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

  const navItemClass = (path: string) => {
    const isActive = location.pathname === path;
    return `flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold transition-all ${
      isActive 
        ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 shadow-sm' 
        : 'text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800'
    }`;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/70 dark:bg-stone-900/80 backdrop-blur-xl border-b border-stone-100 dark:border-stone-800 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center gap-3 cursor-pointer group" 
          title="Return to Leafy Home"
        >
          <div className="bg-emerald-600 dark:bg-emerald-500 p-2 rounded-xl text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 group-hover:scale-105 transition-transform">
            <Leaf size={24} />
          </div>
          <span className="font-serif text-2xl font-bold tracking-tight text-emerald-900 dark:text-emerald-100">Leafy</span>
        </Link>
        
        <nav className="flex items-center gap-1 sm:gap-4">
          <Link 
            to="/"
            title="Search and identify plants with AI"
            className={navItemClass('/')}
          >
            <Search size={18} />
            <span className="hidden md:inline">Identify</span>
          </Link>
          
          <Link 
            to="/reminders"
            title="View your plant care schedules and reminders"
            className={`relative ${navItemClass('/reminders')}`}
          >
            <Bell size={18} />
            <span className="hidden md:inline">Care</span>
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-rose-500 text-white text-[10px] flex items-center justify-center rounded-full font-black border-2 border-white dark:border-stone-900 shadow-sm animate-bounce">
                {pendingCount}
              </span>
            )}
          </Link>

          <Link 
            to="/chat"
            title="Chat with Leafy AI Botanist"
            className={navItemClass('/chat')}
          >
            <MessageSquare size={18} />
            <span className="hidden md:inline">Chat</span>
          </Link>
          
          <Link 
            to="/history"
            title="View your botanical journal and history"
            className={navItemClass('/history')}
          >
            <History size={18} />
            <span className="hidden md:inline">Journal</span>
          </Link>

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