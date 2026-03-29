import './styles/App.css';
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

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
  return (
    <Router>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<LoginPage />} />

        {/* Other routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/student" element={<StudentDashboard />} />
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