import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/authContext';
import './Layout.css';

const NAV_ITEMS = [
  { path: '/', label: 'Home' },
  { path: '/events', label: 'Events' },
  { path: '/contact', label: 'Contact' },
  { path: '/docs', label: 'Docs' },
];

export default function Layout({ children }) {
  const location = useLocation();
  const { isLoggedIn } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  /* ── Track scroll for nav shadow ─────────────────── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Close mobile menu on route change ───────────── */
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  /* ── Lock body scroll when mobile menu is open ───── */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const isActive = useCallback(
    (path) => {
      if (path === '/') return location.pathname === '/';
      return location.pathname.startsWith(path);
    },
    [location.pathname],
  );

  const year = new Date().getFullYear();

  return (
    <>
      {/* ── Navigation ──────────────────────────────── */}
      <nav
        className={`layout-nav${scrolled ? ' layout-nav--scrolled' : ''}`}
        role="navigation"
        aria-label="Primary navigation"
      >
        {/* Brand */}
        <Link to="/" className="layout-nav__brand" aria-label="Genesis home">
          <img
            src="/festlogo.png"
            alt=""
            className="layout-nav__logo"
            aria-hidden="true"
          />
          <span className="layout-nav__title">
            <span className="layout-nav__title-accent">G</span>enesis
          </span>
        </Link>

        {/* Desktop links */}
        <div className="layout-nav__links">
          {NAV_ITEMS.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`layout-nav__link${isActive(path) ? ' layout-nav__link--active' : ''}`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="layout-nav__actions">
          <span className="layout-nav__status">
            <span className="layout-nav__status-dot" aria-hidden="true" />
            LIVE
          </span>

          {isLoggedIn ? (
            <Link to="/dashboard" className="layout-nav__cta">
              Dashboard
            </Link>
          ) : (
            <Link to="/login" className="layout-nav__cta">
              Login
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            className={`layout-nav__menu-toggle${mobileOpen ? ' layout-nav__menu-toggle--open' : ''}`}
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            <span className="layout-nav__menu-bar" />
            <span className="layout-nav__menu-bar" />
            <span className="layout-nav__menu-bar" />
          </button>
        </div>
      </nav>

      {/* ── Mobile menu dropdown ────────────────────── */}
      <div
        className={`layout-nav__mobile-menu${mobileOpen ? ' layout-nav__mobile-menu--open' : ''}`}
        aria-hidden={!mobileOpen}
      >
        {NAV_ITEMS.map(({ path, label }) => (
          <Link
            key={path}
            to={path}
            className={`layout-nav__mobile-link${isActive(path) ? ' layout-nav__mobile-link--active' : ''}`}
          >
            {label}
          </Link>
        ))}
        <div className="layout-nav__mobile-divider" />
        {isLoggedIn ? (
          <Link to="/dashboard" className="layout-nav__mobile-link">
            Dashboard
          </Link>
        ) : (
          <Link to="/login" className="layout-nav__mobile-link">
            Login
          </Link>
        )}
      </div>

      {/* ── Page content ────────────────────────────── */}
      <main className="layout-main">{children}</main>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="layout-footer">
        <div className="layout-footer__left">
          <span className="layout-footer__brand">Genesis Tech Fest</span>
          <span className="layout-footer__separator" aria-hidden="true" />
          <span className="layout-footer__copy">
            &copy; {year} Indus Valley World School
          </span>
        </div>

        <div className="layout-footer__links">
          <Link to="/events" className="layout-footer__link">
            Events
          </Link>
          <Link to="/contact" className="layout-footer__link">
            Contact
          </Link>
          <Link to="/docs" className="layout-footer__link">
            Documentation
          </Link>
        </div>
      </footer>
    </>
  );
}
