import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Sparkles, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setError('');
    setLoading(true);
    try {
      await demoLogin();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c11] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow backgrounds */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#14151f] border border-[#232533] rounded-[28px] p-8 shadow-2xl relative z-10">
        {/* App Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-700 via-indigo-600 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-purple-600/30 mb-3">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" strokeDasharray="32 10" />
              <path d="M12 8v8M8 12h8" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Expense Tracker</h1>
          <p className="text-xs text-[#7d8098] mt-1 font-medium">Financial Security & Analytics Dashboard</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {/* Demo Login Button for Instant Review */}
        <button
          type="button"
          onClick={handleDemo}
          disabled={loading}
          className="w-full mb-5 flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-3 px-4 rounded-xl text-xs shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-purple-200" />
          <span>Instant Demo Login (Pre-seeded Reference Data)</span>
        </button>

        <div className="relative my-4 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#232533]" />
          </div>
          <span className="relative bg-[#14151f] px-3 text-[11px] uppercase tracking-wider text-[#63667c]">
            Or Sign In With Email
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[#878a9f] block mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#63667c] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full bg-[#1a1b27] border border-[#272a3d] focus:border-purple-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#878a9f] block mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#63667c] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#1a1b27] border border-[#272a3d] focus:border-purple-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1e202e] hover:bg-[#27293b] border border-[#2d3045] text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-[#71748d] mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-purple-400 hover:text-purple-300 font-semibold">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
