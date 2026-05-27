/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Procedural epic 8-bit battle music using pure Web Audio API
 */
class BattleMusic {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private intervalId: any = null;
  private startTime = 0;
  private tempo = 136; // BPM (Martial tempo)
  private currentStep = 0;

  // Epic dark progression (i - VI - VII - V: Am, F, G, Em in historical modal scales)
  // Roots: A2 (110.0Hz), F2 (87.3Hz), G2 (98.0Hz), E2 (82.4Hz)
  private roots = [110.00, 87.31, 98.00, 82.41];
  private chords = [
    [220.0, 261.63, 329.63], // Am (A3, C4, E4)
    [174.61, 261.63, 349.23], // F (F3, C4, F4)
    [196.00, 246.94, 293.66], // G (G3, B3, D4)
    [164.81, 246.94, 329.63], // Em (E3, B3, E4)
  ];

  // Heroic, triumphant brass fanfare call-and-response melody loop
  private melody = [
    329.63, 349.23, 392.00, 440.00,  // E4, F4, G4, A4
    440.00, 392.00, 349.23, 329.63,  // A4, G4, F4, E4
    392.00, 440.00, 523.25, 493.88,  // G4, A4, C5, B4
    440.00, 392.00, 349.23, 329.63,  // A4, G4, F4, E4
  ];

  start() {
    if (this.isPlaying) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.isPlaying = true;
      this.currentStep = 0;
      this.startTime = this.ctx.currentTime;

      const stepDuration = 60 / this.tempo / 2; // 8th note intervals for rapid rhythmic drive

      this.intervalId = setInterval(() => {
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') {
          // Play state auto-recovery on click/interact
          this.ctx.resume();
        }
        this.playNextStep(stepDuration);
      }, stepDuration * 1000);
    } catch (e) {
      console.error("Failed to start procedural background music", e);
    }
  }

  private playNextStep(duration: number) {
    if (!this.ctx) return;
    const time = this.ctx.currentTime;
    const bar = Math.floor(this.currentStep / 8) % 4; // 8 steps per bar under 4/4 signature, 4-bar loop
    const beatOfBar = this.currentStep % 8;

    // --- Bass Synthesizer: Martial, fast double gallop rhythm ---
    const playBass = beatOfBar !== 2 && beatOfBar !== 6;
    if (playBass) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'sawtooth';
      const rootFreq = this.roots[bar];
      osc.frequency.setValueAtTime(rootFreq, time);
      // Slight pitch-bending for a punchy, heavy war-drum retro feel
      osc.frequency.setValueAtTime(rootFreq * 0.98, time + duration * 0.7);

      gain.gain.setValueAtTime(0.045, time); // Pleasant low-end mix preset
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration * 0.75);

      osc.start(time);
      osc.stop(time + duration * 0.78);
    }

    // --- Orchestral Backing Pad Chords: Providing thick, dramatic harmony ---
    if (beatOfBar === 0) {
      const chordFrequencies = this.chords[bar];
      chordFrequencies.forEach((freq) => {
        if (!this.ctx) return;
        const oNode = this.ctx.createOscillator();
        const gNode = this.ctx.createGain();
        oNode.connect(gNode);
        gNode.connect(this.ctx.destination);

        oNode.type = 'triangle'; // Warm, organ-like voice
        oNode.frequency.setValueAtTime(freq, time);

        gNode.gain.setValueAtTime(0.012, time); // Gentle background blend
        gNode.gain.linearRampToValueAtTime(0.01, time + duration * 4);
        gNode.gain.exponentialRampToValueAtTime(0.001, time + duration * 7.5);

        oNode.start(time);
        oNode.stop(time + duration * 7.8);
      });
    }

    // --- High Fanfare Lead Arpeggios: Crown royalty call-to-arms theme ---
    const melodyIndex = this.currentStep % 16;
    const playMelody = beatOfBar === 0 || beatOfBar === 3 || beatOfBar === 4 || beatOfBar === 7;
    if (playMelody) {
      const mOsc = this.ctx.createOscillator();
      const mGain = this.ctx.createGain();
      mOsc.connect(mGain);
      mGain.connect(this.ctx.destination);

      mOsc.type = 'square'; // Classic retro game synth chip lead
      const fVal = this.melody[melodyIndex];
      mOsc.frequency.setValueAtTime(fVal, time);

      // Delicate 6Hz pitch vibrato for an organic medieval brass horn character
      const vibrato = this.ctx.createOscillator();
      const vibratoGain = this.ctx.createGain();
      vibrato.frequency.value = 6.2;
      vibratoGain.gain.value = 3;
      vibrato.connect(vibratoGain);
      vibratoGain.connect(mOsc.frequency);
      vibrato.start(time);

      mGain.gain.setValueAtTime(0.024, time); // Fine lead levels
      mGain.gain.exponentialRampToValueAtTime(0.001, time + duration * 1.8);

      mOsc.start(time);
      vibrato.stop(time + duration * 1.9);
      mOsc.stop(time + duration * 1.9);
    }

    this.currentStep++;
  }

  stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch (e) {}
      this.ctx = null;
    }
  }

  toggle(enabled: boolean) {
    if (enabled && !this.isPlaying) {
      this.start();
    } else if (!enabled && this.isPlaying) {
      this.stop();
    }
  }
}

export const battleMusic = new BattleMusic();
