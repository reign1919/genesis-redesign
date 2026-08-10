import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import CircuitBackground from '../components/events/CircuitBackground';
import CircuitBoardGrid from '../components/events/CircuitBoardGrid';
import ProjectorBeamWipe from '../components/events/ProjectorBeamWipe';
import EventOverlay from '../components/events/EventOverlay';
import SysReadyCounter from '../components/SysReadyCounter';
import CreatorsPopup from '../components/CreatorsPopup';
import { eventsData, getEventById } from '../lib/eventsData';
import SEO from '../components/SEO';
import { getMainEventSchema, getSpecificEventSchema } from '../lib/seoData';
import folderIcon from '../assets/folder.png';
import webDevIcon from '../assets/web-development.png';
import './EventsPage.css';

const EventsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [activeEvent, setActiveEvent] = useState(null);
  const [clickOrigin, setClickOrigin] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [activeCluster, setActiveCluster] = useState(null);
  const [showCreators, setShowCreators] = useState(false);

  const wrapperRef = useRef(null);
  const rafRef = useRef(null);

  // Mouse spotlight positioning — rAF-batched to cap style writes at 1 per frame
  const handleMouseMove = (e) => {
    if (rafRef.current) return;
    const clientX = e.clientX;
    const clientY = e.clientY;
    rafRef.current = requestAnimationFrame(() => {
      if (wrapperRef.current) {
        wrapperRef.current.style.setProperty('--mouse-x', `${clientX}px`);
        wrapperRef.current.style.setProperty('--mouse-y', `${clientY}px`);
      }
      rafRef.current = null;
    });
  };

  // Synchronize deep-linking via query params (?id=zero-day)
  useEffect(() => {
    const eventId = searchParams.get('id');
    if (eventId) {
      const match = getEventById(eventId);
      if (match) {
        setActiveEvent(match);
      }
    } else {
      setActiveEvent(null);
    }
  }, [searchParams]);

  // Handle Event Node Click
  const handleSelectEvent = (eventObj, clickEvent) => {
    if (clickEvent) {
      setClickOrigin({ x: clickEvent.clientX, y: clickEvent.clientY });
    } else {
      setClickOrigin({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    }
    setActiveEvent(eventObj);
    setSearchParams({ id: eventObj.id }, { replace: true });
  };

  // Close Event Overlay
  const handleCloseOverlay = () => {
    setActiveEvent(null);
    setSearchParams({}, { replace: true });
  };

  const seoTitle = activeEvent
    ? `${activeEvent.title} — Genesis 2026 Tech Fest`
    : 'Events Rack — Genesis 2026 | Hackathon, Coding, Robotics & Creative Competitions';
  const seoDesc = activeEvent
    ? activeEvent.brief
    : 'Explore 10 flagship, technical, and creative events at Genesis 2026 Tech Fest: 48-Hour Hackathon, Buildathon, Zero Day CTF, Overclocked Robo Wars, Code Clash, and more.';
  const seoCanonical = activeEvent ? `/events?id=${activeEvent.id}` : '/events';
  const seoJsonLd = activeEvent ? getSpecificEventSchema(activeEvent) : getMainEventSchema();

  return (
    <div
      className="events-page-wrapper"
      ref={wrapperRef}
      onMouseMove={handleMouseMove}
      style={{ '--mouse-x': '50%', '--mouse-y': '50%' }}
    >
      <SEO
        title={seoTitle}
        description={seoDesc}
        canonical={seoCanonical}
        jsonLd={seoJsonLd}
      />
      <h1 className="sr-only">Genesis 2026 Tech Fest Events</h1>

      {/* 2. Dark Noise & Grid Overlays */}
      <div className="noise-overlay" />
      <div className="grid-overlay" />
      <div className="mouse-blur-overlay" />

      {/* 3. Fixed HUD Corner Brackets */}
      <div className="hud-brackets">
        <div className="bracket top-left" />
        <div className="bracket top-right" />
        <div className="bracket bottom-left" />
        <div className="bracket bottom-right" />
      </div>

      {/* 4. Fixed Technical Headers & Coordinate Accents */}
      <header className="tech-header">
        <Link to="/" className="home-header-link header-left" aria-label="Go to Genesis home page">
          GENESIS TECH FEST // EVENTS RACK
        </Link>
        <Link to="/" className="home-header-link header-right" aria-label="Go back to Home">
          RETURN TO HOME
        </Link>
      </header>

      <div className="data-accent left-accent">
        <SysReadyCounter />
      </div>
      <div className="data-accent right-accent">
        GRID STATUS: ONLINE
        <br />
        REEL NODES: 10 / 10
      </div>

      {/* 5. Main PCB Circuit Board Rack Canvas */}
      <main className="events-main-container">
        <CircuitBoardGrid
          events={eventsData}
          activeEvent={activeEvent}
          onSelectEvent={handleSelectEvent}
          onHoverCluster={setActiveCluster}
          activeCluster={activeCluster}
        />
      </main>

      {/* 6. Projector Beam Wipe Transition Container */}
      <ProjectorBeamWipe
        isOpen={Boolean(activeEvent)}
        origin={clickOrigin}
      >
        {activeEvent && (
          <EventOverlay
            event={activeEvent}
            allEvents={eventsData}
            onClose={handleCloseOverlay}
            onNavigateEvent={(nextEvent) => handleSelectEvent(nextEvent, null)}
          />
        )}
      </ProjectorBeamWipe>

      {/* 7. Footer */}
      <footer className="events-page-footer">
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link to="/docs" className="docs-link-btn">
            <img src={folderIcon} alt="Documentation Folder Icon" className="footer-folder-icon" />
            <span>DOCUMENTATION</span>
          </Link>
          <button className="docs-link-btn" onClick={() => setShowCreators(true)}>
            <img src={webDevIcon} alt="Developers Icon" className="footer-folder-icon" />
            <span>DEVELOPERS</span>
          </button>
        </div>
      </footer>

      <CreatorsPopup isOpen={showCreators} onClose={() => setShowCreators(false)} />
    </div>
  );
};

export default EventsPage;
