import React, { useState } from 'react';
import './CreatorsPopup.css';

const CreatorsPopup = ({ isOpen, onClose }) => {
  const [activeQuote, setActiveQuote] = useState(null);

  if (!isOpen) return null;

  const handleClose = (e) => {
    setActiveQuote(null);
    onClose(e);
  };

  return (
    <div className="creators-backdrop" onClick={handleClose}>
      <div className="creators-modal" onClick={e => e.stopPropagation()}>
        <button className="creators-close-btn" onClick={handleClose} aria-label="Close">×</button>
        <h2 className="creators-title display-lg" style={{ fontSize: '24px' }}>DEVELOPERS</h2>
        <div className="creators-list">
          <div className="creator-card" onClick={() => setActiveQuote({ text: "Evening the odds", author: "Arkham Knight" })}>
            <span className="creator-name body-lg">Trishaan Saha</span>
          </div>
          <div className="creator-card" onClick={() => setActiveQuote({ text: "Praise the Sun!", author: "Solaire of Astora" })}>
            <span className="creator-name body-lg">Dhritiman Das</span>
          </div>
        </div>
        
        {activeQuote && (
          <div className="creator-quote-box">
            <p className="creator-quote-text">"{activeQuote.text}"</p>
            <p className="creator-quote-author">— {activeQuote.author}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorsPopup;
