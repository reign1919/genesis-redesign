import React, { useEffect, useRef, memo } from 'react';
import './ProceduralEventVisual.css';

/**
 * Procedural Graphic Generator Component.
 * Features 10 unique, high-performance canvas signal play designs.
 * Apex Flagship 48HR HACKATHON gets the Neural Quantum Reactor Core.
 */
const ProceduralEventVisual = ({ visualType = 'NEURAL_QUANTUM_CORE', eventTitle = '' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    // Helper: Resize Canvas for High-DPI screens
    const resizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle storage for complex visuals
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.003,
      vy: (Math.random() - 0.5) * 0.003,
      size: Math.random() * 3 + 1,
      alpha: Math.random() * 0.8 + 0.2,
    }));

    // Matrix hex rain storage
    const hexColumns = Array.from({ length: 24 }, () => ({
      y: Math.random() * 200,
      speed: Math.random() * 2 + 1,
      chars: Array.from({ length: 12 }, () => Math.floor(Math.random() * 16).toString(16).toUpperCase()),
    }));

    // Sorting algorithm array heights
    const sortBars = Array.from({ length: 28 }, (_, i) => Math.sin(i * 0.3) * 40 + 50);

    // Main Render Loop
    const render = () => {
      time += 0.025;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Background Gradient Fill
      const bgGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(w, h));
      bgGrad.addColorStop(0, '#161717');
      bgGrad.addColorStop(1, '#080808');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Background Subtle Tech Grid
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      const step = 32;
      for (let x = 0; x < w; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // ─────────────────────────────────────────────────────────────
      // 1. NEURAL_QUANTUM_CORE (48HR HACKATHON — THE APEX DESIGN)
      // ─────────────────────────────────────────────────────────────
      if (visualType === 'NEURAL_QUANTUM_CORE') {
        // Outer Glowing Reactor Rings
        for (let i = 1; i <= 4; i++) {
          const r = Math.min(w, h) * 0.12 * i;
          const speed = (i % 2 === 0 ? 1 : -1) * 0.4;
          const angle = time * speed;

          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(angle);

          ctx.lineWidth = i === 2 ? 2.5 : 1;
          ctx.strokeStyle = i === 2 ? '#FD625F' : 'rgba(172, 50, 46, 0.4)';
          ctx.shadowColor = '#FD625F';
          ctx.shadowBlur = i === 2 ? 16 : 4;

          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 1.6);
          ctx.stroke();

          // Orbital nodes on ring
          const nodeX = Math.cos(angle) * r;
          const nodeY = Math.sin(angle) * r;
          ctx.fillStyle = '#FD625F';
          ctx.beginPath();
          ctx.arc(nodeX, nodeY, 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }

        // 3D Projected Neural Node Lattice (12 Nodes connected with energy threads)
        const nodeCount = 12;
        const nodePos = [];
        for (let i = 0; i < nodeCount; i++) {
          const a = (i * Math.PI * 2) / nodeCount + time * 0.3;
          const dist = (Math.min(w, h) * 0.22) + Math.sin(time * 1.5 + i) * 15;
          nodePos.push({
            x: cx + Math.cos(a) * dist,
            y: cy + Math.sin(a) * dist,
          });
        }

        // Connect Neural Threads
        ctx.lineWidth = 1;
        ctx.shadowColor = '#FD625F';
        ctx.shadowBlur = 8;
        for (let i = 0; i < nodeCount; i++) {
          for (let j = i + 1; j < nodeCount; j++) {
            const dx = nodePos[i].x - nodePos[j].x;
            const dy = nodePos[i].y - nodePos[j].y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 140) {
              const alpha = (1 - d / 140) * 0.7;
              ctx.strokeStyle = `rgba(253, 98, 95, ${alpha})`;
              ctx.beginPath();
              ctx.moveTo(nodePos[i].x, nodePos[i].y);
              ctx.lineTo(nodePos[j].x, nodePos[j].y);
              ctx.stroke();
            }
          }
        }

        // Quantum Flame Particle Core
        particles.forEach((p, idx) => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > 1) p.vx *= -1;
          if (p.y < 0 || p.y > 1) p.vy *= -1;

          const px = p.x * w;
          const py = p.y * h;
          const distToCenter = Math.hypot(px - cx, py - cy);

          if (distToCenter < 120) {
            ctx.fillStyle = idx % 2 === 0 ? '#FD625F' : '#AC322E';
            ctx.shadowColor = '#FD625F';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(px, py, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // Pulsing Center Core Plasma
        const coreR = 18 + Math.sin(time * 3) * 4;
        const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 2);
        coreGrad.addColorStop(0, '#FFFFFF');
        coreGrad.addColorStop(0.4, '#FD625F');
        coreGrad.addColorStop(1, 'rgba(172, 50, 46, 0)');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, coreR * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // ─────────────────────────────────────────────────────────────
      // 2. GAME_ENGINE_VIEWPORT (BUILDATHON)
      // ─────────────────────────────────────────────────────────────
      else if (visualType === 'GAME_ENGINE_VIEWPORT') {
        // Rotating Isometric Wireframe Cube
        ctx.save();
        ctx.translate(cx, cy);

        const size = Math.min(w, h) * 0.22;
        const rotX = time * 0.5;
        const rotY = time * 0.7;

        // 8 Cube Vertices
        const vertices = [
          [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
          [-1, -1, 1],  [1, -1, 1],  [1, 1, 1],  [-1, 1, 1],
        ].map(([vx, vy, vz]) => {
          // Rotate Y
          let x1 = vx * Math.cos(rotY) - vz * Math.sin(rotY);
          let z1 = vx * Math.sin(rotY) + vz * Math.cos(rotY);
          // Rotate X
          let y2 = vy * Math.cos(rotX) - z1 * Math.sin(rotX);
          let z2 = vy * Math.sin(rotX) + z1 * Math.cos(rotX);
          return {
            x: x1 * size,
            y: y2 * size,
          };
        });

        const edges = [
          [0,1],[1,2],[2,3],[3,0],
          [4,5],[5,6],[6,7],[7,4],
          [0,4],[1,5],[2,6],[3,7]
        ];

        ctx.strokeStyle = '#FD625F';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#FD625F';
        ctx.shadowBlur = 10;

        edges.forEach(([i, j]) => {
          ctx.beginPath();
          ctx.moveTo(vertices[i].x, vertices[i].y);
          ctx.lineTo(vertices[j].x, vertices[j].y);
          ctx.stroke();
        });

        ctx.restore();

        // Bouncing Platform Particles
        particles.slice(0, 16).forEach((p, idx) => {
          const px = (p.x * 0.6 + 0.2) * w;
          const py = cy + Math.sin(time * 2 + idx) * 40;
          ctx.fillStyle = '#AC322E';
          ctx.fillRect(px, py, 4, 4);
        });
      }

      // ─────────────────────────────────────────────────────────────
      // 3. CYBER_ATTACK_MATRIX (ZERO DAY)
      // ─────────────────────────────────────────────────────────────
      else if (visualType === 'CYBER_ATTACK_MATRIX') {
        // Hexadecimal Code Waterfall
        ctx.font = '12px monospace';
        hexColumns.forEach((col, idx) => {
          const colX = (idx / hexColumns.length) * w + 10;
          col.y += col.speed;
          if (col.y > h + 100) col.y = -50;

          col.chars.forEach((char, charIdx) => {
            const charY = col.y - charIdx * 16;
            if (charY > 0 && charY < h) {
              const opacity = 1 - charIdx / col.chars.length;
              ctx.fillStyle = charIdx === 0 ? '#FFFFFF' : `rgba(253, 98, 95, ${opacity})`;
              ctx.fillText(char, colX, charY);
            }
          });
        });

        // Targeting Radar Reticle
        ctx.strokeStyle = 'rgba(253, 98, 95, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, Math.min(w, h) * 0.25, 0, Math.PI * 2);
        ctx.stroke();

        // Radar Scan Needle
        const scanAngle = time * 1.5;
        ctx.strokeStyle = '#FD625F';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#FD625F';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(scanAngle) * (Math.min(w, h) * 0.25), cy + Math.sin(scanAngle) * (Math.min(w, h) * 0.25));
        ctx.stroke();
      }

      // ─────────────────────────────────────────────────────────────
      // 4. ROBOTIC_ARENA_TELEMETRY (OVERCLOCKED)
      // ─────────────────────────────────────────────────────────────
      else if (visualType === 'ROBOTIC_ARENA_TELEMETRY') {
        // Arena Circular Sawblade Gears
        const r = Math.min(w, h) * 0.24;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(time * 0.8);

        ctx.strokeStyle = '#FD625F';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#FD625F';
        ctx.shadowBlur = 8;

        const teeth = 16;
        ctx.beginPath();
        for (let i = 0; i < teeth; i++) {
          const a1 = (i * Math.PI * 2) / teeth;
          const a2 = a1 + Math.PI / teeth / 2;
          const outerR = r + (i % 2 === 0 ? 10 : 0);
          ctx.lineTo(Math.cos(a1) * outerR, Math.sin(a1) * outerR);
          ctx.lineTo(Math.cos(a2) * r, Math.sin(a2) * r);
        }
        ctx.closePath();
        ctx.stroke();

        ctx.restore();

        // Spark Bursts from Collision Point
        for (let i = 0; i < 8; i++) {
          const sparkAngle = Math.random() * Math.PI * 2;
          const sparkDist = r * (0.8 + Math.random() * 0.4);
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = '#FD625F';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(sparkAngle) * sparkDist, cy + Math.sin(sparkAngle) * sparkDist, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ─────────────────────────────────────────────────────────────
      // 5. ALGORITHMIC_SORT_WAVE (CODE CLASH)
      // ─────────────────────────────────────────────────────────────
      else if (visualType === 'ALGORITHMIC_SORT_WAVE') {
        // Sorting Bars Animation
        const barWidth = (w * 0.7) / sortBars.length;
        const startX = cx - (sortBars.length * barWidth) / 2;

        sortBars.forEach((val, i) => {
          const dynamicH = (val + Math.sin(time * 2 + i * 0.4) * 20) * (h * 0.0035);
          const bx = startX + i * barWidth;
          const by = cy + (h * 0.2) - dynamicH;

          const isSwapping = Math.floor(time * 5) % sortBars.length === i;
          ctx.fillStyle = isSwapping ? '#FFFFFF' : i % 2 === 0 ? '#FD625F' : '#AC322E';
          ctx.shadowColor = isSwapping ? '#FFFFFF' : '#FD625F';
          ctx.shadowBlur = isSwapping ? 14 : 4;

          ctx.fillRect(bx + 2, by, barWidth - 4, dynamicH);
        });
      }

      // ─────────────────────────────────────────────────────────────
      // 6. SPECTRUM_DEBATE_RESONATOR (MERGE CONFLICT)
      // ─────────────────────────────────────────────────────────────
      else if (visualType === 'SPECTRUM_DEBATE_RESONATOR') {
        // Dual Opposing Waveforms (FOR vs AGAINST)
        ctx.lineWidth = 2.5;

        // Wave FOR (Bright Red)
        ctx.strokeStyle = '#FD625F';
        ctx.shadowColor = '#FD625F';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        for (let x = 0; x < w; x += 4) {
          const y = cy + Math.sin(x * 0.03 + time * 2) * 30 * Math.cos(x * 0.01);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Wave AGAINST (Oxblood Red)
        ctx.strokeStyle = '#AC322E';
        ctx.shadowColor = '#AC322E';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        for (let x = 0; x < w; x += 4) {
          const y = cy + Math.cos(x * 0.025 - time * 1.8) * 35 * Math.sin(x * 0.015);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // ─────────────────────────────────────────────────────────────
      // 7. CINEMATIC_PROJECTION_BEAM (CINE TANK)
      // ─────────────────────────────────────────────────────────────
      else if (visualType === 'CINEMATIC_PROJECTION_BEAM') {
        // Projector Light Beam Cone
        const beamGrad = ctx.createLinearGradient(0, cy, w, cy);
        beamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        beamGrad.addColorStop(1, 'rgba(253, 98, 95, 0.02)');

        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(30, cy);
        ctx.lineTo(w - 20, cy - h * 0.35);
        ctx.lineTo(w - 20, cy + h * 0.35);
        ctx.closePath();
        ctx.fill();

        // 35mm Film Sprocket Strip
        ctx.fillStyle = '#FD625F';
        for (let x = 40; x < w - 40; x += 28) {
          const sprocY = cy + Math.sin((x + time * 100) * 0.02) * 15;
          ctx.fillRect(x, sprocY - 4, 12, 8);
        }
      }

      // ─────────────────────────────────────────────────────────────
      // 8. VECTOR_CANVAS_GRID (PIXEL PRIX)
      // ─────────────────────────────────────────────────────────────
      else if (visualType === 'VECTOR_CANVAS_GRID') {
        // Dynamic Spline Pen Stroke
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#FD625F';
        ctx.shadowColor = '#FD625F';
        ctx.shadowBlur = 12;

        ctx.beginPath();
        const strokePoints = 6;
        for (let i = 0; i <= strokePoints; i++) {
          const px = (i / strokePoints) * (w * 0.6) + (w * 0.2);
          const py = cy + Math.sin(time * 2 + i) * 35;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Comic 4-Panel Grid Outline
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.strokeRect(cx - 100, cy - 70, 95, 65);
        ctx.strokeRect(cx + 5, cy - 70, 95, 65);
        ctx.strokeRect(cx - 100, cy + 5, 95, 65);
        ctx.strokeRect(cx + 5, cy + 5, 95, 65);
      }

      // ─────────────────────────────────────────────────────────────
      // 9. VERTICAL_REEL_WAVEFORM (REEL DEAL)
      // ─────────────────────────────────────────────────────────────
      else if (visualType === 'VERTICAL_REEL_WAVEFORM') {
        // 9:16 Viewfinder Frame Outline
        const frameH = h * 0.75;
        const frameW = frameH * (9 / 16);
        ctx.strokeStyle = '#FD625F';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = '#FD625F';
        ctx.shadowBlur = 8;
        ctx.strokeRect(cx - frameW / 2, cy - frameH / 2, frameW, frameH);

        // Recording REC Dot Pulse
        const recAlpha = Math.abs(Math.sin(time * 3));
        ctx.fillStyle = `rgba(253, 98, 95, ${recAlpha})`;
        ctx.beginPath();
        ctx.arc(cx - frameW / 2 + 16, cy - frameH / 2 + 16, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // ─────────────────────────────────────────────────────────────
      // 10. APERTURE_SHUTTER_SCOPE (FOCAL POINT)
      // ─────────────────────────────────────────────────────────────
      else if (visualType === 'APERTURE_SHUTTER_SCOPE') {
        // Camera Aperture Blades Diaphragm
        const apertureR = Math.min(w, h) * 0.22;
        const blades = 6;
        const openFactor = 0.5 + Math.sin(time * 1.5) * 0.3;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.strokeStyle = '#FD625F';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#FD625F';
        ctx.shadowBlur = 10;

        for (let i = 0; i < blades; i++) {
          const a = (i * Math.PI * 2) / blades;
          ctx.save();
          ctx.rotate(a);
          ctx.beginPath();
          ctx.moveTo(apertureR * openFactor, 0);
          ctx.lineTo(apertureR, apertureR * 0.5);
          ctx.stroke();
          ctx.restore();
        }
        ctx.restore();
      }

      // Corner Reticle Frame
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      const margin = 16;
      const len = 18;

      ctx.beginPath();
      ctx.moveTo(margin, margin + len);
      ctx.lineTo(margin, margin);
      ctx.lineTo(margin + len, margin);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(w - margin, h - margin - len);
      ctx.lineTo(w - margin, h - margin);
      ctx.lineTo(w - margin - len, h - margin);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [visualType]);

  return (
    <div className="procedural-visual-container">
      <canvas ref={canvasRef} className="procedural-canvas" />
      <div className="visual-overlay-tag">
        <span className="visual-signal-status">LIVE SIGNAL GENERATOR</span>
        <span className="visual-event-code">GENESIS // {eventTitle}</span>
      </div>
    </div>
  );
};

export default memo(ProceduralEventVisual);
