import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loadSchoolCredentials } from '../../lib/edgeFunctions';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/authContext';
import LoadingScreen from '../../components/LoadingScreen';
import MobileBackground from '../../components/mobile/MobileBackground';
import MobileHamburger from '../../components/mobile/MobileHamburger';
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
    <div className="mdash-wrapper min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased">
      <MobileBackground />
      <div className="m-grid-overlay" aria-hidden="true" />
      <MobileHamburger />

      <main className="mdash-content max-w-xl mx-auto px-4 py-6 relative z-10 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono tracking-wide text-zinc-500 uppercase">
              <Sparkles className="w-3 h-3 text-zinc-400" />
              Genesis Fest
            </div>
            <h1 className="text-lg font-semibold text-zinc-100 mt-0.5">
              {school?.school_name}
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs text-zinc-400"
          >
            Log out
          </button>
        </div>

        {/* Credentials Card */}
        {school && (
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
                  <strong>{passwordVisible ? school.password : '••••••••••••••••'}</strong>
                  <div className="mdash-actions">
                    <button onClick={() => setPasswordVisible((v) => !v)}>
                      {passwordVisible ? 'HIDE' : 'REVEAL'}
                    </button>
                    <button onClick={() => copyCredential('password', school.password)}>
                      {copied === 'password' ? 'COPIED' : 'COPY'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Metrics Row */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded bg-zinc-900/80 border border-zinc-800">
            <span className="block text-zinc-500 text-[10px] uppercase">Selected</span>
            <span className="font-mono font-bold text-zinc-200">{selectedCount}/{maxEventsTarget}</span>
          </div>

          <div className="p-2 rounded bg-zinc-900/80 border border-zinc-800 flex flex-col justify-center items-center">
            <span className="block text-zinc-500 text-[9px] uppercase leading-tight font-sans">Minimum Required Roster</span>
            <span className="font-mono font-bold text-emerald-400 mt-0.5">{completeCount}/{minCompleteTarget}</span>
          </div>

          <div className={`p-2 rounded border text-xs font-mono font-bold relative flex flex-col justify-center items-center ${deadline.badgeClass}`}>
            <div className="flex items-center justify-center gap-1">
              <span className="block text-[10px] uppercase font-sans font-normal opacity-75">Deadline</span>
              <div className="relative inline-flex items-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeadlineTooltip((prev) => !prev);
                  }}
                  className="opacity-75 hover:opacity-100 transition-opacity p-0.5 focus:outline-none flex items-center justify-center cursor-pointer"
                  aria-label="Deadline info"
                >
                  <HelpCircle size={11} />
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
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-zinc-950 text-zinc-100 text-[11px] rounded border border-zinc-700 shadow-xl z-50 font-sans font-normal text-left leading-tight normal-case">
                      Schools with at least 3 completed event rosters by September 14th will be automatically approved.
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-950 border-r border-b border-zinc-700 rotate-45" />
                    </div>
                  </>
                )}
              </div>
            </div>
            <span className="font-sans font-bold">{deadline.formattedText}</span>
          </div>
        </div>

        {/* View Registration Summary Button */}
        <Link
          to="/dashboard/review"
          className={`flex items-center justify-between p-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border ${
            completeCount >= 3
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 active:bg-emerald-500/25'
              : 'bg-zinc-900/60 text-zinc-400 border-zinc-800'
          }`}
        >
          <span>View Registration Roster Summary</span>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-emerald-400/80 font-mono">({completeCount}/3 Complete)</span>
            <ChevronRight size={14} />
          </div>
        </Link>

        {/* Vertical Event Timeline Sidebar */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
            <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Events Checklist ({eventsList.length})
            </h2>
            <span className="text-[11px] text-zinc-500 font-mono">Select 3–10 events</span>
          </div>

          <div className="relative pl-5 space-y-3">
            <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-zinc-800" aria-hidden="true" />

            {eventsList.map((event) => {
              const config = STATUS_CONFIG[event.status] || STATUS_CONFIG.not_selected;
              const StatusIcon = config.icon;

              return (
                <div key={event.event_id} className="relative group">
                  <div
                    className={`absolute -left-5 top-3 w-2 h-2 rounded-full ring-4 ${config.dotClass}`}
                    aria-hidden="true"
                  />

                  <Link
                    to={`/dashboard/${event.event_slug}`}
                    className="block p-3 rounded-lg border border-zinc-800 bg-zinc-900/60 text-left"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-xs text-zinc-200 truncate">
                        {event.event_name}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-zinc-500 flex items-center gap-1 font-mono">
                        <Users className="w-3 h-3 text-zinc-600" />
                        Limit: {event.participant_limit}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${config.badgeClass}`}
                      >
                        <StatusIcon className="w-3 h-3 flex-shrink-0" />
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
