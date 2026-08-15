'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  School, Users, BookOpen, Clock, LogOut, CheckCircle2, 
  ChevronRight, Award, Trophy, Mic, UserPlus, Filter, 
  Search, ArrowLeft, RefreshCw, Star, ShieldCheck, Flame, Zap
} from 'lucide-react';
import ClassLeaderboard from '@/components/dashboard/ClassLeaderboard';

export default function PrincipalDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'teachers' | 'students' | 'leaderboard' | 'attendance' | 'speech' | 'add_teacher'>('overview');

  // Repositories (School-Isolated)
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [teacherAttendance, setTeacherAttendance] = useState<any[]>([]);
  const [speechLogs, setSpeechLogs] = useState<any[]>([]);
  const [lessonCompletions, setLessonCompletions] = useState<any[]>([]);

  // Filtering States
  const [gradeFilter, setGradeFilter] = useState('All');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Drill-Down States
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<any | null>(null);
  const [selectedSpeechDetail, setSelectedSpeechDetail] = useState<any | null>(null);

  // New Teacher Onboarding Form State
  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [teacherGrade, setTeacherGrade] = useState('1');
  const [teacherSection, setTeacherSection] = useState('A');

  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchPrincipalData();
  }, []);

  const fetchPrincipalData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    // 1. Fetch Principal Profile
    const { data: prof } = await supabase
      .from('profiles')
      .select('*, schools(*)')
      .eq('id', user.id)
      .single();

    if (prof && prof.school_id) {
      setProfile(prof);

      // 2. Fetch Teachers in this School
      const { data: tData } = await supabase
        .from('profiles')
        .select('*')
        .eq('school_id', prof.school_id)
        .eq('role', 'teacher')
        .order('full_name', { ascending: true });
      if (tData) setTeachers(tData);

      // 3. Fetch Students in this School
      const { data: sData } = await supabase
        .from('profiles')
        .select('*')
        .eq('school_id', prof.school_id)
        .eq('role', 'student')
        .order('points', { ascending: false });
      if (sData) setStudents(sData);

      // 4. Fetch Teacher Attendance
      const { data: attData } = await supabase
        .from('teacher_attendance')
        .select('*, profiles(full_name, grade, section)')
        .eq('school_id', prof.school_id)
        .order('date', { ascending: false });
      if (attData) setTeacherAttendance(attData);

      // 5. Fetch Speech Logs
      const { data: spData } = await supabase
        .from('speech_submissions')
        .select('*, profiles!inner(full_name, grade, section, school_id), lessons(title, speaking_prompt)')
        .eq('profiles.school_id', prof.school_id)
        .order('created_at', { ascending: false });
      if (spData) setSpeechLogs(spData);

      // 6. Fetch Lesson Completions
      const { data: compData } = await supabase
        .from('lesson_completions')
        .select('*, profiles(full_name), lessons(title, lesson_number)')
        .eq('school_id', prof.school_id)
        .order('completed_at', { ascending: false });
      if (compData) setLessonCompletions(compData);
    }
    setLoading(false);
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.school_id) return;
    setStatusMsg('Onboarding teacher account...');

    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: teacherEmail,
          password: teacherPassword,
          fullName: teacherName,
          role: 'teacher',
          schoolId: profile.school_id,
          grade: teacherGrade,
          section: teacherSection,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        alert(data.error || 'Failed to onboard teacher');
        setStatusMsg('');
        return;
      }

      setTeacherName('');
      setTeacherEmail('');
      setTeacherPassword('');
      setStatusMsg(`Teacher ${teacherName} onboarded and assigned to Grade ${teacherGrade}-${teacherSection}!`);
      fetchPrincipalData();
      setActiveTab('teachers');
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

  // Filtered Students List
  const filteredStudents = students.filter(s => {
    const matchGrade = gradeFilter === 'All' || s.grade?.toString() === gradeFilter;
    const matchSection = sectionFilter === 'All' || s.section === sectionFilter;
    const matchSearch = s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || s.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchGrade && matchSection && matchSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-bold">
        Loading Principal Command Center...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-indigo-600 text-white rounded-2xl shadow-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              {profile?.full_name} <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">Principal Portal</span>
            </h1>
            <p className="text-xs text-slate-400 font-semibold">
              {profile?.schools?.name} • Code: {profile?.schools?.code}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPrincipalData}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
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

        {/* Global Navigation Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900 rounded-2xl border border-slate-800">
          {[
            { id: 'overview', label: '📊 School Overview', icon: School },
            { id: 'leaderboard', label: '🏆 Class Toppers', icon: Trophy },
            { id: 'teachers', label: `👨‍🏫 Teachers (${teachers.length})`, icon: Users },
            { id: 'students', label: `🎓 Students (${students.length})`, icon: Award },
            { id: 'attendance', label: `📅 Teacher Attendance (${teacherAttendance.length})`, icon: Clock },
            { id: 'speech', label: `🎤 Speech Audits (${speechLogs.length})`, icon: Mic },
            { id: 'add_teacher', label: '➕ Onboard Teacher', icon: UserPlus },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSelectedStudentDetail(null);
                setSelectedSpeechDetail(null);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition ${
                activeTab === tab.id ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl relative overflow-hidden">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Faculty Staff</span>
                <div className="text-4xl font-black text-white mt-1">{teachers.length}</div>
                <p className="text-xs text-purple-400 font-bold mt-2">Active Assigned Teachers</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl relative overflow-hidden">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Enrolled Students</span>
                <div className="text-4xl font-black text-white mt-1">{students.length}</div>
                <p className="text-xs text-pink-400 font-bold mt-2">Across Grades 1–10</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl relative overflow-hidden">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Lessons</span>
                <div className="text-4xl font-black text-white mt-1">{lessonCompletions.length}</div>
                <p className="text-xs text-emerald-400 font-bold mt-2">Submissions & Re-Attempts</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl relative overflow-hidden">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Speech Submissions</span>
                <div className="text-4xl font-black text-white mt-1">{speechLogs.length}</div>
                <p className="text-xs text-amber-400 font-bold mt-2">AI Voice Evaluations</p>
              </div>
            </div>

            {/* School Profile Card */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-wrap justify-between items-center gap-4">
              <div>
                <h3 className="text-2xl font-black text-white">{profile?.schools?.name}</h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">{profile?.schools?.address || 'Campus Address Not Configured'}</p>
                <div className="flex gap-4 mt-3 text-xs">
                  <span className="text-indigo-400 font-mono font-bold">School Code: {profile?.schools?.code}</span>
                  <span className="text-slate-400">Email: {profile?.schools?.email || 'N/A'}</span>
                  <span className="text-slate-400">Phone: {profile?.schools?.contact_number || 'N/A'}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black rounded-xl text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Tenant Isolated
                </span>
              </div>
            </div>

            {/* Quick Leaderboard Snapshot */}
            <ClassLeaderboard
              students={students.slice(0, 5)}
              title="🏆 School-Wide Top Performers"
              subtitle="Top 5 students leading in total XP across all grades"
            />
          </div>
        )}

        {/* TAB 2: TOPPERS LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-3 items-center">
                <span className="text-xs font-bold text-slate-400 uppercase">Filter Class:</span>
                <select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none"
                >
                  <option value="All">All Grades</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
                    <option key={g} value={g.toString()}>Grade {g}</option>
                  ))}
                </select>

                <select
                  value={sectionFilter}
                  onChange={(e) => setSectionFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none"
                >
                  <option value="All">All Sections</option>
                  {['A', 'B', 'C', 'D'].map(sec => (
                    <option key={sec} value={sec}>Section {sec}</option>
                  ))}
                </select>
              </div>

              <span className="text-xs font-bold text-slate-400">
                Displaying {filteredStudents.length} Students
              </span>
            </div>

            <ClassLeaderboard
              students={filteredStudents}
              title={`🏆 ${gradeFilter === 'All' ? 'School-Wide' : `Grade ${gradeFilter}-${sectionFilter}`} Leaderboard`}
              subtitle={`Automatic rank calculation based on total XP and lesson accuracy`}
            />
          </div>
        )}

        {/* TAB 3: TEACHERS */}
        {activeTab === 'teachers' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-lg">
            <div className="p-5 border-b border-slate-800 font-black text-base text-white flex justify-between items-center">
              <span>Appointed School Teachers ({teachers.length})</span>
              <button
                onClick={() => setActiveTab('add_teacher')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition"
              >
                <UserPlus className="w-4 h-4" /> Add Teacher
              </button>
            </div>

            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-slate-400 font-bold text-xs uppercase">
                <tr>
                  <th className="p-4">Teacher Name</th>
                  <th className="p-4">Assigned Grade</th>
                  <th className="p-4">Section</th>
                  <th className="p-4">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {teachers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-500 font-medium">
                      No teachers onboarded yet. Click "Onboard Teacher" to add staff.
                    </td>
                  </tr>
                ) : (
                  teachers.map(t => (
                    <tr key={t.id} className="hover:bg-slate-800/40">
                      <td className="p-4 font-bold text-white">{t.full_name}</td>
                      <td className="p-4 text-purple-400 font-bold">Grade {t.grade || '1'}</td>
                      <td className="p-4 text-indigo-400 font-bold">Section {t.section || 'A'}</td>
                      <td className="p-4 text-slate-400 font-mono text-xs">{t.email}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: STUDENTS */}
        {activeTab === 'students' && !selectedStudentDetail && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-sm">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search student name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent outline-none text-white text-xs font-medium"
                  />
                </div>

                <select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none"
                >
                  <option value="All">All Grades</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
                    <option key={g} value={g.toString()}>Grade {g}</option>
                  ))}
                </select>

                <select
                  value={sectionFilter}
                  onChange={(e) => setSectionFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none"
                >
                  <option value="All">All Sections</option>
                  {['A', 'B', 'C', 'D'].map(sec => (
                    <option key={sec} value={sec}>Section {sec}</option>
                  ))}
                </select>
              </div>

              <div className="text-xs font-bold text-slate-400">
                Found {filteredStudents.length} Students
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-slate-400 font-bold text-xs uppercase">
                  <tr>
                    <th className="p-4">Student</th>
                    <th className="p-4">Grade & Section</th>
                    <th className="p-4">Total XP</th>
                    <th className="p-4">Streak</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredStudents.map(st => (
                    <tr key={st.id} className="hover:bg-slate-800/40">
                      <td className="p-4 font-bold text-white">{st.full_name}</td>
                      <td className="p-4 font-bold text-indigo-400">Grade {st.grade} - {st.section}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-black rounded-lg text-xs">
                          {st.points || 0} XP
                        </span>
                      </td>
                      <td className="p-4 text-rose-400 font-bold">{st.current_streak || 1} 🔥</td>
                      <td className="p-4">
                        <button
                          onClick={() => setSelectedStudentDetail(st)}
                          className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white rounded-lg text-xs font-bold transition"
                        >
                          View Report
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STUDENT DRILL-DOWN MODAL */}
        {activeTab === 'students' && selectedStudentDetail && (
          <div className="space-y-6 animate-in fade-in">
            <button
              onClick={() => setSelectedStudentDetail(null)}
              className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-900 px-4 py-2 rounded-xl border border-slate-800"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Student Roster
            </button>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black text-white">{selectedStudentDetail.full_name}</h2>
                <p className="text-xs text-amber-400 font-bold mt-1">
                  Grade {selectedStudentDetail.grade} - Section {selectedStudentDetail.section} • {profile?.schools?.name}
                </p>
              </div>
              <div className="flex gap-3">
                <span className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl font-black text-sm">
                  {selectedStudentDetail.points || 0} XP
                </span>
                <span className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl font-black text-sm">
                  {selectedStudentDetail.current_streak || 1} Day Streak
                </span>
              </div>
            </div>

            {/* Speaking submissions by this student */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Mic className="w-5 h-5 text-amber-400" /> Speech & AI Evaluation History
              </h3>
              <div className="space-y-3">
                {speechLogs.filter(log => log.student_id === selectedStudentDetail.id).length === 0 ? (
                  <p className="text-slate-500 text-sm">No speaking attempts recorded yet for this student.</p>
                ) : (
                  speechLogs.filter(log => log.student_id === selectedStudentDetail.id).map(log => (
                    <div key={log.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-amber-400">{log.lessons?.title}</span>
                        <span className="text-sm font-black text-emerald-400">{log.overall_score}% Score</span>
                      </div>
                      <p className="text-xs text-slate-300 italic">"{log.transcribed_text}"</p>
                      <div className="flex gap-4 text-xs font-bold text-slate-400 pt-1 border-t border-slate-800">
                        <span>Pronunciation: <strong className="text-white">{log.pronunciation_score}%</strong></span>
                        <span>Fluency: <strong className="text-white">{log.fluency_score}%</strong></span>
                        <span>Grammar: <strong className="text-white">{log.grammar_score || 85}%</strong></span>
                        <span>Vocabulary: <strong className="text-white">{log.vocabulary_score}%</strong></span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: TEACHER ATTENDANCE */}
        {activeTab === 'attendance' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-lg">
            <div className="p-5 border-b border-slate-800 font-black text-base text-white">
              Faculty Daily Attendance Logs ({teacherAttendance.length})
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-slate-400 font-bold text-xs uppercase">
                <tr>
                  <th className="p-4">Teacher</th>
                  <th className="p-4">Assigned Class</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Clock In</th>
                  <th className="p-4">Clock Out</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {teacherAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500 font-medium">
                      No clock-in records found for this school.
                    </td>
                  </tr>
                ) : (
                  teacherAttendance.map(a => (
                    <tr key={a.id} className="hover:bg-slate-800/40">
                      <td className="p-4 font-bold text-white">{a.profiles?.full_name}</td>
                      <td className="p-4 text-purple-400 font-bold">Grade {a.profiles?.grade}-{a.profiles?.section}</td>
                      <td className="p-4 text-slate-300">{a.date}</td>
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
        )}

        {/* TAB 6: SPEECH AUDITS */}
        {activeTab === 'speech' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-lg">
            <div className="p-5 border-b border-slate-800 font-black text-base text-white">
              AI Voice Evaluations Audit ({speechLogs.length})
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-slate-400 font-bold text-xs uppercase">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Grade & Section</th>
                  <th className="p-4">Lesson</th>
                  <th className="p-4">Overall Score</th>
                  <th className="p-4">Pronunciation</th>
                  <th className="p-4">Fluency</th>
                  <th className="p-4">Transcript Preview</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {speechLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-500 font-medium">
                      No speech evaluations recorded yet.
                    </td>
                  </tr>
                ) : (
                  speechLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-800/40">
                      <td className="p-4 font-bold text-white">{log.profiles?.full_name}</td>
                      <td className="p-4 text-purple-400 font-bold">Grade {log.profiles?.grade}-{log.profiles?.section}</td>
                      <td className="p-4 text-slate-300">{log.lessons?.title}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 font-black rounded-lg text-xs">
                          {log.overall_score}%
                        </span>
                      </td>
                      <td className="p-4 text-indigo-400 font-bold">{log.pronunciation_score}%</td>
                      <td className="p-4 text-amber-400 font-bold">{log.fluency_score}%</td>
                      <td className="p-4 text-slate-400 italic text-xs max-w-xs truncate">"{log.transcribed_text}"</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 7: ONBOARD TEACHER */}
        {activeTab === 'add_teacher' && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-xl mx-auto space-y-4 shadow-xl">
            <div className="text-center space-y-1 mb-2">
              <h2 className="text-lg font-black text-white flex items-center justify-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" /> Onboard School Teacher
              </h2>
              <p className="text-xs text-slate-400">
                Bound to <strong className="text-white">{profile?.schools?.name}</strong>
              </p>
            </div>

            <form onSubmit={handleCreateTeacher} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Teacher Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Anjali Sharma"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Login Email</label>
                <input
                  type="email"
                  placeholder="teacher@school.com"
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={teacherPassword}
                  onChange={(e) => setTeacherPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Assign Grade</label>
                  <select
                    value={teacherGrade}
                    onChange={(e) => setTeacherGrade(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500 font-medium text-xs"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
                      <option key={g} value={g.toString()}>Grade {g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Assign Section</label>
                  <select
                    value={teacherSection}
                    onChange={(e) => setTeacherSection(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500 font-medium text-xs"
                  >
                    {['A', 'B', 'C', 'D'].map(sec => (
                      <option key={sec} value={sec}>Section {sec}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black py-4 rounded-xl transition shadow-lg shadow-amber-600/30 mt-2"
              >
                Provision Teacher Account
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}