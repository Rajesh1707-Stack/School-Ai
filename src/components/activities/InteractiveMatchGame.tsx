'use client';

import React, { useState, useEffect } from 'react';
import { playSound } from '@/utils/soundEffects';
import { Volume2, VolumeX, Trophy, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Item {
  id: string;
  text: string;
  matchId: string;
}

export default function InteractiveMatchGame({ pairs, onComplete }: { pairs: { word: string; meaning: string }[], onComplete: (score: number) => void }) {
  const [tiles, setTiles] = useState<Item[]>([]);
  const [selectedTile, setSelectedTile] = useState<Item | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Initialize and shuffle game tiles
  useEffect(() => {
    initializeGame();
  }, [pairs]);

  const initializeGame = () => {
    const list: Item[] = [];
    pairs.forEach((p, idx) => {
      list.push({ id: `w-${idx}`, text: p.word, matchId: `pair-${idx}` });
      list.push({ id: `m-${idx}`, text: p.meaning, matchId: `pair-${idx}` });
    });
    // Shuffle tiles randomly
    setTiles(list.sort(() => Math.random() - 0.5));
    setMatchedIds([]);
    setSelectedTile(null);
    setAttempts(0);
  };

  const handleTileClick = (tile: Item) => {
    if (matchedIds.includes(tile.id) || selectedTile?.id === tile.id) return;

    if (!isMuted) playSound('click');

    if (!selectedTile) {
      setSelectedTile(tile);
    } else {
      setAttempts(prev => prev + 1);
      if (selectedTile.matchId === tile.matchId && selectedTile.id !== tile.id) {
        // Correct Match!
        if (!isMuted) playSound('correct');
        const newMatched = [...matchedIds, selectedTile.id, tile.id];
        setMatchedIds(newMatched);
        setSelectedTile(null);

        // Check if game is completed
        if (newMatched.length === tiles.length) {
          if (!isMuted) playSound('win');
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          const accuracy = Math.max(20, Math.round((pairs.length / attempts) * 100));
          onComplete(accuracy);
        }
      } else {
        // Wrong Match
        if (!isMuted) playSound('wrong');
        setSelectedTile(null);
      }
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6 max-w-2xl mx-auto shadow-2xl">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs font-black text-pink-400 uppercase tracking-wider">Interactive Wordwall Match</span>
          <h2 className="text-xl font-black text-white">Tap matching pairs</h2>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMuted(!isMuted)} 
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
          <button 
            onClick={initializeGame} 
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            title="Reset Game"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {tiles.map((tile) => {
          const isMatched = matchedIds.includes(tile.id);
          const isSelected = selectedTile?.id === tile.id;

          return (
            <button
              key={tile.id}
              disabled={isMatched}
              onClick={() => handleTileClick(tile)}
              className={`p-4 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 min-h-[90px] flex items-center justify-center text-center shadow-lg border ${
                isMatched 
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 opacity-40 scale-95 cursor-not-allowed' 
                  : isSelected 
                  ? 'bg-pink-600 border-pink-400 text-white scale-105 shadow-pink-600/30 ring-4 ring-pink-500/20' 
                  : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-pink-500/50 hover:bg-slate-800'
              }`}
            >
              {tile.text}
            </button>
          );
        })}
      </div>

      {matchedIds.length === tiles.length && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-2 animate-in fade-in">
          <Trophy className="w-8 h-8 text-emerald-400 mx-auto" />
          <h3 className="font-black text-white text-lg">Fantastic Job! Match Completed!</h3>
          <p className="text-xs text-emerald-300">Your score and XP have been securely recorded to the leaderboard.</p>
        </div>
      )}
    </div>
  );
}