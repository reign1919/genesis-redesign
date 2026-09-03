import React from 'react';
import './WhatsAppModal.css';

const WhatsAppModal = ({ isOpen, onClose, activeTab = 'STALL SETUP' }) => {
  if (!isOpen) return null;

  const defaultMessage = encodeURIComponent(
    `Hi Genesis Team, I saw the Partnership page for Genesis and would like to inquire about ${activeTab.toUpperCase()} opportunities!`
  );

  const contacts = [
    {
      name: 'Trishaan Saha',
      phone: '+91 7439868267',
      link: `https://wa.me/917439868267?text=${defaultMessage}`
    },
    {
      name: 'Akshat R.C.',
      phone: '+91 6383328621',
      link: `https://wa.me/916383328621?text=${defaultMessage}`
    }
  ];

  return (
    <div className="wa-backdrop" onClick={onClose}>
      <div className="wa-modal" onClick={(e) => e.stopPropagation()}>
        <button className="wa-close-btn" onClick={onClose} aria-label="Close modal">×</button>

        <div className="wa-header">
          <span className="wa-badge label-caps">GENESIS // WHATSAPP TRANSMISSION</span>
          <h2 className="wa-title headline-sm">SELECT COORDINATOR</h2>
          <p className="wa-subtitle body-md">
            Choose a coordinator to open a direct WhatsApp chat for {activeTab.toUpperCase()} inquiries.
          </p>
        </div>

        <div className="wa-options-grid">
          {contacts.map((c, i) => (
            <a
              key={i}
              href={c.link}
              target="_blank"
              rel="noopener noreferrer"
              className="wa-contact-card"
              onClick={onClose}
            >
              <div className="wa-card-info">
                <span className="wa-contact-name">{c.name}</span>
                <span className="wa-contact-phone">{c.phone}</span>
              </div>
              <span className="wa-contact-btn label-caps">CHAT ON WHATSAPP →</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppModal;
