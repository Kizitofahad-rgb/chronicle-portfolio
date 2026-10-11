import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, Disc3, Radio, Sparkles, Sliders } from 'lucide-react';

interface AudioVisualizerProps {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onFrequencyUpdate?: (avgFrequency: number) => void;
}

export function AudioVisualizer({
  audioElement,
  isPlaying,
  onTogglePlay,
  onFrequencyUpdate,
}: AudioVisualizerProps) {
  const [deckOpen, setDeckOpen] = useState(false);
  const [volume, setVolume] = useState(0.65);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(258); // default ~4:18
  const [frequencies, setFrequencies] = useState<number[]>([12, 28, 45, 60, 72, 85, 90, 75, 52, 35, 20, 10]);

  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Setup Web Audio Analyser
  useEffect(() => {
    if (!audioElement) return;

    audioElement.volume = volume;

    const setupAudioContext = () => {
      if (audioCtxRef.current) return;
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return;

        const ctx = new AudioContextClass();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.8;

        const source = ctx.createMediaElementSource(audioElement);
        source.connect(analyser);
        analyser.connect(ctx.destination);

        audioCtxRef.current = ctx;
        analyserRef.current = analyser;
        sourceNodeRef.current = source;
      } catch {
        // Fallback gracefully if already connected or restricted
      }
    };

    const handleFirstPlay = () => {
      setupAudioContext();
      if (audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    };

    audioElement.addEventListener('play', handleFirstPlay);

    // Track time updates
    const onTimeUpdate = () => {
      setCurrentTime(audioElement.currentTime);
      if (audioElement.duration && !isNaN(audioElement.duration)) {
        setDuration(audioElement.duration);
      }
    };
    audioElement.addEventListener('timeupdate', onTimeUpdate);

    return () => {
      audioElement.removeEventListener('play', handleFirstPlay);
      audioElement.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [audioElement, volume]);

  // Frequency Sampling Animation Loop
  useEffect(() => {
    const sampleAudio = () => {
      if (analyserRef.current && isPlaying) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Pick 12 representative bins
        const sampleCount = 12;
        const step = Math.floor(bufferLength / sampleCount);
        const sampled: number[] = [];
        let total = 0;

        for (let i = 0; i < sampleCount; i++) {
          const val = dataArray[i * step] || 0;
          sampled.push(val);
          total += val;
        }

        const avg = total / sampleCount;
        setFrequencies(sampled);
        if (onFrequencyUpdate) onFrequencyUpdate(avg);
      } else if (isPlaying) {
        // Synthetic energetic beat pulse for visual feedback
        const time = Date.now() / 1000;
        const synthetic = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => {
          const v = Math.sin(time * 6 + i * 0.7) * 40 + Math.cos(time * 12 + i) * 30 + 70;
          return Math.max(10, Math.min(240, v));
        });
        setFrequencies(synthetic);
        if (onFrequencyUpdate) onFrequencyUpdate(80);
      } else {
        setFrequencies([8, 12, 16, 18, 14, 12, 10, 14, 16, 12, 8, 6]);
        if (onFrequencyUpdate) onFrequencyUpdate(0);
      }

      animFrameRef.current = requestAnimationFrame(sampleAudio);
    };

    animFrameRef.current = requestAnimationFrame(sampleAudio);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, onFrequencyUpdate]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioElement || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioElement.currentTime = percent * duration;
    setCurrentTime(percent * duration);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioElement) audioElement.volume = val;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="relative flex items-center">
      {/* Topbar EQ Trigger Capsule */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setDeckOpen(prev => !prev)}
          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full border transition-all text-xs font-mono tracking-wider ${
            isPlaying
              ? 'border-cyan-500/50 bg-cyan-950/40 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
              : 'border-white/10 bg-white/5 text-slate-400 hover:border-amber-400/40 hover:text-amber-300'
          }`}
          title="Toggle Cyber Sound Deck"
          data-testid="button-audio-deck-toggle"
        >
          {isPlaying ? (
            <Disc3 className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '3s' }} />
          ) : (
            <Radio className="w-3.5 h-3.5 text-slate-400" />
          )}

          {/* Mini Real-Time Audio Spectrum Bars */}
          <div className="flex items-end gap-[2px] h-3.5 w-12 px-0.5">
            {frequencies.slice(0, 8).map((val, idx) => {
              const heightPct = isPlaying ? Math.max(15, Math.min(100, (val / 255) * 100)) : 20;
              return (
                <span
                  key={idx}
                  className={`w-1 rounded-t-sm transition-all duration-75 ${
                    isPlaying ? (idx % 2 === 0 ? 'bg-cyan-400' : 'bg-amber-400') : 'bg-slate-600'
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
              );
            })}
          </div>

          <span className="hidden sm:inline font-semibold">
            {isPlaying ? 'CAN’T HOLD US' : 'AUDIO OFF'}
          </span>

          <Sliders className="w-3 h-3 opacity-60 ml-0.5" />
        </button>

        {/* Quick Mute/Play Button */}
        <button
          type="button"
          onClick={onTogglePlay}
          className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
          aria-label={isPlaying ? 'Pause music' : 'Play music'}
          data-testid="button-quick-audio-toggle"
        >
          {isPlaying ? <Volume2 size={14} className="text-cyan-400" /> : <VolumeX size={14} />}
        </button>
      </div>

      {/* Futuristic Floating Cyber Audio Deck Modal / Overlay */}
      {deckOpen && (
        <div
          className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl border border-cyan-500/30 bg-[#090e1f]/95 p-5 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(0,240,255,0.15)] animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ transformOrigin: 'top right' }}
        >
          {/* Deck Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                {isPlaying && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isPlaying ? 'bg-cyan-400' : 'bg-slate-500'}`}></span>
              </span>
              <span className="text-[10px] font-mono tracking-widest uppercase text-cyan-400">
                CHRONICLE AUDIO MATRIX // 146 BPM
              </span>
            </div>
            <button
              onClick={() => setDeckOpen(false)}
              className="text-xs font-mono text-slate-400 hover:text-white px-2 py-0.5 rounded border border-white/10"
            >
              ESC
            </button>
          </div>

          {/* Track Info */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h4 className="text-sm font-bold text-white tracking-wide">Can’t Hold Us</h4>
              <p className="text-xs text-slate-400 mt-0.5">Macklemore & Ryan Lewis feat. Ray Dalton</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[9px] font-mono uppercase bg-amber-400/10 text-amber-300 border border-amber-400/20 px-1.5 py-0.5 rounded">
                  THE HEIST
                </span>
                <span className="text-[9px] font-mono uppercase bg-cyan-400/10 text-cyan-300 border border-cyan-400/20 px-1.5 py-0.5 rounded">
                  LOSSLESS VIBE
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 via-amber-500 to-violet-600 p-[1px] shadow-lg shadow-cyan-500/20 shrink-0">
              <div className="w-full h-full bg-[#0a0f24] rounded-[11px] flex items-center justify-center">
                <Disc3 className={`w-6 h-6 text-cyan-400 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
              </div>
            </div>
          </div>

          {/* Full Frequency Waveform Display */}
          <div className="h-16 w-full bg-black/40 rounded-xl p-2.5 flex items-end justify-between gap-1 border border-white/5 mb-4">
            {frequencies.map((val, idx) => {
              const height = isPlaying ? Math.max(10, Math.min(100, (val / 255) * 100)) : 12;
              return (
                <div key={idx} className="flex-1 flex flex-col justify-end items-center h-full">
                  <div
                    className="w-full rounded-t transition-all duration-75"
                    style={{
                      height: `${height}%`,
                      background: `linear-gradient(to top, #00f0ff, #e7b73d)`,
                      boxShadow: isPlaying ? '0 0 8px rgba(0, 240, 255, 0.4)' : 'none',
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Interactive Scrub Timeline */}
          <div className="mb-4">
            <div
              className="relative h-2 w-full bg-white/10 rounded-full cursor-pointer overflow-hidden group"
              onClick={handleSeek}
              title="Click to seek"
            >
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 rounded-full transition-all relative"
                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md shadow-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1.5">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls: Play/Pause & Volume */}
          <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onTogglePlay}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-amber-500 hover:from-cyan-400 hover:to-amber-400 text-[#090d1d] font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] active:scale-95"
            >
              {isPlaying ? <Pause size={14} className="fill-current" /> : <Play size={14} className="fill-current" />}
              {isPlaying ? 'Pause' : 'Play Soundtrack'}
            </button>

            {/* Volume slider */}
            <div className="flex items-center gap-2 flex-1 max-w-[130px]">
              <Volume2 size={13} className="text-slate-400 shrink-0" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                title={`Volume: ${Math.round(volume * 100)}%`}
              />
              <span className="text-[10px] font-mono text-slate-400 w-7 text-right">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
