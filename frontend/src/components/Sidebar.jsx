import React from 'react';
import { LayoutDashboard, Calendar, Users, Compass, BarChart2, HelpCircle, LogOut, Plus } from 'lucide-react';

export default function Sidebar({ currentView, setView, onLogout }) {
  return (
    <nav className="bg-[#f3f3f8] h-screen w-64 fixed left-0 top-0 border-r border-[#e2e2e7] shadow-sm flex flex-col p-4 space-y-4 hidden md:flex z-50">
      <div className="flex items-center space-x-3 mb-6 px-2">
        <div className="w-10 h-10 rounded-full bg-[#0070eb] flex items-center justify-center text-white font-bold text-sm">
          WP
        </div>
        <div>
          <h1 className="font-semibold text-[17px] text-[#1a1c1f]">WiseTravel Pro</h1>
          <p className="text-[11px] font-semibold text-[#414755]">Premium Agent Access</p>
        </div>
      </div>

      <button className="w-full bg-[#0058bc] hover:bg-[#004493] text-white text-[13px] font-medium py-2.5 rounded-lg mb-4 transition-colors flex items-center justify-center space-x-2">
        <Plus size={16} />
        <span>New Trip</span>
      </button>

      <div className="flex-1 space-y-1">
        <button 
          onClick={() => setView('agent')} 
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${currentView === 'agent' ? 'bg-[#0070eb] text-white font-bold' : 'text-[#414755] hover:bg-[#e8e8ed]'}`}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </button>
        <button 
          onClick={() => setView('colombo')} 
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${currentView === 'colombo' ? 'bg-[#0070eb] text-white font-bold' : 'text-[#414755] hover:bg-[#e8e8ed]'}`}
        >
          <Calendar size={18} />
          <span>Itinerary (Neha)</span>
        </button>
        <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-[13px] font-medium text-[#414755] hover:bg-[#e8e8ed] transition-all">
          <Users size={18} />
          <span>Clients</span>
        </button>
        <button onClick={() => setView('landing')} className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-[13px] font-medium text-[#414755] hover:bg-[#e8e8ed] transition-all">
          <Compass size={18} />
          <span>Explore Portal</span>
        </button>
        <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-[13px] font-medium text-[#414755] hover:bg-[#e8e8ed] transition-all">
          <BarChart2 size={18} />
          <span>Reports</span>
        </button>
      </div>

      <div className="pt-4 border-t border-[#e2e2e7] space-y-1">
        <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-[13px] font-medium text-[#414755] hover:bg-[#e8e8ed]">
          <HelpCircle size={18} />
          <span>Help Center</span>
        </button>
        <button onClick={onLogout} className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-[13px] font-medium text-[#ba1a1a] hover:bg-[#ffdad6]/40">
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
      </div>
    </nav>
  );
} 
