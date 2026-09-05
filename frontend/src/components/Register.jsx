import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Register() {
  const [role, setRole] = useState('Traveler');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password, role })
      });
      const data = await res.json();
      if (res.ok) {
        login(data);
        navigate(data.role === 'Travel Agent' ? '/agent' : '/colombo');
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (err) {
      alert('Error connecting to backend');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[#f9f9fe] relative overflow-hidden font-['Inter']">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none flex justify-center items-center">
        <div className="w-[800px] h-[800px] rounded-full bg-gradient-to-tr from-[#d8e2ff] to-[#72fe88] blur-3xl mix-blend-multiply"></div>
      </div>

      <div className="relative z-10 w-full max-w-[480px] bg-white rounded-xl border border-[#e2e2e7]/60 shadow-[0_8px_20px_rgba(0,0,0,0.06)] p-8 flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-[28px] font-bold text-[#1a1c1f] mb-1">Create your account</h1>
          <p className="text-[15px] text-[#414755]">Join WiseTravel to start planning or managing trips.</p>
        </div>

        {/* Role Selector */}
        <div className="flex bg-[#ededf2] p-1 rounded-lg gap-1">
          <button 
            type="button" 
            onClick={() => setRole('Traveler')} 
            className={`flex-1 py-2 text-[13px] font-medium rounded transition-all ${role === 'Traveler' ? 'shadow-sm bg-white text-[#1a1c1f]' : 'text-[#414755]'}`}
          >
            Traveler
          </button>
          <button 
            type="button" 
            onClick={() => setRole('Travel Agent')} 
            className={`flex-1 py-2 text-[13px] font-medium rounded transition-all ${role === 'Travel Agent' ? 'shadow-sm bg-white text-[#1a1c1f]' : 'text-[#414755]'}`}
          >
            Travel Agent
          </button>
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
          <span className="text-[11px] font-semibold text-[#414755] uppercase">Or register with email</span>
          <div className="h-px bg-[#e2e2e7] flex-1"></div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-[#414755] mb-1">Full Name</label>
            <input 
              className="w-full bg-[#f3f3f8] border border-transparent focus:border-[#0058bc] rounded-lg py-2.5 px-3 text-[15px] outline-none" 
              placeholder="Jane Doe" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required 
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#414755] mb-1">Email</label>
            <input 
              type="email"
              className="w-full bg-[#f3f3f8] border border-transparent focus:border-[#0058bc] rounded-lg py-2.5 px-3 text-[15px] outline-none" 
              placeholder="jane@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#414755] mb-1">Password</label>
            <input 
              type="password"
              className="w-full bg-[#f3f3f8] border border-transparent focus:border-[#0058bc] rounded-lg py-2.5 px-3 text-[15px] outline-none" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <div className="pt-2">
            <button type="submit" className="w-full bg-[#0058bc] hover:bg-[#004493] text-white py-2.5 rounded-lg text-[13px] font-medium transition-all shadow-sm">
              Create Account
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-[15px] text-[#414755]">
            Already have an account?{' '}
            <button 
              type="button"
              onClick={() => navigate('/login')} 
              className="text-[#0058bc] hover:underline font-medium"
            >
              Log in
            </button>
          </p>
        </div>

        <p className="text-[11px] text-[#414755] text-center mt-auto">
          By registering, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
        </p>
      </div>
    </main>
  );
} 
