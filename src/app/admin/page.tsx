'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  School, Users, BookOpen, Plus, LogOut, ShieldCheck, 
  GraduationCap, UserPlus, Sparkles, CheckCircle2, ChevronRight,
  Filter, Search, Award, HelpCircle, Layers,
  BarChart3, Clock, Flame, ArrowLeft, RefreshCw, Star, Trash2, Edit3, Check,
  Volume2, AlertCircle, Wand2
} from 'lucide-react';

export default function AdminDashboard() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'schools' | 'staff' | 'students' | 'lessons' | 'activities' | 'quizzes' | 'gamification'>('dashboard');
   
  // Data Repositories
  const [schools, setSchools] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [lessonsList, setLessonsList] = useState<any[]>([]);
  const [badgesList, setBadgesList] = useState<any[]>([]);
  const [speechLogs, setSpeechLogs] = useState<any[]>([]);

  // Selected Records for Deep Drill-Down
  const [selectedSchoolView, setSelectedSchoolView] = useState<any | null>(null);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<any | null>(null);

  // Filter States
  const [gradeFilter, setGradeFilter] = useState('All');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [schoolFilter, setSchoolFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Form States - School
  const [schoolName, setSchoolName] = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const [schoolAddress, setSchoolAddress] = useState('');
  const [schoolEmail, setSchoolEmail] = useState('');
  const [schoolContact, setSchoolContact] = useState('');

  // Form States - Staff
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffRole, setStaffRole] = useState<'principal' | 'teacher'>('principal');
  const [staffSchoolId, setStaffSchoolId] = useState('');
  const [staffGrade, setStaffGrade] = useState('1');
  const [staffSection, setStaffSection] = useState('A');

  // Form States - Lesson (Complete 9-Section Builder)
  const [lessonGrade, setLessonGrade] = useState('1');
  const [lessonNumber, setLessonNumber] = useState('1');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDesc, setLessonDesc] = useState('');
  const [learningObjectives, setLearningObjectives] = useState('');
  const [vocabInput, setVocabInput] = useState('');
  const [usefulSentences, setUsefulSentences] = useState('');
  const [repeatContent, setRepeatContent] = useState('');
  const [speakingPrompt, setSpeakingPrompt] = useState('');
  const [speakingChallenge, setSpeakingChallenge] = useState('');

  // Form States - Interactive Activity (Word Builder & Typing Challenge)
  const [actLessonId, setActLessonId] = useState('');
  const [actType, setActType] = useState<'word_builder' | 'fill_in_blank'>('word_builder');
  const [actTitle, setActTitle] = useState('');
  const [actPoints, setActPoints] = useState('20');
  const [actSentence, setActSentence] = useState('');
  const [actAnswer, setActAnswer] = useState('');
  const [wbTargetWord, setWbTargetWord] = useState('');
  const [wbClue, setWbClue] = useState('');

  // Form States - Quiz
  const [quizLessonId, setQuizLessonId] = useState('');
  const [quizQuestion, setQuizQuestion] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctOptIndex, setCorrectOptIndex] = useState('0');

  // Form States - Gamification & XP Configurations
  const [ptsLesson, setPtsLesson] = useState(50);
  const [ptsSpeaking, setPtsSpeaking] = useState(15);
  const [ptsActivity, setPtsActivity] = useState(10);
  const [ptsQuiz, setPtsQuiz] = useState(20);

  const [lessonBaseXP, setLessonBaseXP] = useState(50);
  const [lessonSpeechXP, setLessonSpeechXP] = useState(35);
  const [lessonActivityXP, setLessonActivityXP] = useState(15);
  const [lessonQuizXP, setLessonQuizXP] = useState(25);

  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchAllAdminData();
  }, []);

  const fetchAllAdminData = async () => {
    setLoading(true);
    const { data: sData } = await supabase.from('schools').select('*').order('created_at', { ascending: false });
    if (sData) {
      setSchools(sData);
      if (sData.length > 0 && !staffSchoolId) setStaffSchoolId(sData[0].id);
    }

    const { data: stData } = await supabase.from('profiles').select('*, schools(name, code)').in('role', ['principal', 'teacher']);
    if (stData) setStaffList(stData);

    const { data: stuData } = await supabase.from('profiles').select('*, schools(name, code)').eq('role', 'student');
    if (stuData) setStudentsList(stuData);

    const { data: lData } = await supabase.from('lessons').select('*').order('grade', { ascending: true }).order('lesson_number', { ascending: true });
    if (lData) {
      setLessonsList(lData);
      if (lData.length > 0 && !actLessonId) {
        setActLessonId(lData[0].id);
        setQuizLessonId(lData[0].id);
      }
    }

    const { data: bData } = await supabase.from('badges').select('*');
    if (bData) setBadgesList(bData);

    const { data: spData } = await supabase.from('speech_submissions').select('*, profiles(full_name, grade, section), lessons(title)');
    if (spData) setSpeechLogs(spData);

    setLoading(false);
  };

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('schools').insert([{
      name: schoolName,
      code: schoolCode.toUpperCase(),
      address: schoolAddress,
      email: schoolEmail,
      contact_number: schoolContact
    }]);

    if (!error) {
      setSchoolName('');
      setSchoolCode('');
      setSchoolAddress('');
      setSchoolEmail('');
      setSchoolContact('');
      setStatusMsg('New school registered successfully!');
      fetchAllAdminData();
      setTimeout(() => setStatusMsg(''), 3000);
    } else {
      alert(error.message);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg('Creating staff account...');

    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: staffEmail,
          password: staffPassword,
          fullName: staffName,
          role: staffRole,
          schoolId: staffSchoolId,
          grade: staffRole === 'teacher' ? staffGrade : null,
          section: staffRole === 'teacher' ? staffSection : null,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        alert(data.error || 'Failed to create user');
        setStatusMsg('');
        return;
      }

      setStaffName('');
      setStaffEmail('');
      setStaffPassword('');
      setStatusMsg(`Registered ${staffRole.toUpperCase()} successfully!`);
      fetchAllAdminData();
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err: any) {
      alert(err.message);
      setStatusMsg('');
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    const objectivesArr = learningObjectives.split('\n').filter(Boolean);
    const vocabArr = vocabInput.split('\n').map(v => ({ word: v.trim() })).filter(v => v.word);
    const sentencesArr = usefulSentences.split('\n').map(s => ({ sentence: s.trim() })).filter(s => s.sentence);
    const repeatArr = repeatContent.split('\n').filter(Boolean);

    const { error } = await supabase.from('lessons').insert([{
      grade: parseInt(lessonGrade),
      lesson_number: parseInt(lessonNumber),
      title: lessonTitle,
      description: lessonDesc,
      learning_objectives: objectivesArr,
      vocabulary: vocabArr,
      useful_sentences: sentencesArr,
      repeat_sentences: repeatArr,
      speaking_prompt: speakingPrompt,
      speaking_challenge: speakingChallenge,
    }]);

    if (!error) {
      setLessonTitle('');
      setLessonDesc('');
      setLearningObjectives('');
      setVocabInput('');
      setUsefulSentences('');
      setRepeatContent('');
      setSpeakingPrompt('');
      setSpeakingChallenge('');
      setStatusMsg(`Lesson published to Grade ${lessonGrade} Global Curriculum!`);
      fetchAllAdminData();
      setTimeout(() => setStatusMsg(''), 3000);
    } else {
      alert(error.message);
    }
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actLessonId) {
      alert('Please select a lesson first.');
      return;
    }

    let questionData: any = {};
    if (actType === 'word_builder') {
      questionData = {
        target_word: wbTargetWord.trim().toUpperCase(),
        clue: wbClue.trim(),
        words_list: [
          { word: wbTargetWord.trim().toUpperCase(), meaning: wbClue.trim() }
        ]
      };
    } else {
      questionData = {
        sentence: actSentence,
        acceptable_answers: actAnswer.split(',').map(a => a.trim().toLowerCase())
      };
    }

    const { error } = await supabase.from('activities').insert([{
      lesson_id: actLessonId,
      type: actType,
      title: actTitle,
      instruction: actType === 'word_builder' 
        ? 'Arrange the scrambled letters to spell the correct word (Max 3 attempts).' 
        : 'Type the correct missing word into the blank space (Max 3 attempts).',
      question_data: questionData,
      points_reward: parseInt(actPoints) || 20
    }]);

    if (!error) {
      setActTitle('');
      setActSentence('');
      setActAnswer('');
      setWbTargetWord('');
      setWbClue('');
      setStatusMsg(`${actType === 'word_builder' ? 'Word Builder' : 'Typing Challenge'} deployed!`);
      fetchAllAdminData();
      setTimeout(() => setStatusMsg(''), 3000);
    } else {
      alert(error.message);
    }
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('quizzes').insert([{
      lesson_id: quizLessonId,
      question: quizQuestion,
      options: [optA, optB, optC, optD],
      correct_option_index: parseInt(correctOptIndex),
      marks: 5
    }]);

    if (!error) {
      setQuizQuestion('');
      setOptA('');
      setOptB('');
      setOptC('');
      setOptD('');
      setStatusMsg('Quiz question added!');
      setTimeout(() => setStatusMsg(''), 3000);
    } else {
      alert(error.message);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const filteredStudents = studentsList.filter(s => {
    const matchGrade = gradeFilter === 'All' || s.grade?.toString() === gradeFilter;
    const matchSection = sectionFilter === 'All' || s.section === sectionFilter;
    const matchSchool = schoolFilter === 'All' || s.school_id === schoolFilter;
    const matchSearch = s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || s.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchGrade && matchSection && matchSchool && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white rounded-2xl shadow-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              English Excel <span className="text-xs px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full border border-indigo-500/30">Super Admin</span>
            </h1>
            <p className="text-xs text-slate-400 font-semibold">Multi-School Management & AI Evaluation Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllAdminData}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl font-bold text-sm transition"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto p-6 space-y-6 flex-1">
        {statusMsg && (
          <div className="flex items-center gap-2 p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-2xl font-bold animate-in fade-in slide-in-from-top-2 duration-200">
            <CheckCircle2 className="w-5 h-5" /> {statusMsg}
          </div>
        )}

        {/* Global Navigation Bar */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 backdrop-blur-md">
          {[
            { id: 'dashboard', label: 'Overview', icon: BarChart3 },
            { id: 'schools', label: `Schools (${schools.length})`, icon: School },
            { id: 'staff', label: `Staff (${staffList.length})`, icon: UserPlus },
            { id: 'students', label: `Students (${studentsList.length})`, icon: GraduationCap },
            { id: 'lessons', label: `Lessons (${lessonsList.length})`, icon: BookOpen },
            { id: 'activities', label: 'Wordwall Activities', icon: Layers },
            { id: 'quizzes', label: 'Quizzes', icon: HelpCircle },
            { id: 'gamification', label: 'Gamification & Badges', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSelectedSchoolView(null);
                  setSelectedStudentDetail(null);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition ${
                  isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><School className="w-16 h-16 text-indigo-400" /></div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Schools</span>
                <div className="text-4xl font-black text-white mt-1">{schools.length}</div>
                <div className="text-xs text-emerald-400 font-bold mt-2">100% Data Isolated</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Users className="w-16 h-16 text-purple-400" /></div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Staff Accounts</span>
                <div className="text-4xl font-black text-white mt-1">{staffList.length}</div>
                <div className="text-xs text-indigo-400 font-bold mt-2">
                  {staffList.filter(s => s.role === 'principal').length} Principals • {staffList.filter(s => s.role === 'teacher').length} Teachers
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><GraduationCap className="w-16 h-16 text-pink-400" /></div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Students</span>
                <div className="text-4xl font-black text-white mt-1">{studentsList.length}</div>
                <div className="text-xs text-pink-400 font-bold mt-2">Grades 1 to 10 Enrolled</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles className="w-16 h-16 text-amber-400" /></div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Speech Evaluations</span>
                <div className="text-4xl font-black text-white mt-1">{speechLogs.length}</div>
                <div className="text-xs text-amber-400 font-bold mt-2">Recorded Attempts Logged</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" /> Recent AI Speech Submissions Across Schools
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-950 text-slate-400 font-bold text-xs uppercase">
                    <tr>
                      <th className="p-4">Student</th>
                      <th className="p-4">Class</th>
                      <th className="p-4">Lesson</th>
                      <th className="p-4">Overall Score</th>
                      <th className="p-4">Pronunciation</th>
                      <th className="p-4">Fluency</th>
                      <th className="p-4">Recorded Text Preview</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {speechLogs.slice(0, 5).map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/30">
                        <td className="p-4 font-bold text-white">{log.profiles?.full_name}</td>
                        <td className="p-4 text-indigo-400 font-bold">Grade {log.profiles?.grade}-{log.profiles?.section}</td>
                        <td className="p-4 text-slate-300">{log.lessons?.title}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 font-black rounded-lg text-xs">
                            {log.overall_score}%
                          </span>
                        </td>
                        <td className="p-4 text-emerald-400 font-bold">{log.pronunciation_score}%</td>
                        <td className="p-4 text-amber-400 font-bold">{log.fluency_score}%</td>
                        <td className="p-4 text-slate-400 italic text-xs max-w-xs truncate">"{log.transcribed_text}"</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: SCHOOLS */}
        {activeTab === 'schools' && !selectedSchoolView && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <h2 className="text-lg font-black mb-4 flex items-center gap-2 text-white">
                <Plus className="w-5 h-5 text-indigo-400" /> Create & Provision New School
              </h2>
              <form onSubmit={handleCreateSchool} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="School Name"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 font-medium"
                  required
                />
                <input
                  type="text"
                  placeholder="Unique School Code (e.g. EDIS01)"
                  value={schoolCode}
                  onChange={(e) => setSchoolCode(e.target.value)}
                  className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 font-medium uppercase"
                  required
                />
                <input
                  type="text"
                  placeholder="City / Address"
                  value={schoolAddress}
                  onChange={(e) => setSchoolAddress(e.target.value)}
                  className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 font-medium"
                />
                <input
                  type="email"
                  placeholder="Official Email"
                  value={schoolEmail}
                  onChange={(e) => setSchoolEmail(e.target.value)}
                  className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 font-medium"
                />
                <input
                  type="text"
                  placeholder="Contact Number"
                  value={schoolContact}
                  onChange={(e) => setSchoolContact(e.target.value)}
                  className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 font-medium"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 rounded-xl transition shadow-lg shadow-indigo-600/30"
                >
                  Provision School
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schools.map((s) => {
                const schoolTeachers = staffList.filter(st => st.school_id === s.id && st.role === 'teacher');
                const schoolStudents = studentsList.filter(st => st.school_id === s.id);
                const principal = staffList.find(st => st.school_id === s.id && st.role === 'principal');

                return (
                  <div key={s.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-indigo-500/40 transition shadow-lg">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-xl text-white">{s.name}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">{s.address || 'Address not registered'}</p>
                        </div>
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold">
                          Active
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-800/80 text-center">
                        <div className="bg-slate-950 p-2.5 rounded-2xl">
                          <span className="text-xs text-slate-500 font-bold block">CODE</span>
                          <span className="text-sm font-black text-indigo-400 font-mono">{s.code}</span>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded-2xl">
                          <span className="text-xs text-slate-500 font-bold block">TEACHERS</span>
                          <span className="text-sm font-black text-purple-400">{schoolTeachers.length}</span>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded-2xl">
                          <span className="text-xs text-slate-500 font-bold block">STUDENTS</span>
                          <span className="text-sm font-black text-pink-400">{schoolStudents.length}</span>
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-slate-400 font-medium">
                        Principal: <span className="text-slate-200 font-bold">{principal?.full_name || 'No Principal Assigned'}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedSchoolView(s)}
                      className="w-full py-3 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
                    >
                      Open School Dashboard <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* DRILL-DOWN: SPECIFIC SCHOOL DASHBOARD */}
        {activeTab === 'schools' && selectedSchoolView && (
          <div className="space-y-6 animate-in fade-in">
            <button
              onClick={() => setSelectedSchoolView(null)}
              className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-900 px-4 py-2 rounded-xl border border-slate-800"
            >
              <ArrowLeft className="w-4 h-4" /> Back to All Schools
            </button>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-white">{selectedSchoolView.name}</h2>
                <p className="text-xs text-indigo-400 font-mono font-bold mt-1">CODE: {selectedSchoolView.code} • {selectedSchoolView.address}</p>
              </div>
              <div className="flex gap-4 text-right">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase block">Teachers</span>
                  <span className="text-xl font-black text-purple-400">
                    {staffList.filter(st => st.school_id === selectedSchoolView.id && st.role === 'teacher').length}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase block">Students</span>
                  <span className="text-xl font-black text-pink-400">
                    {studentsList.filter(st => st.school_id === selectedSchoolView.id).length}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" /> Assigned Teachers
                </h3>
                <div className="space-y-2">
                  {staffList.filter(st => st.school_id === selectedSchoolView.id && st.role === 'teacher').map(t => (
                    <div key={t.id} className="p-3 bg-slate-950 rounded-2xl border border-slate-800/60 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-white text-sm">{t.full_name}</div>
                        <div className="text-xs text-slate-400 font-mono">{t.email}</div>
                      </div>
                      <span className="text-xs px-2.5 py-1 bg-purple-500/20 text-purple-300 font-bold rounded-lg">
                        Grade {t.grade}-{t.section}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-pink-400" /> Enrolled Students
                </h3>
                <div className="space-y-2">
                  {studentsList.filter(st => st.school_id === selectedSchoolView.id).map(s => (
                    <div key={s.id} className="p-3 bg-slate-950 rounded-2xl border border-slate-800/60 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-white text-sm">{s.full_name}</div>
                        <div className="text-xs text-slate-400">Grade {s.grade} - Section {s.section}</div>
                      </div>
                      <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg">
                        {s.points || 0} XP
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: STAFF MANAGEMENT */}
        {activeTab === 'staff' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <h2 className="text-lg font-black mb-4 flex items-center gap-2 text-white">
                <UserPlus className="w-5 h-5 text-purple-400" /> Provision Principal / Teacher Account
              </h2>
              <form onSubmit={handleCreateStaff} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Kumar"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-purple-500 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="staff@school.com"
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-purple-500 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-purple-500 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Assign to School</label>
                  <select
                    value={staffSchoolId}
                    onChange={(e) => setStaffSchoolId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-purple-500 font-medium"
                    required
                  >
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Role Type</label>
                  <select
                    value={staffRole}
                    onChange={(e: any) => setStaffRole(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-purple-500 font-medium"
                  >
                    <option value="principal">Principal (School Head - Access to Entire School)</option>
                    <option value="teacher">Teacher (Class Teacher - Assigned Class Access)</option>
                  </select>
                </div>

                {staffRole === 'teacher' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Grade</label>
                      <select
                        value={staffGrade}
                        onChange={(e) => setStaffGrade(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-purple-500 font-medium"
                      >
                        {[1,2,3,4,5,6,7,8,9,10].map(g => (
                          <option key={g} value={g}>Grade {g}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Section</label>
                      <select
                        value={staffSection}
                        onChange={(e) => setStaffSection(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-purple-500 font-medium"
                      >
                        {['A','B','C','D'].map(sec => (
                          <option key={sec} value={sec}>Section {sec}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="md:col-span-2 bg-purple-600 hover:bg-purple-500 text-white font-black py-4 rounded-xl transition shadow-lg mt-2"
                >
                  Create Staff Account
                </button>
              </form>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-950 text-slate-400 font-bold text-xs uppercase">
                    <tr>
                      <th className="p-4">Name</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Assigned School</th>
                      <th className="p-4">Class</th>
                      <th className="p-4">Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {staffList.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-800/40">
                        <td className="p-4 font-bold text-white">{st.full_name}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                            st.role === 'principal' ? 'bg-amber-500/20 text-amber-300' : 'bg-purple-500/20 text-purple-300'
                          }`}>
                            {st.role}
                          </span>
                        </td>
                        <td className="p-4 text-slate-300">{st.schools?.name || 'Global'}</td>
                        <td className="p-4 text-slate-300">{st.grade ? `Grade ${st.grade} - ${st.section}` : 'Full School'}</td>
                        <td className="p-4 text-slate-400 font-mono text-xs">{st.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: STUDENT ROSTER */}
        {activeTab === 'students' && !selectedStudentDetail && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-sm">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent outline-none text-white text-xs font-medium"
                  />
                </div>

                <select
                  value={schoolFilter}
                  onChange={(e) => setSchoolFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none"
                >
                  <option value="All">All Schools</option>
                  {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>

                <select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none"
                >
                  <option value="All">All Grades</option>
                  {[1,2,3,4,5,6,7,8,9,10].map(g => <option key={g} value={g.toString()}>Grade {g}</option>)}
                </select>

                <select
                  value={sectionFilter}
                  onChange={(e) => setSectionFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none"
                >
                  <option value="All">All Sections</option>
                  {['A','B','C','D'].map(sec => <option key={sec} value={sec}>Section {sec}</option>)}
                </select>
              </div>

              <div className="text-xs font-bold text-slate-400">
                Found {filteredStudents.length} Students
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-950 text-slate-400 font-bold text-xs uppercase">
                    <tr>
                      <th className="p-4">Student</th>
                      <th className="p-4">School</th>
                      <th className="p-4">Grade & Section</th>
                      <th className="p-4">Points</th>
                      <th className="p-4">Streak</th>
                      <th className="p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredStudents.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-800/40">
                        <td className="p-4 font-bold text-white">{st.full_name}</td>
                        <td className="p-4 text-slate-300">{st.schools?.name}</td>
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
                            className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg text-xs font-bold transition"
                          >
                            View Performance
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* STUDENT DRILL-DOWN MODAL / DETAIL VIEW */}
        {activeTab === 'students' && selectedStudentDetail && (
          <div className="space-y-6 animate-in fade-in">
            <button
              onClick={() => setSelectedStudentDetail(null)}
              className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-900 px-4 py-2 rounded-xl border border-slate-800"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Student Roster
            </button>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black text-white">{selectedStudentDetail.full_name}</h2>
                  <p className="text-xs text-indigo-400 font-bold mt-1">
                    {selectedStudentDetail.schools?.name} • Grade {selectedStudentDetail.grade} - Section {selectedStudentDetail.section}
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
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" /> Speech & AI Evaluation History
              </h3>
              <div className="space-y-3">
                {speechLogs.filter(log => log.student_id === selectedStudentDetail.id).length === 0 ? (
                  <p className="text-slate-500 text-sm">No speaking attempts recorded yet for this student.</p>
                ) : (
                  speechLogs.filter(log => log.student_id === selectedStudentDetail.id).map(log => (
                    <div key={log.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-indigo-400">{log.lessons?.title}</span>
                        <span className="text-sm font-black text-emerald-400">{log.overall_score}% Overall Score</span>
                      </div>
                      <p className="text-xs text-slate-300 italic">"{log.transcribed_text}"</p>
                      <div className="flex gap-4 text-xs font-bold text-slate-400 pt-1 border-t border-slate-800">
                        <span>Pronunciation: <strong className="text-white">{log.pronunciation_score}%</strong></span>
                        <span>Fluency: <strong className="text-white">{log.fluency_score}%</strong></span>
                        <span>Vocabulary: <strong className="text-white">{log.vocabulary_score}%</strong></span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: LESSONS CURRICULUM */}
        {activeTab === 'lessons' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <h2 className="text-lg font-black mb-4 flex items-center gap-2 text-white">
                <BookOpen className="w-5 h-5 text-emerald-400" /> Master Curriculum Builder (Grades 1-10 Global)
              </h2>
              <form onSubmit={handleCreateLesson} className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Total Lesson Base XP</label>
                    <input
                      type="number"
                      value={lessonBaseXP}
                      onChange={(e) => setLessonBaseXP(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Speech Max XP</label>
                    <input
                      type="number"
                      value={lessonSpeechXP}
                      onChange={(e) => setLessonSpeechXP(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Activity Max XP</label>
                    <input
                      type="number"
                      value={lessonActivityXP}
                      onChange={(e) => setLessonActivityXP(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Quiz Max XP</label>
                    <input
                      type="number"
                      value={lessonQuizXP}
                      onChange={(e) => setLessonQuizXP(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Target Grade</label>
                    <select
                      value={lessonGrade}
                      onChange={(e) => setLessonGrade(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500 font-medium"
                    >
                      {[1,2,3,4,5,6,7,8,9,10].map(g => (
                        <option key={g} value={g}>Grade {g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Lesson Number</label>
                    <input
                      type="number"
                      value={lessonNumber}
                      onChange={(e) => setLessonNumber(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500 font-medium"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Lesson Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Introducing Yourself and Making Friends"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500 font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">🎯 1. Learning Objectives (One per line)</label>
                    <textarea
                      placeholder="Greet others with confidence&#10;Form clear introductory sentences"
                      value={learningObjectives}
                      onChange={(e) => setLearningObjectives(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500 font-medium h-24"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">📖 2. Vocabulary Words (One per line)</label>
                    <textarea
                      placeholder="Confident&#10;Communication&#10;Introduce"
                      value={vocabInput}
                      onChange={(e) => setVocabInput(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500 font-medium h-24"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">💬 3. Useful Sentences (One per line)</label>
                    <textarea
                      placeholder="Hello, my name is...&#10;Nice to meet you!"
                      value={usefulSentences}
                      onChange={(e) => setUsefulSentences(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500 font-medium h-24"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">🗣️ 5. Repeat & Fluency Drill (One per line)</label>
                    <textarea
                      placeholder="I am proud of my school.&#10;I love learning English."
                      value={repeatContent}
                      onChange={(e) => setRepeatContent(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500 font-medium h-24"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">🎤 9. AI Speech Evaluation Prompt</label>
                    <input
                      type="text"
                      placeholder="Introduce yourself by stating your name, age, and favorite subject."
                      value={speakingPrompt}
                      onChange={(e) => setSpeakingPrompt(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500 font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">🏆 Follow-up 30-Second Speaking Challenge</label>
                    <input
                      type="text"
                      placeholder="Speak for 30 seconds about your best friend."
                      value={speakingChallenge}
                      onChange={(e) => setSpeakingChallenge(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl transition shadow-lg"
                >
                  Publish Lesson to Global Curriculum
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lessonsList.map(l => (
                <div key={l.id} className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-black text-xs rounded-full border border-emerald-500/30">
                    GRADE {l.grade} • LESSON {l.lesson_number}
                  </span>
                  <h3 className="text-lg font-bold text-white">{l.title}</h3>
                  <p className="text-xs text-slate-400 italic">Prompt: "{l.speaking_prompt}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: INTERACTIVE ACTIVITIES (WORD BUILDER & TYPING CHALLENGE) */}
        {activeTab === 'activities' && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6 shadow-xl">
            <div>
              <h2 className="text-xl font-black flex items-center gap-2 text-white">
                <Layers className="w-5 h-5 text-amber-400" /> Interactive Activity Creator
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Create engaging Word Builder letter scrambles and Typing challenges with the 3-attempt rule.
              </p>
            </div>

            <form onSubmit={handleCreateActivity} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Target Lesson</label>
                  <select
                    value={actLessonId}
                    onChange={(e) => setActLessonId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500 font-medium text-xs"
                    required
                  >
                    {lessonsList.map(l => (
                      <option key={l.id} value={l.id}>
                        Grade {l.grade} - Lesson {l.lesson_number}: {l.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Activity Type</label>
                  <select
                    value={actType}
                    onChange={(e: any) => setActType(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500 font-medium text-xs"
                  >
                    <option value="word_builder">🧩 Word Builder (Letter Scramble)</option>
                    <option value="fill_in_blank">⌨️ Typing Challenge (Fill in the Blank)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">XP Points Reward</label>
                  <input
                    type="number"
                    value={actPoints}
                    onChange={(e) => setActPoints(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500 font-medium text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Activity Title</label>
                <input
                  type="text"
                  placeholder={actType === 'word_builder' ? 'e.g. Build the Greeting Word' : 'e.g. Complete the Polite Sentence'}
                  value={actTitle}
                  onChange={(e) => setActTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500 font-medium text-xs"
                  required
                />
              </div>

              {/* Word Builder Settings */}
              {actType === 'word_builder' && (
                <div className="p-5 bg-slate-950 rounded-2xl border border-indigo-500/20 space-y-4">
                  <span className="text-xs font-black text-indigo-400 uppercase tracking-wider block">
                    🧩 Word Builder Settings (Auto-scrambles letters for students)
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Target Word (e.g. MORNING)</label>
                      <input
                        type="text"
                        placeholder="MORNING"
                        value={wbTargetWord}
                        onChange={(e) => setWbTargetWord(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono uppercase font-bold outline-none focus:border-indigo-500 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Clue / Meaning</label>
                      <input
                        type="text"
                        placeholder="The early part of the day before noon"
                        value={wbClue}
                        onChange={(e) => setWbClue(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 text-xs font-medium"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Typing Challenge Settings */}
              {actType === 'fill_in_blank' && (
                <div className="p-5 bg-slate-950 rounded-2xl border border-amber-500/20 space-y-4">
                  <span className="text-xs font-black text-amber-400 uppercase tracking-wider block">
                    ⌨️ Typing Challenge Settings (3 attempts allowed with auto-fail)
                  </span>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Sentence with blank (Use '___' for blank space)</label>
                    <input
                      type="text"
                      placeholder="e.g. Good ___ teacher, nice to see you!"
                      value={actSentence}
                      onChange={(e) => setActSentence(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500 text-xs font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Acceptable Answer(s) (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. morning, Morning"
                      value={actAnswer}
                      onChange={(e) => setActAnswer(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500 text-xs font-medium"
                      required
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-black py-4 rounded-xl transition shadow-lg text-sm"
              >
                Deploy Interactive Activity to Lesson
              </button>
            </form>
          </div>
        )}

        {/* TAB: QUIZZES */}
        {activeTab === 'quizzes' && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
            <h2 className="text-lg font-black flex items-center gap-2 text-white">
              <HelpCircle className="w-5 h-5 text-cyan-400" /> Create Multiple-Choice Quiz Question
            </h2>
            <form onSubmit={handleCreateQuiz} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Select Lesson</label>
                <select
                  value={quizLessonId}
                  onChange={(e) => setQuizLessonId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-cyan-500 font-medium"
                  required
                >
                  {lessonsList.map(l => (
                    <option key={l.id} value={l.id}>Grade {l.grade} - Lesson {l.lesson_number}: {l.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Question Prompt</label>
                <input
                  type="text"
                  placeholder="e.g. What is the correct response to 'How are you?'"
                  value={quizQuestion}
                  onChange={(e) => setQuizQuestion(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-cyan-500 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Option A"
                  value={optA}
                  onChange={(e) => setOptA(e.target.value)}
                  className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none font-medium"
                  required
                />
                <input
                  type="text"
                  placeholder="Option B"
                  value={optB}
                  onChange={(e) => setOptB(e.target.value)}
                  className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none font-medium"
                  required
                />
                <input
                  type="text"
                  placeholder="Option C"
                  value={optC}
                  onChange={(e) => setOptC(e.target.value)}
                  className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none font-medium"
                  required
                />
                <input
                  type="text"
                  placeholder="Option D"
                  value={optD}
                  onChange={(e) => setOptD(e.target.value)}
                  className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Correct Answer</label>
                <select
                  value={correctOptIndex}
                  onChange={(e) => setCorrectOptIndex(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-cyan-500 font-medium"
                >
                  <option value="0">Option A</option>
                  <option value="1">Option B</option>
                  <option value="2">Option C</option>
                  <option value="3">Option D</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black py-4 rounded-xl transition shadow-lg"
              >
                Save Quiz Question
              </button>
            </form>
          </div>
        )}

        {/* TAB: GAMIFICATION */}
        {activeTab === 'gamification' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" /> Points Configuration
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-sm font-bold text-slate-300">Complete Master Lesson</span>
                  <input
                    type="number"
                    value={ptsLesson}
                    onChange={(e) => setPtsLesson(parseInt(e.target.value))}
                    className="w-20 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-center font-bold"
                  />
                </div>

                <div className="flex justify-between items-center bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-sm font-bold text-slate-300">AI Speech Attempt</span>
                  <input
                    type="number"
                    value={ptsSpeaking}
                    onChange={(e) => setPtsSpeaking(parseInt(e.target.value))}
                    className="w-20 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-center font-bold"
                  />
                </div>

                <div className="flex justify-between items-center bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-sm font-bold text-slate-300">Wordwall Activity Completed</span>
                  <input
                    type="number"
                    value={ptsActivity}
                    onChange={(e) => setPtsActivity(parseInt(e.target.value))}
                    className="w-20 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-center font-bold"
                  />
                </div>

                <div className="flex justify-between items-center bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-sm font-bold text-slate-300">Quiz Completed</span>
                  <input
                    type="number"
                    value={ptsQuiz}
                    onChange={(e) => setPtsQuiz(parseInt(e.target.value))}
                    className="w-20 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-center font-bold"
                  />
                </div>

                <button
                  onClick={() => {
                    setStatusMsg('Gamification point rules updated across all schools!');
                    setTimeout(() => setStatusMsg(''), 3000);
                  }}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl transition shadow-lg"
                >
                  Save Point Values
                </button>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-400" /> Configured Student Badges
              </h2>
              <div className="space-y-3">
                {badgesList.map(b => (
                  <div key={b.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-pink-500/20 text-pink-400 rounded-xl">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{b.name}</h4>
                        <p className="text-xs text-slate-400">{b.description}</p>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 bg-slate-800 text-slate-300 font-bold rounded-lg uppercase">
                      {b.criteria_type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}