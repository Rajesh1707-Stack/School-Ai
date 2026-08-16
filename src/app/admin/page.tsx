'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  School, Users, BookOpen, Plus, LogOut, ShieldCheck, 
  GraduationCap, UserPlus, Sparkles, CheckCircle2, ChevronRight,
  Filter, Search, Award, HelpCircle, Layers,
  BarChart3, Clock, Flame, ArrowLeft, RefreshCw, Star, Trash2, Edit3, Check,
  Volume2, AlertCircle, Wand2, Download, X, KeyRound
} from 'lucide-react';

export default function AdminDashboard() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'schools' | 'staff' | 'students' | 'lessons' | 'activities' | 'quizzes' | 'gamification'>('dashboard');
   
  // Data Repositories
  const [schools, setSchools] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [lessonsList, setLessonsList] = useState<any[]>([]);
  const [activitiesList, setActivitiesList] = useState<any[]>([]);
  const [quizzesList, setQuizzesList] = useState<any[]>([]);
  const [badgesList, setBadgesList] = useState<any[]>([]);
  const [speechLogs, setSpeechLogs] = useState<any[]>([]);

  // Selected Records for Deep Drill-Down & Editing
  const [selectedSchoolView, setSelectedSchoolView] = useState<any | null>(null);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<any | null>(null);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  
  // Lesson, Activity & Quiz Editing States
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);

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

  // Form States - Interactive Activity
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

    const { data: actData } = await supabase.from('activities').select('*, lessons(title, grade, lesson_number)');
    if (actData) setActivitiesList(actData);

    const { data: qData } = await supabase.from('quizzes').select('*, lessons(title, grade, lesson_number)');
    if (qData) setQuizzesList(qData);

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

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const updatePayload: any = {
      full_name: editingUser.full_name,
      grade: parseInt(editingUser.grade) || null,
      section: editingUser.section,
      points: parseInt(editingUser.points) || 0,
      current_streak: parseInt(editingUser.current_streak) || 1,
    };

    const { error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', editingUser.id);

    if (newPasswordInput.trim().length > 0) {
      await fetch('/api/admin/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: editingUser.id, newPassword: newPasswordInput }),
      });
    }

    if (!error) {
      setStatusMsg(`Updated user ${editingUser.full_name} successfully!`);
      setEditingUser(null);
      setNewPasswordInput('');
      fetchAllAdminData();
      setTimeout(() => setStatusMsg(''), 3000);
    } else {
      alert(error.message);
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (!error) {
        setStatusMsg(`Deleted user ${name} successfully.`);
        fetchAllAdminData();
        setTimeout(() => setStatusMsg(''), 3000);
      } else {
        alert(error.message);
      }
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

  const handleSelectLessonForEdit = (lesson: any) => {
    setEditingLessonId(lesson.id);
    setLessonGrade(lesson.grade?.toString() || '1');
    setLessonNumber(lesson.lesson_number?.toString() || '1');
    setLessonTitle(lesson.title || '');
    setLessonDesc(lesson.description || '');
    setLearningObjectives(Array.isArray(lesson.learning_objectives) ? lesson.learning_objectives.join('\n') : '');
    setVocabInput(Array.isArray(lesson.vocabulary) ? lesson.vocabulary.map((v: any) => v.word || v).join('\n') : '');
    setUsefulSentences(Array.isArray(lesson.useful_sentences) ? lesson.useful_sentences.map((s: any) => s.sentence || s).join('\n') : '');
    setRepeatContent(Array.isArray(lesson.repeat_sentences) ? lesson.repeat_sentences.join('\n') : '');
    setSpeakingPrompt(lesson.speaking_prompt || '');
    setSpeakingChallenge(lesson.speaking_challenge || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLessonId) return;

    const objectivesArr = learningObjectives.split('\n').filter(Boolean);
    const vocabArr = vocabInput.split('\n').map(v => ({ word: v.trim() })).filter(v => v.word);
    const sentencesArr = usefulSentences.split('\n').map(s => ({ sentence: s.trim() })).filter(s => s.sentence);
    const repeatArr = repeatContent.split('\n').filter(Boolean);

    const { error } = await supabase
      .from('lessons')
      .update({
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
      })
      .eq('id', editingLessonId);

    if (!error) {
      setEditingLessonId(null);
      setLessonTitle('');
      setLessonDesc('');
      setLearningObjectives('');
      setVocabInput('');
      setUsefulSentences('');
      setRepeatContent('');
      setSpeakingPrompt('');
      setSpeakingChallenge('');
      setStatusMsg('Lesson updated successfully!');
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

    if (editingActivityId) {
      const { error } = await supabase.from('activities').update({
        lesson_id: actLessonId,
        type: actType,
        title: actTitle,
        question_data: questionData,
        points_reward: parseInt(actPoints) || 20
      }).eq('id', editingActivityId);

      if (!error) {
        setEditingActivityId(null);
        setActTitle('');
        setActSentence('');
        setActAnswer('');
        setWbTargetWord('');
        setWbClue('');
        setStatusMsg('Activity updated successfully!');
        fetchAllAdminData();
        setTimeout(() => setStatusMsg(''), 3000);
      } else {
        alert(error.message);
      }
    } else {
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
    }
  };

  const handleSelectActivityForEdit = (act: any) => {
    setEditingActivityId(act.id);
    setActLessonId(act.lesson_id || '');
    setActType(act.type || 'word_builder');
    setActTitle(act.title || '');
    setActPoints(act.points_reward?.toString() || '20');
    if (act.type === 'word_builder') {
      setWbTargetWord(act.question_data?.target_word || '');
      setWbClue(act.question_data?.clue || '');
    } else {
      setActSentence(act.question_data?.sentence || '');
      setActAnswer(Array.isArray(act.question_data?.acceptable_answers) ? act.question_data.acceptable_answers.join(', ') : '');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteActivity = async (id: string) => {
    if (confirm('Are you sure you want to delete this activity?')) {
      const { error } = await supabase.from('activities').delete().eq('id', id);
      if (!error) {
        setStatusMsg('Activity deleted successfully.');
        fetchAllAdminData();
        setTimeout(() => setStatusMsg(''), 3000);
      } else {
        alert(error.message);
      }
    }
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingQuizId) {
      const { error } = await supabase.from('quizzes').update({
        lesson_id: quizLessonId,
        question: quizQuestion,
        options: [optA, optB, optC, optD],
        correct_option_index: parseInt(correctOptIndex),
        marks: 5
      }).eq('id', editingQuizId);

      if (!error) {
        setEditingQuizId(null);
        setQuizQuestion('');
        setOptA('');
        setOptB('');
        setOptC('');
        setOptD('');
        setStatusMsg('Quiz question updated successfully!');
        fetchAllAdminData();
        setTimeout(() => setStatusMsg(''), 3000);
      } else {
        alert(error.message);
      }
    } else {
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
        fetchAllAdminData();
        setTimeout(() => setStatusMsg(''), 3000);
      } else {
        alert(error.message);
      }
    }
  };

  const handleSelectQuizForEdit = (q: any) => {
    setEditingQuizId(q.id);
    setQuizLessonId(q.lesson_id || '');
    setQuizQuestion(q.question || '');
    setOptA(q.options?.[0] || '');
    setOptB(q.options?.[1] || '');
    setOptC(q.options?.[2] || '');
    setOptD(q.options?.[3] || '');
    setCorrectOptIndex(q.correct_option_index?.toString() || '0');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteQuiz = async (id: string) => {
    if (confirm('Are you sure you want to delete this quiz question?')) {
      const { error } = await supabase.from('quizzes').delete().eq('id', id);
      if (!error) {
        setStatusMsg('Quiz question deleted successfully.');
        fetchAllAdminData();
        setTimeout(() => setStatusMsg(''), 3000);
      } else {
        alert(error.message);
      }
    }
  };

  const exportToExcel = (data: any[], filename: string, headers: string[], rowMapper: (item: any) => string[]) => {
    if (data.length === 0) {
      alert('No data available to export.');
      return;
    }
    const rows = data.map(item => rowMapper(item).map(val => `"${val || ''}"`).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-slate-900">
      {/* Top Navbar */}
      <header className="bg-white/95 border-b border-slate-200 backdrop-blur-xl px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white rounded-2xl shadow-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              English Excel <span className="text-xs px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full border border-indigo-500/30">Super Admin</span>
            </h1>
            <p className="hidden sm:block text-xs text-slate-500 font-semibold">Multi-School Management & Full Access Control Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllAdminData}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition border border-slate-300"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl font-bold text-sm transition"
          >
            <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1440px] w-full mx-auto px-4 py-5 sm:px-6 lg:px-8 space-y-6 flex-1">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.08),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.06),transparent_30%)]" />
        {statusMsg && (
          <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl font-bold animate-in fade-in slide-in-from-top-2 duration-200">
            <CheckCircle2 className="w-5 h-5" /> {statusMsg}
          </div>
        )}

        {/* Global Navigation Bar */}
        <div className="flex gap-2 p-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Overview', icon: BarChart3 },
            { id: 'schools', label: `Schools (${schools.length})`, icon: School },
            { id: 'staff', label: `Staff (${staffList.length})`, icon: UserPlus },
            { id: 'students', label: `Students (${studentsList.length})`, icon: GraduationCap },
            { id: 'lessons', label: `Lessons (${lessonsList.length})`, icon: BookOpen },
            { id: 'activities', label: `Wordwall Activities (${activitiesList.length})`, icon: Layers },
            { id: 'quizzes', label: `Quizzes (${quizzesList.length})`, icon: HelpCircle },
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
                  setEditingUser(null);
                }}
                className={`flex shrink-0 items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition ${
                  isActive ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-500 hover:text-slate-900 hover:bg-indigo-50'
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
              <div className="bg-white border border-slate-200 p-5 rounded-3xl relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 p-4 opacity-10"><School className="w-16 h-16 text-indigo-400" /></div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Schools</span>
                <div className="text-4xl font-black text-slate-900 mt-1">{schools.length}</div>
                <div className="text-xs text-emerald-400 font-bold mt-2">100% Data Isolated</div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-3xl relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Users className="w-16 h-16 text-purple-400" /></div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Staff Accounts</span>
                <div className="text-4xl font-black text-slate-900 mt-1">{staffList.length}</div>
                <div className="text-xs text-indigo-400 font-bold mt-2">
                  {staffList.filter(s => s.role === 'principal').length} Principals • {staffList.filter(s => s.role === 'teacher').length} Teachers
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-3xl relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 p-4 opacity-10"><GraduationCap className="w-16 h-16 text-pink-400" /></div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Students</span>
                <div className="text-4xl font-black text-slate-900 mt-1">{studentsList.length}</div>
                <div className="text-xs text-pink-400 font-bold mt-2">Grades 1 to 10 Enrolled</div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-3xl relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles className="w-16 h-16 text-amber-400" /></div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Speech Evaluations</span>
                <div className="text-4xl font-black text-slate-900 mt-1">{speechLogs.length}</div>
                <div className="text-xs text-amber-400 font-bold mt-2">Recorded Attempts Logged</div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" /> Recent AI Speech Submissions Across Schools
                </h2>
                <button
                  onClick={() => exportToExcel(speechLogs, 'Speech_Submissions_Report', ['Student', 'Class', 'Lesson', 'Overall Score (%)', 'Pronunciation (%)', 'Fluency (%)', 'Transcript'], log => [
                    log.profiles?.full_name,
                    `Grade ${log.profiles?.grade}-${log.profiles?.section}`,
                    log.lessons?.title,
                    log.overall_score,
                    log.pronunciation_score,
                    log.fluency_score,
                    log.transcribed_text
                  ])}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition"
                >
                  <Download className="w-4 h-4" /> Export as Excel (CSV)
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100/80 text-slate-500 font-bold text-xs uppercase">
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
                  <tbody className="divide-y divide-slate-200">
                    {speechLogs.slice(0, 5).map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="p-4 font-bold text-slate-900">{log.profiles?.full_name}</td>
                        <td className="p-4 text-indigo-400 font-bold">Grade {log.profiles?.grade}-{log.profiles?.section}</td>
                        <td className="p-4 text-slate-600">{log.lessons?.title}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-600 font-black rounded-lg text-xs">
                            {log.overall_score}%
                          </span>
                        </td>
                        <td className="p-4 text-emerald-600 font-bold">{log.pronunciation_score}%</td>
                        <td className="p-4 text-amber-600 font-bold">{log.fluency_score}%</td>
                        <td className="p-4 text-slate-500 italic text-xs max-w-xs truncate">"{log.transcribed_text}"</td>
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
            <div className="bg-white border border-slate-200 p-6 rounded-3xl">
              <h2 className="text-lg font-black mb-4 flex items-center gap-2 text-slate-900">
                <Plus className="w-5 h-5 text-indigo-400" /> Create & Provision New School
              </h2>
              <form onSubmit={handleCreateSchool} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="School Name"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-500 font-medium"
                  required
                />
                <input
                  type="text"
                  placeholder="Unique School Code (e.g. EDIS01)"
                  value={schoolCode}
                  onChange={(e) => setSchoolCode(e.target.value)}
                  className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-500 font-medium uppercase"
                  required
                />
                <input
                  type="text"
                  placeholder="City / Address"
                  value={schoolAddress}
                  onChange={(e) => setSchoolAddress(e.target.value)}
                  className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-500 font-medium"
                />
                <input
                  type="email"
                  placeholder="Official Email"
                  value={schoolEmail}
                  onChange={(e) => setSchoolEmail(e.target.value)}
                  className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-500 font-medium"
                />
                <input
                  type="text"
                  placeholder="Contact Number"
                  value={schoolContact}
                  onChange={(e) => setSchoolContact(e.target.value)}
                  className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-500 font-medium"
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
                  <div key={s.id} className="p-6 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between space-y-4 shadow-sm">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-xl text-slate-900">{s.name}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">{s.address || 'Address not registered'}</p>
                        </div>
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full text-xs font-bold">
                          Active
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-200 text-center">
                        <div className="bg-slate-50 p-2.5 rounded-2xl">
                          <span className="text-xs text-slate-500 font-bold block">CODE</span>
                          <span className="text-sm font-black text-indigo-600 font-mono">{s.code}</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-2xl">
                          <span className="text-xs text-slate-500 font-bold block">TEACHERS</span>
                          <span className="text-sm font-black text-purple-600">{schoolTeachers.length}</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-2xl">
                          <span className="text-xs text-slate-500 font-bold block">STUDENTS</span>
                          <span className="text-sm font-black text-pink-600">{schoolStudents.length}</span>
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-slate-500 font-medium">
                        Principal: <span className="text-slate-700 font-bold">{principal?.full_name || 'No Principal Assigned'}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedSchoolView(s)}
                      className="w-full py-3 bg-slate-100 hover:bg-indigo-600 text-slate-700 hover:text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
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
              className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 bg-white px-4 py-2 rounded-xl border border-slate-200"
            >
              <ArrowLeft className="w-4 h-4" /> Back to All Schools
            </button>

            <div className="bg-white border border-slate-200 p-6 rounded-3xl flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900">{selectedSchoolView.name}</h2>
                <p className="text-xs text-indigo-600 font-mono font-bold mt-1">CODE: {selectedSchoolView.code} • {selectedSchoolView.address}</p>
              </div>
              <div className="flex gap-4 text-right">
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase block">Teachers</span>
                  <span className="text-xl font-black text-purple-600">
                    {staffList.filter(st => st.school_id === selectedSchoolView.id && st.role === 'teacher').length}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase block">Students</span>
                  <span className="text-xl font-black text-pink-600">
                    {studentsList.filter(st => st.school_id === selectedSchoolView.id).length}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4">
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" /> Assigned Teachers
                </h3>
                <div className="space-y-2">
                  {staffList.filter(st => st.school_id === selectedSchoolView.id && st.role === 'teacher').map(t => (
                    <div key={t.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{t.full_name}</div>
                        <div className="text-xs text-slate-500 font-mono">{t.email}</div>
                      </div>
                      <span className="text-xs px-2.5 py-1 bg-purple-500/20 text-purple-700 font-bold rounded-lg">
                        Grade {t.grade}-{t.section}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4">
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-pink-600" /> Enrolled Students
                </h3>
                <div className="space-y-2">
                  {studentsList.filter(st => st.school_id === selectedSchoolView.id).map(s => (
                    <div key={s.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{s.full_name}</div>
                        <div className="text-xs text-slate-500">Grade {s.grade} - Section {s.section}</div>
                      </div>
                      <span className="text-xs font-black text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-lg">
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
            <div className="bg-white border border-slate-200 p-6 rounded-3xl">
              <h2 className="text-lg font-black mb-4 flex items-center gap-2 text-slate-900">
                <UserPlus className="w-5 h-5 text-purple-600" /> Provision Principal / Teacher Account
              </h2>
              <form onSubmit={handleCreateStaff} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Kumar"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-purple-500 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Email Address (Username)</label>
                  <input
                    type="email"
                    placeholder="staff@school.com"
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-purple-500 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Password</label>
                  <input
                    type="text"
                    placeholder="Password"
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-purple-500 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Assign to School</label>
                  <select
                    value={staffSchoolId}
                    onChange={(e) => setStaffSchoolId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-purple-500 font-medium"
                    required
                  >
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Role Type</label>
                  <select
                    value={staffRole}
                    onChange={(e: any) => setStaffRole(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-purple-500 font-medium"
                  >
                    <option value="principal">Principal (School Head - Access to Entire School)</option>
                    <option value="teacher">Teacher (Class Teacher - Assigned Class Access)</option>
                  </select>
                </div>

                {staffRole === 'teacher' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Grade</label>
                      <select
                        value={staffGrade}
                        onChange={(e) => setStaffGrade(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-purple-500 font-medium"
                      >
                        {[1,2,3,4,5,6,7,8,9,10].map(g => (
                          <option key={g} value={g}>Grade {g}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Section</label>
                      <select
                        value={staffSection}
                        onChange={(e) => setStaffSection(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-purple-500 font-medium"
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

            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-4 flex justify-between items-center border-b border-slate-200">
                <span className="font-bold text-slate-700 text-sm">Staff Directory ({staffList.length})</span>
                <button
                  onClick={() => exportToExcel(staffList, 'Staff_Directory', ['Name', 'Role', 'School', 'Grade', 'Section', 'Email'], st => [
                    st.full_name, st.role, st.schools?.name, st.grade, st.section, st.email
                  ])}
                  className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition"
                >
                  <Download className="w-3.5 h-3.5" /> Export as Excel
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100/80 text-slate-500 font-bold text-xs uppercase">
                    <tr>
                      <th className="p-4">Name</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Assigned School</th>
                      <th className="p-4">Class</th>
                      <th className="p-4">Username (Email)</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {staffList.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-50">
                        <td className="p-4 font-bold text-slate-900">{st.full_name}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                            st.role === 'principal' ? 'bg-amber-500/20 text-amber-600' : 'bg-purple-500/20 text-purple-700'
                          }`}>
                            {st.role}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600">{st.schools?.name || 'Global'}</td>
                        <td className="p-4 text-slate-600">{st.grade ? `Grade ${st.grade} - ${st.section}` : 'Full School'}</td>
                        <td className="p-4 text-slate-500 font-mono text-xs">{st.email}</td>
                        <td className="p-4 text-right space-x-2">
                          <button onClick={() => setEditingUser(st)} className="px-2.5 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-bold inline-flex items-center gap-1" title="Edit / Reset Password">
                            <Edit3 className="w-3.5 h-3.5" /> Edit & Password
                          </button>
                          <button onClick={() => handleDeleteUser(st.id, st.full_name)} className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg inline-flex items-center" title="Delete Staff">
                            <Trash2 className="w-4 h-4" />
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

        {/* TAB: STUDENT ROSTER */}
        {activeTab === 'students' && !selectedStudentDetail && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-4 rounded-3xl flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm">
                  <Search className="w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent outline-none text-slate-900 text-xs font-medium"
                  />
                </div>

                <select
                  value={schoolFilter}
                  onChange={(e) => setSchoolFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                >
                  <option value="All">All Schools</option>
                  {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>

                <select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                >
                  <option value="All">All Grades</option>
                  {[1,2,3,4,5,6,7,8,9,10].map(g => <option key={g} value={g.toString()}>Grade {g}</option>)}
                </select>

                <select
                  value={sectionFilter}
                  onChange={(e) => setSectionFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                >
                  <option value="All">All Sections</option>
                  {['A','B','C','D'].map(sec => <option key={sec} value={sec}>Section {sec}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => exportToExcel(filteredStudents, 'Student_Roster', ['Name', 'School', 'Grade', 'Section', 'Points (XP)', 'Streak'], st => [
                    st.full_name, st.schools?.name, st.grade, st.section, st.points || 0, st.current_streak || 1
                  ])}
                  className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition"
                >
                  <Download className="w-4 h-4" /> Export as Excel
                </button>
                <span className="text-xs font-bold text-slate-500">
                  Found {filteredStudents.length} Students
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100/80 text-slate-500 font-bold text-xs uppercase">
                    <tr>
                      <th className="p-4">Student</th>
                      <th className="p-4">School</th>
                      <th className="p-4">Grade & Section</th>
                      <th className="p-4">Username (Email)</th>
                      <th className="p-4">Points</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredStudents.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-50">
                        <td className="p-4 font-bold text-slate-900">{st.full_name}</td>
                        <td className="p-4 text-slate-600">{st.schools?.name}</td>
                        <td className="p-4 font-bold text-indigo-600">Grade {st.grade} - {st.section}</td>
                        <td className="p-4 text-slate-500 font-mono text-xs">{st.email}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-600 font-black rounded-lg text-xs">
                            {st.points || 0} XP
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => setSelectedStudentDetail(st)}
                            className="px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-lg text-xs font-bold transition"
                          >
                            View Performance
                          </button>
                          <button onClick={() => setEditingUser(st)} className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg inline-flex items-center" title="Edit / Reset Password">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteUser(st.id, st.full_name)} className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg inline-flex items-center" title="Delete Student">
                            <Trash2 className="w-4 h-4" />
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

        {/* EDIT USER & PASSWORD RESET MODAL */}
        {editingUser && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-900">Edit User & Reset Password</h3>
                <button onClick={() => { setEditingUser(null); setNewPasswordInput(''); }} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl">
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>
              <form onSubmit={handleUpdateUser} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editingUser.full_name || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Username / Email (Read-only)</label>
                  <input
                    type="text"
                    value={editingUser.email || ''}
                    disabled
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-mono text-xs cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-indigo-600 mb-1 flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5" /> Assign New Password (Leave blank to keep current)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter new temporary password"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    className="w-full px-3 py-2 bg-indigo-50/50 border border-indigo-200 rounded-xl text-slate-900 font-medium text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Grade</label>
                    <input
                      type="number"
                      value={editingUser.grade || 1}
                      onChange={(e) => setEditingUser({ ...editingUser, grade: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Section</label>
                    <input
                      type="text"
                      value={editingUser.section || 'A'}
                      onChange={(e) => setEditingUser({ ...editingUser, section: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium text-xs"
                    />
                  </div>
                </div>
                {editingUser.role === 'student' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Total XP Points</label>
                      <input
                        type="number"
                        value={editingUser.points || 0}
                        onChange={(e) => setEditingUser({ ...editingUser, points: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Streak Days</label>
                      <input
                        type="number"
                        value={editingUser.current_streak || 1}
                        onChange={(e) => setEditingUser({ ...editingUser, current_streak: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium text-xs"
                      />
                    </div>
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition shadow-md mt-2"
                >
                  Save Changes & Update Password
                </button>
              </form>
            </div>
          </div>
        )}

        {/* STUDENT DRILL-DOWN MODAL / DETAIL VIEW */}
        {activeTab === 'students' && selectedStudentDetail && (
          <div className="space-y-6 animate-in fade-in">
            <button
              onClick={() => setSelectedStudentDetail(null)}
              className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 bg-white px-4 py-2 rounded-xl border border-slate-200"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Student Roster
            </button>

            <div className="bg-white border border-slate-200 p-6 rounded-3xl">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{selectedStudentDetail.full_name}</h2>
                  <p className="text-xs text-indigo-600 font-bold mt-1">
                    {selectedStudentDetail.schools?.name} • Grade {selectedStudentDetail.grade} - Section {selectedStudentDetail.section}
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-2xl font-black text-sm">
                    {selectedStudentDetail.points || 0} XP
                  </span>
                  <span className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl font-black text-sm">
                    {selectedStudentDetail.current_streak || 1} Day Streak
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" /> Speech & AI Evaluation History
              </h3>
              <div className="space-y-3">
                {speechLogs.filter(log => log.student_id === selectedStudentDetail.id).length === 0 ? (
                  <p className="text-slate-500 text-sm">No speaking attempts recorded yet for this student.</p>
                ) : (
                  speechLogs.filter(log => log.student_id === selectedStudentDetail.id).map(log => (
                    <div key={log.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-indigo-600">{log.lessons?.title}</span>
                        <span className="text-sm font-black text-emerald-600">{log.overall_score}% Overall Score</span>
                      </div>
                      <p className="text-xs text-slate-600 italic">"{log.transcribed_text}"</p>
                      <div className="flex gap-4 text-xs font-bold text-slate-500 pt-1 border-t border-slate-200">
                        <span>Pronunciation: <strong className="text-slate-900">{log.pronunciation_score}%</strong></span>
                        <span>Fluency: <strong className="text-slate-900">{log.fluency_score}%</strong></span>
                        <span>Vocabulary: <strong className="text-slate-900">{log.vocabulary_score}%</strong></span>
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
            <div className="bg-white border border-slate-200 p-6 rounded-3xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-black flex items-center gap-2 text-slate-900">
                  <BookOpen className="w-5 h-5 text-emerald-600" /> 
                  {editingLessonId ? 'Edit Global Lesson' : 'Master Curriculum Builder (Grades 1-10 Global)'}
                </h2>
                {editingLessonId && (
                  <button
                    onClick={() => {
                      setEditingLessonId(null);
                      setLessonTitle('');
                      setLessonDesc('');
                      setLearningObjectives('');
                      setVocabInput('');
                      setUsefulSentences('');
                      setRepeatContent('');
                      setSpeakingPrompt('');
                      setSpeakingChallenge('');
                    }}
                    className="text-xs font-bold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={editingLessonId ? handleUpdateLesson : handleCreateLesson} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Target Grade</label>
                    <select
                      value={lessonGrade}
                      onChange={(e) => setLessonGrade(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-emerald-500 font-medium"
                    >
                      {[1,2,3,4,5,6,7,8,9,10].map(g => (
                        <option key={g} value={g}>Grade {g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Lesson Number</label>
                    <input
                      type="number"
                      value={lessonNumber}
                      onChange={(e) => setLessonNumber(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-emerald-500 font-medium"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Lesson Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Introducing Yourself and Making Friends"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-emerald-500 font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">🎯 1. Learning Objectives (One per line)</label>
                    <textarea
                      placeholder="Greet others with confidence&#10;Form clear introductory sentences"
                      value={learningObjectives}
                      onChange={(e) => setLearningObjectives(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-emerald-500 font-medium h-24"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">📖 2. Vocabulary Words (One per line)</label>
                    <textarea
                      placeholder="Confident&#10;Communication&#10;Introduce"
                      value={vocabInput}
                      onChange={(e) => setVocabInput(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-emerald-500 font-medium h-24"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">💬 3. Useful Sentences (One per line)</label>
                    <textarea
                      placeholder="Hello, my name is...&#10;Nice to meet you!"
                      value={usefulSentences}
                      onChange={(e) => setUsefulSentences(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-emerald-500 font-medium h-24"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">🗣️ 5. Repeat & Fluency Drill (One per line)</label>
                    <textarea
                      placeholder="I am proud of my school.&#10;I love learning English."
                      value={repeatContent}
                      onChange={(e) => setRepeatContent(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-emerald-500 font-medium h-24"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">🎤 9. AI Speech Evaluation Prompt</label>
                    <input
                      type="text"
                      placeholder="Introduce yourself by stating your name, age, and favorite subject."
                      value={speakingPrompt}
                      onChange={(e) => setSpeakingPrompt(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-emerald-500 font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">🏆 Follow-up 30-Second Speaking Challenge</label>
                    <input
                      type="text"
                      placeholder="Speak for 30 seconds about your best friend."
                      value={speakingChallenge}
                      onChange={(e) => setSpeakingChallenge(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full text-white font-black py-4 rounded-xl transition shadow-lg ${
                    editingLessonId ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-emerald-600 hover:bg-emerald-500'
                  }`}
                >
                  {editingLessonId ? 'Update Lesson Changes' : 'Publish Lesson to Global Curriculum'}
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lessonsList.map(l => (
                <div key={l.id} className="p-5 bg-white border border-slate-200 rounded-3xl space-y-3 shadow-sm flex justify-between items-start">
                  <div>
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-700 font-black text-xs rounded-full border border-emerald-500/30">
                      GRADE {l.grade} • LESSON {l.lesson_number}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-2">{l.title}</h3>
                    <p className="text-xs text-slate-500 italic">Prompt: "{l.speaking_prompt}"</p>
                  </div>
                  <button
                    onClick={() => handleSelectLessonForEdit(l)}
                    className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl font-bold text-xs flex items-center gap-1 transition shrink-0"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: INTERACTIVE ACTIVITIES (WITH ADD & EDIT LIST DISPLAY) */}
        {activeTab === 'activities' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-6 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black flex items-center gap-2 text-slate-900">
                    <Layers className="w-5 h-5 text-amber-500" /> {editingActivityId ? 'Edit Activity' : 'Interactive Activity Creator'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Create engaging Word Builder letter scrambles and Typing challenges with the 3-attempt rule.
                  </p>
                </div>
                {editingActivityId && (
                  <button
                    onClick={() => {
                      setEditingActivityId(null);
                      setActTitle('');
                      setActSentence('');
                      setActAnswer('');
                      setWbTargetWord('');
                      setWbClue('');
                    }}
                    className="text-xs font-bold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleCreateActivity} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Target Lesson</label>
                    <select
                      value={actLessonId}
                      onChange={(e) => setActLessonId(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-amber-500 font-medium text-xs"
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
                    <label className="block text-xs font-bold text-slate-500 mb-1">Activity Type</label>
                    <select
                      value={actType}
                      onChange={(e: any) => setActType(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-amber-500 font-medium text-xs"
                    >
                      <option value="word_builder">🧩 Word Builder (Letter Scramble)</option>
                      <option value="fill_in_blank">⌨️ Typing Challenge (Fill in the Blank)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">XP Points Reward</label>
                    <input
                      type="number"
                      value={actPoints}
                      onChange={(e) => setActPoints(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-amber-500 font-medium text-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Activity Title</label>
                  <input
                    type="text"
                    placeholder={actType === 'word_builder' ? 'e.g. Build the Greeting Word' : 'e.g. Complete the Polite Sentence'}
                    value={actTitle}
                    onChange={(e) => setActTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-amber-500 font-medium text-xs"
                    required
                  />
                </div>

                {actType === 'word_builder' && (
                  <div className="p-5 bg-slate-50 rounded-2xl border border-indigo-500/20 space-y-4">
                    <span className="text-xs font-black text-indigo-600 uppercase tracking-wider block">
                      🧩 Word Builder Settings (Auto-scrambles letters for students)
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Target Word (e.g. MORNING)</label>
                        <input
                          type="text"
                          placeholder="MORNING"
                          value={wbTargetWord}
                          onChange={(e) => setWbTargetWord(e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-mono uppercase font-bold outline-none focus:border-indigo-500 text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Clue / Meaning</label>
                        <input
                          type="text"
                          placeholder="The early part of the day before noon"
                          value={wbClue}
                          onChange={(e) => setWbClue(e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-500 text-xs font-medium"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {actType === 'fill_in_blank' && (
                  <div className="p-5 bg-slate-50 rounded-2xl border border-amber-500/20 space-y-4">
                    <span className="text-xs font-black text-amber-600 uppercase tracking-wider block">
                      ⌨️ Typing Challenge Settings (3 attempts allowed with auto-fail)
                    </span>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Sentence with blank (Use '___' for blank space)</label>
                      <input
                        type="text"
                        placeholder="e.g. Good ___ teacher, nice to see you!"
                        value={actSentence}
                        onChange={(e) => setActSentence(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-amber-500 text-xs font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Acceptable Answer(s) (comma-separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. morning, Morning"
                        value={actAnswer}
                        onChange={(e) => setActAnswer(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-amber-500 text-xs font-medium"
                        required
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className={`w-full text-white font-black py-4 rounded-xl transition shadow-lg text-sm ${
                    editingActivityId ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500'
                  }`}
                >
                  {editingActivityId ? 'Update Activity Changes' : 'Deploy Interactive Activity to Lesson'}
                </button>
              </form>
            </div>

            {/* Activities List Below */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
              <h3 className="font-bold text-base text-slate-900">All Deployed Wordwall Activities ({activitiesList.length})</h3>
              <div className="space-y-3">
                {activitiesList.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No activities deployed yet.</p>
                ) : (
                  activitiesList.map(act => (
                    <div key={act.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-700 font-bold text-[10px] rounded-md uppercase">
                            {act.type === 'word_builder' ? 'Word Builder' : 'Typing Challenge'}
                          </span>
                          <span className="text-xs font-bold text-indigo-600">
                            Grade {act.lessons?.grade} - Lesson {act.lessons?.lesson_number}: {act.lessons?.title}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">{act.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Reward: <strong className="text-amber-600">+{act.points_reward} XP</strong></p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleSelectActivityForEdit(act)} className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl" title="Edit Activity">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteActivity(act.id)} className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl" title="Delete Activity">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: QUIZZES (WITH ADD & EDIT LIST DISPLAY) */}
        {activeTab === 'quizzes' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-sm">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-black flex items-center gap-2 text-slate-900">
                  <HelpCircle className="w-5 h-5 text-cyan-600" /> {editingQuizId ? 'Edit Quiz Question' : 'Create Multiple-Choice Quiz Question'}
                </h2>
                {editingQuizId && (
                  <button
                    onClick={() => {
                      setEditingQuizId(null);
                      setQuizQuestion('');
                      setOptA('');
                      setOptB('');
                      setOptC('');
                      setOptD('');
                    }}
                    className="text-xs font-bold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleCreateQuiz} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Select Lesson</label>
                  <select
                    value={quizLessonId}
                    onChange={(e) => setQuizLessonId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-cyan-500 font-medium"
                    required
                  >
                    {lessonsList.map(l => (
                      <option key={l.id} value={l.id}>Grade {l.grade} - Lesson {l.lesson_number}: {l.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Question Prompt</label>
                  <input
                    type="text"
                    placeholder="e.g. What is the correct response to 'How are you?'"
                    value={quizQuestion}
                    onChange={(e) => setQuizQuestion(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-cyan-500 font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Option A"
                    value={optA}
                    onChange={(e) => setOptA(e.target.value)}
                    className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none font-medium"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Option B"
                    value={optB}
                    onChange={(e) => setOptB(e.target.value)}
                    className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none font-medium"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Option C"
                    value={optC}
                    onChange={(e) => setOptC(e.target.value)}
                    className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none font-medium"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Option D"
                    value={optD}
                    onChange={(e) => setOptD(e.target.value)}
                    className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Correct Answer</label>
                  <select
                    value={correctOptIndex}
                    onChange={(e) => setCorrectOptIndex(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-cyan-500 font-medium"
                  >
                    <option value="0">Option A</option>
                    <option value="1">Option B</option>
                    <option value="2">Option C</option>
                    <option value="3">Option D</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className={`w-full text-white font-black py-4 rounded-xl transition shadow-lg ${
                    editingQuizId ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-cyan-600 hover:bg-cyan-500'
                  }`}
                >
                  {editingQuizId ? 'Update Quiz Question' : 'Save Quiz Question'}
                </button>
              </form>
            </div>

            {/* Quizzes List Below */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
              <h3 className="font-bold text-base text-slate-900">All Quiz Questions ({quizzesList.length})</h3>
              <div className="space-y-3">
                {quizzesList.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No quiz questions added yet.</p>
                ) : (
                  quizzesList.map(q => (
                    <div key={q.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center">
                      <div>
                        <span className="text-xs font-bold text-cyan-600">
                          Grade {q.lessons?.grade} - Lesson {q.lessons?.lesson_number}: {q.lessons?.title}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">{q.question}</h4>
                        <div className="flex gap-2 mt-2 text-[11px] text-slate-600">
                          {q.options?.map((opt: string, idx: number) => (
                            <span key={idx} className={`px-2 py-0.5 rounded-md ${idx === q.correct_option_index ? 'bg-emerald-500/20 text-emerald-700 font-bold' : 'bg-slate-200'}`}>
                              {String.fromCharCode(65 + idx)}: {opt}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleSelectQuizForEdit(q)} className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl" title="Edit Quiz">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteQuiz(q.id)} className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl" title="Delete Quiz">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: GAMIFICATION */}
        {activeTab === 'gamification' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-sm">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" /> Points Configuration
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-sm font-bold text-slate-600">Complete Master Lesson</span>
                  <input
                    type="number"
                    value={ptsLesson}
                    onChange={(e) => setPtsLesson(parseInt(e.target.value))}
                    className="w-20 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-center font-bold"
                  />
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-sm font-bold text-slate-600">AI Speech Attempt</span>
                  <input
                    type="number"
                    value={ptsSpeaking}
                    onChange={(e) => setPtsSpeaking(parseInt(e.target.value))}
                    className="w-20 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-center font-bold"
                  />
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-sm font-bold text-slate-600">Wordwall Activity Completed</span>
                  <input
                    type="number"
                    value={ptsActivity}
                    onChange={(e) => setPtsActivity(parseInt(e.target.value))}
                    className="w-20 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-center font-bold"
                  />
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-sm font-bold text-slate-600">Quiz Completed</span>
                  <input
                    type="number"
                    value={ptsQuiz}
                    onChange={(e) => setPtsQuiz(parseInt(e.target.value))}
                    className="w-20 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-center font-bold"
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

            <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-sm">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-600" /> Configured Student Badges
              </h2>
              <div className="space-y-3">
                {badgesList.map(b => (
                  <div key={b.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-pink-500/20 text-pink-600 rounded-xl">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{b.name}</h4>
                        <p className="text-xs text-slate-500">{b.description}</p>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 font-bold rounded-lg uppercase">
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