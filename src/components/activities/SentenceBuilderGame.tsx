'use client';

import React, { useState, useEffect } from 'react';
import { playSound } from '@/utils/soundEffects';
import { Volume2, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SentenceBuilderProps {
  sentence: string;
  points?: number;
  onSuccess: (attempts: number) => void;
  onFail: () => void;
}

export default function SentenceBuilderGame({ sentence, points = 8, onSuccess, onFail }: SentenceBuilderProps) {
  const [words, setWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWordList] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!sentence) return;
    const cleanWords = sentence.replace(/[.,?!]/g, '').split(' ');
    setWords([...cleanWords].sort(() => Math.random() - 0.5));
    setSelectedWordList([]);
    setAttempts(1);
    setIsCompleted(false);
    setErrorMessage('');
  }, [sentence]);

  const handleWordSelect = (word: string, index: number) => {
    playSound('click');
    setSelectedWordList(prev => [...prev, word]);
    setWords(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleWordDeselect = (word: string, index: number) => {
    playSound('click');
    setWords(prev => [...prev, word]);
    setSelectedWordList(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleCheckAnswer = () => {
    const userString = selectedWords.join(' ').toLowerCase();
    const correctString = sentence.replace(/[.,?!]/g, '').toLowerCase();

    if (userString === correctString) {
      playSound('win');
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      setIsCompleted(true);
      onSuccess(attempts);
    } else {
      playSound('wrong');
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts > 3) {
        setErrorMessage('Max attempts reached. Moving forward.');
        onFail();
      } else {
        setErrorMessage(`Incorrect order! Try again (Attempt ${newAttempts}/3).`);
      }
    }
  };

  const speakSentence = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6 max-w-xl mx-auto shadow-2xl text-slate-100">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs font-black text-pink-400 uppercase tracking-wider">Communication Skill Builder</span>
          <h2 className="text-xl font-black text-white mt-0.5">Order the Sentence</h2>
        </div>
        <button 
          onClick={speakSentence}
          className="p-2.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl transition flex items-center gap-1.5 text-xs font-bold"
        >
          <Volume2 className="w-4 h-4" /> Listen
        </button>
      </div>

      <div className="min-h-[80px] p-4 bg-slate-950 border-2 border-dashed border-slate-800 rounded-2xl flex flex-wrap gap-2 items-center">
        {selectedWords.length === 0 ? (
          <span className="text-xs text-slate-500 italic mx-auto">Tap words below to build your sentence in order...</span>
        ) : (
          selectedWords.map((w, idx) => (
            <button
              key={idx}
              onClick={() => handleWordDeselect(w, idx)}
              className="px-3.5 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl transition shadow-md animate-in fade-in"
            >
              {w} ✕
            </button>
          ))
        )}
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-bold text-center">
          {errorMessage}
        </div>
      )}

      <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex flex-wrap gap-2 justify-center">
        {words.map((w, idx) => (
          <button
            key={idx}
            onClick={() => handleWordSelect(w, idx)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition shadow"
          >
            {w}
          </button>
        ))}
      </div>

      {!isCompleted ? (
        <button
          disabled={selectedWords.length === 0}
          onClick={handleCheckAnswer}
          className="w-full py-3.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:opacity-50 text-white font-black rounded-xl transition shadow-lg text-xs uppercase tracking-wider"
        >
          Check Sentence Order
        </button>
      ) : (
        <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-2xl text-center space-y-1">
          <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-400" />
          <p className="font-black text-sm">Perfect Grammar Flow! (+{points} XP)</p>
        </div>
      )}
    </div>
  );
}