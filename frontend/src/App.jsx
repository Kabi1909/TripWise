import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import AgentDashboard from './components/AgentDashboard';
import ColomboItinerary from './components/ColomboItinerary';
import Register from './components/Register';
import Login from './components/Login';
import LandingPage from './components/LandingPage';

function AppContent() {
  const { logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const isAgent = location.pathname.startsWith('/agent');
  const isColombo = location.pathname.startsWith('/colombo');
  const showSidebar = isAgent || isColombo;
  const currentView = isColombo ? 'colombo' : 'agent';

  return (
    <div className="flex min-h-screen bg-[#f9f9fe]">
      {showSidebar && (
        <Sidebar 
          currentView={currentView} 
          onLogout={() => { 
            logout(); 
            navigate('/'); 
          }} 
        />
      )}

      <div className={`flex-1 w-full ${showSidebar ? 'md:ml-64' : ''}`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/agent" element={<AgentDashboard />} />
          <Route path="/colombo" element={<ColomboItinerary />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
} 
