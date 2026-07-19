import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NeuralBackground from '../components/NeuralBackground';
import useIsMobile from '../lib/useIsMobile';
import MobileBackground from '../components/mobile/MobileBackground';
import './NotFoundPage.css';

export default function NotFoundPage() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="notfound-wrapper">
      {/* Show appropriate background based on device */}
      {isMobile ? <MobileBackground /> : <NeuralBackground />}
      
      <div className="notfound-grid-overlay" aria-hidden="true" />
      
      {/* Desktop Header */}
      {!isMobile && (
        <header className="notfound-tech-header">
          <Link to="/">GENESIS TECH FEST</Link>
          <span>INDUS VALLEY WORLD SCHOOL</span>
        </header>
      )}

      <main className="notfound-content">
        <div className="notfound-glitch-container">
          <h1 className="notfound-title" data-text="404">404</h1>
        </div>
        
        <div className="notfound-message-box">
          <span className="notfound-eyebrow label-caps">SYSTEM ERROR: ORPHANED NODE</span>
          <p className="notfound-quote">
            "Even in the infinite void of cyberspace, some coordinates lead to nowhere."
          </p>
          <div className="notfound-divider">
            <div className="notfound-divider-line" />
            <div className="notfound-divider-dot" />
            <div className="notfound-divider-line" />
          </div>
          <p className="notfound-desc">
            The neural pathway you requested does not exist or has been severed. 
            Initiating automatic recall to the mainframe in <strong>{countdown}</strong> seconds.
          </p>
        </div>

        <Link to="/" className="notfound-cta">
          <span>ABORT & RETURN TO BASE</span>
          <span className="notfound-cta-arrow">→</span>
        </Link>
      </main>

      {/* Frame brackets (Desktop only) */}
      {!isMobile && (
        <div className="notfound-frame">
          <div className="notfound-bracket notfound-bracket--tl" />
          <div className="notfound-bracket notfound-bracket--tr" />
          <div className="notfound-bracket notfound-bracket--bl" />
          <div className="notfound-bracket notfound-bracket--br" />
        </div>
      )}
    </div>
  );
}
