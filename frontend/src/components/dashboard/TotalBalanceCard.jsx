import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  ChevronDown, 
  Edit3, 
  Share2, 
  Plus 
} from 'lucide-react';

export default function TotalBalanceCard({ 
  primaryCard, 
  totalBalance, 
  onOpenAddCard, 
  onOpenEditLimit, 
  onSendMoney, 
  onRequestMoney 
}) {
  const navigate = useNavigate();
  const [showPaymentModes, setShowPaymentModes] = useState(false);
  const [currentMode, setCurrentMode] = useState(primaryCard?.payment_mode || 'Direct Debits');

  const cardData = primaryCard || {
    type: 'VISA',
    last4: '2874',
    payment_mode: 'Direct Debits',
    status_label: 'Linked to main account',
    monthly_fee: 64.83,
    monthly_limit: 18000.00,
    current_balance: 15420.00
  };

  return (
    <div className="bg-[#14151e] border border-[#232533] rounded-[24px] p-6 flex flex-col justify-between shadow-xl hover:border-[#2f3246] transition-all">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white tracking-tight">Total Balance</h2>
        
        {/* Navigate to Page 3 (Total Balance) */}
        <button
          onClick={() => navigate('/balance')}
          className="w-8 h-8 rounded-full bg-[#1a1b26] hover:bg-[#232536] border border-[#2b2d3e] flex items-center justify-center text-[#9fa2b8] hover:text-white transition-colors cursor-pointer"
          title="Open Total Balance & Accounts page"
        >
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Credit Card Container with Vertical "+ Add New Card" strip */}
      <div className="bg-[#191a25] border border-[#27293a] rounded-2xl p-4 sm:p-5 flex gap-4 relative overflow-hidden shadow-2xl">
        {/* Left vertical strip: "+ Add New Card" */}
        <button
          onClick={onOpenAddCard}
          className="w-9 sm:w-10 rounded-xl border border-dashed border-[#383b52] hover:border-purple-500 bg-[#14151f] hover:bg-purple-600/10 flex flex-col items-center justify-center text-[#7e829b] hover:text-purple-300 transition-all cursor-pointer group py-3 px-1"
          title="Add New Card / Account"
        >
          <Plus className="w-4 h-4 text-[#8a8ea6] group-hover:text-purple-400 group-hover:scale-125 transition-all mb-3" />
          <span className="text-[11px] font-medium tracking-widest uppercase writing-mode-vertical whitespace-nowrap text-[#7e829b] group-hover:text-purple-300">
            + Add New Card
          </span>
        </button>

        {/* Main Card Face */}
        <div className="flex-1 flex flex-col justify-between min-h-[175px]">
          {/* Card Top Row: Brand & Payment Mode Dropdown */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xl sm:text-2xl font-black italic tracking-tighter text-white drop-shadow-md">
                {cardData.type || 'VISA'}
              </span>
            </div>

            {/* Direct Debits pill */}
            <div className="relative">
              <button
                onClick={() => setShowPaymentModes(!showPaymentModes)}
                className="flex items-center space-x-1.5 bg-[#14151f] hover:bg-[#202230] border border-[#2d3043] px-3 py-1.5 rounded-full text-xs text-white font-medium transition-colors cursor-pointer"
              >
                <span>{currentMode}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#7c7f96]" />
              </button>

              {showPaymentModes && (
                <div className="absolute right-0 mt-1 bg-[#161722] border border-[#272a3d] rounded-xl py-1 w-36 shadow-2xl z-30">
                  {['Direct Debits', 'Standing Order', 'Manual Transfer'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        setCurrentMode(mode);
                        setShowPaymentModes(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-[#a2a6bd] hover:text-white hover:bg-purple-600/20 transition-colors"
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Subtitle & Masked Card Number */}
          <div className="my-3">
            <span className="text-xs text-[#7e8199] font-medium block">
              {cardData.status_label || 'Linked to main account'}
            </span>
            <div className="text-xl sm:text-2xl font-mono tracking-[0.25em] text-white font-semibold mt-1">
              **** {cardData.last4 || '2874'}
            </div>
          </div>

          {/* Action Buttons: Send & Request */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {/* Send Button */}
            <button
              onClick={onSendMoney}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 hover:from-purple-500 hover:to-indigo-500 text-white font-medium py-2.5 px-4 rounded-xl text-xs shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 transition-all cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Send</span>
            </button>

            {/* Request Button */}
            <button
              onClick={onRequestMoney}
              className="flex items-center justify-center space-x-2 bg-[#14151f] hover:bg-[#202230] border border-[#2d3043] text-white font-medium py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
            >
              <ArrowDownLeft className="w-4 h-4 text-[#8f92ab]" />
              <span>Request</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer below Card */}
      <div className="mt-4 pt-3 border-t border-[#1c1d29] flex items-center justify-between text-xs text-[#7a7e96]">
        {/* Share icon */}
        <button 
          className="p-1.5 rounded-lg hover:bg-[#1a1b26] hover:text-white transition-colors cursor-pointer"
          title="Share Card Details"
        >
          <Share2 className="w-4 h-4 text-[#8a8da5]" />
        </button>

        {/* Regular Fee */}
        <div className="text-[#84879f] text-[11px] sm:text-xs">
          Monthly regular fee <span className="text-white font-semibold">${Number(cardData.monthly_fee || 64.83).toFixed(2)}</span>
        </div>

        {/* Edit Limitation Button */}
        <button
          onClick={onOpenEditLimit}
          className="flex items-center space-x-1 text-slate-300 hover:text-purple-400 font-medium transition-colors cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Limitation</span>
        </button>
      </div>
    </div>
  );
}
