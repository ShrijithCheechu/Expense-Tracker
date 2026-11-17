import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { 
  Plus, 
  Receipt, 
  Download, 
  Search, 
  Filter, 
  Trash2, 
  Edit2, 
  AlertTriangle, 
  CheckCircle, 
  TrendingDown, 
  TrendingUp, 
  DollarSign, 
  Hash, 
  Tag, 
  Upload 
} from 'lucide-react';
import { api } from '../services/api';

export default function PettyExpensesPage() {
  const [summary, setSummary] = useState(null);
  const [pettyList, setPettyList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Add Form state
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [account, setAccount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().split(' ')[0].substring(0, 5));
  const [notes, setNotes] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Table search, filter, and sort
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedAcc, setSelectedAcc] = useState('');
  const [sortBy, setSortBy] = useState('-date');
  const [page, setPage] = useState(1);

  // Budget Edit modal
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');

  const loadData = async () => {
    try {
      const [sumRes, pettyRes, catsRes, accsRes] = await Promise.all([
        api.getPettySummary(),
        api.getPettyExpenses({
          search,
          category: selectedCat,
          account: selectedAcc,
          sort_by: sortBy,
          page
        }),
        api.getCategories(),
        api.getAccounts()
      ]);
      setSummary(sumRes);
      setPettyList(pettyRes.results || pettyRes || []);
      setCategories(catsRes.results || catsRes || []);
      const accList = accsRes.results || accsRes || [];
      setAccounts(accList);
      if (!account && accList.length > 0) {
        setAccount(accList[0].id);
      }
    } catch (err) {
      console.error('Error loading petty expenses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, selectedCat, selectedAcc, sortBy, page]);

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    setFormError('');

    const amtNum = parseFloat(amount);
    if (!title.trim()) {
      setFormError('Please enter a title/description for the expense.');
      return;
    }
    if (isNaN(amtNum) || amtNum <= 0) {
      setFormError('Amount must be positive.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', title.trim());
      formData.append('amount', amtNum.toFixed(2));
      if (category) formData.append('category', category);
      if (account) formData.append('account', account);
      formData.append('date', date);
      formData.append('time', time.length === 5 ? `${time}:00` : time);
      formData.append('notes', notes);
      formData.append('is_petty', 'true');
      formData.append('kind', 'expense');
      formData.append('status', 'Successful');
      if (receiptFile) {
        formData.append('receipt', receiptFile);
      }

      await api.createPettyExpense(formData);

      // Reset form
      setTitle('');
      setAmount('');
      setNotes('');
      setReceiptFile(null);
      await loadData();
    } catch (err) {
      setFormError(err.message || 'Failed to record petty expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this petty expense entry? Account balance will be restored accordingly.')) {
      try {
        await api.deletePettyExpense(id);
        await loadData();
      } catch (err) {
        alert(err.message || 'Failed to delete');
      }
    }
  };

  const handleExportCsv = async () => {
    try {
      const blob = await api.exportPettyCsv();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `petty_expenses_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert('Failed to export CSV: ' + err.message);
    }
  };

  const handleSaveBudget = async () => {
    const val = parseFloat(budgetInput);
    if (isNaN(val) || val <= 0) return;
    try {
      await api.updatePettyBudget(val);
      setShowBudgetModal(false);
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to update budget');
    }
  };

  const budget = summary?.budget || {
    amount: 1000.0,
    spent: 170.0,
    remaining: 830.0,
    percentage_used: 17.0,
    alert_status: 'normal'
  };

  return (
    <Layout
      title="Petty Expenses"
      subtitle="Capture small, ad-hoc spending (tea, stationery, parking) that seamlessly sync with your balance"
    >
      {/* 4 Summary Cards (FR-PETTY-04) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#14151e] border border-[#232533] rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-[#73768e] text-xs font-medium">
            <span>Total Petty Spend</span>
            <Receipt className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            ${Number(summary?.total_spend || 0).toFixed(2)}
          </div>
          <div className="text-[11px] text-[#6d7088] mt-1">Current monthly period</div>
        </div>

        <div className="bg-[#14151e] border border-[#232533] rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-[#73768e] text-xs font-medium">
            <span>Number of Entries</span>
            <Hash className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {summary?.entry_count || 0}
          </div>
          <div className="text-[11px] text-[#6d7088] mt-1">Total recorded items</div>
        </div>

        <div className="bg-[#14151e] border border-[#232533] rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-[#73768e] text-xs font-medium">
            <span>Average per Entry</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            ${Number(summary?.average_spend || 0).toFixed(2)}
          </div>
          <div className="text-[11px] text-[#6d7088] mt-1">Typical ad-hoc expenditure</div>
        </div>

        <div className="bg-[#14151e] border border-[#232533] rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-[#73768e] text-xs font-medium">
            <span>Highest Expense</span>
            <TrendingUp className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            ${Number(summary?.highest_spend || 0).toFixed(2)}
          </div>
          <div className="text-[11px] text-[#6d7088] mt-1">Peak single disbursement</div>
        </div>
      </div>

      {/* Monthly Budget Progress Bar with Warnings (FR-PETTY-11) */}
      <div className={`border rounded-2xl p-5 mb-6 shadow-xl transition-all ${
        budget.alert_status === 'exceeded'
          ? 'bg-red-950/20 border-red-500/40'
          : budget.alert_status === 'warning'
          ? 'bg-amber-950/20 border-amber-500/40'
          : 'bg-[#14151e] border-[#232533]'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            {budget.alert_status === 'exceeded' && <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />}
            {budget.alert_status === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
            <span className="font-bold text-sm text-white">Monthly Petty Expense Budget</span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
              budget.alert_status === 'exceeded'
                ? 'bg-red-500/20 text-red-400'
                : budget.alert_status === 'warning'
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-purple-500/20 text-purple-400'
            }`}>
              {budget.percentage_used}% Used
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs text-[#878a9f]">
              Spent <strong className="text-white">${budget.spent.toFixed(2)}</strong> of ${budget.amount.toFixed(2)}
            </span>
            <button
              onClick={() => {
                setBudgetInput(budget.amount.toString());
                setShowBudgetModal(true);
              }}
              className="text-xs text-purple-400 hover:text-purple-300 underline font-medium cursor-pointer"
            >
              Adjust Budget
            </button>
          </div>
        </div>

        {/* Progress Track */}
        <div className="w-full bg-[#1e202d] rounded-full h-3 overflow-hidden p-0.5">
          <div
            style={{ width: `${Math.min(100, budget.percentage_used)}%` }}
            className={`h-full rounded-full transition-all duration-500 ${
              budget.alert_status === 'exceeded'
                ? 'bg-gradient-to-r from-red-600 to-rose-500 shadow-lg shadow-red-500/50'
                : budget.alert_status === 'warning'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-lg shadow-amber-500/50'
                : 'bg-gradient-to-r from-purple-600 to-indigo-500 shadow-lg shadow-purple-600/40'
            }`}
          />
        </div>

        {budget.message && (
          <div className="text-[11px] text-[#9a9db6] mt-2">
            Status: {budget.message} (Remaining capacity: ${budget.remaining.toFixed(2)})
          </div>
        )}
      </div>

      {/* Main 2-Column Section: Quick Add Form & Category Breakdown Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Quick Add Form Card (FR-PETTY-02 & FR-PETTY-03) */}
        <div className="lg:col-span-2 bg-[#14151e] border border-[#232533] rounded-[24px] p-6 shadow-xl">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Quick Add Petty Expense</h2>
              <p className="text-xs text-[#71748d]">Immediately updates selected account balance & dashboard list</p>
            </div>
          </div>

          <form onSubmit={handleQuickAdd} className="space-y-4">
            {formError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[#878a9f] block mb-1">
                  Title / Description <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Office Coffee, Parking slip, Cab fare"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#1a1b27] border border-[#272a3d] focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#878a9f] block mb-1">
                  Amount ($) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#1a1b27] border border-[#272a3d] focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[#878a9f] block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#1a1b27] border border-[#272a3d] focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                >
                  <option value="">Select category...</option>
                  {categories.filter(c => c.kind === 'expense').map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-[#878a9f] block mb-1">
                  Payment Source (Account/Card or Cash)
                </label>
                <select
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="w-full bg-[#1a1b27] border border-[#272a3d] focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.type} ****{acc.last4})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[#878a9f] block mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#1a1b27] border border-[#272a3d] rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#878a9f] block mb-1">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-[#1a1b27] border border-[#272a3d] rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[#878a9f] block mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="Reason, tax slip note..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#1a1b27] border border-[#272a3d] rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#878a9f] block mb-1">
                  Receipt Attachment (Max 5MB)
                </label>
                <div className="relative border border-dashed border-[#2f3248] rounded-xl px-3 py-1.5 flex items-center justify-between text-xs text-[#878a9f]">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setReceiptFile(e.target.files[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <span className="truncate">{receiptFile ? receiptFile.name : 'Upload image / PDF'}</span>
                  <Upload className="w-3.5 h-3.5 text-purple-400 shrink-0 ml-2" />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 hover:from-purple-500 hover:to-indigo-500 text-white font-medium px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Recording...' : 'Record Petty Expense'}
              </button>
            </div>
          </form>
        </div>

        {/* Category Breakdown Chart Card (FR-PETTY-09) */}
        <div className="bg-[#14151e] border border-[#232533] rounded-[24px] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Category Distribution</h2>
            <p className="text-xs text-[#71748d] mt-0.5">Petty expense category share</p>

            <div className="mt-6 space-y-3">
              {(summary?.category_breakdown || [
                { category: 'Food & Drinks', amount: 62.70 },
                { category: 'Transport', amount: 45.00 },
                { category: 'Office Supplies', amount: 62.30 },
              ]).map((item, idx) => {
                const total = summary?.total_spend || 170.0;
                const pct = total > 0 ? Math.round((item.amount / total) * 100) : 33;
                const colors = ['bg-purple-500', 'bg-indigo-500', 'bg-pink-500', 'bg-amber-500', 'bg-emerald-500'];
                const barColor = colors[idx % colors.length];

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#a1a4be] font-medium">{item.category}</span>
                      <span className="text-white font-semibold">${item.amount.toFixed(2)} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-[#1f202e] rounded-full h-2 overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className={`h-full rounded-full ${barColor}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#1e202e] text-[11px] text-[#71748d] text-center">
            Updated continuously from all logged petty disbursements
          </div>
        </div>
      </div>

      {/* Petty Expenses List Table (FR-PETTY-05, FR-PETTY-07, FR-PETTY-08, FR-PETTY-10) */}
      <div className="bg-[#14151e] border border-[#232533] rounded-[24px] p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <h2 className="text-base font-bold text-white">Petty Expenses Ledger</h2>
            <span className="text-xs bg-[#1f202f] text-purple-300 border border-[#2b2d41] px-2.5 py-0.5 rounded-full font-medium">
              {pettyList.length} items
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#1a1b27] border border-[#282a3c] rounded-full pl-3 pr-8 py-1.5 text-xs text-white outline-none w-40 sm:w-48 placeholder-[#6b6e85]"
              />
              <Search className="w-3.5 h-3.5 text-[#6b6e85] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Category filter */}
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="bg-[#1a1b27] border border-[#282a3c] rounded-full px-3 py-1.5 text-xs text-white outline-none"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#1a1b27] border border-[#282a3c] rounded-full px-3 py-1.5 text-xs text-white outline-none"
            >
              <option value="-date">Newest First</option>
              <option value="date">Oldest First</option>
              <option value="-amount">Highest Amount</option>
              <option value="amount">Lowest Amount</option>
            </select>

            {/* Export CSV Button (FR-PETTY-10) */}
            <button
              onClick={handleExportCsv}
              className="flex items-center space-x-1.5 bg-[#1a1b27] hover:bg-[#222435] border border-[#2b2d3f] text-[#a5a8c2] hover:text-white px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer"
              title="Export Filtered List as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1e202d] text-[11px] font-semibold text-[#6d718b] uppercase tracking-wider">
                <th className="py-2.5 px-3">Title / Description</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Payment Source</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c1d29] text-xs">
              {pettyList.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-[#676a82]">
                    No petty expenses found. Use the quick add form above to log small expenses.
                  </td>
                </tr>
              ) : (
                pettyList.map((row) => (
                  <tr key={row.id} className="hover:bg-[#1a1c27]/60 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{row.name}</div>
                      <div className="text-[11px] text-[#6d718b] font-mono">{row.reference_id}</div>
                    </td>
                    <td className="py-3 px-3 text-[#a1a4ba]">
                      <span className="bg-[#1d1f2e] px-2 py-0.5 rounded-md text-[11px]">
                        {row.category_name || 'General'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#a1a4ba]">{row.date}</td>
                    <td className="py-3 px-3 text-[#797c95]">{row.time}</td>
                    <td className="py-3 px-3 font-semibold text-white">
                      -${Number(row.amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-[#a1a4ba]">
                      {row.account_name ? `${row.account_name} (****${row.account_last4 || ''})` : 'Cash Wallet'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-[#71748d] hover:text-red-400 transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Budget Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-[#14151f] border border-[#272a3d] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6">
            <h3 className="text-base font-bold text-white mb-1">Set Monthly Petty Budget</h3>
            <p className="text-xs text-[#71748d] mb-4">You will receive warning alerts when spend hits 80% and 100%.</p>
            <input
              type="number"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              className="w-full bg-[#1a1b27] border border-[#272a3d] focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowBudgetModal(false)}
                className="px-3 py-1.5 text-xs text-[#82859c]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBudget}
                className="bg-purple-600 hover:bg-purple-500 text-white font-medium px-4 py-1.5 rounded-xl text-xs transition-colors"
              >
                Save Budget
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
