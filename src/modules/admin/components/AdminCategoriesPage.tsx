import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, Check, X, Link as LinkIcon } from 'lucide-react';
import { ToastType } from '../../../shared/components/Toast';

interface CategoryData {
  id: number;
  name: string;
  icon: string;
}

interface AdminCategoriesPageProps {
  addToast: (message: string, type?: ToastType) => void;
}

const AdminCategoriesPage: React.FC<AdminCategoriesPageProps> = ({ addToast }) => {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<CategoryData>>({});
  const [isCreating, setIsCreating] = useState(false);

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
      const res = await fetch('/api/workspace/categories', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(editForm)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create category');
      }
      setIsCreating(false);
      setEditForm({});
      fetchCategories();
      addToast('Category created successfully', 'success');
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleUpdate = async (id: number) => {
    if (!validateForm(editForm)) return;

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`/api/workspace/categories/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(editForm)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update category');
      }
      setIsEditing(null);
      setEditForm({});
      fetchCategories();
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
      if (!res.ok) throw new Error('Failed to delete category');
      fetchCategories();
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

  if (loading) return <div className="p-8 text-center">Loading categories...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <h3 className="font-semibold text-lg">Manage Categories</h3>
        <div className="flex items-center gap-4">
            <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 flex items-center gap-1">
                <LinkIcon size={14} />
                Icon Reference
            </a>
            <button 
              onClick={startCreate}
              disabled={isCreating}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Plus size={16} />
              Add Category
            </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Icon</th>
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
                    placeholder="Category Name"
                  />
                </td>
                <td className="px-6 py-4">
                  <input 
                    type="text" 
                    value={editForm.icon || ''} 
                    onChange={e => setEditForm({...editForm, icon: e.target.value})}
                    className="w-full px-2 py-1 border rounded dark:bg-slate-800 dark:border-slate-600"
                    placeholder="Icon Name (e.g. Folder)"
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

            {categories.map(category => {
              const editing = isEditing === category.id;
              return (
                <tr key={category.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    {editing ? (
                      <input 
                        type="text" 
                        value={editForm.name || ''} 
                        onChange={e => setEditForm({...editForm, name: e.target.value})}
                        className="w-full px-2 py-1 border rounded dark:bg-slate-800 dark:border-slate-600"
                      />
                    ) : (
                      <span className="font-medium text-slate-900 dark:text-white">{category.name}</span>
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
                      <span className="text-slate-500 font-mono text-xs">{category.icon}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editing ? (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleUpdate(category.id)} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"><Check size={18} /></button>
                        <button onClick={cancelEdit} className="p-1 text-slate-400 hover:bg-slate-100 rounded"><X size={18} /></button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => startEdit(category)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(category.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            
            {categories.length === 0 && !isCreating && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCategoriesPage;
