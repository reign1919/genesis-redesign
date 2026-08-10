import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loadSchoolCredentials } from '../../lib/edgeFunctions';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/authContext';
import LoadingScreen from '../../components/LoadingScreen';
import MobileBackground from '../../components/mobile/MobileBackground';
import MobileHamburger from '../../components/mobile/MobileHamburger';
import SEO from '../../components/SEO';
import { eventsData } from '../../lib/eventsData';
import {
  CircleDashed,
  AlertCircle,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Calendar,
  Layers,
  Users,
  ChevronRight,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import './MobileSchoolDashboardPage.css';

function getDeadlineDetails() {
  const currentYear = new Date().getFullYear();
  const deadline = new Date(`${currentYear}-09-14T23:59:59Z`);
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();

  if (diffMs <= 0) {
    return {
      formattedText: 'Deadline Passed',
      badgeClass: 'dash-deadline--red',
    };
  }

  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const remainingHours = totalHours % 24;

  let formattedText = `${days}d ${remainingHours}h left`;
  if (days === 0) {
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    formattedText = `${remainingHours}h ${minutes}m left`;
  }

  let badgeClass = 'dash-deadline--neutral';
  if (totalHours <= 48) {
    badgeClass = 'dash-deadline--red';
  } else if (totalHours <= 168) {
    badgeClass = 'dash-deadline--amber';
  }

  return { formattedText, badgeClass };
}

const STATUS_CONFIG = {
  not_selected: {
    label: 'Not Selected',
    badgeClass: 'dash-badge--neutral',
    icon: CircleDashed,
    dotClass: 'dash-dot--neutral',
  },
  selected_incomplete: {
    label: 'Incomplete',
    badgeClass: 'dash-badge--amber',
    icon: AlertCircle,
    dotClass: 'dash-dot--amber',
  },
  selected_complete: {
    label: 'Complete',
    badgeClass: 'dash-badge--green',
    icon: CheckCircle2,
    dotClass: 'dash-dot--green',
  },
  locked: {
    label: 'Locked',
    badgeClass: 'dash-badge--purple',
    icon: Lock,
    dotClass: 'dash-dot--purple',
  },
  submitted: {
    label: 'Submitted',
    badgeClass: 'dash-badge--cyan',
    icon: ShieldCheck,
    dotClass: 'dash-dot--cyan',
  },
};

export default function MobileSchoolDashboardPage() {
  const navigate = useNavigate();
  const { login, logout } = useAuth();
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [copied, setCopied] = useState('');
  const [eventsList, setEventsList] = useState([]);
  const [showDeadlineTooltip, setShowDeadlineTooltip] = useState(false);

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!active) return;
      if (!sessionData?.session) {
        navigate('/login', { replace: true });
        return;
      }

      const user = sessionData.session.user;
      const derivedCode = user?.email
        ? user.email.split('@')[0].toUpperCase()
        : 'GEN-0015';

      const credResult = await loadSchoolCredentials();
      if (!active) return;

      if (
        credResult.code === 'AUTH_REQUIRED' ||
        credResult.code === 'AUTH_INVALID'
      ) {
        logout();
        await supabase.auth.signOut({ scope: 'local' });
        navigate('/login', { replace: true });
        return;
      }

      if (credResult.ok && credResult.school) {
        login({
          schoolCode: credResult.school.school_code || derivedCode,
          schoolName: credResult.school.school_name || (derivedCode === 'GEN-0015' ? "St. Xavier's Collegiate School" : `School ${derivedCode}`),
        });
        setSchool(credResult.school);
      } else {
        const defaultName = derivedCode === 'GEN-0015' ? "St. Xavier's Collegiate School" : `School ${derivedCode}`;
        setSchool({
          school_name: defaultName,
          school_code: derivedCode,
          status: 'approved',
          password: '••••••••••••••••',
        });
      }

      let dbStatuses = null;
      const { data: viewStatuses } = await supabase
        .from('v_school_event_statuses')
        .select('*');

      dbStatuses = viewStatuses;

      const activeSchoolId = credResult?.school?.id || credResult?.school?.school_id;
      if ((!dbStatuses || dbStatuses.length === 0) && activeSchoolId) {
        const { data: rpcStatuses } = await supabase.rpc('get_school_event_statuses', {
          p_school_id: activeSchoolId,
        });
        if (rpcStatuses && Array.isArray(rpcStatuses)) {
          dbStatuses = rpcStatuses;
        }
      }

      if (!active) return;

      const statusMap = new Map();
      if (dbStatuses && Array.isArray(dbStatuses)) {
        dbStatuses.forEach((row) => {
          if (row.event_slug) {
            statusMap.set(row.event_slug.toLowerCase(), row.status);
          }
        });
      }

      const mergedEvents = eventsData.map((e) => ({
        event_id: e.id,
        event_slug: e.id,
        event_name: e.title,
        participant_limit: e.teamSize,
        category: e.category,
        brief: e.brief,
        status: statusMap.get(e.id.toLowerCase()) || 'not_selected',
      }));

      setEventsList(mergedEvents);
      setLoading(false);
    };

    loadDashboard();
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

  if (loading) {
    return <LoadingScreen />;
  }

  const maxEventsTarget = 10;
  const minCompleteTarget = 3;
  const selectedCount = eventsList.filter((e) => e.status !== 'not_selected').length;
  const completeCount = eventsList.filter((e) =>
    ['selected_complete', 'locked', 'submitted'].includes(e.status)
  ).length;

  const deadline = getDeadlineDetails();

  return (
    <div className="mdash-wrapper">
      <SEO
        title="School Dashboard — Genesis 2026"
        canonical="/dashboard"
        noindex={true}
      />
      <MobileBackground />
      <div className="m-grid-overlay" aria-hidden="true" />
      <MobileHamburger />

      <main className="mdash-content">
        <header className="mdash-header">
          <div>
            <div className="mdash-header-tag">
              <Sparkles size={12} />
              Genesis Fest
            </div>
            <h1 className="mdash-header-title">
              {school?.school_name}
            </h1>
          </div>
          <button onClick={handleLogout} className="mdash-logout-btn">
            Log out
          </button>
        </header>

        {/* Credentials Card */}
        {school && (
          <div className="mdash-card">
            <div className="mdash-card-header">
              <span className="label-caps">Registered Institution</span>
              <h2>{school.school_name}</h2>
              <span className="mdash-badge-approved">APPROVED</span>
            </div>

            <div className="mdash-creds-list">
              <div className="mdash-cred-row">
                <span className="label-caps mdash-cred-label">School Code</span>
                <div className="mdash-cred-val-row">
                  <strong>{school.school_code}</strong>
                  <button className="mdash-action-btn" onClick={() => copyCredential('code', school.school_code)}>
                    {copied === 'code' ? 'COPIED' : 'COPY'}
                  </button>
                </div>
              </div>

              <div className="mdash-cred-row">
                <span className="label-caps mdash-cred-label">Password</span>
                <div className="mdash-cred-val-row">
                  <strong>{passwordVisible ? school.password : '••••••••••••••••'}</strong>
                  <div className="mdash-actions-group">
                    <button className="mdash-action-btn" onClick={() => setPasswordVisible((v) => !v)}>
                      {passwordVisible ? 'HIDE' : 'REVEAL'}
                    </button>
                    <button className="mdash-action-btn" onClick={() => copyCredential('password', school.password)}>
                      {copied === 'password' ? 'COPIED' : 'COPY'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="mdash-metrics-grid">
          <div className="mdash-metric-box">
            <span className="mdash-metric-label">Selected</span>
            <span className="mdash-metric-val">{selectedCount}/{maxEventsTarget}</span>
          </div>

          <div className="mdash-metric-box">
            <span className="mdash-metric-label">Min. Roster</span>
            <span className="mdash-metric-val mdash-metric-val--green">{completeCount}/{minCompleteTarget}</span>
          </div>

          <div className={`mdash-metric-box mdash-deadline-box ${deadline.badgeClass}`}>
            <div className="flex items-center gap-1" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className="mdash-metric-label" style={{ color: 'inherit' }}>Deadline</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeadlineTooltip((prev) => !prev);
                }}
                style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', display: 'flex' }}
                aria-label="Deadline info"
              >
                <HelpCircle size={11} />
              </button>

              {showDeadlineTooltip && (
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeadlineTooltip(false);
                    }}
                  />
                  <div className="mdash-tooltip-box">
                    Schools with at least 3 completed event rosters by September 14th will be automatically approved.
                    <div className="mdash-tooltip-arrow" />
                  </div>
                </>
              )}
            </div>
            <span className="mdash-metric-val" style={{ color: 'inherit' }}>{deadline.formattedText}</span>
          </div>
        </div>

        <Link
          to="/dashboard/review"
          className={`mdash-roster-cta ${
            completeCount >= 3
              ? 'mdash-roster-cta--active'
              : 'mdash-roster-cta--muted'
          }`}
        >
          <span>View Roster Summary</span>
          <ChevronRight size={14} />
        </Link>

        {/* Events Checklist Section */}
        <div className="mdash-events-card">
          <div className="mdash-events-header">
            <h2>Events Checklist ({eventsList.length})</h2>
            <span className="mdash-events-sub">Select 3–10 events</span>
          </div>

          <div className="mdash-events-timeline">
            <div className="mdash-events-line" aria-hidden="true" />

            {eventsList.map((event) => {
              const config = STATUS_CONFIG[event.status] || STATUS_CONFIG.not_selected;
              const StatusIcon = config.icon;

              return (
                <div key={event.event_id} className="mdash-event-item">
                  <div
                    className={`mdash-event-dot ${config.dotClass}`}
                    aria-hidden="true"
                  />

                  <Link
                    to={`/dashboard/${event.event_slug}`}
                    className="mdash-event-link"
                  >
                    <div className="mdash-event-top">
                      <span className="mdash-event-name">
                        {event.event_name}
                      </span>
                      <ChevronRight size={14} style={{ color: 'var(--text-tertiary)' }} />
                    </div>

                    <div className="mdash-event-meta">
                      <span className="mdash-event-limit">
                        <Users size={12} />
                        Limit: {event.participant_limit}
                      </span>

                      <span className={`mdash-status-badge ${config.badgeClass}`}>
                        <StatusIcon size={12} />
                        {config.label}
                      </span>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
