let audioContext: AudioContext | null = null;

export function playNotificationSound() {
  try {
    audioContext ??= new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    const now = audioContext.currentTime;
    // Two-tone chime: a common, unobtrusive notification pattern.
    [{ freq: 880, start: 0 }, { freq: 1175, start: 0.12 }].forEach(({ freq, start }) => {
      const oscillator = audioContext!.createOscillator();
      const gain = audioContext!.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = freq;
      oscillator.connect(gain);
      gain.connect(audioContext!.destination);

      const startTime = now + start;
      const endTime = startTime + 0.15;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, endTime);

      oscillator.start(startTime);
      oscillator.stop(endTime);
    });
  } catch (error) {
    console.warn('Unable to play notification sound:', error);
  }
}
