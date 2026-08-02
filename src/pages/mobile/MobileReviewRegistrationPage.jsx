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
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Printer,
  Users,
  Calendar,
  Lock,
  Sparkles,
  Building2,
} from 'lucide-react';
import './MobileReviewRegistrationPage.css';

export default function MobileReviewRegistrationPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [school, setSchool] = useState(null);
  const [eventRosters, setEventRosters] = useState([]);
  const [completeCount, setCompleteCount] = useState(0);

  useEffect(() => {
    let active = true;

    const loadReviewData = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!active) return;
      if (!sessionData?.session) {
        navigate('/login', { replace: true });
        return;
      }

      // 1. Fetch school info
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

      let currentSchool = null;
      if (credResult.ok && credResult.school) {
        currentSchool = credResult.school;
      } else {
        const user = sessionData.session.user;
        const derivedCode = user?.email
          ? user.email.split('@')[0].toUpperCase()
          : 'GEN-0015';
        currentSchool = {
          school_name: derivedCode === 'GEN-0015' ? "St. Xavier's Collegiate School" : `School ${derivedCode}`,
          school_code: derivedCode,
        };
      }
      setSchool(currentSchool);

      // 2. Fetch selections & participants
      const { data: schoolUserData } = await supabase
        .from('school_users')
        .select('school_id')
        .eq('auth_user_id', sessionData.session.user.id)
        .maybeSingle();

      const schoolId = schoolUserData?.school_id;
      if (!schoolId) {
        setLoading(false);
        return;
      }

      const { data: dbStatuses } = await supabase
        .from('v_school_event_statuses')
        .select('*');

      if (!active) return;

      const activeSelections = (dbStatuses || []).filter(
        (s) => s.status !== 'not_selected'
      );
      const completed = activeSelections.filter((s) =>
        ['selected_complete', 'locked', 'submitted'].includes(s.status)
      );
      setCompleteCount(completed.length);

      const { data: selectionsData } = await supabase
        .from('school_event_selections')
        .select('id, event_id, status, deselected_at')
        .eq('school_id', schoolId)
        .is('deselected_at', null);

      if (!active) return;

      const rosters = await Promise.all(
        (selectionsData || []).map(async (sel) => {
          const staticInfo = eventsData.find(
            (e) => e.id.toLowerCase() === sel.event_id.toLowerCase()
          );

          const { data: evDb } = await supabase
            .from('events')
            .select('*')
            .eq('id', sel.event_id)
            .maybeSingle();

          const eventName = evDb?.name || staticInfo?.title || sel.event_id;
          const category = evDb?.category || staticInfo?.category || 'General';
          const teamLimit = evDb?.participant_limit || (staticInfo ? parseInt(staticInfo.teamSize, 10) : 2);

          const { data: partLinks } = await supabase
            .from('registration_participants')
            .select('row_index, participant_id, participants(name, class, phone)')
            .eq('school_event_selection_id', sel.id)
            .order('row_index', { ascending: true });

          const participants = Array.from({ length: teamLimit }, (_, idx) => {
            const rowIndex = idx + 1;
            const link = partLinks?.find((p) => p.row_index === rowIndex);
            const p = link?.participants;
            return {
              row_index: rowIndex,
              name: p?.name || '—',
              class: p?.class || '—',
              phone: p?.phone || '—',
            };
          });

          return {
            selection_id: sel.id,
            event_id: sel.event_id,
            event_name: eventName,
            category,
            teamLimit,
            status: sel.status,
            participants,
          };
        })
      );

      setEventRosters(rosters);
      setLoading(false);
    };

    loadReviewData();
  }, [navigate, logout]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingScreen />;
  }

  const isEligible = completeCount >= 3;

  return (
    <div className="mob-review-page">
      <MobileBackground />
      <MobileHamburger />

      <header className="mob-review-header">
        <Link to="/dashboard" className="mob-back-link">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <span className="mob-header-tag label-caps">Roster Summary</span>
        <h1 className="mob-header-title">Registration Summary</h1>
      </header>

      <main className="mob-review-container">
        {!isEligible ? (
          <div className="mob-card mob-gating-card">
            <div className="mob-gating-icon">
              <Lock size={28} />
            </div>
            <h2>Summary Locked</h2>
            <p>
              Complete participant rosters for at least 3 events to unlock your full registration summary. Currently completed: <strong>{completeCount}/3</strong> events.
            </p>
            <Link to="/dashboard" className="mob-btn-primary">
              Return to Dashboard
            </Link>
          </div>
        ) : (
          <>
            {/* Institution Info & Status */}
            <div className="mob-card mob-school-card">
              <div className="mob-school-meta">
                <span className="label-caps text-accent">Approved Institution</span>
                <h2>{school?.school_name}</h2>
                <p className="mob-code-text">Code: <strong>{school?.school_code}</strong></p>
              </div>

              <div className="mob-status-banner">
                <div className="mob-status-top">
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  <h3>Qualification Criteria Met</h3>
                </div>
                <p>
                  You have completed participant rosters for <strong>{completeCount}</strong> events. Your registration is set for <strong>automatic approval on September 14th</strong>.
                </p>
              </div>
            </div>

            {/* Event Rosters */}
            <div className="mob-rosters-list">
              {eventRosters.map((event, idx) => (
                <div key={event.selection_id || idx} className="mob-card mob-event-card">
                  <div className="mob-event-top">
                    <div>
                      <span className="label-caps mob-cat-tag">{event.category}</span>
                      <h3 className="mob-event-title">{event.event_name}</h3>
                    </div>
                    <span className="mob-complete-badge">
                      <CheckCircle2 size={12} /> {event.teamLimit} Members
                    </span>
                  </div>

                  <div className="mob-participants-list">
                    {event.participants.map((p) => (
                      <div key={p.row_index} className="mob-part-item">
                        <div className="mob-part-idx">{p.row_index}</div>
                        <div className="mob-part-info">
                          <strong>{p.name !== '—' ? p.name : 'Not provided'}</strong>
                          <div className="mob-part-details">
                            <span>Class: {p.class}</span>
                            <span>•</span>
                            <span>Phone: {p.phone}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Bar */}
            <div className="mob-action-bar no-print">
              <button type="button" className="mob-btn-primary" onClick={handlePrint}>
                <Printer size={16} /> Print / Save Summary
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
