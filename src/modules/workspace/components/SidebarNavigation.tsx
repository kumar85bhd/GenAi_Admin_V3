import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Star, Briefcase, BookOpen, Layout, Settings, Database, Folder, Users, Presentation } from 'lucide-react';
import { FilterType } from '../../../shared/types';
import { Tooltip } from '../../../shared/components/ui/Tooltip';
import { getCategoryStyles } from '../../../shared/utils/categoryColors';

interface SidebarNavigationProps {
  activeFilter: FilterType;
  activeCategory: string | null;
  categories: string[];
  onNavigate: (filter: FilterType, category: string | null) => void;
}

const getCategoryIcon = (category: string) => {
    const size = 20;
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

const getColorConfig = (category: string | null) => {
    return getCategoryStyles(category);
};

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  activeFilter,
  activeCategory,
  categories,
  onNavigate,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      animate={{ width: isExpanded ? 240 : 72 }}
      onHoverStart={() => setIsExpanded(true)}
      onHoverEnd={() => setIsExpanded(false)}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="h-screen bg-card border-r border-border flex flex-col fixed left-0 top-0 z-50"
    >
        <div className={`flex items-center h-16 flex-shrink-0 ${isExpanded ? 'px-5' : 'justify-center'}`}>
             <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold font-serif text-sm shadow-sm shadow-indigo-500/20 flex-shrink-0">
              G
           </div>
           <motion.div
             initial={false}
             animate={{ opacity: isExpanded ? 1 : 0, width: isExpanded ? 'auto' : 0, marginLeft: isExpanded ? 12 : 0 }}
             transition={{ duration: 0.2, ease: 'easeInOut' }}
             className="overflow-hidden whitespace-nowrap font-semibold text-sm text-foreground"
           >
             GenAI Workspace
           </motion.div>
        </div>

        <nav className="flex-1 flex flex-col gap-1 px-3 py-4">
            <NavItem
                isExpanded={isExpanded}
                isActive={activeFilter === 'dashboard' && activeCategory === null}
                onClick={() => onNavigate('dashboard', null)}
                label="Home"
                categoryName="home"
            >
                <Home size={20} />
            </NavItem>

            <NavItem
                isExpanded={isExpanded}
                isActive={activeFilter === 'favorites'}
                onClick={() => onNavigate('favorites', null)}
                label="Favorites"
                categoryName="favorites"
            >
                <Star size={20} />
            </NavItem>

            <div className="my-2 h-px bg-border mx-2" />

            <div className="flex-1 overflow-y-auto no-scrollbar">
                {categories.map(category => (
                    <NavItem
                        key={category}
                        isExpanded={isExpanded}
                        isActive={activeCategory === category}
                        onClick={() => onNavigate('dashboard', category)}
                        label={category}
                        categoryName={category}
                    >
                        {getCategoryIcon(category)}
                    </NavItem>
                ))}
            </div>
        </nav>
    </motion.div>
  );
};


interface NavItemProps {
  children: React.ReactNode;
  isExpanded: boolean;
  isActive: boolean;
  onClick: () => void;
  label: string;
  categoryName: string;
}

const NavItem: React.FC<NavItemProps> = ({ children, isExpanded, isActive, onClick, label, categoryName }) => {
    const colors = getColorConfig(categoryName);
    
    const itemContent = (
        <motion.button
            onClick={onClick}
            className={`flex items-center w-full h-10 rounded-lg px-3 text-sm font-medium transition-all duration-200 relative focus:outline-none focus:ring-2 focus:ring-indigo-500/50 border ${ 
                isActive 
                    ? `${colors.activeBg} ${colors.activeText} ${colors.activeBorder} ${colors.glow}` 
                    : 'border-transparent text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
            }`}
        >
            {isActive && (
                <motion.div 
                    layoutId="activeSidebarIndicator" 
                    className={`absolute left-0 top-1 bottom-1 w-1 rounded-r-full ${colors.indicator}`} 
                />
            )}
            {children}
            <motion.div
                initial={false}
                animate={{ opacity: isExpanded ? 1 : 0, width: isExpanded ? 'auto' : 0, marginLeft: isExpanded ? 16 : 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden whitespace-nowrap"
            >
                {label}
            </motion.div>
        </motion.button>
    );

    return isExpanded ? itemContent : <Tooltip content={label} position="right">{itemContent}</Tooltip>;
}

export default SidebarNavigation;
