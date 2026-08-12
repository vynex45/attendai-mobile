import React from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Brain,
  Zap,
  School,
  GraduationCap,
  Building2,
  Award,
  BookOpen,
  Target,
  CheckCircle2,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { EducationType, StudentProfile } from '../types';

interface HeroSectionProps {
  profile?: StudentProfile;
  setActiveTab?: (tab: string) => void;
  onStart?: (type?: EducationType) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ profile, setActiveTab, onStart }) => {
  const studentTypes: { type: EducationType; title: string; subtitle: string; icon: any }[] = [
    { type: 'school', title: 'School Students', subtitle: 'CBSE, ICSE, State Boards (6th–12th)', icon: School },
    { type: 'college', title: 'College Students', subtitle: 'BTech, BSc, BCA, BCom, BA, MBA', icon: GraduationCap },
    { type: 'university', title: 'University Students', subtitle: 'Departmental & Semester Systems', icon: Building2 },
    { type: 'diploma', title: 'Diploma Students', subtitle: 'Polytechnic & Vocational Courses', icon: Award },
    { type: 'coaching', title: 'Coaching Institutes', subtitle: 'JEE, NEET & Foundation Batches', icon: BookOpen },
    { type: 'competitive', title: 'Competitive Aspirants', subtitle: 'UPSC, GATE, CAT & Banking', icon: Target },
  ];

  return (
    <div className="relative overflow-hidden py-12 lg:py-16 transition-all rounded-3xl my-2">
      
      {/* Dramatic Dark Background Layer with Gradient Mesh & Glow Orbs */}
      <div className="absolute inset-0 pointer-events-none -z-10 rounded-3xl overflow-hidden bg-slate-950/80 border border-white/10 backdrop-blur-3xl shadow-2xl">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-cyan-500/20 blur-[130px] rounded-full animate-aurora pointer-events-none" />
        <div className="absolute top-1/3 -left-32 w-[450px] h-[450px] bg-purple-600/25 blur-[120px] rounded-full animate-aurora-reverse pointer-events-none" />
        <div className="absolute bottom-0 -right-32 w-[500px] h-[500px] bg-pink-600/15 blur-[140px] rounded-full animate-aurora pointer-events-none" />
        
        {/* Subtle Dotted Grid Pattern overlay */}
        <div className="absolute inset-0 bg-dots-pattern opacity-40 pointer-events-none" />
        <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Announcement Pill */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 dark:bg-slate-900/60 border border-white/15 dark:border-white/10 shadow-2xl backdrop-blur-2xl text-xs text-slate-200">
            <span className="flex h-2 w-2 rounded-full bg-purple-400 animate-ping" />
            <span className="font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Version 3.0 Live
            </span>
            <span className="text-slate-600 dark:text-slate-500">•</span>
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Brain className="w-3.5 h-3.5 text-cyan-400" /> Smart AI Engine
            </span>
          </div>
        </motion.div>

        {/* Hero Headline with Animated Gradient */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.08]"
          >
            Never lose attendance.<br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 via-orange-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-text">
              Stay eligible.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto font-sans leading-relaxed"
          >
            The smartest AI-powered attendance tracker for school, college, and university students. Predict, track, and optimize your academic eligibility effortlessly.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <button
              onClick={() => setActiveTab ? setActiveTab('subjects') : (onStart && onStart())}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-full font-bold shadow-xl shadow-purple-600/30 hover:shadow-purple-500/50 hover:scale-105 active:scale-95 transition-all text-sm flex items-center justify-center gap-2 group border border-purple-400/30"
            >
              Start Tracking <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setActiveTab && setActiveTab('calculator')}
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-full font-bold border border-white/15 backdrop-blur-xl transition-all text-sm flex items-center justify-center gap-2 hover:border-white/30"
            >
              <Zap className="w-4 h-4 text-cyan-400" /> Attendance Calculator
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs font-medium text-slate-400"
          >
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> No credit card required</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> Instant Setup</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> 100% Free for Students</span>
          </motion.div>
        </div>

        {/* Animated Glassmorphism Dashboard Preview Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-14 relative max-w-5xl mx-auto"
        >
          {/* Main Mockup Container */}
          <div className="rounded-3xl p-6 bg-white/[0.04] dark:bg-slate-900/60 border border-white/15 dark:border-white/10 shadow-2xl backdrop-blur-2xl relative overflow-hidden group">
            
            {/* Soft Ambient Inner Lighting */}
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl group-hover:bg-purple-500/25 transition-all" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl group-hover:bg-cyan-500/25 transition-all" />

            <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs text-slate-400 font-mono ml-2">attendai.app/dashboard</span>
              </div>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 backdrop-blur-md">
                Live Status: Safe Zone (81.1%)
              </span>
            </div>

            {/* Mock Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
              
              {/* Stat Card 1 */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-300 font-semibold mb-1">
                  <span>Current Overall</span>
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-3xl font-extrabold text-white">81.1%</div>
                <p className="text-[11px] text-emerald-400 font-medium pt-1">
                  +6.1% above your 75% target criteria
                </p>
              </div>

              {/* Stat Card 2 */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-300 font-semibold mb-1">
                  <span>Safe Leave Buffer</span>
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-3xl font-extrabold text-white">3 Classes</div>
                <p className="text-[11px] text-cyan-300 font-medium pt-1">
                  Safe to skip next 3 classes safely
                </p>
              </div>

              {/* Stat Card 3 AI Insight */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 backdrop-blur-md space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-300 font-semibold mb-1">
                  <span className="flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-pink-400" /> Gemini Smart AI
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                </div>
                <p className="text-xs text-slate-200 font-medium leading-relaxed pt-1">
                  "⚠️ Operating Systems is at 71.4%. Attend next 4 lectures to return to safe criteria!"
                </p>
              </div>

            </div>
          </div>

          {/* Floating badge top right */}
          <div className="absolute -top-6 -right-4 hidden lg:flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-white/15 shadow-2xl backdrop-blur-xl">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <p className="font-bold text-white">Monthly Tracker</p>
              <p className="text-[11px] text-slate-400">22 Conducted • 20 Attended</p>
            </div>
          </div>

        </motion.div>

        {/* Student Type Selection Section */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Tailored for every academic level
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl mx-auto">
            Select your institution type to customize your attendance goals
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
            {studentTypes.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.type}
                  onClick={() => onStart ? onStart(item.type) : (setActiveTab && setActiveTab('subjects'))}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 p-5 rounded-3xl text-center transition-all cursor-pointer group shadow-lg backdrop-blur-xl hover:-translate-y-1"
                >
                  <div className="w-12 h-12 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform text-purple-400 border border-purple-500/30">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-extrabold text-white">
                    {item.title.split(' ')[0]}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                    {item.subtitle.split(',')[0]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
