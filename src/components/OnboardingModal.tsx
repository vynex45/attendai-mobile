import React, { useState } from 'react';
import {
  GraduationCap,
  School,
  Building2,
  Award,
  BookOpen,
  ArrowRight,
  Check,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import { StudentProfile, EducationType } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onSaveProfile: (updated: StudentProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<Partial<StudentProfile>>({
    name: profile.name || 'Aarav Patel',
    educationType: profile.educationType || 'college',
    board: profile.board || 'CBSE',
    classGrade: profile.classGrade || '12th',
    stream: profile.stream || 'Science',
    section: profile.section || 'A',
    rollNumber: profile.rollNumber || '21CS042',
    schoolName: profile.schoolName || 'Delhi Public School',
    degree: profile.degree || 'B.Tech',
    year: profile.year || '3rd Year',
    semester: profile.semester || 'Semester 6',
    department: profile.department || 'Computer Science',
    collegeName: profile.collegeName || 'National Institute of Technology',
    universityName: profile.universityName || 'Delhi Technological University',
    institutionName: profile.institutionName || 'National Institute of Technology',
    targetPercentage: profile.targetPercentage || 75,
  });

  if (!isOpen) return null;

  const educationTypes: { type: EducationType; title: string; desc: string; icon: any }[] = [
    { type: 'school', title: 'School Student', desc: 'Class 6th to 12th (CBSE, ICSE, State Boards)', icon: School },
    { type: 'college', title: 'College Student', desc: 'UG / PG Degrees (BTech, BSc, BCA, BCom, BA)', icon: GraduationCap },
    { type: 'university', title: 'University Student', desc: 'Campus & Departmental Semester System', icon: Building2 },
    { type: 'diploma', title: 'Diploma / Polytechnic', desc: 'Technical & Vocational Diplomas', icon: Award },
    { type: 'coaching', title: 'Coaching Institute', desc: 'JEE, NEET, Foundation Batches', icon: BookOpen },
    { type: 'competitive', title: 'Competitive Exams', desc: 'UPSC, GATE, CAT, Bank Prep', icon: Target },
  ];

  const handleFinish = () => {
    const updated: StudentProfile = {
      ...profile,
      ...formData,
      institutionName:
        formData.educationType === 'school'
          ? formData.schoolName || 'My School'
          : formData.collegeName || formData.universityName || 'My Institution',
      isOnboarded: true,
    } as StudentProfile;

    onSaveProfile(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header gradient banner */}
        <div className="relative bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-amber-300 animate-spin-slow" />
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
              Step {step} of 3
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {step === 1 && 'Select Your Education Type'}
            {step === 2 && 'Academic & Institution Details'}
            {step === 3 && 'Set Your Minimum Attendance Goal'}
          </h2>
          <p className="text-xs text-orange-100 mt-1">
            {step === 1 && 'Choose where you study so AttendAI can customize your rules.'}
            {step === 2 && 'Help us accurately set up your board, stream, degree or batch.'}
            {step === 3 && 'Choose your safe threshold percentage to receive low attendance warnings.'}
          </p>
        </div>

        {/* Step Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          
          {/* STEP 1: Select Education Type */}
          {step === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {educationTypes.map((item) => {
                const Icon = item.icon;
                const isSelected = formData.educationType === item.type;
                return (
                  <div
                    key={item.type}
                    onClick={() => setFormData({ ...formData, educationType: item.type })}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/30 shadow-md scale-[1.02]'
                        : 'border-slate-200 dark:border-slate-800 hover:border-orange-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-orange-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-orange-500 font-bold" />}
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-3">{item.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* STEP 2: Academic Details */}
          {step === 2 && (
            <div className="space-y-4 text-xs">
              
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Your Full Name</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g. Aarav Patel"
                />
              </div>

              {/* SCHOOL SPECIFIC */}
              {formData.educationType === 'school' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Board</label>
                      <select
                        value={formData.board || 'CBSE'}
                        onChange={(e) => setFormData({ ...formData, board: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value="CBSE">CBSE</option>
                        <option value="ICSE">ICSE / ISC</option>
                        <option value="State Board">State Board</option>
                        <option value="International">IB / IGCSE</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Class / Grade</label>
                      <select
                        value={formData.classGrade || '12th'}
                        onChange={(e) => setFormData({ ...formData, classGrade: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        {['6th', '7th', '8th', '9th', '10th', '11th', '12th'].map((cls) => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Stream (11th/12th)</label>
                      <select
                        value={formData.stream || 'Science'}
                        onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value="Science">Science (PCM/PCB)</option>
                        <option value="Commerce">Commerce</option>
                        <option value="Arts">Arts / Humanities</option>
                        <option value="General">General (Class 6-10)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Section & Roll No</label>
                      <input
                        type="text"
                        value={formData.rollNumber || ''}
                        onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        placeholder="e.g. Sec A, Roll 14"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">School Name</label>
                    <input
                      type="text"
                      value={formData.schoolName || ''}
                      onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      placeholder="e.g. Delhi Public School, R.K. Puram"
                    />
                  </div>
                </>
              )}

              {/* COLLEGE / UNIVERSITY SPECIFIC */}
              {(formData.educationType === 'college' || formData.educationType === 'university' || formData.educationType === 'diploma') && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Degree / Course</label>
                      <select
                        value={formData.degree || 'B.Tech'}
                        onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value="B.Tech">B.Tech / B.E.</option>
                        <option value="B.Sc">B.Sc / B.Sc CS</option>
                        <option value="BCA">BCA</option>
                        <option value="B.Com">B.Com</option>
                        <option value="B.A">B.A.</option>
                        <option value="M.Tech">M.Tech</option>
                        <option value="MBA">MBA</option>
                        <option value="MCA">MCA</option>
                        <option value="Diploma">Diploma Engineering</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Semester</label>
                      <select
                        value={formData.semester || 'Semester 6'}
                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        {['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'].map((sem) => (
                          <option key={sem} value={sem}>{sem}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                      <input
                        type="text"
                        value={formData.department || ''}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        placeholder="e.g. Computer Science"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Roll / PRN Number</label>
                      <input
                        type="text"
                        value={formData.rollNumber || ''}
                        onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        placeholder="e.g. 2023CS0194"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">College / University Name</label>
                    <input
                      type="text"
                      value={formData.collegeName || ''}
                      onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      placeholder="e.g. National Institute of Technology, Trichy"
                    />
                  </div>
                </>
              )}

              {/* COACHING / COMPETITIVE */}
              {(formData.educationType === 'coaching' || formData.educationType === 'competitive') && (
                <div className="space-y-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Exam / Course Name</label>
                    <input
                      type="text"
                      value={formData.degree || ''}
                      onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      placeholder="e.g. JEE Advanced 2026 Batch"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Coaching Institute Name</label>
                    <input
                      type="text"
                      value={formData.collegeName || ''}
                      onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      placeholder="e.g. Allen Career Institute, Kota"
                    />
                  </div>
                </div>
              )}

            </div>
          )}

          {/* STEP 3: Goal & Target % */}
          {step === 3 && (
            <div className="space-y-6 text-center py-4">
              <div>
                <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-600">
                  {formData.targetPercentage}%
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Minimum Required Attendance Goal</p>
              </div>

              <div className="px-6">
                <input
                  type="range"
                  min="60"
                  max="95"
                  step="5"
                  value={formData.targetPercentage || 75}
                  onChange={(e) => setFormData({ ...formData, targetPercentage: Number(e.target.value) })}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-2 font-medium">
                  <span>60%</span>
                  <span className="text-orange-500 font-bold">75% (Standard)</span>
                  <span>80%</span>
                  <span>85%</span>
                  <span>90%</span>
                  <span>95%</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200/60 dark:border-orange-800/60 text-left">
                <h4 className="text-xs font-bold text-orange-900 dark:text-orange-200 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-orange-500" /> Attendance Threshold Strategy
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  AttendAI will automatically trigger <strong>Low Attendance Alerts</strong> whenever any subject falls below {formData.targetPercentage}%, and show exact required lecture counts to stay eligible for exams!
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Controls */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-purple-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 hover:opacity-95 transition-opacity"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 hover:opacity-95 transition-opacity"
            >
              <Check className="w-4 h-4" /> Save Profile & Launch
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
