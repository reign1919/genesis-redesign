import React, { useState, memo } from 'react';
import Reel from './Reel';
import CircuitBackground from './CircuitBackground';
import { EVENT_CLUSTERS } from '../../lib/eventsData';
import './CircuitBoardGrid.css';

/**
 * Circuit Board PCB Layout Grid Component.
 * Positions events as film reel nodes on a staggered non-uniform grid.
 */
const CircuitBoardGrid = ({
  events = [],
  activeEvent = null,
  onSelectEvent,
  onHoverCluster,
  activeCluster = null,
}) => {
  const [hoveredReelId, setHoveredReelId] = useState(null);

  const handleMouseEnter = (event) => {
    setHoveredReelId(event.id);
    if (onHoverCluster) onHoverCluster(event.category);
  };

  const handleMouseLeave = () => {
    setHoveredReelId(null);
    if (onHoverCluster) onHoverCluster(null);
  };

  return (
    <div className="circuit-board-grid-wrapper">
      {/* Circuit Trace Background Network */}
      <CircuitBackground activeCluster={activeCluster} />
      {/* Silkscreen Legend / Filter Key */}
      <div className="pcb-silkscreen-legend">
        <div className="legend-title">CIRCUIT CLUSTERS</div>
        <div className="legend-items">
          <button
            className="legend-badge flagship"
            onMouseEnter={() => onHoverCluster && onHoverCluster(EVENT_CLUSTERS.FLAGSHIP)}
            onMouseLeave={() => onHoverCluster && onHoverCluster(null)}
          >
            <span className="badge-dot" />
            FLAGSHIP (4)
          </button>
          <button
            className="legend-badge technical"
            onMouseEnter={() => onHoverCluster && onHoverCluster(EVENT_CLUSTERS.TECHNICAL)}
            onMouseLeave={() => onHoverCluster && onHoverCluster(null)}
          >
            <span className="badge-dot" />
            TECHNICAL (3)
          </button>
          <button
            className="legend-badge creative"
            onMouseEnter={() => onHoverCluster && onHoverCluster(EVENT_CLUSTERS.CREATIVE)}
            onMouseLeave={() => onHoverCluster && onHoverCluster(null)}
          >
            <span className="badge-dot" />
            CREATIVE (3)
          </button>
        </div>
      </div>

      {/* Reel Counter Tag */}
      <div className="reel-counter-hud">
        <span className="counter-prefix">REEL RACK //</span>
        <span className="counter-readout">01 TO 10 / 10 TOTAL</span>
      </div>

      {/* Staggered PCB Grid Canvas Area */}
      <div className="pcb-nodes-canvas">
        {events.map((event) => {
          const isHovered = hoveredReelId === event.id;
          const isSelected = activeEvent && activeEvent.id === event.id;
          const isClusterMatch = activeCluster && event.category === activeCluster;
          const isSpinning = isHovered || isSelected || isClusterMatch;

          // Node size: Flagships are larger (88px), Standard nodes (68px)
          const nodeSize = event.flagship ? 88 : 68;

          return (
            <div
              key={event.id}
              className={`pcb-node-anchor ${event.flagship ? 'flagship-anchor' : ''} cluster-${event.category.toLowerCase()} ${isClusterMatch ? 'cluster-active' : ''}`}
              style={{
                left: `${event.gridPosition.x}%`,
                top: `${event.gridPosition.y}%`,
              }}
              onMouseEnter={() => handleMouseEnter(event)}
              onMouseLeave={handleMouseLeave}
            >
              <Reel
                size={nodeSize}
                isSpinning={isSpinning}
                isFlagship={event.flagship}
                isActive={isSelected || isClusterMatch}
                label={event.title}
                reelNumber={event.reelIndex}
                onClick={(e) => onSelectEvent(event, e)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default memo(CircuitBoardGrid);
