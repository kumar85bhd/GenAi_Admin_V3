import React, { useState, useEffect } from 'react';
import { Service, Metric, HealthStatus } from '../types';
import { fetchServiceMetrics } from '../services/api';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { DynamicIcon } from '../../../shared/components/ui/DynamicIcon';
import { getCategoryStyles } from '../../../shared/utils/categoryColors';

interface AdminCardProps {
  service: Service;
}

const getStatusColor = (status: HealthStatus) => {
  switch (status) {
    case HealthStatus.HEALTHY: return 'bg-emerald-500';
    case HealthStatus.WARNING: return 'bg-amber-500';
    case HealthStatus.CRITICAL: return 'bg-red-500';
    default: return 'bg-slate-300';
  }
};

/**
 * AdminCard
 * Displays a single infrastructure service card with metrics.
 * Handles click behaviors for opening the service.
 */
const AdminCard: React.FC<AdminCardProps> = ({ service }) => {
  const [metrics, setMetrics] = useState<Metric[]>(service.metrics || []);
  const [loading, setLoading] = useState(false);
  const colors = getCategoryStyles(service.category);

  const handleRefresh = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setLoading(true);
    try {
      const newMetrics = await fetchServiceMetrics(service.id);
      if (newMetrics && newMetrics.length > 0) {
        setMetrics(newMetrics);
      }
    } catch {
      setMetrics([{ label: 'Status', value: 'N/A' }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!metrics.length) {
      handleRefresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpen = (e: React.MouseEvent) => {
    const url = service.url || `https://${service.id}.example.com`;
    if (e.ctrlKey || e.metaKey || e.button === 1) {
      window.open(url, '_blank');
    } else {
      window.open(url, '_self');
    }
  };

  return (
    <div
      onClick={handleOpen}
      onAuxClick={handleOpen}
      className={`group relative bg-white dark:bg-slate-800 bg-gradient-to-br ${colors.bg} ${colors.activeBorder} border shadow-sm hover:shadow-lg hover:-translate-y-1 rounded-2xl p-6 cursor-pointer transition-all duration-300 flex flex-col h-full overflow-hidden`}
    >
      {/* Status Indicator Line */}
      <div className={`absolute top-0 left-0 w-full h-1.5 ${getStatusColor(service.status)} opacity-80`} />
      
      {/* Background Glow Effect */}
      <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity ${getStatusColor(service.status)}`} />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl transition-transform duration-300 group-hover:scale-110 ${colors.bg} ${colors.activeText}`}>
            <DynamicIcon name={service.icon || service.type || 'Box'} size={18} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {service.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] ${colors.activeText} font-medium`}>
                {service.category}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 shadow-sm rounded-lg transition-all"
            title="Refresh Metrics"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <div className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
             <ExternalLink size={16} />
          </div>
        </div>
      </div>

      {service.description && (
        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-6 leading-relaxed relative z-10">
          {service.description}
        </p>
      )}

      {metrics.length > 0 && (
        <div className="mt-auto space-y-3 relative z-10">
          <div className="grid grid-cols-2 gap-3">
            {metrics.map((m, i) => (
              <div key={i} className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm rounded-xl p-3 border border-slate-200/50 dark:border-slate-700/30 group-hover:border-indigo-500/20 transition-colors">
                <div className="text-[10px] text-slate-500 dark:text-slate-500 uppercase tracking-wider font-bold mb-1">{m.label}</div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-100 font-mono">{m.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCard;
