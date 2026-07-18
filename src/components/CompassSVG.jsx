import React from 'react';

// Shared compass SVG component so it can be used in both the main Nav and FAQ section
// Props allow customizing the color, size, and adding custom classes (e.g. for spinning)
const CompassSVG = ({ className = '', size = 300, color = 'var(--text)', activePoint = null }) => {
  const getOpacity = (dir) => activePoint === dir ? 1 : (activePoint ? 0.3 : 0.8);
  const getFill = (dir) => activePoint === dir ? 'var(--accent-bright)' : color;
  const getStyle = (dir) => ({
    transform: activePoint === dir ? 'scale(1.15)' : 'scale(1)',
    transformOrigin: '100px 100px',
    transition: 'all 0.3s var(--ease-out)',
    filter: activePoint === dir ? 'drop-shadow(0 0 8px var(--accent-bright))' : 'none'
  });

  return (
    <svg 
      className={`compass-svg ${className}`} 
      width={size} 
      height={size} 
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer decorative ring with tick marks */}
      <circle cx="100" cy="100" r="95" stroke={color} strokeWidth="1" strokeDasharray="2 6" opacity="0.3" />
      
      {/* Inner solid ring */}
      <circle cx="100" cy="100" r="80" stroke={color} strokeWidth="1" opacity="0.5" />
      
      {/* 4 Cardinal points (Longer points) */}
      <path style={getStyle('top')} opacity={getOpacity('top')} fill={getFill('top')} d="M100 10 L108 85 L100 100 L92 85 Z" />
      <path style={getStyle('bottom')} opacity={getOpacity('bottom')} fill={getFill('bottom')} d="M100 190 L108 115 L100 100 L92 115 Z" />
      <path style={getStyle('left')} opacity={getOpacity('left')} fill={getFill('left')} d="M10 100 L85 92 L100 100 L85 108 Z" />
      <path style={getStyle('right')} opacity={getOpacity('right')} fill={getFill('right')} d="M190 100 L115 92 L100 100 L115 108 Z" />

      {/* 4 Ordinal points (Shorter points) */}
      <path d="M36 36 L75 75 L100 100 L65 85 Z" fill={color} opacity={activePoint ? 0.2 : 0.4} transition="opacity 0.3s" />
      <path d="M164 36 L125 75 L100 100 L135 85 Z" fill={color} opacity={activePoint ? 0.2 : 0.4} transition="opacity 0.3s" />
      <path d="M36 164 L75 125 L100 100 L65 115 Z" fill={color} opacity={activePoint ? 0.2 : 0.4} transition="opacity 0.3s" />
      <path d="M164 164 L125 125 L100 100 L135 115 Z" fill={color} opacity={activePoint ? 0.2 : 0.4} transition="opacity 0.3s" />

      {/* Inner decorative circle */}
      <circle cx="100" cy="100" r="25" stroke={color} strokeWidth="0.5" opacity="0.3" />
      
      {/* Center dot */}
      <circle cx="100" cy="100" r="4" fill="var(--accent-bright)" />
      
      {/* Subtle outer dots at cardinal directions */}
      <circle cx="100" cy="5" r="2" fill={color} opacity="0.6" />
      <circle cx="100" cy="195" r="2" fill={color} opacity="0.6" />
      <circle cx="5" cy="100" r="2" fill={color} opacity="0.6" />
      <circle cx="195" cy="100" r="2" fill={color} opacity="0.6" />
    </svg>
  );
};

export default CompassSVG;
