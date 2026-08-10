import React from 'react';
import './BrochureModal.css';

const BrochureModal = ({ isOpen, onClose, onRegisterClick }) => {
  if (!isOpen) return null;

  return (
    <div className="brochure-backdrop" onClick={onClose}>
      <div className="brochure-modal" onClick={(e) => e.stopPropagation()}>
        <button className="brochure-close-btn" onClick={onClose} aria-label="Close brochure modal">×</button>

        {/* Modal Header */}
        <div className="brochure-header">
          <div className="brochure-badge label-caps">GENESIS TECH FEST 2026 // OFFICIAL BROCHURE</div>
          <h2 className="brochure-title display-lg">PARTNERSHIP & EXHIBITION OVERVIEW</h2>
          <p className="brochure-subtitle">Indus Valley World School, Kolkata — September 26, 2026</p>
        </div>

        {/* Quick Highlights Grid */}
        <div className="brochure-grid">
          <div className="brochure-stat-card">
            <span className="stat-val">25+</span>
            <span className="stat-lbl label-caps">Premier Schools</span>
          </div>
          <div className="brochure-stat-card">
            <span className="stat-val">100%</span>
            <span className="stat-lbl label-caps">Free Stall Setup</span>
          </div>
        </div>

        {/* Key Modes Summary */}
        <div className="brochure-content">
          <div className="brochure-section">
            <h3 className="section-heading label-caps">01. SPONSORSHIP (Financial Support)</h3>
            <p className="section-desc">
              <strong>Branding:</strong> Named placement across main event banners, flags, and backdrops.<br />
              <strong>Digital Reach:</strong> Dedicated social media spotlights and reels produced by PR team.<br />
              <strong>Talent Access:</strong> Connect directly with top-performing high school developers and cybersecurity talent.
            </p>
          </div>

          <div className="brochure-section">
            <h3 className="section-heading label-caps">02. TRACK PARTNERSHIP (Collaboration)</h3>
            <p className="section-desc">
              <strong>Product Integration:</strong> Direct usage of your product during competition rounds.<br />
              <strong>Co-Branded Merch:</strong> Your logo featured alongside Genesis branding on official event t-shirts, stickers, and swag kits distributed to all teams.
            </p>
          </div>

          <div className="brochure-section">
            <h3 className="section-heading label-caps">03. STALL SETUP (Campus Presence)</h3>
            <p className="section-desc">
              <strong>Prime Campus Location:</strong> Dedicated high-footfall booth/stall space throughout the event at ₹0 booth fee.<br />
              <strong>Direct Lead Generation:</strong> Host interactive mini-games, distribute promotional flyers, or collect user sign-ups directly.<br />
              <strong>Merchandise Distribution:</strong> Opportunity to hand out branded goodies, or showcase hardware/tech live at your booth.
            </p>
          </div>

          <div className="brochure-contact-box">
            <span className="contact-heading label-caps">DIRECT CONTACT & INQUIRIES</span>
            <p className="contact-detail">Email: <strong>thegenesiscouncil@ivws.org</strong></p>
            <p className="contact-detail">Trishaan Saha: <strong>+91 7439868267</strong></p>
            <p className="contact-detail">Akshat R.C.: <strong>+91 6383328621</strong></p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="brochure-actions">
          <a
            href="/partner_genesis.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="brochure-btn brochure-btn-secondary"
            style={{ textDecoration: 'none', textAlign: 'center' }}
          >
            <span>DOWNLOAD OFFICIAL PDF</span>
          </a>
          <button
            className="brochure-btn brochure-btn-primary"
            onClick={() => {
              onClose();
              if (onRegisterClick) onRegisterClick();
            }}
          >
            <span>REGISTER INTEREST NOW →</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrochureModal;
