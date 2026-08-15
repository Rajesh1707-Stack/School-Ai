'use client';

import React, { useState, useEffect } from 'react';
import { Award, Volume2, Check, X, RotateCcw, ArrowRight, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WordBuilderProps {
  wordsList?: { word: string; meaning: string }[];
  targetWord?: string;
  hint?: string;
  points?: number;
  pointsPerWord?: number;
  onComplete?: (totalScore: number) => void;
  onSuccess?: (attemptsOrScore?: number) => void;
}

const DEFAULT_WORDS = [
  { word: 'HELLO', meaning: 'A friendly and polite greeting' },
  { word: 'MORNING', meaning: 'The early part of the day before noon' },
  { word: 'AFTERNOON', meaning: 'The time from noon until evening' },
  { word: 'EVENING', meaning: 'The end of the day before night' },
  { word: 'GOODBYE', meaning: 'Said when parting or leaving someone' },
];

export default function WordBuilder({
  wordsList,
  targetWord,
  hint,
  points,
  pointsPerWord = 20,
  onComplete,
  onSuccess,
}: WordBuilderProps) {
  // Support both a single word prop or a full list of words
  const initialList = wordsList && wordsList.length > 0
    ? wordsList
    : targetWord
    ? [{ word: targetWord, meaning: hint || 'Word challenge' }]
    : DEFAULT_WORDS;

  const safeList = initialList.map(item => ({
    word: typeof item === 'string' ? item : item.word || 'HELLO',
    meaning: typeof item === 'object' && item.meaning ? item.meaning : 'Word challenge',
  }));

  const rewardPoints = points || pointsPerWord || 20;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrambledLetters, setScrambledLetters] = useState<{ id: number; letter: string; used: boolean }[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<{ id: number; letter: string }[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isLockedFailed, setIsLockedFailed] = useState(false);
  const [totalEarned, setTotalEarned] = useState(0);

  const currentItem = safeList[currentIndex] || safeList[0];
  const cleanTarget = currentItem.word.trim().toUpperCase();
  const currentMeaning = currentItem.meaning;

  useEffect(() => {
    resetQuestion();
  }, [currentIndex, wordsList, targetWord]);

  const resetQuestion = () => {
    const letters = cleanTarget.split('').map((char, index) => ({
      id: index,
      letter: char,
      used: false,
    }));
    const shuffled = [...letters].sort(() => Math.random() - 0.5);
    setScrambledLetters(shuffled);
    setSelectedLetters([]);
    setIsCorrect(null);
    setIsLockedFailed(false);
    setAttempts(0);
  };

  const playAudio = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const triggerCompletion = (finalScore: number) => {
    if (typeof onComplete === 'function') {
      onComplete(finalScore);
    } else if (typeof onSuccess === 'function') {
      onSuccess(finalScore);
    }
  };

  const handleSelectLetter = (item: { id: number; letter: string }) => {
    if (isCorrect || isLockedFailed) return;

    setScrambledLetters(prev => prev.map(l => (l.id === item.id ? { ...l, used: true } : l)));
    const newSelected = [...selectedLetters, item];
    setSelectedLetters(newSelected);

    if (newSelected.length === cleanTarget.length) {
      const builtWord = newSelected.map(l => l.letter).join('');
      const currentAttempt = attempts + 1;
      setAttempts(currentAttempt);

      if (builtWord === cleanTarget) {
        setIsCorrect(true);
        const updatedTotal = totalEarned + rewardPoints;
        setTotalEarned(updatedTotal);
        playAudio(cleanTarget);
        try {
          confetti({ particleCount: 70, spread: 60 });
        } catch (err) {
          console.error(err);
        }

        // If single word mode, trigger success callback
        if (safeList.length === 1 && typeof onSuccess === 'function') {
          onSuccess(currentAttempt);
        }
      } else {
        if (currentAttempt >= 3) {
          setIsCorrect(false);
          setIsLockedFailed(true);
        } else {
          setIsCorrect(false);
        }
      }
    }
  };

  const handleRemoveLetter = (index: number) => {
    if (isCorrect || isLockedFailed) return;
    const removedItem = selectedLetters[index];
    setSelectedLetters(prev => prev.filter((_, i) => i !== index));
    setScrambledLetters(prev => prev.map(l => (l.id === removedItem.id ? { ...l, used: false } : l)));
    setIsCorrect(null);
  };

  const handleRetry = () => {
    const letters = cleanTarget.split('').map((char, index) => ({
      id: index,
      letter: char,
      used: false,
    }));
    setScrambledLetters([...letters].sort(() => Math.random() - 0.5));
    setSelectedLetters([]);
    setIsCorrect(null);
  };

  const handleNext = () => {
    if (currentIndex + 1 < safeList.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      triggerCompletion(totalEarned);
    }
  };

  return (
    <div className="bg-slate-900 border-2 border-indigo-500/30 rounded-3xl p-6 max-w-xl mx-auto shadow-2xl space-y-6">
      <div className="flex justify-between items-center">
        <span className="bg-indigo-500/20 text-indigo-300 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider border border-indigo-500/30">
          🧩 Word Builder ({currentIndex + 1} of {safeList.length})
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">
            Attempt: <strong className={attempts >= 2 ? 'text-rose-400' : 'text-indigo-300'}>{attempts}/3</strong>
          </span>
          <div className="flex items-center gap-1 text-amber-400 font-black text-xs">
            <Award className="w-4 h-4" /> +{rewardPoints} XP
          </div>
        </div>
      </div>

      {/* Clue & Audio */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-500 font-bold uppercase block">Meaning / Clue</span>
          <p className="text-white text-sm font-bold mt-0.5">{currentMeaning}</p>
        </div>
        <button
          type="button"
          onClick={() => playAudio(currentMeaning)}
          className="p-2.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl transition"
          title="Listen to clue"
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </div>

      {/* Word Placement Slots */}
      <div className="flex justify-center items-center gap-2 min-h-[64px] p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex-wrap">
        {cleanTarget.split('').map((_, idx) => {
          const letterItem = selectedLetters[idx];
          return (
            <button
              type="button"
              key={idx}
              onClick={() => letterItem && handleRemoveLetter(idx)}
              className={`w-12 h-14 rounded-2xl font-black text-2xl flex items-center justify-center transition-all ${
                letterItem
                  ? isCorrect === true
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : isLockedFailed
                    ? 'bg-rose-600 text-white'
                    : isCorrect === false
                    ? 'bg-amber-600 text-white'
                    : 'bg-indigo-600 text-white shadow-lg cursor-pointer hover:bg-indigo-500'
                  : 'border-2 border-dashed border-slate-700 bg-slate-900/50 text-transparent'
              }`}
            >
              {letterItem ? letterItem.letter : ''}
            </button>
          );
        })}
      </div>

      {/* Status Feedback */}
      {isCorrect === false && !isLockedFailed && (
        <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 text-amber-300 p-3 rounded-xl text-xs font-bold">
          <div className="flex items-center gap-2">
            <X className="w-4 h-4" /> Incorrect arrangement. Attempt {attempts} of 3 used.
          </div>
          <button
            type="button"
            onClick={handleRetry}
            className="flex items-center gap-1 text-white bg-amber-600 hover:bg-amber-500 px-3 py-1 rounded-lg"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Try Again
          </button>
        </div>
      )}

      {isLockedFailed && (
        <div className="space-y-3 bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl text-xs font-bold text-rose-300">
          <div className="flex items-center gap-2 text-rose-400">
            <AlertTriangle className="w-4 h-4" /> Max 3 attempts reached! Marked as Incorrect (0 XP).
          </div>
          <div className="text-white">
            Correct Word: <strong className="text-emerald-400 font-mono text-sm tracking-wider uppercase">{cleanTarget}</strong>
          </div>
          <button
            type="button"
            onClick={handleNext}
            className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl transition flex items-center justify-center gap-2 mt-1"
          >
            Continue to Next Word <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {isCorrect === true && (
        <div className="space-y-3 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-xs font-bold text-emerald-300">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" /> Correct answer on Attempt {attempts}! (+{rewardPoints} XP)
          </div>
          <button
            type="button"
            onClick={handleNext}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition flex items-center justify-center gap-2"
          >
            Next Challenge <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Scrambled Letter Choices */}
      {!isCorrect && !isLockedFailed && (
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          {scrambledLetters.map(item => (
            <button
              type="button"
              key={item.id}
              disabled={item.used}
              onClick={() => handleSelectLetter(item)}
              className={`w-12 h-12 rounded-xl font-black text-xl transition-all transform active:scale-95 ${
                item.used
                  ? 'opacity-20 bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-800 hover:bg-indigo-600 text-white border border-slate-700 shadow-md'
              }`}
            >
              {item.letter}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}