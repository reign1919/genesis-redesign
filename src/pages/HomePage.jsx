import React, { useState, useEffect, useRef } from 'react';
import './HomePage.css';
import CountdownTimer from '../components/CountdownTimer';
import BrandBlock from '../components/BrandBlock';
import CompassNav from '../components/CompassNav';
import FAQCompass from '../components/FAQCompass';
import CommitteeSection from '../components/CommitteeSection';
import NeuralBackground from '../components/NeuralBackground';
import SysReadyCounter from '../components/SysReadyCounter';

const HomePage = () => {
  const wrapperRef = useRef(null);

  const handleMouseMove = (e) => {
    if (wrapperRef.current) {
      wrapperRef.current.style.setProperty('--mouse-x', `${e.clientX}px`);
      wrapperRef.current.style.setProperty('--mouse-y', `${e.clientY}px`);
    }
  };

  return (
    <div 
      className="homepage-wrapper" 
      ref={wrapperRef}
      onMouseMove={handleMouseMove} 
      style={{ '--mouse-x': '50%', '--mouse-y': '50%' }}
    >
      
      {/* 1. Constellation Background */}
      <div className="homepage-background">
        <NeuralBackground />
      </div>

      {/* 2. Overlays (Noise, Grid, Blur Spotlight) */}
      <div className="noise-overlay"></div>
      <div className="grid-overlay"></div>
      <div className="mouse-blur-overlay"></div>

      {/* 3. HUD Corner Brackets */}
      <div className="hud-brackets">
        <div className="bracket top-left"></div>
        <div className="bracket top-right"></div>
        <div className="bracket bottom-left"></div>
        <div className="bracket bottom-right"></div>
      </div>

      {/* 4. Fixed Headers & Data Accents */}
      <header className="tech-header">
        <div className="header-left">GENESIS TECH FEST</div>
        <div className="header-right">INDUS VALLEY WORLD SCHOOL</div>
      </header>
      
      <div className="data-accent left-accent"><SysReadyCounter /></div>
      <div className="data-accent right-accent">LAT: 22.5121° N<br/>LNG: 88.4027° E</div>
      
      {/* 5. Main Content Container */}
      <div className="homepage-container">
        {/* SECTION 1: HERO */}
        <section className="hero-section">
          <div className="hero-left">
            <CountdownTimer />
            <BrandBlock />
          </div>
          <div className="hero-right">
            <CompassNav />
          </div>
        </section>

        {/* SECTION 2: FAQ */}
        <section id="about" className="faq-section">
          <FAQCompass />
        </section>

        {/* SECTION 3: CORE COMMITTEE */}
        <section className="committee-section">
          <CommitteeSection />
        </section>
      </div>
    </div>
  );
};

export default HomePage;
