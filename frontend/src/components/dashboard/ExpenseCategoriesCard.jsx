import React from 'react';
import { Settings, ArrowUpRight, TrendingUp } from 'lucide-react';

export default function ExpenseCategoriesCard({ data, onOpenSettings }) {
  const recordedLabel = data?.recorded_label || '100% Data Recorded';
  const insightText = data?.insight_text || 'Profit is 24% More short last month';
  const insightBadge = data?.insight_badge || '+18.5%';

  // Render 26 radial segmented ticks across a 180-degree semicircular arc
  const totalTicks = 26;
  const radius = 95;
  const tickLength = 22;
  const centerX = 150;
  const centerY = 135;

  const ticks = [];
  for (let i = 0; i < totalTicks; i++) {
    // Angle in radians from Math.PI (left, 180 deg) to 0 (right, 0 deg)
    const angle = Math.PI - (i / (totalTicks - 1)) * Math.PI;
    const xInner = centerX + (radius - tickLength) * Math.cos(angle);
    const yInner = centerY - (radius - tickLength) * Math.sin(angle);
    const xOuter = centerX + radius * Math.cos(angle);
    const yOuter = centerY - radius * Math.sin(angle);

    // Color gradient across the ticks: from violet/purple to indigo/cyan
    const ratio = i / (totalTicks - 1);
    let strokeColor;
    if (ratio < 0.35) {
      strokeColor = '#a855f7'; // Purple-400
    } else if (ratio < 0.70) {
      strokeColor = '#818cf8'; // Indigo-400
    } else {
      strokeColor = '#6366f1'; // Blue/indigo
    }

    ticks.push({
      id: i,
      x1: xInner,
      y1: yInner,
      x2: xOuter,
      y2: yOuter,
      stroke: strokeColor,
      opacity: 0.9 + (i % 2 === 0 ? 0.1 : 0),
    });
  }

  return (
    <div className="bg-[#14151e] border border-[#232533] rounded-[24px] p-6 flex flex-col justify-between shadow-xl hover:border-[#2f3246] transition-all">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white tracking-tight">Expense Categories</h2>

        <div className="flex items-center space-x-2">
          {/* Settings button to manage categories */}
          <button
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-full bg-[#1a1b26] hover:bg-[#232536] border border-[#2b2d3e] flex items-center justify-center text-[#9fa2b8] hover:text-white transition-colors cursor-pointer"
            title="Manage Categories"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Expand Arrow Button */}
          <button
            className="w-8 h-8 rounded-full bg-[#1a1b26] hover:bg-[#232536] border border-[#2b2d3e] flex items-center justify-center text-[#9fa2b8] hover:text-white transition-colors cursor-pointer"
            title="Detailed View"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Semicircular Segmented Gauge */}
      <div className="my-2 flex flex-col items-center justify-center relative">
        <svg 
          viewBox="0 0 300 160" 
          className="w-64 h-36 drop-shadow-[0_0_20px_rgba(168,85,247,0.25)] overflow-visible"
        >
          <defs>
            <linearGradient id="gaugeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="50%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>

          {/* Semicircle ticks */}
          {ticks.map((t) => (
            <line
              key={t.id}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={t.stroke}
              strokeWidth="5.5"
              strokeLinecap="round"
              className="transition-all hover:stroke-purple-300 hover:stroke-[7]"
            />
          ))}
        </svg>

        {/* Central Metric */}
        <div className="absolute top-[68px] flex flex-col items-center justify-center text-center">
          <div className="text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
            100%
          </div>
          <div className="text-[11px] text-[#71748c] font-medium tracking-wide mt-0.5">
            Data Recorded
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-6 mt-1 text-xs font-medium text-[#7d8199]">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm shadow-purple-500/80" />
            <span className="text-slate-200">Income</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#3d4052]" />
            <span>Outcome</span>
          </div>
        </div>
      </div>

      {/* Footer Insight Line */}
      <div className="mt-4 pt-3 border-t border-[#1c1d29] flex items-center justify-between text-xs">
        <div className="text-[#84879f] text-[11px] sm:text-xs">
          Profit is <span className="text-purple-400 font-bold">24%</span> More short last month
        </div>

        <div className="flex items-center space-x-1 bg-[#1a1b28] border border-[#2b2d3f] text-[#a5a8c2] px-2.5 py-1 rounded-full text-[11px] font-semibold">
          <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
          <span>{insightBadge}</span>
        </div>
      </div>
    </div>
  );
}
