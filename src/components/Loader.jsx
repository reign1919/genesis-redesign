import React from 'react';
import './Loader.css';

export default function Loader() {
  return (
    <div className="genesis-loader-wrapper">
      <svg viewBox="0 0 100 100" className="genesis-loader">
        <g className="genesis-points"> 
          <circle fill="#fff" r={50} cy={50} cx={50} className="genesis-ciw" />
          <circle r={4} cy={50} cx={5} className="genesis-ci2" />
          <circle r={4} cy={50} cx={95} className="genesis-ci1" />
        </g>
      </svg>
    </div>
  );
}
