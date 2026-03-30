import './styles/App.css';
import React, { useState } from "react";

import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import StudentDashboard from "./components/StudentDashboard";
import SeatingGenerator from "./components/SeatingGenerator";
import SeatingView from "./components/SeatingView";
import StudentManager from "./components/StudentManager";
import ExamScheduleManager from "./components/ExamScheduleManager";
import AIAssistant from "./components/AIAssistant";

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'generate',  label: 'Generate Seating' },
  { id: 'view',      label: 'View Seating' },
  { id: 'students',  label: 'Students' },
  { id: 'schedule',  label: 'Exam Schedule' },
  { id: 'ai',        label: 'AI Assistant' },
];

function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab]   = useState('dashboard');

  const handleLogin  = (res) => setUser(res);
  const handleLogout = ()    => { setUser(null); setTab('dashboard'); };

  if (!user) return <LoginPage onLogin={handleLogin} />;

  if (user.role === 'STUDENT') {
    return <StudentDashboard info={user} onLogout={handleLogout} />;
  }

  const renderTab = () => {
    switch (tab) {
      case 'generate': return <SeatingGenerator />;
      case 'view':     return <SeatingView />;
      case 'students': return <StudentManager />;
      case 'schedule': return <ExamScheduleManager />;
      case 'ai':       return <AIAssistant />;
      default:         return <Dashboard onNavigate={setTab} />;
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
          {TABS.map(t => (
            <button
              key={t.id}
              className={`topnav-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <button
          className="btn btn-secondary"
          onClick={handleLogout}
          style={{ fontSize: '0.75rem', padding: '6px 14px' }}
        >
          Sign Out
        </button>
      </nav>

      <main className="page-content">
        {renderTab()}
      </main>
    </div>
  );
}

export default App;