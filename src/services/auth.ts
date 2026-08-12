import { supabase, isSupabaseConfigured } from './supabase';
import { AuthUser, AuthSession, UserRole } from '../types';

const SESSION_STORAGE_KEY = 'attendai_auth_session_v5_supabase';

export function formatPhoneAuthError(err: any): string {
  if (!err) return 'An unexpected error occurred. Please try again.';
  const rawMessage = err.message || '';
  const lower = rawMessage.toLowerCase();

  if (lower.includes('invalid phone') || lower.includes('invalid_phone') || lower.includes('formatting')) {
    return 'Please enter a valid mobile number.';
  }
  if (lower.includes('expired') || lower.includes('token has expired')) {
    return 'This OTP has expired. Please request a new one.';
  }
  if (lower.includes('invalid token') || lower.includes('token is invalid') || lower.includes('incorrect otp')) {
    return 'Incorrect OTP. Please check the code and try again.';
  }
  if (lower.includes('too many requests') || lower.includes('rate limit') || err.status === 429) {
    return 'Too many OTP requests. Please wait a few minutes and try again.';
  }
  if (lower.includes('network') || lower.includes('fetch') || lower.includes('failed to fetch')) {
    return 'Unable to connect. Please check your internet connection and try again.';
  }

  return rawMessage || 'Verification failed. Please check the OTP and try again.';
}

/**
 * Fetch or sync phone user profile in Supabase
 */
export async function fetchOrCreatePhoneUserDoc(
  uid: string,
  phone: string,
  role: UserRole = 'student'
): Promise<AuthUser> {
  const now = new Date().toISOString();
  const defaultName = `Student ${phone.slice(-4)}`;
  const fallbackEmail = `${phone.replace('+', '')}@attendai.app`;

  const userStruct: AuthUser = {
    id: uid,
    fullName: defaultName,
    email: fallbackEmail,
    phone,
    role,
    isVerified: true,
    provider: 'phone',
    rememberMe: true,
    createdAt: now,
    lastLoginAt: now,
  };

  if (!isSupabaseConfigured) {
    return userStruct;
  }

  try {
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', uid)
      .single();

    if (existingUser) {
      const updatedUser: AuthUser = {
        id: uid,
        fullName: existingUser.full_name || defaultName,
        email: existingUser.email || fallbackEmail,
        phone: existingUser.phone || phone,
        role: (existingUser.role as UserRole) || role,
        isVerified: true,
        provider: 'phone',
        rememberMe: true,
        createdAt: existingUser.created_at || now,
        lastLoginAt: now,
        photoURL: existingUser.photo_url || '',
      };

      await supabase
        .from('users')
        .update({
          last_login_at: now,
          is_verified: true,
          phone,
        })
        .eq('id', uid);

      return updatedUser;
    } else {
      await supabase.from('users').upsert({
        id: uid,
        email: fallbackEmail,
        full_name: defaultName,
        phone,
        role,
        is_verified: true,
        provider: 'phone',
        created_at: now,
        last_login_at: now,
      });

      return userStruct;
    }
  } catch (err) {
    console.warn('[Supabase Auth Sync] Warning, using local user model:', err);
    return userStruct;
  }
}

// Session Helpers
export function createSession(user: AuthUser, rememberMe: boolean = true): AuthSession {
  const duration = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const session: AuthSession = {
    user,
    token: `sb_jwt_${user.id}_${Date.now()}`,
    expiresAt: Date.now() + duration,
  };
  saveSession(session);
  return session;
}

export function saveSession(session: AuthSession): void {
  try {
    const json = JSON.stringify(session);
    if (session.user.rememberMe) {
      localStorage.setItem(SESSION_STORAGE_KEY, json);
    } else {
      sessionStorage.setItem(SESSION_STORAGE_KEY, json);
    }
  } catch (e) {
    console.error('Failed to save auth session', e);
  }
}

export function getCurrentSession(): AuthSession | null {
  try {
    const local = localStorage.getItem(SESSION_STORAGE_KEY);
    const session = sessionStorage.getItem(SESSION_STORAGE_KEY);
    const data = local || session;

    if (!data) return null;

    const parsed: AuthSession = JSON.parse(data);
    if (Date.now() > parsed.expiresAt) {
      logoutUser();
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
  } catch (e) {
    console.error('Supabase signout error', e);
  } finally {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }
}

export function refreshUserSession(): AuthSession | null {
  const current = getCurrentSession();
  if (!current) return null;

  const extension = current.user.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  current.expiresAt = Date.now() + extension;
  saveSession(current);
  return current;
}

// --- PHONE OTP AUTHENTICATION ---

/**
 * Step 1: Send OTP to Phone Number via Supabase Auth
 */
export async function requestPhoneOtp(phoneDigits: string): Promise<{ success: boolean; phone: string }> {
  const cleanDigits = phoneDigits.replace(/\D/g, '');
  if (cleanDigits.length !== 10) {
    throw new Error('Please enter a valid 10-digit mobile number.');
  }

  const fullPhone = `+91${cleanDigits}`;

  if (isSupabaseConfigured) {
    const { error } = await supabase.auth.signInWithOtp({
      phone: fullPhone,
    });

    if (error) {
      throw new Error(formatPhoneAuthError(error));
    }
  }

  return { success: true, phone: fullPhone };
}

/**
 * Step 2: Verify OTP via Supabase Auth
 */
export async function verifyPhoneOtp(
  phoneWithPrefix: string,
  otpToken: string,
  role: UserRole = 'student'
): Promise<{ user: AuthUser; session: AuthSession; isNewProfile: boolean }> {
  const cleanOtp = otpToken.trim();
  if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
    throw new Error('Please enter a valid 6-digit OTP.');
  }

  if (isSupabaseConfigured) {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phoneWithPrefix,
      token: cleanOtp,
      type: 'sms',
    });

    if (error) {
      throw new Error(formatPhoneAuthError(error));
    }

    const sbUser = data.user;
    const uid = sbUser?.id || `phone_${phoneWithPrefix.replace('+', '')}_${Date.now()}`;
    const user = await fetchOrCreatePhoneUserDoc(uid, phoneWithPrefix, role);
    const session = createSession(user, true);
    return {
      user,
      session,
      isNewProfile: !user.fullName || user.fullName.includes('Student '),
    };
  } else {
    // Local fallback for quick preview verification
    const uid = `phone_local_${phoneWithPrefix.replace('+', '')}_${Date.now()}`;
    const user = await fetchOrCreatePhoneUserDoc(uid, phoneWithPrefix, role);
    const session = createSession(user, true);
    return { user, session, isNewProfile: false };
  }
}

// Helper stub for admin reset password
export async function requestPasswordReset(email: string): Promise<{ success: boolean }> {
  return { success: true };
}
