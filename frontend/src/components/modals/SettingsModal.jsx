import React, { useState } from 'react';
import { X, User, DollarSign, Image } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function SettingsModal({ onClose }) {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [currency, setCurrency] = useState(user?.currency || '$');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({ name, currency, avatar });
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-[#14151f] border border-[#272a3d] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#212332]">
          <h3 className="text-base font-bold text-white">Profile & Settings</h3>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#1b1c28] hover:bg-[#25273a] text-[#8e91a8] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          {saved && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-3 rounded-xl">
              Settings updated successfully!
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-[#878a9f] block mb-1.5">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#1a1b27] border border-[#272a3d] rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[#878a9f] block mb-1.5">Currency Symbol</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-[#1a1b27] border border-[#272a3d] rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-purple-500"
            >
              <option value="$">$ (USD)</option>
              <option value="€">€ (EUR)</option>
              <option value="£">£ (GBP)</option>
              <option value="₹">₹ (INR)</option>
              <option value="¥">¥ (JPY)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-[#878a9f] block mb-1.5">Avatar Image URL</label>
            <input
              type="text"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://..."
              className="w-full bg-[#1a1b27] border border-[#272a3d] rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-purple-500"
            />
          </div>

          <div className="pt-3 flex justify-end space-x-2 border-t border-[#202230]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-[#878a9f] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-500 text-white font-medium px-5 py-2 rounded-xl text-xs transition-colors"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
