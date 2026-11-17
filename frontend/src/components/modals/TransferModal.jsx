import React, { useState } from 'react';
import { X, ArrowRightLeft } from 'lucide-react';
import { api } from '../../services/api';

export default function TransferModal({ accounts = [], onClose, onSuccess }) {
  const [fromAccount, setFromAccount] = useState(accounts[0]?.id || '');
  const [toAccount, setToAccount] = useState(accounts[1]?.id || '');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fromAccount || !toAccount) {
      setError('Please select both source and destination accounts.');
      return;
    }
    if (fromAccount === toAccount) {
      setError('Source and destination accounts must be different.');
      return;
    }
    const amtNum = parseFloat(amount);
    if (isNaN(amtNum) || amtNum <= 0) {
      setError('Please enter a valid positive transfer amount.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.transfer({
        from_account: fromAccount,
        to_account: toAccount,
        amount: amtNum,
        notes: notes || 'Account transfer'
      });
      onSuccess && onSuccess(res);
      onClose();
    } catch (err) {
      setError(err.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-[#14151f] border border-[#272a3d] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#212332]">
          <div className="flex items-center space-x-2">
            <ArrowRightLeft className="w-4 h-4 text-purple-400" />
            <h3 className="text-base font-bold text-white">Transfer Between Accounts</h3>
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
              From Account (Debit)
            </label>
            <select
              value={fromAccount}
              onChange={(e) => setFromAccount(e.target.value)}
              className="w-full bg-[#1a1b27] border border-[#272a3d] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (${Number(acc.current_balance || 0).toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-[#878a9f] block mb-1.5">
              To Account (Credit)
            </label>
            <select
              value={toAccount}
              onChange={(e) => setToAccount(e.target.value)}
              className="w-full bg-[#1a1b27] border border-[#272a3d] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (${Number(acc.current_balance || 0).toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-[#878a9f] block mb-1.5">
              Transfer Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-[#1a1b27] border border-[#272a3d] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[#878a9f] block mb-1.5">
              Reference / Note
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Monthly savings contribution"
              className="w-full bg-[#1a1b27] border border-[#272a3d] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
            />
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
              {loading ? 'Transferring...' : 'Execute Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
