'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, BookOpen, Mic, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-pink-500 selection:text-white">
      {/* Navbar */}
      <header className="max-w-6xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 rounded-2xl shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-white">English Excel Program</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/login')}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl font-bold text-xs uppercase tracking-wider transition"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl w-full mx-auto px-6 py-12 text-center space-y-8 flex-1 flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-full font-bold text-xs uppercase tracking-widest mx-auto">
          ✨ Powered by Live AI Speech Analysis & Gamification
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
          Master English Fluency with <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">AI Intelligence</span>
        </h1>

        <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          The ultimate multi-school learning platform designed for students, teachers, and principals to track curriculum progression, speech scores, and attendance in real-time.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={() => router.push('/login')}
            className="px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-black rounded-2xl shadow-xl shadow-pink-600/25 flex items-center gap-2.5 transition transform hover:scale-105"
          >
            Get Started Now <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-12 text-left">
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-2">
            <div className="p-3 bg-pink-500/10 text-pink-400 rounded-2xl w-fit">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base">AI Speech Studio</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Real-time CEFR pronunciation, fluency, grammar, and vocabulary scoring.</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-2">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl w-fit">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base">Interactive Curriculum</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Grades 1 to 10 comprehensive lessons, word builders, and quiz challenges.</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-2">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl w-fit">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base">School Isolation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Secure data management dashboards tailored for teachers and campus principals.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto px-6 py-6 border-t border-slate-900 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Edicon English Excel Program. All rights reserved.
      </footer>
    </div>
  );
}