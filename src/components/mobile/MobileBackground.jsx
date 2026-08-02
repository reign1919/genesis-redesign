import React, { useEffect, useRef, memo } from 'react';
import './MobileBackground.css';

/**
 * Lightweight ambient animated background for mobile.
 * Completely non-interactive and pointer-events free for 100% smooth scrolling.
 */
const PARTICLE_COUNT = 25;
const PARTICLE_SPEED = 0.3;
const CONNECTION_DIST = 120;

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

const MobileBackground = () => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Init particles
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: randomBetween(-PARTICLE_SPEED, PARTICLE_SPEED),
      vy: randomBetween(-PARTICLE_SPEED, PARTICLE_SPEED),
      radius: randomBetween(1.2, 2.8),
      pulseOffset: Math.random() * Math.PI * 2,
    }));

    let t = 0;
    const draw = () => {
      t += 0.01;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      const particles = particlesRef.current;

      // Update particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) { p.x = 0; p.vx *= -1; }
        if (p.x > W) { p.x = W; p.vx *= -1; }
        if (p.y < 0) { p.y = 0; p.vy *= -1; }
        if (p.y > H) { p.y = H; p.vy *= -1; }
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.35;
            const rgb = (i + j) % 3 === 0 ? '139, 26, 26' : '255, 255, 255';
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${rgb}, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const pulse = 0.7 + 0.3 * Math.sin(t * 2 + p.pulseOffset);
        const r = p.radius * pulse;
        const rgb = i % 3 === 0 ? '172, 50, 46' : (i % 3 === 1 ? '255, 174, 216' : '161, 120, 255');
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb}, 0.6)`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="mobile-bg-container">
      <div className="mobile-bg-gradient" />
      <canvas ref={canvasRef} className="mobile-bg-canvas" aria-hidden="true" />
      <div className="mobile-bg-noise" />
    </div>
  );
};

export default memo(MobileBackground);
