'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, Award, Flame, BookOpen, Mic, CheckCircle2, 
  ArrowRight, LogOut, Volume2, Star, Play, Check, X,
  Trophy, Compass, ArrowLeft, BarChart2, Zap, Lock,
  ChevronRight, FileText, AlertTriangle, Users, ImageIcon
} from 'lucide-react';
import SpeechAnalyzer from '@/components/speech/SpeechAnalyzer';
import TypingActivity from '@/components/activities/TypingActivity';
import WordBuilder from '@/components/activities/WordBuilder';
import ClassLeaderboard from '@/components/dashboard/ClassLeaderboard';
import StudentReportModal from '@/components/dashboard/StudentReportModal';
import confetti from 'canvas-confetti';

export default function StudentDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [speechHistory, setSpeechHistory] = useState<any[]>([]);
  const [classmates, setClassmates] = useState<any[]>([]);
  const [completedLessonsMap, setCompletedLessonsMap] = useState<{ [lessonId: string]: any }>({});
  const [showReportModal, setShowReportModal] = useState(false);

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'lessons' | 'leaderboard' | 'progress' | 'badges'>('lessons');
  const [selectedPracticeLesson, setSelectedPracticeLesson] = useState<any | null>(null);

  // Active Lesson Step-by-Step Flow (Skipping repeat drills as requested)
  const [activeLesson, setActiveLesson] = useState<any | null>(null);
  const [lessonStep, setLessonStep] = useState<
    'objectives' | 'vocab' | 'sentences' | 'conversation' | 
    'word_builder' | 'activities' | 'quiz' | 'speech' | 'challenge' | 'completed'
  >('objectives');

  // Deduction & Score Tracking States
  const [wbEarnedXP, setWbEarnedXP] = useState(0);
  const [typingEarnedXP, setTypingEarnedXP] = useState(0);
  const [quizCorrectCount, setQuizCorrectCount] = useState(0);
  const [speechScore, setSpeechScore] = useState(0);
  const [totalMistakes, setTotalMistakes] = useState(0);

  // Sub-Indices
  const [currentActIndex, setCurrentActIndex] = useState(0);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchStudentData();
  }, []);

  // Realtime Live Subscription
  useEffect(() => {
    if (!profile?.grade) return;

    const channel = supabase
      .channel('student-dashboard-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lessons' },
        () => fetchStudentData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activities' },
        () => {
          if (activeLesson) loadLessonActivities(activeLesson.id);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'quizzes' },
        () => {
          if (activeLesson) loadLessonActivities(activeLesson.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.grade, activeLesson?.id]);

  const fetchStudentData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*, schools(name, code)')
      .eq('id', user.id)
      .single();

    if (profileData) {
      setProfile(profileData);

      // 1. Fetch Grade Lessons
      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('*')
        .eq('grade', profileData.grade || 1)
        .order('lesson_number', { ascending: true });

      if (lessonsData) {
        setLessons(lessonsData);
        if (lessonsData.length > 0) setSelectedPracticeLesson(lessonsData[0]);
      }

      // 2. Fetch Completion Records
      const { data: compData } = await supabase
        .from('lesson_completions')
        .select('*')
        .eq('student_id', user.id);

      if (compData) {
        const cmap: any = {};
        compData.forEach(c => { cmap[c.lesson_id] = c; });
        setCompletedLessonsMap(cmap);
      }

      // 3. Fetch Classmates for Leaderboard
      const { data: classData } = await supabase
        .from('profiles')
        .select('*, schools(name)')
        .eq('school_id', profileData.school_id)
        .eq('grade', profileData.grade)
        .eq('section', profileData.section)
        .eq('role', 'student')
        .order('points', { ascending: false });

      if (classData) setClassmates(classData);

      // 4. Badges
      await supabase.rpc('check_and_award_badges', { p_student_id: user.id });
      const { data: allBadges } = await supabase.from('badges').select('*');
      const { data: unlockedData } = await supabase
        .from('student_badges')
        .select('badge_id')
        .eq('student_id', user.id);

      const unlockedSet = new Set(unlockedData?.map(ub => ub.badge_id) || []);
      if (allBadges) {
        setBadges(allBadges.map(b => ({ ...b, isUnlocked: unlockedSet.has(b.id) })));
      }

      // 5. Speech Logs
      const { data: speechData } = await supabase
        .from('speech_submissions')
        .select('*, lessons(title)')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

      if (speechData) setSpeechHistory(speechData);
    }
    setLoading(false);
  };

  const loadLessonActivities = async (lessonId: string) => {
    const { data: actData } = await supabase.from('activities').select('*').eq('lesson_id', lessonId);
    if (actData) setActivities(actData);

    const { data: qData } = await supabase.from('quizzes').select('*').eq('lesson_id', lessonId);
    if (qData) setQuizzes(qData);
  };

  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startLesson = async (lesson: any) => {
    if (completedLessonsMap[lesson.id]) {
      setSelectedPracticeLesson(lesson);
      setActiveTab('progress');
      return;
    }

    setActiveLesson(lesson);
    setLessonStep('objectives');
    setCurrentActIndex(0);
    setCurrentQuizIndex(0);
    setWbEarnedXP(0);
    setTypingEarnedXP(0);
    setQuizCorrectCount(0);
    setSpeechScore(0);
    setTotalMistakes(0);
    setSelectedQuizOption(null);

    await loadLessonActivities(lesson.id);
  };

  // 1. Word Builder Completion with Deduction
  const handleWordBuilderComplete = (scorePercentage: number) => {
    const earned = Math.round((scorePercentage / 100) * 20);
    const mistakesMade = Math.round(((100 - scorePercentage) / 100) * 5);
    setWbEarnedXP(earned);
    setTotalMistakes(prev => prev + mistakesMade);

    const typingList = activities.filter(a => a.type === 'fill_in_blank');
    setLessonStep(typingList.length > 0 ? 'activities' : quizzes.length > 0 ? 'quiz' : 'speech');
  };

  // 2. Typing Challenge with Attempt-Based Deductions
  const handleTypingSuccess = (attemptsTaken: number) => {
    const earned = attemptsTaken === 1 ? 4 : attemptsTaken === 2 ? 3 : 2;
    const mistakes = attemptsTaken - 1;

    setTypingEarnedXP(prev => prev + earned);
    setTotalMistakes(prev => prev + mistakes);

    const typingList = activities.filter(a => a.type === 'fill_in_blank');
    if (currentActIndex + 1 < typingList.length) {
      setCurrentActIndex(prev => prev + 1);
    } else {
      setLessonStep(quizzes.length > 0 ? 'quiz' : 'speech');
    }
  };

  const handleTypingFail = () => {
    setTotalMistakes(prev => prev + 3);
    const typingList = activities.filter(a => a.type === 'fill_in_blank');
    if (currentActIndex + 1 < typingList.length) {
      setCurrentActIndex(prev => prev + 1);
    } else {
      setLessonStep(quizzes.length > 0 ? 'quiz' : 'speech');
    }
  };

  // 3. Multiple Choice Quiz
  const handleQuizAnswer = (optionIndex: number) => {
    setSelectedQuizOption(optionIndex);
    const currentQuestion = quizzes[currentQuizIndex];
    if (optionIndex === currentQuestion.correct_option_index) {
      setQuizCorrectCount(prev => prev + 1);
    } else {
      setTotalMistakes(prev => prev + 1);
    }
  };

  const nextQuizQuestion = () => {
    if (currentQuizIndex + 1 < quizzes.length) {
      setCurrentQuizIndex(prev => prev + 1);
      setSelectedQuizOption(null);
    } else {
      setLessonStep('speech');
    }
  };

  // 4. Official AI Speech & Final Lesson Record
  const handleLessonSpeechComplete = async (evaluation: any, isChallenge: boolean = false) => {
    if (!profile || !activeLesson) return;

    setSpeechScore(evaluation.overallScore);

    const speechEarnedXP = Math.round(40 * (evaluation.overallScore / 100));
    const quizEarnedXP = quizCorrectCount * 4;
    const finalEarnedXP = wbEarnedXP + typingEarnedXP + quizEarnedXP + speechEarnedXP;

    const wbPercentage = (wbEarnedXP / 20) * 100;
    const typingPercentage = (typingEarnedXP / 20) * 100;
    const quizPercentage = (quizCorrectCount / (quizzes.length || 1)) * 100;

    await supabase.rpc('record_lesson_submission', {
      p_student_id: profile.id,
      p_lesson_id: activeLesson.id,
      p_word_builder_score: wbPercentage,
      p_typing_score: typingPercentage,
      p_quiz_score: quizPercentage,
      p_speech_score: evaluation.overallScore,
      p_total_mistakes: totalMistakes,
      p_earned_xp: finalEarnedXP,
    });

    await supabase.from('speech_submissions').insert([{
      student_id: profile.id,
      lesson_id: activeLesson.id,
      is_challenge: isChallenge,
      transcribed_text: evaluation.transcript,
      overall_score: evaluation.overallScore,
      pronunciation_score: evaluation.pronunciationScore,
      fluency_score: evaluation.fluencyScore,
      vocabulary_score: evaluation.vocabularyScore,
      grammar_score: evaluation.grammarScore || 85,
      corrected_sentence: evaluation.correctedSentence,
      vocab_upgrades: evaluation.vocabUpgrades || [],
      strengths: evaluation.strengths,
      improvements: evaluation.improvements,
    }]);

    fetchStudentData();

    if (!isChallenge && activeLesson.speaking_challenge) {
      setLessonStep('challenge');
    } else {
      setLessonStep('completed');
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
  };

  const handleStudioSpeechComplete = async (evaluation: any) => {
    if (!profile || !selectedPracticeLesson) return;

    await supabase.from('speech_submissions').insert([{
      student_id: profile.id,
      lesson_id: selectedPracticeLesson.id,
      is_challenge: false,
      transcribed_text: evaluation.transcript,
      overall_score: evaluation.overallScore,
      pronunciation_score: evaluation.pronunciationScore,
      fluency_score: evaluation.fluencyScore,
      vocabulary_score: evaluation.vocabularyScore,
      grammar_score: evaluation.grammarScore || 85,
      corrected_sentence: evaluation.correctedSentence,
      vocab_upgrades: evaluation.vocabUpgrades || [],
      strengths: evaluation.strengths,
      improvements: evaluation.improvements,
    }]);

    await supabase.rpc('award_student_xp_and_streak', {
      p_student_id: profile.id,
      p_earned_xp: 15,
    });

    fetchStudentData();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const currentPoints = profile?.points || 0;
  const currentLevel = Math.floor(currentPoints / 250) + 1;
  const nextLevelProgress = ((currentPoints % 250) / 250) * 100;

  const safeVocabList = Array.isArray(activeLesson?.vocabulary)
    ? activeLesson.vocabulary.map((v: any) => ({
        word: (v.word || (typeof v === 'string' ? v.split(':')[0] : 'WORD')).toUpperCase(),
        meaning: v.meaning || (typeof v === 'string' ? v.split(':')[1] || '' : '')
      }))
    : [];

  const safeSentencesList = Array.isArray(activeLesson?.useful_sentences)
    ? activeLesson.useful_sentences.map((s: any) => s.sentence || s)
    : [];

  const safeDialogueList: { speaker: string; line: string }[] = (() => {
    if (!activeLesson?.conversation_dialogue) return [];
    if (Array.isArray(activeLesson.conversation_dialogue)) {
      return activeLesson.conversation_dialogue.map((item: any) => ({
        speaker: item.speaker || (typeof item === 'string' ? item.split(':')[0] : 'Speaker'),
        line: item.line || (typeof item === 'string' ? item.split(':')[1] || item : JSON.stringify(item))
      }));
    }
    if (typeof activeLesson.conversation_dialogue === 'string') {
      try {
        const parsed = JSON.parse(activeLesson.conversation_dialogue);
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) => ({
            speaker: item.speaker || 'Speaker',
            line: item.line || ''
          }));
        }
      } catch {
        return activeLesson.conversation_dialogue.split('\n').filter(Boolean).map((line: string) => {
          const parts = line.split(':');
          return { speaker: parts[0]?.trim() || 'Speaker', line: parts.slice(1).join(':').trim() || line };
        });
      }
    }
    return [];
  })();

  const wordBuilderActivities = activities.filter(a => a.type === 'word_builder');
  const typingActivities = activities.filter(a => a.type === 'fill_in_blank');

  const studioAttemptsForSelected = speechHistory.filter(
    s => s.lesson_id === selectedPracticeLesson?.id
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-bold">
        <Sparkles className="w-8 h-8 text-pink-500 animate-spin mr-3" /> Loading Learning Studio...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-pink-500 selection:text-white">
      {/* Top Gamified Navbar */}
      <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 rounded-2xl shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">{profile?.full_name}</h1>
            <p className="text-xs text-pink-400 font-bold">
              Grade {profile?.grade} - Section {profile?.section} • {profile?.schools?.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-pink-600 hover:bg-pink-500 text-white font-black text-xs rounded-xl shadow-lg transition"
          >
            <FileText className="w-4 h-4" /> Report Card
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-xl font-black text-xs">
            <Zap className="w-4 h-4 text-indigo-400" /> Level {currentLevel}
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl font-black text-xs">
            <Award className="w-4 h-4" /> {currentPoints} XP
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl font-black text-xs">
            <Flame className="w-4 h-4" /> {profile?.current_streak || 1} Streak
          </div>
          <button onClick={handleSignOut} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Studio */}
      <main className="max-w-5xl w-full mx-auto p-6 space-y-6 flex-1 flex flex-col justify-center">
        {/* Navigation Tabs */}
        {!activeLesson && (
          <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900 rounded-2xl border border-slate-800 w-fit">
            <button
              onClick={() => setActiveTab('lessons')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition ${
                activeTab === 'lessons' ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" /> Grade {profile?.grade} Curriculum
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition ${
                activeTab === 'leaderboard' ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-400" /> Class Toppers
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition ${
                activeTab === 'progress' ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mic className="w-4 h-4" /> Speech Studio ({speechHistory.length})
            </button>
            <button
              onClick={() => setActiveTab('badges')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition ${
                activeTab === 'badges' ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" /> Badges ({badges.length})
            </button>
          </div>
        )}

        {/* VIEW 1: LESSON CARDS */}
        {!activeLesson && activeTab === 'lessons' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3 shadow-lg">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-pink-400 uppercase tracking-wider">Level {currentLevel} Scholar</span>
                <span className="text-slate-400">{currentPoints % 250} / 250 XP to Level {currentLevel + 1}</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${nextLevelProgress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lessons.map(lesson => {
                const completion = completedLessonsMap[lesson.id];
                const isCompleted = !!completion;

                return (
                  <div
                    key={lesson.id}
                    onClick={() => startLesson(lesson)}
                    className={`border p-6 rounded-3xl cursor-pointer transition transform hover:-translate-y-1 shadow-lg flex flex-col justify-between space-y-4 ${
                      isCompleted ? 'bg-slate-900/60 border-emerald-500/30' : 'bg-slate-900 border-slate-800 hover:border-pink-500/50'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full border border-pink-500/30">
                          LESSON {lesson.lesson_number}
                        </span>
                        {isCompleted && (
                          <span className="text-xs px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-black flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Score: {completion.final_percentage}%
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-white">{lesson.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 italic">
                        "{lesson.speaking_prompt || 'Interactive speaking and vocabulary challenges.'}"
                      </p>
                    </div>

                    <div className="pt-2 flex justify-between items-center border-t border-slate-800/80">
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5" /> +100 Total XP
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-bold">
                        {isCompleted ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            Completed • Open Practice <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="text-pink-400 flex items-center gap-1">
                            Start Lesson <Play className="w-3.5 h-3.5 fill-pink-400" />
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 2: CLASS LEADERBOARD */}
        {!activeLesson && activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <ClassLeaderboard
              students={classmates}
              title={`🏆 Grade ${profile?.grade}-${profile?.section} Class Toppers`}
              subtitle={`Automatic rank calculation based on precision scoring and lowest mistake rates for ${profile?.schools?.name}`}
            />
          </div>
        )}

        {/* VIEW 3: LIVE SPEECH STUDIO */}
        {!activeLesson && activeTab === 'progress' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
              <div className="flex flex-wrap justify-between items-center gap-3">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Mic className="w-5 h-5 text-pink-400" /> Live AI Speech Practice Studio
                  </h2>
                  <p className="text-xs text-slate-400">
                    Practice speaking up to <strong>3 times</strong> per lesson with instant AI feedback & native corrections.
                  </p>
                </div>

                {lessons.length > 0 && (
                  <select
                    value={selectedPracticeLesson?.id || ''}
                    onChange={(e) => {
                      const found = lessons.find(l => l.id === e.target.value);
                      if (found) setSelectedPracticeLesson(found);
                    }}
                    className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none focus:border-pink-500"
                  >
                    {lessons.map(l => (
                      <option key={l.id} value={l.id}>
                        Lesson {l.lesson_number}: {l.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {selectedPracticeLesson && (
                <div className="pt-2">
                  <SpeechAnalyzer
                    promptText={selectedPracticeLesson.speaking_prompt || 'Say hello politely and introduce yourself in English.'}
                    attemptCount={studioAttemptsForSelected}
                    maxAttempts={3}
                    isTeacher={false}
                    expectedKeywords={['hello', 'good', 'morning', 'name', 'teacher', 'school', 'grade']}
                    onComplete={(evalResult) => handleStudioSpeechComplete(evalResult)}
                  />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white">Speech Evaluations Log ({speechHistory.length})</h3>
              {speechHistory.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center text-slate-500 text-sm">
                  No practice recordings yet. Tap "Start Speaking Now" above to begin!
                </div>
              ) : (
                speechHistory.map(log => (
                  <div key={log.id} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-md">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-pink-400">{log.lessons?.title || 'Speech Practice'}</span>
                      <span className="text-sm font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        {log.overall_score}% Score
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 italic">"{log.transcribed_text}"</p>

                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-center text-xs">
                      <div>
                        <span className="text-slate-500 font-bold block">Pronunciation</span>
                        <span className="font-bold text-indigo-400">{log.pronunciation_score}%</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold block">Fluency</span>
                        <span className="font-bold text-amber-400">{log.fluency_score}%</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold block">Grammar</span>
                        <span className="font-bold text-emerald-400">{log.grammar_score || 85}%</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold block">Vocabulary</span>
                        <span className="font-bold text-pink-400">{log.vocabulary_score}%</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* VIEW 4: BADGES */}
        {!activeLesson && activeTab === 'badges' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" /> Your Badges & Achievements Shelf
              </h2>
              <span className="text-xs font-bold text-slate-400">
                {badges.filter(b => b.isUnlocked).length} / {badges.length} Unlocked
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {badges.map(b => (
                <div 
                  key={b.id} 
                  className={`p-5 rounded-3xl border flex items-center gap-4 transition ${
                    b.isUnlocked
                      ? 'bg-slate-900 border-pink-500/30 shadow-lg shadow-pink-500/5'
                      : 'bg-slate-950/60 border-slate-800 opacity-60'
                  }`}
                >
                  <div className={`p-3 rounded-2xl ${b.isUnlocked ? 'bg-pink-500/20 text-pink-400' : 'bg-slate-900 text-slate-600'}`}>
                    {b.isUnlocked ? <Award className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-bold text-base ${b.isUnlocked ? 'text-white' : 'text-slate-400'}`}>{b.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{b.description}</p>
                    <span className={`inline-block mt-2 px-2.5 py-0.5 text-xs font-bold rounded-lg border ${
                      b.isUnlocked 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-slate-900 text-slate-500 border-slate-800'
                    }`}>
                      {b.isUnlocked ? '✨ Unlocked' : '🔒 Locked'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACTIVE LESSON STEP FLOW (WITHOUT REPEAT DRILLS) */}
        {activeLesson && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-md">
              <button
                onClick={() => setActiveLesson(null)}
                className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Exit Lesson
              </button>
              <div className="flex items-center gap-3">
                {totalMistakes > 0 && (
                  <span className="text-xs font-bold px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> {totalMistakes} Mistakes Made
                  </span>
                )}
                <span className="text-xs font-bold text-pink-400">
                  Grade {activeLesson.grade} • Lesson {activeLesson.lesson_number}: {activeLesson.title}
                </span>
              </div>
            </div>

            {/* STEP 1: OBJECTIVES */}
            {lessonStep === 'objectives' && (
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-6 max-w-xl mx-auto shadow-2xl">
                <div className="inline-flex p-4 bg-pink-500/20 text-pink-400 rounded-2xl">
                  <Compass className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-white">Target Learning Objectives</h2>
                <div className="space-y-2 text-slate-300 text-sm text-left">
                  {Array.isArray(activeLesson.learning_objectives) && activeLesson.learning_objectives.map((obj: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> {obj}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setLessonStep('vocab')}
                  className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-black rounded-2xl transition shadow-lg flex items-center justify-center gap-2"
                >
                  Explore Vocabulary <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* STEP 2: VOCABULARY */}
            {lessonStep === 'vocab' && (
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6 max-w-xl mx-auto shadow-2xl">
                <div className="text-center space-y-1">
                  <span className="text-xs font-black text-pink-400 uppercase tracking-wider">Module 2</span>
                  <h2 className="text-2xl font-black text-white">Lesson Vocabulary</h2>
                  <p className="text-xs text-slate-400">Tap speaker to hear pronunciation</p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {safeVocabList.map((v: any, i: number) => (
                    <div key={i} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="text-lg font-black text-purple-400">{v.word}</span>
                        {v.meaning && <p className="text-xs text-slate-400 mt-1">{v.meaning}</p>}
                      </div>
                      <button
                        onClick={() => speakText(`${v.word}. ${v.meaning}`)}
                        className="p-3 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white rounded-xl transition"
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setLessonStep('sentences')}
                  className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-black rounded-2xl transition shadow-lg flex items-center justify-center gap-2"
                >
                  Continue to Useful Sentences <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* STEP 3: USEFUL SENTENCES WITH SIDE-BY-SIDE DUAL COLUMN */}
            {lessonStep === 'sentences' && (
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6 max-w-3xl mx-auto shadow-2xl">
                <div className="text-center space-y-1">
                  <span className="text-xs font-black text-pink-400 uppercase tracking-wider">Module 3</span>
                  <h2 className="text-2xl font-black text-white">Useful Everyday Sentences</h2>
                </div>

                <div className={`grid grid-cols-1 ${activeLesson.image_url ? 'md:grid-cols-12 gap-6' : ''}`}>
                  {activeLesson.image_url && (
                    <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-950 rounded-3xl border border-slate-800 shadow-inner">
                      <div className="relative w-full flex justify-center">
                        <img
                          src={activeLesson.image_url}
                          alt="Lesson Reference Visual"
                          className="max-h-[350px] w-auto rounded-2xl object-contain shadow-md"
                        />
                      </div>
                      <span className="mt-3 text-xs font-bold text-pink-400 bg-pink-500/10 border border-pink-500/20 px-3 py-1 rounded-full">
                        📸 Visual Guide
                      </span>
                    </div>
                  )}

                  <div className={`${activeLesson.image_url ? 'md:col-span-7' : 'w-full'} space-y-2.5 max-h-[380px] overflow-y-auto pr-1`}>
                    {safeSentencesList.map((text: string, i: number) => (
                      <div key={i} className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-200 pr-2">"{text}"</span>
                        <button
                          onClick={() => speakText(text)}
                          className="p-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl transition shrink-0"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setLessonStep(safeDialogueList.length > 0 ? 'conversation' : 'word_builder')}
                  className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-black rounded-2xl transition shadow-lg flex items-center justify-center gap-2"
                >
                  Continue to Conversation <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* STEP 4: CONVERSATION WITH SIDE-BY-SIDE DUAL COLUMN */}
            {lessonStep === 'conversation' && (
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6 max-w-3xl mx-auto shadow-2xl">
                <div className="text-center space-y-1">
                  <span className="text-xs font-black text-pink-400 uppercase tracking-wider">Module 4</span>
                  <h2 className="text-2xl font-black text-white">Dialogue Practice</h2>
                  <p className="text-xs text-slate-400">Listen to how real conversations flow back and forth</p>
                </div>

                <div className={`grid grid-cols-1 ${activeLesson.image_url ? 'md:grid-cols-12 gap-6' : ''}`}>
                  {activeLesson.image_url && (
                    <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-950 rounded-3xl border border-slate-800 shadow-inner">
                      <div className="relative w-full flex justify-center">
                        <img
                          src={activeLesson.image_url}
                          alt="Dialogue Visual Guide"
                          className="max-h-[350px] w-auto rounded-2xl object-contain shadow-md"
                        />
                      </div>
                      <span className="mt-3 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                        👥 Look at the Characters
                      </span>
                    </div>
                  )}

                  <div className={`${activeLesson.image_url ? 'md:col-span-7' : 'w-full'} space-y-3 max-h-[380px] overflow-y-auto pr-1`}>
                    {safeDialogueList.map((item, idx) => {
                      const isLeft = idx % 2 === 0;
                      return (
                        <div key={idx} className={`flex ${isLeft ? 'justify-start' : 'justify-end'}`}>
                          <div className={`max-w-md p-3.5 rounded-2xl text-sm font-medium flex items-center justify-between gap-4 ${
                            isLeft ? 'bg-indigo-950/80 text-indigo-200 border border-indigo-800 rounded-tl-none' : 'bg-emerald-950/80 text-emerald-200 border border-emerald-800 rounded-tr-none'
                          }`}>
                            <div>
                              <span className="text-[11px] font-black uppercase block opacity-75 mb-0.5 tracking-wider">{item.speaker}</span>
                              <span>{item.line}</span>
                            </div>
                            <button onClick={() => speakText(item.line)} className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl shrink-0 transition">
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => setLessonStep('word_builder')}
                  className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-black rounded-2xl transition shadow-lg flex items-center justify-center gap-2"
                >
                  Play Word Builders (Max 20 XP) <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* STEP 5: WORD BUILDER */}
            {lessonStep === 'word_builder' && (
              <div className="space-y-4">
                <WordBuilder
                  wordsList={wordBuilderActivities.length > 0 
                    ? wordBuilderActivities.map(a => ({
                        word: a.question_data?.target_word || 'HELLO',
                        meaning: a.question_data?.clue || 'A polite greeting word'
                      }))
                    : safeVocabList}
                  pointsPerWord={4}
                  onComplete={(scorePercentage) => handleWordBuilderComplete(scorePercentage)}
                />
              </div>
            )}

            {/* STEP 6: TYPING ACTIVITIES */}
            {lessonStep === 'activities' && typingActivities.length > 0 && (
              <div className="space-y-4">
                <TypingActivity
                  sentenceWithBlank={typingActivities[currentActIndex]?.question_data?.sentence || "Good ___ teacher!"}
                  correctAnswers={typingActivities[currentActIndex]?.question_data?.acceptable_answers || ["morning", "Morning"]}
                  points={4}
                  onSuccess={(attemptsTaken) => handleTypingSuccess(attemptsTaken)}
                  onFail={() => handleTypingFail()}
                />
              </div>
            )}

            {/* STEP 7: MCQ QUIZZES */}
            {lessonStep === 'quiz' && quizzes.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6 max-w-xl mx-auto shadow-2xl">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-pink-400">Question {currentQuizIndex + 1} of {quizzes.length}</span>
                  <span className="text-xs font-bold text-amber-400">Correct: {quizCorrectCount}</span>
                </div>

                <h3 className="text-xl font-bold text-white">{quizzes[currentQuizIndex].question}</h3>

                <div className="space-y-3">
                  {quizzes[currentQuizIndex].options?.map((opt: string, idx: number) => {
                    const isSelected = selectedQuizOption === idx;
                    const isCorrect = idx === quizzes[currentQuizIndex].correct_option_index;
                    return (
                      <button
                        key={idx}
                        disabled={selectedQuizOption !== null}
                        onClick={() => handleQuizAnswer(idx)}
                        className={`w-full p-4 rounded-2xl text-left text-sm font-bold border transition ${
                          selectedQuizOption === null
                            ? 'bg-slate-950 border-slate-800 text-white hover:border-pink-500'
                            : isSelected && isCorrect
                            ? 'bg-emerald-600 border-emerald-500 text-white'
                            : isSelected && !isCorrect
                            ? 'bg-rose-600 border-rose-500 text-white'
                            : isCorrect
                            ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                            : 'bg-slate-950 border-slate-800 text-slate-500'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {selectedQuizOption !== null && (
                  <button onClick={nextQuizQuestion} className="w-full py-4 bg-pink-600 hover:bg-pink-500 text-white font-black rounded-2xl shadow-lg transition">
                    Next Step <ArrowRight className="w-5 h-5 inline ml-1" />
                  </button>
                )}
              </div>
            )}

            {/* STEP 8: AI SPEECH RECORDING */}
            {lessonStep === 'speech' && (
              <div className="space-y-4">
                <SpeechAnalyzer
                  promptText={activeLesson.speaking_prompt || 'Say hello politely to your teacher and wish everyone a good morning.'}
                  isTeacher={false}
                  maxAttempts={3}
                  expectedKeywords={['hello', 'good', 'morning', 'teacher', 'name', 'grade']}
                  onComplete={(evaluation) => handleLessonSpeechComplete(evaluation, false)}
                />
              </div>
            )}

            {/* STEP 9: BONUS CHALLENGE */}
            {lessonStep === 'challenge' && (
              <div className="space-y-4">
                <div className="text-center space-y-1 mb-2">
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-300 font-black text-xs rounded-full uppercase">
                    🏆 Bonus Speaking Challenge
                  </span>
                </div>
                <SpeechAnalyzer
                  promptText={activeLesson.speaking_challenge || 'Speak for 30 seconds about three people you greet every day.'}
                  isTeacher={false}
                  maxAttempts={3}
                  onComplete={(evaluation) => handleLessonSpeechComplete(evaluation, true)}
                />
              </div>
            )}

            {/* STEP 10: CELEBRATION */}
            {lessonStep === 'completed' && (
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-6 max-w-md mx-auto shadow-2xl">
                <div className="inline-flex p-4 bg-emerald-500/20 text-emerald-400 rounded-3xl">
                  <Trophy className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-black text-white">Lesson Completed!</h2>
                <p className="text-slate-400 text-sm font-medium">
                  Your final performance score and mistake deductions have been locked and updated on the Classroom Leaderboard.
                </p>
                <button
                  onClick={() => {
                    setActiveLesson(null);
                    setLessonStep('objectives');
                    fetchStudentData();
                  }}
                  className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black rounded-2xl shadow-lg"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Report Modal */}
      {showReportModal && (
        <StudentReportModal
          profile={profile}
          speechHistory={speechHistory}
          completedLessonsCount={Object.keys(completedLessonsMap).length}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}