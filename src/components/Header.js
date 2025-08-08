import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * Header component renders the application title, navigation links and a
 * toggle button to switch between day/night modes. It receives the
 * current theme and a function to toggle the theme as props.
 */
const Header = ({ theme, toggleTheme }) => {
  return (
    <header className="header">
      <h1 className="app-title">Book Writing App</h1>
      <nav className="nav-links">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink>
        <NavLink to="/writing" className={({ isActive }) => isActive ? 'active' : ''}>Write</NavLink>
        <NavLink to="/progress" className={({ isActive }) => isActive ? 'active' : ''}>Progress</NavLink>
      </nav>
      <button onClick={toggleTheme} className="theme-toggle">
        {theme === 'light' ? 'Night Mode' : 'Day Mode'}
      </button>
    </header>
  );
};

export default Header;