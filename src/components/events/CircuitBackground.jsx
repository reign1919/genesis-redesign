import React, { memo } from 'react';
import './CircuitBackground.css';

/**
 * Reusable Circuit Trace SVG Network Background.
 * Renders etched PCB copper lines, pulsing current traces, and solder pads.
 * Symmetrical, logical PCB schematic layout:
 * - Flagship Core: Hackathon, Buildathon, Zero Day, Overclocked
 * - Left Technical Branch: Code Clash -> Merge Conflict -> Cine Tank (Left Side)
 * - Right Creative Branch: Pixel Prix -> Reel Deal -> Focal Point (Right Side)
 */
const CircuitBackground = ({ activeCluster = null }) => {
  const isFlagship = activeCluster === 'Flagship';
  const isTechnical = activeCluster === 'Technical';
  const isCreative = activeCluster === 'Creative';

  return (
    <div className="circuit-bg-container">
      <svg
        className="circuit-svg"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="traceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent-deepest)" stopOpacity="0.4" />
            <stop offset="50%" stopColor="var(--accent-mid)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--accent-bright)" stopOpacity="1" />
          </linearGradient>
          <filter id="circuitGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Static PCB Etched Grid Network */}
        <g className="static-pcb-traces">
          {/* Main Central Power & Ground Trunk */}
          <path d="M 500,0 V 1000" className="pcb-line trunk-main" />
          <path d="M 0,440 H 1000" className="pcb-line trunk-horizontal" />

          {/* 1. FLAGSHIP CLUSTER MATRIX (Top Core) */}
          {/* Top Power Feed to Hackathon (500, 180) */}
          <path d="M 500,0 V 180" className={`pcb-line flagship-trace ${isFlagship ? 'highlight' : ''}`} />
          {/* Hackathon (500,180) -> Buildathon (280,320) & Zero Day (720,320) */}
          <path d="M 500,180 L 280,320" className={`pcb-line flagship-trace ${isFlagship ? 'highlight' : ''}`} />
          <path d="M 500,180 L 720,320" className={`pcb-line flagship-trace ${isFlagship ? 'highlight' : ''}`} />
          {/* Horizontal Interconnect Buildathon (280,320) <-> Zero Day (720,320) */}
          <path d="M 280,320 H 720" className={`pcb-line flagship-trace ${isFlagship ? 'highlight' : ''}`} />
          {/* Direct Diagonals Buildathon (280,320) & Zero Day (720,320) -> Overclocked (500,440) */}
          <path d="M 280,320 L 500,440" className={`pcb-line flagship-trace ${isFlagship ? 'highlight' : ''}`} />
          <path d="M 720,320 L 500,440" className={`pcb-line flagship-trace ${isFlagship ? 'highlight' : ''}`} />
          {/* Central Trunk Hackathon (500,180) <-> Overclocked (500,440) */}
          <path d="M 500,180 V 440" className={`pcb-line flagship-trace ${isFlagship ? 'highlight' : ''}`} />

          {/* 2. LEFT TECHNICAL CIRCUIT BRANCH */}
          {/* Overclocked (500,440) -> Code Clash (200,620) */}
          <path d="M 500,440 H 200 V 620" className={`pcb-line branch-tech ${isTechnical ? 'highlight' : ''}`} />
          {/* Code Clash (200,620) -> Merge Conflict (360,760) */}
          <path d="M 200,620 L 360,760" className={`pcb-line branch-tech ${isTechnical ? 'highlight' : ''}`} />
          {/* Merge Conflict (360,760) -> Cine Tank (440,880) [Strictly Left Side] */}
          <path d="M 360,760 L 440,880" className={`pcb-line branch-tech ${isTechnical ? 'highlight' : ''}`} />
          {/* Cine Tank (440,880) -> Ground Return Bus */}
          <path d="M 440,880 H 500" className={`pcb-line branch-tech ${isTechnical ? 'highlight' : ''}`} />

          {/* 3. RIGHT CREATIVE CIRCUIT BRANCH */}
          {/* Overclocked (500,440) -> Pixel Prix (780,600) */}
          <path d="M 500,440 H 780 V 600" className={`pcb-line branch-creative ${isCreative ? 'highlight' : ''}`} />
          {/* Pixel Prix (780,600) -> Reel Deal (640,740) */}
          <path d="M 780,600 L 640,740" className={`pcb-line branch-creative ${isCreative ? 'highlight' : ''}`} />
          {/* Reel Deal (640,740) -> Focal Point (560,880) [Strictly Right Side] */}
          <path d="M 640,740 L 560,880" className={`pcb-line branch-creative ${isCreative ? 'highlight' : ''}`} />
          {/* Focal Point (560,880) -> Ground Return Bus */}
          <path d="M 560,880 H 500" className={`pcb-line branch-creative ${isCreative ? 'highlight' : ''}`} />
        </g>

        {/* Live Current Pulsing Traces */}
        <g className="pulsing-current-traces" filter="url(#circuitGlow)">
          <path d="M 500,0 V 180" className="pulse-path pulse-1" />
          <path d="M 500,180 L 280,320 L 500,440" className="pulse-path pulse-2" />
          <path d="M 500,180 L 720,320 L 500,440" className="pulse-path pulse-3" />
          <path d="M 500,440 H 200 V 620 L 360,760 L 440,880 H 500" className="pulse-path pulse-left" />
          <path d="M 500,440 H 780 V 600 L 640,740 L 560,880 H 500" className="pulse-path pulse-right" />
        </g>

        {/* PCB Solder Pad Node Rings */}
        <g className="pcb-solder-pads">
          {/* Flagship Nodes */}
          <circle cx="500" cy="180" r="8" className={`solder-pad pad-flagship ${isFlagship ? 'highlight-pad' : ''}`} />
          <circle cx="280" cy="320" r="8" className={`solder-pad pad-flagship ${isFlagship ? 'highlight-pad' : ''}`} />
          <circle cx="720" cy="320" r="8" className={`solder-pad pad-flagship ${isFlagship ? 'highlight-pad' : ''}`} />
          <circle cx="500" cy="440" r="10" className={`solder-pad pad-core ${isFlagship ? 'highlight-pad' : ''}`} />

          {/* Technical Nodes (Left Branch) */}
          <circle cx="200" cy="620" r="6" className={`solder-pad ${isTechnical ? 'highlight-pad' : ''}`} />
          <circle cx="360" cy="760" r="6" className={`solder-pad ${isTechnical ? 'highlight-pad' : ''}`} />
          <circle cx="440" cy="880" r="6" className={`solder-pad ${isTechnical ? 'highlight-pad' : ''}`} />

          {/* Creative Nodes (Right Branch) */}
          <circle cx="780" cy="600" r="6" className={`solder-pad ${isCreative ? 'highlight-pad' : ''}`} />
          <circle cx="640" cy="740" r="6" className={`solder-pad ${isCreative ? 'highlight-pad' : ''}`} />
          <circle cx="560" cy="880" r="6" className={`solder-pad ${isCreative ? 'highlight-pad' : ''}`} />
        </g>
      </svg>
    </div>
  );
};

export default memo(CircuitBackground);
