import React, { useState } from 'react';
import {
  CheckSquare,
  FileText,
  Clock,
  Plus,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Assignment, Exam, Subject } from '../types';

interface AssignmentsExamsProps {
  assignments: Assignment[];
  exams: Exam[];
  subjects: Subject[];
  onAddAssignment: (assignment: Assignment) => void;
  onAddExam: (exam: Exam) => void;
}

export const AssignmentsExams: React.FC<AssignmentsExamsProps> = ({
  assignments,
  exams,
  subjects,
  onAddAssignment,
  onAddExam,
}) => {
  const [activeTab, setActiveTab] = useState<'assignments' | 'exams'>('assignments');
  const [showAddAssignmentModal, setShowAddAssignmentModal] = useState(false);
  const [showAddExamModal, setShowAddExamModal] = useState(false);

  const [newAs, setNewAs] = useState<Partial<Assignment>>({
    title: '',
    description: '',
    deadline: '2026-08-01',
    priority: 'medium',
    status: 'pending',
    subjectId: subjects[0]?.id || '',
  });

  const [newEx, setNewEx] = useState<Partial<Exam>>({
    title: '',
    date: '2026-08-15',
    time: '10:00 AM - 12:00 PM',
    room: 'Hall A',
    preparationPercent: 50,
    subjectId: subjects[0]?.id || '',
  });

  const handleSaveAssignment = () => {
    if (!newAs.title) return;
    onAddAssignment({
      id: `as-${Date.now()}`,
      title: newAs.title,
      description: newAs.description || '',
      deadline: newAs.deadline || '2026-08-01',
      priority: newAs.priority || 'medium',
      status: 'pending',
      subjectId: newAs.subjectId || subjects[0]?.id || '',
    });
    setShowAddAssignmentModal(false);
  };

  const handleSaveExam = () => {
    if (!newEx.title) return;
    onAddExam({
      id: `ex-${Date.now()}`,
      title: newEx.title,
      date: newEx.date || '2026-08-15',
      time: newEx.time || '10:00 AM',
      room: newEx.room || 'Hall A',
      preparationPercent: newEx.preparationPercent || 50,
      subjectId: newEx.subjectId || subjects[0]?.id || '',
    });
    setShowAddExamModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-orange-500" /> Exam Countdown & Homework Tracker
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Keep track of pending lab assignments, project deadlines, and upcoming mid-sem & end-sem exams.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'assignments' ? (
            <button
              onClick={() => setShowAddAssignmentModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-purple-600 text-white font-bold text-xs shadow-md hover:opacity-95"
            >
              <Plus className="w-4 h-4" /> Add Assignment
            </button>
          ) : (
            <button
              onClick={() => setShowAddExamModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-purple-600 text-white font-bold text-xs shadow-md hover:opacity-95"
            >
              <Plus className="w-4 h-4" /> Add Exam
            </button>
          )}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('assignments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'assignments'
              ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <FileText className="w-4 h-4" /> Pending Assignments ({assignments.length})
        </button>

        <button
          onClick={() => setActiveTab('exams')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'exams'
              ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <Calendar className="w-4 h-4" /> Upcoming Exams ({exams.length})
        </button>
      </div>

      {/* ASSIGNMENTS TAB */}
      {activeTab === 'assignments' && (
        assignments.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-sm text-slate-700 dark:text-slate-300">No assignments added yet</p>
            <p className="text-xs text-slate-500">Click "Add Assignment" above to log pending homework and lab assignments.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.map((as) => {
              const sub = subjects.find((s) => s.id === as.subjectId);
              return (
                <div
                  key={as.id}
                  className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sub?.color || '#3b82f6' }} />
                      <span className="text-xs font-bold text-slate-500">{sub?.name || 'Subject'}</span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        as.priority === 'high'
                          ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {as.priority} Priority
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white">{as.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{as.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="flex items-center gap-1 text-slate-500 font-medium">
                      <Clock className="w-3.5 h-3.5 text-orange-500" /> Deadline: {as.deadline}
                    </span>

                    <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px]">
                      {as.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* EXAMS TAB */}
      {activeTab === 'exams' && (
        exams.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-sm text-slate-700 dark:text-slate-300">No upcoming exams scheduled</p>
            <p className="text-xs text-slate-500">Click "Add Exam" above to schedule mid-terms, unit tests, or finals.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exams.map((ex) => {
              const sub = subjects.find((s) => s.id === ex.subjectId);
              return (
                <div
                  key={ex.id}
                  className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sub?.color || '#8b5cf6' }} />
                      <span className="text-xs font-bold text-slate-500">{sub?.name}</span>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                      Exam Date: {ex.date}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white">{ex.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{ex.time} • Room {ex.room}</p>
                  </div>

                  {/* Preparation progress bar */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-600 dark:text-slate-400">Preparation Progress</span>
                      <span className="text-orange-500 font-bold">{ex.preparationPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-orange-500 to-purple-600 rounded-full" style={{ width: `${ex.preparationPercent}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ADD ASSIGNMENT MODAL */}
      {showAddAssignmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Add Assignment / Homework</h3>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Title</label>
                <input
                  type="text"
                  value={newAs.title}
                  onChange={(e) => setNewAs({ ...newAs, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  placeholder="e.g. Red-Black Tree Implementation"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Subject</label>
                <select
                  value={newAs.subjectId}
                  onChange={(e) => setNewAs({ ...newAs, subjectId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Deadline Date</label>
                <input
                  type="date"
                  value={newAs.deadline}
                  onChange={(e) => setNewAs({ ...newAs, deadline: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Priority</label>
                <select
                  value={newAs.priority}
                  onChange={(e) => setNewAs({ ...newAs, priority: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button onClick={() => setShowAddAssignmentModal(false)} className="px-4 py-2 rounded-xl">Cancel</button>
              <button onClick={handleSaveAssignment} className="px-5 py-2 rounded-xl bg-orange-500 text-white font-bold">Save Task</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD EXAM MODAL */}
      {showAddExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Add Exam Schedule</h3>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Exam Title</label>
                <input
                  type="text"
                  value={newEx.title}
                  onChange={(e) => setNewEx({ ...newEx, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  placeholder="e.g. Mid-Sem Operating Systems Theory"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Subject</label>
                <select
                  value={newEx.subjectId}
                  onChange={(e) => setNewEx({ ...newEx, subjectId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Exam Date</label>
                  <input
                    type="date"
                    value={newEx.date}
                    onChange={(e) => setNewEx({ ...newEx, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Time</label>
                  <input
                    type="text"
                    value={newEx.time}
                    onChange={(e) => setNewEx({ ...newEx, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button onClick={() => setShowAddExamModal(false)} className="px-4 py-2 rounded-xl">Cancel</button>
              <button onClick={handleSaveExam} className="px-5 py-2 rounded-xl bg-orange-500 text-white font-bold">Save Exam</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
