import React from 'react';
import { Link } from 'react-router-dom';
import MobileBackground from '../../components/mobile/MobileBackground';
import MobileHamburger from '../../components/mobile/MobileHamburger';
import SEO from '../../components/SEO';
import { SPONSORS } from '../../lib/sponsorsData';
import './MobileSponsorsPage.css';

const MobileSponsorsPage = () => {
  return (
    <div className="m-sponsors-wrapper">
      <SEO
        title="Official Sponsors & Partners — Genesis 2026 | IVWS Tech Fest"
        description="Meet the official sponsors and partners supporting Genesis 2026 Tech Fest: StudyIn, n8n, .xyz, 91.9 Friends FM, The Telegraph: Young Metro, and React Kolkata."
        canonical="/sponsors"
      />

      {/* Cyber Mobile Background & Grid */}
      <MobileBackground />
      <div className="m-sponsors-grid-overlay" aria-hidden="true" />

      {/* Slide-out Menu */}
      <MobileHamburger />

      {/* Header Bar */}
      <header className="m-sponsors-header">
        <span className="m-sponsors-header-logo">GENESIS</span>
        <span className="m-sponsors-header-sep">/</span>
        <span className="m-sponsors-header-tag label-caps">SPONSORS</span>
      </header>

      {/* Main Content */}
      <main className="m-sponsors-content">
        
        {/* Hero */}
        <section className="m-sponsors-hero">
          <div className="m-sponsors-eyebrow label-caps">
            [OFFICIAL PARTNERS &amp; SPONSORS]
          </div>
          <h1 className="m-sponsors-title">
            Festival <span className="m-title-accent">Sponsors</span> &amp; Partners
          </h1>
          <p className="m-sponsors-subhead">
            Genesis 2026 is powered by industry leaders, media pioneers, and technical communities backing student innovation across Eastern India.
          </p>
        </section>

        {/* Sponsor Cards Stack */}
        <section className="m-sponsors-list" aria-label="Official Sponsors List">
          {SPONSORS.map((sponsor, index) => (
            <article key={sponsor.id} className="m-sponsor-card">
              {/* Corner HUD marks */}
              <span className="m-hud-mark m-mark-tl" aria-hidden="true">+</span>
              <span className="m-hud-mark m-mark-tr" aria-hidden="true">+</span>
              <span className="m-hud-mark m-mark-bl" aria-hidden="true">+</span>
              <span className="m-hud-mark m-mark-br" aria-hidden="true">+</span>

              {/* Card Meta Header */}
              <div className="m-card-meta">
                <span className="m-card-index label-caps">// 0{index + 1}</span>
                <span className="m-card-role label-caps">{sponsor.role}</span>
              </div>

              {/* Recessed Logo Container */}
              <div className="m-logo-chamber">
                <img
                  src={sponsor.logo}
                  alt={`${sponsor.name} logo`}
                  className={`m-logo-img m-logo-${sponsor.id}`}
                  loading="lazy"
                />
              </div>

              {/* Sponsor Information */}
              <div className="m-card-body">
                <h2 className="m-sponsor-name">{sponsor.name}</h2>
                <div className="m-card-line" aria-hidden="true" />
                <p className="m-sponsor-desc">{sponsor.description}</p>
              </div>

              {/* Action Link Button */}
              <div className="m-card-actions">
                <a
                  href={sponsor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="m-visit-btn label-caps"
                  aria-label={`Visit ${sponsor.name} official website (opens in new tab)`}
                >
                  <span>VISIT OFFICIAL WEBSITE</span>
                  <span className="m-btn-arrow" aria-hidden="true">↗</span>
                </a>
              </div>
            </article>
          ))}
        </section>

        {/* Footer */}
        <footer className="m-sponsors-footer">
          <Link to="/" className="m-footer-home-btn label-caps">
            <span>← RETURN TO HOME</span>
          </Link>
          <div className="m-footer-divider" />
          <span className="m-footer-copy label-caps">
            © Genesis Tech Fest — Indus Valley World School
          </span>
        </footer>

      </main>
    </div>
  );
};

export default MobileSponsorsPage;
