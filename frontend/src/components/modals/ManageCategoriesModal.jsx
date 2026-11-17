import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Tag, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

export default function ManageCategoriesModal({ onClose, onCategoriesUpdated }) {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [kind, setKind] = useState('expense');
  const [reassignModal, setReassignModal] = useState(null); // category to delete
  const [reassignTo, setReassignTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCats();
  }, []);

  const loadCats = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data.results || data || []);
    } catch {
      // ignore
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError('');
    try {
      await api.createCategory({ name: name.trim(), kind, icon: 'Tag' });
      setName('');
      await loadCats();
      onCategoriesUpdated && onCategoriesUpdated();
    } catch (err) {
      setError(err.message || 'Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cat) => {
    setError('');
    try {
      await api.deleteCategory(cat.id);
      await loadCats();
      onCategoriesUpdated && onCategoriesUpdated();
    } catch (err) {
      if (err.message && err.message.includes('reassign')) {
        // Needs reassignment
        setReassignModal(cat);
        const candidates = categories.filter(c => c.id !== cat.id && c.kind === cat.kind);
        if (candidates.length > 0) setReassignTo(candidates[0].id);
      } else {
        setError(err.message || 'Failed to delete category');
      }
    }
  };

  const confirmReassignDelete = async () => {
    if (!reassignModal || !reassignTo) return;
    setLoading(true);
    setError('');
    try {
      await api.deleteCategory(reassignModal.id, reassignTo);
      setReassignModal(null);
      await loadCats();
      onCategoriesUpdated && onCategoriesUpdated();
    } catch (err) {
      setError(err.message || 'Failed to reassign and delete');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-[#14151f] border border-[#272a3d] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#212332]">
          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4 text-purple-400" />
            <h3 className="text-base font-bold text-white">Manage Categories</h3>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#1b1c28] hover:bg-[#25273a] text-[#8e91a8] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Add Category Form */}
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="New category name..."
              className="flex-1 bg-[#1a1b27] border border-[#272a3d] focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
            />
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              className="bg-[#1a1b27] border border-[#272a3d] rounded-xl px-3 py-2 text-xs text-white outline-none"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1 disabled:opacity-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>

          {/* Categories List */}
          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between bg-[#191a26] border border-[#232536] px-3.5 py-2 rounded-xl text-xs"
              >
                <div className="flex items-center space-x-2.5">
                  <span className={`w-2 h-2 rounded-full ${cat.kind === 'income' ? 'bg-emerald-400' : 'bg-purple-400'}`} />
                  <span className="font-medium text-white">{cat.name}</span>
                  <span className="text-[10px] text-[#71748d] uppercase tracking-wider">({cat.kind})</span>
                </div>
                <button
                  onClick={() => handleDelete(cat)}
                  className="p-1 rounded-lg hover:bg-red-500/20 text-[#71748d] hover:text-red-400 transition-colors"
                  title="Delete category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Reassignment Modal overlay if category in use */}
          {reassignModal && (
            <div className="p-4 bg-[#1b1c2b] border border-amber-500/30 rounded-xl space-y-3">
              <div className="flex items-start space-x-2 text-amber-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Reassignment Required:</span> This category is currently used by existing transactions. Select a replacement category before deleting.
                </div>
              </div>

              <select
                value={reassignTo}
                onChange={(e) => setReassignTo(e.target.value)}
                className="w-full bg-[#14151f] border border-[#2b2d42] rounded-lg px-3 py-2 text-xs text-white"
              >
                {categories.filter(c => c.id !== reassignModal.id && c.kind === reassignModal.kind).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setReassignModal(null)}
                  className="px-3 py-1.5 text-xs text-[#82859c]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmReassignDelete}
                  className="bg-amber-600 hover:bg-amber-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold"
                >
                  Reassign & Delete
                </button>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end border-t border-[#202230]">
            <button
              onClick={onClose}
              className="bg-[#1c1d29] hover:bg-[#252738] text-white px-4 py-2 rounded-xl text-xs transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
