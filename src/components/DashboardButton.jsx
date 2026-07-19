import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/authContext';
import './DashboardButton.css';

export default function DashboardButton() {
  const { isLoggedIn, isLoaded, school } = useAuth();

  if (!isLoaded || !isLoggedIn) {
    return null;
  }

  return (
    <Link to="/dashboard" className="hud-dashboard-btn">
      <div className="hud-dashboard-btn-inner">
        <span className="hud-dashboard-icon">◉</span>
        <span className="hud-dashboard-text">
          CLICK TO OPEN DASHBOARD &mdash; {school?.schoolCode || 'GENESIS'}
        </span>
      </div>
    </Link>
  );
}
