import React, { useState, useEffect } from 'react';
import { ToastType } from '../../../shared/components/Toast';
import WorkspaceAppsTab from './WorkspaceAppsTab';
import AdminDashboardLinksTab from './AdminDashboardLinksTab';
import ManageCategoriesTab from './ManageCategoriesTab';

interface AdminApplicationsPageProps {
  addToast: (message: string, type?: ToastType) => void;
}

const AdminApplicationsPage: React.FC<AdminApplicationsPageProps> = ({ addToast }) => {
  const [activeTab, setActiveTab] = useState<'apps' | 'links' | 'categories'>('apps');
  const [counts, setCounts] = useState({ apps: 0, links: 0, categories: 0 });

  const fetchCounts = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const [appsRes, linksRes, catRes] = await Promise.all([
        fetch('/api/workspace/apps?all=true', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/dashboard-links', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/workspace/categories', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (appsRes.ok && linksRes.ok && catRes.ok) {
        const apps = await appsRes.json();
        const links = await linksRes.json();
        const cats = await catRes.json();
        setCounts({
          apps: Array.isArray(apps) ? apps.length : 0,
          links: Array.isArray(links) ? links.length : 0,
          categories: Array.isArray(cats) ? cats.length : 0
        });
      }
    } catch (err) {
      console.error('Error fetching counts:', err);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, [activeTab]); // Refresh counts when switching tabs or on mount

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('apps')}
          className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'apps'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          Workspace Applications
          <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
            {counts.apps}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('links')}
          className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'links'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          System Admin Links
          <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
            {counts.links}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'categories'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          Manage Categories
          <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
            {counts.categories}
          </span>
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'apps' && <WorkspaceAppsTab addToast={addToast} />}
        {activeTab === 'links' && <AdminDashboardLinksTab addToast={addToast} />}
        {activeTab === 'categories' && <ManageCategoriesTab addToast={addToast} />}
      </div>
    </div>
  );
};

export default AdminApplicationsPage;
