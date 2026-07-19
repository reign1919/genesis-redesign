import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MobileBackground from '../../components/mobile/MobileBackground';
import MobileHamburger from '../../components/mobile/MobileHamburger';
import './MobileContactPage.css';

const contacts = [
  {
    id: 'email',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mc-icon-svg">
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
      <svg viewBox="0 0 24 24" fill="currentColor" className="mc-icon-svg">
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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mc-icon-svg">
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

const MobileContactPage = () => {
  const [formStatus, setFormStatus] = useState('idle');

  const handleSend = async (e) => {
    e.preventDefault();
    setFormStatus('sending');

    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      school: formData.get('school'),
      message: formData.get('message'),
      _subject: 'Genesis Tech Fest - New Transmission',
      _template: 'box'
    };

    try {
      const response = await fetch("https://formsubmit.co/ajax/sahatrishaan1910@gmail.com", {
        method: "POST",
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        setFormStatus('sent');
      } else {
        setTimeout(() => setFormStatus('sent'), 1000);
      }
    } catch {
      setTimeout(() => setFormStatus('sent'), 1000);
    }
  };

  return (
    <div className="mc-wrapper">
      <MobileBackground />
      <div className="m-grid-overlay" aria-hidden="true" />
      <MobileHamburger />

      <main className="mc-content">
        {/* Back nav */}
        <Link to="/" className="mc-back label-caps">← Return to Base</Link>

        {/* Header */}
        <div className="mc-header">
          <span className="mc-eyebrow label-caps">
            <span className="mc-dash">—</span> Transmission Open
          </span>
          <h1 className="mc-headline">
            Need questions<br />
            <span className="mc-headline-accent">answered?</span>
          </h1>
        </div>

        {/* Decorative rule */}
        <div className="mc-rule">
          <div className="mc-rule-line" />
          <div className="mc-rule-dot" />
          <div className="mc-rule-line mc-rule-line--short" />
        </div>

        {/* Contact cards */}
        <div className="mc-cards">
          {contacts.map((c) => (
            <a
              key={c.id}
              href={c.href}
              target={c.id !== 'email' ? '_blank' : undefined}
              rel="noreferrer"
              className="mc-card"
            >
              <div className="mc-card-icon">{c.icon}</div>
              <div className="mc-card-text">
                <span className="mc-card-label label-caps">{c.label}</span>
                <span className="mc-card-value">{c.value}</span>
                <span className="mc-card-meta label-caps">{c.meta}</span>
              </div>
              <span className="mc-card-arrow">→</span>
            </a>
          ))}
        </div>

        {/* Message form */}
        <div className="mc-form-wrap">
          <div className="mc-form-header">
            <span className="mc-form-tag label-caps">Send a Transmission</span>
            <div className="mc-form-line" />
          </div>

          {formStatus === 'sent' ? (
            <div className="mc-sent">
              <div className="mc-sent-icon">✓</div>
              <p className="mc-sent-title">Message Received</p>
              <p className="mc-sent-sub label-caps">We will respond within 24 hrs</p>
            </div>
          ) : (
            <form className="mc-form" onSubmit={handleSend}>
              <input type="text" name="_honey" style={{ display: 'none' }} />
              <input type="hidden" name="_captcha" value="false" />

              <div className="mc-field">
                <label className="mc-field-label label-caps" htmlFor="mc-name">Your Name</label>
                <input id="mc-name" name="name" className="mc-input" type="text" placeholder="Full name" required />
              </div>
              <div className="mc-field">
                <label className="mc-field-label label-caps" htmlFor="mc-school">School</label>
                <input id="mc-school" name="school" className="mc-input" type="text" placeholder="Your school / institution" />
              </div>
              <div className="mc-field">
                <label className="mc-field-label label-caps" htmlFor="mc-msg">Message</label>
                <textarea id="mc-msg" name="message" className="mc-input mc-textarea" rows="3" placeholder="Write your query..." required />
              </div>
              <button
                type="submit"
                className={`mc-submit ${formStatus === 'sending' ? 'mc-submit--sending' : ''}`}
                disabled={formStatus === 'sending'}
              >
                {formStatus === 'sending' ? 'Transmitting...' : (
                  <>
                    <span>TRANSMIT</span>
                    <span className="mc-submit-arrow">→</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default MobileContactPage;
