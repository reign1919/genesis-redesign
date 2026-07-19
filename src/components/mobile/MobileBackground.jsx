import React, { useEffect, useRef, memo } from 'react';
import './MobileBackground.css';

/**
 * Touch-responsive animated background for mobile.
 * Uses lightweight CSS animations + a very simple canvas with fewer particles.
 * Responds to touch events instead of mouse.
 */
const PARTICLE_COUNT = 25;
const PARTICLE_SPEED = 0.3;
const CONNECTION_DIST = 120;
const TOUCH_RIPPLE_RADIUS = 150;
const TOUCH_RIPPLE_FORCE = 8;

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

const MobileBackground = () => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const rafRef = useRef(null);
  const ripplesRef = useRef([]);

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

    // Touch ripple handler
    const handleTouch = (e) => {
      const touches = e.changedTouches || e.touches;
      if (!touches || touches.length === 0) return;
      const rect = canvas.getBoundingClientRect();
      for (let i = 0; i < touches.length; i++) {
        const tx = touches[i].clientX - rect.left;
        const ty = touches[i].clientY - rect.top;
        // Add ripple
        ripplesRef.current.push({ x: tx, y: ty, radius: 0, alpha: 0.6, maxRadius: TOUCH_RIPPLE_RADIUS });
        // Push particles away
        particlesRef.current.forEach((p) => {
          const dx = p.x - tx;
          const dy = p.y - ty;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < TOUCH_RIPPLE_RADIUS && dist > 0) {
            const force = (1 - dist / TOUCH_RIPPLE_RADIUS) * TOUCH_RIPPLE_FORCE;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        });
      }
    };

    canvas.addEventListener('touchstart', handleTouch, { passive: true });
    canvas.addEventListener('touchmove', handleTouch, { passive: true });

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
        p.vx *= 0.985;
        p.vy *= 0.985;

        const speedSq = p.vx * p.vx + p.vy * p.vy;
        const maxSpeed = PARTICLE_SPEED * 3;
        if (speedSq > maxSpeed * maxSpeed) {
          const speed = Math.sqrt(speedSq);
          p.vx = (p.vx / speed) * maxSpeed;
          p.vy = (p.vy / speed) * maxSpeed;
        }

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

      // Draw and update ripples
      const ripples = ripplesRef.current;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rip = ripples[i];
        rip.radius += 3;
        rip.alpha -= 0.015;
        if (rip.alpha <= 0) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(172, 50, 46, ${rip.alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('touchstart', handleTouch);
      canvas.removeEventListener('touchmove', handleTouch);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="mobile-bg-container">
      {/* CSS gradient base layer */}
      <div className="mobile-bg-gradient" />
      {/* Lightweight canvas on top */}
      <canvas ref={canvasRef} className="mobile-bg-canvas" aria-hidden="true" />
      {/* Noise texture */}
      <div className="mobile-bg-noise" />
    </div>
  );
};

export default memo(MobileBackground);
