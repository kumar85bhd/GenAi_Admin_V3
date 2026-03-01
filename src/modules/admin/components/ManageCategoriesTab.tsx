import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, Check, X, Link as LinkIcon, ArrowUp, ArrowDown, Info } from 'lucide-react';
import { ToastType } from '../../../shared/components/Toast';
import { Tooltip } from '../../../shared/components/ui/Tooltip';

interface CategoryData {
  id: number;
  name: string;
  icon: string;
}

interface ManageCategoriesTabProps {
  addToast: (message: string, type?: ToastType) => void;
  onCategoriesUpdated?: () => void;
}

const ManageCategoriesTab: React.FC<ManageCategoriesTabProps> = ({ addToast, onCategoriesUpdated }) => {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<CategoryData>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof CategoryData; direction: 'asc' | 'desc' } | null>(null);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/api/workspace/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data);
    } catch (err: any) {
      setError(err.message);
      addToast('Failed to fetch categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const validateForm = (form: Partial<CategoryData>) => {
    if (!form.name || form.name.length > 50) {
      addToast('Name is required and must be less than 50 characters', 'error');
      return false;
    }
    if (!form.name.match(/^[a-zA-Z0-9 &_-]+$/)) {
      addToast('Name contains invalid characters. Only alphanumeric, spaces, hyphens, and underscores are allowed.', 'error');
      return false;
    }
    return true;
  };

  const handleCreate = async () => {
    if (!validateForm(editForm)) return;

    try {
      const token = localStorage.getItem('access_token');
      const payload = {
        ...editForm,
        slug: editForm.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || ''
      };

      const res = await fetch('/api/workspace/categories', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create category');
      }
      setIsCreating(false);
      setEditForm({});
      fetchCategories();
      if (onCategoriesUpdated) onCategoriesUpdated();
      addToast('Category created successfully', 'success');
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleUpdate = async (id: number) => {
    if (!validateForm(editForm)) return;

    try {
      const token = localStorage.getItem('access_token');
      const payload = {
        ...editForm,
        slug: editForm.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || ''
      };

      const res = await fetch(`/api/workspace/categories/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update category');
      }
      setIsEditing(null);
      setEditForm({});
      fetchCategories();
      if (onCategoriesUpdated) onCategoriesUpdated();
      addToast('Category updated successfully', 'success');
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`/api/workspace/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete category');
      }
      fetchCategories();
      setIsDeleting(null);
      if (onCategoriesUpdated) onCategoriesUpdated();
      addToast('Category deleted successfully', 'success');
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const startEdit = (category: CategoryData) => {
    setIsEditing(category.id);
    setEditForm(category);
    setIsCreating(false);
  };

  const startCreate = () => {
    setIsCreating(true);
    setIsEditing(null);
    setEditForm({
      name: '',
      icon: 'Folder',
    });
  };

  const cancelEdit = () => {
    setIsEditing(null);
    setIsCreating(false);
    setEditForm({});
  };

  const handleSort = (key: keyof CategoryData) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedCategories = React.useMemo(() => {
    if (!sortConfig) return categories;
    return [...categories].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [categories, sortConfig]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 sticky top-0 z-20">
        <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Manage Categories</h3>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">Icon Reference</span>
                <Tooltip content="Refer to lucide.dev/icons for icon names" position="bottom">
                    <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 transition-colors">
                        <Info size={16} />
                    </a>
                </Tooltip>
            </div>
            <button 
              onClick={startCreate}
              disabled={isCreating}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Plus size={16} />
              Add Category
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading categories...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 sticky top-0 z-10">
                <tr>
                  <th 
                    className="px-4 py-3 font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Name
                      {sortConfig?.key === 'name' && (
                        sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 font-medium">Icon</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {isCreating && (
                  <tr className="bg-indigo-50/50 dark:bg-indigo-900/10">
                    <td className="px-4 py-3">
                      <input 
                        type="text" 
                        value={editForm.name || ''} 
                        onChange={e => setEditForm({...editForm, name: e.target.value})}
                        className="w-full px-2 py-1 border rounded dark:bg-slate-800 dark:border-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Category Name"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input 
                        type="text" 
                        value={editForm.icon || ''} 
                        onChange={e => setEditForm({...editForm, icon: e.target.value})}
                        className="w-full px-2 py-1 border rounded dark:bg-slate-800 dark:border-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Icon Name (e.g. Folder)"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={handleCreate} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"><Check size={18} /></button>
                        <button onClick={cancelEdit} className="p-1 text-slate-400 hover:bg-slate-100 rounded"><X size={18} /></button>
                      </div>
                    </td>
                  </tr>
                )}

                {sortedCategories.map(category => {
                  const editing = isEditing === category.id;
                  return (
                    <tr key={category.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3">
                        {editing ? (
                          <input 
                            type="text" 
                            value={editForm.name || ''} 
                            onChange={e => setEditForm({...editForm, name: e.target.value})}
                            className="w-full px-2 py-1 border rounded dark:bg-slate-800 dark:border-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        ) : (
                          <span className="font-medium text-slate-900 dark:text-white">{category.name}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editing ? (
                          <input 
                            type="text" 
                            value={editForm.icon || ''} 
                            onChange={e => setEditForm({...editForm, icon: e.target.value})}
                            className="w-full px-2 py-1 border rounded dark:bg-slate-800 dark:border-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        ) : (
                          <span className="text-slate-500 font-mono text-xs">{category.icon}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {editing ? (
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleUpdate(category.id)} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"><Check size={18} /></button>
                            <button onClick={cancelEdit} className="p-1 text-slate-400 hover:bg-slate-100 rounded"><X size={18} /></button>
                          </div>
                        ) : isDeleting === category.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-xs text-red-500 mr-2 font-medium">Delete?</span>
                            <button onClick={() => handleDelete(category.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Check size={18} /></button>
                            <button onClick={() => setIsDeleting(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded"><X size={18} /></button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => startEdit(category)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
                            <button onClick={() => setIsDeleting(category.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                
                {categories.length === 0 && !isCreating && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                      No categories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCategoriesTab;
