import React, { useState } from 'react';
import { ArrowUpRight, ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';

export default function StatisticsCard({ data, period = 'Weekly', onPeriodChange }) {
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);

  const series = data?.chart_series || [
    { day: 'Mon', income: 640, outcome: 320, label: '↑ 0.24%', direction: 'up' },
    { day: 'Tue', income: 720, outcome: 380, label: '↓ 0.28%', direction: 'down' },
    { day: 'Wed', income: 1040, outcome: 420, label: '↑ 0.12%', direction: 'up' },
    { day: 'Thu', income: 890, outcome: 360, label: '↑ 0.32%', direction: 'up' },
    { day: 'Fri', income: 1200, outcome: 490, label: '↑ 0.16%', direction: 'up' },
    { day: 'Sat', income: 1650, outcome: 540, label: '↑ 0.24%', direction: 'up' },
    { day: 'Sun', income: 980, outcome: 410, label: '↓ 0.24%', direction: 'down' },
  ];

  const maxVal = Math.max(...series.map(s => (s.income || 0) + (s.outcome || 0))) || 2000;

  return (
    <div className="bg-[#14151e] border border-[#232533] rounded-[24px] p-6 flex flex-col justify-between relative shadow-xl hover:border-[#2f3246] transition-all">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white tracking-tight">Statistics</h2>

        <div className="flex items-center space-x-2">
          {/* Sort By Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center space-x-1.5 bg-[#1a1b26] hover:bg-[#202230] border border-[#2b2d3e] text-xs text-[#a3a6bd] hover:text-white px-3 py-1.5 rounded-full transition-colors cursor-pointer"
            >
              <span>Sort by {period}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#73768c]" />
            </button>

            {showSortDropdown && (
              <div className="absolute right-0 mt-1 bg-[#1a1b27] border border-[#2a2c3f] rounded-xl py-1 w-32 shadow-2xl z-30">
                {['Weekly', 'Monthly', 'Yearly'].map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      onPeriodChange && onPeriodChange(p);
                      setShowSortDropdown(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-[#a3a6bd] hover:text-white hover:bg-purple-600/20 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Expand Arrow Button */}
          <button 
            className="w-8 h-8 rounded-full bg-[#1a1b26] hover:bg-[#232536] border border-[#2b2d3e] flex items-center justify-center text-[#9fa2b8] hover:text-white transition-colors cursor-pointer"
            title="Detailed View"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Middle Stat Section */}
      <div className="mt-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          {/* Period Badge */}
          <div className="inline-block bg-[#1a1b26] border border-[#282a3b] text-[#9396ac] text-[11px] font-medium px-2.5 py-0.5 rounded-full mb-2">
            {data?.period_label || '7 days'}
          </div>

          {/* Big Amount + Percentage Pill */}
          <div className="flex items-baseline space-x-2.5">
            <span className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              {data?.total_amount || '$8,484k'}
            </span>
            <span className="bg-[#172520] border border-[#224436] text-[#34d399] text-xs font-semibold px-2 py-0.5 rounded-full flex items-center space-x-1">
              <span>{data?.percentage_change || '+ 4.1%'}</span>
            </span>
          </div>

          <p className="text-xs text-[#6e7188] mt-1 font-medium">
            Income source statistic in a month
          </p>
        </div>
      </div>

      {/* Bar Chart Area */}
      <div className="mt-6 mb-2">
        <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 relative pt-8 pb-2">
          {/* Horizontal dotted grid line */}
          <div className="absolute top-10 left-0 right-0 border-b border-dashed border-[#232636] pointer-events-none" />

          {series.map((item, idx) => {
            const totalHeight = 160;
            const incH = Math.max(28, Math.round(((item.income || 600) / maxVal) * totalHeight));
            const outH = Math.max(16, Math.round(((item.outcome || 300) / maxVal) * totalHeight * 0.7));

            return (
              <div 
                key={idx} 
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                onMouseEnter={() => setActiveTooltip(item)}
                onMouseLeave={() => setActiveTooltip(null)}
              >
                {/* Arrow & Percentage indicator on top of bar */}
                <div className="mb-2 text-[10px] font-semibold text-[#8a8ea5] group-hover:text-purple-400 flex items-center transition-colors">
                  <span className={item.direction === 'up' ? 'text-purple-400' : 'text-[#8a8ea5]'}>
                    {item.label}
                  </span>
                </div>

                {/* Vertical Bar Stack */}
                <div className="w-full max-w-[36px] flex flex-col items-center">
                  {/* Upper Hatched/Striped segment */}
                  <div 
                    style={{ height: `${outH}px` }}
                    className="w-full rounded-t-lg border-t border-x border-[#34384d]/60 hatched-pattern group-hover:brightness-125 transition-all"
                  />

                  {/* Lower Solid Purple Gradient segment */}
                  <div 
                    style={{ height: `${incH}px` }}
                    className="w-full bg-gradient-to-b from-[#8b5cf6] via-[#7c3aed] to-[#581c87] rounded-b-lg shadow-md group-hover:shadow-purple-600/50 group-hover:from-[#9d6dff] transition-all"
                  />
                </div>

                {/* Day label */}
                <span className="text-[11px] text-[#63667c] mt-2 group-hover:text-white transition-colors">
                  {item.day}
                </span>

                {/* Hover Tooltip */}
                {activeTooltip === item && (
                  <div className="absolute -top-12 bg-[#1b1d2a] border border-[#2f3248] text-white text-[11px] rounded-lg px-2.5 py-1.5 shadow-2xl z-40 whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                    <div className="font-semibold text-purple-300">{item.day}</div>
                    <div className="text-[10px] text-slate-300">Income: ${item.income}</div>
                    <div className="text-[10px] text-slate-400">Expense: ${item.outcome}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend below the chart */}
      <div className="pt-3 border-t border-[#1c1d29] flex flex-wrap items-center gap-4 text-xs font-medium text-[#7d8199]">
        <div className="flex items-center space-x-1.5">
          <div className="w-2 h-2 rounded-full bg-purple-500 shadow-sm shadow-purple-500/80" />
          <span className="text-slate-200">Salary</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-2 h-2 rounded-full bg-[#5d6077]" />
          <span>Bonus</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-2 h-2 rounded-full bg-[#5d6077]" />
          <span>Freelance</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-2 h-2 rounded-full bg-[#5d6077]" />
          <span>Others</span>
        </div>
      </div>
    </div>
  );
}
