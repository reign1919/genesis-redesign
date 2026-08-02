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

import RosterSummaryView from '../components/RosterSummaryView';

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
        <Link to="/dashboard" className="secure-action flex items-center gap-1.5 no-print">
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
      }
    >
      <div className="review-workspace">
        <RosterSummaryView
          school={school}
          eventRosters={eventRosters}
          completeCount={completeCount}
          totalSelectedCount={totalSelectedCount}
          onPrint={handlePrint}
          isGated={!isEligible}
          isAdminView={false}
        />
        <div className="review-bottom-bar no-print mt-4">
          <Link to="/dashboard" className="review-btn-secondary">
            <ArrowLeft size={16} /> Return to Dashboard
          </Link>
          <button type="button" className="review-btn-primary" onClick={handlePrint}>
            <Printer size={16} /> Export PDF / Print Summary
          </button>
        </div>
      </div>
    </SecurePage>
  );
}
