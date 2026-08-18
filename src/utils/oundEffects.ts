// Simple sound utility using Web Audio API or audio elements
export const playSound = (type: 'click' | 'correct' | 'wrong' | 'win') => {
  if (typeof window === 'undefined') return;

  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'click') {
      osc.frequency.setValueAtTime(400, now);
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'correct') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.08); // A5
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.setValueAtTime(100, now + 0.1);
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'win') {
      // Triumphant mini arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const subOsc = audioCtx.createOscillator();
        const subGain = audioCtx.createGain();
        subOsc.connect(subGain);
        subGain.connect(audioCtx.destination);
        subOsc.frequency.setValueAtTime(freq, now + idx * 0.1);
        subGain.gain.setValueAtTime(0.15, now + idx * 0.1);
        subGain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.2);
        subOsc.start(now + idx * 0.1);
        subOsc.stop(now + idx * 0.1 + 0.2);
      });
    }
  } catch (e) {
    console.log("Audio context blocked or not supported", e);
  }
};