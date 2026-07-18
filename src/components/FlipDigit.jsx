import React, { useState, useEffect } from 'react';
import './FlipDigit.css';

const FlipDigit = ({ value }) => {
  const [currentValue, setCurrentValue] = useState(value);
  const [nextValue, setNextValue] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (value !== currentValue) {
      setNextValue(value);
      setIsFlipping(true);
      
      const timer = setTimeout(() => {
        setCurrentValue(value);
        setIsFlipping(false);
      }, 500); // Total animation duration
      
      return () => clearTimeout(timer);
    }
  }, [value, currentValue]);

  return (
    <div className={`flip-digit ${isFlipping ? 'flipping' : ''}`}>
      <div className="digital-card next-top">{nextValue}</div>
      <div className="digital-card top">{currentValue}</div>
      <div className="digital-card bottom">{currentValue}</div>
      <div className="digital-card next-bottom">{nextValue}</div>
    </div>
  );
};

export default FlipDigit;
