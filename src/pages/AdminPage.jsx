import { useCallback, useEffect, useMemo, useState } from 'react';
import SecurePage from '../components/SecurePage';
import {
  listAdminRegistrations,
  updateAdminRegistration,
} from '../lib/edgeFunctions';
import { supabase } from '../lib/supabase';
import './AdminPage.css';

function AdminDashboard({ admin, onLogout }) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState(() => new Set());
  const [approvalNotice, setApprovalNotice] = useState(null);
  const [copied, setCopied] = useState('');

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    setError('');
    const result = await listAdminRegistrations();
    setLoading(false);

    if (!result.ok) {
      if (result.code === 'FORBIDDEN') {
        await onLogout('forbidden');
        return;
      }
      if (result.code === 'AUTH_REQUIRED' || result.code === 'AUTH_INVALID') {
        await onLogout('invalid-session');
        return;
      }
      setError('Registrations could not be loaded. Try again later.');
      return;
    }

    setRegistrations(Array.isArray(result.registrations) ? result.registrations : []);
  }, [onLogout]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const handleTransition = async (id, status) => {
    setActionLoading(id);
    setError('');
    setApprovalNotice(null);
    const result = await updateAdminRegistration(id, status);
    setActionLoading(null);

    if (!result.ok) {
      if (result.code === 'FORBIDDEN') {
        await onLogout('forbidden');
        return;
      }
      if (result.code === 'AUTH_REQUIRED' || result.code === 'AUTH_INVALID') {
        await onLogout('invalid-session');
        return;
      }
      setError(result.code === 'INVALID_TRANSITION'
        ? 'That registration is no longer pending.'
        : result.code === 'PROVISIONING_FAILED' && result.stage
          ? `Approval failed during ${result.stage.replaceAll('_', ' ')}.${result.detail ? ` ${result.detail}` : ''}`
          : 'The status could not be updated. Try again later.');
      return;
    }

    if (status === 'approved' && result.registration && result.whatsappMessage) {
      setApprovalNotice({
        schoolName: result.registration.school_name,
        teacherWhatsapp: result.registration.teacher_whatsapp,
        message: result.whatsappMessage,
      });
    }
    await fetchRegistrations();
  };

  const copyText = async (label, value) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(''), 1500);
    } catch {
      setCopied('');
    }
  };

  const openWhatsapp = (phone, message) => {
    const number = phone.replace(/[^0-9]/gu, '');
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  const togglePassword = (id) => {
    setVisiblePasswords(current => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => filter === 'all'
    ? registrations
    : registrations.filter(registration => registration.status === filter), [filter, registrations]);

  const counts = useMemo(() => ({
    all: registrations.length,
    pending: registrations.filter(registration => registration.status === 'pending').length,
    approved: registrations.filter(registration => registration.status === 'approved').length,
    rejected: registrations.filter(registration => registration.status === 'rejected').length,
  }), [registrations]);

  return (
    <SecurePage
      eyebrow="Restricted Core Committee Access"
      title="Admin Portal"
      subtitle={`Signed in as ${admin.email}`}
      action={<button type="button" className="secure-action" onClick={() => onLogout('logout')}>Log out</button>}
    >
      {error && <div className="secure-card secure-status secure-status--error" role="alert">{error}</div>}

      {approvalNotice && (
        <section className="admin-notice secure-card" role="status">
          <p className="label-caps">Credentials ready — {approvalNotice.schoolName}</p>
          <pre>{approvalNotice.message}</pre>
          <div className="admin-notice__actions">
            <button type="button" className="secure-action" onClick={() => copyText('message', approvalNotice.message)}>
              {copied === 'message' ? 'Copied' : 'Copy message'}
            </button>
            <button type="button" className="secure-action" onClick={() => openWhatsapp(approvalNotice.teacherWhatsapp, approvalNotice.message)}>
              Open WhatsApp
            </button>
          </div>
        </section>
      )}

      <div className="admin-filters" aria-label="Registration filters">
        {['all', 'pending', 'approved', 'rejected'].map(status => (
          <button
            type="button"
            key={status}
            className={filter === status ? 'admin-filter admin-filter--active' : 'admin-filter'}
            onClick={() => setFilter(status)}
          >
            {status} ({counts[status]})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="secure-card secure-status">Loading registrations…</div>
      ) : filtered.length === 0 ? (
        <div className="secure-card secure-status">No {filter} registrations.</div>
      ) : (
        <div className="admin-table-wrap secure-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>School</th>
                <th>WhatsApp</th>
                <th>Status</th>
                <th>Code</th>
                <th>Password</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(registration => (
                <tr key={registration.id}>
                  <td className="admin-table__school">{registration.school_name}</td>
                  <td>{registration.teacher_whatsapp}</td>
                  <td><span className={`admin-badge admin-badge--${registration.status}`}>{registration.status}</span></td>
                  <td>
                    {registration.school_code || '—'}
                    {registration.school_code && (
                      <button type="button" className="admin-inline-action" onClick={() => copyText(`code-${registration.id}`, registration.school_code)}>
                        {copied === `code-${registration.id}` ? 'copied' : 'copy'}
                      </button>
                    )}
                  </td>
                  <td>
                    {registration.password ? (visiblePasswords.has(registration.id) ? registration.password : '••••••••') : '—'}
                    {registration.password && (
                      <div className="admin-inline-actions">
                        <button type="button" className="admin-inline-action" onClick={() => togglePassword(registration.id)}>
                          {visiblePasswords.has(registration.id) ? 'hide' : 'reveal'}
                        </button>
                        <button type="button" className="admin-inline-action" onClick={() => copyText(`password-${registration.id}`, registration.password)}>
                          {copied === `password-${registration.id}` ? 'copied' : 'copy'}
                        </button>
                      </div>
                    )}
                  </td>
                  <td>{new Date(registration.created_at).toLocaleString('en-IN')}</td>
                  <td>
                    {registration.status === 'pending' ? (
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          className="admin-row-action admin-row-action--approve"
                          onClick={() => handleTransition(registration.id, 'approved')}
                          disabled={actionLoading === registration.id}
                        >
                          {actionLoading === registration.id ? 'Working…' : 'Approve'}
                        </button>
                        <button
                          type="button"
                          className="admin-row-action admin-row-action--reject"
                          onClick={() => handleTransition(registration.id, 'rejected')}
                          disabled={actionLoading === registration.id}
                        >
                          Reject
                        </button>
                      </div>
                    ) : <span className="admin-final">Final</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SecurePage>
  );
}

export default function AdminPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setAdmin(data?.session?.user || null);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setAdmin(session?.user || null);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    setError('');
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    setPassword('');
    setLoading(false);
    if (authError || !data.user) {
      setError('Sign-in failed. Check your credentials and try again.');
      return;
    }
    setAdmin(data.user);
  };

  const handleLogout = useCallback(async (reason = 'logout') => {
    await supabase.auth.signOut({ scope: 'local' });
    setAdmin(null);
    setEmail('');
    setPassword('');
    if (reason === 'forbidden') setError('This account does not have administrator access.');
    else if (reason === 'invalid-session') setError('Your session is no longer valid. Sign in again.');
    else setError('');
  }, []);

  if (admin) return <AdminDashboard admin={admin} onLogout={handleLogout} />;

  return (
    <SecurePage
      eyebrow="Authorization Gate"
      title="Admin Access"
      subtitle="Restricted to authorized Genesis core committee accounts."
    >
      <form className="admin-login secure-card" onSubmit={handleLogin}>
        <label>
          <span className="label-caps">Email</span>
          <input type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" maxLength={254} required />
        </label>
        <label>
          <span className="label-caps">Password</span>
          <input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" required />
        </label>
        <button type="submit" className="secure-action" disabled={loading}>
          {loading ? 'Authenticating…' : 'Authenticate'}
        </button>
        {error && <div className="secure-status secure-status--error" role="alert">{error}</div>}
      </form>
    </SecurePage>
  );
}
