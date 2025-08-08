import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import WritingArea from './components/WritingArea';
import Dashboard from './components/Dashboard';
import ProgressTracker from './components/ProgressTracker';
import './App.css';

/**
 * Top-level component that sets up routing and manages the light/dark theme.
 * The theme state is passed down to the Header to allow toggling between
 * day and night modes. Each route renders a separate feature of the app.
 */
function App() {
  // Persist theme choice in localStorage so it is remembered across reloads
  const storedTheme = localStorage.getItem('theme') || 'light';
  const [theme, setTheme] = useState(storedTheme);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  return (
    <div className={`App ${theme}`}>
      <Router>
        <Header theme={theme} toggleTheme={toggleTheme} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/writing" element={<WritingArea />} />
            <Route path="/progress" element={<ProgressTracker />} />
          </Routes>
        </main>
      </Router>
    </div>
  );
}

export default App;
