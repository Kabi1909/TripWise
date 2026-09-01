import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Login({ setView }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        login(data);
        setView(data.role === 'Travel Agent' ? 'agent' : 'colombo');
      } else {
        setErrorMsg(data.message || 'Invalid email or password');
      }
    } catch (err) {
      setErrorMsg('Cannot reach backend server. Please make sure the backend is running.');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[#f9f9fe] relative overflow-hidden font-['Inter']">
      {/* Decorative background glow matching the design system */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none flex justify-center items-center">
        <div className="w-[800px] h-[800px] rounded-full bg-gradient-to-tr from-[#d8e2ff] to-[#72fe88] blur-3xl mix-blend-multiply"></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[480px] bg-white rounded-xl border border-[#e2e2e7]/60 shadow-[0_8px_20px_rgba(0,0,0,0.06)] p-8 flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-[28px] font-bold text-[#1a1c1f] mb-1">Welcome back</h1>
          <p className="text-[15px] text-[#414755]">Log in to manage your bookings and custom itineraries.</p>
        </div>

        {/* OAuth Buttons */}
        <div className="flex flex-col gap-2.5">
          <button type="button" className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#e2e2e7] rounded-lg text-[13px] font-medium text-[#1a1c1f] hover:bg-[#f3f3f8] transition-colors">
            <span>👤 Continue with Google</span>
          </button>
          <button type="button" className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#e2e2e7] rounded-lg text-[13px] font-medium text-[#1a1c1f] hover:bg-[#f3f3f8] transition-colors">
            <span>💻 Continue with Apple</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-px bg-[#e2e2e7] flex-1"></div>
          <span className="text-[11px] font-semibold text-[#414755] uppercase">Or log in with email</span>
          <div className="h-px bg-[#e2e2e7] flex-1"></div>
        </div>

        {errorMsg && (
          <div className="bg-[#ffdad6] text-[#ba1a1a] text-[13px] font-medium p-3 rounded-lg border border-[#ba1a1a]/20">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-[#414755] mb-1">Email</label>
            <input 
              type="email"
              className="w-full bg-[#f3f3f8] border border-transparent focus:border-[#0058bc] rounded-lg py-2.5 px-3 text-[15px] text-[#1a1c1f] outline-none transition-colors" 
              placeholder="jane@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[11px] font-semibold text-[#414755]">Password</label>
              <a href="#" className="text-[11px] text-[#0058bc] hover:underline font-medium">Forgot?</a>
            </div>
            <input 
              type="password"
              className="w-full bg-[#f3f3f8] border border-transparent focus:border-[#0058bc] rounded-lg py-2.5 px-3 text-[15px] text-[#1a1c1f] outline-none transition-colors" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              className="w-full bg-[#0058bc] hover:bg-[#004493] text-white py-2.5 rounded-lg text-[13px] font-medium transition-all shadow-sm"
            >
              Log In
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-[15px] text-[#414755]">
            Don't have an account?{' '}
            <button 
              type="button"
              onClick={() => setView('register')} 
              className="text-[#0058bc] hover:underline font-medium"
            >
              Sign up
            </button>
          </p>
        </div>

        <p className="text-[11px] text-[#414755] text-center mt-auto">
          By signing in, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
        </p>
      </div>
    </main>
  );
} 
