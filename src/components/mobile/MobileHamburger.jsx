import React, { useState, useEffect, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './MobileHamburger.css';
import CreatorsPopup from '../CreatorsPopup';
import webDevIcon from '../../assets/web-development.png';

const navItems = [
  { to: '/', label: 'HOME', icon: '⌂' },
  { to: '/#about', label: 'ABOUT', hash: true, icon: '◎' },
  {
    to: '/events',
    label: 'EVENTS',
    icon: (
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="rgba(230, 57, 70, 0.35)" stroke="var(--accent, #E63946)" strokeWidth="2.2" strokeLinejoin="round">
          <polygon points="12 2 22 12 12 22 2 12" />
        </svg>
      </span>
    ),
  },
  { to: '/contact', label: 'CONTACT', icon: '◈' },
  { to: '/login', label: 'REGISTER', icon: '◉' },
  { to: '/docs', label: 'DOCUMENTATION', icon: '⊞' },
  { action: 'creators', label: 'DEVELOPERS', icon: <img src={webDevIcon} alt="Web Dev" style={{ width: '18px', height: '18px', objectFit: 'contain' }} /> },
];

const MobileHamburger = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreators, setShowCreators] = useState(false);
  const location = useLocation();

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Hamburger button */}
      <button
        className={`hamburger-btn ${isOpen ? 'active' : ''}`}
        onClick={toggleMenu}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
      >
        <span className="hamburger-line line-1" />
        <span className="hamburger-line line-2" />
        <span className="hamburger-line line-3" />
      </button>

      {/* Backdrop */}
      <div
        className={`hamburger-backdrop ${isOpen ? 'visible' : ''}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-in panel */}
      <nav className={`hamburger-panel ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="hamburger-panel-header">
          <span className="panel-brand">GENESIS</span>
          <span className="panel-tag label-caps">TECH FEST</span>
        </div>

        {/* Divider */}
        <div className="panel-divider">
          <div className="panel-divider-line" />
          <div className="panel-divider-dot" />
          <div className="panel-divider-line panel-divider-line--short" />
        </div>

        {/* Nav links */}
        <ul className="hamburger-nav-list">
          {navItems.map((item, i) => {
            const isActive = item.hash
              ? location.hash === '#about'
              : item.to ? location.pathname === item.to : false;

            return (
              <li key={item.label} className="hamburger-nav-item" style={{ animationDelay: `${i * 60}ms` }}>
                {item.action ? (
                  <button
                    className="hamburger-nav-link"
                    onClick={() => { setIsOpen(false); setShowCreators(true); }}
                  >
                    <span className="nav-link-icon">{item.icon}</span>
                    <span className="nav-link-label">{item.label}</span>
                    <span className="nav-link-arrow">→</span>
                  </button>
                ) : item.hash ? (
                  <a
                    href={item.to}
                    className={`hamburger-nav-link ${isActive ? 'active' : ''}`}
                    onClick={(e) => {
                      setIsOpen(false);
                      if (location.pathname === '/') {
                        e.preventDefault();
                        const el = document.getElementById('about');
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth' });
                        }
                      }
                    }}
                  >
                    <span className="nav-link-icon">{item.icon}</span>
                    <span className="nav-link-label">{item.label}</span>
                    <span className="nav-link-arrow">→</span>
                  </a>
                ) : (
                  <Link
                    to={item.to}
                    className={`hamburger-nav-link ${isActive ? 'active' : ''}`}
                  >
                    <span className="nav-link-icon">{item.icon}</span>
                    <span className="nav-link-label">{item.label}</span>
                    <span className="nav-link-arrow">→</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        {/* Footer accent */}
        <div className="panel-footer">
          <span className="panel-footer-text label-caps">Indus Valley World School</span>
          <span className="panel-footer-coord label-caps">22.4845545°N / 88.3960671°E</span>
        </div>
      </nav>
      <CreatorsPopup isOpen={showCreators} onClose={() => setShowCreators(false)} />
    </>
  );
};

export default memo(MobileHamburger);
