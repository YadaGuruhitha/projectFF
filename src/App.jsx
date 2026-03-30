import './styles/App.css';
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Import all your components
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import StudentDashboard from "./components/StudentDashboard";
import SeatingGenerator from "./components/SeatingGenerator";
import SeatingView from "./components/SeatingView";
import StudentManager from "./components/StudentManager";
import ExamScheduleManager from "./components/ExamScheduleManager";
import AIAssistant from "./components/AIAssistant";

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (res) => {
    setUser(res); // res contains role, username, studentId, etc. from your backend
  };

  const handleLogout = () => {
    setUser(null);
  };

  // 1. Not logged in → show login page
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // 2. Student role → show student dashboard only
  if (user.role === 'STUDENT') {
    return <StudentDashboard info={user} onLogout={handleLogout} />;
  }

  // 3. Admin role → show full app with navigation
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/seating-generator" element={<SeatingGenerator />} />
        <Route path="/seating-view" element={<SeatingView />} />
        <Route path="/students" element={<StudentManager />} />
        <Route path="/exam-schedule" element={<ExamScheduleManager />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
      </Routes>
    </Router>
  );
}

export default App;
