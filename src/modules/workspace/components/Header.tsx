import React, { useState, useRef, useEffect } from 'react';
import { Search, LayoutGrid, List, Moon, Sun, Monitor, ExternalLink, LogOut, ChevronDown, User, ShieldCheck } from 'lucide-react';
import { ViewMode } from '../../../shared/types';
import { usePreferences } from '../../../shared/context/usePreferences';
import { useUserPreference } from '../../../shared/context/useUserPreference';
import { Tooltip } from '../../../shared/components/ui/Tooltip';
import { Switch } from '../../../shared/components/ui/Switch';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/useAuth';
import { ToastType } from '../../../shared/components/Toast';

interface HeaderProps {
  userName: string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  totalApps: number;
  totalCategories: number;
  totalFavorites: number;
  addToast: (message: string, type?: ToastType) => void;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const Header: React.FC<HeaderProps> = ({
  userName,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  totalApps,
  totalCategories,
  totalFavorites,
  addToast
}) => {
  const { openInNewTab, toggleOpenInNewTab } = usePreferences();
  const { theme, setTheme } = useUserPreference();
  const isDarkMode = theme === 'dark';
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const greeting = getGreeting();

  const handleDarkModeToggle = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
    addToast(isDarkMode ? "Switched to Light Mode" : "Switched to Dark Mode", "info");
  };

  const handleNewTabToggle = () => {
    toggleOpenInNewTab();
    addToast(openInNewTab ? "Apps will open in the same tab" : "Apps will open in a new tab", "info");
  };

  const handleAdminSwitch = () => {
    if (user?.is_admin) {
      navigate('/admin');
    } else {
      addToast("You do not have admin access", "error");
    }
    setIsProfileOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    logout();
    navigate('/logged-out');
  };

  return (
    <header className="h-[80px] glass-panel border-b border-white/10 flex items-center justify-between px-4 md:px-8 sticky top-0 z-50 transition-all duration-200 backdrop-blur-md bg-background/80 py-4">
      <div className="flex items-center gap-8 flex-1">
        
        <div className="flex items-center gap-3">

           <div className="hidden md:block">
            <h1 className="text-xl font-semibold text-foreground flex items-center gap-1">
              <span>{greeting},</span>
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">{userName}</span>
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-muted-foreground italic">
                Available: {totalApps} Tools • {totalCategories} Categories • {totalFavorites} Favorites
              </p>
            </div>
          </div>
        </div>

        <div className="relative ml-auto transition-all duration-300 ease-in-out w-64 focus-within:w-96 hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
          <input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-secondary/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 text-sm text-foreground placeholder-muted-foreground transition-all shadow-sm hover:bg-secondary"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 ml-6">
        <div className="flex items-center bg-secondary rounded-lg p-1 border border-border">
          <Tooltip content="Grid View" position="bottom">
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-ring/40 ${
                viewMode === 'card' 
                  ? 'bg-background text-primary shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid size={18} />
            </button>
          </Tooltip>
          <Tooltip content="List View" position="bottom">
            <button
              onClick={() => setViewMode('icon')}
              className={`p-2 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-ring/40 ${
                viewMode === 'icon' 
                  ? 'bg-background text-primary shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List size={18} />
            </button>
          </Tooltip>
        </div>

        <div className="h-8 w-px bg-border hidden md:block" />

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-full hover:bg-secondary border border-transparent hover:border-border transition-all focus:outline-none focus:ring-2 focus:ring-ring/40"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-md ring-2 ring-background">
              {userName.charAt(0)}
            </div>
            <ChevronDown size={16} className={`text-muted-foreground transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-card rounded-2xl shadow-xl border border-border overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              <div className="p-4 border-b border-border bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <User size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email || `${(userName || 'Guest').toLowerCase().replace(/\s+/g, '.')}@samsung.com`}</p>
                  </div>
                </div>
              </div>

              <div className="p-2">
                <div className="px-3 py-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Preferences</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-foreground">
                        {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
                        <span className="text-sm">Dark Mode</span>
                      </div>
                      <div className="w-12">
                        <Switch checked={isDarkMode} onChange={handleDarkModeToggle} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-foreground">
                        {openInNewTab ? <ExternalLink size={16} /> : <Monitor size={16} />}
                        <span className="text-sm">Open in New Tab</span>
                      </div>
                      <div className="w-12">
                        <Switch checked={openInNewTab} onChange={handleNewTabToggle} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-2 border-t border-border">
                <button 
                  onClick={handleAdminSwitch}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors mb-1 focus:outline-none focus:ring-2 focus:ring-ring/40"
                >
                  <ShieldCheck size={16} />
                  <span>Switch to Admin View</span>
                </button>
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-destructive/40"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
