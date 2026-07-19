import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SecurePage from '../components/SecurePage';
import { loadSchoolCredentials } from '../lib/edgeFunctions';
import { supabase } from '../lib/supabase';
import './SchoolDashboardPage.css';

export default function SchoolDashboardPage() {
  const navigate = useNavigate();
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
        await supabase.auth.signOut({ scope: 'local' });
        navigate('/login', { replace: true });
        return;
      }
      if (!result.ok || !result.school || result.school.status !== 'approved') {
        setError('The dashboard is temporarily unavailable. Please try again later.');
        setLoading(false);
        return;
      }

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
  }, [navigate]);

  const handleLogout = async () => {
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
    <SecurePage
      eyebrow="Approved School Access"
      title="School Dashboard"
      subtitle="Credentials issued by the Genesis core committee. Keep them private and share them only with authorized school representatives."
      action={<button type="button" className="secure-action" onClick={handleLogout}>Log out</button>}
    >
      {loading ? (
        <div className="secure-card secure-status">Verifying school session…</div>
      ) : error ? (
        <div className="secure-card secure-status secure-status--error" role="alert">{error}</div>
      ) : school ? (
        <section className="school-credentials secure-card">
          <div className="school-credentials__intro">
            <p className="label-caps">Registered Institution</p>
            <h2>{school.school_name}</h2>
            <span className="school-credentials__badge">APPROVED</span>
          </div>
          <div className="school-credentials__grid">
            <div className="school-credentials__item">
              <span className="label-caps">School Code</span>
              <strong>{school.school_code}</strong>
              <button type="button" onClick={() => copyCredential('code', school.school_code)}>
                {copied === 'code' ? 'Copied' : 'Copy code'}
              </button>
            </div>
            <div className="school-credentials__item">
              <span className="label-caps">Password</span>
              <strong>{passwordVisible ? school.password : '••••••••'}</strong>
              <div className="school-credentials__actions">
                <button type="button" onClick={() => setPasswordVisible(value => !value)}>
                  {passwordVisible ? 'Hide' : 'Reveal'}
                </button>
                <button type="button" onClick={() => copyCredential('password', school.password)}>
                  {copied === 'password' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
          <p className="school-credentials__note label-caps">Event registration and participant forms are coming soon.</p>
        </section>
      ) : null}
    </SecurePage>
  );
}
