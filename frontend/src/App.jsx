import { useContext, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { AuthProvider } from './context/AuthProvider';
import { portalPath } from './lib/authNavigation';
import Sidebar from './components/Sidebar';
import AgentDashboard from './components/AgentDashboard';
import ColomboItinerary from './components/ColomboItinerary';
import Register from './components/Register';
import Login from './components/Login';
import LandingPage from './components/LandingPage';
import OAuthCallback from './components/OAuthCallback';
import TripEditor from './components/TripEditor';
import Messages from './components/Messages';
import { Trips, Clients, Reports, History, Help } from './components/PortalPages';
function Protected({ agentOnly = false }) {
  const { user, checking } = useContext(AuthContext);
  const location = useLocation();
  if (checking) return <p role="status" className="p-8">Checking session…</p>;
  if (!user?.token) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (agentOnly && user.role !== 'Travel Agent') return <Navigate to="/trips" replace />;
  return <Outlet />;
}
function GuestOnly() {
  const { user, checking } = useContext(AuthContext);
  const [signedInOnEntry] = useState(() => Boolean(user?.token));
  if (checking) return <p role="status" className="p-8">Checking session…</p>;
  return signedInOnEntry && user?.token ? <Navigate to={portalPath(user.role)} replace /> : <Outlet />;
}
function Portal() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  return <div className="min-h-screen bg-[#f9f9fe] font-['Inter']">
    <Sidebar onLogout={() => { logout(); navigate('/'); }} />
    <div className="md:ml-64"><Outlet /></div>
  </div>;
}
export default function App() {
  return <AuthProvider><BrowserRouter><Routes>
    <Route path="/" element={<LandingPage />} />
    <Route element={<GuestOnly />}>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Route>
    <Route path="/oauth/callback" element={<OAuthCallback />} />
    <Route element={<Protected />}><Route element={<Portal />}>
      <Route path="/colombo" element={<Navigate to="/trips" replace />} />
      <Route path="/trips" element={<Trips />} />
      <Route path="/trips/new" element={<main className="p-6 md:p-8"><TripEditor /></main>} />
      <Route path="/trips/:id" element={<ColomboItinerary />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/history" element={<History />} />
      <Route path="/help" element={<Help />} />
      <Route element={<Protected agentOnly />}>
        <Route path="/agent" element={<AgentDashboard />} />
        <Route path="/agent/new" element={<main className="p-6 md:p-8"><TripEditor /></main>} />
        <Route path="/agent/clients" element={<Clients />} />
        <Route path="/agent/reports" element={<Reports />} />
      </Route>
    </Route></Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></BrowserRouter></AuthProvider>;
}
