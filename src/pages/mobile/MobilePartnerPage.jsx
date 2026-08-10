import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import MobileBackground from '../../components/mobile/MobileBackground';
import MobileHamburger from '../../components/mobile/MobileHamburger';
import BrochureModal from '../../components/BrochureModal';
import WhatsAppModal from '../../components/WhatsAppModal';
import SEO from '../../components/SEO';
import { getOrganizationSchema } from '../../lib/seoData';
import './MobilePartnerPage.css';

const MobilePartnerPage = () => {
  const [activeTab, setActiveTab] = useState('sponsorship'); // 'sponsorship' | 'track' | 'stall'
  const [formStatus, setFormStatus] = useState('idle');
  const [showBrochureModal, setShowBrochureModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const formRef = useRef(null);

  // Reset form to idle after success after 3.5 seconds
  useEffect(() => {
    if (formStatus === 'sent') {
      const timer = setTimeout(() => {
        setFormStatus('idle');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [formStatus]);

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setFormStatus('sending');

    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      company: formData.get('company'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      partnership_type: activeTab.toUpperCase(),
      message: formData.get('message'),
      _subject: `Genesis Tech Fest - New ${activeTab.toUpperCase()} Partnership Transmission`,
      _template: 'box'
    };

    try {
      const response = await fetch("https://formsubmit.co/ajax/thegenesiscouncil@ivws.org", {
        method: "POST",
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        setFormStatus('sent');
        e.target.reset();
      } else {
        setTimeout(() => setFormStatus('sent'), 1000);
      }
    } catch {
      setTimeout(() => setFormStatus('sent'), 1000);
    }
  };

  return (
    <div className="mp-wrapper">
      <SEO
        title="Partner With Genesis 2026 | IVWS"
        description="Partner with Genesis 2026, the inter-school tech fest by Indus Valley World School (IVWS). Explore sponsorship tiers, track co-branding, and campus stall opportunities."
        canonical="/partnerships"
        jsonLd={getOrganizationSchema()}
      />
      <MobileBackground />
      <div className="m-grid-overlay" aria-hidden="true" />
      <MobileHamburger />

      {/* HUD Corner Brackets */}
      <div className="hud-brackets">
        <div className="bracket top-left" />
        <div className="bracket top-right" />
        <div className="bracket bottom-left" />
        <div className="bracket bottom-right" />
      </div>

      <main className="mp-content">
        {/* Top Back Link */}
        <Link to="/" className="mp-back label-caps">← Return to Base</Link>

        {/* Hero Section */}
        <div className="mp-hero">
          <span className="mp-eyebrow label-caps">
            <span className="mp-dash">—</span> INAUGURAL EDITION // SEPT 26, 2026
          </span>
          <h1 className="mp-headline display-lg">
            Partner With <span className="mp-headline-accent">Genesis 2026</span>
          </h1>
          <p className="mp-subhead body-md">
            Connect your brand with top-performing high school students, educators, and school leaders across the inter-school tech fest by Indus Valley World School (IVWS).
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mp-hero-btns">
          <button className="mp-btn mp-btn-primary label-caps" onClick={scrollToForm}>
            <span>REGISTER INTEREST →</span>
          </button>
          <a
            href="/partner_genesis.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="mp-btn mp-btn-secondary label-caps"
            style={{ textDecoration: 'none' }}
          >
            <span>PREVIEW BROCHURE (PDF)</span>
          </a>
          <button className="mp-btn mp-btn-wa label-caps" onClick={() => setShowWhatsAppModal(true)}>
            <span>WHATSAPP</span>
          </button>
        </div>

        {/* Mode Gateway Selector */}
        <div className="mp-mode-selector">
          <span className="mp-selector-label label-caps">// SELECT PARTNERSHIP PROTOCOL</span>
          <div className="mp-mode-tabs">
            <button
              className={`mp-tab ${activeTab === 'sponsorship' ? 'mp-tab--active' : ''}`}
              onClick={() => setActiveTab('sponsorship')}
            >
              <span className="mp-tab-badge label-caps">01</span>
              <div className="mp-tab-text">
                <span className="mp-tab-title label-caps">SPONSORSHIP</span>
                <span className="mp-tab-sub">Financial Backing</span>
              </div>
              <div className="mp-tab-glow" />
            </button>

            <button
              className={`mp-tab ${activeTab === 'track' ? 'mp-tab--active' : ''}`}
              onClick={() => setActiveTab('track')}
            >
              <span className="mp-tab-badge label-caps">02</span>
              <div className="mp-tab-text">
                <span className="mp-tab-title label-caps">TRACK</span>
                <span className="mp-tab-sub">Event Collaboration</span>
              </div>
              <div className="mp-tab-glow" />
            </button>

            <button
              className={`mp-tab ${activeTab === 'stall' ? 'mp-tab--active' : ''}`}
              onClick={() => setActiveTab('stall')}
            >
              <span className="mp-tab-badge label-caps">03</span>
              <div className="mp-tab-text">
                <span className="mp-tab-title label-caps">STALL SETUP</span>
                <span className="mp-tab-sub">Free Campus Booth</span>
              </div>
              <div className="mp-tab-glow" />
            </button>
          </div>
        </div>

        {/* Dynamic Mode Metrics Ticker Banner */}
        <div className="mp-metric-banner animate-fade">
          {activeTab === 'sponsorship' && (
            <div className="mp-metric-item">
              <span className="mp-m-val">MAIN EVENT BANNERS</span>
              <span className="mp-m-sub label-caps">NAMED PLACEMENT, DIGITAL REELS & TALENT ACCESS</span>
            </div>
          )}
          {activeTab === 'track' && (
            <div className="mp-metric-item">
              <span className="mp-m-val">PRODUCT INTEGRATION</span>
              <span className="mp-m-sub label-caps">DIRECT USAGE IN ROUNDS & CO-BRANDED MERCH</span>
            </div>
          )}
          {activeTab === 'stall' && (
            <div className="mp-metric-item">
              <span className="mp-m-val">PRIME CAMPUS LOCATION</span>
              <span className="mp-m-sub label-caps">HIGH-FOOTFALL LAWN BOOTH AT ₹0 FEE</span>
            </div>
          )}
        </div>

        {/* Mode Timeline Pathway Container */}
        <div className="mp-mode-view">
          
          {/* SPONSORSHIP TIMELINE */}
          {activeTab === 'sponsorship' && (
            <div className="mp-details-box animate-fade">
              <div className="mp-box-header">
                <h2 className="mp-box-title headline-sm">Financial Sponsorship Protocol</h2>
                <span className="mp-tag label-caps">Flexible Contribution</span>
              </div>
              <p className="mp-box-desc body-md">
                Provide financial support for the festival. You decide your contribution level—we focus on building long-term, high-ROI relationships.
              </p>

              <div className="mp-timeline">
                <div className="mp-spine-line">
                  <div className="mp-laser-dot" />
                </div>

                <div className="mp-timeline-step">
                  <div className="mp-diamond-wrapper">
                    <div className="mp-diamond-node">
                      <span className="mp-node-num label-caps">01</span>
                    </div>
                  </div>
                  <div className="mp-card">
                    <div className="mp-hud-corner top-right">+</div>
                    <span className="mp-phase label-caps">BRANDING</span>
                    <h3 className="mp-card-title">Named Placement Across Main Event Banners</h3>
                    <p className="mp-card-desc">Your brand featured prominently with named placement across main event banners, flags, and backdrops.</p>
                  </div>
                </div>

                <div className="mp-timeline-step">
                  <div className="mp-diamond-wrapper">
                    <div className="mp-diamond-node">
                      <span className="mp-node-num label-caps">02</span>
                    </div>
                  </div>
                  <div className="mp-card">
                    <div className="mp-hud-corner top-right">+</div>
                    <span className="mp-phase label-caps">DIGITAL REACH</span>
                    <h3 className="mp-card-title">Dedicated Social Media Spotlights / Reels</h3>
                    <p className="mp-card-desc">Dedicated social media spotlights and reels produced by our PR team.</p>
                  </div>
                </div>

                <div className="mp-timeline-step">
                  <div className="mp-diamond-wrapper">
                    <div className="mp-diamond-node">
                      <span className="mp-node-num label-caps">03</span>
                    </div>
                  </div>
                  <div className="mp-card">
                    <div className="mp-hud-corner top-right">+</div>
                    <span className="mp-phase label-caps">TALENT ACCESS</span>
                    <h3 className="mp-card-title">High School Developer & Security Talent</h3>
                    <p className="mp-card-desc">Connect directly with top-performing high school developers and cybersecurity talent.</p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TRACK PARTNERSHIP TIMELINE */}
          {activeTab === 'track' && (
            <div className="mp-details-box animate-fade">
              <div className="mp-box-header">
                <h2 className="mp-box-title headline-sm">Track Partnership Protocol</h2>
                <span className="mp-tag label-caps">Event Co-Branding</span>
              </div>
              <p className="mp-box-desc body-md">
                Deep collaboration for specific tracks of the fest or supporting festival logistics.
              </p>

              <div className="mp-timeline">
                <div className="mp-spine-line">
                  <div className="mp-laser-dot" />
                </div>

                <div className="mp-timeline-step">
                  <div className="mp-diamond-wrapper">
                    <div className="mp-diamond-node">
                      <span className="mp-node-num label-caps">01</span>
                    </div>
                  </div>
                  <div className="mp-card">
                    <div className="mp-hud-corner top-right">+</div>
                    <span className="mp-phase label-caps">PRODUCT INTEGRATION</span>
                    <h3 className="mp-card-title">Direct Product Usage During Rounds</h3>
                    <p className="mp-card-desc">Direct usage of your product during competition rounds.</p>
                  </div>
                </div>

                <div className="mp-timeline-step">
                  <div className="mp-diamond-wrapper">
                    <div className="mp-diamond-node">
                      <span className="mp-node-num label-caps">02</span>
                    </div>
                  </div>
                  <div className="mp-card">
                    <div className="mp-hud-corner top-right">+</div>
                    <span className="mp-phase label-caps">CO-BRANDED MERCH</span>
                    <h3 className="mp-card-title">T-Shirts, Stickers & Swag Kits</h3>
                    <p className="mp-card-desc">Your logo featured alongside Genesis branding on official t-shirts, stickers, and swag kits distributed to all teams.</p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STALL SETUP TIMELINE */}
          {activeTab === 'stall' && (
            <div className="mp-details-box animate-fade">
              <div className="mp-box-header">
                <h2 className="mp-box-title headline-sm">Stall Setup Protocol</h2>
                <span className="mp-tag label-caps mp-tag--highlight">100% FREE SETUP</span>
              </div>
              <p className="mp-box-desc body-md">
                Features a dedicated physical setup on campus throughout the event. Zero booth fee.
              </p>

              <div className="mp-timeline">
                <div className="mp-spine-line">
                  <div className="mp-laser-dot" />
                </div>

                <div className="mp-timeline-step">
                  <div className="mp-diamond-wrapper">
                    <div className="mp-diamond-node">
                      <span className="mp-node-num label-caps">01</span>
                    </div>
                  </div>
                  <div className="mp-card">
                    <div className="mp-hud-corner top-right">+</div>
                    <span className="mp-phase label-caps">PRIME CAMPUS LOCATION</span>
                    <h3 className="mp-card-title">High-Footfall Lawn Booth Space</h3>
                    <p className="mp-card-desc">Dedicated high-footfall booth/stall space throughout the event. Setup tables, chairs, and power ports included at ₹0 booth fee.</p>
                  </div>
                </div>

                <div className="mp-timeline-step">
                  <div className="mp-diamond-wrapper">
                    <div className="mp-diamond-node">
                      <span className="mp-node-num label-caps">02</span>
                    </div>
                  </div>
                  <div className="mp-card">
                    <div className="mp-hud-corner top-right">+</div>
                    <span className="mp-phase label-caps">DIRECT LEAD GENERATION</span>
                    <h3 className="mp-card-title">Interactive Mini-Games & Sign-Ups</h3>
                    <p className="mp-card-desc">Host interactive mini-games, distribute promotional flyers, or collect user sign-ups directly from participants and visitors.</p>
                  </div>
                </div>

                <div className="mp-timeline-step">
                  <div className="mp-diamond-wrapper">
                    <div className="mp-diamond-node">
                      <span className="mp-node-num label-caps">03</span>
                    </div>
                  </div>
                  <div className="mp-card">
                    <div className="mp-hud-corner top-right">+</div>
                    <span className="mp-phase label-caps">MERCHANDISE DISTRIBUTION</span>
                    <h3 className="mp-card-title">Branded Goodies & Live Demos</h3>
                    <p className="mp-card-desc">Opportunity to hand out branded goodies, or showcase hardware/tech live at your booth.</p>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* Form Section */}
        <div className="mp-form-wrap" ref={formRef}>
          <div className="mp-form-header">
            <span className="mp-form-tag label-caps">// REGISTRATION TRANSMISSION</span>
            <div className="mp-form-line" />
          </div>

          {formStatus === 'sent' ? (
            <div className="mp-sent">
              <div className="mp-sent-icon label-caps">TRANSMISSION RECEIVED</div>
              <p className="mp-sent-title headline-sm">Thank You For Reaching Out</p>
              <p className="mp-sent-sub label-caps">We will respond within 24 hours.</p>
            </div>
          ) : (
            <form className="mp-form" onSubmit={handleSend}>
              <div className="mp-field">
                <label className="mp-field-label label-caps" htmlFor="mp-name">Contact Person *</label>
                <input id="mp-name" name="name" className="mp-input" type="text" placeholder="Full name" required />
              </div>
              <div className="mp-field">
                <label className="mp-field-label label-caps" htmlFor="mp-company">Company / Organization *</label>
                <input id="mp-company" name="company" className="mp-input" type="text" placeholder="Brand or institution name" required />
              </div>
              <div className="mp-field">
                <label className="mp-field-label label-caps" htmlFor="mp-phone">WhatsApp / Phone *</label>
                <input id="mp-phone" name="phone" className="mp-input" type="tel" placeholder="+91 98300 00000" required />
              </div>
              <div className="mp-field">
                <label className="mp-field-label label-caps" htmlFor="mp-email">Email Address *</label>
                <input id="mp-email" name="email" className="mp-input" type="email" placeholder="name@company.com" required />
              </div>
              <div className="mp-field">
                <label className="mp-field-label label-caps" htmlFor="mp-msg">Details / Notes *</label>
                <textarea
                  id="mp-msg"
                  name="message"
                  className="mp-input mp-textarea"
                  rows="3"
                  placeholder="Tell us a bit about how you'd like to partner..."
                  required
                />
              </div>
              <button
                type="submit"
                className={`mp-submit label-caps ${formStatus === 'sending' ? 'mp-submit--sending' : ''}`}
                disabled={formStatus === 'sending'}
              >
                {formStatus === 'sending' ? 'TRANSMITTING...' : (
                  <>
                    <span>SUBMIT APPLICATION</span>
                    <span className="mp-submit-arrow">→</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Sticky Mobile Action Bar */}
        <div className="mp-sticky-bar">
          <button className="mp-sticky-btn primary label-caps" onClick={scrollToForm}>
            <span>REGISTER INTEREST</span>
          </button>
          <button className="mp-sticky-btn wa label-caps" onClick={() => setShowWhatsAppModal(true)}>
            <span>WHATSAPP</span>
          </button>
        </div>
      </main>

      {/* Brochure Modal */}
      <BrochureModal
        isOpen={showBrochureModal}
        onClose={() => setShowBrochureModal(false)}
        onRegisterClick={scrollToForm}
      />

      {/* WhatsApp Modal */}
      <WhatsAppModal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        activeTab={activeTab}
      />
    </div>
  );
};

export default MobilePartnerPage;
