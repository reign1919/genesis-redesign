import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MobileBackground from '../../components/mobile/MobileBackground';
import MobileHamburger from '../../components/mobile/MobileHamburger';
import SEO from '../../components/SEO';
import { signInSchool } from '../../lib/auth';
import { loadSchoolCredentials } from '../../lib/edgeFunctions';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/authContext';
import './MobileLoginPage.css';

const MobileLoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState('login');
  const [schoolCode, setSchoolCode] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formResult, setFormResult] = useState(null);

  // Redirect if already logged in
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active || !data?.session) return;
      const result = await loadSchoolCredentials();
      if (active && result.ok) navigate('/dashboard', { replace: true });
    });
    return () => { active = false; };
  }, [navigate]);

  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'register' : 'login');
    setFormResult(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormResult(null);

    if (mode === 'register') {
      return;
    }

    setSubmitting(true);
    const result = await signInSchool(schoolCode, password);
    setSubmitting(false);
    setPassword('');
    if (!result.ok) {
      console.error('[Mobile Login Failed]', result);
      setFormResult({ ok: false, message: 'Invalid school code or password.' });
      return;
    }
    navigate('/dashboard');
  };

  return (
    <div className="ml-wrapper">
      <SEO
        title="School Portal Login — Genesis 2026"
        description="School portal login and registration for Genesis 2026."
        canonical="/login"
        noindex={true}
      />
      <MobileBackground />
      <div className="m-grid-overlay" aria-hidden="true" />
      <MobileHamburger />

      <main className="ml-content">
        {/* Back */}
        <Link to="/" className="ml-back label-caps">← Return to Base</Link>

        {/* Brand */}
        <div className="ml-brand">
          <span className="ml-brand-eyebrow label-caps">Indus Valley World School</span>
          <h1 className="ml-brand-title">GENESIS</h1>
          <div className="ml-brand-divider" />
          <p className="ml-brand-tag">
            <span className="ml-tag-code">git commit -m </span>
            <em>"innovate, ideate, inspire"</em>
          </p>
        </div>

        {/* Mode toggle tabs */}
        <div className="ml-tabs">
          <button
            className={`ml-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { if (mode !== 'login') toggleMode(); }}
          >
            LOGIN
          </button>
          <button
            className={`ml-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { if (mode !== 'register') toggleMode(); }}
          >
            REGISTER
          </button>
        </div>

        {/* Divider */}
        <div className="ml-form-divider" />

        {/* Form */}
        <form className="ml-form" onSubmit={handleSubmit}>
          {mode === 'login' ? (
            <div className="ml-fields" key="login">
              {/* Info notice */}
              <div className="ml-notice">
                <span className="ml-notice-icon">⊠</span>
                <span>
                  School registration is closed.{' '}
                  <button type="button" className="ml-notice-link" onClick={toggleMode}>
                    View notice.
                  </button>
                </span>
              </div>

              <div className="ml-field">
                <label className="ml-label label-caps" htmlFor="ml-code">School Code</label>
                <input
                  id="ml-code"
                  className="ml-input"
                  type="text"
                  placeholder="e.g. GEN-0001"
                  value={schoolCode}
                  onChange={(e) => setSchoolCode(e.target.value)}
                  autoComplete="username"
                  maxLength={8}
                  pattern="GEN-[0-9]{4}"
                  required
                />
              </div>

              <div className="ml-field">
                <label className="ml-label label-caps" htmlFor="ml-pass">Password</label>
                <input
                  id="ml-pass"
                  className="ml-input"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  minLength={8}
                  maxLength={64}
                  required
                />
              </div>

              <button type="submit" className="ml-submit" disabled={submitting}>
                <span>{submitting ? 'AUTHENTICATING...' : 'ENTER'}</span>
                <span className="ml-submit-arrow">→</span>
              </button>
            </div>
          ) : (
            <div className="ml-fields" key="register">
              <div className="ml-closed-card">
                <div className="ml-closed-eyebrow label-caps">// NOTICE: ACCESS RESTRICTED</div>
                <h2 className="ml-closed-title">REGISTRATION CLOSED</h2>
                <p className="ml-closed-text">
                  Registration for Genesis &apos;26 has closed, see you in &apos;27!
                </p>
                <p className="ml-closed-contact">
                  Contact{' '}
                  <a href="mailto:thegenesiscouncil@ivws.org" className="ml-contact-email">
                    thegenesiscouncil@ivws.org
                  </a>{' '}
                  for any discrepancies.
                </p>
                <div className="ml-closed-action">
                  <button type="button" className="ml-return-btn" onClick={toggleMode}>
                    <span>Already registered? Return to Login</span>
                    <span className="ml-return-arrow">→</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {formResult && (
            <div className={`ml-message ${formResult.ok ? 'ml-message--ok' : 'ml-message--err'}`} role={formResult.ok ? 'status' : 'alert'}>
              {formResult.message}
            </div>
          )}
        </form>
      </main>
    </div>
  );
};

export default MobileLoginPage;
