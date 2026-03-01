import React, { useEffect, useState } from 'react';
import { X, ExternalLink, Activity, Clock, Star, Share2, Zap, ArrowUpRight } from 'lucide-react';
import { AppData, AppMetric } from '../../../shared/types';
import { api } from '../../../shared/services/api';
import { Tooltip } from '../../../shared/components/ui/Tooltip';
import { usePreferences } from '../../../shared/context/usePreferences';
import { useUserPreference } from '../../../shared/context/useUserPreference';
import { getCategoryStyles } from '../../../shared/utils/categoryColors';

interface DetailPanelProps {
  app: AppData | null;
  onClose: () => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ app, onClose }) => {
    const [metric, setMetric] = useState<AppMetric | null>(null);
  const [loading, setLoading] = useState(false);
  const { openInNewTab } = usePreferences();
  const { favorites, toggleFavorite } = useUserPreference();
  const isFavorite = app ? favorites.includes(app.id) : false;

  useEffect(() => {
    let isMounted = true;
    if (app?.id && app.metricsEnabled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true);
      api.getMetrics(app.id).then(({ data }) => {
        if (isMounted) {
          setMetric(data);
          setLoading(false);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [app?.id, app?.metricsEnabled]);

  if (!app) return null;

  const handleLaunch = () => {
    if (app.url) {
      window.open(app.url, openInNewTab ? '_blank' : '_self');
    }
  };

  const catStyles = getCategoryStyles(app.category || 'Uncategorized');

  return (
    <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity pointer-events-auto"
        onClick={onClose}
      />
      
      <div className="w-full max-w-md bg-card h-full shadow-2xl pointer-events-auto transform transition-transform flex flex-col animate-in slide-in-from-right duration-300 border-l border-border">
        <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/50">
          <div className="flex items-center gap-3">
            <Tooltip content="Close Panel" position="bottom">
              <button onClick={onClose} className="p-2 -ml-2 hover:bg-secondary rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring/40">
                <X size={20} className="text-muted-foreground" />
              </button>
            </Tooltip>
            <span className="text-sm font-medium text-muted-foreground">App Details</span>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip content={app.isFavorite ? "Remove from Favorites" : "Add to Favorites"} position="bottom">
              <button 
                onClick={() => app && toggleFavorite(app.id)}
                className={`p-2 rounded-full border transition-all focus:outline-none focus:ring-2 focus:ring-ring/40 ${
                  isFavorite 
                    ? 'bg-amber-400/10 border-amber-400/20 text-amber-400' 
                    : 'bg-secondary border-border text-muted-foreground hover:border-border-hover'
                }`}
              >
                <Star size={18} fill={isFavorite ? "currentColor" : "none"} />
              </button>
            </Tooltip>
            <Tooltip content="Share App" position="bottom">
              <button className="p-2 rounded-full bg-secondary border border-border text-muted-foreground hover:text-primary hover:border-primary/20 transition-all focus:outline-none focus:ring-2 focus:ring-ring/40">
                <Share2 size={18} />
              </button>
            </Tooltip>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex items-start gap-4 mb-6">
            <div className={`w-16 h-16 rounded-2xl ${catStyles.bg} ${catStyles.text} flex items-center justify-center shadow-lg`}>
              <Zap size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{app.name}</h2>
              <p className="text-muted-foreground">{app.category}</p>
            </div>
          </div>

          {app.desc ? (
            <p className="text-foreground/80 leading-relaxed mb-8 whitespace-pre-wrap">
              {app.desc}
            </p>
          ) : (
            <div className="mb-8" />
          )}

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-secondary border border-border">
              <div className="flex items-center gap-2 text-muted-foreground mb-2 text-sm">
                <Activity size={16} />
                <span>Recent Activity</span>
              </div>
              <p className="font-semibold text-foreground">{app.baseActivity}</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary border border-border">
              <div className="flex items-center gap-2 text-muted-foreground mb-2 text-sm">
                <Clock size={16} />
                <span>Last Used</span>
              </div>
              <p className="font-semibold text-foreground">2 hours ago</p>
            </div>
          </div>

          {app.metricsEnabled && (
            loading ? (
              <div className="h-24 rounded-xl bg-secondary animate-pulse mb-8" />
            ) : metric ? (
              <div className="p-5 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 mb-8">
                <p className="text-primary-foreground/80 text-sm font-medium mb-1">{metric.name}</p>
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-bold">{metric.value}</span>
                  {metric.trend && (
                    <span className={`text-sm px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm ${
                      metric.trend === 'up' ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {metric.trend === 'up' ? '+12%' : '-5%'}
                    </span>
                  )}
                </div>
              </div>
            ) : null
          )}

          {app.keyFeatures && (
            <>
              <h3 className="font-semibold text-foreground mb-3">Key Features</h3>
              <ul className="space-y-3 mb-8">
                {app.keyFeatures.split('\n').filter(f => f.trim()).map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <div className="w-5 h-5 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span>{feature.trim()}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="p-6 border-t border-border bg-secondary/30">
          <Tooltip content={!app.url ? "Link not provided" : `Launch in ${openInNewTab ? 'new' : 'same'} tab`}>
            <button 
              onClick={handleLaunch}
              disabled={!app.url}
              className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r ${catStyles.gradient} hover:brightness-110 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:hover:shadow-md`}
            >
              <span>Launch Application</span>
              {openInNewTab ? <ExternalLink size={18} /> : <ArrowUpRight size={18} />}
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default DetailPanel;
