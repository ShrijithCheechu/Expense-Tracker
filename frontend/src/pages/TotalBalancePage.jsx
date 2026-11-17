import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowRightLeft, 
  Plus, 
  Download, 
  Edit3, 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  AlertTriangle,
  Search,
  Filter
} from 'lucide-react';
import { api } from '../services/api';
import AddCardModal from '../components/modals/AddCardModal';
import EditLimitationModal from '../components/modals/EditLimitationModal';
import TransferModal from '../components/modals/TransferModal';

export default function TotalBalancePage() {
  const [period, setPeriod] = useState('Monthly');
  const [balanceSummary, setBalanceSummary] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddCard, setShowAddCard] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [showTransfer, setShowTransfer] = useState(false);

  // Table filters
  const [historySearch, setHistorySearch] = useState('');
  const [selectedAccountFilter, setSelectedAccountFilter] = useState('');
  const [page, setPage] = useState(1);

  const loadData = async () => {
    try {
      const [sumRes, trendRes, histRes, accsRes] = await Promise.all([
        api.getBalanceSummary(period.toLowerCase()),
        api.getBalanceTrend(period.toLowerCase()),
        api.getBalanceHistory({
          search: historySearch,
          account: selectedAccountFilter,
          page
        }),
        api.getAccounts()
      ]);
      setBalanceSummary(sumRes);
      setTrendData(trendRes);
      setHistoryData(histRes);
      setAccounts(accsRes.results || accsRes || []);
    } catch (err) {
      console.error('Error loading balance data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [period, historySearch, selectedAccountFilter, page]);

  const handleExportCsv = async () => {
    try {
      const blob = await api.exportBalanceCsv();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `balance_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert('Failed to export CSV: ' + err.message);
    }
  };

  const handleDeactivate = async (accId) => {
    if (window.confirm('Deactivate this account? Transaction history will be safely preserved.')) {
      try {
        await api.deleteAccount(accId);
        await loadData();
      } catch (err) {
        alert(err.message || 'Failed to deactivate account');
      }
    }
  };

  const tiles = balanceSummary?.summary_tiles || {
    income: { total: 20974.0, change: '+14.2%' },
    expense: { total: 18753.0, change: '-3.8%' },
    net_savings: { total: 2221.0, change: '+28.4%' }
  };

  return (
    <Layout
      title="Total Balance"
      subtitle="Complete view of all liquidity positions, account portfolios & balance trends"
      period={period}
      onPeriodChange={setPeriod}
    >
      {/* Prominent Total Balance Summary Card (FR-BAL-02) */}
      <div className="bg-gradient-to-r from-[#171926] via-[#141520] to-[#1a1b2b] border border-[#26283b] rounded-[24px] p-6 lg:p-8 mb-6 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-[#8b8fa8]">
              <Wallet className="w-4 h-4 text-purple-400" />
              <span>Overall Consolidated Balance</span>
            </div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mt-2 tracking-tight">
              ${Number(balanceSummary?.total_balance || 44900).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-[#787c96] mt-1.5">
              Calculated across all active debit cards, bank reserves, and cash accounts (Opening + Income − Expenses)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowTransfer(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Transfer Funds</span>
            </button>

            <button
              onClick={() => setShowAddCard(true)}
              className="flex items-center space-x-2 bg-[#1b1d2c] hover:bg-[#232538] border border-[#2e3046] text-white font-medium px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-purple-400" />
              <span>Add New Card</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="flex items-center space-x-2 bg-[#1b1d2c] hover:bg-[#232538] border border-[#2e3046] text-[#a1a4be] hover:text-white px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
              title="Export Report"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Summary Tiles: Total Income, Total Expenses, Net Savings (FR-BAL-03) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#14151e] border border-[#232533] rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-[#7d8199] font-medium">
            <span>Total Income ({period})</span>
            <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            ${Number(tiles.income.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center space-x-1.5 mt-2">
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              {tiles.income.change}
            </span>
            <span className="text-[11px] text-[#6d7088]">vs previous period</span>
          </div>
        </div>

        <div className="bg-[#14151e] border border-[#232533] rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-[#7d8199] font-medium">
            <span>Total Expenses ({period})</span>
            <div className="p-1 rounded-lg bg-rose-500/10 text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            ${Number(tiles.expense.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center space-x-1.5 mt-2">
            <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
              {tiles.expense.change}
            </span>
            <span className="text-[11px] text-[#6d7088]">vs previous period</span>
          </div>
        </div>

        <div className="bg-[#14151e] border border-[#232533] rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-[#7d8199] font-medium">
            <span>Net Savings Position</span>
            <div className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            ${Number(tiles.net_savings.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center space-x-1.5 mt-2">
            <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
              {tiles.net_savings.change}
            </span>
            <span className="text-[11px] text-[#6d7088]">net liquidity growth</span>
          </div>
        </div>
      </div>

      {/* Accounts & Cards Portfolio Section (FR-BAL-04 & FR-BAL-05) */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Active Accounts & Cards</h2>
            <p className="text-xs text-[#71748d]">Manage limits, payment modes and balances</p>
          </div>
          <button
            onClick={() => setShowAddCard(true)}
            className="flex items-center space-x-1.5 text-xs text-purple-400 hover:text-purple-300 font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Add Account</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(balanceSummary?.accounts || accounts).map((acc) => (
            <div
              key={acc.id}
              className="bg-[#14151e] border border-[#232533] rounded-[22px] p-5 shadow-xl hover:border-[#2f3246] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black tracking-tight text-white">{acc.type}</span>
                  <span className="text-xs bg-[#1c1d29] border border-[#2b2d3f] text-[#a2a6bd] px-2.5 py-0.5 rounded-full font-medium">
                    {acc.payment_mode || 'Direct Debits'}
                  </span>
                </div>

                <div className="mt-3">
                  <div className="text-sm font-semibold text-white">{acc.name}</div>
                  <div className="text-xs font-mono tracking-widest text-[#787c95] mt-0.5">
                    **** {acc.last4 || '0000'}
                  </div>
                </div>

                <div className="my-4">
                  <div className="text-xs text-[#73768d]">Current Balance</div>
                  <div className="text-2xl font-bold text-white">
                    ${Number(acc.current_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                {/* Monthly Limit Progress */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-[#787c95] mb-1">
                    <span>Limit: ${Number(acc.monthly_limit || 5000).toFixed(0)}</span>
                    <span>{acc.limit_percentage || 24}% used</span>
                  </div>
                  <div className="w-full bg-[#1e202e] rounded-full h-1.5 overflow-hidden">
                    <div
                      style={{ width: `${acc.limit_percentage || 24}%` }}
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                    />
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-5 pt-3 border-t border-[#1e202e] flex items-center justify-between text-xs">
                <button
                  onClick={() => setEditingCard(acc)}
                  className="flex items-center space-x-1 text-[#8f92ac] hover:text-purple-300 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Limit</span>
                </button>

                <button
                  onClick={() => handleDeactivate(acc.id)}
                  className="text-red-400 hover:text-red-300 text-xs transition-colors"
                >
                  Deactivate
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Balance Trend & Income vs Expense Charts (FR-BAL-06 & FR-BAL-07) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Balance Trend Line/Area Chart */}
        <div className="bg-[#14151e] border border-[#232533] rounded-[24px] p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Balance Trajectory</h2>
              <p className="text-xs text-[#71748d]">Portfolio liquidity over time</p>
            </div>
            <span className="text-xs bg-[#1c1d29] text-purple-400 px-3 py-1 rounded-full border border-[#27293d] font-semibold">
              {period}
            </span>
          </div>

          <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2">
            {(trendData?.trend || [
              { label: 'Jan', balance: 32000 },
              { label: 'Feb', balance: 34500 },
              { label: 'Mar', balance: 39000 },
              { label: 'Apr', balance: 41200 },
              { label: 'May', balance: 43000 },
              { label: 'Jun', balance: 44900 },
            ]).map((pt, idx) => {
              const maxB = 50000;
              const hPct = Math.min(100, Math.round((pt.balance / maxB) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="text-[10px] text-[#71748d] group-hover:text-purple-400 mb-2 font-mono transition-colors">
                    ${Math.round(pt.balance / 1000)}k
                  </div>
                  <div
                    style={{ height: `${hPct}%` }}
                    className="w-full max-w-[32px] bg-gradient-to-t from-purple-800 via-indigo-600 to-purple-400 rounded-t-lg shadow-md group-hover:brightness-125 transition-all"
                  />
                  <span className="text-[11px] text-[#6d718b] mt-2 group-hover:text-white transition-colors">
                    {pt.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Income vs Expense Comparison Chart */}
        <div className="bg-[#14151e] border border-[#232533] rounded-[24px] p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Income vs Expense Position</h2>
              <p className="text-xs text-[#71748d]">Side-by-side inflows and outflows</p>
            </div>
            <div className="flex items-center space-x-3 text-xs text-[#71748d]">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span>Income</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                <span>Expense</span>
              </span>
            </div>
          </div>

          <div className="h-56 flex items-end justify-between gap-4 pt-6 pb-2">
            {(trendData?.income_vs_expense || [
              { label: 'Jan', income: 14000, expense: 11000 },
              { label: 'Feb', income: 15500, expense: 13000 },
              { label: 'Mar', income: 18000, expense: 13500 },
              { label: 'Apr', income: 19500, expense: 17300 },
              { label: 'May', income: 16500, expense: 14700 },
              { label: 'Jun', income: 20974, expense: 18753 },
            ]).map((pt, idx) => {
              const maxVal = 24000;
              const incH = Math.round((pt.income / maxVal) * 100);
              const expH = Math.round((pt.expense / maxVal) * 100);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end">
                  <div className="w-full flex items-end justify-center gap-1.5 h-full">
                    {/* Income Bar */}
                    <div
                      style={{ height: `${incH}%` }}
                      className="w-3.5 bg-gradient-to-t from-purple-700 to-purple-400 rounded-t-md"
                      title={`Income: $${pt.income}`}
                    />
                    {/* Expense Bar */}
                    <div
                      style={{ height: `${expH}%` }}
                      className="w-3.5 bg-[#3a3d52] rounded-t-md"
                      title={`Expense: $${pt.expense}`}
                    />
                  </div>
                  <span className="text-[11px] text-[#6d718b] mt-2">{pt.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Balance History Table with Running Balance Column (FR-BAL-08) */}
      <div className="bg-[#14151e] border border-[#232533] rounded-[24px] p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-white">Consolidated Balance Ledger</h2>
            <p className="text-xs text-[#71748d]">Running balance calculation per settled transaction</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search ledger..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="bg-[#1a1b27] border border-[#282a3c] rounded-full pl-3 pr-8 py-1.5 text-xs text-white outline-none w-44"
              />
              <Search className="w-3.5 h-3.5 text-[#6b6e85] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <select
              value={selectedAccountFilter}
              onChange={(e) => setSelectedAccountFilter(e.target.value)}
              className="bg-[#1a1b27] border border-[#282a3c] rounded-full px-3 py-1.5 text-xs text-white outline-none"
            >
              <option value="">All Accounts</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1e202d] text-[11px] font-semibold text-[#6d718b] uppercase tracking-wider">
                <th className="py-2.5 px-3">Reference / Payee</th>
                <th className="py-2.5 px-3">Account</th>
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3 font-bold text-purple-400">Running Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c1d29] text-xs">
              {(!historyData?.results || historyData.results.length === 0) ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-[#676a82]">
                    No balance entries recorded.
                  </td>
                </tr>
              ) : (
                historyData.results.map((row) => (
                  <tr key={row.id} className="hover:bg-[#1a1c27]/60 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{row.name}</div>
                      <div className="text-[11px] text-[#6d718b] font-mono">{row.reference_id}</div>
                    </td>
                    <td className="py-3 px-3 text-[#a1a4ba]">{row.account}</td>
                    <td className="py-3 px-3 text-[#878a9f]">{row.date} {row.time}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        row.kind === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        {row.kind.toUpperCase()}
                      </span>
                    </td>
                    <td className={`py-3 px-3 font-semibold ${row.kind === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                      {row.kind === 'income' ? '+' : '-'}${Number(row.amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-white">
                      ${Number(row.running_balance).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showAddCard && (
        <AddCardModal
          onClose={() => setShowAddCard(false)}
          onSuccess={loadData}
        />
      )}

      {editingCard && (
        <EditLimitationModal
          account={editingCard}
          onClose={() => setEditingCard(null)}
          onSuccess={loadData}
        />
      )}

      {showTransfer && (
        <TransferModal
          accounts={accounts}
          onClose={() => setShowTransfer(false)}
          onSuccess={loadData}
        />
      )}
    </Layout>
  );
}
