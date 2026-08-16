'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  GraduationCap,
  Users,
  BookOpen,
  Loader2,
  BarChart3,
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setErrorMsg('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profile) {
        router.push(`/${profile.role}`);
      } else {
        router.push('/');
      }
    }
  };

  return (
    <main className="min-h-screen w-full overflow-hidden bg-slate-950">
      {/* =====================================================
          BACKGROUND DECORATION
      ====================================================== */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl" />

        <div className="absolute -right-40 top-1/4 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl" />

        <div className="absolute bottom-[-150px] left-1/3 h-96 w-96 rounded-full bg-pink-500/10 blur-3xl" />
      </div>

      {/* =====================================================
          MAIN CONTAINER
      ====================================================== */}
      <div className="relative flex min-h-screen items-center justify-center p-0 sm:p-4 lg:p-6">
        <div className="grid min-h-screen w-full overflow-hidden bg-white shadow-2xl sm:min-h-0 sm:rounded-[30px] lg:max-w-7xl lg:grid-cols-[1.15fr_0.85fr]">

          {/* =================================================
              LEFT SIDE - DESKTOP
          ================================================== */}
          <section className="relative hidden min-h-[720px] overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-800 to-purple-800 lg:block">

            {/* Student Image */}
            <Image
              src="/images/login-student.png"
              alt="Indian student learning in classroom"
              fill
              priority
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="object-cover object-center"
            />

            {/* Main purple overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/95 via-indigo-900/70 to-indigo-800/20" />

            {/* Bottom dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/95 via-transparent to-indigo-950/20" />

            {/* Decorative glow */}
            <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-purple-500/30 blur-3xl" />

            <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-indigo-500/30 blur-3xl" />

            {/* Decorative dots */}
            <div className="absolute right-10 top-10 grid grid-cols-5 gap-2 opacity-20">
              {Array.from({ length: 25 }).map((_, index) => (
                <span
                  key={index}
                  className="h-1.5 w-1.5 rounded-full bg-white"
                />
              ))}
            </div>

            {/* Left content */}
            <div className="relative z-10 flex min-h-[720px] flex-col justify-between p-8 xl:p-12">

              {/* =============================================
                  BRAND
              ============================================== */}
              <div>
                <div className="flex items-center gap-3">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-white shadow-xl backdrop-blur-md">
                    <Sparkles className="h-6 w-6" />
                  </div>

                  <div>
                    <h1 className="text-xl font-black tracking-tight text-white">
                      English Excel
                    </h1>

                    <p className="text-xs font-medium text-white/60">
                      Multi-School Learning Platform
                    </p>
                  </div>

                </div>
              </div>

              {/* =============================================
                  MAIN MESSAGE
              ============================================== */}
              <div className="max-w-xl">

                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur-md">

                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

                  Smart School Management

                </div>

                <h2 className="text-4xl font-black leading-[1.05] tracking-tight text-white xl:text-6xl">
                  Empowering
                  <br />
                  Schools.
                  <br />

                  <span className="bg-gradient-to-r from-pink-300 to-purple-200 bg-clip-text text-transparent">
                    Inspiring Students.
                  </span>
                </h2>

                <p className="mt-6 max-w-md text-sm leading-7 text-white/70 xl:text-base">
                  A powerful platform to manage students, teachers,
                  attendance, learning activities and school performance
                  in one smart system.
                </p>

                {/* =============================================
                    FEATURE CARDS
                ============================================== */}
                <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">

                  <FeatureCard
                    icon={<GraduationCap className="h-5 w-5" />}
                    title="Students"
                    text="Track learning"
                  />

                  <FeatureCard
                    icon={<Users className="h-5 w-5" />}
                    title="Teachers"
                    text="Manage staff"
                  />

                  <FeatureCard
                    icon={<BarChart3 className="h-5 w-5" />}
                    title="Insights"
                    text="Real-time data"
                  />

                </div>
              </div>

              {/* =============================================
                  SECURITY CARD
              ============================================== */}
              <div className="flex max-w-md items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-md">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <ShieldCheck className="h-5 w-5 text-emerald-300" />
                </div>

                <div>
                  <p className="text-sm font-bold text-white">
                    Secure. Reliable. Built for Education.
                  </p>

                  <p className="mt-0.5 text-xs text-white/50">
                    Your school data is protected.
                  </p>
                </div>

              </div>

            </div>
          </section>

          {/* =================================================
              RIGHT SIDE - LOGIN
          ================================================== */}
          <section className="flex min-h-screen items-center justify-center bg-white px-5 py-10 sm:px-8 lg:min-h-[720px] lg:px-12 xl:px-16">

            <div className="w-full max-w-md">

              {/* =============================================
                  MOBILE BRAND
              ============================================== */}
              <div className="mb-7 text-center lg:hidden">

                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
                  <Sparkles className="h-7 w-7" />
                </div>

                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                  English Excel
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Multi-School Learning Platform
                </p>

              </div>

              {/* =============================================
                  MOBILE STUDENT IMAGE
              ============================================== */}
              <div className="relative mb-8 h-48 overflow-hidden rounded-3xl shadow-lg lg:hidden">

                <Image
                  src="/images/login-student.png"
                  alt="Indian student learning"
                  fill
                  sizes="100vw"
                  className="object-cover object-center"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/70 via-transparent to-transparent" />

                <div className="absolute bottom-4 left-5">

                  <p className="text-sm font-black text-white">
                    Learn. Grow. Achieve.
                  </p>

                  <p className="mt-1 text-xs text-white/70">
                    Your learning journey starts here.
                  </p>

                </div>

              </div>

              {/* =============================================
                  LOGIN HEADING
              ============================================== */}
              <div className="mb-8">

                <div className="mb-4 hidden h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 lg:flex">
                  <BookOpen className="h-5 w-5" />
                </div>

                <h2 className="text-center text-3xl font-black tracking-tight text-slate-900 lg:text-left xl:text-4xl">
                  Welcome back
                </h2>

                <p className="mt-2 text-center text-sm leading-6 text-slate-500 lg:text-left">
                  Sign in to continue to your school dashboard.
                </p>

              </div>

              {/* =============================================
                  ERROR MESSAGE
              ============================================== */}
              {errorMsg && (
                <div
                  role="alert"
                  className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4"
                >

                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 font-black text-rose-600">
                    !
                  </div>

                  <div>
                    <p className="text-sm font-bold text-rose-700">
                      Unable to sign in
                    </p>

                    <p className="mt-1 text-xs leading-5 text-rose-600">
                      {errorMsg}
                    </p>
                  </div>

                </div>
              )}

              {/* =============================================
                  LOGIN FORM
              ============================================== */}
              <form
                onSubmit={handleLogin}
                className="space-y-5"
              >

                {/* EMAIL */}
                <div>

                  <label
                    htmlFor="email"
                    className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-600"
                  >
                    Email address
                  </label>

                  <div className="group relative">

                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-600" />

                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="teacher@school.com"
                      className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                    />

                  </div>

                </div>

                {/* PASSWORD */}
                <div>

                  <label
                    htmlFor="password"
                    className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-600"
                  >
                    Password
                  </label>

                  <div className="group relative">

                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-600" />

                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-12 text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((previous) => !previous)
                      }
                      aria-label={
                        showPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 active:scale-95"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>

                  </div>

                </div>

                {/* LOGIN BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative mt-2 flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                >

                  {/* Shine animation */}
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Enter Platform</span>

                      <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                    </>
                  )}

                </button>

              </form>

              {/* =============================================
                  SECURITY MESSAGE
              ============================================== */}
              <div className="mt-7 flex items-center justify-center gap-2 text-center text-xs font-medium text-slate-400">

                <ShieldCheck className="h-4 w-4 text-indigo-500" />

                <span>
                  Your account information is securely protected
                </span>

              </div>

              {/* =============================================
                  FOOTER
              ============================================== */}
              <p className="mt-8 text-center text-[11px] font-medium text-slate-400">
                English Excel&nbsp; • &nbsp;Multi-School Learning Platform
              </p>

            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   FEATURE CARD
========================================================= */

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:bg-white/15">

      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white">
        {icon}
      </div>

      <p className="text-xs font-black text-white">
        {title}
      </p>

      <p className="mt-0.5 text-[10px] text-white/50">
        {text}
      </p>

    </div>
  );
}