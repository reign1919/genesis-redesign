import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loadSchoolCredentials } from '../../lib/edgeFunctions';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/authContext';
import LoadingScreen from '../../components/LoadingScreen';
import MobileBackground from '../../components/mobile/MobileBackground';
import MobileHamburger from '../../components/mobile/MobileHamburger';
import RosterSummaryView from '../../components/RosterSummaryView';
import { fetchSchoolRoster } from '../../lib/rosterHelper';
import { ArrowLeft, Printer } from 'lucide-react';
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
      try {
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
          }
        }
      } catch (err) {
        console.error('Error loading mobile review data:', err);
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
    <div className="mob-review-page">
      <MobileBackground />
      <MobileHamburger />

      <header className="mob-review-header no-print">
        <Link to="/dashboard" className="mob-back-link">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <span className="mob-header-tag label-caps">Roster Summary</span>
        <h1 className="mob-header-title">Registration Summary</h1>
      </header>

      <main className="mob-review-container">
        <RosterSummaryView
          school={school}
          eventRosters={eventRosters}
          completeCount={completeCount}
          totalSelectedCount={eventRosters.length}
          onPrint={handlePrint}
          isGated={!isEligible}
          isAdminView={false}
        />

        {isEligible && (
          <div className="mob-action-bar no-print">
            <button type="button" className="mob-btn-primary" onClick={handlePrint}>
              <Printer size={16} /> Print / Export PDF Summary
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
