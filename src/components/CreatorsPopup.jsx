import React from 'react';
import './CreatorsPopup.css';

const CreatorsPopup = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="creators-backdrop" onClick={onClose}>
      <div className="creators-modal" onClick={e => e.stopPropagation()}>
        <button className="creators-close-btn" onClick={onClose} aria-label="Close">×</button>
        <h2 className="creators-title display-lg" style={{ fontSize: '24px' }}>DEVELOPERS</h2>
        <div className="creators-list">
          <div className="creator-card">
            <span className="creator-name body-lg">Trishaan Saha</span>
          </div>
          <div className="creator-card">
            <span className="creator-name body-lg">Dhritiman Das</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorsPopup;
