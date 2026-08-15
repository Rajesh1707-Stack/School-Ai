'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Users, UserCheck, Clock, Award, BookOpen, LogOut, Check, X, 
  Sparkles, Mic, Play, ChevronRight, UserPlus, Search, ArrowLeft,
  Calendar, CheckCircle2, AlertCircle, ShieldAlert, Star, Volume2,
  Filter, Trophy, Flame, Zap, RotateCcw
} from 'lucide-react';
import SpeechAnalyzer from '@/components/speech/SpeechAnalyzer';
import ClassLeaderboard from '@/components/dashboard/ClassLeaderboard';

export default function TeacherDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'attendance' | 'grades' | 'leaderboard' | 'lessons' | 'speech' | 'create_student'>('attendance');

  // Dynamic Grade and Section Selector for Multi-Class Access
  const [selectedGrade, setSelectedGrade] = useState('1');
  const [selectedSection, setSelectedSection] = useState('A');

  // Data Stores
  const [allSchoolStudents, setAllSchoolStudents] = useState<any[]>([]);
  const [gradeLessons, setGradeLessons] = useState<any[]>([]);
  const [speechLogs, setSpeechLogs] = useState<any[]>([]);
  const [teacherAttendanceHistory, setTeacherAttendanceHistory] = useState<any[]>([]);

  // Selected Lesson for Live Demonstration / Direct Speech Testing
  const [selectedDemoLesson, setSelectedDemoLesson] = useState<any | null>(null);

  // Clock In / Out State
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [clockLoading, setClockLoading] = useState(false);

  // Student Attendance Recording State
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceMap, setAttendanceMap] = useState<{ [studentId: string]: 'present' | 'absent' | 'late' }>({});

  // Classroom Teaching Presentation Mode
  const [activeTeachingLesson, setActiveTeachingLesson] = useState<any | null>(null);
  const [lessonActiveSection, setLessonActiveSection] = useState<'objectives' | 'vocab' | 'sentences' | 'repeat' | 'speech'>('objectives');

  // Speech Review Drill-Down
  const [selectedStudentSpeech, setSelectedStudentSpeech] = useState<any | null>(null);

  // Student Enrollment Form State
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('');
  const [enrollGrade, setEnrollGrade] = useState('1');
  const [enrollSection, setEnrollSection] = useState('A');

  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchTeacherInitialData();
  }, []);

  useEffect(() => {
    if (profile?.school_id) {
      fetchClassData(profile.school_id, selectedGrade, selectedSection);
    }
  }, [selectedGrade, selectedSection, profile]);

  const fetchTeacherInitialData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { data: prof } = await supabase
      .from('profiles')
      .select('*, schools(name, code)')
      .eq('id', user.id)
      .single();

    if (prof) {
      setProfile(prof);
      const defaultGrade = (prof.grade || 1).toString();
      const defaultSection = prof.section || 'A';
      setSelectedGrade(defaultGrade);
      setSelectedSection(defaultSection);
      setEnrollGrade(defaultGrade);
      setEnrollSection(defaultSection);

      fetchAttendanceHistory(prof.id);
    }
    setLoading(false);
  };

  const fetchAttendanceHistory = async (teacherId: string) => {
    const { data: attHistory } = await supabase
      .from('teacher_attendance')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('date', { ascending: false });

    if (attHistory) {
      setTeacherAttendanceHistory(attHistory);
      const todayStr = new Date().toISOString().split('T')[0];
      const todayRecord = attHistory.find(a => a.date === todayStr);
      if (todayRecord && todayRecord.clock_in && !todayRecord.clock_out) {
        setIsClockedIn(true);
        setClockInTime(new Date(todayRecord.clock_in).toLocaleTimeString());
      } else {
        setIsClockedIn(false);
        setClockInTime(null);
      }
    }
  };

  const fetchClassData = async (schoolId: string, grade: string, section: string) => {
    const { data: stuData } = await supabase
      .from('profiles')
      .select('*, schools(name)')
      .eq('school_id', schoolId)
      .eq('grade', parseInt(grade))
      .eq('section', section)
      .eq('role', 'student')
      .order('points', { ascending: false });

    if (stuData) {
      setAllSchoolStudents(stuData);
      const initialMap: { [key: string]: 'present' | 'absent' | 'late' } = {};
      stuData.forEach(s => { initialMap[s.id] = 'present'; });
      setAttendanceMap(initialMap);
    }

    const { data: lData } = await supabase
      .from('lessons')
      .select('*')
      .eq('grade', parseInt(grade))
      .order('lesson_number', { ascending: true });

    if (lData) {
      setGradeLessons(lData);
      if (lData.length > 0) setSelectedDemoLesson(lData[0]);
    }

    const { data: spData } = await supabase
      .from('speech_submissions')
      .select('*, profiles!inner(full_name, grade, section, school_id), lessons(title, speaking_prompt)')
      .eq('profiles.school_id', schoolId)
      .eq('profiles.grade', parseInt(grade))
      .eq('profiles.section', section)
      .order('created_at', { ascending: false });

    if (spData) setSpeechLogs(spData);
  };

  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }
  };

  const toggleTeacherClock = async () => {
    if (!profile) return;
    setClockLoading(true);
    const action = isClockedIn ? 'clock_out' : 'clock_in';

    try {
      const res = await fetch('/api/teacher/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: profile.id,
          action: action,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        alert(data.error || 'Failed to update attendance');
      } else {
        if (action === 'clock_in') {
          setIsClockedIn(true);
          setClockInTime(new Date().toLocaleTimeString());
          setStatusMsg('Clocked in successfully!');
        } else {
          setIsClockedIn(false);
          setClockInTime(null);
          setStatusMsg('Clocked out successfully! Working duration recorded.');
        }
        fetchAttendanceHistory(profile.id);
        setTimeout(() => setStatusMsg(''), 3000);
      }
    } catch (err: any) {
      alert(err.message);
    }
    setClockLoading(false);
  };

  const handleSaveStudentAttendance = async () => {
    if (!profile) return;
    setStatusMsg('Submitting attendance records...');

    const attendanceRecords = Object.entries(attendanceMap).map(([studentId, status]) => ({
      student_id: studentId,
      date: attendanceDate,
      status: status,
      recorded_by: profile.id
    }));

    const { error } = await supabase.from('student_attendance').upsert(attendanceRecords);

    if (!error) {
      setStatusMsg(`Attendance for Grade ${selectedGrade}-${selectedSection} saved!`);
      setTimeout(() => setStatusMsg(''), 3000);
    } else {
      alert(error.message);
    }
  };

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setStatusMsg('Enrolling student...');

    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newStudentEmail,
          password: newStudentPassword,
          fullName: newStudentName,
          role: 'student',
          schoolId: profile.school_id,
          grade: enrollGrade,
          section: enrollSection,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        alert(data.error || 'Failed to enroll student');
        setStatusMsg('');
        return;
      }

      setNewStudentName('');
      setNewStudentEmail('');
      setNewStudentPassword('');
      setStatusMsg(`Enrolled ${newStudentName} into Grade ${enrollGrade}-${enrollSection}!`);
      fetchClassData(profile.school_id, selectedGrade, selectedSection);
      setActiveTab('grades');
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err: any) {
      alert(err.message);
      setStatusMsg('');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-bold">
        Loading Teacher Workstation...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-2xl shadow-lg">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              {profile?.full_name} <span className="text-xs px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">Teacher Hub</span>
            </h1>
            <p className="text-xs text-slate-400 font-semibold">
              {profile?.schools?.name} • All Grades & Sections Access
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTeacherClock}
            disabled={clockLoading}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition shadow-md ${
              isClockedIn 
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30' 
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
          >
            <Clock className="w-4 h-4" /> 
            {clockLoading ? 'Processing...' : isClockedIn ? `Clock Out (${clockInTime})` : 'Clock In'}
          </button>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl font-bold text-xs uppercase tracking-wider transition"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto p-6 space-y-6 flex-1">
        {statusMsg && (
          <div className="flex items-center gap-2 p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-2xl font-bold animate-in fade-in">
            <CheckCircle2 className="w-5 h-5" /> {statusMsg}
          </div>
        )}

        {/* Dynamic Class Selector (All Grades 1-10 & Sections A-D) */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex flex-wrap gap-4 items-center justify-between shadow-lg">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-indigo-400" /> Selected Classroom View:
            </span>

            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none focus:border-indigo-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
                <option key={g} value={g.toString()}>Grade {g}</option>
              ))}
            </select>

            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none focus:border-indigo-500"
            >
              {['A', 'B', 'C', 'D'].map(sec => (
                <option key={sec} value={sec}>Section {sec}</option>
              ))}
            </select>
          </div>

          <div className="text-xs text-indigo-400 font-bold">
            Viewing Grade {selectedGrade} - Section {selectedSection} ({allSchoolStudents.length} Students)
          </div>
        </div>

        {/* Global Navigation Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900 rounded-2xl border border-slate-800">
          {[
            { id: 'attendance', label: '📅 My Attendance Log', icon: Clock },
            { id: 'grades', label: `🎓 Grade ${selectedGrade}-${selectedSection} Roster (${allSchoolStudents.length})`, icon: Users },
            { id: 'leaderboard', label: '🏆 Classroom Toppers', icon: Trophy },
            { id: 'lessons', label: `📚 Grade ${selectedGrade} Lessons (${gradeLessons.length})`, icon: BookOpen },
            { id: 'speech', label: `🎤 Speech Evaluations (${speechLogs.length})`, icon: Mic },
            { id: 'create_student', label: '➕ Enroll Student', icon: UserPlus },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setActiveTeachingLesson(null);
                setSelectedStudentSpeech(null);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition ${
                activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: TEACHER ATTENDANCE */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Status</span>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  {isClockedIn ? 'Clocked In & Active' : 'Not Clocked In'}
                </div>
                <p className="text-xs text-slate-500 mt-1">{clockInTime || 'No log today'}</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Recorded Days</span>
                <div className="text-3xl font-black text-white mt-1">{teacherAttendanceHistory.length} Days</div>
                <p className="text-xs text-indigo-400 font-bold mt-1">Present on Record</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Institution</span>
                <div className="text-xl font-black text-purple-400 mt-1 truncate">{profile?.schools?.name}</div>
                <p className="text-xs text-slate-500 mt-1">Code: {profile?.schools?.code}</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Class Selected</span>
                <div className="text-2xl font-black text-pink-400 mt-1">Grade {selectedGrade}-{selectedSection}</div>
                <p className="text-xs text-pink-400 font-bold mt-1">{allSchoolStudents.length} Students</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-lg">
              <div className="p-4 border-b border-slate-800 font-bold text-sm text-slate-300">
                Clock In / Out History Logs
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-slate-400 font-bold text-xs uppercase">
                  <tr>
                    <th className="p-4">Date</th>
                    <th className="p-4">Clock In Time</th>
                    <th className="p-4">Clock Out Time</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {teacherAttendanceHistory.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-slate-500 font-medium">
                        No clock-in records yet. Use the "Clock In" button in the top bar.
                      </td>
                    </tr>
                  ) : (
                    teacherAttendanceHistory.map(a => (
                      <tr key={a.id} className="hover:bg-slate-800/40">
                        <td className="p-4 font-bold text-white">{a.date}</td>
                        <td className="p-4 text-emerald-400 font-mono">{a.clock_in ? new Date(a.clock_in).toLocaleTimeString() : '--'}</td>
                        <td className="p-4 text-rose-400 font-mono">{a.clock_out ? new Date(a.clock_out).toLocaleTimeString() : 'In Progress'}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold capitalize">
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: ROSTER & ATTENDANCE */}
        {activeTab === 'grades' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-lg">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-indigo-400" /> Student Attendance: Grade {selectedGrade} - Section {selectedSection}
                  </h2>
                  <p className="text-xs text-slate-400">Mark daily attendance statuses</p>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold text-xs outline-none"
                  />
                  <button
                    onClick={handleSaveStudentAttendance}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs uppercase tracking-wider transition shadow-md"
                  >
                    Save Attendance
                  </button>
                </div>
              </div>

              <div className="divide-y divide-slate-800/80">
                {allSchoolStudents.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-sm">
                    No students enrolled in Grade {selectedGrade} - Section {selectedSection}. Click "Enroll Student" to add students.
                  </div>
                ) : (
                  allSchoolStudents.map(s => (
                    <div key={s.id} className="py-3 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-white text-sm">{s.full_name}</div>
                        <div className="text-xs text-slate-500 font-mono">{s.email}</div>
                      </div>

                      <div className="flex gap-2">
                        {(['present', 'absent', 'late'] as const).map(status => (
                          <button
                            key={status}
                            onClick={() => setAttendanceMap(prev => ({ ...prev, [s.id]: status }))}
                            className={`px-3 py-1.5 rounded-xl font-black text-xs capitalize transition ${
                              attendanceMap[s.id] === status
                                ? status === 'present' ? 'bg-emerald-600 text-white shadow-lg' : status === 'absent' ? 'bg-rose-600 text-white shadow-lg' : 'bg-amber-600 text-white shadow-lg'
                                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: CLASSROOM TOPPERS LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <ClassLeaderboard
              students={allSchoolStudents}
              title={`🏆 Grade ${selectedGrade}-${selectedSection} Classroom Toppers`}
              subtitle={`Automatic rank calculation based on total XP and performance metrics for ${profile?.schools?.name}`}
            />
          </div>
        )}

        {/* TAB 3: LESSONS & CLASSROOM CONDUCTOR */}
        {activeTab === 'lessons' && !activeTeachingLesson && (
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-1">
              <h2 className="text-2xl font-black text-white">Grade {selectedGrade} Master Lessons</h2>
              <p className="text-slate-400 text-xs">Launch interactive classroom presentations with voice sound and speech analysis.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gradeLessons.map(l => (
                <div
                  key={l.id}
                  onClick={() => {
                    setActiveTeachingLesson(l);
                    setLessonActiveSection('objectives');
                  }}
                  className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 p-6 rounded-3xl cursor-pointer transition shadow-lg space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 font-black text-xs rounded-full border border-indigo-500/30">
                      LESSON {l.lesson_number}
                    </span>
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{l.title}</h3>
                  <p className="text-xs text-slate-400 italic line-clamp-2">"{l.speaking_prompt}"</p>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Ready to Teach
                    </span>
                    <span className="text-xs font-bold text-indigo-400 flex items-center gap-1">
                      Launch Class <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TEACHING DISPLAY WITH SOUND & SPEECH ANALYZER */}
        {activeTab === 'lessons' && activeTeachingLesson && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setActiveTeachingLesson(null)}
                className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-900 px-4 py-2 rounded-xl border border-slate-800"
              >
                <ArrowLeft className="w-4 h-4" /> Exit Teaching Mode
              </button>

              <button
                onClick={() => {
                  setStatusMsg(`Marked Lesson ${activeTeachingLesson.lesson_number} as COMPLETED for Section ${selectedSection}!`);
                  setTimeout(() => setStatusMsg(''), 3000);
                }}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs uppercase tracking-wider transition shadow-lg"
              >
                <CheckCircle2 className="w-4 h-4" /> Mark Lesson Completed
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 font-black text-xs rounded-full border border-indigo-500/30">
                GRADE {activeTeachingLesson.grade} • LESSON {activeTeachingLesson.lesson_number}
              </span>
              <h2 className="text-3xl font-black text-white mt-2">{activeTeachingLesson.title}</h2>
            </div>

            <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900 rounded-2xl border border-slate-800">
              {[
                { id: 'objectives', label: '🎯 1. Objectives' },
                { id: 'vocab', label: '📖 2. Vocabulary' },
                { id: 'sentences', label: '💬 3. Useful Sentences' },
                { id: 'repeat', label: '🗣️ 5. Repeat Drill' },
                { id: 'speech', label: '🎤 9. Speaking Conductor' },
              ].map(sec => (
                <button
                  key={sec.id}
                  onClick={() => setLessonActiveSection(sec.id as any)}
                  className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition ${
                    lessonActiveSection === sec.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {sec.label}
                </button>
              ))}
            </div>

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl min-h-[300px]">
              {lessonActiveSection === 'objectives' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">Target Learning Objectives</h3>
                  <div className="space-y-2">
                    {activeTeachingLesson.learning_objectives?.map((obj: string, i: number) => (
                      <div key={i} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-sm font-medium text-slate-200 flex items-center gap-3">
                        <Check className="w-5 h-5 text-emerald-400 shrink-0" /> {obj}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {lessonActiveSection === 'vocab' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">Vocabulary Words (Click speaker to pronounce)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeTeachingLesson.vocabulary?.map((v: any, i: number) => {
                      const word = v.word || v;
                      const meaning = v.meaning || '';
                      return (
                        <div key={i} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center">
                          <div>
                            <span className="text-lg font-black text-purple-400">{word}</span>
                            {meaning && <p className="text-xs text-slate-400 mt-1">{meaning}</p>}
                          </div>
                          <button
                            onClick={() => speakText(`${word}. ${meaning}`)}
                            className="p-2.5 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white rounded-xl transition"
                          >
                            <Volume2 className="w-5 h-5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {lessonActiveSection === 'sentences' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">Useful Sentences</h3>
                  <div className="space-y-2">
                    {activeTeachingLesson.useful_sentences?.map((s: any, i: number) => {
                      const text = s.sentence || s;
                      return (
                        <div key={i} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-sm font-semibold text-slate-200">
                          <span>"{text}"</span>
                          <button onClick={() => speakText(text)} className="p-2 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white rounded-lg">
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {lessonActiveSection === 'repeat' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">Repeat Drills</h3>
                  <div className="space-y-2">
                    {activeTeachingLesson.repeat_sentences?.map((r: string, i: number) => (
                      <div key={i} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-sm font-bold text-indigo-300 flex items-center justify-between">
                        <span className="flex items-center gap-2"><Volume2 className="w-4 h-4 text-indigo-400" /> {r}</span>
                        <button onClick={() => speakText(r)} className="p-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg">
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {lessonActiveSection === 'speech' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">Live Classroom Speaking Challenge</h3>
                    <button
                      onClick={() => speakText(activeTeachingLesson.speaking_prompt)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-bold transition"
                    >
                      <Volume2 className="w-4 h-4" /> Speak Prompt
                    </button>
                  </div>

                  <SpeechAnalyzer
                    promptText={activeTeachingLesson.speaking_prompt}
                    isTeacher={true}
                    maxAttempts={-1}
                    onComplete={(result) => {
                      alert(`Speech Analysis Completed! Overall Score: ${result.overallScore}%, Pronunciation: ${result.pronunciationScore}%, Fluency: ${result.fluencyScore}%`);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: SPEECH EVALUATION LOGS & LIVE CLASSROOM TESTER */}
        {activeTab === 'speech' && !selectedStudentSpeech && (
          <div className="space-y-6">
            {/* Live Class Speech Studio */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
              <div className="flex flex-wrap justify-between items-center gap-3">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Mic className="w-5 h-5 text-indigo-400" /> Live Classroom Speech Conductor & Microphone Test
                  </h2>
                  <p className="text-xs text-slate-400">Conduct a live student speaking drill directly from the teacher desk</p>
                </div>

                {gradeLessons.length > 0 && (
                  <select
                    value={selectedDemoLesson?.id || ''}
                    onChange={(e) => {
                      const found = gradeLessons.find(l => l.id === e.target.value);
                      if (found) setSelectedDemoLesson(found);
                    }}
                    className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none focus:border-indigo-500"
                  >
                    {gradeLessons.map(l => (
                      <option key={l.id} value={l.id}>
                        Lesson {l.lesson_number}: {l.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {selectedDemoLesson && (
                <div className="pt-2">
                  <SpeechAnalyzer
                    promptText={selectedDemoLesson.speaking_prompt || 'Say hello politely and introduce yourself to the class.'}
                    isTeacher={true}
                    maxAttempts={-1}
                    onComplete={(result) => {
                      alert(`Classroom Speech Evaluated! Overall Score: ${result.overallScore}%, Pronunciation: ${result.pronunciationScore}%, Fluency: ${result.fluencyScore}%`);
                    }}
                  />
                </div>
              )}
            </div>

            {/* Submitted History Log Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-lg">
              <div className="p-4 border-b border-slate-800 font-bold text-sm text-slate-300">
                Student Submissions from Grade {selectedGrade} - Section {selectedSection} ({speechLogs.length})
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-slate-400 font-bold text-xs uppercase">
                  <tr>
                    <th className="p-4">Student</th>
                    <th className="p-4">Lesson</th>
                    <th className="p-4">Overall Score</th>
                    <th className="p-4">Pronunciation</th>
                    <th className="p-4">Fluency</th>
                    <th className="p-4">Transcript Preview</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {speechLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-500 font-medium">
                        No speech submissions for Grade {selectedGrade} - Section {selectedSection} yet.
                      </td>
                    </tr>
                  ) : (
                    speechLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-800/40">
                        <td className="p-4 font-bold text-white">{log.profiles?.full_name}</td>
                        <td className="p-4 text-slate-300">{log.lessons?.title}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 font-black rounded-lg text-xs">
                            {log.overall_score}%
                          </span>
                        </td>
                        <td className="p-4 text-emerald-400 font-bold">{log.pronunciation_score}%</td>
                        <td className="p-4 text-amber-400 font-bold">{log.fluency_score}%</td>
                        <td className="p-4 text-slate-400 italic text-xs max-w-xs truncate">"{log.transcribed_text}"</td>
                        <td className="p-4">
                          <button
                            onClick={() => setSelectedStudentSpeech(log)}
                            className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                          >
                            Review <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DRILL-DOWN SPEECH VIEW */}
        {activeTab === 'speech' && selectedStudentSpeech && (
          <div className="space-y-6 animate-in fade-in">
            <button
              onClick={() => setSelectedStudentSpeech(null)}
              className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-900 px-4 py-2 rounded-xl border border-slate-800"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Submissions
            </button>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    {selectedStudentSpeech.lessons?.title}
                  </span>
                  <h2 className="text-2xl font-black text-white mt-1">{selectedStudentSpeech.profiles?.full_name}</h2>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 font-bold uppercase block">AI Score</span>
                  <span className="text-3xl font-black text-emerald-400">{selectedStudentSpeech.overall_score}%</span>
                </div>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Spoken Transcript</span>
                <p className="text-white text-base italic leading-relaxed">"{selectedStudentSpeech.transcribed_text}"</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                  <span className="text-xs font-bold text-slate-500 uppercase block">Pronunciation</span>
                  <span className="text-2xl font-black text-emerald-400">{selectedStudentSpeech.pronunciation_score}%</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                  <span className="text-xs font-bold text-slate-500 uppercase block">Fluency</span>
                  <span className="text-2xl font-black text-amber-400">{selectedStudentSpeech.fluency_score}%</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                  <span className="text-xs font-bold text-slate-500 uppercase block">Vocabulary</span>
                  <span className="text-2xl font-black text-indigo-400">{selectedStudentSpeech.vocabulary_score}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CREATE STUDENT */}
        {activeTab === 'create_student' && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-xl mx-auto space-y-4 shadow-xl">
            <div className="text-center space-y-1 mb-2">
              <h2 className="text-lg font-black text-white flex items-center justify-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" /> Enroll New Student
              </h2>
              <p className="text-xs text-slate-400">
                Bound to <strong className="text-white">{profile?.schools?.name}</strong>
              </p>
            </div>

            <form onSubmit={handleEnrollStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Student Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sravan Kumar"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Student Login Email</label>
                <input
                  type="email"
                  placeholder="student@school.com"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newStudentPassword}
                  onChange={(e) => setNewStudentPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Assign Grade</label>
                  <select
                    value={enrollGrade}
                    onChange={(e) => setEnrollGrade(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 font-medium text-xs"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
                      <option key={g} value={g.toString()}>Grade {g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Assign Section</label>
                  <select
                    value={enrollSection}
                    onChange={(e) => setEnrollSection(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 font-medium text-xs"
                  >
                    {['A', 'B', 'C', 'D'].map(sec => (
                      <option key={sec} value={sec}>Section {sec}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-xl transition shadow-lg shadow-indigo-600/30 mt-2"
              >
                Enroll Student into Selected Grade & Section
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}