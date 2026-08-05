import React, { useEffect, memo } from 'react';
import ProceduralEventVisual from './ProceduralEventVisual';
import Reel from './Reel';
import CircuitBackground from './CircuitBackground';
import './EventOverlay.css';

/**
 * Full-Screen Projected Event Overlay Component.
 * Reads like a cinema screen inside the dark room machine.
 */
const EventOverlay = ({
  event,
  allEvents = [],
  onClose,
  onNavigateEvent,
}) => {
  // Keyboard Navigation Support (Arrow keys, Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        const currentIndex = allEvents.findIndex((item) => item.id === event.id);
        const nextEvent = allEvents[(currentIndex + 1) % allEvents.length];
        onNavigateEvent(nextEvent);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        const currentIndex = allEvents.findIndex((item) => item.id === event.id);
        const prevEvent = allEvents[(currentIndex - 1 + allEvents.length) % allEvents.length];
        onNavigateEvent(prevEvent);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [event, allEvents, onClose, onNavigateEvent]);

  if (!event) return null;

  return (
    <div className="event-overlay-inner">
      {/* Background Circuit Texture Continuation */}
      <CircuitBackground />

      {/* Top Controls Header Bar */}
      <div className="overlay-header-bar">
        <div className="overlay-reel-badge">
          <span className="badge-reel-counter">REEL {event.reelIndex} / {String(allEvents.length).padStart(2, '0')}</span>
          <span className="badge-cluster-name">// {event.category.toUpperCase()}</span>
        </div>

        {/* Power Off Toggle Close Button */}
        <button className="power-off-toggle-btn" onClick={onClose} aria-label="Power off event screen">
          <span className="toggle-label">POWER OFF</span>
        </button>
      </div>

      {/* Main Overlay Content Body */}
      <div className="overlay-content-container">
        {/* Title Banner */}
        <div className="overlay-hero-title">
          {event.flagship && <span className="flagship-hero-tag">FLAGSHIP EVENT</span>}
          <h1 className="display-lg event-main-title">{event.title}</h1>
          <p className="body-lg event-brief-tagline">{event.brief}</p>
        </div>

        {/* Two-Column Split Layout */}
        <div className="overlay-two-column-split">
          {/* Left Column: Data Readout Panel */}
          <div className="overlay-data-panel">
            <div className="panel-block-header">
              <span className="panel-title-label">SPECIFICATIONS READOUT</span>
              <span className="panel-status-dot" />
            </div>

            <div className="data-grid-table">
              <div className="data-row">
                <span className="data-key">DATE</span>
                <span className="data-value">{event.date}</span>
              </div>
              <div className="data-row">
                <span className="data-key">TIME / WINDOW</span>
                <span className="data-value">{event.time}</span>
              </div>
              <div className="data-row">
                <span className="data-key">TEAM SIZE</span>
                <span className="data-value">{event.teamSize}</span>
              </div>
              {event.formatMode && (
                <div className="data-row">
                  <span className="data-key">FORMAT / MODE</span>
                  <span className="data-value">{event.formatMode}</span>
                </div>
              )}
              {event.keyPolicy && (
                <div className="data-row">
                  <span className="data-key">KEY POLICY / AI</span>
                  <span className="data-value">{event.keyPolicy}</span>
                </div>
              )}
              {event.deliverable && (
                <div className="data-row">
                  <span className="data-key">DELIVERABLES</span>
                  <span className="data-value">{event.deliverable}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Procedural Signal Generator */}
          <div className="overlay-visual-column">
            <ProceduralEventVisual visualType={event.visualType} eventTitle={event.title} />
          </div>
        </div>

        {/* Rules & Regulations Section */}
        <div className="overlay-tabs-section">
          <div className="tabs-nav-bar">
            <span className="tab-btn active">
              RULES & REGULATIONS
            </span>
          </div>

          <div className="tab-content-display">
            <div className="tab-pane">
              <ul className="rules-bullet-list">
                {event.rules.map((rule, idx) => (
                  <li key={idx} className="rule-item">
                    <span className="rule-index">[{String(idx + 1).padStart(2, '0')}]</span>
                    <span className="rule-text">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Filmstrip Navigation Bar */}
      <div className="filmstrip-nav-bar">
        <div className="filmstrip-label">FILMSTRIP NAVIGATION</div>
        <div className="filmstrip-reels-track">
          {allEvents.map((item) => {
            const isCurrent = item.id === event.id;
            return (
              <div
                key={item.id}
                className={`filmstrip-thumb ${isCurrent ? 'active-thumb' : ''}`}
                onClick={() => onNavigateEvent(item)}
              >
                <Reel size={34} isSpinning={false} isActive={isCurrent} />
                <span className="thumb-title">{item.reelIndex}. {item.title}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default memo(EventOverlay);
