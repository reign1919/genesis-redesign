import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LoginPage.css';
import NeuralBackground from '../components/NeuralBackground';
import CompassSVG from '../components/CompassSVG';

const LoginPage = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [needleRotation, setNeedleRotation] = useState(0); // 0 = login (up), 180 = register (down)
  const [mousePos, setMousePos] = useState({ x: '50%', y: '50%' });
  const [authStatus, setAuthStatus] = useState(0);

  // Count-up on mount
  useEffect(() => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 8;
      if (progress >= 100) { progress = 100; clearInterval(interval); }
      setAuthStatus(progress);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e) => {
    setMousePos({ x: `${e.clientX}px`, y: `${e.clientY}px` });
  };

  const toggleMode = () => {
    const next = mode === 'login' ? 'register' : 'login';
    setMode(next);
    setNeedleRotation(prev => prev + 180);
  };

  return (
    <div
      className="login-wrapper"
      onMouseMove={handleMouseMove}
      style={{ '--mouse-x': mousePos.x, '--mouse-y': mousePos.y }}
    >
      {/* Background layer */}
      <div className="login-background">
        <NeuralBackground />
      </div>

      {/* Overlays */}
      <div className="noise-overlay" />
      <div className="grid-overlay" />
      <div className="mouse-blur-overlay" />

      {/* HUD corner brackets */}
      <div className="hud-brackets">
        <div className="bracket top-left" />
        <div className="bracket top-right" />
        <div className="bracket bottom-left" />
        <div className="bracket bottom-right" />
      </div>

      {/* Fixed header */}
      <header className="tech-header">
        <div className="header-left">GENESIS TECH FEST</div>
        <div className="header-right">INDUS VALLEY WORLD SCHOOL</div>
      </header>

      {/* HUD data accents */}
      <div className="data-accent left-accent">AUTH.GATE // {authStatus}%</div>
      <div className="data-accent right-accent">SECURE.CONN //<br />ENCRYPTED</div>

      {/* ── MAIN CONTENT ── */}
      <main className="login-container">

        {/* ── LEFT PANEL: Brand glass panel ── */}
        <div className="login-brand-panel">
          <div className="brand-inner">
            {/* Compass decorative background */}
            <div className="brand-compass-bg">
              <CompassSVG size={320} color="rgba(172,50,46,0.18)" />
            </div>

            {/* Brand text */}
            <div className="brand-eyebrow label-caps">Indus Valley World School</div>
            <h1 className="brand-wordmark">GENESIS</h1>
            <div className="brand-divider" />
            <p className="brand-tagline">
              <span className="brand-tagline-code">git commit -m </span>
              <em>"innovate, ideate, inspire"</em>
            </p>
            <div className="brand-year-tag label-caps">Tech Fest — 2025</div>
          </div>

          {/* Grid crosshair */}
          <div className="brand-crosshair h" />
          <div className="brand-crosshair v" />
        </div>

        {/* ── RIGHT PANEL: Mode toggle + Form ── */}
        <div className="login-form-panel">

          {/* Mode labels + Compass Toggle */}
          <div className="mode-toggle-block">
            <button
              className={`mode-label mode-label--login${mode === 'login' ? ' active' : ''}`}
              onClick={() => { if (mode !== 'login') toggleMode(); }}
              aria-pressed={mode === 'login'}
            >
              LOGIN
            </button>

            {/* Compass needle as the toggle */}
            <button
              className="compass-toggle-btn"
              onClick={toggleMode}
              aria-label={`Switch to ${mode === 'login' ? 'register' : 'login'}`}
            >
              <div
                className="compass-needle-wrapper"
                style={{ transform: `rotate(${needleRotation}deg)` }}
              >
                {/* SVG compass needle – custom, sharp diamond */}
                <svg
                  viewBox="0 0 60 120"
                  className="compass-needle-svg"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Outer ring */}
                  <circle cx="30" cy="60" r="28" stroke="rgba(172,50,46,0.5)" strokeWidth="1" fill="none" />
                  {/* Tick marks */}
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
                    const rad = (deg * Math.PI) / 180;
                    const x1 = 30 + 24 * Math.sin(rad);
                    const y1 = 60 - 24 * Math.cos(rad);
                    const x2 = 30 + 27 * Math.sin(rad);
                    const y2 = 60 - 27 * Math.cos(rad);
                    return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(172,50,46,0.4)" strokeWidth="1" />;
                  })}
                  {/* North needle — oxblood */}
                  <polygon
                    points="30,10 34,55 30,62 26,55"
                    fill="var(--accent)"
                    opacity="0.95"
                  />
                  {/* South needle — muted */}
                  <polygon
                    points="30,110 34,65 30,62 26,65"
                    fill="rgba(255,255,255,0.15)"
                    opacity="0.8"
                  />
                  {/* Center hub */}
                  <circle cx="30" cy="60" r="4" fill="var(--accent-bright)" />
                  <circle cx="30" cy="60" r="2" fill="var(--bg)" />
                </svg>
              </div>
            </button>

            <button
              className={`mode-label mode-label--register${mode === 'register' ? ' active' : ''}`}
              onClick={() => { if (mode !== 'register') toggleMode(); }}
              aria-pressed={mode === 'register'}
            >
              REGISTER
            </button>
          </div>

          {/* Divider */}
          <div className="form-divider" />

          {/* ── FORM ── */}
          <form
            className="login-form"
            onSubmit={(e) => e.preventDefault()}
            noValidate
          >
            {mode === 'login' ? (
              /* ── LOGIN FIELDS ── */
              <div className="fields-group" key="login">
                {/* Info notice */}
                <div className="auth-notice">
                  <span className="notice-icon">⊠</span>
                  <span>
                    No school credentials yet?{' '}
                    <button
                      type="button"
                      className="notice-link"
                      onClick={() => { setMode('register'); setNeedleRotation(prev => prev + 180); }}
                    >
                      Register your school first.
                    </button>
                  </span>
                </div>

                <div className="field-row">
                  <label className="field-label label-caps" htmlFor="school-code">
                    School Code
                  </label>
                  <input
                    id="school-code"
                    className="field-input"
                    type="text"
                    placeholder="e.g. IVWS-2025"
                    autoComplete="username"
                  />
                </div>

                <div className="field-row">
                  <label className="field-label label-caps" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    className="field-input"
                    type="password"
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                  />
                </div>

                <button type="submit" className="submit-btn" id="login-submit">
                  <span>ENTER</span>
                  <span className="submit-arrow">→</span>
                </button>
              </div>
            ) : (
              /* ── REGISTER FIELDS ── */
              <div className="fields-group" key="register">
                <div className="field-row">
                  <label className="field-label label-caps" htmlFor="school-name">
                    School Name
                  </label>
                  <input
                    id="school-name"
                    className="field-input"
                    type="text"
                    placeholder="Full name of your institution"
                    autoComplete="organization"
                  />
                </div>

                <div className="field-row">
                  <label className="field-label label-caps" htmlFor="teacher-whatsapp">
                    WhatsApp No. — Teacher-in-Charge
                  </label>
                  <input
                    id="teacher-whatsapp"
                    className="field-input"
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    autoComplete="tel"
                  />
                </div>

                <button type="submit" className="submit-btn" id="register-submit">
                  <span>REGISTER</span>
                  <span className="submit-arrow">→</span>
                </button>
              </div>
            )}
          </form>

          {/* Back to home */}
          <div className="back-link-row">
            <Link to="/" className="back-link label-caps">
              ← Return to Base
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
