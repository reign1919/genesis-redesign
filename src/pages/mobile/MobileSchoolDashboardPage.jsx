import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loadSchoolCredentials } from '../../lib/edgeFunctions';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/authContext';
import LoadingScreen from '../../components/LoadingScreen';
import MobileBackground from '../../components/mobile/MobileBackground';
import MobileHamburger from '../../components/mobile/MobileHamburger';
import './MobileSchoolDashboardPage.css';

export default function MobileSchoolDashboardPage() {
  const navigate = useNavigate();
  const { login, logout } = useAuth();
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (!active) return;
      if (sessionError || !data?.session) {
        navigate('/login', { replace: true });
        return;
      }

      const result = await loadSchoolCredentials();
      if (!active) return;
      if (result.code === 'AUTH_REQUIRED' || result.code === 'AUTH_INVALID' || result.code === 'FORBIDDEN') {
        logout();
        await supabase.auth.signOut({ scope: 'local' });
        navigate('/login', { replace: true });
        return;
      }
      if (!result.ok || !result.school || result.school.status !== 'approved') {
        setError('The dashboard is temporarily unavailable. Please try again later.');
        setLoading(false);
        return;
      }

      login({ schoolCode: result.school.school_code, schoolName: result.school.school_name });
      setSchool(result.school);
      setLoading(false);
    };

    loadDashboard();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active && !nextSession) navigate('/login', { replace: true });
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [navigate, login, logout]);

  const handleLogout = async () => {
    logout();
    await supabase.auth.signOut({ scope: 'local' });
    navigate('/login', { replace: true });
  };

  const copyCredential = async (label, value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(''), 1500);
    } catch {
      setCopied('');
    }
  };

  return (
    <div className="mdash-wrapper">
      <MobileBackground />
      <div className="m-grid-overlay" aria-hidden="true" />
      <MobileHamburger />

      <main className="mdash-content">
        <div className="mdash-header">
          <Link to="/" className="mdash-back label-caps">← Return to Base</Link>
          <div className="mdash-title-row">
            <div>
              <p className="mdash-eyebrow label-caps">Approved School Access</p>
              <h1 className="mdash-title">Dashboard</h1>
            </div>
            <button className="mdash-logout" onClick={handleLogout}>Log out</button>
          </div>
          <p className="mdash-subtitle">
            Credentials issued by the Genesis core committee. Keep them private and share them only with authorized school representatives.
          </p>
        </div>

        {loading ? (
          <div className="mdash-loading">
            <LoadingScreen />
          </div>
        ) : error ? (
          <div className="mdash-error" role="alert">{error}</div>
        ) : school ? (
          <div className="mdash-card">
            <div className="mdash-card-header">
              <span className="label-caps">Registered Institution</span>
              <h2>{school.school_name}</h2>
              <span className="mdash-badge">APPROVED</span>
            </div>

            <div className="mdash-creds">
              <div className="mdash-cred-item">
                <span className="label-caps mdash-cred-label">School Code</span>
                <div className="mdash-val-row">
                  <strong>{school.school_code}</strong>
                  <button onClick={() => copyCredential('code', school.school_code)}>
                    {copied === 'code' ? 'COPIED' : 'COPY'}
                  </button>
                </div>
              </div>

              <div className="mdash-cred-item">
                <span className="label-caps mdash-cred-label">Password</span>
                <div className="mdash-val-row">
                  <strong>{passwordVisible ? school.password : '••••••••'}</strong>
                  <div className="mdash-actions">
                    <button onClick={() => setPasswordVisible(v => !v)}>
                      {passwordVisible ? 'HIDE' : 'REVEAL'}
                    </button>
                    <button onClick={() => copyCredential('password', school.password)}>
                      {copied === 'password' ? 'COPIED' : 'COPY'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mdash-footer label-caps">
              Event registration and participant forms are coming soon.
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
