import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Zap, Heart, RefreshCw, Mail, MessageSquare, Send, CheckCircle2, X, PhoneCall, HelpCircle, Clock } from 'lucide-react';
import { StudentProfile } from '../types';

interface FooterProps {
  onResetData?: () => void;
  setActiveTab?: (tab: string) => void;
  profile?: StudentProfile;
  onOpenOnboarding?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onResetData, setActiveTab, profile }) => {
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactName, setContactName] = useState(profile?.name || '');
  const [contactEmail, setContactEmail] = useState(profile?.email || '');
  const [contactCategory, setContactCategory] = useState('Support Query');
  const [contactMessage, setContactMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowContactModal(false);
      setContactMessage('');
    }, 2200);
  };

  return (
    <footer className="mt-16 border-t border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-500 via-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
                A
              </div>
              <span className="font-serif italic font-bold text-2xl text-slate-900 dark:text-white">
                AttendAI
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              Never lose attendance. The ultimate AI-powered attendance tracking platform for School, College, University, and Competitive exam students across India & worldwide.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 font-medium">
                <Shield className="w-3.5 h-3.5 text-emerald-500" /> Safe & Local First
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium">
                <Zap className="w-3.5 h-3.5 text-orange-500" /> AI Powered Intelligence
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">Features</h4>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li><button onClick={() => setActiveTab?.('calculator')} className="hover:text-purple-400 transition-colors cursor-pointer">Attendance Calculator</button></li>
              <li><button onClick={() => setActiveTab?.('ai-assistant')} className="hover:text-purple-400 transition-colors cursor-pointer">AI Attendance Predictor</button></li>
              <li><button onClick={() => setActiveTab?.('calendar')} className="hover:text-purple-400 transition-colors cursor-pointer">Calendar & Heatmap</button></li>
              <li><button onClick={() => setActiveTab?.('dashboard')} className="hover:text-purple-400 transition-colors cursor-pointer">Daily Punch Logs</button></li>
              <li><button onClick={() => setActiveTab?.('gamification')} className="hover:text-purple-400 transition-colors cursor-pointer">Rewards & Streaks</button></li>
            </ul>
          </div>

          {/* Settings & System */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">System</h4>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li><button onClick={() => setActiveTab?.('settings')} className="hover:text-purple-400 transition-colors cursor-pointer">Theme Customization</button></li>
              <li><button onClick={() => setActiveTab?.('settings')} className="hover:text-purple-400 transition-colors cursor-pointer">Language Settings</button></li>
              <li><button onClick={() => setActiveTab?.('reports')} className="hover:text-purple-400 transition-colors cursor-pointer">Export Reports & CSV</button></li>
              <li>
                <button
                  onClick={() => onResetData?.()}
                  className="flex items-center gap-1 text-red-500 hover:text-red-400 font-medium transition-colors mt-2 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Clear All Saved Data
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Us Section at Bottom */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-purple-500" /> Contact Us
            </h4>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <a
                href="mailto:support@attendai.app"
                className="flex items-center gap-2 hover:text-purple-400 transition-colors group"
              >
                <div className="w-6 h-6 rounded-md bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20">
                  <Mail className="w-3 h-3" />
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">support@attendai.app</span>
              </a>

              <div className="flex items-center gap-2 text-slate-500">
                <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Clock className="w-3 h-3" />
                </div>
                <span className="text-[11px]">Replies within 2 hours</span>
              </div>

              <button
                onClick={() => setShowContactModal(true)}
                className="w-full mt-2 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Send Us a Message</span>
              </button>
            </div>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <p>© {new Date().getFullYear()} AttendAI SaaS. Designed for ambitious students everywhere.</p>
            <button
              onClick={() => setShowContactModal(true)}
              className="text-purple-500 dark:text-purple-400 font-bold hover:underline cursor-pointer"
            >
              Contact Support
            </button>
          </div>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>for academic eligibility & peace of mind.</span>
          </div>
        </div>
      </div>

      {/* Interactive Contact Us Modal */}
      <AnimatePresence>
        {showContactModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
            >
              <button
                onClick={() => setShowContactModal(false)}
                className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Contact AttendAI Support</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Have questions, feedback, or need help with attendance goals?</p>
                </div>
              </div>

              {submitted ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">Message Sent Successfully!</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                    Thank you for contacting AttendAI. Our student support team will reply to <span className="font-bold text-slate-700 dark:text-slate-200">{contactEmail || 'your email'}</span> shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitContact} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="e.g. Alex Sharma"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="e.g. alex@university.edu"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">Topic / Category</label>
                    <select
                      value={contactCategory}
                      onChange={(e) => setContactCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                      <option value="Support Query">Support / Help with Attendance</option>
                      <option value="Feature Request">Suggest a New Feature</option>
                      <option value="Bug Report">Report an Issue or Bug</option>
                      <option value="General Feedback">General Feedback</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">Your Message</label>
                    <textarea
                      required
                      rows={4}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Type your message, query, or suggestion here..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                      <span>Direct email: support@attendai.app</span>
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send Message</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
};

