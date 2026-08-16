'use client';

import React, { useState, useEffect } from 'react';
import { X, Printer, Award, Zap, Flame, CheckCircle2, BookOpen } from 'lucide-react';
import { createClient } from '@/lib/supabase';

interface StudentReportModalProps {
  profile: any;
  speechHistory: any[];
  completedLessonsCount: number;
  onClose: () => void;
}

export default function StudentReportModal({
  profile,
  speechHistory,
  completedLessonsCount,
  onClose,
}: StudentReportModalProps) {
  const [lessonCompletions, setLessonCompletions] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (profile?.id) {
      fetchStudentCompletions(profile.id);
    }
  }, [profile]);

  const fetchStudentCompletions = async (studentId: string) => {
    const { data } = await supabase
      .from('lesson_completions')
      .select('*, lessons(title, lesson_number)')
      .eq('student_id', studentId)
      .order('completed_at', { ascending: false });

    if (data) {
      setLessonCompletions(data);
    }
  };

  const currentPoints = profile?.points || 0;
  const currentLevel = Math.floor(currentPoints / 250) + 1;

  const handlePrint = () => {
    window.print();
  };

  const avgOverall = speechHistory.length > 0 
    ? Math.round(speechHistory.reduce((acc, curr) => acc + (curr.overall_score || 0), 0) / speechHistory.length) 
    : 0;

  const avgPronunciation = speechHistory.length > 0 
    ? Math.round(speechHistory.reduce((acc, curr) => acc + (curr.pronunciation_score || 0), 0) / speechHistory.length) 
    : 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:text-black">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 max-w-2xl w-full rounded-3xl p-8 space-y-6 shadow-2xl relative print:bg-white print:text-black print:border-none print:shadow-none">
        
        {/* Action Controls */}
        <div className="flex justify-between items-center print:hidden">
          <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">Official Performance Report</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl text-xs transition"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Header */}
        <div className="border-b border-slate-800 print:border-slate-300 pb-6 space-y-2 text-center">
          <div className="inline-flex p-3 bg-pink-500/10 text-pink-500 rounded-2xl mb-1 print:bg-pink-100">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white print:text-slate-900">English Excel Program Report Card</h2>
          <p className="text-xs text-slate-400 print:text-slate-600 font-medium">{profile?.schools?.name || 'Institution Campus'}</p>
        </div>

        {/* Student Bio Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950 print:bg-slate-100 p-4 rounded-2xl border border-slate-800 print:border-slate-300 text-xs">
          <div>
            <span className="text-slate-500 block uppercase font-bold">Student Name</span>
            <strong className="text-white print:text-slate-900 text-sm">{profile?.full_name}</strong>
          </div>
          <div>
            <span className="text-slate-500 block uppercase font-bold">Class / Grade</span>
            <strong className="text-white print:text-slate-900 text-sm">Grade {profile?.grade} - {profile?.section}</strong>
          </div>
          <div>
            <span className="text-slate-500 block uppercase font-bold">Level / XP</span>
            <strong className="text-pink-400 print:text-pink-600 text-sm">Level {currentLevel} ({currentPoints} XP)</strong>
          </div>
          <div>
            <span className="text-slate-500 block uppercase font-bold">Learning Streak</span>
            <strong className="text-rose-400 print:text-rose-600 text-sm">{profile?.current_streak || 1} Days 🔥</strong>
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white print:text-slate-900 uppercase tracking-wider">Overall Academic & Speech Summary</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-950 print:bg-slate-50 p-4 rounded-2xl border border-slate-800 print:border-slate-300">
              <span className="text-xs text-slate-500 block uppercase">Completed Lessons</span>
              <span className="text-2xl font-black text-emerald-400 print:text-emerald-700">{completedLessonsCount}</span>
            </div>
            <div className="bg-slate-950 print:bg-slate-50 p-4 rounded-2xl border border-slate-800 print:border-slate-300">
              <span className="text-xs text-slate-500 block uppercase">Avg Speech Score</span>
              <span className="text-2xl font-black text-indigo-400 print:text-indigo-700">{avgOverall}%</span>
            </div>
            <div className="bg-slate-950 print:bg-slate-50 p-4 rounded-2xl border border-slate-800 print:border-slate-300">
              <span className="text-xs text-slate-500 block uppercase">Avg Pronunciation</span>
              <span className="text-2xl font-black text-amber-400 print:text-amber-700">{avgPronunciation}%</span>
            </div>
          </div>
        </div>

        {/* Completed Lessons Breakdown Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white print:text-slate-900 uppercase tracking-wider">Lesson Completion Scores & Ranks</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {lessonCompletions.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-4 text-center">No completed lessons recorded yet.</p>
            ) : (
              lessonCompletions.map((comp, idx) => (
                <div key={idx} className="p-3 bg-slate-950 print:bg-slate-50 rounded-xl border border-slate-800 print:border-slate-300 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-white print:text-slate-900 block">Lesson {comp.lessons?.lesson_number}: {comp.lessons?.title}</span>
                    <span className="text-slate-400 text-[11px]">Activity: {comp.activity_score}% | Quiz: {comp.quiz_score}% | Speech: {comp.speech_score}%</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-black text-emerald-400 print:text-emerald-700 text-sm block">{comp.final_percentage}% Final</span>
                    <span className="text-[10px] text-amber-400">+{comp.earned_xp} XP</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Speech Submissions Breakdown */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white print:text-slate-900 uppercase tracking-wider">Speech Evaluations History</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {speechHistory.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-4 text-center">No speech recordings submitted yet.</p>
            ) : (
              speechHistory.map((log, idx) => (
                <div key={idx} className="p-3 bg-slate-950 print:bg-slate-50 rounded-xl border border-slate-800 print:border-slate-300 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-white print:text-slate-900 block">{log.lessons?.title || 'Speech Practice'}</span>
                    <span className="text-slate-400 italic text-[11px] truncate max-w-xs block">"{log.transcribed_text}"</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-black text-emerald-400 print:text-emerald-700 text-sm block">{log.overall_score}%</span>
                    <span className="text-[10px] text-slate-500">Pron: {log.pronunciation_score}% | Flu: {log.fluency_score}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Signature */}
        <div className="pt-4 border-t border-slate-800 print:border-slate-300 flex justify-between items-end text-xs text-slate-500">
          <div>
            <p>Certified by Edicon English Excel Program</p>
            <p>Generated on {new Date().toLocaleDateString()}</p>
          </div>
          <div className="text-right space-y-4">
            <div className="border-b border-slate-600 print:border-slate-400 w-36 h-6"></div>
            <span className="block font-bold text-slate-400 print:text-slate-700">Principal / Teacher Signature</span>
          </div>
        </div>

      </div>
    </div>
  );
}