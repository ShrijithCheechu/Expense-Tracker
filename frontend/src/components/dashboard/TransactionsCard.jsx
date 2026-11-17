import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Plus, 
  ExternalLink, 
  Trash2, 
  Edit2, 
  Eye, 
  Receipt 
} from 'lucide-react';

export default function TransactionsCard({ 
  transactions = [], 
  onAddTransaction, 
  onEditTransaction, 
  onDeleteTransaction, 
  onViewDetails,
  onOpenFilter
}) {
  const [tableSearch, setTableSearch] = useState('');
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Filter transactions by table search
  const filtered = transactions.filter(t => {
    if (!tableSearch) return true;
    const q = tableSearch.toLowerCase();
    return (
      t.name?.toLowerCase().includes(q) ||
      t.reference_id?.toLowerCase().includes(q) ||
      t.category_name?.toLowerCase().includes(q) ||
      t.status?.toLowerCase().includes(q)
    );
  });

  // Helper for brand icon/avatar
  const getBrandIcon = (name = '') => {
    const n = name.toLowerCase();
    if (n.includes('paypal')) {
      return (
        <div className="w-8 h-8 rounded-full bg-[#003087]/20 border border-[#003087]/40 flex items-center justify-center font-bold text-[#0079C1] text-xs">
          P
        </div>
      );
    }
    if (n.includes('wise')) {
      return (
        <div className="w-8 h-8 rounded-full bg-[#00b9ff]/20 border border-[#00b9ff]/40 flex items-center justify-center font-bold text-[#00b9ff] text-xs">
          W
        </div>
      );
    }
    if (n.includes('atlassian')) {
      return (
        <div className="w-8 h-8 rounded-full bg-[#0052cc]/20 border border-[#0052cc]/40 flex items-center justify-center font-bold text-[#2684ff] text-xs">
          ▲
        </div>
      );
    }
    if (n.includes('hotjar')) {
      return (
        <div className="w-8 h-8 rounded-full bg-[#ff3c00]/20 border border-[#ff3c00]/40 flex items-center justify-center font-bold text-[#ff3c00] text-xs">
          🔥
        </div>
      );
    }
    if (n.includes('coffee') || n.includes('starbucks')) {
      return (
        <div className="w-8 h-8 rounded-full bg-[#00704A]/20 border border-[#00704A]/40 flex items-center justify-center font-bold text-[#00704A] text-xs">
          ☕
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-purple-600/20 border border-purple-500/40 flex items-center justify-center font-bold text-purple-400 text-xs">
        {name.charAt(0) || '$'}
      </div>
    );
  };

  // Helper to format date matching screenshot (e.g. "7 July 2024")
  const formatDate = (dateStr) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      }
    } catch {
      // ignore
    }
    return dateStr;
  };

  // Helper to format time (e.g. "11:30 am")
  const formatTime = (timeStr) => {
    try {
      const [h, m] = timeStr.split(':');
      let hour = parseInt(h, 10);
      const ampm = hour >= 12 ? 'pm' : 'am';
      hour = hour % 12 || 12;
      return `${hour}:${m} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="bg-[#14151e] border border-[#232533] rounded-[24px] p-6 flex flex-col justify-between shadow-xl hover:border-[#2f3246] transition-all">
      {/* Top Header & Search/Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-bold text-white tracking-tight">Transactions</h2>
          <button
            onClick={onAddTransaction}
            className="flex items-center space-x-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs px-2.5 py-1 rounded-full transition-colors cursor-pointer"
            title="Add New Transaction"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {/* Search box pill */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="bg-[#1a1b26] border border-[#282a3c] focus:border-purple-500 text-xs text-white rounded-full pl-3 pr-8 py-1.5 w-36 sm:w-44 outline-none transition-all placeholder-[#666980]"
            />
            <Search className="w-3.5 h-3.5 text-[#666980] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Filter button */}
          <button
            onClick={onOpenFilter}
            className="w-8 h-8 rounded-full bg-[#1a1b26] hover:bg-[#232536] border border-[#2b2d3e] flex items-center justify-center text-[#9fa2b8] hover:text-white transition-colors cursor-pointer"
            title="Filter Transactions"
          >
            <Filter className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-2 sm:mx-0">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1e202d] text-[11px] font-semibold text-[#6d718b] uppercase tracking-wider">
              <th className="py-2.5 px-3">Transaction</th>
              <th className="py-2.5 px-3">Date</th>
              <th className="py-2.5 px-3">Time</th>
              <th className="py-2.5 px-3">Amount</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1c1d29] text-xs">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-[#676a82]">
                  No transactions found matching criteria.
                </td>
              </tr>
            ) : (
              filtered.slice(0, 5).map((row) => (
                <tr 
                  key={row.id} 
                  className="hover:bg-[#1a1c27]/60 transition-colors group"
                >
                  {/* Transaction Name & Reference */}
                  <td className="py-3 px-3">
                    <div className="flex items-center space-x-3">
                      {getBrandIcon(row.name)}
                      <div>
                        <div className="font-semibold text-white group-hover:text-purple-300 transition-colors flex items-center space-x-1.5">
                          <span>{row.name}</span>
                          {row.is_petty && (
                            <span className="text-[9px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-1.5 py-0.2 rounded font-mono">
                              Petty
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#6d718b] font-mono mt-0.5">
                          {row.reference_id}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="py-3 px-3 text-[#a1a4ba] font-medium whitespace-nowrap">
                    {formatDate(row.date)}
                  </td>

                  {/* Time */}
                  <td className="py-3 px-3 text-[#878a9f] whitespace-nowrap">
                    {formatTime(row.time)}
                  </td>

                  {/* Amount */}
                  <td className="py-3 px-3 font-semibold text-white whitespace-nowrap">
                    <span className={row.kind === 'income' ? 'text-emerald-400' : 'text-white'}>
                      {row.kind === 'income' ? '+' : '-'}${Number(row.amount).toFixed(0)}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    {row.status === 'Successful' ? (
                      <span className="inline-flex items-center space-x-1.5 bg-[#171927] border border-[#262444] text-[#a78bfa] text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7] shadow-sm shadow-purple-500/80" />
                        <span>Successful</span>
                      </span>
                    ) : row.status === 'Pending' ? (
                      <span className="inline-flex items-center space-x-1.5 bg-[#221c17] border border-[#3e2b1e] text-[#f59e0b] text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                        <span>Pending</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1.5 bg-[#25181b] border border-[#441f26] text-[#ef4444] text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
                        <span>Failed</span>
                      </span>
                    )}
                  </td>

                  {/* Action Menu (Three dots) */}
                  <td className="py-3 px-3 text-right relative">
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === row.id ? null : row.id)}
                      className="w-7 h-7 rounded-full bg-[#1b1c28] hover:bg-[#252738] border border-[#2b2d3e] inline-flex items-center justify-center text-[#8e91a9] hover:text-white transition-colors cursor-pointer"
                    >
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>

                    {/* Dropdown Menu */}
                    {activeMenuId === row.id && (
                      <div className="absolute right-3 top-10 bg-[#181926] border border-[#2b2d3f] rounded-xl shadow-2xl py-1 w-32 z-50 animate-in fade-in zoom-in-95 duration-100 text-left">
                        <button
                          onClick={() => {
                            onViewDetails && onViewDetails(row);
                            setActiveMenuId(null);
                          }}
                          className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-[#a2a6bd] hover:text-white hover:bg-[#222436] transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                        <button
                          onClick={() => {
                            onEditTransaction && onEditTransaction(row);
                            setActiveMenuId(null);
                          }}
                          className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-[#a2a6bd] hover:text-white hover:bg-[#222436] transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            onDeleteTransaction && onDeleteTransaction(row.id);
                            setActiveMenuId(null);
                          }}
                          className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
