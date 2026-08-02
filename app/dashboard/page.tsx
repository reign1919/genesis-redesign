import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  CircleDashed,
  AlertCircle,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Calendar,
  Layers,
  Users,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export type SelectionStatus =
  | 'not_selected'
  | 'selected_incomplete'
  | 'selected_complete'
  | 'locked'
  | 'submitted';

export interface EventStatusItem {
  event_id: string;
  event_slug: string;
  event_name: string;
  event_description: string | null;
  participant_limit: number;
  is_active: boolean;
  eligibility_note: string | null;
  status: SelectionStatus;
  selection_id: string | null;
  selected_at: string | null;
}

async function getSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'missing-anon-key',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored when called from Server Component
          }
        },
      },
    }
  );
}

function getDeadlineDetails() {
  const currentYear = new Date().getFullYear();
  const deadline = new Date(`${currentYear}-09-14T23:59:59Z`);
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();

  if (diffMs <= 0) {
    return {
      formattedText: 'Deadline Passed',
      badgeStyle: 'bg-red-950/80 text-red-400 border-red-800/80',
    };
  }

  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const remainingHours = totalHours % 24;

  let formattedText = `${days}d ${remainingHours}h left`;
  if (days === 0) {
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    formattedText = `${remainingHours}h ${minutes}m left`;
  }

  let badgeStyle = 'bg-zinc-800/70 text-zinc-300 border-zinc-700/60';
  if (totalHours <= 48) {
    badgeStyle = 'bg-red-950/80 text-red-400 border-red-800/80 animate-pulse';
  } else if (totalHours <= 168) {
    badgeStyle = 'bg-amber-950/80 text-amber-400 border-amber-800/80';
  }

  return { formattedText, badgeStyle };
}

const STATUS_CONFIG: Record<
  SelectionStatus,
  {
    label: string;
    badgeClass: string;
    icon: React.ComponentType<{ className?: string }>;
    dotClass: string;
    cardBorder: string;
  }
