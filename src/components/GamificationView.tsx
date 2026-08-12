import React from 'react';
import {
  Trophy,
  Award,
  Flame,
  Zap,
  Star,
  Users,
  ShieldCheck,
  Crown,
  Sparkles,
} from 'lucide-react';
import { StudentProfile } from '../types';

interface GamificationViewProps {
  profile: StudentProfile;
}

export const GamificationView: React.FC<GamificationViewProps> = ({ profile }) => {
  // Badges list
  const badges = [
    { id: 'b1', name: '7-Day Streak Master', desc: 'Attended all classes for 7 consecutive days', icon: '🔥', unlocked: true },
    { id: 'b2', name: 'Safe Zone Champion', desc: 'Maintained >80% overall attendance', icon: '🛡️', unlocked: profile.targetPercentage >= 75 },
    { id: 'b3', name: 'OCR Tech Pioneer', desc: 'Uploaded college ERP screenshot via OCR', icon: '📷', unlocked: true },
    { id: 'b4', name: 'AI Scholar', desc: 'Consulted Gemini AI Assistant for strategy', icon: '🤖', unlocked: true },
    { id: 'b5', name: 'Perfect Month', desc: 'Zero unexcused absences in a month', icon: '🏆', unlocked: false },
    { id: 'b6', name: 'Early Bird', desc: 'Marked 10 morning lectures as Present', icon: '🌅', unlocked: true },
  ];

  // Real User Leaderboard entry
  const leaderboard = profile.name ? [
    { rank: 1, name: profile.name, institution: profile.institutionName || 'My Institution', percentage: profile.targetPercentage || 75, xp: profile.xp, streak: profile.streak },
  ] : [];

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-500" /> Gamification, Levels & Student Leaderboard
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Earn XP points for every class attended, build daily attendance streaks, unlock badges, and rank top in your institution!
        </p>
      </div>

      {/* Profile Level & XP Status Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <Crown className="w-24 h-24 text-white/10 absolute -right-4 -bottom-4" />

        <div className="space-y-2 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              Level {profile.level} Student
            </span>
            <span className="flex items-center gap-1 text-xs font-bold text-amber-200">
              <Flame className="w-4 h-4 fill-amber-300" /> {profile.streak} Days Streak
            </span>
          </div>

          <h3 className="text-2xl font-black">{profile.name}</h3>
          <p className="text-xs text-orange-100">{profile.institutionName}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center space-y-1 w-full sm:w-auto">
          <div className="flex items-center justify-center gap-1 text-2xl font-black text-amber-300">
            <Zap className="w-6 h-6 fill-amber-300" /> {profile.xp} XP
          </div>
          <p className="text-[10px] text-orange-100">Next level at 1,000 XP</p>
          <div className="w-36 h-2 bg-white/20 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-amber-300 rounded-full" style={{ width: `${(profile.xp / 1000) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-orange-500" /> Unlocked Achievement Badges
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-4 rounded-3xl border transition-all flex items-start gap-3 ${
                b.unlocked
                  ? 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-sm'
                  : 'bg-slate-100/50 dark:bg-slate-950/40 border-dashed border-slate-300 dark:border-slate-800 opacity-60'
              }`}
            >
              <div className="text-3xl p-2 rounded-2xl bg-slate-100 dark:bg-slate-800">{b.icon}</div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">{b.name}</h4>
                  {b.unlocked && <Sparkles className="w-3 h-3 text-amber-500" />}
                </div>
                <p className="text-[11px] text-slate-500">{b.desc}</p>
                <span className="inline-block text-[10px] font-bold text-orange-500 mt-1">
                  {b.unlocked ? 'UNLOCKED' : 'LOCKED'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Institution Leaderboard */}
      <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-500" /> National Student Attendance Leaderboard
        </h3>

        <div className="space-y-2 text-xs">
          {leaderboard.map((user) => (
            <div
              key={user.rank}
              className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                user.name === profile.name
                  ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-300 dark:border-orange-800 ring-1 ring-orange-500'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${
                    user.rank === 1
                      ? 'bg-amber-400 text-slate-900'
                      : user.rank === 2
                      ? 'bg-slate-300 text-slate-900'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                  }`}
                >
                  #{user.rank}
                </span>

                <div>
                  <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    {user.name} {user.name === profile.name && <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500 text-white">You</span>}
                  </p>
                  <p className="text-[10px] text-slate-500">{user.institution}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div>
                  <p className="font-extrabold text-slate-900 dark:text-white">{user.percentage}%</p>
                  <p className="text-[10px] text-orange-500 font-bold">{user.xp} XP</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
