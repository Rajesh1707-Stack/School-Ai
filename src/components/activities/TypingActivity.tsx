'use client';

import React, { useState } from 'react';
import { Award, Check, X, ArrowRight, AlertTriangle, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TypingActivityProps {
  sentenceWithBlank: string;
  correctAnswers: string[];
  points: number;
  onSuccess: (attempts: number) => void;
  onFail?: () => void;
}

export default function TypingActivity({
  sentenceWithBlank,
  correctAnswers = [],
  points = 15,
  onSuccess,
  onFail,
}: TypingActivityProps) {
  const [userInput, setUserInput] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isLockedFailed, setIsLockedFailed] = useState(false);

  const checkAnswer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim() || isCorrect === true || isLockedFailed) return;

    const currentAttempts = attempts + 1;
    setAttempts(currentAttempts);

    const matches = correctAnswers.some(
      ans => ans.trim().toLowerCase() === userInput.trim().toLowerCase()
    );

    if (matches) {
      setIsCorrect(true);
      try {
        confetti({ particleCount: 70, spread: 50 });
      } catch (err) {
        console.error(err);
      }
    } else {
      if (currentAttempts >= 3) {
        setIsCorrect(false);
        setIsLockedFailed(true);
      } else {
        setIsCorrect(false);
      }
    }
  };

  const handleContinueNext = () => {
    if (isCorrect) {
      if (typeof onSuccess === 'function') onSuccess(attempts);
    } else if (isLockedFailed) {
      if (typeof onFail === 'function') onFail();
      else if (typeof onSuccess === 'function') onSuccess(attempts);
    }
  };

  const parts = sentenceWithBlank ? sentenceWithBlank.split('___') : ['', ''];

  return (
    <div className="bg-slate-900 border-2 border-indigo-500/30 rounded-3xl p-6 shadow-2xl max-w-xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <span className="bg-amber-500/20 text-amber-300 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider border border-amber-500/30">
          ⌨️ Typing Challenge
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">
            Attempt: <strong className={attempts >= 2 ? 'text-rose-400' : 'text-amber-300'}>{attempts}/3</strong>
          </span>
          <div className="flex items-center gap-1 text-amber-400 font-black text-xs">
            <Award className="w-4 h-4" /> +{points} XP
          </div>
        </div>
      </div>

      <form onSubmit={checkAnswer} className="space-y-5">
        <div className="text-lg font-bold text-white leading-relaxed bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-wrap items-center gap-2">
          <span>{parts[0]}</span>
          <input
            type="text"
            disabled={isCorrect === true || isLockedFailed}
            value={userInput}
            onChange={(e) => {
              setUserInput(e.target.value);
              setIsCorrect(null);
            }}
            placeholder="type answer..."
            className={`border-b-4 outline-none px-3 py-1 rounded-lg font-black text-lg transition-all ${
              isCorrect === true
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                : isLockedFailed
                ? 'border-rose-500 bg-rose-500/10 text-rose-300'
                : isCorrect === false
                ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                : 'border-indigo-400 focus:border-indigo-500 bg-slate-900 text-white'
            }`}
          />
          {parts[1] && <span>{parts[1]}</span>}
        </div>

        {/* Retry prompt for Attempt 1 and 2 */}
        {isCorrect === false && !isLockedFailed && (
          <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 text-amber-300 p-3.5 rounded-xl text-xs font-bold">
            <div className="flex items-center gap-2">
              <X className="w-4 h-4" /> Incorrect answer. Attempt {attempts} of 3 used.
            </div>
            <button
              type="button"
              onClick={() => {
                setUserInput('');
                setIsCorrect(null);
              }}
              className="flex items-center gap-1 text-white bg-amber-600 hover:bg-amber-500 px-3 py-1.5 rounded-lg transition font-bold"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Try Again
            </button>
          </div>
        )}

        {/* Max 3 attempts reached banner + NEXT BUTTON */}
        {isLockedFailed && (
          <div className="space-y-4 bg-rose-500/10 border border-rose-500/20 p-5 rounded-2xl text-xs font-bold text-rose-300 animate-in fade-in">
            <div className="flex items-center gap-2 text-rose-400 text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" /> Max 3 attempts reached! Marked as Incorrect (0 XP).
            </div>
            <div className="text-white text-sm bg-slate-950 p-3 rounded-xl border border-slate-800">
              Correct Answer: <strong className="text-emerald-400 font-mono text-base tracking-wide ml-1">{correctAnswers?.[0] || 'correct word'}</strong>
            </div>
            <button
              type="button"
              onClick={handleContinueNext}
              className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white font-black text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
            >
              Continue to Next Question <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Correct answer on 1st/2nd/3rd attempt banner + NEXT BUTTON */}
        {isCorrect === true && (
          <div className="space-y-4 bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl text-xs font-bold text-emerald-300 animate-in fade-in">
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <Check className="w-5 h-5 shrink-0" /> Excellent! Solved on Attempt {attempts}/3 (+{points} XP).
            </div>
            <button
              type="button"
              onClick={handleContinueNext}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
            >
              Continue to Next Step <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Check Answer Button (Active while attempts remain) */}
        {!isCorrect && !isLockedFailed && (
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition text-sm"
          >
            Check Answer ({3 - attempts} attempt{3 - attempts === 1 ? '' : 's'} left) <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </form>
    </div>
  );
}