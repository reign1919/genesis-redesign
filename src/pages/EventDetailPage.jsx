import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import SecurePage from '../components/SecurePage';
import { getEventById } from '../lib/eventsData';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/authContext';
import LoadingScreen from '../components/LoadingScreen';
import {
  CircleDashed,
  AlertCircle,
  CheckCircle2,
  Lock,
  ShieldCheck,
  ArrowLeft,
  Users,
  Save,
  Trash2,
  Info,
  AlertTriangle,
  RefreshCw,
  Check,
} from 'lucide-react';
import './EventDetailPage.css';

const STATUS_CONFIG = {
  not_selected: {
    label: 'Not Selected',
    badgeClass: 'status-badge--neutral',
    icon: CircleDashed,
  },
  selected_incomplete: {
    label: 'Selected (Incomplete)',
    badgeClass: 'status-badge--amber',
    icon: AlertCircle,
  },
  selected_complete: {
    label: 'Selected (Complete)',
    badgeClass: 'status-badge--green',
    icon: CheckCircle2,
  },
  locked: {
    label: 'Locked',
    badgeClass: 'status-badge--purple',
    icon: Lock,
  },
  submitted: {
    label: 'Submitted',
    badgeClass: 'status-badge--cyan',
    icon: ShieldCheck,
  },
};

const CLASS_OPTIONS = [
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12',
  'Other / Equivalent',
];

function validatePhone(phone) {
  if (!phone || !phone.trim()) return true;
  const clean = phone.trim();
  return /^[0-9+\s\-()]{10,15}$/.test(clean);
}

