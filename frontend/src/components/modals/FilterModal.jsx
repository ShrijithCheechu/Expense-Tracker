import React, { useState } from 'react';
import { X, Filter, RotateCcw } from 'lucide-react';

export default function FilterModal({ filters, onApply, onClose, categories = [], accounts = [] }) {
  const [status, setStatus] = useState(filters?.status || '');
  const [kind, setKind] = useState(filters?.kind || '');
  const [category, setCategory] = useState(filters?.category || '');
  const [account, setAccount] = useState(filters?.account || '');
  const [startDate, setStartDate] = useState(filters?.start_date || '');
  const [endDate, setEndDate] = useState(filters?.end_date || '');
  const [minAmount, setMinAmount] = useState(filters?.min_amount || '');
  const [maxAmount, setMaxAmount] = useState(filters?.max_amount || '');

  const handleReset = () => {
    setStatus('');
    setKind('');
    setCategory('');
    setAccount('');
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
    onApply({});
    onClose();
  };

  const handleApply = (e) => {
    e.preventDefault();
    onApply({
      status,
      kind,
      category,
      account,
      start_date: startDate,
      end_date: endDate,
      min_amount: minAmount,
      max_amount: maxAmount,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-[#14151f] border border-[#272a3d] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#212332]">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-purple-400" />
            <h3 className="text-base font-bold text-white">Filter Transactions</h3>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#1b1c28] hover:bg-[#25273a] text-[#8e91a8] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleApply} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#878a9f] block mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#1a1b27] border border-[#272a3d] rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="">All Statuses</option>
                <option value="Successful">Successful</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-[#878a9f] block mb-1.5">Type</label>
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value)}
                className="w-full bg-[#1a1b27] border border-[#272a3d] rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="">All Types</option>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#878a9f] block mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#1a1b27] border border-[#272a3d] rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-[#878a9f] block mb-1.5">Account</label>
              <select
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full bg-[#1a1b27] border border-[#272a3d] rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="">All Accounts</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#878a9f] block mb-1.5">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#1a1b27] border border-[#272a3d] rounded-xl px-3 py-1.5 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#878a9f] block mb-1.5">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-[#1a1b27] border border-[#272a3d] rounded-xl px-3 py-1.5 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#878a9f] block mb-1.5">Min Amount ($)</label>
              <input
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-[#1a1b27] border border-[#272a3d] rounded-xl px-3 py-1.5 text-xs text-white outline-none font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#878a9f] block mb-1.5">Max Amount ($)</label>
              <input
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                placeholder="10000"
                className="w-full bg-[#1a1b27] border border-[#272a3d] rounded-xl px-3 py-1.5 text-xs text-white outline-none font-mono"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between border-t border-[#202230]">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center space-x-1.5 text-xs text-[#7e819b] hover:text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs text-[#878a9f] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-500 text-white font-medium px-4 py-2 rounded-xl text-xs transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
