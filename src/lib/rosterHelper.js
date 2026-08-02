import { supabase } from './supabase';
import { eventsData } from './eventsData';

/**
 * Helper to fetch event selections and detailed participant rosters for any school ID.
 * Works for both school user view and admin review modal.
 */
export async function fetchSchoolRoster(schoolId) {
  if (!schoolId) {
    return { ok: false, rosters: [], completeCount: 0, totalSelectedCount: 0 };
  }

  try {
    // 1. Fetch active event selections for school
    const { data: selectionsData, error: selErr } = await supabase
      .from('school_event_selections')
      .select('id, event_id, status, deselected_at, selected_at')
      .eq('school_id', schoolId)
      .is('deselected_at', null);

    if (selErr) {
      return { ok: false, rosters: [], completeCount: 0, totalSelectedCount: 0, error: selErr.message };
    }

    const activeSelections = selectionsData || [];
    const completedSelections = activeSelections.filter((s) =>
      ['selected_complete', 'locked', 'submitted'].includes(s.status)
    );

    // 2. Fetch participant rosters for active selections
    const rosters = await Promise.all(
      activeSelections.map(async (sel) => {
        const staticInfo = eventsData.find(
          (e) => e.id.toLowerCase() === sel.event_id.toLowerCase()
        );

        // Fetch DB event info if available
        const { data: evDb } = await supabase
          .from('events')
          .select('*')
          .eq('id', sel.event_id)
          .maybeSingle();

        const eventName = evDb?.name || staticInfo?.title || sel.event_id;
        const category = evDb?.category || staticInfo?.category || 'General';
        const teamLimit =
          evDb?.participant_limit ||
          (staticInfo ? parseInt(staticInfo.teamSize, 10) : 2);

        // Fetch participants linked to this selection
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

    return {
      ok: true,
      rosters,
      completeCount: completedSelections.length,
      totalSelectedCount: activeSelections.length,
    };
  } catch (err) {
    return { ok: false, rosters: [], completeCount: 0, totalSelectedCount: 0, error: err.message };
  }
}
