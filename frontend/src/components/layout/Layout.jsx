import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import SettingsModal from '../modals/SettingsModal';
import AiAssistantModal from '../modals/AiAssistantModal';

export default function Layout({ 
  children, 
  title, 
  subtitle,
  period = 'Weekly',
  onPeriodChange,
  selectedDate = '2024-04-16',
  onDateChange,
  searchTerm = '',
  onSearchChange
}) {
  const [showSettings, setShowSettings] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b0c11] text-[#e2e8f0] flex">
      {/* Sidebar */}
      <Sidebar onOpenSettings={() => setShowSettings(true)} />

      {/* Main Container */}
      <div className="flex-1 ml-[74px] md:ml-[80px] px-6 lg:px-10 py-6 min-h-screen flex flex-col max-w-[1600px]">
        {/* Top Bar */}
        <TopBar
          period={period}
          onPeriodChange={onPeriodChange}
          selectedDate={selectedDate}
          onDateChange={onDateChange}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          onOpenAiAssistant={() => setShowAiModal(true)}
        />

        {/* Page Title & Subtitle */}
        {title && (
          <div className="mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">{title}</h1>
            {subtitle && (
              <p className="text-sm text-[#797c92] mt-1 font-normal">{subtitle}</p>
            )}
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* Global Modals */}
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
      {showAiModal && (
        <AiAssistantModal onClose={() => setShowAiModal(false)} />
      )}
    </div>
  );
}
