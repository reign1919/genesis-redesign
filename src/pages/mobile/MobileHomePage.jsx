import React from 'react';
import { Link } from 'react-router-dom';
import MobileBackground from '../../components/mobile/MobileBackground';
import MobileHamburger from '../../components/mobile/MobileHamburger';
import MobileHero from '../../components/mobile/MobileHero';
import MobileCountdown from '../../components/mobile/MobileCountdown';
import MobileFAQ from '../../components/mobile/MobileFAQ';
import MobileCommittee from '../../components/mobile/MobileCommittee';
import './MobileHomePage.css';

const MobileHomePage = () => {
  return (
    <div className="m-home-wrapper">
      {/* Background */}
      <MobileBackground />

      {/* Grid overlay */}
      <div className="m-grid-overlay" aria-hidden="true" />

      {/* Hamburger nav */}
      <MobileHamburger />

      {/* Top header bar */}
      <header className="m-header">
        <span className="m-header-text">GENESIS</span>
      </header>

      {/* Content */}
      <main className="m-home-content">
        {/* Hero */}
        <MobileHero />

        {/* Countdown */}
        <section className="m-countdown-section">
          <MobileCountdown />
        </section>

        {/* FAQ / About */}
        <MobileFAQ />

        {/* Committee */}
        <MobileCommittee />

        {/* Footer */}
        <footer className="m-home-footer">
          <Link to="/docs" className="m-docs-link">
            <span className="m-docs-icon">⊞</span>
            <span>DOCUMENTATION</span>
          </Link>
          <div className="m-footer-rule" />
          <span className="m-footer-copy label-caps">
            © Genesis Tech Fest — Indus Valley World School
          </span>
        </footer>
      </main>
    </div>
  );
};

export default MobileHomePage;
