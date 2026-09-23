import { useCallback, useEffect, useMemo, useState } from 'react';
import SecurePage from '../components/SecurePage';
import SEO from '../components/SEO';
import RosterSummaryView from '../components/RosterSummaryView';
import { fetchSchoolRoster } from '../lib/rosterHelper';
import {
  listAdminRegistrations,
  updateAdminRegistration,
  deleteAdminRegistration,
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
  const [activeRosterSchool, setActiveRosterSchool] = useState(null);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [schoolRosterData, setSchoolRosterData] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [purgeConfirmText, setPurgeConfirmText] = useState('');

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
        ? 'The registration status could not be updated.'
        : result.code === 'PROVISIONING_FAILED' && result.stage
          ? `Approval failed during ${result.stage.replaceAll('_', ' ')}.`
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

  const handlePurge = async (id) => {
    setActionLoading(id);
    setError('');
    setApprovalNotice(null);
    const result = await deleteAdminRegistration(id);
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
        ? 'Only rejected registrations can be purged.'
        : result.code === 'NOT_FOUND'
          ? 'That registration no longer exists.'
          : 'The registration could not be purged. Try again later.');
      return;
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

  const handleOpenRoster = async (registration) => {
    setActiveRosterSchool(registration);
    setRosterLoading(true);
    setSchoolRosterData(null);

    const result = await fetchSchoolRoster(registration.id);
    setRosterLoading(false);
    if (result.ok) {
      setSchoolRosterData(result);
    } else {
      setSchoolRosterData({ rosters: [], completeCount: 0, totalSelectedCount: 0 });
    }
  };

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  // Build the date line like "Wed, 14 Aug 2026"
  const formatExportDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? '—'
      : date.toLocaleString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Render a jsPDF A4 document: page 1 has two summary tables (school-wise
  // and event-wise), then each school's details immediately followed by that
  // school's full roster summary.
  const buildExportPdf = async (allRegistrations) => {
    const [{ jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ]);
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 48;
    let y = margin;

    const isCompleteRoster = (event) =>
      ['selected_complete', 'locked', 'submitted'].includes(event.status);

    // Pre-fetch all rosters so we can compute the summary tables up front.
    const rosterResults = [];
    for (let index = 0; index < allRegistrations.length; index += 1) {
      rosterResults.push(await fetchSchoolRoster(allRegistrations[index].id));
    }

    // ── School-wise summary rows ──
    const schoolWiseRows = allRegistrations.map((registration, index) => {
      const rosters = rosterResults[index]?.rosters || [];
      const completeRosters = rosters.filter(isCompleteRoster);
      const totalParticipants = completeRosters.reduce(
        (sum, event) => sum + event.participants.filter((p) => p.name && p.name !== '—').length,
        0,
      );
      const eventNames = completeRosters.map((event) => event.event_name).join(', ');
      return [
        registration.school_name || 'N/A',
        registration.school_code || '—',
        String(totalParticipants),
        String(completeRosters.length),
        registration.teacher_whatsapp || '—',
        eventNames || '—',
      ];
    });

    // ── Event-wise summary rows ──
    const eventMap = new Map();
    allRegistrations.forEach((registration, index) => {
      const rosters = rosterResults[index]?.rosters || [];
      rosters.filter(isCompleteRoster).forEach((event) => {
        const key = event.event_name;
        if (!eventMap.has(key)) {
          eventMap.set(key, { schools: new Set(), participants: 0 });
        }
        const entry = eventMap.get(key);
        entry.schools.add(registration.school_name || 'N/A');
        entry.participants += event.participants.filter((p) => p.name && p.name !== '—').length;
      });
    });
    const eventWiseRows = [...eventMap.entries()].map(([name, entry]) => [
      name,
      String(entry.schools.size),
      [...entry.schools].join(', '),
      String(entry.participants),
    ]);
    const grandTotalParticipants = eventMap.size === 0
      ? 0
      : [...eventMap.values()].reduce((sum, entry) => sum + entry.participants, 0);

    const ensureSpace = (needed) => {
      if (y + needed > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };

    const writeLine = ({ text, size = 10, bold = false, indent = 0, color = [40, 40, 40], spacing = 14 }) => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(size);
      doc.setTextColor(...color);
      const wrapped = doc.splitTextToSize(text, pageWidth - margin * 2 - indent);
      ensureSpace(wrapped.length * spacing);
      doc.text(wrapped, margin + indent, y);
      y += wrapped.length * spacing + 4;
    };

    const writeDivider = () => {
      ensureSpace(24);
      doc.setDrawColor(160, 40, 45);
      doc.setLineWidth(1.2);
      doc.line(margin, y, pageWidth - margin, y);
      y += 18;
    };

    const writeSectionHeading = (text) => {
      ensureSpace(30);
      writeLine({ text, size: 12, bold: true, color: [160, 40, 45], spacing: 18 });
    };

    // ── Document header ──
    writeLine({ text: 'GENESIS TECH FEST — ADMIN EXPORT', size: 16, bold: true, color: [160, 40, 45] });
    writeLine({ text: 'Indus Valley World School', size: 11, color: [120, 120, 120] });
    writeLine({ text: `Exported: ${new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}`, size: 11, color: [120, 120, 120] });
    writeLine({ text: `Total registrations: ${allRegistrations.length}`, size: 11, color: [120, 120, 120], spacing: 18 });
    writeDivider();

    // ── Page 1: School-wise summary table ──
    writeSectionHeading('SCHOOL-WISE SUMMARY');
    autoTable(doc, {
      startY: y,
      head: [[
        'School Name',
        'Code',
        'Total Participants',
        'No. of Events',
        'Teacher In-charge No.',
        'Events Participating In',
      ]],
      body: schoolWiseRows,
      theme: 'grid',
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 4, textColor: [40, 40, 40], lineColor: [200, 200, 200], lineWidth: 0.4 },
      headStyles: { fillColor: [160, 40, 45], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 110 },
        1: { cellWidth: 55 },
        2: { cellWidth: 55 },
        3: { cellWidth: 45 },
        4: { cellWidth: 70 },
        5: { cellWidth: 'auto' },
      },
    });
    y = doc.lastAutoTable.finalY + 24;

    // ── Page 1: Event-wise summary table ──
    writeSectionHeading('EVENT-WISE SUMMARY');
    autoTable(doc, {
      startY: y,
      head: [['Event Name', 'No. of Schools Participating', 'Schools Participating', 'Participants per Event']],
      body: eventWiseRows.length > 0
        ? eventWiseRows
        : [['No complete event rosters yet.', '—', '—', '—']],
      theme: 'grid',
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 4, textColor: [40, 40, 40], lineColor: [200, 200, 200], lineWidth: 0.4 },
      headStyles: { fillColor: [160, 40, 45], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 110 },
        1: { cellWidth: 55 },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 70 },
      },
    });
    y = doc.lastAutoTable.finalY + 18;

    writeLine({
      text: `GRAND TOTAL PARTICIPANTS: ${grandTotalParticipants}`,
      size: 12,
      bold: true,
      color: [160, 40, 45],
      spacing: 18,
    });
    y += 12;

    // Start the per-school detail sections on a fresh page.
    doc.addPage();
    y = margin;

    for (let index = 0; index < allRegistrations.length; index += 1) {
      const registration = allRegistrations[index];
      const rosterResult = rosterResults[index];

      // ── School details block ──
      ensureSpace(110);
      writeLine({ text: `SCHOOL ${index + 1}: ${registration.school_name || 'N/A'}`, size: 14, bold: true, color: [30, 30, 30], spacing: 18 });
      writeLine({ text: `  Status           : ${registration.status || '—'}`, indent: 12 });
      writeLine({ text: `  School Code      : ${registration.school_code || '—'}`, indent: 12 });
      writeLine({ text: `  Teacher WhatsApp : ${registration.teacher_whatsapp || '—'}`, indent: 12 });
      writeLine({ text: `  Submitted        : ${formatExportDate(registration.created_at)}`, indent: 12, spacing: 18 });

      // ── Roster summary block, right below the school details ──
      writeDivider();
      writeLine({ text: 'ROSTER SUMMARY', size: 11, bold: true, color: [160, 40, 45], spacing: 16 });
      writeLine({
        text: `Event selections: ${rosterResult.totalSelectedCount} | Complete rosters: ${rosterResult.completeCount}`,
        size: 10,
        color: [90, 90, 90],
        spacing: 14,
      });

      const rosters = rosterResult.rosters || [];
      if (rosters.length === 0) {
        writeLine({ text: 'No event rosters registered yet for this institution.', size: 10, color: [120, 120, 120] });
      } else {
        rosters.forEach((event, eventIdx) => {
          ensureSpace(30);
          writeLine({ text: `EVENT ${eventIdx + 1}: ${event.event_name}`, size: 11, bold: true, indent: 6, spacing: 16 });
          writeLine({ text: `  Category          : ${event.category || '—'}`, indent: 12 });
          writeLine({ text: `  Team Limit        : ${event.teamLimit || '—'} Members`, indent: 12 });
          writeLine({ text: `  Selection Status  : ${event.status || '—'}`, indent: 12, spacing: 12 });
          writeLine({ text: 'Participants:', size: 10, bold: true, indent: 6, spacing: 14 });

          (event.participants || []).forEach((p) => {
            const name = p.name && p.name !== '—' ? p.name : 'Not provided';
            writeLine({
              text: `${p.row_index}. ${name} | Class: ${p.class || '—'} | Phone: ${p.phone || '—'}`,
              size: 10,
              indent: 12,
              color: [60, 60, 60],
            });
          });
          y += 8;
        });
      }

      y += 10;
      writeDivider();
      if (index < allRegistrations.length - 1) {
        ensureSpace(40);
        y += 14;
      }
    }

    return doc;
  };

  const handleExport = async () => {
    setExporting(true);
    setExportError('');
    try {
      const doc = await buildExportPdf(registrations);
      doc.save(`genesis-school-export-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('[Admin Export Failed]', err);
      setExportError('The export could not be generated. Try again later.');
    } finally {
      setExporting(false);
    }
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
      eyebrow="Restricted Genesis Council Access"
      title="Admin Portal"
      subtitle={`Signed in as ${admin.email}`}
      action={(
        <div className="admin-header-actions">
          <button
            type="button"
            className="secure-action"
            onClick={handleExport}
            disabled={exporting || registrations.length === 0}
          >
            {exporting ? 'Exporting…' : 'Export'}
          </button>
          <button type="button" className="secure-action" onClick={() => onLogout('logout')}>Log out</button>
        </div>
      )}
    >
      <SEO
        title="Admin Portal — Genesis 2026"
        canonical="/admin"
        noindex={true}
      />
      {error && <div className="secure-card secure-status secure-status--error" role="alert">{error}</div>}
      {exportError && <div className="secure-card secure-status secure-status--error" role="alert">{exportError}</div>}

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
                <th>Roster Summary</th>
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
                    <button
                      type="button"
                      className="admin-row-action admin-row-action--roster"
                      onClick={() => handleOpenRoster(registration)}
                    >
                      View Roster Summary
                    </button>
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      {(registration.status === 'pending' || registration.status === 'rejected') && (
                        <button
                          type="button"
                          className="admin-row-action admin-row-action--approve"
                          onClick={() => { setPurgeConfirmText(''); setConfirmAction({ registration, kind: 'approve' }); }}
                          disabled={actionLoading === registration.id}
                        >
                          {actionLoading === registration.id ? 'Working…' : 'Approve'}
                        </button>
                      )}
                      {(registration.status === 'pending' || registration.status === 'approved') && (
                        <button
                          type="button"
                          className="admin-row-action admin-row-action--reject"
                          onClick={() => setConfirmAction({ registration, kind: 'reject' })}
                          disabled={actionLoading === registration.id}
                        >
                          Reject
                        </button>
                      )}
                      {registration.status === 'rejected' && (
                        <button
                          type="button"
                          className="admin-row-action admin-row-action--purge"
                          onClick={() => { setPurgeConfirmText(''); setConfirmAction({ registration, kind: 'purge' }); }}
                          disabled={actionLoading === registration.id}
                        >
                          Purge
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Admin Roster Modal */}
      {activeRosterSchool && (
        <div className="admin-modal-overlay no-print" onClick={() => setActiveRosterSchool(null)}>
          <div className="admin-modal-content secure-card" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <span className="label-caps text-accent-light" style={{ color: 'var(--accent-light)', fontSize: '11px', letterSpacing: '0.1em' }}>
                  Institution Roster Summary
                </span>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: '#ffffff', marginTop: '4px' }}>
                  {activeRosterSchool.school_name}
                </h2>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setActiveRosterSchool(null)}
                aria-label="Close roster view"
              >
                ✕
              </button>
            </div>

            <div className="admin-modal-body">
              {rosterLoading ? (
                <div className="secure-status p-8 text-center">Loading institution roster details…</div>
              ) : (
                <RosterSummaryView
                  school={activeRosterSchool}
                  eventRosters={schoolRosterData?.rosters || []}
                  completeCount={schoolRosterData?.completeCount || 0}
                  totalSelectedCount={schoolRosterData?.totalSelectedCount || 0}
                  isAdminView={true}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Action Modal */}
      {confirmAction && (
        <div className="admin-modal-overlay no-print" onClick={() => setConfirmAction(null)}>
          <div className="admin-modal-content admin-confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <span className="label-caps text-accent-light" style={{ color: 'var(--accent-light)', fontSize: '11px', letterSpacing: '0.1em' }}>
                  Confirm Action
                </span>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: '#ffffff', marginTop: '4px' }}>
                  {confirmAction.kind === 'purge' ? 'Purge Registration' : confirmAction.kind === 'approve' ? 'Approve Registration' : 'Reject Registration'}
                </h2>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setConfirmAction(null)}
                aria-label="Cancel action"
              >
                ✕
              </button>
            </div>
            <div className="admin-modal-body admin-confirm-body">
              {confirmAction.kind === 'purge' ? (
                <>
                  <p className="admin-confirm-warning">
                    This will permanently delete this registration and all its data from the backend. The school will be able to register again.
                  </p>
                  <p className="admin-confirm-school">{confirmAction.registration.school_name}</p>
                  <p>Type <strong className="admin-confirm-typed">purge</strong> to confirm.</p>
                  <input
                    type="text"
                    className="admin-confirm-input"
                    value={purgeConfirmText}
                    onChange={event => setPurgeConfirmText(event.target.value)}
                    placeholder="purge"
                    autoComplete="off"
                    autoFocus
                  />
                </>
              ) : (
                <>
                  <p>
                    Are you sure you want to <strong>{confirmAction.kind === 'approve' ? 'approve' : 'reject'}</strong> this registration?
                  </p>
                  <p className="admin-confirm-school">{confirmAction.registration.school_name}</p>
                  {confirmAction.kind === 'reject' && (
                    <p className="admin-confirm-warning">
                      This will revoke the school&apos;s login credentials and remove its access.
                    </p>
                  )}
                </>
              )}
              <div className="admin-confirm-actions">
                <button
                  type="button"
                  className="admin-row-action"
                  onClick={() => setConfirmAction(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`admin-row-action ${confirmAction.kind === 'reject' ? 'admin-row-action--reject' : confirmAction.kind === 'purge' ? 'admin-row-action--purge' : 'admin-row-action--approve'}`}
                  onClick={() => {
                    const { registration, kind } = confirmAction;
                    setConfirmAction(null);
                    if (kind === 'purge') handlePurge(registration.id);
                    else handleTransition(registration.id, kind === 'approve' ? 'approved' : 'rejected');
                  }}
                  disabled={actionLoading === confirmAction.registration.id || (confirmAction.kind === 'purge' && purgeConfirmText !== 'purge')}
                >
                  {actionLoading === confirmAction.registration.id ? 'Working…' : `Confirm ${confirmAction.kind}`}
                </button>
              </div>
            </div>
          </div>
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
      subtitle="Restricted to authorized Genesis Council accounts."
    >
      <SEO
        title="Admin Login — Genesis 2026"
        canonical="/admin"
        noindex={true}
      />
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