> = {
  not_selected: {
    label: 'Not Selected',
    badgeClass: 'bg-zinc-900/90 text-zinc-400 border-zinc-800',
    icon: CircleDashed,
    dotClass: 'bg-zinc-700 ring-zinc-900',
    cardBorder: 'border-zinc-800/70 hover:border-zinc-700 bg-zinc-900/40',
  },
  selected_incomplete: {
    label: 'Incomplete',
    badgeClass: 'bg-amber-950/60 text-amber-400 border-amber-800/70',
    icon: AlertCircle,
    dotClass: 'bg-amber-500 ring-amber-950',
    cardBorder: 'border-amber-900/40 hover:border-amber-700/60 bg-amber-950/10',
  },
  selected_complete: {
    label: 'Complete',
    badgeClass: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/70',
    icon: CheckCircle2,
    dotClass: 'bg-emerald-500 ring-emerald-950',
    cardBorder: 'border-emerald-900/40 hover:border-emerald-700/60 bg-emerald-950/10',
  },
  locked: {
    label: 'Locked',
    badgeClass: 'bg-purple-950/60 text-purple-400 border-purple-800/70',
    icon: Lock,
    dotClass: 'bg-purple-500 ring-purple-950',
    cardBorder: 'border-purple-900/40 hover:border-purple-700/60 bg-purple-950/10',
  },
  submitted: {
    label: 'Submitted',
    badgeClass: 'bg-cyan-950/60 text-cyan-400 border-cyan-800/70',
    icon: ShieldCheck,
    dotClass: 'bg-cyan-500 ring-cyan-950',
    cardBorder: 'border-cyan-900/40 hover:border-cyan-700/60 bg-cyan-950/10',
  },
};

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  const { data: schoolUserData, error: schoolUserError } = await supabase
    .from('school_users')
    .select('school_id, schools(id, name, contact_email)')
    .eq('auth_user_id', user.id)
    .single();

  if (schoolUserError || !schoolUserData?.school_id) {
    redirect('/login');
  }

  const schoolId = schoolUserData.school_id;
  const schoolName = (schoolUserData.schools as any)?.name || 'School Dashboard';

  const { data: eventsData, error: eventsError } = await supabase
    .from('v_school_event_statuses')
    .select('*')
    .order('event_name', { ascending: true });

  let events: EventStatusItem[] = (eventsData as EventStatusItem[]) || [];

  if (eventsError || !eventsData) {
    const { data: rpcData } = await supabase.rpc('get_school_event_statuses', {
      p_school_id: schoolId,
    });
    if (rpcData) {
      events = rpcData as EventStatusItem[];
    }
  }

  const maxEventsTarget = 10;
  const minCompleteTarget = 3;
  const selectedCount = events.filter((e) => e.status !== 'not_selected').length;
  const completeCount = events.filter((e) =>
    ['selected_complete', 'locked', 'submitted'].includes(e.status)
  ).length;

  const deadline = getDeadlineDetails();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased selection:bg-zinc-800">
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur sticky top-0 z-20 px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-wide text-zinc-500 uppercase">
              <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
              Genesis Fest Registration
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-100 mt-0.5">
              {schoolName}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-medium">
              <Layers className="w-4 h-4 text-zinc-400" />
              <span className="text-zinc-400">Selected:</span>
              <span className="font-mono font-semibold text-zinc-200">
                {selectedCount}/{maxEventsTarget}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-zinc-400">Complete:</span>
              <span className="font-mono font-semibold text-emerald-400">
                {completeCount}/{minCompleteTarget}
              </span>
            </div>

            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${deadline.badgeStyle}`}
            >
              <Calendar className="w-4 h-4" />
              <span className="opacity-90">Deadline (Sep 14):</span>
              <span className="font-mono font-bold tracking-tight">
                {deadline.formattedText}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <aside className="lg:col-span-4 bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800/80">
              <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-400">
                Events Checklist ({events.length})
              </h2>
              <span className="text-xs text-zinc-500 font-mono">Select 3–10 events</span>
            </div>

            <div className="relative pl-6 space-y-4">
              <div
                className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-zinc-800/90"
                aria-hidden="true"
              />

              {events.length === 0 ? (
                <p className="text-xs text-zinc-500 py-4">No active events found.</p>
              ) : (
                events.map((event) => {
                  const statusKey = (event.status || 'not_selected') as SelectionStatus;
                  const config = STATUS_CONFIG[statusKey] || STATUS_CONFIG.not_selected;
                  const StatusIcon = config.icon;

                  return (
                    <div key={event.event_id} className="relative group">
                      <div
                        className={`absolute -left-6 top-3.5 w-2.5 h-2.5 rounded-full ring-4 ${config.dotClass} transition-transform group-hover:scale-125`}
                        aria-hidden="true"
                      />

                      <Link
                        href={`/dashboard/${event.event_slug}`}
                        className={`block p-3.5 rounded-lg border text-left transition-all ${config.cardBorder}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-sm text-zinc-200 group-hover:text-white transition-colors truncate">
                            {event.event_name}
                          </span>
                          <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-colors flex-shrink-0" />
                        </div>

                        <div className="mt-2.5 flex items-center justify-between gap-2">
                          <span className="text-xs text-zinc-500 flex items-center gap-1 font-mono">
                            <Users className="w-3 h-3 text-zinc-600" />
                            Limit: {event.participant_limit}
                          </span>

                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${config.badgeClass}`}
                          >
                            <StatusIcon className="w-3 h-3 flex-shrink-0" />
                            {config.label}
                          </span>
                        </div>
                      </Link>
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          <section className="lg:col-span-8 space-y-6">
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-6">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-4">
                <h3 className="text-base font-medium text-zinc-200">
                  Event Registration Overview
                </h3>
                <span className="text-xs font-mono px-2 py-1 bg-zinc-800/80 text-zinc-400 rounded">
                  System Mode: Live DB Status
                </span>
              </div>

              <p className="text-sm text-zinc-400 leading-relaxed">
                Select an event from the sidebar to manage school selections and participant requirements.
                Each institution must select between 3 and 10 events and complete participant details for at least 3 events prior to the September 14th deadline.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                  <div className="text-xs text-zinc-500 uppercase tracking-wider font-mono">
                    1. Select Events
                  </div>
                  <div className="text-sm font-medium text-zinc-200 mt-1">
                    Choose 3 to 10 Events
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Pick your school’s participating events from the sidebar options.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                  <div className="text-xs text-zinc-500 uppercase tracking-wider font-mono">
                    2. Complete Participants
                  </div>
                  <div className="text-sm font-medium text-zinc-200 mt-1">
                    Fill Required Roster
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Add participant details matching each event’s strict limit.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
