import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MobileBackground from '../../components/mobile/MobileBackground';
import MobileHamburger from '../../components/mobile/MobileHamburger';
import { signInSchool } from '../../lib/auth';
import { loadSchoolCredentials, submitRegistration } from '../../lib/edgeFunctions';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/authContext';
import './MobileLoginPage.css';

const enrollmentEnabled = import.meta.env.VITE_ENROLLMENT_ENABLED !== 'false';

function registrationMessage(result) {
  const messages = {
    INVALID_SCHOOL_NAME: 'Enter a school name between 2 and 120 characters.',
    INVALID_PHONE: 'Use international phone format, such as +919876543210.',
    ALREADY_PENDING: 'Your school registration is already awaiting review.',
    ALREADY_APPROVED: 'Your school is already approved.',
    REGISTRATION_REJECTED: 'Your school registration was not approved.',
    RATE_LIMITED: 'Too many attempts. Try again later.',
    ENROLLMENT_CLOSED: 'School enrollment is temporarily closed.',
  };
  return messages[result.code] || 'Registration is temporarily unavailable.';
}

const MobileLoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState('login');
  const [schoolCode, setSchoolCode] = useState('');
  const [password, setPassword] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [teacherWhatsapp, setTeacherWhatsapp] = useState('');
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
    setSubmitting(true);

    if (mode === 'register') {
      const result = await submitRegistration({ schoolName, teacherWhatsapp });
      setSubmitting(false);
      if (!result.ok) {
        setFormResult({ ok: false, message: registrationMessage(result) });
        return;
      }
      setSchoolName('');
      setTeacherWhatsapp('');
      setFormResult({ ok: true, message: 'Application received. The core committee will contact approved schools on WhatsApp.' });
      return;
    }

    const result = await signInSchool(schoolCode, password);
    setSubmitting(false);
    setPassword('');
    if (!result.ok) {
      setFormResult({ ok: false, message: 'Invalid school code or password.' });
      return;
    }
    navigate('/dashboard');
  };

  return (
    <div className="ml-wrapper">
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
                  No credentials yet?{' '}
                  <button type="button" className="ml-notice-link" onClick={toggleMode}>
                    Register first.
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
                  maxLength={8}
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
              <div className="ml-field">
                <label className="ml-label label-caps" htmlFor="ml-sname">School Name</label>
                <input
                  id="ml-sname"
                  className="ml-input"
                  type="text"
                  placeholder="Full name of your institution"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  autoComplete="organization"
                  minLength={2}
                  maxLength={120}
                  required
                />
              </div>

              <div className="ml-field">
                <label className="ml-label label-caps" htmlFor="ml-wa">WhatsApp — Teacher-in-Charge</label>
                <input
                  id="ml-wa"
                  className="ml-input"
                  type="tel"
                  placeholder="+919876543210"
                  value={teacherWhatsapp}
                  onChange={(e) => setTeacherWhatsapp(e.target.value)}
                  autoComplete="tel"
                  maxLength={64}
                  required
                />
              </div>

              <button type="submit" className="ml-submit" disabled={submitting || !enrollmentEnabled}>
                <span>{submitting ? 'SUBMITTING...' : enrollmentEnabled ? 'REGISTER' : 'ENROLLMENT CLOSED'}</span>
                <span className="ml-submit-arrow">→</span>
              </button>
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
