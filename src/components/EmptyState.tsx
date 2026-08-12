import React from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  LucideIcon,
  LayoutDashboard,
  Calendar,
  FileText,
  BookOpen,
  Clock,
  Inbox,
  ArrowRight,
} from 'lucide-react';

export type EmptyStateType = 'dashboard' | 'calendar' | 'reports' | 'subjects' | 'logs' | 'generic';

export interface EmptyStateProps {
  type?: EmptyStateType;
  icon?: LucideIcon;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  quickSteps?: Array<{
    number: string | number;
    title: string;
    desc: string;
  }>;
  className?: string;
}

const defaultIcons: Record<EmptyStateType, LucideIcon> = {
  dashboard: LayoutDashboard,
  calendar: Calendar,
  reports: FileText,
  subjects: BookOpen,
  logs: Clock,
  generic: Inbox,
};

const gradientPresets: Record<EmptyStateType, { bg: string; iconBg: string; border: string; glow: string }> = {
  dashboard: {
    bg: 'from-orange-500/5 via-amber-500/5 to-purple-500/5 dark:from-orange-950/20 dark:via-amber-950/20 dark:to-purple-950/20',
    iconBg: 'from-orange-500 to-amber-500',
    border: 'border-orange-200/60 dark:border-slate-800',
    glow: 'bg-orange-500/20',
  },
  calendar: {
    bg: 'from-amber-500/5 via-purple-500/5 to-indigo-500/5 dark:from-amber-950/20 dark:via-purple-950/20 dark:to-indigo-950/20',
    iconBg: 'from-amber-500 to-purple-600',
    border: 'border-amber-200/60 dark:border-slate-800',
    glow: 'bg-amber-500/20',
  },
  reports: {
    bg: 'from-purple-500/5 via-indigo-500/5 to-blue-500/5 dark:from-purple-950/20 dark:via-indigo-950/20 dark:to-blue-950/20',
    iconBg: 'from-purple-600 to-indigo-600',
    border: 'border-purple-200/60 dark:border-slate-800',
    glow: 'bg-purple-500/20',
  },
  subjects: {
    bg: 'from-orange-500/5 via-rose-500/5 to-purple-500/5 dark:from-orange-950/20 dark:via-rose-950/20 dark:to-purple-950/20',
    iconBg: 'from-orange-500 to-rose-500',
    border: 'border-orange-200/60 dark:border-slate-800',
    glow: 'bg-orange-500/20',
  },
  logs: {
    bg: 'from-emerald-500/5 via-teal-500/5 to-cyan-500/5 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-cyan-950/20',
    iconBg: 'from-emerald-500 to-teal-600',
    border: 'border-emerald-200/60 dark:border-slate-800',
    glow: 'bg-emerald-500/20',
  },
  generic: {
    bg: 'from-slate-500/5 via-slate-500/5 to-slate-500/5 dark:from-slate-900/40 dark:via-slate-900/40 dark:to-slate-900/40',
    iconBg: 'from-slate-700 to-slate-900',
    border: 'border-slate-200/80 dark:border-slate-800',
    glow: 'bg-slate-500/20',
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'generic',
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  quickSteps,
  className = '',
}) => {
  const IconComponent = icon || defaultIcons[type];
  const styles = gradientPresets[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`relative overflow-hidden p-8 sm:p-12 text-center rounded-3xl bg-gradient-to-br ${styles.bg} border ${styles.border} shadow-xl backdrop-blur-xl ${className}`}
    >
      {/* Editorial Backdrop Glow Effects */}
      <div className={`absolute -top-20 -left-20 w-56 h-56 ${styles.glow} rounded-full blur-3xl opacity-60 pointer-events-none`} />
      <div className={`absolute -bottom-20 -right-20 w-56 h-56 ${styles.glow} rounded-full blur-3xl opacity-60 pointer-events-none`} />

      {/* Editorial Decorative Graphic Ring & Icon */}
      <div className="relative z-10 mx-auto w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr p-0.5 shadow-xl shadow-orange-500/10 mb-6">
        <div className="w-full h-full rounded-[22px] bg-white dark:bg-slate-900 flex items-center justify-center relative overflow-hidden group">
          {/* SVG Editorial Grid Pattern Backdrop */}
          <svg
            className="absolute inset-0 w-full h-full opacity-20 text-slate-400 dark:text-slate-600"
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
            fill="none"
          >
            <defs>
              <pattern id={`empty-grid-${type}`} width="12" height="12" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#empty-grid-${type})`} />
          </svg>

          {/* Icon with soft pulse */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <IconComponent className="w-12 h-12 text-orange-500 dark:text-orange-400 stroke-[1.5] relative z-10" />
          </motion.div>

          {/* Sparkle Badge */}
          <div className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 text-white shadow-md">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Title & Description */}
      <div className="relative z-10 max-w-md mx-auto space-y-2 mb-6">
        <h3 className="font-black text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
          {description}
        </p>
      </div>

      {/* Quick Onboarding Steps (Optional) */}
      {quickSteps && quickSteps.length > 0 && (
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto my-6 text-left">
          {quickSteps.map((step, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-1 backdrop-blur-md"
            >
              <span className="w-5 h-5 rounded-full bg-gradient-to-r from-orange-500 to-purple-600 text-white text-[10px] font-black flex items-center justify-center">
                {step.number}
              </span>
              <p className="font-bold text-xs text-slate-900 dark:text-white">{step.title}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{step.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* Primary & Secondary Action Buttons */}
      {(primaryAction || secondaryAction) && (
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 pt-2">
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-black text-xs shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              {primaryAction.icon ? (
                <primaryAction.icon className="w-4 h-4" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              {primaryAction.label}
            </button>
          )}

          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-sm"
            >
              {secondaryAction.icon && <secondaryAction.icon className="w-4 h-4 text-purple-500" />}
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};
