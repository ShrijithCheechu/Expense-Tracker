import React, { useState } from 'react';
import { X, CreditCard } from 'lucide-react';
import { api } from '../../services/api';

export default function AddCardModal({ onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('VISA');
  const [last4, setLast4] = useState('');
  const [paymentMode, setPaymentMode] = useState('Direct Debits');
  const [openingBalance, setOpeningBalance] = useState('1000.00');
  const [monthlyLimit, setMonthlyLimit] = useState('5000.00');
  const [monthlyFee, setMonthlyFee] = useState('0.00');
  const [isPrimary, setIsPrimary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide an account or card name.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.createAccount({
        name,
        type,
        last4: last4.padStart(4, '0').slice(-4),
        payment_mode: paymentMode,
        opening_balance: parseFloat(openingBalance) || 0.0,
        monthly_limit: parseFloat(monthlyLimit) || 5000.0,
        monthly_fee: parseFloat(monthlyFee) || 0.0,
        is_primary: isPrimary
      });
      onSuccess && onSuccess(res);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add card');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-[#14151f] border border-[#272a3d] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#212332]">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-purple-400" />
            <h3 className="text-base font-bold text-white">Add New Card / Account</h3>
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
              Account / Card Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chase Sapphire, Main Checking, Cash Pocket"
              className="w-full bg-[#1a1b27] border border-[#272a3d] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#878a9f] block mb-1.5">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-[#1a1b27] border border-[#272a3d] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
              >
                <option value="VISA">VISA</option>
                <option value="Mastercard">Mastercard</option>
                <option value="Bank">Bank Account</option>
                <option value="Cash">Cash / Petty</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-[#878a9f] block mb-1.5">
                Last 4 Digits
              </label>
              <input
                type="text"
                maxLength="4"
                value={last4}
                onChange={(e) => setLast4(e.target.value.replace(/\D/g, ''))}
                placeholder="2874"
                className="w-full bg-[#1a1b27] border border-[#272a3d] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#878a9f] block mb-1.5">
                Opening Balance ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                className="w-full bg-[#1a1b27] border border-[#272a3d] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#878a9f] block mb-1.5">
                Monthly Spending Limit ($)
              </label>
              <input
                type="number"
                step="100"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
                className="w-full bg-[#1a1b27] border border-[#272a3d] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono"
              />
            </div>
          </div>

          <label className="flex items-center space-x-2.5 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="w-4 h-4 rounded bg-[#1a1b27] border-[#272a3d] text-purple-600 focus:ring-0"
            />
            <span className="text-xs text-[#a3a6be]">
              Set as primary account for dashboard
            </span>
          </label>

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
              {loading ? 'Creating...' : 'Add Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
