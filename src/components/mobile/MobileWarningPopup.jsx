import React, { useState, useEffect } from 'react';
import './MobileWarningPopup.css';

export default function MobileWarningPopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already dismissed the warning in this session
    const hasSeenWarning = sessionStorage.getItem('genesis_mobile_warning_dismissed');
    if (!hasSeenWarning) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('genesis_mobile_warning_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="m-warning-overlay">
      <div className="m-warning-modal">
        <div className="m-warning-icon">⚠</div>
        <h2 className="m-warning-title">OPTIMIZED FOR DESKTOP</h2>
        <p className="m-warning-text">
          Genesis Tech Fest features an immersive, graphics-heavy experience. For the best visual fidelity and full interactive features, we highly recommend viewing this site on a PC, Laptop, or Desktop.
        </p>
        <button className="m-warning-btn" onClick={handleDismiss}>
          CONTINUE TO MOBILE VERSION
        </button>
      </div>
    </div>
  );
}
