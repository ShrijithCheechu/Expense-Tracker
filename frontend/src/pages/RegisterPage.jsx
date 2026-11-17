import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c11] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#14151f] border border-[#232533] rounded-[28px] p-8 shadow-2xl relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-700 via-indigo-600 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-purple-600/30 mb-3">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" strokeDasharray="32 10" />
              <path d="M12 8v8M8 12h8" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Create Account</h1>
          <p className="text-xs text-[#7d8098] mt-1 font-medium">Get started with Expense Tracker</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[#878a9f] block mb-1.5">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-[#63667c] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Morgan"
                className="w-full bg-[#1a1b27] border border-[#272a3d] focus:border-purple-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none"
              />
            </div>
          </div>

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
            className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer mt-2"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-xs text-[#71748d] mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
