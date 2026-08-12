import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle,
  X,
  Download,
  Upload,
  Settings2,
  Flag,
  School,
  GraduationCap,
  Building2,
  Award,
  AlertTriangle,
  RefreshCw,
  Sun,
  Lock,
  Unlock,
  Check,
} from 'lucide-react';
import { AcademicHoliday, AcademicSession, HolidayCategory, EducationType } from '../types';
import {
  HOLIDAY_CATEGORY_META,
  calculateAcademicSessionStats,
  exportAcademicCalendarJSON,
  parseAcademicCalendarJSON,
} from '../services/academicCalendar';

interface AcademicCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: AcademicSession;
  onSaveSession: (session: AcademicSession) => void;
  holidays: AcademicHoliday[];
  onSaveHolidays: (holidays: AcademicHoliday[]) => void;
  isAdmin?: boolean;
}

export const AcademicCalendarModal: React.FC<AcademicCalendarModalProps> = ({
  isOpen,
  onClose,
  session,
  onSaveSession,
  holidays,
  onSaveHolidays,
  isAdmin = false,
}) => {
  const [activeTab, setActiveTab] = useState<'holidays' | 'settings' | 'import_export'>('holidays');

  // Form State for Session
  const [sessionForm, setSessionForm] = useState<AcademicSession>({ ...session });

  // Form State for New Holiday
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newCategory, setNewCategory] = useState<HolidayCategory>('festival');
  const [newDescription, setNewDescription] = useState('');
  const [newScope, setNewScope] = useState<EducationType | 'all'>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // Import / Export state
  const [importJson, setImportJson] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const stats = calculateAcademicSessionStats(session, holidays);

  // Add Custom Holiday
  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDate) return;

    const newHol: AcademicHoliday = {
      id: `hol-custom-${Date.now()}`,
      title: newTitle.trim(),
      date: newDate,
      endDate: newEndDate || undefined,
      type: newCategory,
      description: newDescription.trim() || undefined,
      institutionScope: newScope,
    };

    const updated = [...holidays, newHol].sort((a, b) => a.date.localeCompare(b.date));
    onSaveHolidays(updated);

    // Reset Form
    setNewTitle('');
    setNewDate('');
    setNewEndDate('');
    setNewDescription('');
    setShowAddForm(false);
  };

  // Toggle Working Override for a holiday
  const handleToggleOverride = (id: string) => {
    const updated = holidays.map((h) => {
      if (h.id === id) {
        return { ...h, isWorkingOverride: !h.isWorkingOverride };
      }
      return h;
    });
    onSaveHolidays(updated);
  };

  // Delete Holiday
  const handleDeleteHoliday = (id: string) => {
    const updated = holidays.filter((h) => h.id !== id);
    onSaveHolidays(updated);
  };

  // Save Session Settings
  const handleSaveSessionSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSession(sessionForm);
  };

  // Handle Export
  const handleExport = () => {
    const jsonStr = exportAcademicCalendarJSON(session, holidays);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Academic_Calendar_${session.startDate}_to_${session.endDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle Import
  const handleImportSubmit = () => {
    setImportError(null);
    setImportSuccess(null);
    const res = parseAcademicCalendarJSON(importJson);
    if (res.error) {
      setImportError(res.error);
      return;
    }
    if (res.session) onSaveSession(res.session);
    if (res.holidays) onSaveHolidays(res.holidays);
    setImportSuccess('Academic Calendar successfully imported!');
    setImportJson('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-white flex flex-col overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-2">
                Smart Academic Calendar & Holidays Manager
              </h3>
              <p className="text-xs text-slate-400">
                Session: <span className="text-purple-300 font-bold">{session.startDate}</span> to{' '}
                <span className="text-purple-300 font-bold">{session.endDate}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* METRICS DASHBOARD STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-4 bg-slate-950/30 border-b border-slate-800 text-center text-xs">
          <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20">
            <p className="text-[10px] uppercase font-black text-purple-400">Teaching Days</p>
            <p className="text-lg font-black text-white mt-0.5">{stats.totalWorkingTeachingDays}</p>
          </div>
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
            <p className="text-[10px] uppercase font-black text-indigo-400">Sundays</p>
            <p className="text-lg font-black text-white mt-0.5">{stats.totalSundays}</p>
          </div>
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
            <p className="text-[10px] uppercase font-black text-cyan-400">2nd Saturdays</p>
            <p className="text-lg font-black text-white mt-0.5">{stats.totalSecondSaturdays}</p>
          </div>
          <div className="p-2.5 rounded-2xl bg-pink-500/10 border border-pink-500/20">
            <p className="text-[10px] uppercase font-black text-pink-400">Public Holidays</p>
            <p className="text-lg font-black text-white mt-0.5">{stats.totalPublicHolidays}</p>
          </div>
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 col-span-2 sm:col-span-1">
            <p className="text-[10px] uppercase font-black text-emerald-400">Remaining Days</p>
            <p className="text-lg font-black text-white mt-0.5">{stats.remainingWorkingDays}</p>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex border-b border-slate-800 px-6 pt-3 gap-3 bg-slate-950/20 text-xs font-bold">
          <button
            onClick={() => setActiveTab('holidays')}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'holidays'
                ? 'border-purple-500 text-purple-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Holidays List ({holidays.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'border-purple-500 text-purple-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Settings2 className="w-4 h-4" /> Session Configuration
          </button>
          <button
            onClick={() => setActiveTab('import_export')}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'import_export'
                ? 'border-purple-500 text-purple-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Download className="w-4 h-4" /> Import / Export Calendar
          </button>
        </div>

        {/* TAB CONTENT BODY */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Admin Permission Warning Banner */}
          {!isAdmin && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between font-medium">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Student Read-Only Mode:</strong> Only Institution Administrators can add, edit, or delete holidays and change academic session dates.
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-200 text-[10px] font-bold uppercase tracking-wider shrink-0">
                Admin Privilege Required
              </span>
            </div>
          )}

          {/* TAB 1: HOLIDAYS LIST & MANAGEMENT */}
          {activeTab === 'holidays' && (
            <div className="space-y-5">
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">Public, Festival & Custom Holidays</h4>
                  <p className="text-xs text-slate-400">
                    These non-working days are locked from attendance calculations unless overridden.
                  </p>
                </div>
                {isAdmin ? (
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:scale-105 transition-all"
                  >
                    <Plus className="w-4 h-4" /> Add Custom Holiday
                  </button>
                ) : (
                  <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400 text-xs font-bold flex items-center gap-1.5 cursor-not-allowed">
                    <Lock className="w-3.5 h-3.5 text-slate-500" /> Admin Only To Add
                  </div>
                )}
              </div>

              {/* ADD HOLIDAY FORM */}
              {showAddForm && (
                <form
                  onSubmit={handleAddHoliday}
                  className="p-4 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-3 animate-in fade-in"
                >
                  <h5 className="font-extrabold text-xs text-purple-300 uppercase tracking-wider">
                    Add New Holiday / Non-Working Event
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] text-slate-400 font-bold mb-1">Holiday Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Founders Day / Local Festival"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:border-purple-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 font-bold mb-1">Category</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value as HolidayCategory)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:border-purple-500 outline-none"
                      >
                        <option value="festival">Festival Holiday</option>
                        <option value="national">National Holiday</option>
                        <option value="school">School Holiday</option>
                        <option value="college">College Holiday</option>
                        <option value="university">University Holiday</option>
                        <option value="custom">Custom Institution Holiday</option>
                        <option value="emergency">Emergency Closure</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 font-bold mb-1">Start Date *</label>
                      <input
                        type="date"
                        required
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:border-purple-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 font-bold mb-1">End Date (Optional)</label>
                      <input
                        type="date"
                        value={newEndDate}
                        onChange={(e) => setNewEndDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:border-purple-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 font-bold mb-1">Description / Reason</label>
                    <input
                      type="text"
                      placeholder="e.g. Annual sports break / Special Govt declaration"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:border-purple-500 outline-none text-xs"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-extrabold hover:bg-purple-500 shadow-md"
                    >
                      Save Holiday
                    </button>
                  </div>
                </form>
              )}

              {/* HOLIDAY CARDS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {holidays.map((hol) => {
                  const catMeta = HOLIDAY_CATEGORY_META[hol.type] || HOLIDAY_CATEGORY_META.custom;
                  return (
                    <div
                      key={hol.id}
                      className={`p-4 rounded-2xl bg-slate-950/60 border ${catMeta.borderCol} space-y-2 relative group hover:border-purple-500/50 transition-all`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${catMeta.badgeBg} ${catMeta.textCol} border ${catMeta.borderCol}`}
                          >
                            {catMeta.label}
                          </span>
                          <h5 className="font-extrabold text-sm text-white mt-1.5">{hol.title}</h5>
                          <p className="text-xs text-purple-300 font-bold mt-0.5">
                            📅 {hol.date} {hol.endDate ? `to ${hol.endDate}` : ''}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleOverride(hol.id)}
                            title={hol.isWorkingOverride ? 'Class Conducted Override (Unlocked)' : 'Locked Non-working Holiday'}
                            className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                              hol.isWorkingOverride
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                            }`}
                          >
                            {hol.isWorkingOverride ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => handleDeleteHoliday(hol.id)}
                            title="Delete Holiday"
                            className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {hol.description && <p className="text-[11px] text-slate-400">{hol.description}</p>}

                      {hol.isWorkingOverride && (
                        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[10px] font-bold text-amber-300 flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-amber-400" /> Admin Override: Classes conducted on this day
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SESSION CONFIGURATION */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSessionSettings} className="space-y-5">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h4 className="font-extrabold text-sm text-purple-300 uppercase tracking-wider flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-purple-400" /> Academic Session Dates
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Session Name</label>
                    <input
                      type="text"
                      value={sessionForm.name}
                      onChange={(e) => setSessionForm({ ...sessionForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold focus:border-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Institution Name</label>
                    <input
                      type="text"
                      value={sessionForm.institutionName || ''}
                      onChange={(e) => setSessionForm({ ...sessionForm, institutionName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold focus:border-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Session Start Date</label>
                    <input
                      type="date"
                      value={sessionForm.startDate}
                      onChange={(e) => setSessionForm({ ...sessionForm, startDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold focus:border-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Session End Date</label>
                    <input
                      type="date"
                      value={sessionForm.endDate}
                      onChange={(e) => setSessionForm({ ...sessionForm, endDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold focus:border-purple-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* AUTOMATIC HOLIDAY DETECTION */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h4 className="font-extrabold text-sm text-purple-300 uppercase tracking-wider flex items-center gap-2">
                  <Sun className="w-4 h-4 text-purple-400" /> Automatic Weekly Holidays
                </h4>

                <div className="space-y-3 text-xs">
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800/80 cursor-pointer hover:bg-slate-850">
                    <input
                      type="checkbox"
                      checked={sessionForm.autoHolidayDetection}
                      onChange={(e) => setSessionForm({ ...sessionForm, autoHolidayDetection: e.target.checked })}
                      className="w-4 h-4 accent-purple-500 rounded"
                    />
                    <div>
                      <p className="font-bold text-white">Enable Automatic Weekly Holiday Detection</p>
                      <p className="text-[11px] text-slate-400">
                        Automatically lock Sundays and second Saturdays from attendance counting.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800/80 cursor-pointer hover:bg-slate-850">
                    <input
                      type="checkbox"
                      checked={sessionForm.secondSaturdayOff}
                      onChange={(e) => setSessionForm({ ...sessionForm, secondSaturdayOff: e.target.checked })}
                      className="w-4 h-4 accent-purple-500 rounded"
                    />
                    <div>
                      <p className="font-bold text-white">Every Second Saturday Non-Working</p>
                      <p className="text-[11px] text-slate-400">
                        Automatically mark 2nd Saturday of every month as institutional holiday.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                {isAdmin ? (
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 hover:scale-105 transition-all"
                  >
                    Save Academic Session
                  </button>
                ) : (
                  <div className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold flex items-center gap-2 cursor-not-allowed border border-slate-700">
                    <Lock className="w-3.5 h-3.5" /> Admin Permission Required To Save
                  </div>
                )}
              </div>
            </form>
          )}

          {/* TAB 3: IMPORT / EXPORT */}
          {activeTab === 'import_export' && (
            <div className="space-y-5 text-xs">
              
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-purple-400" /> Export Academic Calendar
                </h4>
                <p className="text-slate-400">
                  Export the active session boundaries, weekly rules, and holiday lists as a standardized JSON file.
                </p>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white font-extrabold flex items-center gap-2 shadow-md hover:bg-purple-500 transition-all"
                >
                  <Download className="w-4 h-4" /> Download Academic Calendar JSON
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-400" /> Import Institution Calendar
                </h4>
                <p className="text-slate-400">
                  Paste JSON configuration to load an official institution academic calendar.
                </p>

                {importError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 font-bold">
                    ⚠️ {importError}
                  </div>
                )}
                {importSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold">
                    ✅ {importSuccess}
                  </div>
                )}

                <textarea
                  rows={6}
                  disabled={!isAdmin}
                  placeholder={isAdmin ? "Paste Academic Calendar JSON here..." : "Admin privileges required to import academic calendar JSON."}
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:border-purple-500 outline-none disabled:opacity-50"
                />

                {isAdmin ? (
                  <button
                    onClick={handleImportSubmit}
                    disabled={!importJson.trim()}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white font-extrabold flex items-center gap-2 shadow-md hover:bg-blue-500 disabled:opacity-50 transition-all"
                  >
                    <Upload className="w-4 h-4" /> Import JSON Calendar
                  </button>
                ) : (
                  <div className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold inline-flex items-center gap-2 cursor-not-allowed border border-slate-700">
                    <Lock className="w-3.5 h-3.5" /> Admin Only Import
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