export default function EventDetailPage() {
  const { eventSlug } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Core State
  const [loading, setLoading] = useState(true);
  const [dbEvent, setDbEvent] = useState(null);
  const [schoolId, setSchoolId] = useState(null);
  const [registrationStatus, setRegistrationStatus] = useState('draft');
  const [selectionStatus, setSelectionStatus] = useState('not_selected');
  const [isSelected, setIsSelected] = useState(false);
  const [selectionId, setSelectionId] = useState(null);

  // Participant rows state (1 per participant up to participant_limit)
  const [rows, setRows] = useState([]);
  const [initialLoaded, setInitialLoaded] = useState(false);

  // Save UX State
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Refs
  const isDirtyRef = useRef(false);

  // Load Event and Participant Roster Data
  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) {
      navigate('/login', { replace: true });
      return;
    }

    const staticInfo = getEventById(eventSlug);

    // Fetch dynamic event from DB by slug
    const { data: eventData } = await supabase
      .from('events')
      .select('*')
      .ilike('slug', eventSlug.toLowerCase())
      .maybeSingle();

    const currentEvent = eventData || {
      id: staticInfo?.id || eventSlug,
      slug: eventSlug,
      name: staticInfo?.title || 'Event Registration',
      participant_limit: staticInfo ? parseInt(staticInfo.teamSize, 10) || 2 : 2,
    };

    setDbEvent(currentEvent);
    const currentLimit = currentEvent.participant_limit || 2;

    // Fetch caller's school_id with fallback to loadSchoolCredentials
    let currentSchoolId = null;
    const { data: schoolUserData } = await supabase
      .from('school_users')
      .select('school_id')
      .eq('auth_user_id', sessionData.session.user.id)
      .maybeSingle();

    currentSchoolId = schoolUserData?.school_id || null;

    if (!currentSchoolId) {
      const credResult = await loadSchoolCredentials();
      if (credResult?.ok && credResult?.school?.id) {
        currentSchoolId = credResult.school.id;
      } else if (credResult?.ok && credResult?.school?.school_id) {
        currentSchoolId = credResult.school.school_id;
      }
    }

    setSchoolId(currentSchoolId);

    if (currentSchoolId) {
      // Fetch school registration status
      const { data: regData } = await supabase
        .from('registrations')
        .select('status')
        .eq('school_id', currentSchoolId)
        .maybeSingle();

      if (regData) {
        setRegistrationStatus(regData.status);
      }

      // Check current event selection status
      const { data: currentEvStatus } = await supabase
        .from('v_school_event_statuses')
        .select('*')
        .ilike('event_slug', eventSlug.toLowerCase())
        .maybeSingle();

      if (currentEvStatus && currentEvStatus.status !== 'not_selected') {
        setIsSelected(true);
        setSelectionStatus(currentEvStatus.status);
        setSelectionId(currentEvStatus.selection_id);
      } else {
        setIsSelected(false);
        setSelectionStatus('not_selected');
        setSelectionId(null);
      }

      // Fetch existing selection row and participant links
      if (currentEvent.id) {
        const { data: selRow } = await supabase
          .from('school_event_selections')
          .select('id, status, deselected_at')
          .eq('school_id', currentSchoolId)
          .eq('event_id', currentEvent.id)
          .maybeSingle();

        if (selRow && !selRow.deselected_at) {
          setIsSelected(true);
          setSelectionStatus(selRow.status);
          setSelectionId(selRow.id);

          const { data: partLinks } = await supabase
            .from('registration_participants')
            .select('row_index, participant_id, participants(name, class, phone)')
            .eq('school_event_selection_id', selRow.id)
            .order('row_index', { ascending: true });

          const initialRows = Array.from({ length: currentLimit }, (_, idx) => {
            const rowIndex = idx + 1;
            const link = partLinks?.find((p) => p.row_index === rowIndex);
            const p = link?.participants;
            return {
              row_index: rowIndex,
              name: p?.name || '',
              class: p?.class || '',
              phone: p?.phone || '',
            };
          });

          setRows(initialRows);
        } else {
          setRows(
            Array.from({ length: currentLimit }, (_, idx) => ({
              row_index: idx + 1,
              name: '',
              class: '',
              phone: '',
            }))
          );
        }
      }
    } else {
      setRows(
        Array.from({ length: currentLimit }, (_, idx) => ({
          row_index: idx + 1,
          name: '',
          class: '',
          phone: '',
        }))
      );
    }

    setInitialLoaded(true);
    setLoading(false);
  }, [eventSlug, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived read-only state
  const isReadOnly =
    registrationStatus === 'submitted' ||
    ['locked', 'submitted'].includes(selectionStatus);

  // Duplicate detection within this event
  const getDuplicateRowIndices = useCallback(() => {
    const duplicates = new Set();
    const map = new Map();

    rows.forEach((r) => {
      const cleanName = (r.name || '').trim().toLowerCase();
      const cleanPhone = (r.phone || '').trim().toLowerCase().replace(/\s+/g, '');

      if (cleanName && cleanPhone) {
        const key = `${cleanName}||${cleanPhone}`;
        if (map.has(key)) {
          duplicates.add(map.get(key));
          duplicates.add(r.row_index);
        } else {
          map.set(key, r.row_index);
        }
      }
    });

    return duplicates;
  }, [rows]);

  const duplicateSet = getDuplicateRowIndices();

  // Save Roster Function
  const saveRoster = async (customSuccessMsg = null) => {
    let activeSchoolId = schoolId;
    if (!activeSchoolId) {
      const credResult = await loadSchoolCredentials();
      if (credResult?.ok && credResult?.school?.id) {
        activeSchoolId = credResult.school.id;
        setSchoolId(activeSchoolId);
      } else if (credResult?.ok && credResult?.school?.school_id) {
        activeSchoolId = credResult.school.school_id;
        setSchoolId(activeSchoolId);
      }
    }

    if (!activeSchoolId || !dbEvent || isReadOnly) return false;

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Auto-ensure event is selected when user saves data
      if (!isSelected || selectionStatus === 'not_selected') {
        const { data: selData, error: selErr } = await supabase.rpc('toggle_school_event_selection', {
          p_school_id: activeSchoolId,
          p_event_id: dbEvent.id,
          p_select: true,
        });

        if (selErr) {
          console.warn('toggle_school_event_selection warning:', selErr.message);
        } else if (selData?.success) {
          setIsSelected(true);
          setSelectionStatus(selData.status || 'selected_incomplete');
        }
      }

      if (duplicateSet.size > 0) {
        throw new Error(
          'Duplicate participant detected within this event (matching Name & Phone). Please resolve before saving.'
        );
      }

      for (const r of rows) {
        if (r.phone && !validatePhone(r.phone)) {
          throw new Error(`Participant #${r.row_index} has an invalid phone number format.`);
        }
      }

      // Execute atomic save via RPC save_event_participants
      const { data: rpcResult, error: rpcErr } = await supabase.rpc(
        'save_event_participants',
        {
          p_school_id: activeSchoolId,
          p_event_id: dbEvent.id,
          p_participants: rows,
        }
      );

      if (rpcErr) {
        console.warn('RPC save_event_participants failed, executing fallback:', rpcErr.message);

        // Fallback: fetch/ensure selection ID
        let activeSelId = selectionId;
        if (!activeSelId) {
          const { data: selData } = await supabase
            .from('school_event_selections')
            .upsert(
              {
                school_id: activeSchoolId,
                event_id: dbEvent.id,
                status: 'selected_incomplete',
                deselected_at: null,
                selected_at: new Date().toISOString(),
              },
              { onConflict: 'school_id,event_id' }
            )
            .select('id')
            .single();
          activeSelId = selData?.id;
        }

        if (activeSelId) {
          let completeCount = 0;
          for (const r of rows) {
            if (r.name.trim() && r.class.trim() && r.phone.trim()) {
              completeCount += 1;
              const { data: pData, error: pErr } = await supabase
                .from('participants')
                .insert({
                  school_id: activeSchoolId,
                  name: r.name.trim(),
                  class: r.class.trim(),
                  phone: r.phone.trim(),
                })
                .select('id')
                .single();

              if (!pErr && pData) {
                await supabase.from('registration_participants').upsert(
                  {
                    school_event_selection_id: activeSelId,
                    participant_id: pData.id,
                    row_index: r.row_index,
                  },
                  { onConflict: 'school_event_selection_id,row_index' }
                );
              }
            }
          }

          const newStatus =
            completeCount === dbEvent.participant_limit
              ? 'selected_complete'
              : 'selected_incomplete';

          await supabase
            .from('school_event_selections')
            .update({ status: newStatus })
            .eq('id', activeSelId);

          setSelectionStatus(newStatus);
          setIsSelected(true);
        }
      } else if (rpcResult) {
        if (!rpcResult.success) {
          throw new Error(rpcResult.error || 'Failed to save participant details.');
        }
        setSelectionStatus(rpcResult.status);
        setIsSelected(true);
      }

      const timeStr = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setLastSavedAt(timeStr);
      isDirtyRef.current = false;

      const msg = customSuccessMsg || `Participant details saved successfully at ${timeStr}`;
      setSuccessMsg(msg);
      window.setTimeout(() => setSuccessMsg(''), 3500);
      return true;
    } catch (err) {
      console.error('Save error:', err);
      setErrorMsg(err.message || 'An error occurred while saving.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (rowIndex, field, value) => {
    if (isReadOnly) return;
    isDirtyRef.current = true;

    setRows((prevRows) =>
      prevRows.map((r) => (r.row_index === rowIndex ? { ...r, [field]: value } : r))
    );
  };

  const handleClearRow = (rowIndex) => {
    if (isReadOnly) return;
    isDirtyRef.current = true;

    setRows((prevRows) =>
      prevRows.map((r) =>
        r.row_index === rowIndex
          ? { ...r, name: '', class: '', phone: '' }
          : r
      )
    );
  };

  const handleNavigateBack = async (e) => {
    if (e) e.preventDefault();
    if (isDirtyRef.current) {
      const saved = await saveRoster('Saved participant details before returning to checklist.');
      if (!saved) return;
    }
    navigate('/dashboard');
  };

  const handleToggleSelection = async () => {
    if (!schoolId || !dbEvent || isReadOnly) return;

    setSaving(true);
    setErrorMsg('');
    const shouldSelect = !isSelected;

    try {
      const { data: rpcResult, error: rpcErr } = await supabase.rpc(
        'toggle_school_event_selection',
        {
          p_school_id: schoolId,
          p_event_id: dbEvent.id,
          p_select: shouldSelect,
        }
      );

      if (rpcErr) {
        if (shouldSelect) {
          await supabase.from('school_event_selections').upsert(
            {
              school_id: schoolId,
              event_id: dbEvent.id,
              status: 'selected_incomplete',
              deselected_at: null,
              selected_at: new Date().toISOString(),
            },
            { onConflict: 'school_id,event_id' }
          );
          setIsSelected(true);
          setSelectionStatus('selected_incomplete');
        } else {
          await supabase
            .from('school_event_selections')
            .update({ deselected_at: new Date().toISOString() })
            .eq('school_id', schoolId)
            .eq('event_id', dbEvent.id);

          setIsSelected(false);
          setSelectionStatus('not_selected');
        }
      } else if (rpcResult) {
        setIsSelected(rpcResult.is_selected);
        setSelectionStatus(rpcResult.status);
      }
    } catch (err) {
      console.error('Toggle selection error:', err);
      setErrorMsg(err.message || 'Could not update event selection status.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    logout();
    await supabase.auth.signOut({ scope: 'local' });
    navigate('/login', { replace: true });
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!dbEvent) {
    return (
      <SecurePage
        eyebrow="Event Rack"
        title="Event Not Found"
        subtitle={`No official event found matching slug: "${eventSlug}"`}
        action={
          <button type="button" onClick={handleNavigateBack} className="secure-action">
            Back to Dashboard
          </button>
        }
      >
        <div className="secure-card secure-status secure-status--error">
          Please check the URL or return to the dashboard events checklist.
        </div>
      </SecurePage>
    );
  }

  const participantLimit = dbEvent.participant_limit || 2;
  const statusConfig = STATUS_CONFIG[selectionStatus] || STATUS_CONFIG.not_selected;
  const StatusIcon = statusConfig.icon;

  return (
    <SecurePage
      eyebrow="GENESIS FEST REGISTRATION"
      title={dbEvent.name}
      subtitle={`Participant Entry Form (${participantLimit} ${
        participantLimit === 1 ? 'Participant Table' : 'Separate Participant Tables'
      })`}
      action={
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button type="button" onClick={handleNavigateBack} className="secure-action">
            ← Checklist
          </button>
          <button type="button" className="secure-action" onClick={handleLogout}>
            Log out
          </button>
        </div>
      }
    >
      <div className="event-detail-container">
        {/* Status Header Bar */}
        <div className="event-detail-status-bar secure-card">
          <div className="status-bar-main">
            <div className="status-bar-info">
              <span className="label-caps">Status</span>
              <div className={`status-badge-pill ${statusConfig.badgeClass}`}>
                <StatusIcon className="status-icon" />
                <span>{statusConfig.label}</span>
              </div>
            </div>

            <div className="status-bar-meta">
              <span className="meta-pill label-caps">
                <Users size={13} /> {participantLimit} {participantLimit === 1 ? 'Participant' : 'Participants'} Required
              </span>
            </div>
          </div>

          <div className="status-bar-actions">
            {!isReadOnly && (
              <button
                type="button"
                className={`toggle-selection-btn ${
                  isSelected ? 'toggle-selection-btn--deselect' : 'toggle-selection-btn--select'
                }`}
                onClick={handleToggleSelection}
                disabled={saving}
              >
                {isSelected ? (
                  <>
                    <Check size={14} /> Selected
                  </>
                ) : (
                  <>
                    <CircleDashed size={14} /> Select Event
                  </>
                )}
              </button>
            )}

            <button type="button" onClick={handleNavigateBack} className="event-back-btn">
              <ArrowLeft size={14} /> Events Checklist
            </button>
          </div>
        </div>

        {/* Read-Only Lock Banner if Submitted */}
        {isReadOnly && (
          <div className="lock-banner secure-card">
            <Lock className="lock-banner__icon" size={20} />
            <div>
              <h4>Registration Locked (Read-Only)</h4>
              <p>
                This event registration is locked because your school registration has been submitted.
              </p>
            </div>
          </div>
        )}

        {/* Error / Success Feedback Alerts */}
        {errorMsg && (
          <div className="alert-banner alert-banner--error secure-card">
            <AlertTriangle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="alert-banner alert-banner--success secure-card">
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Action Header with Save Details Button */}
        <div className="roster-actions-bar secure-card">
          <div className="actions-bar-info">
            <Info size={15} />
            <span>
              Fill in student details for all {participantLimit} participant slots below. Click "Save Details" to persist your changes.
            </span>
          </div>

          <div className="actions-bar-controls">
            {lastSavedAt && (
              <span className="last-saved-pill label-caps">
                Saved at {lastSavedAt}
              </span>
            )}

            {!isReadOnly && (
              <button
                type="button"
                className="save-details-btn"
                onClick={() => saveRoster()}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <RefreshCw className="spin" size={14} /> Saving Details...
                  </>
                ) : (
                  <>
                    <Save size={14} /> Save Details
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Separate Table per Participant */}
        <div className="participant-tables-stack">
          {rows.map((row) => {
            const isDup = duplicateSet.has(row.row_index);
            const invalidPhone = row.phone && !validatePhone(row.phone);

            return (
              <div
                key={row.row_index}
                className={`participant-table-card secure-card ${
                  isDup ? 'card-error' : ''
                }`}
              >
                <div className="participant-table-header">
                  <div className="header-left">
                    <Users size={15} className="header-icon" />
                    <span className="participant-table-title label-caps">
                      Participant {row.row_index} of {participantLimit}
                    </span>
                  </div>

                  {!isReadOnly && (
                    <button
                      type="button"
                      className="clear-slot-btn"
                      onClick={() => handleClearRow(row.row_index)}
                    >
                      <Trash2 size={13} /> Clear Participant #{row.row_index}
                    </button>
                  )}
                </div>

                <div className="table-responsive">
                  <table className="roster-table">
                    <thead>
                      <tr>
                        <th>Full Name *</th>
                        <th style={{ width: '220px' }}>Class / Grade *</th>
                        <th style={{ width: '260px' }}>Phone Number *</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <input
                            type="text"
                            className={`roster-input ${
                              isDup || (!row.name.trim() && isDirtyRef.current)
                                ? 'input-error'
                                : ''
                            }`}
                            placeholder="Enter Student Full Name"
                            value={row.name}
                            onChange={(e) =>
                              handleInputChange(row.row_index, 'name', e.target.value)
                            }
                            disabled={isReadOnly}
                          />
                          {isDup && (
                            <span className="inline-error">
                              Duplicate participant detected (matching Name & Phone)
                            </span>
                          )}
                        </td>
                        <td>
                          <select
                            className="roster-input roster-select"
                            value={row.class}
                            onChange={(e) =>
                              handleInputChange(row.row_index, 'class', e.target.value)
                            }
                            disabled={isReadOnly}
                          >
                            <option value="">Select Grade</option>
                            {CLASS_OPTIONS.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="tel"
                            className={`roster-input ${
                              invalidPhone || isDup ? 'input-error' : ''
                            }`}
                            placeholder="10-digit Phone"
                            value={row.phone}
                            onChange={(e) =>
                              handleInputChange(row.row_index, 'phone', e.target.value)
                            }
                            disabled={isReadOnly}
                          />
                          {invalidPhone && (
                            <span className="inline-error">
                              Invalid phone format (10–15 digits)
                            </span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SecurePage>
  );
}
