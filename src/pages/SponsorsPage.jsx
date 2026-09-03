import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import NeuralBackground from '../components/NeuralBackground';
import SEO from '../components/SEO';
import { SPONSORS } from '../lib/sponsorsData';
import './SponsorsPage.css';

const SponsorsPage = () => {
  const wrapperRef = useRef(null);

  const handleMouseMove = (e) => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      wrapperRef.current.style.setProperty('--mouse-x', `${x}px`);
      wrapperRef.current.style.setProperty('--mouse-y', `${y}px`);
    }
  };

  return (
    <div
      className="sponsors-page-wrapper"
      ref={wrapperRef}
      onMouseMove={handleMouseMove}
    >
      <SEO
        title="Official Sponsors & Partners — Genesis 2026 | IVWS Tech Fest"
        description="Meet the official sponsors and partners supporting Genesis 2026 Tech Fest: StudyIn, n8n, .xyz, 91.9 Friends FM, The Telegraph: Young Metro, and React Kolkata."
        canonical="/sponsors"
      />

      {/* Dynamic Backgrounds */}
      <div className="sponsors-page-bg">
        <NeuralBackground />
      </div>
      <div className="noise-overlay" />
      <div className="grid-overlay" />
      <div className="mouse-blur-overlay" />

      {/* Giant Background Watermark */}
      <div className="bg-watermark label-caps" aria-hidden="true">
        SPONSORS // 2026
      </div>

      {/* Sci-Fi HUD Brackets */}
      <div className="hud-brackets">
        <div className="bracket top-left" />
        <div className="bracket top-right" />
        <div className="bracket bottom-left" />
        <div className="bracket bottom-right" />
      </div>

      {/* Top Header Navigation */}
      <header className="sponsors-tech-header">
        <Link to="/" className="tech-header-link header-left" aria-label="Go to Genesis home page">
          GENESIS TECH FEST // SPONSORS
        </Link>
        <Link to="/" className="tech-header-link header-right" aria-label="Return to Home">
          RETURN TO HOME
        </Link>
      </header>

      {/* Main Page Container */}
      <main className="sponsors-page-container">
        
        {/* Cyber Hero Banner */}
        <section className="sponsors-hero-section">
          <div className="sponsors-eyebrow label-caps">
            <span className="eyebrow-dash">—</span> OFFICIAL PARTNERS &amp; SPONSORS // 2026 DIRECTORY
          </div>
          <h1 className="sponsors-main-title display-lg">
            Empowering The <span className="title-accent">Next Generation</span> Of Builders
          </h1>
          <p className="sponsors-main-subtitle body-lg">
            Genesis 2026 is proudly backed by leading global platforms, media pioneers, and developer communities dedicated to driving high-school technical innovation.
          </p>
        </section>

        {/* 6-Sponsor Cyber Grid */}
        <section className="sponsors-grid-section" aria-label="Sponsors Directory Grid">
          <div className="sponsors-cards-grid">
            {SPONSORS.map((sponsor, index) => (
              <article key={sponsor.id} className="sponsor-profile-card">
                {/* HUD Corner Crosshairs */}
                <div className="card-hud-corner top-left-mark" aria-hidden="true">+</div>
                <div className="card-hud-corner top-right-mark" aria-hidden="true">+</div>
                <div className="card-hud-corner bottom-left-mark" aria-hidden="true">+</div>
                <div className="card-hud-corner bottom-right-mark" aria-hidden="true">+</div>

                {/* Card Top Metadata Header */}
                <div className="card-top-bar">
                  <span className="sponsor-index-tag label-caps">
                    // SPONSOR.0{index + 1}
                  </span>
                </div>

                {/* Recessed Logo Display Chamber */}
                <div className="sponsor-logo-chamber">
                  <img
                    src={sponsor.logo}
                    alt={`${sponsor.name} logo`}
                    className={`sponsor-chamber-img sponsor-${sponsor.id}`}
                    loading="lazy"
                  />
                </div>

                {/* Sponsor Information */}
                <div className="sponsor-card-body">
                  <h2 className="sponsor-entity-name">
                    {sponsor.name}
                  </h2>
                  <div className="card-cyber-divider" aria-hidden="true" />
                  <p className="sponsor-entity-brief">
                    {sponsor.description}
                  </p>
                </div>

                {/* Outbound Link CTA */}
                <div className="sponsor-card-actions">
                  <a
                    href={sponsor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sponsor-visit-link label-caps"
                    aria-label={`Visit ${sponsor.name} official website (opens in new tab)`}
                  >
                    <span>VISIT OFFICIAL WEBSITE</span>
                    <span className="visit-arrow-icon" aria-hidden="true">↗</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="sponsors-page-footer">
          <span className="footer-coord label-caps">IVWS // 22.4845545°N / 88.3960671°E</span>
          <span className="footer-copy label-caps">
            © 2026 Genesis Tech Fest. All sponsor trademarks belong to their respective owners.
          </span>
        </footer>

      </main>
    </div>
  );
};

export default SponsorsPage;
