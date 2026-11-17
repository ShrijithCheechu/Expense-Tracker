import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { api } from '../../services/api';

export default function EditLimitationModal({ account, onClose, onSuccess }) {
  const [limit, setLimit] = useState(account?.monthly_limit || 18000);
  const [fee, setFee] = useState(account?.monthly_fee || 64.83);
  const [paymentMode, setPaymentMode] = useState(account?.payment_mode || 'Direct Debits');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isNaN(parseFloat(limit)) || parseFloat(limit) < 0) {
      setError('Please enter a valid monthly limit.');
      return;
    }

    setLoading(true);
    try {
      const updated = await api.updateAccount(account.id, {
        monthly_limit: parseFloat(limit),
        monthly_fee: parseFloat(fee),
        payment_mode: paymentMode
      });
      onSuccess && onSuccess(updated);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update limitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-[#14151f] border border-[#272a3d] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#212332]">
          <div>
            <h3 className="text-base font-bold text-white">Edit Account Limitation</h3>
            <p className="text-xs text-[#7d8096] mt-0.5">{account?.name || 'VISA Debit'} (**** {account?.last4 || '2874'})</p>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#1b1c28] hover:bg-[#25273a] text-[#8e91a8] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-[#878a9f] block mb-1.5">
              Monthly Spending Limit ($)
            </label>
            <input
              type="number"
              step="100"
              min="0"
              required
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="w-full bg-[#1a1b27] border border-[#272a3d] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[#878a9f] block mb-1.5">
              Monthly Maintenance Fee ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              className="w-full bg-[#1a1b27] border border-[#272a3d] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[#878a9f] block mb-1.5">
              Payment Mode
            </label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full bg-[#1a1b27] border border-[#272a3d] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
            >
              <option value="Direct Debits">Direct Debits</option>
              <option value="Standing Order">Standing Order</option>
              <option value="Manual Transfer">Manual Transfer</option>
            </select>
          </div>

          <div className="pt-3 flex items-center justify-end space-x-3 border-t border-[#202230]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-[#878a9f] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium px-5 py-2 rounded-xl text-xs shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Limitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
