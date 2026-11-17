import React, { useState, useEffect } from 'react';
import { X, Upload, Check } from 'lucide-react';
import { api } from '../../services/api';

export default function AddTransactionModal({ 
  onClose, 
  onSuccess, 
  initialKind = 'expense', 
  defaultAccount = null,
  isPettyDefault = false 
}) {
  const [name, setName] = useState('');
  const [kind, setKind] = useState(initialKind);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [account, setAccount] = useState(defaultAccount ? defaultAccount.id : '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().split(' ')[0].substring(0, 5));
  const [status, setStatus] = useState('Successful');
  const [isPetty, setIsPetty] = useState(isPettyDefault);
  const [notes, setNotes] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);

  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, accs] = await Promise.all([
          api.getCategories(),
          api.getAccounts()
        ]);
        setCategories(cats.results || cats || []);
        const accList = accs.results || accs || [];
        setAccounts(accList);
        if (!account && accList.length > 0) {
          setAccount(accList[0].id);
        }
      } catch (err) {
        console.error('Failed to load modal data', err);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const amtNum = parseFloat(amount);
    if (!name.trim()) {
      setError('Please enter a transaction title / description.');
      return;
    }
    if (isNaN(amtNum) || amtNum <= 0) {
      setError('Amount must be a positive number.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('kind', kind);
      formData.append('amount', amtNum.toFixed(2));
      if (category) formData.append('category', category);
      if (account) formData.append('account', account);
      formData.append('date', date);
      formData.append('time', time.length === 5 ? `${time}:00` : time);
      formData.append('status', status);
      formData.append('is_petty', isPetty ? 'true' : 'false');
      formData.append('notes', notes);
      if (receiptFile) {
        formData.append('receipt', receiptFile);
      }

      const res = await api.createTransaction(formData);
      onSuccess && onSuccess(res);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(c => c.kind === kind);

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-[#14151f] border border-[#272a3d] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#212332]">
          <h3 className="text-base font-bold text-white">
            Add New {kind === 'income' ? 'Income' : 'Expense'}
          </h3>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#1b1c28] hover:bg-[#25273a] text-[#8e91a8] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Kind Toggle */}
          <div className="grid grid-cols-2 gap-2 bg-[#1b1c28] p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setKind('expense')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                kind === 'expense'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-[#878a9f] hover:text-white'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setKind('income')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                kind === 'income'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-[#878a9f] hover:text-white'
              }`}
            >
              Income
            </button>
          </div>

          {/* Title / Description */}
          <div>
            <label className="text-xs font-medium text-[#878a9f] block mb-1.5">
              Title / Payee <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. PayPal, Wise, Netflix, Client Retainer"
              className="w-full bg-[#1a1b27] border border-[#272a3d] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
            />
          </div>

          {/* Amount & Account */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#878a9f] block mb-1.5">
                Amount ($) <span className="text-red-400">*</span>
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
                Account / Card
              </label>
              <select
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full bg-[#1a1b27] border border-[#272a3d] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (**** {acc.last4})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#878a9f] block mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#1a1b27] border border-[#272a3d] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
              >
                <option value="">Select category...</option>
                {filteredCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-[#878a9f] block mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#1a1b27] border border-[#272a3d] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
              >
                <option value="Successful">Successful (Settled)</option>
                <option value="Pending">Pending (Processing)</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#878a9f] block mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#1a1b27] border border-[#272a3d] focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#878a9f] block mb-1.5">
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-[#1a1b27] border border-[#272a3d] focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
              />
            </div>
          </div>

          {/* Is Petty Expense Toggle */}
          <label className="flex items-center space-x-2.5 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isPetty}
              onChange={(e) => setIsPetty(e.target.checked)}
              className="w-4 h-4 rounded bg-[#1a1b27] border-[#272a3d] text-purple-600 focus:ring-0"
            />
            <span className="text-xs text-[#a3a6be]">
              Classify as Petty / Additional Expense (tea, stationery, parking, etc.)
            </span>
          </label>

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-[#878a9f] block mb-1.5">
              Notes (Optional)
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add payment notes, invoice references..."
              className="w-full bg-[#1a1b27] border border-[#272a3d] focus:border-purple-500 rounded-xl p-3 text-xs text-white outline-none resize-none"
            />
          </div>

          {/* Receipt attachment upload */}
          <div>
            <label className="text-xs font-medium text-[#878a9f] block mb-1.5">
              Receipt Attachment (Optional image/PDF)
            </label>
            <div className="border border-dashed border-[#2f3248] hover:border-purple-500/50 rounded-xl p-3 text-center cursor-pointer transition-colors relative">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setReceiptFile(e.target.files[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex items-center justify-center space-x-2 text-xs text-[#82869f]">
                <Upload className="w-4 h-4 text-purple-400" />
                <span>{receiptFile ? receiptFile.name : 'Click or drop receipt file here'}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
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
              {loading ? 'Saving...' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
