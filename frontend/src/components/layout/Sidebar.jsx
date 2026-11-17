import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, 
  Receipt, 
  Wallet, 
  Home, 
  Users, 
  BarChart2, 
  FileText, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ onOpenSettings }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    {
      name: 'Dashboard',
      to: '/dashboard',
      icon: LayoutGrid,
      tooltip: 'Dashboard Overview'
    },
    {
      name: 'Petty Expenses',
      to: '/petty-expenses',
      icon: Receipt,
      tooltip: 'Petty / Additional Expenses'
    },
    {
      name: 'Total Balance',
      to: '/balance',
      icon: Wallet,
      tooltip: 'Total Balance & Accounts'
    },
  ];

  const decorativeItems = [
    { name: 'Overview', icon: Home, tooltip: 'Home' },
    { name: 'Team', icon: Users, tooltip: 'Team & Beneficiaries' },
    { name: 'Analytics', icon: BarChart2, tooltip: 'Detailed Analytics' },
    { name: 'Reports', icon: FileText, tooltip: 'Financial Reports' },
  ];

  return (
    <aside className="w-[74px] md:w-[80px] bg-[#101117] border-r border-[#1e202d] flex flex-col items-center py-6 fixed left-0 top-0 bottom-0 z-30 select-none">
      {/* Top Logo */}
      <div 
        onClick={() => navigate('/dashboard')}
        className="w-11 h-11 rounded-full bg-gradient-to-tr from-purple-700 via-indigo-600 to-fuchsia-500 flex items-center justify-center cursor-pointer shadow-lg shadow-purple-900/30 hover:scale-105 transition-transform mb-8"
        title="Expense Tracker"
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" strokeDasharray="32 10" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      </div>

      {/* Main Navigation Icons */}
      <div className="flex-1 flex flex-col items-center space-y-4 w-full">
        {/* Decorative Top Home item matching screenshot */}
        <button
          onClick={() => navigate('/dashboard')}
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-[#8e90a5] hover:text-white hover:bg-[#1a1b24] transition-colors"
          title="Home"
        >
          <Home className="w-5 h-5" />
        </button>

        {/* 3 Core Functional Routes */}
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={item.tooltip}
            className={({ isActive }) =>
              `w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 group relative ${
                isActive
                  ? 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-500 text-white shadow-lg shadow-purple-600/40'
                  : 'text-[#8e90a5] hover:text-white hover:bg-[#1a1b24]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                {/* Tooltip on hover */}
                <span className="absolute left-16 bg-[#181924] text-xs text-white px-2.5 py-1.5 rounded-md shadow-xl border border-[#2b2d3e] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {item.tooltip}
                </span>
              </>
            )}
          </NavLink>
        ))}

        {/* Reference screenshot extra icons (Users, Stats, Docs) */}
        {decorativeItems.slice(1).map((item, idx) => (
          <button
            key={idx}
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-[#5f6277] hover:text-[#9fa3bc] hover:bg-[#171822] transition-colors group relative"
            title={`${item.tooltip} (Scope note: Future v2)`}
          >
            <item.icon className="w-5 h-5" />
            <span className="absolute left-16 bg-[#181924] text-xs text-[#9fa3bc] px-2 py-1 rounded shadow-xl border border-[#282a3a] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              {item.tooltip}
            </span>
          </button>
        ))}
      </div>

      {/* Bottom Area: Settings & User Avatar */}
      <div className="flex flex-col items-center space-y-4 pt-4 border-t border-[#1a1c27] w-full">
        {/* Settings gear */}
        <button
          onClick={onOpenSettings}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-[#8e90a5] hover:text-white hover:bg-[#1a1b24] transition-colors group relative"
          title="Settings & Preferences"
        >
          <Settings className="w-5 h-5 transition-transform group-hover:rotate-45 duration-300" />
          <span className="absolute left-16 bg-[#181924] text-xs text-white px-2.5 py-1.5 rounded-md shadow-xl border border-[#2b2d3e] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            Settings & Preferences
          </span>
        </button>

        {/* User Avatar with Profile Dropdown / Logout */}
        <div className="relative group">
          <div className="w-10 h-10 rounded-full overflow-hidden p-[1.5px] bg-gradient-to-tr from-purple-500 to-indigo-400 cursor-pointer shadow-md">
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80"}
              alt={user?.name || "User"}
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          {/* Quick Menu Popover */}
          <div className="absolute left-14 bottom-0 bg-[#161722] border border-[#262838] rounded-xl p-3 shadow-2xl w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="text-sm font-semibold text-white truncate">{user?.name || 'Alex Morgan'}</div>
            <div className="text-xs text-[#7e8299] truncate mb-2">{user?.email || 'alex.morgan@fintech.io'}</div>
            <div className="text-[11px] text-purple-400 font-medium mb-3">Currency: {user?.currency || '$'} USD</div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center space-x-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs py-1.5 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
