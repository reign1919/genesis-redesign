import React, { useState, useEffect, useRef } from 'react';
import './CountdownTimer.css';
import FlipDigit from './FlipDigit';

const CountdownTimer = () => {
  // Target Date: September 26, 2026, 00:00:00
  const TARGET_DATE = new Date('2026-09-26T00:00:00').getTime();

  const [timeLeft, setTimeLeft] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00'
  });
  
  const [isUrgent, setIsUrgent] = useState(false);
  const [pulse, setPulse] = useState(false);
  
  const prevHoursRef = useRef(null);
  const prevDaysRef = useRef(null);

  useEffect(() => {
    const triggerPulse = () => {
      setPulse(true);
      setTimeout(() => setPulse(false), 1000);
    };

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = TARGET_DATE - now;

      if (difference > 0) {
        setIsUrgent(difference < 1000 * 60 * 60 * 24);

        const days = Math.floor(difference / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        const seconds = Math.floor((difference % (1000 * 60)) / 1000).toString().padStart(2, '0');

        // Check for rollover pulse
        if (prevHoursRef.current && prevHoursRef.current !== hours) triggerPulse();
        if (prevDaysRef.current && prevDaysRef.current !== days) triggerPulse();

        prevHoursRef.current = hours;
        prevDaysRef.current = days;

        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`countdown-container ${isUrgent ? 'urgent' : ''} ${pulse ? 'rollover-pulse' : ''}`}>
      <div className="countdown-display">
        <div className="time-block">
          <FlipDigit value={timeLeft.days} />
          <span className="time-label label-caps">DAYS</span>
        </div>
        <span className="time-separator">:</span>
        
        <div className="time-block">
          <FlipDigit value={timeLeft.hours} />
          <span className="time-label label-caps">HRS</span>
        </div>
        <span className="time-separator">:</span>
        
        <div className="time-block">
          <FlipDigit value={timeLeft.minutes} />
          <span className="time-label label-caps">MINS</span>
        </div>
        <span className="time-separator">:</span>
        
        <div className="time-block">
          <FlipDigit value={timeLeft.seconds} />
          <span className="time-label label-caps">SECS</span>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
