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
            <h3 className="section-heading label-caps">01. STALL SETUP (Campus Presence // Open for '26)</h3>
            <p className="section-desc">
              <strong>Status:</strong> Applications actively accepted.<br />
              <strong>Logistics:</strong> Saturday, 26th September, 2026 at Indus Valley World School (approx 7:00 AM – 4:30 PM).<br />
              <strong>Audience:</strong> 13–18 years of age (Grades 9–12), 250+ minimum footfall.<br />
              <strong>Provisions & Fee:</strong> Electricity and tables provided. ₹0 setup fee and no commissions.
            </p>
          </div>

          <div className="brochure-section">
            <h3 className="section-heading label-caps">02. TRACK PARTNERSHIP (Closed for '26)</h3>
            <p className="section-desc">
              Sponsorships and track partnerships for Genesis '26 have closed, but we would love to have you for '27.
            </p>
          </div>

          <div className="brochure-section">
            <h3 className="section-heading label-caps">03. SPONSORSHIP (Closed for '26)</h3>
            <p className="section-desc">
              Sponsorships for Genesis '26 have closed, but we would love to have you for '27.
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
