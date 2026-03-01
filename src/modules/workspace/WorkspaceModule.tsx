import React, { useState, useMemo, useEffect, useRef } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import AppItem from './components/AppItem';
import DetailPanel from './components/DetailPanel';
import SidebarNavigation from './components/SidebarNavigation';
import CardSurfaceContainer from './components/CardSurfaceContainer';
import RobotAnimation from './components/RobotAnimation';
import ToastContainer, { ToastMessage, ToastType } from '../../shared/components/Toast';
import { AppData, FilterType, ViewMode } from '../../shared/types';
import { api } from '../../shared/services/api';
import { PackageOpen, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../shared/context/useAuth';
import { useUserPreference } from '../../shared/context/useUserPreference';
import { motion, AnimatePresence } from 'framer-motion';

const WorkspaceModule: React.FC = () => {
  const [apps, setApps] = useState<AppData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [cardsPerRow, setCardsPerRow] = useState<number>(4);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('dashboard');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('splashShown');
  });
  const mainContentRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();
  const userName = user?.username || "Guest";
  const { favorites, toggleFavorite } = useUserPreference();

  useEffect(() => {
    if (showSplash) {
      sessionStorage.setItem('splashShown', 'true');
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    const initWorkspace = async () => {
      setLoading(true);
      
      const [appsRes, configRes] = await Promise.all([
        api.getApps(),
        api.getConfig()
      ]);
      
      setApps(appsRes.data);
      setCardsPerRow(configRes.cardsPerRow);
      
      if (!appsRes.isLive) {
        addToast("Backend server is unreachable. Showing cached tools.", "error");
      }
      
      setLoading(false);
    };

    initWorkspace();
  }, []);

  const categories = useMemo(() => {
    return Array.from(new Set(apps.map(a => a.category).filter(Boolean))).sort() as string[];
  }, [apps]);

  const handleToggleFav = async (id: number) => {
    const app = apps.find(a => a.id === id);
    if (!app) return;

    const newStatus = !favorites.includes(id);
    toggleFavorite(id);

    addToast(`${newStatus ? 'Added to' : 'Removed from'} favorites: ${app.name}`, "success");
  };

  const handleNavigate = (filter: FilterType, category: string | null) => {
    setActiveFilter(filter);
    setActiveCategory(category);
    setCurrentPage(1);
    // Scroll to top when navigating
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearchQueryChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  const filteredApps = useMemo(() => {
    let result = apps.map(app => ({ ...app, isFavorite: favorites.includes(app.id) }));
    
    // Default sort alphabetically by name
    result.sort((a, b) => a.name.localeCompare(b.name));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(app => 
        app.name.toLowerCase().includes(q) || app.desc.toLowerCase().includes(q)
      );
    }
    if (activeFilter === 'favorites') {
      result = result.filter(app => app.isFavorite);
    } else if (activeFilter === 'dashboard' && activeCategory) {
      result = result.filter(app => app.category === activeCategory);
    }
    return result;
  }, [apps, favorites, searchQuery, activeFilter, activeCategory]);

  const itemsPerPage = 12;
  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
  
  const paginatedApps = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredApps.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredApps, currentPage]);

  const selectedApp = useMemo(() => 
    filteredApps.find(a => a.id === selectedAppId) || null
  , [filteredApps, selectedAppId]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
          <Loader2 className="w-12 h-12 mb-4 animate-spin text-primary" />
          <p className="text-lg font-medium">Authenticating & Synchronizing...</p>
        </div>
      );
    }

    if (filteredApps.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
          <PackageOpen className="w-16 h-16 mb-4 opacity-50" />
          <p className="text-lg font-medium">No tools found.</p>
          <button onClick={() => {setSearchQuery(''); setActiveCategory(null); setActiveFilter('dashboard'); setCurrentPage(1);}} className="mt-2 text-primary hover:underline">
            Clear filters
          </button>
        </div>
      );
    }

    const getGridColsClass = () => {
      if (viewMode === 'icon') {
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6';
      }
      return cardsPerRow === 3 
        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    };

    return (
      <div className="flex flex-col h-full">
        <CardSurfaceContainer>
          <motion.div 
            className={`grid gap-5 ${getGridColsClass()} pb-6`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.05 }}
          >
            <AnimatePresence mode='popLayout'>
              {paginatedApps.map((app, index) => (
                <AppItem 
                  key={app.id} 
                  app={app} 
                  viewMode={viewMode} 
                  onToggleFav={handleToggleFav}
                  onOpenDetail={setSelectedAppId}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </CardSurfaceContainer>
        
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-4 pb-4">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-full bg-secondary text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              aria-label="Previous page"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-medium text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-full bg-secondary text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              aria-label="Next page"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    );
  };

  const getRobotColor = (category: string | null) => {
    if (!category) return 'indigo';
    const lower = (category || '').toLowerCase();
    if (lower.includes('product')) return 'fuchsia';
    if (lower.includes('know')) return 'emerald';
    if (lower.includes('plat')) return 'orange';
    if (lower.includes('custom')) return 'blue';
    if (lower.includes('present')) return 'pink';
    return 'indigo';
  };

  const getRobotVariant = (category: string | null): import('./components/RobotAnimation').RobotVariant => {
    if (!category) return 'idle';
    const lower = (category || '').toLowerCase();
    if (lower.includes('product')) return 'blinking';
    if (lower.includes('know')) return 'scanning';
    if (lower.includes('plat')) return 'idle'; // Changed from hover
    if (lower.includes('custom')) return 'idle'; // Changed from glitch
    if (lower.includes('present')) return 'hologram';
    if (lower.includes('sales')) return 'talking';
    return 'idle';
  };

  const robotColor = getRobotColor(activeCategory);
  const robotVariant = getRobotVariant(activeCategory);

  return (
    <div className="flex h-screen bg-background overflow-hidden transition-colors duration-300 text-foreground relative">
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md p-4 cursor-pointer"
            onClick={() => setShowSplash(false)}
          >
            <div className="w-full max-w-4xl pointer-events-none shadow-2xl rounded-3xl overflow-hidden">
              <Hero />
            </div>
            <div className="absolute bottom-8 text-sm text-muted-foreground animate-pulse pointer-events-none">
              Click anywhere to continue
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated AI Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Ambient Gradient Base */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/30 via-blue-50/30 to-indigo-50/30 dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] dark:from-purple-900/20 dark:via-background/0 dark:to-background/0" />
        
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-500/30 dark:bg-indigo-600/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-70 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-emerald-500/30 dark:bg-emerald-600/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[40rem] h-[40rem] bg-fuchsia-500/30 dark:bg-fuchsia-600/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <SidebarNavigation 
        activeFilter={activeFilter}
        activeCategory={activeCategory}
        categories={categories}
        onNavigate={handleNavigate}
      />

      <main className="flex-1 flex flex-col min-w-0 relative z-10 ml-[72px]">
        <Header 
          userName={userName}
          searchQuery={searchQuery}
          setSearchQuery={handleSearchQueryChange}
          viewMode={viewMode}
          setViewMode={setViewMode}
          totalApps={apps.length}
          totalCategories={categories.length}
          totalFavorites={favorites.length}
          addToast={addToast}
        />

        <div 
          ref={mainContentRef}
          className="flex-1 overflow-y-auto scroll-smooth no-scrollbar relative flex flex-col min-h-0 pt-2"
        >
           <div className="p-2 md:p-4 w-full mx-auto space-y-3 flex-1 max-w-[1600px]">
             <AnimatePresence mode="wait">
               <motion.div 
                  key={activeFilter + '-' + activeCategory} 
                  className="glass-panel rounded-3xl relative overflow-hidden bg-white/70 dark:bg-[#14141c]/60 backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-[0_20px_40px_rgba(124,58,237,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15, staggerChildren: 0.03 }}
                >
                 <div className="p-2 md:p-4">
                   {renderContent()}
                 </div>
               </motion.div>
             </AnimatePresence>
          </div>

          {/* Fixed Bottom-Right Robot */}
          <div className="fixed bottom-20 right-6 z-40 w-20 h-20 pointer-events-none">
             <RobotAnimation scale={0.4} color={robotColor} variant={robotVariant} />
          </div>
        </div>
      </main>



      <DetailPanel 
        app={selectedApp} 
        onClose={() => setSelectedAppId(null)} 
      />
      
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default WorkspaceModule;
