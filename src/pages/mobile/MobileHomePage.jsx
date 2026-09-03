import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import MobileBackground from '../../components/mobile/MobileBackground';
import MobileHamburger from '../../components/mobile/MobileHamburger';
import MobileHero from '../../components/mobile/MobileHero';
import MobileCountdown from '../../components/mobile/MobileCountdown';
import MobileFAQ from '../../components/mobile/MobileFAQ';
import SponsorsSection from '../../components/SponsorsSection';
import MobileCommittee from '../../components/mobile/MobileCommittee';
import SEO from '../../components/SEO';
import { getOrganizationSchema, getMainEventSchema } from '../../lib/seoData';
import './MobileHomePage.css';

const MobileHomePage = () => {
  useEffect(() => {
    if (window.location.hash === '#about') {
      const el = document.getElementById('about');
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    }
  }, []);

  return (
    <div className="m-home-wrapper">
      <SEO
        title="Genesis 2026 | Inter-School Tech Fest by Indus Valley World School"
        description="Join Genesis 2026, the premier first-edition inter-school tech festival by Indus Valley World School (IVWS). Featuring hackathons, robotics, cybersecurity CTF, coding contests, and digital art."
        canonical="/"
        jsonLd={[getOrganizationSchema(), getMainEventSchema()]}
      />
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
        <section aria-label="Hero Overview">
          <h2 className="sr-only">Welcome to Genesis 2026</h2>
          <h2 className="sr-only">Featured Competitions &amp; Technical Challenges</h2>
          <h2 className="sr-only">School Portal &amp; Registration Dashboard</h2>
          <MobileHero />
        </section>

        {/* Countdown */}
        <section className="m-countdown-section">
          <MobileCountdown />
        </section>

        {/* FAQ / About */}
        <MobileFAQ />

        {/* Sponsors */}
        <section className="m-sponsors-section" aria-label="Meet Our Sponsors">
          <SponsorsSection />
        </section>

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
