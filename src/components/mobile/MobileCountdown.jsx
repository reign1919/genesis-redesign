import React, { useState, useEffect, memo } from 'react';
import './MobileCountdown.css';

const MobileCountdown = () => {
  const TARGET_DATE = new Date('2026-09-26T00:00:00').getTime();

  const [timeLeft, setTimeLeft] = useState({
    days: '00', hours: '00', minutes: '00', seconds: '00'
  });
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const calculate = () => {
      const now = Date.now();
      const diff = TARGET_DATE - now;
      if (diff > 0) {
        setIsUrgent(diff < 1000 * 60 * 60 * 24);
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)).toString().padStart(2, '0'),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0'),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0'),
          seconds: Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0'),
        });
      }
    };
    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, []);

  const blocks = [
    { value: timeLeft.days, label: 'DAYS' },
    { value: timeLeft.hours, label: 'HRS' },
    { value: timeLeft.minutes, label: 'MINS' },
    { value: timeLeft.seconds, label: 'SECS' },
  ];

  return (
    <div className={`m-countdown ${isUrgent ? 'm-countdown--urgent' : ''}`}>
      <div className="m-countdown-label label-caps">COUNTDOWN TO GENESIS</div>
      <div className="m-countdown-grid">
        {blocks.map((b, i) => (
          <React.Fragment key={b.label}>
            <div className="m-countdown-block">
              <span className="m-countdown-value">{b.value}</span>
              <span className="m-countdown-unit label-caps">{b.label}</span>
            </div>
            {i < blocks.length - 1 && (
              <span className="m-countdown-sep">:</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default memo(MobileCountdown);
