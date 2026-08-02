import React from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Building2,
  Printer,
  Users,
  Sparkles,
  Lock,
  ArrowLeft,
} from 'lucide-react';
import './RosterSummaryView.css';

export default function RosterSummaryView({
  school,
  eventRosters = [],
  completeCount = 0,
  totalSelectedCount = 0,
  onPrint,
  isGated = false,
  isAdminView = false,
}) {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="roster-summary-wrapper">
      {/* ── PRINT-ONLY CONTAINER (PDF EXPORT SPEC) ───────────────────── */}
      <div className="pdf-print-container" aria-hidden="true">
        <div className="pdf-header">
          <h1 className="pdf-genesis-title">GENESIS</h1>
          <h2 className="pdf-school-host">Indus Valley World School</h2>
          <p className="pdf-motto">innovate, ideate, inspire</p>
        </div>

        <div className="pdf-meta-box">
          <div className="pdf-meta-item">
            <span className="pdf-meta-label">REGISTERED INSTITUTION:</span>
            <span className="pdf-meta-value">{school?.school_name || 'N/A'}</span>
          </div>
          <div className="pdf-meta-item">
            <span className="pdf-meta-label">SCHOOL CODE:</span>
            <span className="pdf-meta-value">{school?.school_code || 'GEN-0000'}</span>
          </div>
          {school?.teacher_whatsapp && (
            <div className="pdf-meta-item">
              <span className="pdf-meta-label">CONTACT WHATSAPP:</span>
              <span className="pdf-meta-value">{school.teacher_whatsapp}</span>
            </div>
          )}
          <div className="pdf-meta-item">
            <span className="pdf-meta-label">REGISTRATION STATUS:</span>
            <span className="pdf-meta-value">{(school?.status || 'Active').toUpperCase()}</span>
          </div>
        </div>

        <div className="pdf-section-title">PARTICIPANT ROSTER & EVENT SELECTIONS SUMMARY</div>

        <div className="pdf-events-list">
          {eventRosters.length === 0 ? (
            <p className="pdf-empty">No event rosters registered yet for this institution.</p>
          ) : (
            eventRosters.map((event, idx) => (
              <div key={event.selection_id || idx} className="pdf-event-block">
                <div className="pdf-event-header">
                  <span className="pdf-event-name">{idx + 1}. {event.event_name}</span>
                  <span className="pdf-event-category">[{event.category} — {event.teamLimit} Members]</span>
                </div>
                <table className="pdf-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>#</th>
                      <th>Participant Name</th>
                      <th style={{ width: '120px' }}>Grade / Class</th>
                      <th style={{ width: '150px' }}>Contact Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {event.participants.map((p) => (
                      <tr key={p.row_index}>
                        <td>{p.row_index}</td>
                        <td>
                          <strong>{p.name && p.name !== '—' ? p.name : 'Not provided'}</strong>
                        </td>
                        <td>{p.class || '—'}</td>
                        <td>{p.phone || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── ON-SCREEN WEB UI ────────────────────────────────────────── */}
      <div className="screen-summary-ui no-print">
        {isGated && !isAdminView ? (
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
            {/* Header Institution Card */}
            <section className="secure-card review-header-card">
              <div className="review-header-top">
                <div>
                  <div className="review-institution-tag">
                    <Building2 size={15} />
                    <span>Registered Institution</span>
                  </div>
                  <h1 className="review-school-name">{school?.school_name}</h1>
                  <p className="review-school-code">
                    School Code: <strong>{school?.school_code}</strong>
                    {school?.teacher_whatsapp && (
                      <span className="ml-3 text-zinc-400">
                        • WhatsApp: <strong>{school.teacher_whatsapp}</strong>
                      </span>
                    )}
                  </p>
                </div>
                <div className="no-print">
                  <button type="button" className="review-print-btn" onClick={handlePrint}>
                    <Printer size={15} /> Export PDF / Print
                  </button>
                </div>
              </div>

              {!isAdminView && (
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
              )}
            </section>

            {/* Event Rosters List */}
            <section className="review-rosters-section">
              <div className="review-section-header">
                <h2>Event Participant Rosters ({eventRosters.length} Selected Events)</h2>
                <span className="review-roster-count label-caps">
                  {completeCount} Complete Rosters
                </span>
              </div>

              {eventRosters.length === 0 ? (
                <div className="secure-card p-6 text-center text-zinc-400">
                  No event rosters have been selected or populated yet for this school.
                </div>
              ) : (
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
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
