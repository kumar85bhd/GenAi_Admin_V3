import React, { useState, useEffect, useCallback } from 'react';
import { Edit2, Trash2, Plus, Check, X, FileText, Info, ArrowUp, ArrowDown } from 'lucide-react';
import { ToastType } from '../../../shared/components/Toast';
import { Tooltip } from '../../../shared/components/ui/Tooltip';

interface AppData {
  id: number;
  name: string;
  category: string;
  icon: string;
  url: string;
  description: string;
  key_features?: string;
  is_active: number;
  metrics_enabled: number;
}

interface CategoryData {
  id: number;
  name: string;
}

interface WorkspaceAppsTabProps {
  addToast: (message: string, type?: ToastType) => void;
}

const WorkspaceAppsTab: React.FC<WorkspaceAppsTabProps> = ({ addToast }) => {
  const [apps, setApps] = useState<AppData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<AppData>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof AppData; direction: 'asc' | 'desc' } | null>(null);

  const fetchAppsAndCategories = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      const [appsRes, catRes] = await Promise.all([
        fetch('/api/workspace/apps?all=true', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/workspace/categories', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (!appsRes.ok) throw new Error('Failed to fetch apps');
      if (!catRes.ok) throw new Error('Failed to fetch categories');
      
      const appsData = await appsRes.json();
      const catData = await catRes.json();
      
      setApps(appsData);
      setCategories(catData);
    } catch (err: any) {
      setError(err.message);
      addToast('Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchAppsAndCategories();
  }, [fetchAppsAndCategories]);

  const validateForm = (form: Partial<AppData>) => {
    if (!form.name || (form.name || '').length > 50) {
      addToast('Name is required and must be less than 50 characters', 'error');
      return false;
    }
    if (!form.name.match(/^[a-zA-Z0-9 &_-]+$/)) {
      addToast('Name contains invalid characters. Only alphanumeric, spaces, hyphens, and underscores are allowed.', 'error');
      return false;
    }
    if (!form.category) {
      addToast('Category is required', 'error');
      return false;
    }
    if (form.url && !form.url.match(/^https?:\/\/.+/)) {
      addToast('URL must start with http:// or https://', 'error');
      return false;
    }
    return true;
  };

  const handleCreate = async () => {
    if (!validateForm(editForm)) return;

    try {
      const token = localStorage.getItem('access_token');
      const selectedCategory = categories.find(c => c.name === editForm.category);
      const payload = {
        ...editForm,
        category_id: selectedCategory ? selectedCategory.id : 1,
        slug: editForm.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || ''
      };

      const res = await fetch('/api/workspace/apps', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create app');
      }
      setIsCreating(false);
      setEditForm({});
      fetchAppsAndCategories();
      addToast('Application created successfully', 'success');
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleUpdate = async (id: number) => {
    if (!validateForm(editForm)) return;

    try {
      const token = localStorage.getItem('access_token');
      const selectedCategory = categories.find(c => c.name === editForm.category);
      const payload = {
        ...editForm,
        category_id: selectedCategory ? selectedCategory.id : 1,
        slug: editForm.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || ''
      };

      const res = await fetch(`/api/workspace/apps/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update app');
      }
      setIsEditing(null);
      setEditForm({});
      fetchAppsAndCategories();
      addToast('Application updated successfully', 'success');
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`/api/workspace/apps/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete app');
      fetchAppsAndCategories();
      setIsDeleting(null);
      addToast('Application deleted successfully', 'success');
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const startEdit = (app: AppData) => {
    setIsEditing(app.id);
    setEditForm(app);
    setIsCreating(false);
  };

  const startCreate = () => {
    setIsCreating(true);
    setIsEditing(null);
    setEditForm({
      name: '',
      category: (categories || []).length > 0 ? categories[0].name : '',
      icon: 'Box',
      url: '',
      description: '',
      key_features: '',
      is_active: 1,
      metrics_enabled: 0
    });
  };

  const cancelEdit = () => {
    setIsEditing(null);
    setIsCreating(false);
    setEditForm({});
  };

  const handleSort = (key: keyof AppData) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedApps = React.useMemo(() => {
    if (!sortConfig) return apps;
    return [...apps].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [apps, sortConfig]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 sticky top-0 z-20">
        <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Workspace Applications</h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={startCreate}
            disabled={isCreating}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Plus size={16} />
            Add Application
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading applications...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 sticky top-0 z-10">
                <tr>
                  <th 
                    className="px-6 py-3 font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Name
                      {sortConfig?.key === 'name' && (
                        sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center gap-1">
                      Category
                      {sortConfig?.key === 'category' && (
                        sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 font-medium">
                    <div className="flex items-center gap-1">
                      Icon
                      <Tooltip content="Refer to lucide.dev/icons for icon names" position="top">
                        <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 transition-colors">
                          <Info size={14} />
                        </a>
                      </Tooltip>
                    </div>
                  </th>
                  <th className="px-6 py-3 font-medium">URL</th>
                  <th className="px-6 py-3 font-medium text-center">Content</th>
                  <th className="px-6 py-3 font-medium text-center">Active</th>
                  <th className="px-6 py-3 font-medium text-center">
                    <div className="flex items-center justify-center gap-1">
                      Metrics
                      <Tooltip content="If enabled, the app will attempt to fetch and display metrics in the detail panel." position="top">
                        <Info size={14} className="text-slate-400 cursor-help" />
                      </Tooltip>
                    </div>
                  </th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {isCreating && (
                  <tr className="bg-indigo-50/50 dark:bg-indigo-900/10">
                    <td className="px-6 py-4">
                      <input 
                        type="text" 
                        value={editForm.name || ''} 
                        onChange={e => setEditForm({...editForm, name: e.target.value})}
                        className="w-full px-2 py-1 border rounded dark:bg-slate-800 dark:border-slate-600"
                        placeholder="App Name"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={editForm.category || ''}
                        onChange={e => setEditForm({...editForm, category: e.target.value})}
                        className="w-full px-2 py-1 border rounded dark:bg-slate-800 dark:border-slate-600"
                      >
                        <option value="" disabled>Select Category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="text" 
                        value={editForm.icon || ''} 
                        onChange={e => setEditForm({...editForm, icon: e.target.value})}
                        className="w-full px-2 py-1 border rounded dark:bg-slate-800 dark:border-slate-600"
                        placeholder="Icon (e.g. Box)"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="text" 
                        value={editForm.url || ''} 
                        onChange={e => setEditForm({...editForm, url: e.target.value})}
                        className="w-full px-2 py-1 border rounded dark:bg-slate-800 dark:border-slate-600"
                        placeholder="https://..."
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setIsTextModalOpen(true)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 transition-colors"
                      >
                        <FileText size={14} />
                        Edit
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={!!editForm.is_active} 
                        onChange={e => setEditForm({...editForm, is_active: e.target.checked ? 1 : 0})}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={!!editForm.metrics_enabled} 
                        onChange={e => setEditForm({...editForm, metrics_enabled: e.target.checked ? 1 : 0})}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={handleCreate} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"><Check size={18} /></button>
                        <button onClick={cancelEdit} className="p-1 text-slate-400 hover:bg-slate-100 rounded"><X size={18} /></button>
                      </div>
                    </td>
                  </tr>
                )}

                {sortedApps.map(app => {
                  const editing = isEditing === app.id;
                  return (
                    <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        {editing ? (
                          <input 
                            type="text" 
                            value={editForm.name || ''} 
                            onChange={e => setEditForm({...editForm, name: e.target.value})}
                            className="w-full px-2 py-1 border rounded dark:bg-slate-800 dark:border-slate-600"
                          />
                        ) : (
                          <span className="font-medium text-slate-900 dark:text-white">{app.name}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editing ? (
                          <select
                            value={editForm.category || ''}
                            onChange={e => setEditForm({...editForm, category: e.target.value})}
                            className="w-full px-2 py-1 border rounded dark:bg-slate-800 dark:border-slate-600"
                          >
                            <option value="" disabled>Select Category</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-slate-600 dark:text-slate-300">{app.category}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editing ? (
                          <input 
                            type="text" 
                            value={editForm.icon || ''} 
                            onChange={e => setEditForm({...editForm, icon: e.target.value})}
                            className="w-full px-2 py-1 border rounded dark:bg-slate-800 dark:border-slate-600"
                          />
                        ) : (
                          <span className="text-slate-500 font-mono text-xs">{app.icon}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editing ? (
                          <input 
                            type="text" 
                            value={editForm.url || ''} 
                            onChange={e => setEditForm({...editForm, url: e.target.value})}
                            className="w-full px-2 py-1 border rounded dark:bg-slate-800 dark:border-slate-600"
                          />
                        ) : (
                          <span className="text-slate-500 truncate max-w-[200px] block" title={app.url}>{app.url}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {editing ? (
                          <button
                            onClick={() => setIsTextModalOpen(true)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 transition-colors"
                          >
                            <FileText size={14} />
                            Edit
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs">
                            {app.description || app.key_features ? 'Has Content' : 'Empty'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {editing ? (
                          <input 
                            type="checkbox" 
                            checked={!!editForm.is_active} 
                            onChange={e => setEditForm({...editForm, is_active: e.target.checked ? 1 : 0})}
                            className="w-4 h-4 text-indigo-600 rounded"
                          />
                        ) : (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${app.is_active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'}`}>
                            {app.is_active ? 'Yes' : 'No'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {editing ? (
                          <input 
                            type="checkbox" 
                            checked={!!editForm.metrics_enabled} 
                            onChange={e => setEditForm({...editForm, metrics_enabled: e.target.checked ? 1 : 0})}
                            className="w-4 h-4 text-indigo-600 rounded"
                          />
                        ) : (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${app.metrics_enabled ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'}`}>
                            {app.metrics_enabled ? 'Yes' : 'No'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {editing ? (
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleUpdate(app.id)} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"><Check size={18} /></button>
                            <button onClick={cancelEdit} className="p-1 text-slate-400 hover:bg-slate-100 rounded"><X size={18} /></button>
                          </div>
                        ) : isDeleting === app.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-xs text-red-500 mr-2 font-medium">Delete?</span>
                            <button onClick={() => handleDelete(app.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Check size={18} /></button>
                            <button onClick={() => setIsDeleting(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded"><X size={18} /></button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => startEdit(app)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
                            <button onClick={() => setIsDeleting(app.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                
                {apps.length === 0 && !isCreating && (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                      No applications found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isTextModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Edit Content</h3>
              <button onClick={() => setIsTextModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea 
                  value={editForm.description || ''} 
                  onChange={e => setEditForm({...editForm, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="App description..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Key Features (One per line)</label>
                <textarea 
                  value={editForm.key_features || ''} 
                  onChange={e => setEditForm({...editForm, key_features: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700 min-h-[150px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                />
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
              <button 
                onClick={() => setIsTextModalOpen(false)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceAppsTab;
