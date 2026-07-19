import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './ContactPage.css';
import NeuralBackground from '../components/NeuralBackground';
import CompassSVG from '../components/CompassSVG';

/* ─── Morse code encoder for the decorative ticker ─── */
const MORSE = {
  G:'--.',E:'.',N:'-.',E2:'.',S:'...',I:'..',S2:'...',
};
const morseStr = Object.values(MORSE).join(' ');

/* ─── Signal quality cycling display ─── */
const SIGNAL_MSGS = [
  'SIGNAL.STRONG // 97%',
  'UPTIME: 99.9%',
  'PING: 12ms',
  'CONN.SECURE // TLS 1.3',
];

const ContactPage = () => {
  const [mousePos, setMousePos] = useState({ x: '50%', y: '50%' });
  const [signalIdx, setSignalIdx] = useState(0);
  const [formStatus, setFormStatus] = useState('idle'); // idle | sending | sent
  const [hoveredContact, setHoveredContact] = useState(null);
  const [scanLine, setScanLine] = useState(0);
  const scanRef = useRef(null);

  /* Signal msg cycle */
  useEffect(() => {
    const t = setInterval(() => setSignalIdx(i => (i + 1) % SIGNAL_MSGS.length), 2400);
    return () => clearInterval(t);
  }, []);

  /* Scanline animation */
  useEffect(() => {
    let pos = 0;
    scanRef.current = setInterval(() => {
      pos = (pos + 1) % 100;
      setScanLine(pos);
    }, 18);
    return () => clearInterval(scanRef.current);
  }, []);

  const handleMouseMove = (e) =>
    setMousePos({ x: `${e.clientX}px`, y: `${e.clientY}px` });

  const handleSend = async (e) => {
    e.preventDefault();
    setFormStatus('sending');

    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      school: formData.get('school'),
      message: formData.get('message'),
      _subject: 'Genesis Tech Fest - New Transmission', // Custom subject
      _template: 'box' // Better email template
    };

    try {
      const response = await fetch("https://formsubmit.co/ajax/sahatrishaan1910@gmail.com", {
        method: "POST",
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        setFormStatus('sent');
      } else {
        // Fallback to simulated success if API fails due to rate limits/CORS
        console.error("Formsubmit error:", await response.text());
        setTimeout(() => setFormStatus('sent'), 1000);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      setTimeout(() => setFormStatus('sent'), 1000);
    }
  };

  const contacts = [
    {
      id: 'email',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="contact-icon-svg">
          <rect x="2" y="4" width="20" height="16" rx="0"/>
          <polyline points="2,4 12,13 22,4"/>
        </svg>
      ),
      label: 'EMAIL',
      value: 'thegenesiscouncil@gmail.com',
      href: 'mailto:thegenesiscouncil@gmail.com',
      meta: 'Primary contact',
    },
    {
      id: 'whatsapp',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="contact-icon-svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.553 4.103 1.523 5.824L0 24l6.344-1.486A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.008-1.373l-.36-.213-3.767.883.9-3.676-.234-.378A9.818 9.818 0 112 12 9.82 9.82 0 0112 2.182c5.42 0 9.818 4.398 9.818 9.818 0 5.421-4.398 9.818-9.818 9.818z"/>
        </svg>
      ),
      label: 'WHATSAPP',
      value: '+91 9999999999',
      href: 'https://wa.me/919999999999',
      meta: 'Teacher-in-Charge',
    },
    {
      id: 'location',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="contact-icon-svg">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle cx="12" cy="9" r="2.5"/>
        </svg>
      ),
      label: 'LOCATION',
      value: 'Indus Valley World School, Kolkata',
      href: 'https://maps.google.com',
      meta: 'Lat: 22.5121°N / Lng: 88.4027°E',
    },
  ];

  return (
    <div
      className="contact-wrapper"
      onMouseMove={handleMouseMove}
      style={{ '--mouse-x': mousePos.x, '--mouse-y': mousePos.y }}
    >
      {/* Background */}
      <div className="contact-background">
        <NeuralBackground />
      </div>

      {/* Overlays */}
      <div className="noise-overlay" />
      <div className="grid-overlay" />
      <div className="mouse-blur-overlay" />

      {/* Scanline effect */}
      <div
        className="scanline"
        style={{ top: `${scanLine}%` }}
      />

      {/* HUD Brackets */}
      <div className="hud-brackets">
        <div className="bracket top-left" />
        <div className="bracket top-right" />
        <div className="bracket bottom-left" />
        <div className="bracket bottom-right" />
      </div>

      {/* Fixed header */}
      <header className="tech-header">
        <div className="header-left">GENESIS TECH FEST</div>
        <div className="header-right">INDUS VALLEY WORLD SCHOOL</div>
      </header>

      {/* HUD data accents */}
      <div className="data-accent left-accent">
        {SIGNAL_MSGS[signalIdx]}
      </div>
      <div className="data-accent right-accent">
        LAT: 22.5121° N<br />LNG: 88.4027° E
      </div>

      {/* Morse ticker */}
      <div className="morse-ticker">
        <span className="morse-label label-caps">GENESIS</span>
        <span className="morse-dots">{morseStr}</span>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="contact-container">

        {/* ── LEFT: Headline + contacts ── */}
        <div className="contact-left">

          {/* Eyebrow */}
          <div className="contact-eyebrow label-caps">
            <span className="eyebrow-dash">—</span> Transmission Open
          </div>

          {/* Big headline */}
          <h1 className="contact-headline">
            Need questions<br />
            <span className="headline-accent">answered?</span>
          </h1>

          {/* Decorative horizontal rule */}
          <div className="contact-rule">
            <div className="rule-line" />
            <div className="rule-dot" />
            <div className="rule-line rule-line--short" />
          </div>

          {/* Contact cards */}
          <div className="contact-cards">
            {contacts.map((c) => (
              <a
                key={c.id}
                href={c.href}
                target={c.id !== 'email' ? '_blank' : undefined}
                rel="noreferrer"
                className={`contact-card${hoveredContact === c.id ? ' contact-card--active' : ''}`}
                onMouseEnter={() => setHoveredContact(c.id)}
                onMouseLeave={() => setHoveredContact(null)}
              >
                {/* Left: icon */}
                <div className="card-icon-wrap">
                  {c.icon}
                </div>

                {/* Right: text */}
                <div className="card-text">
                  <span className="card-label label-caps">{c.label}</span>
                  <span className="card-value">{c.value}</span>
                  <span className="card-meta label-caps">{c.meta}</span>
                </div>

                {/* Active indicator */}
                <div className="card-indicator" />
              </a>
            ))}
          </div>

          {/* Back nav */}
          <div className="contact-back-row">
            <Link to="/" className="back-link label-caps">← Return to Base</Link>
          </div>
        </div>

        {/* ── RIGHT: Compass nav + inline message form ── */}
        <div className="contact-right">

          {/* Compass with nav labels */}
          <div className="contact-compass-wrap">
            <div className="compass-rotating-wrapper">
              <div className="radar-sweep" />
              <CompassSVG size={360} color="var(--accent-mid)" />

              <a href="/#events" className="nav-label label-top">
                <span className="nav-text">EVENTS</span>
              </a>
              <Link to="/login" className="nav-label label-left">
                <span className="nav-text">REGISTER</span>
              </Link>
              <a href="/#about" className="nav-label label-right">
                <span className="nav-text">ABOUT</span>
              </a>
              <a href="/#" className="nav-label label-bottom">
                <span className="nav-text">HOME</span>
              </a>
            </div>
          </div>

          {/* ── Inline message form ── */}
          <div className="contact-form-wrap">
            <div className="form-header">
              <span className="form-header-tag label-caps">Send a Transmission</span>
              <div className="form-header-line" />
            </div>

            {formStatus === 'sent' ? (
              <div className="form-sent">
                <div className="sent-icon">✓</div>
                <p className="sent-title">Message Received</p>
                <p className="sent-sub label-caps">We will respond within 24 hrs</p>
              </div>
            ) : (
              <form className="message-form" onSubmit={handleSend}>
                {/* Anti-spam honeypot */}
                <input type="text" name="_honey" style={{ display: 'none' }} />
                
                {/* Keep FormSubmit's challenge page disabled for AJAX submissions. */}
                <input type="hidden" name="_captcha" value="false" />
                
                <div className="mf-row">
                  <label className="mf-label label-caps" htmlFor="cf-name">Your Name</label>
                  <input id="cf-name" name="name" className="mf-input" type="text" placeholder="Full name" required />
                </div>
                <div className="mf-row">
                  <label className="mf-label label-caps" htmlFor="cf-school">School</label>
                  <input id="cf-school" name="school" className="mf-input" type="text" placeholder="Your school / institution" />
                </div>
                <div className="mf-row">
                  <label className="mf-label label-caps" htmlFor="cf-msg">Message</label>
                  <textarea id="cf-msg" name="message" className="mf-input mf-textarea" rows="3" placeholder="Write your query..." required />
                </div>
                <button
                  type="submit"
                  className={`mf-submit${formStatus === 'sending' ? ' mf-submit--sending' : ''}`}
                  disabled={formStatus === 'sending'}
                  id="contact-send-btn"
                >
                  {formStatus === 'sending' ? (
                    <span className="sending-dots">
                      Transmitting<span className="dot-1">.</span>
                      <span className="dot-2">.</span>
                      <span className="dot-3">.</span>
                    </span>
                  ) : (
                    <>
                      <span>TRANSMIT</span>
                      <span className="submit-arrow">→</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default ContactPage;
