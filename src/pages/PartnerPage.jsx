import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './PartnerPage.css';
import NeuralBackground from '../components/NeuralBackground';
import BrochureModal from '../components/BrochureModal';
import WhatsAppModal from '../components/WhatsAppModal';
import SEO from '../components/SEO';
import { getOrganizationSchema } from '../lib/seoData';

const SIGNAL_MSGS = [
  'PARTNERSHIP.OPEN // 2026',
  'STALLS: 100% FREE SETUP',
  'PREMIER SCHOOLS: 25+',
  'SEPTEMBER 26 // IVWS'
];

const PartnerPage = () => {
  const [activeTab, setActiveTab] = useState('sponsorship'); // 'sponsorship' | 'track' | 'stall'
  const [signalIdx, setSignalIdx] = useState(0);
  const [formStatus, setFormStatus] = useState('idle'); // idle | sending | sent
  const [showBrochureModal, setShowBrochureModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const wrapperRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setSignalIdx((i) => (i + 1) % SIGNAL_MSGS.length), 2400);
    return () => clearInterval(t);
  }, []);

  // Reset form to idle after success after 3.5 seconds
  useEffect(() => {
    if (formStatus === 'sent') {
      const timer = setTimeout(() => {
        setFormStatus('idle');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [formStatus]);

  const handleMouseMove = (e) => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      wrapperRef.current.style.setProperty('--mouse-x', `${x}px`);
      wrapperRef.current.style.setProperty('--mouse-y', `${y}px`);
    }
  };

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const copyEmail = () => {
    navigator.clipboard.writeText('thegenesiscouncil@ivws.org');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
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
      _subject: `Genesis Tech Fest - New ${activeTab.toUpperCase()} Partnership Inquiry`,
      _template: 'box'
    };

    try {
      const response = await fetch("https://formsubmit.co/ajax/thegenesiscouncil@ivws.org", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        setFormStatus('sent');
        e.target.reset();
      } else {
        console.error("Formsubmit error:", await response.text());
        setTimeout(() => setFormStatus('sent'), 1000);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      setTimeout(() => setFormStatus('sent'), 1000);
    }
  };

  return (
    <div
      className="partner-wrapper"
      ref={wrapperRef}
      onMouseMove={handleMouseMove}
    >
      <SEO
        title="Partner With Genesis 2026 | IVWS"
        description="Partner with Genesis 2026, the inter-school tech fest by Indus Valley World School (IVWS). Explore sponsorship tiers, track co-branding, and campus stall opportunities."
        canonical="/partnerships"
        jsonLd={getOrganizationSchema()}
      />
      {/* Background & Overlays */}
      <div className="partner-background">
        <NeuralBackground />
      </div>
      <div className="noise-overlay" />
      <div className="grid-overlay" />
      <div className="mouse-blur-overlay" />

      {/* Giant Background Watermark Text */}
      <div className="bg-watermark label-caps" aria-hidden="true">
        GENESIS // 2026
      </div>

      {/* HUD Brackets */}
      <div className="hud-brackets">
        <div className="bracket top-left" />
        <div className="bracket top-right" />
        <div className="bracket bottom-left" />
        <div className="bracket bottom-right" />
      </div>

      {/* Header */}
      <header className="tech-header">
        <Link to="/" className="home-header-link header-left" aria-label="Go to Genesis home page">
          GENESIS TECH FEST // PARTNERSHIPS
        </Link>
        <Link to="/" className="home-header-link header-right" aria-label="Return to Home">
          RETURN TO HOME
        </Link>
      </header>

      {/* Data Accents */}
      <div className="data-accent left-accent">{SIGNAL_MSGS[signalIdx]}</div>
      <div className="data-accent right-accent">
        STATUS: INAUGURAL EDITION<br />
        EARLY BIRD OPEN
      </div>

      {/* Main Container */}
      <main className="partner-container">
        
        {/* Cyber Hero Section */}
        <section className="partner-hero">
          <div className="partner-eyebrow label-caps">
            <span className="eyebrow-dash">—</span> INAUGURAL EDITION // SEPTEMBER 26, 2026
          </div>
          <h1 className="partner-headline display-lg">
            Partner With <span className="headline-accent">Genesis 2026</span>
          </h1>
          <p className="partner-subhead body-lg">
            Connect your brand with top-performing high school developers, builders, and school leaders across the inter-school tech fest by Indus Valley World School (IVWS).
          </p>

          <div className="partner-hero-actions">
            <button className="partner-cta-btn primary-btn label-caps" onClick={scrollToForm}>
              <span>REGISTER YOUR INTEREST →</span>
            </button>
            <a
              href="/partner_genesis.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="partner-cta-btn secondary-btn label-caps"
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <span>VIEW BROCHURE (PDF)</span>
            </a>
            <button className="partner-cta-btn wa-btn label-caps" onClick={() => setShowWhatsAppModal(true)}>
              <span>WHATSAPP INQUIRY</span>
            </button>
          </div>

          {/* Quick Email Copy Chip */}
          <div className="quick-email-bar">
            <span className="quick-email-label label-caps">DIRECT TRANSMISSION EMAIL:</span>
            <button className="quick-email-btn label-caps" onClick={copyEmail} title="Click to copy email">
              <span>thegenesiscouncil@ivws.org</span>
              <span className="copy-badge">{copiedEmail ? 'COPIED!' : 'COPY'}</span>
            </button>
          </div>
        </section>

        {/* 3-Mode Cyber Command Gateway Selector */}
        <section className="gateway-selector-section">
          <div className="gateway-tabs-header">
            <span className="gateway-label label-caps">// SELECT PARTNERSHIP PROTOCOL MODE</span>
          </div>
          <div className="gateway-tabs">
            <button
              className={`gateway-tab ${activeTab === 'sponsorship' ? 'gateway-tab--active' : ''}`}
              onClick={() => setActiveTab('sponsorship')}
            >
              <span className="tab-badge label-caps">01</span>
              <div className="tab-text">
                <span className="tab-title label-caps">SPONSORSHIP</span>
                <span className="tab-desc">Financial Backing Protocol</span>
              </div>
              <div className="tab-glow-indicator" />
            </button>

            <button
              className={`gateway-tab ${activeTab === 'track' ? 'gateway-tab--active' : ''}`}
              onClick={() => setActiveTab('track')}
            >
              <span className="tab-badge label-caps">02</span>
              <div className="tab-text">
                <span className="tab-title label-caps">TRACK PARTNERSHIP</span>
                <span className="tab-desc">Event Track Collaboration</span>
              </div>
              <div className="tab-glow-indicator" />
            </button>

            <button
              className={`gateway-tab ${activeTab === 'stall' ? 'gateway-tab--active' : ''}`}
              onClick={() => setActiveTab('stall')}
            >
              <span className="tab-badge label-caps">03</span>
              <div className="tab-text">
                <span className="tab-title label-caps">STALL SETUP</span>
                <span className="tab-desc">100% Free Campus Booth</span>
              </div>
              <div className="tab-glow-indicator" />
            </button>
          </div>
        </section>

        {/* Live Terminal Summary HUD Ticker */}
        <div className="mode-metrics-ticker">
          {activeTab === 'sponsorship' && (
            <div className="metrics-row animate-fade">
              <div className="metric-chip">
                <span className="m-val">MAIN EVENT BANNERS</span>
                <span className="m-lbl label-caps">NAMED PLACEMENT ACROSS FESTIVAL</span>
              </div>
              <div className="metric-chip">
                <span className="m-val">DIGITAL SPOTLIGHTS</span>
                <span className="m-lbl label-caps">DEDICATED PR SOCIAL MEDIA REELS</span>
              </div>
              <div className="metric-chip">
                <span className="m-val">TALENT ACCESS</span>
                <span className="m-lbl label-caps">TOP HIGH SCHOOL DEVELOPERS</span>
              </div>
            </div>
          )}
          {activeTab === 'track' && (
            <div className="metrics-row animate-fade">
              <div className="metric-chip">
                <span className="m-val">PRODUCT INTEGRATION</span>
                <span className="m-lbl label-caps">DIRECT USAGE IN COMPETITIONS</span>
              </div>
              <div className="metric-chip">
                <span className="m-val">CO-BRANDED MERCH</span>
                <span className="m-lbl label-caps">T-SHIRTS, STICKERS & SWAG KITS</span>
              </div>
              <div className="metric-chip">
                <span className="m-val">TRACK COLLABORATION</span>
                <span className="m-lbl label-caps">OFFICIAL EVENT CO-NAMING</span>
              </div>
            </div>
          )}
          {activeTab === 'stall' && (
            <div className="metrics-row animate-fade">
              <div className="metric-chip">
                <span className="m-val">PRIME CAMPUS LOCATION</span>
                <span className="m-lbl label-caps">HIGH-FOOTFALL BOOTH SPACE</span>
              </div>
              <div className="metric-chip">
                <span className="m-val">DIRECT LEAD GENERATION</span>
                <span className="m-lbl label-caps">MINI-GAMES, FLYERS & SIGN-UPS</span>
              </div>
              <div className="metric-chip">
                <span className="m-val">MERCH & DEMOS</span>
                <span className="m-lbl label-caps">SHOWCASE HARDWARE & GOODIES</span>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Mode Pathway Container */}
        <section className="mode-details-section">
          
          {/* 1. SPONSORSHIP MODE ZIGZAG PATHWAY */}
          {activeTab === 'sponsorship' && (
            <div className="mode-view animate-fade">
              <div className="view-header">
                <h2 className="view-title headline-md">Financial Sponsorship Protocol</h2>
                <span className="view-tag label-caps">Flexible Contribution</span>
              </div>
              <p className="view-intro body-md">
                Provide financial support for the festival. You decide your contribution level—we focus on building long-term, high-ROI collaborative relationships.
              </p>

              {/* ZIGZAG CENTER SPINE TIMELINE */}
              <div className="zigzag-timeline">
                <div className="zigzag-spine-line">
                  <div className="laser-pulse-dot" />
                </div>
                
                {/* Step 01 - LEFT */}
                <div className="zigzag-step step-left">
                  <div className="zigzag-card">
                    <div className="card-spotlight" />
                    <div className="card-hud-corner top-left-mark">+</div>
                    <div className="card-hud-corner top-right-mark">+</div>
                    <span className="zigzag-phase label-caps">BRANDING</span>
                    <h3 className="zigzag-title">Named Placement Across Main Event Banners</h3>
                    <p className="zigzag-desc">
                      Your brand featured prominently with named placement across main event banners, flags, entrance arches, and campus backdrops.
                    </p>
                  </div>
                  <div className="zigzag-diamond-wrapper">
                    <div className="diamond-hud-ring" />
                    <div className="zigzag-diamond-node">
                      <span className="node-num label-caps">01</span>
                    </div>
                  </div>
                  <div className="zigzag-empty-space" />
                </div>

                {/* Step 02 - RIGHT */}
                <div className="zigzag-step step-right">
                  <div className="zigzag-empty-space" />
                  <div className="zigzag-diamond-wrapper">
                    <div className="diamond-hud-ring" />
                    <div className="zigzag-diamond-node">
                      <span className="node-num label-caps">02</span>
                    </div>
                  </div>
                  <div className="zigzag-card">
                    <div className="card-spotlight" />
                    <div className="card-hud-corner top-left-mark">+</div>
                    <div className="card-hud-corner top-right-mark">+</div>
                    <span className="zigzag-phase label-caps">DIGITAL REACH</span>
                    <h3 className="zigzag-title">Dedicated Social Media Spotlights / Reels</h3>
                    <p className="zigzag-desc">
                      Dedicated social media spotlights and reels produced by our PR team across official festival channels.
                    </p>
                  </div>
                </div>

                {/* Step 03 - LEFT */}
                <div className="zigzag-step step-left">
                  <div className="zigzag-card">
                    <div className="card-spotlight" />
                    <div className="card-hud-corner top-left-mark">+</div>
                    <div className="card-hud-corner top-right-mark">+</div>
                    <span className="zigzag-phase label-caps">TALENT ACCESS</span>
                    <h3 className="zigzag-title">High School Developer & Cybersecurity Talent</h3>
                    <p className="zigzag-desc">
                      Connect directly with top-performing high school developers, builders, and cybersecurity talent for future recruitment and mentorship.
                    </p>
                  </div>
                  <div className="zigzag-diamond-wrapper">
                    <div className="diamond-hud-ring" />
                    <div className="zigzag-diamond-node">
                      <span className="node-num label-caps">03</span>
                    </div>
                  </div>
                  <div className="zigzag-empty-space" />
                </div>

              </div>
            </div>
          )}

          {/* 2. TRACK PARTNERSHIP MODE ZIGZAG PATHWAY */}
          {activeTab === 'track' && (
            <div className="mode-view animate-fade">
              <div className="view-header">
                <h2 className="view-title headline-md">Track Partnership Protocol</h2>
                <span className="view-tag label-caps">Event Track Co-Branding</span>
              </div>
              <p className="view-intro body-md">
                Deep collaboration for specific tracks of the festival or festival logistics.
              </p>

              {/* ZIGZAG CENTER SPINE TIMELINE */}
              <div className="zigzag-timeline">
                <div className="zigzag-spine-line">
                  <div className="laser-pulse-dot" />
                </div>
                
                {/* Step 01 - LEFT */}
                <div className="zigzag-step step-left">
                  <div className="zigzag-card">
                    <div className="card-spotlight" />
                    <div className="card-hud-corner top-left-mark">+</div>
                    <div className="card-hud-corner top-right-mark">+</div>
                    <span className="zigzag-phase label-caps">PRODUCT INTEGRATION</span>
                    <h3 className="zigzag-title">Direct Product Usage During Competition Rounds</h3>
                    <p className="zigzag-desc">
                      Direct usage and integration of your product or platform during official competition rounds and participant challenges.
                    </p>
                  </div>
                  <div className="zigzag-diamond-wrapper">
                    <div className="diamond-hud-ring" />
                    <div className="zigzag-diamond-node">
                      <span className="node-num label-caps">01</span>
                    </div>
                  </div>
                  <div className="zigzag-empty-space" />
                </div>

                {/* Step 02 - RIGHT */}
                <div className="zigzag-step step-right">
                  <div className="zigzag-empty-space" />
                  <div className="zigzag-diamond-wrapper">
                    <div className="diamond-hud-ring" />
                    <div className="zigzag-diamond-node">
                      <span className="node-num label-caps">02</span>
                    </div>
                  </div>
                  <div className="zigzag-card">
                    <div className="card-spotlight" />
                    <div className="card-hud-corner top-left-mark">+</div>
                    <div className="card-hud-corner top-right-mark">+</div>
                    <span className="zigzag-phase label-caps">CO-BRANDED MERCH</span>
                    <h3 className="zigzag-title">T-Shirts, Stickers & Swag Kits</h3>
                    <p className="zigzag-desc">
                      Your logo featured alongside Genesis branding on official event t-shirts, stickers, and swag kits distributed to all teams.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 3. STALL SETUP MODE ZIGZAG PATHWAY */}
          {activeTab === 'stall' && (
            <div className="mode-view animate-fade">
              <div className="view-header">
                <h2 className="view-title headline-md">Stall Setup Chronological Pathway</h2>
                <span className="view-tag label-caps highlight-tag">100% FREE STALL ALLOCATION</span>
              </div>
              <p className="view-intro body-md">
                Features a dedicated physical setup on campus throughout the event. Absolutely zero booth fee required.
              </p>

              {/* ZIGZAG CENTER SPINE TIMELINE */}
              <div className="zigzag-timeline">
                <div className="zigzag-spine-line">
                  <div className="laser-pulse-dot" />
                </div>
                
                {/* Step 01 - LEFT */}
                <div className="zigzag-step step-left">
                  <div className="zigzag-card">
                    <div className="card-spotlight" />
                    <div className="card-hud-corner top-left-mark">+</div>
                    <div className="card-hud-corner top-right-mark">+</div>
                    <span className="zigzag-phase label-caps">PRIME CAMPUS LOCATION</span>
                    <h3 className="zigzag-title">High-Footfall Lawn Booth Space</h3>
                    <p className="zigzag-desc">
                      Dedicated high-footfall booth/stall space throughout the event. Setup tables, chairs, and 5A/15A power sockets provided out of the box at ₹0 booth fee.
                    </p>
                  </div>
                  <div className="zigzag-diamond-wrapper">
                    <div className="diamond-hud-ring" />
                    <div className="zigzag-diamond-node">
                      <span className="node-num label-caps">01</span>
                    </div>
                  </div>
                  <div className="zigzag-empty-space" />
                </div>

                {/* Step 02 - RIGHT */}
                <div className="zigzag-step step-right">
                  <div className="zigzag-empty-space" />
                  <div className="zigzag-diamond-wrapper">
                    <div className="diamond-hud-ring" />
                    <div className="zigzag-diamond-node">
                      <span className="node-num label-caps">02</span>
                    </div>
                  </div>
                  <div className="zigzag-card">
                    <div className="card-spotlight" />
                    <div className="card-hud-corner top-left-mark">+</div>
                    <div className="card-hud-corner top-right-mark">+</div>
                    <span className="zigzag-phase label-caps">DIRECT LEAD GENERATION</span>
                    <h3 className="zigzag-title">Interactive Mini-Games & Sign-Ups</h3>
                    <p className="zigzag-desc">
                      Host interactive mini-games, distribute promotional flyers, or collect user sign-ups directly from participants and visitors.
                    </p>
                  </div>
                </div>

                {/* Step 03 - LEFT */}
                <div className="zigzag-step step-left">
                  <div className="zigzag-card">
                    <div className="card-spotlight" />
                    <div className="card-hud-corner top-left-mark">+</div>
                    <div className="card-hud-corner top-right-mark">+</div>
                    <span className="zigzag-phase label-caps">MERCHANDISE DISTRIBUTION</span>
                    <h3 className="zigzag-title">Branded Goodies & Live Tech Showcase</h3>
                    <p className="zigzag-desc">
                      Opportunity to hand out branded goodies, sell merchandise/food, or showcase hardware/tech live at your booth.
                    </p>
                  </div>
                  <div className="zigzag-diamond-wrapper">
                    <div className="diamond-hud-ring" />
                    <div className="zigzag-diamond-node">
                      <span className="node-num label-caps">03</span>
                    </div>
                  </div>
                  <div className="zigzag-empty-space" />
                </div>

              </div>
            </div>
          )}
        </section>

        {/* Contact Form Section */}
        <section className="partner-form-section" ref={formRef}>
          <div className="form-box">
            <div className="form-header-row">
              <span className="form-tag label-caps">// REGISTRATION TRANSMISSION INTERFACE</span>
              <div className="form-header-line" />
            </div>

            <h2 className="form-heading headline-sm">
              {activeTab === 'sponsorship' && 'Register for Financial Sponsorship'}
              {activeTab === 'track' && 'Register for Track Partnership'}
              {activeTab === 'stall' && 'Apply for Free Stall Setup'}
            </h2>
            <p className="form-subtext body-md">
              Zero commitment required. Our team will get back to you within 24 hours to confirm details.
            </p>

            {formStatus === 'sent' ? (
              <div className="form-sent-box">
                <div className="sent-check label-caps">TRANSMISSION RECEIVED</div>
                <p className="sent-msg headline-sm">Thank You For Reaching Out</p>
                <p className="sent-sub label-caps">We will respond to your inquiry within 24 hours.</p>
              </div>
            ) : (
              <form className="partner-form" onSubmit={handleSend}>
                <div className="form-row-2">
                  <div className="form-field">
                    <label className="field-label label-caps" htmlFor="p-name">Contact Person *</label>
                    <input id="p-name" name="name" className="field-input" type="text" placeholder="Full name" required />
                  </div>
                  <div className="form-field">
                    <label className="field-label label-caps" htmlFor="p-company">Company / Organization *</label>
                    <input id="p-company" name="company" className="field-input" type="text" placeholder="Brand or institution name" required />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-field">
                    <label className="field-label label-caps" htmlFor="p-phone">WhatsApp / Phone *</label>
                    <input id="p-phone" name="phone" className="field-input" type="tel" placeholder="+91 98300 00000" required />
                  </div>
                  <div className="form-field">
                    <label className="field-label label-caps" htmlFor="p-email">Email Address *</label>
                    <input id="p-email" name="email" className="field-input" type="email" placeholder="name@company.com" required />
                  </div>
                </div>

                <div className="form-field">
                  <label className="field-label label-caps" htmlFor="p-msg">Partnership / Exhibit Details *</label>
                  <textarea
                    id="p-msg"
                    name="message"
                    className="field-input field-textarea"
                    rows="3"
                    placeholder={
                      activeTab === 'stall'
                        ? "Briefly describe what you plan to showcase or sell at your stall..."
                        : "Tell us a bit about how you'd like to partner with Genesis 2026..."
                    }
                    required
                  />
                </div>

                <button
                  type="submit"
                  className={`submit-btn label-caps ${formStatus === 'sending' ? 'submit-btn--sending' : ''}`}
                  disabled={formStatus === 'sending'}
                >
                  {formStatus === 'sending' ? (
                    <span>TRANSMITTING...</span>
                  ) : (
                    <>
                      <span>TRANSMIT APPLICATION</span>
                      <span className="submit-arrow">→</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </section>

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

export default PartnerPage;
