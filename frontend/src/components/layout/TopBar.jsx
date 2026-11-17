import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Mic, 
  Bell, 
  Calendar, 
  ChevronDown, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  X
} from 'lucide-react';
import { api } from '../../services/api';

export default function TopBar({ 
  period = 'Weekly', 
  onPeriodChange, 
  selectedDate = '2024-04-16', 
  onDateChange,
  onOpenAiAssistant,
  searchTerm = '',
  onSearchChange
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(3);
  const notifRef = useRef(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data.results || []);
      setUnreadCount(data.unread_count ?? 3);
    } catch {
      // Fallback fallback notifications
      setNotifications([
        { id: 1, title: 'Pending Transaction Alert', message: 'Wise transaction #748374 ($4,568.00) is awaiting bank settlement.', type: 'warning', is_read: false },
        { id: 2, title: 'Card Limit Warning', message: 'VISA Debit **** 2874 monthly spend reached 72% of $18,000 limitation.', type: 'alert', is_read: false },
        { id: 3, title: 'Petty Budget Update', message: 'Petty expenses for current period total $170.00 of $1,000.00 budgeted.', type: 'info', is_read: false },
      ]);
      setUnreadCount(3);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.markNotificationRead(id);
    } catch {
      // ignore
    }
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
    } catch {
      // ignore
    }
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const periods = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

  // Format display date
  const formatDisplayDate = (dStr) => {
    try {
      const parts = dStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      }
    } catch {
      // ignore
    }
    return dStr;
  };

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 pt-2 select-none">
      {/* Left controls: Search & AI Assistant */}
      <div className="flex items-center space-x-3 flex-1 max-w-xl">
        {/* Search Input Pill */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#75778a]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Search anything..."
            className="w-full bg-[#14151e] border border-[#232533] focus:border-purple-500 rounded-full pl-11 pr-4 py-2.5 text-sm text-white placeholder-[#686a7d] outline-none transition-all shadow-inner shadow-black/20"
          />
        </div>

        {/* AI Assistant Pill */}
        <button
          onClick={onOpenAiAssistant}
          className="flex items-center space-x-2 bg-[#14151e] hover:bg-[#1c1d29] border border-[#232533] hover:border-purple-500/50 text-[#cfd2e3] hover:text-white px-4 py-2.5 rounded-full text-xs font-medium transition-all group shrink-0"
        >
          <div className="w-5 h-5 rounded-full bg-[#202230] group-hover:bg-purple-600/20 flex items-center justify-center transition-colors">
            <Mic className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <span>Ai Assistant</span>
        </button>
      </div>

      {/* Right controls: Notifications, Date Picker, Period Selector */}
      <div className="flex items-center space-x-3 shrink-0">
        {/* Notifications Pill */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="flex items-center space-x-2 bg-[#14151e] hover:bg-[#1a1b26] border border-[#232533] text-[#cfd2e3] px-3.5 py-2.5 rounded-full text-xs font-medium transition-colors cursor-pointer"
          >
            <div className="relative">
              <Bell className="w-4 h-4 text-[#8f92a7]" />
            </div>
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#ef4444] text-white text-[10px] font-bold flex items-center justify-center shadow-md shadow-red-500/30">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#161722] border border-[#262838] rounded-2xl p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#232533]">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-sm text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-0.5 rounded-full font-medium">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-purple-400 hover:text-purple-300 font-medium cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="divide-y divide-[#202230] max-h-72 overflow-y-auto mt-2">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-[#6e7287]">No notifications at this time.</div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleMarkAsRead(item.id)}
                      className={`py-3 flex items-start space-x-3 hover:bg-[#1d1f2d]/50 p-2 rounded-xl cursor-pointer transition-colors ${
                        !item.is_read ? 'bg-[#1b1c2b]/30' : 'opacity-70'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {item.type === 'alert' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                        {item.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                        {item.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-white truncate">{item.title}</div>
                        <div className="text-[11px] text-[#9396aa] mt-0.5 leading-snug">{item.message}</div>
                      </div>
                      {!item.is_read && (
                        <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Date Selector Pill */}
        <div className="relative">
          <button
            onClick={() => setShowDateDropdown(!showDateDropdown)}
            className="flex items-center space-x-2.5 bg-[#14151e] hover:bg-[#1a1b26] border border-[#232533] px-3.5 py-2.5 rounded-full text-xs text-white transition-colors cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-[#8f92a7]" />
            <div className="flex flex-col text-left leading-none">
              <span className="text-[10px] text-[#717387] uppercase tracking-wider">Date</span>
              <span className="text-xs font-medium text-slate-200 mt-0.5">{formatDisplayDate(selectedDate)}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#717387]" />
          </button>

          {showDateDropdown && (
            <div className="absolute right-0 mt-2 bg-[#161722] border border-[#262838] rounded-2xl p-4 shadow-2xl z-50 w-64">
              <div className="text-xs font-semibold text-white mb-2">Select Reference Date</div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  onDateChange && onDateChange(e.target.value);
                  setShowDateDropdown(false);
                }}
                className="w-full bg-[#101117] border border-[#282a3c] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
              />
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                  onClick={() => {
                    onDateChange && onDateChange('2024-04-16');
                    setShowDateDropdown(false);
                  }}
                  className="bg-[#1e202e] hover:bg-purple-600/20 text-[#a5a8bf] hover:text-purple-300 py-1.5 px-2 rounded-lg text-[11px] transition-colors"
                >
                  Reference (16 Apr)
                </button>
                <button
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    onDateChange && onDateChange(today);
                    setShowDateDropdown(false);
                  }}
                  className="bg-[#1e202e] hover:bg-purple-600/20 text-[#a5a8bf] hover:text-purple-300 py-1.5 px-2 rounded-lg text-[11px] transition-colors"
                >
                  Today
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Period Selector Pill (Vibrant Purple Gradient) */}
        <div className="relative">
          <button
            onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 hover:from-purple-500 hover:to-indigo-500 text-white font-medium px-4 py-2.5 rounded-full text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
          >
            <span>{period}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {showPeriodDropdown && (
            <div className="absolute right-0 mt-2 bg-[#161722] border border-[#262838] rounded-xl py-1.5 shadow-2xl z-50 w-32 overflow-hidden">
              {periods.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    onPeriodChange && onPeriodChange(p);
                    setShowPeriodDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs transition-colors flex items-center justify-between ${
                    period.toLowerCase() === p.toLowerCase()
                      ? 'bg-purple-600/20 text-purple-400 font-semibold'
                      : 'text-[#9b9eb2] hover:bg-[#1e202d] hover:text-white'
                  }`}
                >
                  <span>{p}</span>
                  {period.toLowerCase() === p.toLowerCase() && (
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
