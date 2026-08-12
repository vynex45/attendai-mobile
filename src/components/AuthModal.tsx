import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Phone,
  ShieldCheck,
  Zap,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  GraduationCap,
  User,
  Building2,
  Lock,
} from 'lucide-react';
import { requestPhoneOtp, verifyPhoneOtp } from '../services/auth';
import { AuthUser, AuthSession, UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess: (user: AuthUser, session: AuthSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  // Step State: 1 = Phone Input, 2 = OTP Verification
  const [step, setStep] = useState<1 | 2>(1);

  // Form State
  const [phoneDigits, setPhoneDigits] = useState('');
  const [formattedPhone, setFormattedPhone] = useState('');
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [role, setRole] = useState<UserRole>('student');

  // UI Status State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Resend Timer State
  const [resendTimer, setResendTimer] = useState(30);

  // Refs for 6-digit OTP inputs
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus input on initial mount or step change
  const phoneInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (step === 1 && phoneInputRef.current) {
        setTimeout(() => phoneInputRef.current?.focus(), 150);
      } else if (step === 2 && inputRefs.current[0]) {
        setTimeout(() => inputRefs.current[0]?.focus(), 150);
      }
    }
  }, [isOpen, step]);

  // Countdown timer effect for Step 2
  useEffect(() => {
    let interval: any = null;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, resendTimer]);

  if (!isOpen) return null;

  // Format phone e.g. "98765 43210" for visual display
  const displayPhoneFormatted = (digits: string) => {
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  };

  // --- STEP 1: SEND OTP HANDLER ---
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanDigits = phoneDigits.replace(/\D/g, '');
    if (cleanDigits.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    try {
      setLoading(true);
      const res = await requestPhoneOtp(cleanDigits);
      setFormattedPhone(res.phone);
      setSuccessMsg(`OTP sent to +91 ${displayPhoneFormatted(cleanDigits)}`);
      setStep(2);
      setResendTimer(30);
      setOtp(['', '', '', '', '', '']);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 2: VERIFY OTP HANDLER ---
  const handleVerifyOtp = async (otpCode?: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const codeToVerify = otpCode || otp.join('');
    if (codeToVerify.length !== 6 || !/^\d{6}$/.test(codeToVerify)) {
      setErrorMsg('Please enter a valid 6-digit OTP.');
      return;
    }

    try {
      setLoading(true);
      const { user, session } = await verifyPhoneOtp(formattedPhone, codeToVerify, role);
      setSuccessMsg('Authentication successful! Directing to AttendAI...');
      setTimeout(() => {
        onSuccess(user, session);
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Incorrect OTP. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP trigger
  const handleResendOtp = async () => {
    if (resendTimer > 0 || loading) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      setLoading(true);
      const cleanDigits = phoneDigits.replace(/\D/g, '');
      await requestPhoneOtp(cleanDigits);
      setResendTimer(30);
      setOtp(['', '', '', '', '', '']);
      setSuccessMsg(`A new OTP has been sent to +91 ${displayPhoneFormatted(cleanDigits)}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend OTP. Please wait a moment.');
    } finally {
      setLoading(false);
    }
  };

  // OTP Input Changes
  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric digit
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-advance to next box if digit typed
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all 6 filled
    const fullCode = newOtp.join('');
    if (fullCode.length === 6 && /^\d{6}$/.test(fullCode)) {
      handleVerifyOtp(fullCode);
    }
  };

  // Handle Backspace navigation across OTP boxes
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  // Handle Paste event for complete OTP
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      handleVerifyOtp(pastedData);
    }
  };

  // Return to step 1
  const handleBackToPhoneStep = () => {
    setStep(1);
    setErrorMsg(null);
    setSuccessMsg(null);
    setOtp(['', '', '', '', '', '']);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto"
      >
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative p-6 sm:p-7 space-y-6">
          {/* HEADER STATUS CARD */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-emerald-500/30 text-slate-100 text-xs space-y-1.5 shadow-sm relative overflow-hidden backdrop-blur-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-black tracking-wide text-white uppercase">
                  Secure Phone Authentication
                </span>
              </div>
              <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0 flex items-center gap-1">
                <Zap className="w-2.5 h-2.5 fill-emerald-400 text-emerald-400 animate-pulse" />
                OTP SECURED
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-300 font-medium">
              Your account is protected with secure OTP verification powered by Supabase.
            </p>
          </div>

          {/* FEEDBACK MESSAGES */}
          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 shadow-sm"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-semibold text-[11px] leading-relaxed">{errorMsg}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold text-[11px] leading-relaxed">{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STEP 1: ENTER PHONE NUMBER */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Welcome Back to AttendAI
                </h2>
                <p className="text-xs text-slate-400 mt-1.5 font-medium">
                  Sign in with your mobile number to continue.
                </p>
              </div>

              {/* ACCOUNT ROLE SELECTOR */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Select Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`py-2 px-2 rounded-xl border text-[11px] font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      role === 'student'
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/10'
                        : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" /> Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('teacher')}
                    className={`py-2 px-2 rounded-xl border text-[11px] font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      role === 'teacher'
                        ? 'bg-blue-500/20 border-blue-500 text-blue-300 shadow-md shadow-blue-500/10'
                        : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" /> Teacher
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`py-2 px-2 rounded-xl border text-[11px] font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      role === 'admin'
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-md shadow-purple-500/10'
                        : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" /> Admin
                  </button>
                </div>
              </div>

              {/* PHONE INPUT FORM */}
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Mobile Phone Number
                  </label>
                  <div className="relative flex items-center">
                    {/* Country Code Badge */}
                    <div className="absolute left-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-white font-black text-xs shrink-0 select-none">
                      <span className="text-sm">🇮🇳</span>
                      <span>+91</span>
                    </div>

                    <input
                      ref={phoneInputRef}
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      value={phoneDigits}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhoneDigits(digits);
                        if (errorMsg) setErrorMsg(null);
                      }}
                      placeholder="Enter mobile number"
                      disabled={loading}
                      className="w-full pl-24 pr-4 py-3 rounded-2xl border border-slate-800 bg-slate-950 text-white font-bold text-sm tracking-widest placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 pl-1 font-medium">
                    Example: 9876543210
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || phoneDigits.length !== 10}
                  className={`w-full py-3.5 rounded-2xl text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 ${
                    loading || phoneDigits.length !== 10
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                      : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-cyan-500/25 cursor-pointer hover:scale-[1.01] active:scale-[0.99]'
                  }`}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Send OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <p className="text-[10px] text-center text-slate-500 font-medium leading-relaxed px-2">
                By continuing, you agree to AttendAI's{' '}
                <span className="text-slate-400 hover:text-white cursor-pointer underline">Terms of Service</span>{' '}
                &{' '}
                <span className="text-slate-400 hover:text-white cursor-pointer underline">Privacy Policy</span>.
              </p>
            </div>
          )}

          {/* STEP 2: OTP VERIFICATION */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Verify Your Number
                </h2>
                <p className="text-xs text-slate-400 mt-1.5 font-medium leading-relaxed">
                  Enter the 6-digit OTP sent to{' '}
                  <span className="text-cyan-400 font-bold">
                    +91 {displayPhoneFormatted(phoneDigits)}
                  </span>
                </p>
              </div>

              {/* 6 OTP DIGIT INPUT BOXES */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      disabled={loading}
                      className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-black rounded-2xl border border-slate-800 bg-slate-950 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all shadow-inner"
                    />
                  ))}
                </div>
              </div>

              {/* VERIFY BUTTON */}
              <button
                type="button"
                onClick={() => handleVerifyOtp()}
                disabled={loading || otp.join('').length !== 6}
                className={`w-full py-3.5 rounded-2xl text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 ${
                  loading || otp.join('').length !== 6
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                    : 'bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 shadow-emerald-500/25 cursor-pointer hover:scale-[1.01] active:scale-[0.99]'
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* RESEND OTP & CHANGE NUMBER ACTIONS */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={handleBackToPhoneStep}
                  disabled={loading}
                  className="text-slate-400 hover:text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change phone number</span>
                </button>

                <div className="text-slate-400 font-medium flex items-center gap-1">
                  <span>Didn't receive code?</span>
                  {resendTimer > 0 ? (
                    <span className="text-slate-500 font-bold">
                      Resend OTP in {resendTimer}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading}
                      className="text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer ml-1"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
