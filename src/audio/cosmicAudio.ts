class CosmicAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private droneGain: GainNode | null = null;
  private droneOscs: OscillatorNode[] = [];
  private isMuted = false;
  private isStarted = false;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 0.45;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public startAmbient(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.isStarted) return;
    this.isStarted = true;

    this.droneGain = ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    this.droneGain.gain.exponentialRampToValueAtTime(0.14, ctx.currentTime + 2.5);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 340;
    filter.Q.value = 1.2;

    this.droneGain.connect(filter);
    filter.connect(this.masterGain);

    // Warm deep celestial fifth chord drone (D2, A2, F#3 shimmer)
    const freqs = [73.42, 110.0, 146.83, 220.0];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq;
      osc.detune.value = (idx - 1.5) * 4;
      oscGain.gain.value = idx < 2 ? 0.32 : 0.08;
      osc.connect(oscGain);
      oscGain.connect(this.droneGain!);
      osc.start();
      this.droneOscs.push(osc);
    });
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.45, now, 0.08);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public playChime(freq = 587.33, duration = 0.45): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.005, now + duration);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.14, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  public playPalaceDoors(): void {
    this.startAmbient();
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    // Deep stone/metal harmonic sweep + golden chord
    const rumble = ctx.createOscillator();
    const rumbleGain = ctx.createGain();
    rumble.type = 'sawtooth';
    rumble.frequency.setValueAtTime(52, now);
    rumble.frequency.linearRampToValueAtTime(38, now + 2.8);

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(140, now);
    lp.frequency.linearRampToValueAtTime(420, now + 2.2);

    rumbleGain.gain.setValueAtTime(0.001, now);
    rumbleGain.gain.linearRampToValueAtTime(0.22, now + 0.4);
    rumbleGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

    rumble.connect(lp);
    lp.connect(rumbleGain);
    rumbleGain.connect(this.masterGain);
    rumble.start(now);
    rumble.stop(now + 3.1);

    // Golden harmonic emergence
    [293.66, 440, 587.33, 880].forEach((f, i) => {
      setTimeout(() => this.playChime(f, 1.4), 350 + i * 220);
    });
  }

  public playCountdownBeep(count: number): void {
    if (this.isMuted) return;
    const freq = count === 0 ? 880 : 523.25;
    this.playChime(freq, count === 0 ? 0.6 : 0.22);
  }

  public playLaunchThrusters(): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    // Procedural filtered noise thruster roar
    const bufferSize = ctx.sampleRate * 3.2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(160, now);
    filter.frequency.exponentialRampToValueAtTime(900, now + 1.8);
    filter.frequency.exponentialRampToValueAtTime(220, now + 3.1);
    filter.Q.value = 0.85;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.32, now + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(now);
    noise.stop(now + 3.25);
  }

  public dispose(): void {
    this.droneOscs.forEach((o) => {
      try {
        o.stop();
      } catch {
        // ignore
      }
    });
    this.droneOscs = [];
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
    this.isStarted = false;
  }
}

export const cosmicAudio = new CosmicAudioEngine();
