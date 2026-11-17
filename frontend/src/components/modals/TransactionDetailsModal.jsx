import React from 'react';
import { X, FileText, CheckCircle, Clock, AlertOctagon, Download } from 'lucide-react';

export default function TransactionDetailsModal({ transaction, onClose }) {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-[#14151f] border border-[#272a3d] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#212332]">
          <h3 className="text-base font-bold text-white">Transaction Details</h3>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#1b1c28] hover:bg-[#25273a] text-[#8e91a8] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Header Amount & Status */}
          <div className="bg-[#181926] p-4 rounded-xl border border-[#232536] text-center">
            <div className="text-xs text-[#878a9f] font-mono">{transaction.reference_id}</div>
            <div className={`text-2xl font-bold mt-1 ${transaction.kind === 'income' ? 'text-emerald-400' : 'text-white'}`}>
              {transaction.kind === 'income' ? '+' : '-'}${Number(transaction.amount).toFixed(2)}
            </div>
            <div className="mt-2 inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-[#222438] text-purple-300">
              <span className={`w-2 h-2 rounded-full ${transaction.status === 'Successful' ? 'bg-purple-400' : 'bg-amber-400'}`} />
              <span>{transaction.status}</span>
            </div>
          </div>

          {/* Details list */}
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-[#1f212f]">
              <span className="text-[#7d8096]">Title / Payee:</span>
              <span className="font-semibold text-white">{transaction.name}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1f212f]">
              <span className="text-[#7d8096]">Category:</span>
              <span className="font-medium text-slate-200">{transaction.category_name || 'General'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1f212f]">
              <span className="text-[#7d8096]">Account / Card:</span>
              <span className="font-medium text-slate-200">
                {transaction.account_name ? `${transaction.account_name} (**** ${transaction.account_last4 || ''})` : 'Cash Wallet'}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1f212f]">
              <span className="text-[#7d8096]">Date & Time:</span>
              <span className="font-medium text-slate-200">{transaction.date} at {transaction.time}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1f212f]">
              <span className="text-[#7d8096]">Petty Expense:</span>
              <span className="font-medium text-slate-200">{transaction.is_petty ? 'Yes' : 'No'}</span>
            </div>

            {transaction.notes && (
              <div className="py-2">
                <span className="text-[#7d8096] block mb-1">Notes:</span>
                <p className="bg-[#181926] p-2.5 rounded-lg text-slate-300 italic">{transaction.notes}</p>
              </div>
            )}

            {transaction.receipt && (
              <div className="pt-2">
                <span className="text-[#7d8096] block mb-1.5">Receipt Attachment:</span>
                <a
                  href={transaction.receipt}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 p-2.5 rounded-xl transition-colors"
                >
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span className="truncate flex-1">View / Download Receipt</span>
                  <Download className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>

          <div className="pt-3 flex justify-end border-t border-[#202230]">
            <button
              onClick={onClose}
              className="bg-[#1a1b27] hover:bg-[#222435] text-white px-4 py-2 rounded-xl text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
