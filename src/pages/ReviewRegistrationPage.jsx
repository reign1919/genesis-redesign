import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SecurePage from '../components/SecurePage';
import SEO from '../components/SEO';
import { loadSchoolCredentials } from '../lib/edgeFunctions';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/authContext';
import LoadingScreen from '../components/LoadingScreen';
import { fetchSchoolRoster } from '../lib/rosterHelper';
import RosterSummaryView from '../components/RosterSummaryView';
import { ArrowLeft, Printer } from 'lucide-react';
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
      try {
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

        // 2. Resolve school ID with robust fallbacks
        const { data: schoolUserData } = await supabase
          .from('school_users')
          .select('school_id')
          .eq('auth_user_id', sessionData.session.user.id)
          .maybeSingle();

        const schoolId =
          schoolUserData?.school_id ||
          credResult?.school?.id ||
          credResult?.school?.school_id;

        if (schoolId) {
          const rosterRes = await fetchSchoolRoster(schoolId);
          if (active && rosterRes.ok) {
            setEventRosters(rosterRes.rosters);
            setCompleteCount(rosterRes.completeCount);
            setTotalSelectedCount(rosterRes.totalSelectedCount);
          }
        }
      } catch (err) {
        console.error('Error loading desktop review data:', err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadReviewData();

    return () => {
      active = false;
    };
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
      <SEO
        title="Roster Review — Genesis 2026"
        canonical="/dashboard/review"
        noindex={true}
      />
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
