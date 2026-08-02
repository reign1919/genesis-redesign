import React, { useEffect, useState } from 'react';
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

export default function EventDetailPage() {
  const { eventSlug } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [dbStatus, setDbStatus] = useState('not_selected');

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!active) return;
      if (!sessionData?.session) {
        navigate('/login', { replace: true });
        return;
      }

      // Find local static event details from master dataset
      const staticEvent = getEventById(eventSlug);
      if (!staticEvent) {
        setLoading(false);
        return;
      }
      setEvent(staticEvent);

      // Fetch live DB status for caller's school
      const { data: statusViewData } = await supabase
        .from('v_school_event_statuses')
        .select('*')
        .eq('event_slug', eventSlug.toLowerCase())
        .maybeSingle();

      if (active && statusViewData) {
        setDbStatus(statusViewData.status || 'not_selected');
      }

      setLoading(false);
    };

    loadData();
  }, [eventSlug, navigate]);

  const handleLogout = async () => {
    logout();
    await supabase.auth.signOut({ scope: 'local' });
    navigate('/login', { replace: true });
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!event) {
    return (
      <SecurePage
        eyebrow="Event Rack"
        title="Event Not Found"
        subtitle={`No official event found matching slug: "${eventSlug}"`}
        action={
          <Link to="/dashboard" className="secure-action">
            Back to Dashboard
          </Link>
        }
      >
        <div className="secure-card secure-status secure-status--error">
          Please check the URL or return to the dashboard events checklist.
        </div>
      </SecurePage>
    );
  }

  const statusConfig = STATUS_CONFIG[dbStatus] || STATUS_CONFIG.not_selected;
  const StatusIcon = statusConfig.icon;

  return (
    <SecurePage
      eyebrow={`GENESIS FEST // ${event.category.toUpperCase()} CLUSTER`}
      title={event.title}
      subtitle={event.brief}
      action={
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link to="/dashboard" className="secure-action">
            ← Checklist
          </Link>
          <button type="button" className="secure-action" onClick={handleLogout}>
            Log out
          </button>
        </div>
      }
    >
      <div className="event-detail-container">
        {/* Status Header Bar */}
        <div className="event-detail-status-bar secure-card">
          <div className="status-bar-info">
            <span className="label-caps">Registration Status</span>
            <div className={`status-badge-pill ${statusConfig.badgeClass}`}>
              <StatusIcon className="status-icon" />
              <span>{statusConfig.label}</span>
            </div>
          </div>
          <Link to="/dashboard" className="event-back-btn">
            <ArrowLeft size={14} /> Return to Events Checklist
          </Link>
        </div>
      </div>
    </SecurePage>
  );
}
