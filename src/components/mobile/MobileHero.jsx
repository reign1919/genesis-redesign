import React, { useState, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/authContext';
import './MobileHero.css';

import schoolLogo from '../../../iconsredesign/icons/schoollogo.png';
import festLogo from '../../../iconsredesign/icons/festlogo.png';

const MESSAGES = [
  'git commit -m "innovate, ideate, inspire"',
  'git commit -m "building the future"',
  'init genesis_protocol.sh',
  'sys.boot() --verbose'
];

const MobileHero = () => {
  const { isLoggedIn, isLoaded, school } = useAuth();
  const [text, setText] = useState('');
  const [msgIndex, setMsgIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentMsg = MESSAGES[msgIndex];
    const typingSpeed = isDeleting ? 30 : 80;

    if (!isDeleting && text === currentMsg) {
      const pause = setTimeout(() => setIsDeleting(true), 2500);
      return () => clearTimeout(pause);
    }

    if (isDeleting && text === '') {
      setIsDeleting(false);
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
      return;
    }

    const timeout = setTimeout(() => {
      setText(prev =>
        isDeleting ? currentMsg.substring(0, prev.length - 1) : currentMsg.substring(0, prev.length + 1)
      );
    }, typingSpeed + Math.random() * 30);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, msgIndex]);

  return (
    <section className="m-hero">
      {/* Top accent */}
      <div className="m-hero-top-accent">
        <span className="m-hero-accent-text label-caps">GENESIS TECH FEST</span>
        <div className="m-hero-accent-line" />
      </div>

      {/* Logos */}
      <div className="m-hero-logos">
        <img src={schoolLogo} alt="Indus Valley World School" className="m-hero-logo" />
        <div className="m-hero-logo-divider" />
        <img src={festLogo} alt="Genesis" className="m-hero-logo" />
      </div>

      {/* Title */}
      <h1 className="m-hero-title">GENESIS</h1>

      {/* Typewriter */}
      <div className="m-hero-typewriter">
        <code>{text}<span className="m-cursor blink">_</span></code>
      </div>

      {/* CTA */}
      <div className="m-hero-cta-row">
        <Link to="/login" className="m-hero-cta">
          <span>REGISTER NOW</span>
          <span className="m-cta-arrow">→</span>
        </Link>
        {isLoaded && isLoggedIn && (
          <Link to="/dashboard" className="m-hero-dashboard-btn">
            <span className="m-dash-icon">◉</span>
            <span>DASHBOARD — {school?.schoolCode || 'GENESIS'}</span>
          </Link>
        )}
      </div>

      {/* Bottom data strip */}
      <div className="m-hero-data-strip">
        <span className="label-caps">INDUS VALLEY WORLD SCHOOL</span>
        <span className="label-caps" style={{ color: 'var(--accent-deep)' }}>22.5121°N / 88.4027°E</span>
      </div>
    </section>
  );
};

export default memo(MobileHero);
