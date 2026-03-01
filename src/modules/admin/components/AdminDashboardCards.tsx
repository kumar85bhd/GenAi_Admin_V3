import React, { useMemo } from 'react';
import { Service, HealthStatus } from '../types';
import AdminCard from './AdminCard';

interface AdminDashboardCardsProps {
  services: Service[];
  activeCategory: string | null;
  filterStatus?: string;
}

import { motion, AnimatePresence } from 'framer-motion';

/**
 * AdminDashboardCards
 * Groups services by category and renders them in a grid.
 */
const AdminDashboardCards: React.FC<AdminDashboardCardsProps> = ({ services, activeCategory, filterStatus }) => {
  const filteredServices = useMemo(() => {
    let result = services;
    
    if (activeCategory) {
      result = result.filter(s => s.category === activeCategory);
    }

    if (filterStatus) {
      if (filterStatus === 'healthy') result = result.filter(s => s.status === HealthStatus.HEALTHY);
      if (filterStatus === 'warning') result = result.filter(s => s.status === HealthStatus.WARNING);
      if (filterStatus === 'error') result = result.filter(s => s.status === HealthStatus.CRITICAL);
    }

    return result;
  }, [services, activeCategory, filterStatus]);

  if (filteredServices.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 border-dashed"
      >
        <p className="text-slate-500 dark:text-slate-400">No services found matching your criteria.</p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <AnimatePresence mode="popLayout">
        {filteredServices.map((service, index) => (
          <motion.div
            key={service.id}
            layout
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            transition={{ 
              duration: 0.3, 
              delay: index * 0.05,
              type: "spring",
              stiffness: 260,
              damping: 20
            }}
          >
            <AdminCard service={service} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboardCards;
