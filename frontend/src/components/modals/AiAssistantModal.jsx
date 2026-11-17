import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, CheckCircle } from 'lucide-react';

export default function AiAssistantModal({ onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hello! I am your AI Financial Copilot. I analyze your cash flows, category spending velocity, and card limits. How can I assist you with your expense report today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const samplePrompts = [
    "What is my spending trend this month?",
    "Am I on track with my petty expense budget?",
    "Which category took the most expenditure?",
    "Summarize my financial security score."
  ];

  const handleSend = (text) => {
    const query = text || input;
    if (!query.trim()) return;

    const userMsg = { role: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      let reply = "Based on your latest transactions:";
      const q = query.toLowerCase();
      if (q.includes('petty') || q.includes('budget')) {
        reply = "Your petty expense budget is set to $1,000.00 this month. You have spent approximately $170.00 (17%), leaving $830.00 remaining. You are well within your safe threshold (green zone).";
      } else if (q.includes('category') || q.includes('most')) {
        reply = "Your highest expenditure categories are Bills & Subscriptions ($14,185.00), driven mainly by Atlassian ($6,642) and Hotjar ($7,543) enterprise licenses.";
      } else if (q.includes('trend') || q.includes('spending')) {
        reply = "Your total income for the recent period is $20,974.00, exceeding outcome expenses of $18,753.00. Your net savings rate is +11.8% compared to the prior period.";
      } else {
        reply = "Financial Security Score: 94/100 (Optimal). All primary debit obligations are covered with over 2.4x monthly operational liquidity, and card limits are safely regulated.";
      }

      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-[#14151f] border border-[#272a3d] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col h-[520px]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#212332] bg-[#161724]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Ai Assistant</h3>
              <p className="text-[11px] text-[#787c94]">Smart Financial Copilot</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#1b1c28] hover:bg-[#25273a] text-[#8e91a8] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message history */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3">
          {messages.map((m, i) => (
            <div 
              key={i} 
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-purple-600 text-white rounded-br-none shadow-md'
                    : 'bg-[#1c1e2b] border border-[#2b2d3e] text-slate-200 rounded-bl-none shadow-sm'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#1c1e2b] border border-[#2b2d3e] text-purple-400 text-xs px-3.5 py-2 rounded-2xl rounded-bl-none flex items-center space-x-1.5 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Analyzing transaction telemetry...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick prompt suggestions */}
        <div className="px-5 py-2 border-t border-[#1e202e] flex flex-wrap gap-1.5">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="bg-[#1b1c29] hover:bg-[#232536] border border-[#282a3d] text-[11px] text-[#9195ae] hover:text-purple-300 px-2.5 py-1 rounded-full transition-colors truncate max-w-full"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input box */}
        <div className="p-4 border-t border-[#202230] bg-[#12131c]">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your income, expenses, or limits..."
              className="flex-1 bg-[#181926] border border-[#292b3d] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="bg-purple-600 hover:bg-purple-500 text-white p-2.5 rounded-xl transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
