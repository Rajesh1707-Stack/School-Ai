'use client';

import React from 'react';
import { Trophy, Medal, Flame, Award, Star, Zap } from 'lucide-react';

interface LeaderboardProps {
  students: any[];
  title?: string;
  subtitle?: string;
}

export default function ClassLeaderboard({
  students = [],
  title = '🏆 Classroom Toppers Leaderboard',
  subtitle = 'Rankings dynamically calculated by total XP & overall accuracy',
}: LeaderboardProps) {
  // Sort students descending by points (XP) then highest streak
  const sortedStudents = [...students].sort((a, b) => (b.points || 0) - (a.points || 0));

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="flex items-center gap-1 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full font-black text-xs">
          🥇 Rank #1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="flex items-center gap-1 px-3 py-1 bg-slate-400/20 text-slate-300 border border-slate-400/40 rounded-full font-black text-xs">
          🥈 Rank #2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="flex items-center gap-1 px-3 py-1 bg-amber-700/20 text-amber-500 border border-amber-700/40 rounded-full font-black text-xs">
          🥉 Rank #3
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-slate-900 text-slate-400 border border-slate-800 rounded-full font-bold text-xs">
        Rank #{rank}
      </span>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" /> {title}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>
        <span className="text-xs font-black text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-xl border border-indigo-500/20">
          {sortedStudents.length} Students Ranked
        </span>
      </div>

      {sortedStudents.length === 0 ? (
        <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-500 text-sm">
          No student scores recorded yet. Complete lesson challenges to rank on the leaderboard!
        </div>
      ) : (
        <div className="space-y-3">
          {sortedStudents.map((student, index) => {
            const rank = index + 1;
            const isTop3 = rank <= 3;

            return (
              <div
                key={student.id}
                className={`p-4 rounded-2xl border transition flex flex-wrap items-center justify-between gap-4 ${
                  rank === 1
                    ? 'bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-950 border-amber-500/40 shadow-lg shadow-amber-500/5'
                    : isTop3
                    ? 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/60 border-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-8 flex justify-center">{getRankBadge(rank)}</div>
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      {student.full_name}
                      {rank === 1 && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                    </h4>
                    <span className="text-xs text-slate-400">
                      Grade {student.grade} - Section {student.section} • {student.schools?.name || 'School'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl font-black text-xs">
                    <Award className="w-4 h-4" /> {student.points || 0} XP
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl font-black text-xs">
                    <Flame className="w-4 h-4" /> {student.current_streak || 1} 🔥
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}