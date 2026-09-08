import { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, Compass, BarChart2, HelpCircle, LogOut, Plus, MessageSquare } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
export default function Sidebar({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const agent = user.role === 'Travel Agent';
  const items = [
    ...(agent ? [{ path: '/agent', label: 'Dashboard', Icon: LayoutDashboard }] : []),
    { path: '/trips', label: 'Itineraries', Icon: Calendar },
    ...(agent ? [{ path: '/agent/clients', label: 'Clients', Icon: Users }] : []),
    { path: '/', label: 'Explore Portal', Icon: Compass },
    { path: '/messages', label: 'Messages', Icon: MessageSquare },
    { path: '/history', label: 'Trip History', Icon: Calendar },
    ...(agent ? [{ path: '/agent/reports', label: 'Reports', Icon: BarChart2 }] : []),
  ];
  return <>
    <div className="md:hidden bg-white border-b border-[#e2e2e7] p-3 flex gap-3 items-center">
      <select aria-label="Portal navigation" className="bg-[#f3f3f8] rounded-lg p-2 flex-1 min-w-0" value={items.some(i => i.path === location.pathname) ? location.pathname : ''} onChange={e => navigate(e.target.value)}>
        <option value="" disabled>Navigate portal</option>{items.map(i => <option key={i.path} value={i.path}>{i.label}</option>)}
        <option value={agent ? '/agent/new' : '/trips/new'}>New Trip</option>
      </select><button onClick={onLogout} aria-label="Log out" className="text-[#ba1a1a]"><LogOut size={20} /></button>
    </div>
    <nav className="bg-[#f3f3f8] h-screen w-64 fixed left-0 top-0 border-r border-[#e2e2e7] shadow-sm flex-col p-4 space-y-4 hidden md:flex z-50">
      <button onClick={() => navigate('/')} className="flex items-center space-x-3 mb-6 px-2 text-left">
        <div className="w-10 h-10 rounded-full bg-[#0070eb] flex items-center justify-center text-white font-bold text-sm">WP</div>
        <div><h1 className="font-semibold text-[17px] text-[#1a1c1f]">{agent ? 'WiseTravel Pro' : 'WiseTravel'}</h1><p className="text-[11px] font-semibold text-[#414755]">{agent ? 'Premium Agent Access' : 'Traveler Portal'}</p></div>
      </button>
      <button onClick={() => navigate(agent ? '/agent/new' : '/trips/new')} className="w-full bg-[#0058bc] hover:bg-[#004493] text-white text-[13px] font-medium py-2.5 rounded-lg mb-4 transition-colors flex items-center justify-center space-x-2 shadow-sm"><Plus size={16} /><span>New Trip</span></button>
      <div className="flex-1 space-y-1">{items.map(({ path, label, Icon }) => <button key={path} onClick={() => navigate(path)} className={'w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ' + (location.pathname === path ? 'bg-[#0070eb] text-white font-bold' : 'text-[#414755] hover:bg-[#e8e8ed]')}><Icon size={18} /><span>{label}</span></button>)}</div>
      <div className="pt-4 border-t border-[#e2e2e7] space-y-1">
        <button onClick={() => navigate('/help')} className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-[13px] font-medium text-[#414755] hover:bg-[#e8e8ed]"><HelpCircle size={18} /><span>Help Center</span></button>
        <button onClick={onLogout} className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-[13px] font-medium text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors"><LogOut size={18} /><span>Log Out</span></button>
      </div>
    </nav>
  </>;
}
