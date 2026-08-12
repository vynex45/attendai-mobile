import React, { useState } from 'react';
import { Clock, MapPin, User, Bell, Plus, Calendar, Check, BookOpen } from 'lucide-react';
import { TimetableSlot, Subject } from '../types';

interface TimetableGridProps {
  timetable: TimetableSlot[];
  subjects: Subject[];
  onAddSlot: (slot: TimetableSlot) => void;
}

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  timetable,
  subjects,
  onAddSlot,
}) => {
  const [selectedDay, setSelectedDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'>('Monday');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSlot, setNewSlot] = useState<Partial<TimetableSlot>>({
    day: 'Monday',
    time: '09:00 AM - 10:00 AM',
    subjectId: subjects[0]?.id || '',
    subjectName: subjects[0]?.name || '',
    room: 'LH-101',
    teacher: 'Faculty',
    type: 'Lecture',
  });

  const days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[] = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
  ];

  const currentSlots = timetable.filter((t) => t.day === selectedDay);

  const handleSaveSlot = () => {
    if (!newSlot.subjectName) return;
    const slotToAdd: TimetableSlot = {
      id: `ts-${Date.now()}`,
      day: newSlot.day || selectedDay,
      time: newSlot.time || '09:00 AM',
      subjectId: newSlot.subjectId || subjects[0]?.id || '',
      subjectName: newSlot.subjectName,
      room: newSlot.room || 'LH-101',
      teacher: newSlot.teacher || 'Faculty',
      type: newSlot.type || 'Lecture',
    };
    onAddSlot(slotToAdd);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-orange-500" /> Weekly Class Timetable
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organize your lectures, labs, and tutorials with automated smart class reminders.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-purple-600 text-white font-bold text-xs shadow-md hover:opacity-95"
        >
          <Plus className="w-4 h-4" /> Add Timetable Slot
        </button>
      </div>

      {/* Day Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {days.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedDay === d
                ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white shadow-md'
                : 'bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Schedule Slots */}
      <div className="space-y-3">
        {currentSlots.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-dashed border-slate-300 dark:border-slate-800 space-y-2">
            <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No classes scheduled for {selectedDay}</p>
            <p className="text-xs text-slate-500">Click "Add Timetable Slot" above to schedule lectures for this day.</p>
          </div>
        ) : (
          currentSlots.map((slot) => {
            const sub = subjects.find((s) => s.id === slot.subjectId);
            return (
              <div
                key={slot.id}
                className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-4 h-12 rounded-full shrink-0"
                    style={{ backgroundColor: sub?.color || '#3b82f6' }}
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                        {slot.subjectName}
                      </h4>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                        {slot.type || 'Lecture'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-orange-500" /> {slot.time}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-purple-500" /> Room {slot.room || 'LH-101'}</span>
                      <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-emerald-500" /> {slot.teacher}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-300 text-xs font-semibold hover:bg-orange-100">
                    <Bell className="w-3.5 h-3.5" /> Reminder Active
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ADD SLOT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Add Timetable Slot</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Day</label>
                <select
                  value={newSlot.day}
                  onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  {days.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Subject</label>
                <select
                  value={newSlot.subjectId}
                  onChange={(e) => {
                    const sel = subjects.find((s) => s.id === e.target.value);
                    setNewSlot({
                      ...newSlot,
                      subjectId: e.target.value,
                      subjectName: sel?.name || '',
                      teacher: sel?.teacherName || 'Faculty',
                      room: sel?.roomNumber || 'LH-101',
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Time Slot</label>
                <input
                  type="text"
                  value={newSlot.time}
                  onChange={(e) => setNewSlot({ ...newSlot, time: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  placeholder="e.g. 09:00 AM - 10:00 AM"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Room</label>
                  <input
                    type="text"
                    value={newSlot.room}
                    onChange={(e) => setNewSlot({ ...newSlot, room: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Type</label>
                  <select
                    value={newSlot.type}
                    onChange={(e) => setNewSlot({ ...newSlot, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="Lecture">Lecture</option>
                    <option value="Practical">Practical</option>
                    <option value="Lab">Lab</option>
                    <option value="Tutorial">Tutorial</option>
                    <option value="Seminar">Seminar</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl text-xs font-semibold">
                Cancel
              </button>
              <button onClick={handleSaveSlot} className="px-5 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold">
                Save Slot
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
