import React, { useState, useEffect, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './MobileHamburger.css';
import CreatorsPopup from '../CreatorsPopup';
import webDevIcon from '../../assets/web-development.png';

const mainNavItems = [
  { to: '/', label: 'HOME', icon: '⌂' },
  { to: '/login', label: 'REGISTER', icon: '◉' },
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
  { to: '/sponsors', label: 'OUR SPONSORS', icon: '★' },
  { to: '/partnerships', label: 'PARTNER WITH US', icon: '✦' },
];

const miniNavItems = [
  { to: '/#faq', label: 'FAQ', hash: true, icon: '◎' },
  { to: '/contact', label: 'CONTACT', icon: '◈' },
  { action: 'creators', label: 'DEVELOPERS', icon: <img src={webDevIcon} alt="Web Dev" style={{ width: '16px', height: '16px', objectFit: 'contain' }} /> },
  { to: '/docs', label: 'DOCUMENTATION', icon: '⊞' },
];

const MobileHamburger = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreators, setShowCreators] = useState(false);
  const location = useLocation();

  const isMiniRouteActive = location.pathname === '/contact' || location.pathname === '/docs' || location.hash === '#faq' || location.hash === '#about';
  const [isMiniOpen, setIsMiniOpen] = useState(isMiniRouteActive);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Auto-expand mini hamburger if user navigates to a mini route
  useEffect(() => {
    if (location.pathname === '/contact' || location.pathname === '/docs' || location.hash === '#faq' || location.hash === '#about') {
      setIsMiniOpen(true);
    }
  }, [location.pathname, location.hash]);

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

        {/* Main Nav links */}
        <ul className="hamburger-nav-list">
          {mainNavItems.map((item, i) => {
            const isActive = item.to ? location.pathname === item.to : false;

            return (
              <li key={item.label} className="hamburger-nav-item" style={{ animationDelay: `${i * 50}ms` }}>
                <Link
                  to={item.to}
                  className={`hamburger-nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  <span className="nav-link-icon">{item.icon}</span>
                  <span className="nav-link-label">{item.label}</span>
                  <span className="nav-link-arrow">→</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Mini Hamburger Section under the main navigation */}
        <div className="mini-hamburger-section">
          <button
            type="button"
            className={`mini-hamburger-toggle ${isMiniOpen ? 'active' : ''}`}
            onClick={() => setIsMiniOpen(!isMiniOpen)}
            aria-expanded={isMiniOpen}
            aria-label={isMiniOpen ? 'Collapse secondary menu' : 'Expand secondary menu'}
          >
            <div className="mini-toggle-left">
              <span className={`mini-hamburger-icon ${isMiniOpen ? 'active' : ''}`} aria-hidden="true">
                <span className="mini-line line-1" />
                <span className="mini-line line-2" />
                <span className="mini-line line-3" />
              </span>
              <span className="mini-toggle-label label-caps">EXTRAS // MORE</span>
            </div>
            <div className="mini-toggle-right">
              <span className="mini-toggle-badge label-caps">
                {isMiniOpen ? 'COLLAPSE' : '4 EXTRAS'}
              </span>
              <span className="mini-toggle-chevron" aria-hidden="true">
                {isMiniOpen ? '▲' : '▼'}
              </span>
            </div>
          </button>

          {/* Mini Nav Links Drawer Container */}
          <div className={`mini-nav-container ${isMiniOpen ? 'open' : ''}`}>
            <div className="mini-nav-inner">
              <ul className="mini-nav-list">
                {miniNavItems.map((item) => {
                  const isActive = item.hash
                    ? (location.hash === '#faq' || location.hash === '#about')
                    : item.to ? location.pathname === item.to : false;

                  return (
                    <li key={item.label} className="mini-nav-item">
                      {item.action ? (
                        <button
                          type="button"
                          className="mini-nav-link"
                          onClick={() => { setIsOpen(false); setShowCreators(true); }}
                        >
                          <span className="mini-link-icon">{item.icon}</span>
                          <span className="mini-link-label">{item.label}</span>
                          <span className="mini-link-arrow">→</span>
                        </button>
                      ) : item.hash ? (
                        <a
                          href={item.to}
                          className={`mini-nav-link ${isActive ? 'active' : ''}`}
                          onClick={(e) => {
                            setIsOpen(false);
                            if (location.pathname === '/') {
                              e.preventDefault();
                              const el = document.getElementById('faq') || document.getElementById('about');
                              if (el) {
                                el.scrollIntoView({ behavior: 'smooth' });
                              }
                            }
                          }}
                        >
                          <span className="mini-link-icon">{item.icon}</span>
                          <span className="mini-link-label">{item.label}</span>
                          <span className="mini-link-arrow">→</span>
                        </a>
                      ) : (
                        <Link
                          to={item.to}
                          className={`mini-nav-link ${isActive ? 'active' : ''}`}
                          onClick={() => setIsOpen(false)}
                        >
                          <span className="mini-link-icon">{item.icon}</span>
                          <span className="mini-link-label">{item.label}</span>
                          <span className="mini-link-arrow">→</span>
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

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
