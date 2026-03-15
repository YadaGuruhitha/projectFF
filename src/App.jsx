import React, { useState, useEffect } from 'react';
import './styles/App.css';

import LoginPage            from './components/LoginPage';
import Dashboard            from './components/Dashboard';
import SeatingGenerator     from './components/SeatingGenerator';
import SeatingView          from './components/SeatingView';
import AIAssistant          from './components/AIAssistant';
import StudentManager       from './components/StudentManager';
import StudentDashboard     from './components/StudentDashboard';
import ExamScheduleManager  from './components/ExamScheduleManager';

const SESSION_KEY = 'smartseat_session';

const ADMIN_TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'generate',  label: 'Generate Seating' },
  { id: 'view',      label: 'Seating Chart' },
  { id: 'schedule',  label: '📅 Exam Schedule' },
  { id: 'ai',        label: '🤖 AI Import' },
  { id: 'students',  label: 'Students' },
];

export default function App() {
  const [session, setSession]     = useState(null); // full login response
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      try { setSession(JSON.parse(saved)); }
      catch { sessionStorage.removeItem(SESSION_KEY); }
    }
  }, []);

  const handleLogin = (res) => {
    setSession(res);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(res));
  };

  const handleLogout = () => {
    setSession(null);
    sessionStorage.removeItem(SESSION_KEY);
    setActiveTab('dashboard');
  };

  // Not logged in
  if (!session) return <LoginPage onLogin={handleLogin} />;

  // Student view
  if (session.role === 'STUDENT') {
    return <StudentDashboard info={session} onLogout={handleLogout} />;
  }

  // Admin view
  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard onNavigate={setActiveTab} />;
      case 'generate':  return <SeatingGenerator />;
      case 'view':      return <SeatingView />;
      case 'schedule':  return <ExamScheduleManager />;
      case 'ai':        return <AIAssistant />;
      case 'students':  return <StudentManager />;
      default:          return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="app-shell">
      <nav className="topnav">
        <div className="topnav-brand">
          <div className="topnav-logo">🪑</div>
          <span className="topnav-name">Smart<span>Seat</span></span>
        </div>
        <div className="topnav-tabs">
          {ADMIN_TABS.map(tab => (
            <button key={tab.id}
              className={`topnav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
            color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            👤 {session.username}
          </span>
          <button className="btn btn-secondary" onClick={handleLogout}
            style={{ padding: '5px 12px', fontSize: '0.72rem' }}>
            Sign Out
          </button>
        </div>
      </nav>
      <main className="page-content">{renderPage()}</main>
    </div>
  );
}