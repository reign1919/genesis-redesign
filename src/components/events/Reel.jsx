import React, { memo } from 'react';
import './Reel.css';

/**
 * Procedurally drawn Film Reel SVG Component.
 * Pure vector graphics representing film canister hubs, spokes, and film tape.
 */
const Reel = ({
  size = 72,
  isSpinning = false,
  isFlagship = false,
  isActive = false,
  label = '',
  reelNumber = '',
  className = '',
  onClick,
}) => {
  const outerRadius = size / 2;
  const innerRadius = outerRadius * 0.88;
  const hubRadius = outerRadius * 0.28;
  const holeRadius = outerRadius * 0.22;
  const holeDistance = outerRadius * 0.52;

  // 6 spokes / film reel windows
  const holes = Array.from({ length: 6 }).map((_, index) => {
    const angle = (index * 60 * Math.PI) / 180;
    const cx = outerRadius + holeDistance * Math.cos(angle);
    const cy = outerRadius + holeDistance * Math.sin(angle);
    return { cx, cy };
  });

  return (
    <div
      className={`reel-wrapper ${isFlagship ? 'flagship' : ''} ${isActive ? 'active' : ''} ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      onClick={onClick}
    >
      <div className={`reel-disk-container ${isSpinning ? 'spinning' : ''}`} style={{ width: `${size}px`, height: `${size}px` }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="reel-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Ring / Rim */}
          <circle
            cx={outerRadius}
            cy={outerRadius}
            r={innerRadius}
            className="reel-rim-outer"
          />

          {/* Film Tape Indentation Track */}
          <circle
            cx={outerRadius}
            cy={outerRadius}
            r={innerRadius - 3}
            className="reel-tape-track"
          />

          {/* Inner Hub Ring */}
          <circle
            cx={outerRadius}
            cy={outerRadius}
            r={hubRadius}
            className="reel-hub"
          />

          {/* Center Axle Pin */}
          <circle
            cx={outerRadius}
            cy={outerRadius}
            r={hubRadius * 0.4}
            className="reel-axle"
          />

          {/* 6 Circular Spokes Cutouts */}
          {holes.map((h, i) => (
            <circle
              key={i}
              cx={h.cx}
              cy={h.cy}
              r={holeRadius}
              className="reel-spoke-hole"
            />
          ))}

          {/* Crosshairs & Alignment Notches */}
          <line
            x1={outerRadius - innerRadius * 0.9}
            y1={outerRadius}
            x2={outerRadius + innerRadius * 0.9}
            y2={outerRadius}
            className="reel-crosshair"
          />
          <line
            x1={outerRadius}
            y1={outerRadius - innerRadius * 0.9}
            x2={outerRadius}
            y2={outerRadius + innerRadius * 0.9}
            className="reel-crosshair"
          />
        </svg>

        {/* Center Glow Node */}
        <div className="reel-center-glow" />
      </div>

      {/* Label Strip below reel if provided */}
      {label && (
        <div className="reel-label-strip">
          {reelNumber && <span className="reel-number-tag">[{reelNumber}]</span>}
          <span className="reel-title-tag">{label}</span>
        </div>
      )}
    </div>
  );
};

export default memo(Reel);
