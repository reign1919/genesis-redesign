import React, { useEffect, useRef } from 'react';
import './NeuralBackground.css';

const NODE_COUNT = 50; // Reduced from 80 for performance
const CONNECTION_DIST = 160;
const CONNECTION_DIST_SQ = CONNECTION_DIST * CONNECTION_DIST;
const CURSOR_ATTRACT_DIST = 200;
const CURSOR_ATTRACT_DIST_SQ = CURSOR_ATTRACT_DIST * CURSOR_ATTRACT_DIST;
const CURSOR_ATTRACT_FORCE = 0.012;
const NODE_SPEED = 0.35;

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

export default function NeuralBackground() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const nodesRef = useRef([]);
  const rafRef = useRef(null);
  const mouseRafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Init nodes
    nodesRef.current = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: randomBetween(-NODE_SPEED, NODE_SPEED),
      vy: randomBetween(-NODE_SPEED, NODE_SPEED),
      radius: randomBetween(1.5, 3.5),
      pulseOffset: Math.random() * Math.PI * 2,
    }));

    const onMouseMove = (e) => {
      if (mouseRafRef.current) return;
      const x = e.clientX;
      const y = e.clientY;
      mouseRafRef.current = requestAnimationFrame(() => {
        mouseRef.current = { x, y };
        mouseRafRef.current = null;
      });
    };
    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);

    const NEURO_PINK   = '255, 174, 216';      // primary neon pink
    const NEURO_CYAN   = '0, 238, 252';         // secondary cyan
    const NEURO_PURPLE = '161, 120, 255';       // tertiary deep purple

    let t = 0;
    const draw = () => {
      t += 0.012;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const nodes = nodesRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Update positions
      nodes.forEach((n) => {
        // Cursor attraction
        const dx = mx - n.x;
        const dy = my - n.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < CURSOR_ATTRACT_DIST_SQ && distSq > 0) {
          const dist = Math.sqrt(distSq); // Only calc sqrt if within bounding box
          n.vx += (dx / dist) * CURSOR_ATTRACT_FORCE;
          n.vy += (dy / dist) * CURSOR_ATTRACT_FORCE;
        }

        // Damping
        n.vx *= 0.99;
        n.vy *= 0.99;

        // Clamp speed
        const speedSq = n.vx * n.vx + n.vy * n.vy;
        const maxSpeed = NODE_SPEED * 2.5;
        if (speedSq > maxSpeed * maxSpeed) {
          const speed = Math.sqrt(speedSq);
          n.vx = (n.vx / speed) * maxSpeed;
          n.vy = (n.vy / speed) * maxSpeed;
        }

        n.x += n.vx;
        n.y += n.vy;

        // Bounce
        if (n.x < 0)  { n.x = 0;  n.vx *= -1; }
        if (n.x > W)  { n.x = W;  n.vx *= -1; }
        if (n.y < 0)  { n.y = 0;  n.vy *= -1; }
        if (n.y > H)  { n.y = H;  n.vy *= -1; }
      });

      // Draw edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < CONNECTION_DIST_SQ) {
            const dist = Math.sqrt(distSq);
            const alpha = (1 - dist / CONNECTION_DIST) * 0.55;

            // Proximity to cursor boosts edge brightness
            const midX = (a.x + b.x) / 2;
            const midY = (a.y + b.y) / 2;
            const cdx = mx - midX;
            const cdy = my - midY;
            const cursorDistSq = cdx * cdx + cdy * cdy;
            const boost = cursorDistSq < (180 * 180) ? (1 - Math.sqrt(cursorDistSq) / 180) * 0.6 : 0;

            // Alternate edge colour for variety
            const useAccent = (i + j) % 3 === 0;
            const rgb = useAccent ? NEURO_PINK : NEURO_CYAN;

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${rgb}, ${Math.min(alpha + boost, 0.9)})`;
            ctx.lineWidth = 0.7 + boost * 1.2;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach((n, idx) => {
        const pulse = 0.6 + 0.4 * Math.sin(t * 1.8 + n.pulseOffset);
        const dx = mx - n.x;
        const dy = my - n.y;
        const cursorDistSq = dx * dx + dy * dy;
        const near = cursorDistSq < CURSOR_ATTRACT_DIST_SQ;
        let nearFactor = 0;
        
        if (near) {
           const cursorDist = Math.sqrt(cursorDistSq);
           nearFactor = 1 - cursorDist / CURSOR_ATTRACT_DIST;
        }

        const r = n.radius * (1 + nearFactor * 1.8) * pulse;
        const rgb = idx % 4 === 0 ? NEURO_PINK : (idx % 4 === 1 ? NEURO_CYAN : NEURO_PURPLE);
        const alpha = 0.5 + nearFactor * 0.5;

        // Glow
        if (near) {
          const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 5);
          glow.addColorStop(0, `rgba(${rgb}, ${0.35 * nearFactor})`);
          glow.addColorStop(1, `rgba(${rgb}, 0)`);
          ctx.beginPath();
          ctx.arc(n.x, n.y, r * 5, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();
        }

        // Core dot
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
        ctx.fill();

        // Ring on close nodes
        if (near && nearFactor > 0.5) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, r + 3, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${rgb}, ${nearFactor * 0.6})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="neural-background-container">
      <canvas ref={canvasRef} className="neural-canvas" aria-hidden="true" />
    </div>
  );
}
