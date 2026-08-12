import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Camera,
  Upload,
  Calendar,
  Smile,
  RefreshCw,
  User,
  CheckCircle2,
  FileText,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { StudentProfile, Subject, ChatMessage } from '../types';

interface AIChatbotProps {
  profile: StudentProfile;
  subjects: Subject[];
  onImportSubjects: (newSubjects: Subject[]) => void;
}

export const AIChatbot: React.FC<AIChatbotProps> = ({
  profile,
  subjects,
  onImportSubjects,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'ocr' | 'timetable' | 'mood'>('chat');

  // CHATBOT STATE
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: `Hello ${profile.name}! I am your AttendAI Assistant. Ask me anything like:\n\n• *"Can I skip tomorrow's lectures?"*\n• *"How many classes must I attend for Operating Systems?"*\n• *"Predict my final attendance %"*`,
      timestamp: 'Just now',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // OCR SCANNER STATE
  const [ocrImage, setOcrImage] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [parsedOcrSubjects, setParsedOcrSubjects] = useState<any[] | null>(null);

  // TIMETABLE GENERATOR STATE
  const [ttDays, setTtDays] = useState(5);
  const [ttClasses, setTtClasses] = useState(4);
  const [ttLoading, setTtLoading] = useState(false);
  const [generatedTt, setGeneratedTt] = useState<any[] | null>(null);

  // MOOD CHECK STATE
  const [selectedMood, setSelectedMood] = useState('Tired');
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.name || 'Next Lecture');
  const [moodLoading, setMoodLoading] = useState(false);
  const [moodResponse, setMoodResponse] = useState<string | null>(null);

  // Handle Chat Submit
  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setChatLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          studentContext: {
            name: profile.name,
            institutionName: profile.institutionName,
            educationType: profile.educationType,
            degree: profile.degree,
            targetPercentage: profile.targetPercentage,
            subjects: subjects.map((s) => ({
              name: s.name,
              total: s.totalClasses,
              attended: s.attendedClasses,
            })),
          },
        }),
      });

      const data = await response.json();
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.text || 'I processed your request.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setChatLoading(false);
    }
  };

  // Handle OCR Image Upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOcrImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunOcr = async () => {
    if (!ocrImage) return;
    setOcrLoading(true);
    try {
      const response = await fetch('/api/ai/ocr-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: ocrImage,
        }),
      });
      const data = await response.json();
      setParsedOcrSubjects(data.subjects || []);
    } catch (err) {
      console.error('OCR Error:', err);
    } finally {
      setOcrLoading(false);
    }
  };

  // Import OCR extracted subjects into state
  const handleImportExtracted = () => {
    if (!parsedOcrSubjects) return;
    const newSubs: Subject[] = parsedOcrSubjects.map((item, idx) => ({
      id: `sub-ocr-${idx}-${Date.now()}`,
      name: item.subjectName || `Subject ${idx + 1}`,
      code: item.code || '',
      teacherName: item.teacherName || 'Faculty',
      roomNumber: item.room || 'Room 101',
      credits: 3,
      color: '#3b82f6',
      minAttendance: profile.targetPercentage,
      totalClasses: Number(item.total) || 10,
      attendedClasses: Number(item.attended) || 8,
      missedClasses: Math.max(0, (Number(item.total) || 10) - (Number(item.attended) || 8)),
      leaveClasses: 0,
      medicalLeaveClasses: 0,
      lateClasses: 0,
    }));

    onImportSubjects(newSubs);
    setParsedOcrSubjects(null);
    setOcrImage(null);
    alert('Extracted subjects imported successfully!');
  };

  // Handle AI Timetable Generation
  const handleGenerateTimetable = async () => {
    setTtLoading(true);
    try {
      const response = await fetch('/api/ai/generate-timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects: subjects.map((s) => s.name),
          daysPerWeek: ttDays,
          classesPerDay: ttClasses,
        }),
      });
      const data = await response.json();
      setGeneratedTt(data.timetable || []);
    } catch (err) {
      console.error('Timetable AI error:', err);
    } finally {
      setTtLoading(false);
    }
  };

  // Handle Mood Check
  const handleMoodCheck = async () => {
    setMoodLoading(true);
    try {
      const response = await fetch('/api/ai/mood-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: selectedMood,
          subjectName: selectedSubject,
        }),
      });
      const data = await response.json();
      setMoodResponse(data.text);
    } catch (err) {
      console.error('Mood Check Error:', err);
    } finally {
      setMoodLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Bot className="w-6 h-6 text-purple-600 animate-pulse" /> AttendAI Smart Assistant & Tools
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Chat with AI for attendance guidance, scan portal screenshots, auto-generate timetables, and get pre-class motivation!
        </p>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('chat')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'chat'
              ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Bot className="w-4 h-4" /> AI Chatbot
        </button>

        <button
          onClick={() => setActiveSubTab('ocr')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'ocr'
              ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Camera className="w-4 h-4" /> OCR Screenshot Importer
        </button>

        <button
          onClick={() => setActiveSubTab('timetable')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'timetable'
              ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" /> AI Timetable Generator
        </button>

        <button
          onClick={() => setActiveSubTab('mood')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'mood'
              ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Smile className="w-4 h-4" /> Pre-Class AI Mood Booster
        </button>
      </div>

      {/* SUB TAB 1: AI CHATBOT */}
      {activeSubTab === 'chat' && (
        <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col h-[550px]">
          
          {/* Chat Messages */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-orange-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-lg p-4 rounded-3xl text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white font-medium rounded-tr-none shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200/50 dark:border-slate-700/50'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <span
                    className={`block text-[9px] mt-2 text-right ${
                      m.sender === 'user' ? 'text-orange-100' : 'text-slate-400'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>

                {m.sender === 'user' && (
                  <div className="w-8 h-8 rounded-2xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0 font-bold text-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {chatLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <RefreshCw className="w-4 h-4 animate-spin text-orange-500" />
                <span>AttendAI is computing strategy...</span>
              </div>
            )}
          </div>

          {/* Quick prompt chips */}
          <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center gap-2 overflow-x-auto text-[11px]">
            <span className="text-slate-400 font-bold shrink-0">Prompts:</span>
            <button
              onClick={() => handleSendMessage('Can I skip tomorrow’s lectures?')}
              className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-orange-500 shrink-0"
            >
              Can I skip tomorrow?
            </button>
            <button
              onClick={() => handleSendMessage('Show my low attendance subjects')}
              className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-orange-500 shrink-0"
            >
              Show my risk subjects
            </button>
            <button
              onClick={() => handleSendMessage('How many classes to attend for Operating Systems?')}
              className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-orange-500 shrink-0"
            >
              Required OS classes?
            </button>
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask AttendAI anything about your classes..."
              className="flex-1 px-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={chatLoading || !inputMessage.trim()}
              className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-purple-600 text-white shadow-md hover:opacity-95 disabled:opacity-50 transition-opacity"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* SUB TAB 2: OCR SCREENSHOT IMPORTER */}
      {activeSubTab === 'ocr' && (
        <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
          <div className="max-w-xl">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-orange-500" /> Import Attendance via OCR Scanner
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Upload a screenshot of your college ERP, school app, or PDF document. Gemini AI will automatically extract subjects and class counts!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Upload Area */}
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-6 text-center bg-slate-50 dark:bg-slate-800/40 space-y-3">
                {ocrImage ? (
                  <img src={ocrImage} alt="Uploaded screenshot" className="max-h-48 mx-auto rounded-xl shadow-md" />
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-orange-500 mx-auto" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Drag & Drop your screenshot or PDF page image
                    </p>
                  </>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="ocr-file-input"
                />
                <label
                  htmlFor="ocr-file-input"
                  className="inline-block px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer hover:bg-slate-300"
                >
                  Select Image File
                </label>
              </div>

              <button
                onClick={handleRunOcr}
                disabled={!ocrImage || ocrLoading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-purple-600 text-white font-bold text-xs shadow-md hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {ocrLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Scan Screenshot with Gemini AI
              </button>
            </div>

            {/* Extracted Subjects Result */}
            <div className="space-y-4">
              <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                Extracted Subjects ({parsedOcrSubjects?.length || 0})
              </h4>

              {parsedOcrSubjects ? (
                <div className="space-y-3 text-xs max-h-64 overflow-y-auto">
                  {parsedOcrSubjects.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{s.subjectName}</p>
                        <p className="text-[10px] text-slate-500">{s.attended} Attended / {s.total} Conducted</p>
                      </div>
                      <span className="font-extrabold text-orange-500">
                        {Math.round(((s.attended || 0) / (s.total || 1)) * 100)}%
                      </span>
                    </div>
                  ))}

                  <button
                    onClick={handleImportExtracted}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Import Subjects into App
                  </button>
                </div>
              ) : (
                <div className="p-8 text-center border rounded-2xl bg-slate-50 dark:bg-slate-800/30 text-xs text-slate-400">
                  Extracted subjects will appear here after scanning.
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* SUB TAB 3: AI TIMETABLE GENERATOR */}
      {activeSubTab === 'timetable' && (
        <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-500" /> AI Automatic Timetable Generator
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Automatically generate a balanced weekly class schedule for your subjects!
              </p>
            </div>

            <button
              onClick={handleGenerateTimetable}
              disabled={ttLoading}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-purple-600 text-white text-xs font-bold shadow-md hover:opacity-95 disabled:opacity-50 flex items-center gap-2"
            >
              {ttLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate Timetable
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Days Per Week</label>
              <select
                value={ttDays}
                onChange={(e) => setTtDays(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value={5}>5 Days (Mon - Fri)</option>
                <option value={6}>6 Days (Mon - Sat)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Lectures Per Day</label>
              <select
                value={ttClasses}
                onChange={(e) => setTtClasses(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value={3}>3 Lectures</option>
                <option value={4}>4 Lectures</option>
                <option value={5}>5 Lectures</option>
              </select>
            </div>
          </div>

          {generatedTt && (
            <div className="space-y-4 pt-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                Generated Schedule:
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedTt.map((dayPlan: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2 text-xs">
                    <h5 className="font-bold text-orange-500">{dayPlan.day}</h5>
                    <div className="space-y-1.5">
                      {dayPlan.slots?.map((slot: any, sIdx: number) => (
                        <div key={sIdx} className="p-2 rounded-xl bg-white dark:bg-slate-800 flex justify-between">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{slot.subjectName}</p>
                            <p className="text-[10px] text-slate-500">{slot.time} • Room {slot.room}</p>
                          </div>
                          <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-300">{slot.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB TAB 4: PRE-CLASS MOOD BOOSTER */}
      {activeSubTab === 'mood' && (
        <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
          <div className="max-w-xl">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Smile className="w-5 h-5 text-amber-500" /> Pre-Class AI Mood Check
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              How are you feeling right before your upcoming lecture? Let AI give you a quick motivation boost!
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg">
            {['Tired 🥱', 'Anxious 😰', 'Lazy 🛋️', 'Excited 🚀'].map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMood(m)}
                className={`p-3 rounded-2xl border text-xs font-bold transition-all ${
                  selectedMood === m
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/50 text-orange-600'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <button
            onClick={handleMoodCheck}
            disabled={moodLoading}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-purple-600 text-white font-bold text-xs shadow-md flex items-center gap-2"
          >
            {moodLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Get Pre-Class Motivation
          </button>

          {moodResponse && (
            <div className="p-5 rounded-2xl bg-gradient-to-tr from-amber-500/10 to-orange-500/10 border border-amber-200 dark:border-amber-900/50 text-xs font-semibold text-slate-800 dark:text-slate-200">
              "{moodResponse}"
            </div>
          )}
        </div>
      )}

    </div>
  );
};
