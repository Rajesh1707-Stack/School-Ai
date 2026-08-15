export interface XPBreakdown {
  activityXP: number;
  quizXP: number;
  speechXP: number;
  streakBonus: number;
  totalEarned: number;
}

export function calculatePerformanceXP({
  baseActivityXP = 20,
  activityAttempts = 1,
  activityPassed = true,
  baseQuizXP = 25,
  quizCorrect = 0,
  quizTotal = 1,
  baseSpeechXP = 35,
  speechScore = 0,
}: {
  baseActivityXP?: number;
  activityAttempts?: number;
  activityPassed?: boolean;
  baseQuizXP?: number;
  quizCorrect?: number;
  quizTotal?: number;
  baseSpeechXP?: number;
  speechScore?: number;
}): XPBreakdown {
  let activityXP = 0;
  if (activityPassed) {
    if (activityAttempts === 1) activityXP = baseActivityXP;
    else if (activityAttempts === 2) activityXP = Math.round(baseActivityXP * 0.7);
    else activityXP = Math.round(baseActivityXP * 0.4);
  }

  const quizRatio = quizTotal > 0 ? quizCorrect / quizTotal : 0;
  let quizXP = Math.round(baseQuizXP * quizRatio);
  if (quizRatio === 1) quizXP += 10;

  const speechRatio = speechScore / 100;
  let speechXP = Math.round(baseSpeechXP * speechRatio);
  if (speechScore >= 90) speechXP += 15;

  return {
    activityXP,
    quizXP,
    speechXP,
    streakBonus: 0,
    totalEarned: activityXP + quizXP + speechXP,
  };
}