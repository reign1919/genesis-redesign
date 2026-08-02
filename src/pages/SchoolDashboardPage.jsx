import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SecurePage from '../components/SecurePage';
import { loadSchoolCredentials } from '../lib/edgeFunctions';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/authContext';
import LoadingScreen from '../components/LoadingScreen';
import { eventsData } from '../lib/eventsData';
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
  HelpCircle,
} from 'lucide-react';
import './SchoolDashboardPage.css';

// September 14th deadline countdown calculation & color shifts
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

export default function SchoolDashboardPage() {
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

      // 1. Fetch School Credentials
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

      // 2. Fetch Events with Live Selection Status per school
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

      // Map master events with live status
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
    <SecurePage
      eyebrow="Approved School Access"
      title="School Dashboard"
      subtitle="Credentials issued by the Genesis core committee. Keep them private and share them only with authorized school representatives."
      action={
        <button type="button" className="secure-action" onClick={handleLogout}>
          Log out
        </button>
      }
    >
      <div className="dash-workspace">
        {/* 1. School Credentials Card with Reveal & Copy buttons */}
        {school && (
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
                <button
                  type="button"
                  onClick={() => copyCredential('code', school.school_code)}
                >
                  {copied === 'code' ? 'Copied' : 'Copy code'}
                </button>
              </div>
              <div className="school-credentials__item">
                <span className="label-caps">Password</span>
                <strong>{passwordVisible ? school.password : '••••••••••••••••'}</strong>
                <div className="school-credentials__actions">
                  <button
                    type="button"
                    onClick={() => setPasswordVisible((v) => !v)}
                  >
                    {passwordVisible ? 'Hide' : 'Reveal'}
                  </button>
                  <button
                    type="button"
                    onClick={() => copyCredential('password', school.password)}
                  >
                    {copied === 'password' ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 2. Events Summary Bar & Deadline Header */}
        <section className="dash-summary-bar secure-card">
          <div className="dash-summary-item">
            <Layers className="dash-summary-icon" size={16} />
            <span className="label-caps">Selected Events</span>
            <strong className="dash-summary-val">
              {selectedCount}/{maxEventsTarget}
            </strong>
          </div>

          <div className="dash-summary-item">
            <CheckCircle2 className="dash-summary-icon dash-summary-icon--green" size={16} />
            <span className="label-caps">Minimum Required Roster</span>
            <strong className="dash-summary-val dash-summary-val--green">
              {completeCount}/{minCompleteTarget}
            </strong>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard/review"
              className={`px-3.5 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                completeCount >= 3
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-zinc-800/60 text-zinc-400 border border-zinc-700/60 hover:text-zinc-200'
              }`}
            >
              <span>View Roster Summary</span>
              <ChevronRight size={13} />
            </Link>

            <div className={`dash-deadline-pill ${deadline.badgeClass}`}>
              <Calendar size={15} />
              <div>
                <div className="flex items-center gap-1.5 relative">
                  <span className="label-caps block text-[10px]">Deadline (Sep 14)</span>
                  <div className="relative inline-flex items-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeadlineTooltip((prev) => !prev);
                      }}
                      className="text-zinc-400 hover:text-white transition-colors cursor-pointer p-0.5 rounded-full hover:bg-white/10 focus:outline-none flex items-center justify-center"
                      aria-label="Deadline info"
                    >
                      <HelpCircle size={13} />
                    </button>

                    {showDeadlineTooltip && (
                      <>
                        <div
                          className="fixed inset-0 z-40 bg-transparent"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeadlineTooltip(false);
                          }}
                        />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 bg-zinc-950 text-zinc-100 text-xs rounded-lg border border-zinc-700/80 shadow-2xl backdrop-blur-md z-50 font-sans font-normal normal-case leading-snug text-left">
                          Schools with at least 3 completed event rosters by September 14th will be automatically approved.
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-950 border-r border-b border-zinc-700/80 rotate-45" />
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <strong>{deadline.formattedText}</strong>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Vertical Line-Style Scroll Event Checklist Sidebar */}
        <section className="dash-events-section secure-card">
          <div className="dash-events-header">
            <div>
              <p className="label-caps text-accent">Genesis Fest Events Checklist</p>
              <h3>Event Registration Rack ({eventsList.length} Events)</h3>
            </div>
            <span className="label-caps text-muted">Select 3–10 Events (Min 3 Complete)</span>
          </div>

          <div className="dash-events-timeline-container">
            <div className="dash-vertical-line" aria-hidden="true" />

            <div className="dash-events-list">
              {eventsList.map((event) => {
                const config = STATUS_CONFIG[event.status] || STATUS_CONFIG.not_selected;
                const StatusIcon = config.icon;

                return (
                  <div key={event.event_id} className="dash-event-node">
                    <div className={`dash-timeline-dot ${config.dotClass}`} />

                    <Link
                      to={`/dashboard/${event.event_slug}`}
                      className="dash-event-card"
                    >
                      <div className="dash-event-top">
                        <div>
                          <span className="dash-event-category label-caps">
                            {event.category}
                          </span>
                          <h4 className="dash-event-title">{event.event_name}</h4>
                        </div>
                        <ChevronRight className="dash-arrow-icon" size={16} />
                      </div>

                      <p className="dash-event-brief">{event.brief}</p>

                      <div className="dash-event-bottom">
                        <span className="dash-event-limit label-caps">
                          <Users size={12} /> {event.participant_limit}
                        </span>

                        <div className={`dash-status-badge ${config.badgeClass}`}>
                          <StatusIcon size={12} />
                          <span>{config.label}</span>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </SecurePage>
  );
}
