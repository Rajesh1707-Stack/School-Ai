import Link from 'next/link';
import { Sparkles, ArrowRight, Shield, GraduationCap, School, Award } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-950 text-white flex flex-col justify-between p-6 sm:p-12">
      {/* Header */}
      <header className="max-w-6xl mx-auto w-full flex justify-between items-center py-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-indigo-500 to-pink-500 rounded-2xl shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">English Excel</h1>
            <p className="text-xs text-indigo-300 font-semibold tracking-wide">Multi-School Platform</p>
          </div>
        </div>
        <Link
          href="/login"
          className="px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full font-bold text-sm backdrop-blur transition"
        >
          Sign In
        </Link>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto text-center space-y-8 my-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-black uppercase tracking-wider">
          <Award className="w-4 h-4" /> Multi-School English Learning & Management
        </div>

        <h2 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight bg-gradient-to-r from-white via-indigo-100 to-pink-200 bg-clip-text text-transparent">
          Empowering Fluent Communication with AI Speech Analysis
        </h2>

        <p className="text-slate-300 text-lg sm:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
          Comprehensive curriculum for Grades 1–10, real-time pronunciation scoring, role-play dialogues, and multi-tenant school administration.
        </p>

        <div className="flex justify-center pt-4">
          <Link
            href="/login"
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-400 hover:to-pink-400 rounded-2xl font-black text-lg shadow-xl shadow-indigo-500/25 transition transform active:scale-95"
          >
            Access Platform <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Feature Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 text-left">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur">
            <Shield className="w-6 h-6 text-indigo-400 mb-2" />
            <h3 className="font-bold text-sm">Isolated Schools</h3>
            <p className="text-xs text-slate-400 mt-1">Independent data & student records</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur">
            <Sparkles className="w-6 h-6 text-pink-400 mb-2" />
            <h3 className="font-bold text-sm">AI Speech Engine</h3>
            <p className="text-xs text-slate-400 mt-1">Fluency & pronunciation feedback</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur">
            <GraduationCap className="w-6 h-6 text-purple-400 mb-2" />
            <h3 className="font-bold text-sm">Grades 1–10</h3>
            <p className="text-xs text-slate-400 mt-1">Structured interactive lessons</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur">
            <School className="w-6 h-6 text-emerald-400 mb-2" />
            <h3 className="font-bold text-sm">Role Dashboards</h3>
            <p className="text-xs text-slate-400 mt-1">Admin, Principal, Teacher, Student</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 py-4">
        © 2026 English Excel. All rights reserved.
      </footer>
    </div>
  );
}