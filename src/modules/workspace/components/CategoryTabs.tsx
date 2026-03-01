import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Briefcase, BookOpen, Layout, Settings, Database, Folder, Users, Presentation } from 'lucide-react';

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string | null;
  onSelectCategory: (category: string) => void;
  isCollapsed?: boolean;
}

const getCategoryIcon = (category: string, isCollapsed: boolean) => {
  const size = isCollapsed ? 18 : 16;
  const lower = (category || '').toLowerCase();
  if (lower.includes('product')) return <Briefcase size={size} />;
  if (lower.includes('know')) return <BookOpen size={size} />;
  if (lower.includes('plat')) return <Layout size={size} />;
  if (lower.includes('data')) return <Database size={size} />;
  if (lower.includes('set')) return <Settings size={size} />;
  if (lower.includes('custom')) return <Users size={size} />;
  if (lower.includes('present')) return <Presentation size={size} />;
  return <Folder size={size} />;
};

const getCategoryStyles = (category: string) => {
  const styles: Record<string, { bg: string, text: string, gradient: string }> = {
    'Productivity': { bg: 'bg-fuchsia-50 dark:bg-fuchsia-500/10', text: 'text-fuchsia-600 dark:text-fuchsia-400', gradient: 'bg-gradient-to-r from-fuchsia-500 to-purple-600' },
    'Knowledge': { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', gradient: 'bg-gradient-to-r from-emerald-400 to-cyan-500' },
    'Platform': { bg: 'bg-orange-50 dark:bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', gradient: 'bg-gradient-to-r from-orange-400 to-rose-500' },
    'Customer': { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', gradient: 'bg-gradient-to-r from-blue-400 to-indigo-500' },
    'Presentation': { bg: 'bg-pink-50 dark:bg-pink-500/10', text: 'text-pink-600 dark:text-pink-400', gradient: 'bg-gradient-to-r from-pink-400 to-rose-500' },
  };
  return styles[category] || { bg: 'bg-indigo-50 dark:bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', gradient: 'bg-indigo-600 dark:bg-indigo-400' };
};

const CategoryTabs: React.FC<CategoryTabsProps> = ({ categories, activeCategory, onSelectCategory, isCollapsed = false }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const MAX_VISIBLE = 4;
  const visibleCategories = categories.slice(0, MAX_VISIBLE);
  const overflowCategories = categories.slice(MAX_VISIBLE);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-1">
      {visibleCategories.map((category) => {
        const styles = getCategoryStyles(category);
        const isActive = activeCategory === category;
        
        return (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`relative px-3 py-2 text-sm font-medium transition-colors rounded-lg flex items-center gap-2 ${
              isActive
                ? `${styles.text} ${styles.bg}`
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            {getCategoryIcon(category, isCollapsed)}
            <motion.span 
              animate={{ 
                opacity: isCollapsed ? 0 : 1, 
                width: isCollapsed ? 0 : 'auto',
                marginLeft: isCollapsed ? 0 : 8
              }}
              className="overflow-hidden whitespace-nowrap"
            >
              {category}
            </motion.span>
            {isActive && (
              <motion.div
                layoutId="activeTabIndicator"
                className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full ${styles.gradient}`}
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        );
      })}

      {overflowCategories.length > 0 && (
        <div className="relative ml-1" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors rounded-lg ${
              overflowCategories.includes(activeCategory || '')
                ? `${getCategoryStyles(activeCategory || '').text} ${getCategoryStyles(activeCategory || '').bg}`
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            {isCollapsed ? <ChevronDown size={18} /> : (
              <>
                More <ChevronDown size={14} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </>
            )}
            {overflowCategories.includes(activeCategory || '') && (
              <motion.div
                layoutId="activeTabIndicator"
                className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full ${getCategoryStyles(activeCategory || '').gradient}`}
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-full mt-2 w-48 py-1 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden"
              >
                {overflowCategories.map((category) => {
                  const styles = getCategoryStyles(category);
                  const isActive = activeCategory === category;
                  
                  return (
                    <button
                      key={category}
                      onClick={() => {
                        onSelectCategory(category);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2 ${
                        isActive
                          ? `${styles.bg} ${styles.text} font-medium`
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      {getCategoryIcon(category, false)}
                      {category}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default CategoryTabs;
