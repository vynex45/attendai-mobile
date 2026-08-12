import { supabase, isSupabaseConfigured } from './supabase';

export interface ActivityLog {
  id: string;
  action: string;
  user: string;
  details: string;
  type: 'role' | 'settings' | 'deletion' | 'user_status' | 'calendar' | 'announcement' | 'security' | 'general';
  timestamp: string;
  rawDate?: number;
}

const LOCAL_LOGS_KEY = 'attendai_activity_logs_v1';

function getLocalLogs(): ActivityLog[] {
  try {
    const raw = localStorage.getItem(LOCAL_LOGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalLogs(logs: ActivityLog[]) {
  try {
    localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(logs.slice(0, 200)));
  } catch {}
}

/**
 * Log a critical admin activity to Supabase database (or local storage fallback)
 */
export async function logAdminActivity(
  action: string,
  details: string,
  type: ActivityLog['type'] = 'general',
  userEmail: string = 'ytshivam5818@gmail.com'
): Promise<void> {
  const newLog: ActivityLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    action,
    details,
    type,
    user: userEmail,
    timestamp: new Date().toISOString(),
    rawDate: Date.now(),
  };

  // Always store locally as fallback
  const currentLogs = getLocalLogs();
  saveLocalLogs([newLog, ...currentLogs]);

  if (!isSupabaseConfigured) return;

  try {
    await supabase.from('activity_logs').insert([
      {
        id: newLog.id,
        action: newLog.action,
        details: newLog.details,
        type: newLog.type,
        user_email: newLog.user,
        timestamp: newLog.timestamp,
        raw_date: newLog.rawDate,
      },
    ]);
  } catch (err) {
    console.warn('[ActivityLogger] Error logging activity to Supabase:', err);
  }
}

/**
 * Subscribe to real-time activity logs from Supabase or local storage fallback
 */
export function subscribeToActivityLogs(
  callback: (logs: ActivityLog[]) => void,
  maxLogs: number = 100
) {
  // Emit local logs immediately
  callback(getLocalLogs().slice(0, maxLogs));

  if (!isSupabaseConfigured) {
    return () => {};
  }

  // Initial fetch from Supabase
  supabase
    .from('activity_logs')
    .select('*')
    .order('raw_date', { ascending: false })
    .limit(maxLogs)
    .then(({ data, error }) => {
      if (!error && data && data.length > 0) {
        const mapped: ActivityLog[] = data.map((d: any) => ({
          id: d.id,
          action: d.action || 'ACTIVITY',
          user: d.user_email || d.user || 'Admin',
          details: d.details || 'No details provided.',
          type: d.type || 'general',
          timestamp: d.timestamp
            ? new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
              ' ' +
              new Date(d.timestamp).toLocaleDateString()
            : new Date().toLocaleTimeString(),
          rawDate: d.raw_date || Date.now(),
        }));
        callback(mapped);
      }
    });

  // Real-time subscription
  const channel = supabase
    .channel('activity_logs_realtime')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'activity_logs' },
      (payload) => {
        const d = payload.new;
        const newLog: ActivityLog = {
          id: d.id,
          action: d.action,
          user: d.user_email || 'Admin',
          details: d.details,
          type: d.type || 'general',
          timestamp: d.timestamp
            ? new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : new Date().toLocaleTimeString(),
          rawDate: d.raw_date || Date.now(),
        };
        const current = getLocalLogs();
        const updated = [newLog, ...current].slice(0, maxLogs);
        saveLocalLogs(updated);
        callback(updated);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
