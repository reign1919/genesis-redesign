import React, { useEffect, useState, memo } from 'react';
import './ProjectorBeamWipe.css';

/**
 * Projector Beam + Wipe Transition Layer.
 * Emits red beam cone from origin {x,y}, triggers micro-flash, and performs radial clip wipe.
 */
const ProjectorBeamWipe = ({
  isOpen = false,
  origin = { x: 0, y: 0 },
  onTransitionComplete,
  children,
}) => {
  const [phase, setPhase] = useState('IDLE'); // IDLE, BEAM, FLASH, WIPE, OPEN, COLLAPSE

  // Lock body scroll while the overlay is open so wheel events
  // cannot fall through to the EventsPage beneath the fixed layer.
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      // Begin 5-stage transition sequence
      setPhase('BEAM');

      const beamTimer = setTimeout(() => {
        setPhase('FLASH');
      }, 180);

      const flashTimer = setTimeout(() => {
        setPhase('WIPE');
      }, 260);

      const openTimer = setTimeout(() => {
        setPhase('OPEN');
        if (onTransitionComplete) onTransitionComplete();
      }, 650);

      return () => {
        clearTimeout(beamTimer);
        clearTimeout(flashTimer);
        clearTimeout(openTimer);
      };
    } else {
      if (phase !== 'IDLE') {
        setPhase('COLLAPSE');
        const collapseTimer = setTimeout(() => {
          setPhase('IDLE');
        }, 450);
        return () => clearTimeout(collapseTimer);
      }
    }
  }, [isOpen]);

  if (phase === 'IDLE') return null;

  // Origin percentage calculations
  const originX = (origin.x / (window.innerWidth || 1000)) * 100;
  const originY = (origin.y / (window.innerHeight || 800)) * 100;

  return (
    <div className={`projector-transition-container phase-${phase.toLowerCase()}`}>
      {/* 1. Projector Light Beam Cone */}
      {(phase === 'BEAM' || phase === 'FLASH') && (
        <div
          className="projector-beam-cone"
          style={{
            top: `${origin.y}px`,
            left: `${origin.x}px`,
          }}
        />
      )}

      {/* 2. Micro Flash Screen Layer */}
      {phase === 'FLASH' && <div className="projector-micro-flash" />}

      {/* 3. Radial Clip Path Wipe Viewport Container */}
      <div
        className="projector-wipe-content"
        style={{
          clipPath:
            phase === 'OPEN'
              ? 'none'
              : phase === 'WIPE'
              ? 'circle(150% at ' + originX + '% ' + originY + '%)'
              : phase === 'COLLAPSE'
              ? 'circle(0% at ' + originX + '% ' + originY + '%)'
              : 'circle(0% at ' + originX + '% ' + originY + '%)',
        }}
      >
        {/* Faint Scanline Settle Overlay */}
        <div className="scanline-settle-overlay" />
        {children}
      </div>
    </div>
  );
};

export default memo(ProjectorBeamWipe);
