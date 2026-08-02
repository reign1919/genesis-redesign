import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Reel from '../../components/events/Reel';
import ProjectorBeamWipe from '../../components/events/ProjectorBeamWipe';
import EventOverlay from '../../components/events/EventOverlay';
import MobileHamburger from '../../components/mobile/MobileHamburger';
import { eventsData, getEventById } from '../../lib/eventsData';
import './MobileEventsPage.css';

/**
 * Mobile-Optimized Genesis Events Page.
 * Uses a vertical PCB power rail trace layout for optimal mobile reading.
 */
const MobileEventsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeEvent, setActiveEvent] = useState(null);
  const [clickOrigin, setClickOrigin] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  useEffect(() => {
    const eventId = searchParams.get('id');
    if (eventId) {
      const match = getEventById(eventId);
      if (match) setActiveEvent(match);
    } else {
      setActiveEvent(null);
    }
  }, [searchParams]);

  const handleSelectEvent = (eventObj, e) => {
    if (e) {
      setClickOrigin({ x: e.clientX, y: e.clientY });
    }
    setActiveEvent(eventObj);
    setSearchParams({ id: eventObj.id }, { replace: true });
  };

  const handleClose = () => {
    setActiveEvent(null);
    setSearchParams({}, { replace: true });
  };

  return (
    <div className="mobile-events-wrapper">
      {/* Mobile Top Header Navigation */}
      <header className="mobile-events-header">
        <Link to="/" className="mobile-brand-title">
          GENESIS <span className="title-sub">// EVENTS</span>
        </Link>
        <MobileHamburger />
      </header>

      {/* Main Vertical PCB Rail Content */}
      <main className="mobile-rail-container">
        <div className="rail-header-banner">
          <div className="rail-hud-tag">REEL RACK // 10 EVENTS</div>
          <h1 className="headline-md rail-page-title">CIRCUIT BOARD EVENTS</h1>
          <p className="body-md rail-subtitle">Tap any reel node to power up projected specifications.</p>
        </div>

        {/* Central Vertical Power Trace */}
        <div className="vertical-power-rail">
          <div className="rail-pulse-line" />
        </div>

        {/* Vertical List of Reel Nodes */}
        <div className="mobile-reel-nodes-list">
          {eventsData.map((event, index) => {
            const isSelected = activeEvent && activeEvent.id === event.id;
            const isLeft = index % 2 === 0;

            return (
              <div
                key={event.id}
                className={`mobile-node-item ${isLeft ? 'align-left' : 'align-right'} ${event.flagship ? 'flagship-item' : ''}`}
                onClick={(e) => handleSelectEvent(event, e)}
              >
                <div className="node-connector-line" />
                <div className="node-reel-box">
                  <Reel
                    size={event.flagship ? 72 : 60}
                    isSpinning={isSelected}
                    isFlagship={event.flagship}
                    isActive={isSelected}
                  />
                </div>
                <div className="node-info-box">
                  <span className="node-index-tag">REEL {event.reelIndex}</span>
                  <h3 className="node-title">{event.title}</h3>
                  <span className="node-category-tag">{event.category}</span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Projector Transition & Overlay */}
      <ProjectorBeamWipe isOpen={Boolean(activeEvent)} origin={clickOrigin}>
        {activeEvent && (
          <EventOverlay
            event={activeEvent}
            allEvents={eventsData}
            onClose={handleClose}
            onNavigateEvent={(nextEvent) => handleSelectEvent(nextEvent, null)}
          />
        )}
      </ProjectorBeamWipe>
    </div>
  );
};

export default MobileEventsPage;
