import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SecurePage from '../components/SecurePage';
import { loadSchoolCredentials } from '../lib/edgeFunctions';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/authContext';
import LoadingScreen from '../components/LoadingScreen';
import { eventsData } from '../lib/eventsData';
import {
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Printer,
  Users,
  Calendar,
  Lock,
  Sparkles,
  Layers,
  Building2,
} from 'lucide-react';
import './ReviewRegistrationPage.css';

export default function ReviewRegistrationPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [school, setSchool] = useState(null);
  const [eventRosters, setEventRosters] = useState([]);
  const [completeCount, setCompleteCount] = useState(0);
  const [totalSelectedCount, setTotalSelectedCount] = useState(0);

  useEffect(() => {
    let active = true;

    const loadReviewData = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!active) return;
      if (!sessionData?.session) {
        navigate('/login', { replace: true });
        return;
      }

      // 1. Fetch school credentials / identity
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

      // 2. Fetch current school's selections & participant data
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

      // Fetch selections status
      const { data: dbStatuses } = await supabase
        .from('v_school_event_statuses')
        .select('*');

      if (!active) return;

      const activeSelections = (dbStatuses || []).filter(
        (s) => s.status !== 'not_selected'
      );
      setTotalSelectedCount(activeSelections.length);

      const completed = activeSelections.filter((s) =>
        ['selected_complete', 'locked', 'submitted'].includes(s.status)
      );
      setCompleteCount(completed.length);

      // Fetch detailed participant rosters for active selections
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

          // Get DB event info
          const { data: evDb } = await supabase
            .from('events')
            .select('*')
            .eq('id', sel.event_id)
            .maybeSingle();

          const eventName = evDb?.name || staticInfo?.title || sel.event_id;
          const category = evDb?.category || staticInfo?.category || 'General';
          const teamLimit = evDb?.participant_limit || (staticInfo ? parseInt(staticInfo.teamSize, 10) : 2);

          // Fetch participant links
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
    <SecurePage
      eyebrow="Roster & Registration Overview"
      title="Genesis Fest Registration Summary"
      subtitle="Comprehensive view of all selected events and confirmed participant rosters prior to the September 14th cutoff."
      action={
        <Link to="/dashboard" className="secure-action flex items-center gap-1.5">
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
      }
    >
      <div className="review-workspace">
        {/* Access Restriction Notice if < 3 complete events */}
        {!isEligible ? (
          <section className="secure-card review-gating-card">
            <div className="review-gating-icon">
              <Lock size={32} />
            </div>
            <h2>Registration Summary Locked</h2>
            <p>
              Your school currently has <strong>{completeCount}</strong> of the required <strong>3 minimum completed event rosters</strong>. Complete participant details for at least 3 events to unlock the final summary.
            </p>
            <div className="review-gating-progress">
              <span>Roster Progress: {completeCount}/3 Complete</span>
              <div className="review-progress-bar">
                <div
                  className="review-progress-fill"
                  style={{ width: `${Math.min(100, (completeCount / 3) * 100)}%` }}
                />
              </div>
            </div>
            <Link to="/dashboard" className="review-btn-primary">
              Return to Events Checklist
            </Link>
          </section>
        ) : (
          <>
            {/* 1. Header Qualification & Institution Card */}
            <section className="secure-card review-header-card">
              <div className="review-header-top">
                <div>
                  <div className="review-institution-tag">
                    <Building2 size={15} />
                    <span>Registered Institution</span>
                  </div>
                  <h1 className="review-school-name">{school?.school_name}</h1>
                  <p className="review-school-code">School Code: <strong>{school?.school_code}</strong></p>
                </div>
                <div className="no-print">
                  <button type="button" className="review-print-btn" onClick={handlePrint}>
                    <Printer size={15} /> Print Summary
                  </button>
                </div>
              </div>

              {/* Automatic Approval Status Banner */}
              <div className="review-status-banner review-status-banner--success">
                <div className="review-banner-icon">
                  <CheckCircle2 size={24} />
                </div>
                <div className="review-banner-content">
                  <h3>Qualification Criteria Met</h3>
                  <p>
                    Your school has completed participant details for <strong>{completeCount}</strong> events (minimum 3 required). All registrations meeting the minimum cutoff will be <strong>automatically approved on September 14th</strong>. No further manual action is required.
                  </p>
                </div>
                <div className="review-banner-badge">
                  <Sparkles size={14} strokeWidth={2.5} />
                  <span>READY FOR SEP 14</span>
                </div>
              </div>
            </section>

            {/* 2. Roster Summaries Per Event */}
            <section className="review-rosters-section">
              <div className="review-section-header">
                <h2>Event Participant Rosters ({eventRosters.length} Selected Events)</h2>
                <span className="review-roster-count label-caps">
                  {completeCount} Complete Rosters
                </span>
              </div>

              <div className="review-rosters-list">
                {eventRosters.map((event, idx) => (
                  <div key={event.selection_id || idx} className="secure-card review-event-card">
                    <div className="review-event-header">
                      <div>
                        <span className="label-caps review-event-category">{event.category}</span>
                        <h3 className="review-event-title">{event.event_name}</h3>
                      </div>
                      <div className="review-event-meta">
                        <span className="label-caps review-team-limit">
                          <Users size={13} /> {event.teamLimit} Members Required
                        </span>
                        <span className="review-badge-complete">
                          <CheckCircle2 size={13} /> Complete
                        </span>
                      </div>
                    </div>

                    {/* Participant Roster Table */}
                    <div className="review-table-wrapper">
                      <table className="review-table">
                        <thead>
                          <tr>
                            <th style={{ width: '60px' }}>#</th>
                            <th>Participant Name</th>
                            <th>Grade / Class</th>
                            <th>Contact Phone</th>
                          </tr>
                        </thead>
                        <tbody>
                          {event.participants.map((p) => (
                            <tr key={p.row_index}>
                              <td className="review-td-num">{p.row_index}</td>
                              <td className="review-td-name">
                                {p.name && p.name !== '—' ? (
                                  <strong>{p.name}</strong>
                                ) : (
                                  <span className="review-empty-val">Not provided</span>
                                )}
                              </td>
                              <td>{p.class || '—'}</td>
                              <td>{p.phone || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Bottom Actions */}
            <div className="review-bottom-bar no-print">
              <Link to="/dashboard" className="review-btn-secondary">
                <ArrowLeft size={16} /> Return to Dashboard
              </Link>
              <button type="button" className="review-btn-primary" onClick={handlePrint}>
                <Printer size={16} /> Print / Save PDF Summary
              </button>
            </div>
          </>
        )}
      </div>
    </SecurePage>
  );
}
