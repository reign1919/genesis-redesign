import React from 'react';
import Loader from './Loader';
import './LoadingScreen.css';

export default function LoadingScreen() {
  return (
    <div className="loading-screen-container">
      <div className="loading-screen-content">
        <Loader />
        <h1 className="loading-screen-brand">GENESIS</h1>
        <p className="loading-screen-status">INITIALIZING SYSTEMS...</p>
      </div>
    </div>
  );
}
