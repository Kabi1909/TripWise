import React, { useState, useContext } from 'react';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import AgentDashboard from './components/AgentDashboard';
import ColomboItinerary from './components/ColomboItinerary';
import Register from './components/Register';
import Login from './components/Login';
import LandingPage from './components/LandingPage';

function AppContent() {
  const { user, logout } = useContext(AuthContext);
  const [view, setView] = useState('landing'); // 'landing' | 'login' | 'register' | 'agent' | 'colombo'

  return (
    <div className="flex min-h-screen bg-[#f9f9fe]">
      {/* Sidebar for agent dashboard and traveler itinerary views */}
      {(view === 'agent' || view === 'colombo') && (
        <Sidebar 
          currentView={view} 
          setView={setView} 
          onLogout={() => { logout(); setView('landing'); }} 
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 w-full">
        {view === 'landing' && <LandingPage setView={setView} />}
        {view === 'login' && <Login setView={setView} />}
        {view === 'register' && <Register setView={setView} />}
        {view === 'agent' && <AgentDashboard />}
        {view === 'colombo' && <ColomboItinerary />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
} 
