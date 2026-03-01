import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Server, Database, Activity, Box, Layers, Globe, BarChart } from 'lucide-react';
import { Tooltip } from '../../../shared/components/ui/Tooltip';
import { getCategoryStyles } from '../../../shared/utils/categoryColors';

interface AdminSidebarProps {
  activeCategory: string | null;
  categories: string[];
  onSelectCategory: (category: string | null) => void;
  isAdmin?: boolean;
}

const getCategoryIcon = (category: string) => {
    const size = 20;
    const lower = (category || '').toLowerCase();
    if (lower.includes('core')) return <Server size={size} />;
    if (lower.includes('ai')) return <Activity size={size} />;
    if (lower.includes('infra')) return <Database size={size} />;
    if (lower.includes('data')) return <Database size={size} />;
    if (lower.includes('web')) return <Globe size={size} />;
    if (lower.includes('links')) return <Layers size={size} />;
    if (lower.includes('analytics') || lower.includes('feedback')) return <BarChart size={size} />;
    return <Box size={size} />;
};

const getColorConfig = (category: string | null) => {
    return getCategoryStyles(category);
};

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeCategory,
  categories,
  onSelectCategory,
  isAdmin = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      animate={{ width: isExpanded ? 240 : 72 }}
      onHoverStart={() => setIsExpanded(true)}
      onHoverEnd={() => setIsExpanded(false)}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col fixed left-0 top-0 z-50 shadow-sm"
    >
        <div className={`flex items-center h-16 flex-shrink-0 ${isExpanded ? 'px-5' : 'justify-center'}`}>
             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold font-mono text-sm shadow-sm flex-shrink-0">
              SA
           </div>
           <motion.div
             initial={false}
             animate={{ opacity: isExpanded ? 1 : 0, width: isExpanded ? 'auto' : 0, marginLeft: isExpanded ? 12 : 0 }}
             transition={{ duration: 0.2, ease: 'easeInOut' }}
             className="overflow-hidden whitespace-nowrap font-bold text-sm text-slate-900 dark:text-white"
           >
             System Admin
           </motion.div>
        </div>

        <nav className="flex-1 flex flex-col gap-1 px-3 py-4">
            <NavItem
                isExpanded={isExpanded}
                isActive={activeCategory === null}
                onClick={() => onSelectCategory(null)}
                label="Overview"
                categoryName="overview"
            >
                <Home size={20} />
            </NavItem>

            {isAdmin && (
              <NavItem
                  isExpanded={isExpanded}
                  isActive={activeCategory === 'applications'}
                  onClick={() => onSelectCategory('applications')}
                  label="Applications"
                  categoryName="applications"
              >
                  <Layers size={20} />
              </NavItem>
            )}

            <div className="my-2 h-px bg-slate-200 dark:bg-slate-700 mx-2" />

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-1">
                {categories.map(category => (
                    <NavItem
                        key={category}
                        isExpanded={isExpanded}
                        isActive={activeCategory === category}
                        onClick={() => onSelectCategory(category)}
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
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
        >
            {isActive && (
                <motion.div 
                    layoutId="activeAdminSidebarIndicator" 
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

export default AdminSidebar;
