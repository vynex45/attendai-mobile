import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  AlertTriangle,
  ShieldCheck,
  User,
  MapPin,
  Award,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { EmptyState } from './EmptyState';
import { Subject, AttendanceRecord } from '../types';
import { calculateSubjectPercentage, calculateRequiredForSubject } from '../services/storage';

interface SubjectManagerProps {
  subjects: Subject[];
  records: AttendanceRecord[];
  onSaveSubject: (sub: Subject) => void;
  onDeleteSubject: (subjectId: string) => void;
  onClearAllSubjects?: () => void;
  targetPercentage: number;
}

export const SubjectManager: React.FC<SubjectManagerProps> = ({
  subjects,
  records,
  onSaveSubject,
  onDeleteSubject,
  onClearAllSubjects,
  targetPercentage,
}) => {
  const [editingSubject, setEditingSubject] = useState<Partial<Subject> | null>(null);
  const [selectedSubjectLog, setSelectedSubjectLog] = useState<Subject | null>(null);
  const [showConfirmClearAll, setShowConfirmClearAll] = useState<boolean>(false);

  const colors = [
    '#3b82f6', // blue
    '#f97316', // orange
    '#10b981', // emerald
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#eab308', // yellow
    '#ef4444', // red
  ];

  const handleOpenNew = () => {
    setEditingSubject({
      id: `sub-${Date.now()}`,
      name: '',
      code: '',
      teacherName: '',
      roomNumber: '',
      credits: 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      minAttendance: targetPercentage,
      totalClasses: 0,
      attendedClasses: 0,
      missedClasses: 0,
      leaveClasses: 0,
      medicalLeaveClasses: 0,
      lateClasses: 0,
    });
  };

  const handleSave = () => {
    if (!editingSubject?.name) return;
    onSaveSubject(editingSubject as Subject);
    setEditingSubject(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-orange-500" /> Subject & Course Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your courses, faculty info, credit points, and minimum required attendance thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {subjects.length > 0 && (
            <button
              onClick={() => setShowConfirmClearAll(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 font-bold text-xs hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Remove All Subjects
            </button>
          )}
          <button
            onClick={handleOpenNew}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-purple-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 hover:opacity-95 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Add New Subject
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Remove All */}
      {showConfirmClearAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-500 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                Remove All Subjects?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Are you sure you want to remove all {subjects.length} subjects from your schedule? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmClearAll(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onClearAllSubjects) {
                    onClearAllSubjects();
                  } else {
                    subjects.forEach((s) => onDeleteSubject(s.id));
                  }
                  setShowConfirmClearAll(false);
                }}
                className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs shadow-md shadow-red-500/20 transition-all"
              >
                Yes, Remove All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Subject Cards */}
      {subjects.length === 0 ? (
        <EmptyState
          type="subjects"
          title="No Subjects Added Yet"
          description="Start building your academic schedule by adding your courses, setting required attendance criteria (75%, 80%, etc.), or tracking safe leaves."
          primaryAction={{
            label: 'Add Your First Subject',
            onClick: handleOpenNew,
            icon: Plus,
          }}
          quickSteps={[
            { number: '1', title: 'Add Courses', desc: 'Enter course title, code & teacher' },
            { number: '2', title: 'Set Goal %', desc: 'Custom min attendance threshold' },
            { number: '3', title: 'Log Classes', desc: 'Track present & safe leaves' },
          ]}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((sub) => {
            const pct = calculateSubjectPercentage(sub);
          const { required, safe } = calculateRequiredForSubject(
            sub.attendedClasses,
            sub.totalClasses,
            sub.minAttendance
          );
          const isRisk = pct < sub.minAttendance;

          return (
            <div
              key={sub.id}
              className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all space-y-4 relative group"
            >
              {/* Top Accent bar & Name */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-12 rounded-full shrink-0"
                    style={{ backgroundColor: sub.color }}
                  />
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                      {sub.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {sub.code || 'Course Code TBA'} • {sub.credits || 3} Credits
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingSubject(sub)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Edit Subject"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteSubject(sub.id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                    title="Delete Subject"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Faculty & Room details */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <User className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span className="truncate">{sub.teacherName || 'Faculty TBA'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  <span className="truncate">{sub.roomNumber || 'Room TBA'}</span>
                </div>
              </div>

              {/* Attendance percentage gauge & status */}
              <div>
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Current Status</span>
                  <span
                    className={`font-extrabold text-sm px-2.5 py-0.5 rounded-full ${
                      isRisk
                        ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {pct}%
                  </span>
                </div>

                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 relative">
                  <motion.div
                    className={`h-full rounded-full ${
                      isRisk ? 'bg-gradient-to-r from-red-500 to-amber-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(pct, 100)}%` }}
                    transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
                  />
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-900 dark:bg-white z-10 opacity-60"
                    style={{ left: `${Math.min(sub.minAttendance || targetPercentage, 100)}%` }}
                    title={`Goal: ${sub.minAttendance}%`}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-medium">
                  <span>{sub.attendedClasses} Attended / {sub.totalClasses} Conducted</span>
                  <span>Goal: {sub.minAttendance}%</span>
                </div>
              </div>

              {/* Smart Calculator Pill */}
              <div className="pt-1">
                {isRisk ? (
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/50 text-[11px] text-amber-900 dark:text-amber-200 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>
                      Must attend <strong>{required} consecutive classes</strong> to reach {sub.minAttendance}%!
                    </span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/50 text-[11px] text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>
                      Safe! You can skip up to <strong>{safe} classes</strong> safely.
                    </span>
                  </div>
                )}
              </div>

              {/* View History Button */}
              <button
                onClick={() => setSelectedSubjectLog(sub)}
                className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-orange-500" /> View Detailed Log History
              </button>
            </div>
          );
        })}
      </div>
      )}

      {/* ADD / EDIT SUBJECT MODAL */}
      {editingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {editingSubject.id ? 'Edit Subject Details' : 'Add New Subject'}
              </h3>
              <button
                onClick={() => setEditingSubject(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  value={editingSubject.name || ''}
                  onChange={(e) => setEditingSubject({ ...editingSubject, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="e.g. Data Structures & Algorithms"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subject Code
                  </label>
                  <input
                    type="text"
                    value={editingSubject.code || ''}
                    onChange={(e) => setEditingSubject({ ...editingSubject, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="e.g. CS301"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Credits
                  </label>
                  <input
                    type="number"
                    value={editingSubject.credits || 3}
                    onChange={(e) => setEditingSubject({ ...editingSubject, credits: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Teacher / Faculty Name
                  </label>
                  <input
                    type="text"
                    value={editingSubject.teacherName || ''}
                    onChange={(e) => setEditingSubject({ ...editingSubject, teacherName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="e.g. Dr. Ramesh"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Room / Lab Number
                  </label>
                  <input
                    type="text"
                    value={editingSubject.roomNumber || ''}
                    onChange={(e) => setEditingSubject({ ...editingSubject, roomNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="e.g. LH-201"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Total Classes Conducted
                  </label>
                  <input
                    type="number"
                    value={editingSubject.totalClasses || 0}
                    onChange={(e) => setEditingSubject({ ...editingSubject, totalClasses: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Classes Attended
                  </label>
                  <input
                    type="number"
                    value={editingSubject.attendedClasses || 0}
                    onChange={(e) => setEditingSubject({ ...editingSubject, attendedClasses: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Color label picker */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Color Badge Label
                </label>
                <div className="flex items-center gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setEditingSubject({ ...editingSubject, color: c })}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        editingSubject.color === c ? 'scale-125 ring-2 ring-offset-2 ring-orange-500' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setEditingSubject(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 text-white text-xs font-bold shadow-md hover:opacity-95"
              >
                Save Subject
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DETAILED LOG HISTORY MODAL */}
      {selectedSubjectLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedSubjectLog.color }} />
                  {selectedSubjectLog.name} Log History
                </h3>
                <p className="text-xs text-slate-500">
                  Total {selectedSubjectLog.totalClasses} Conducted • {selectedSubjectLog.attendedClasses} Attended
                </p>
              </div>
              <button onClick={() => setSelectedSubjectLog(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 flex-1 pr-1 text-xs">
              {records
                .filter((r) => r.subjectId === selectedSubjectLog.id)
                .map((rec) => (
                  <div
                    key={rec.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50"
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{rec.date}</p>
                      <p className="text-[10px] text-slate-500">{rec.mode || 'offline'} class</p>
                    </div>

                    <span
                      className={`font-bold px-2.5 py-1 rounded-full text-[11px] uppercase tracking-wider ${
                        rec.status === 'present'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : rec.status === 'absent'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {rec.status}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
