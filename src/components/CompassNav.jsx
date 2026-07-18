import React, { useState } from 'react';
import CompassSVG from './CompassSVG';
import './CompassNav.css';

const CompassNav = () => {
  const [hoveredNav, setHoveredNav] = useState(null);

  return (
    <div className="compass-nav-container">
      <div className="compass-rotating-wrapper">
        <div className="radar-sweep"></div>
        <CompassSVG size={400} color="var(--accent-mid)" activePoint={hoveredNav} />
        
        <a href="#contact" className="nav-label label-top" onMouseEnter={() => setHoveredNav('top')} onMouseLeave={() => setHoveredNav(null)}>
          <span className="nav-text">CONTACT</span>
        </a>
        
        <a href="#register" className="nav-label label-left" onMouseEnter={() => setHoveredNav('left')} onMouseLeave={() => setHoveredNav(null)}>
          <span className="nav-text">REGISTER</span>
        </a>
        
        <a href="#events" className="nav-label label-right" onMouseEnter={() => setHoveredNav('right')} onMouseLeave={() => setHoveredNav(null)}>
          <span className="nav-text">EVENTS</span>
        </a>
        
        <a href="#about" className="nav-label label-bottom" onMouseEnter={() => setHoveredNav('bottom')} onMouseLeave={() => setHoveredNav(null)}>
          <span className="nav-text">ABOUT</span>
        </a>
      </div>
    </div>
  );
};

export default CompassNav;
