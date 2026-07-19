import React, { useState, useEffect, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './MobileHamburger.css';

const navItems = [
  { to: '/', label: 'HOME', icon: '⌂' },
  { to: '/contact', label: 'CONTACT', icon: '◈' },
  { to: '/login', label: 'REGISTER', icon: '◉' },
  { to: '/#about', label: 'ABOUT', hash: true, icon: '◎' },
  { to: '/docs', label: 'DOCUMENTATION', icon: '⊞' },
];

const MobileHamburger = () => {
  const [isOpen, setIsOpen] = useState(false);
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
              : location.pathname === item.to;

            return (
              <li key={item.to} className="hamburger-nav-item" style={{ animationDelay: `${i * 60}ms` }}>
                {item.hash ? (
                  <a
                    href={item.to}
                    className={`hamburger-nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => setIsOpen(false)}
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
          <span className="panel-footer-coord label-caps">22.5121°N / 88.4027°E</span>
        </div>
      </nav>
    </>
  );
};

export default memo(MobileHamburger);
