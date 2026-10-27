export interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  surahNomor: number | null;
  surahName: string | null;
  ayahNomor: number | null; // null if full surah audio
  reciterId: string;
  currentTime: number;
  duration: number;
  error: string | null;
}

type AudioListener = (state: AudioState) => void;

class AudioService {
  private audio: HTMLAudioElement | null = null;
  private listeners: Set<AudioListener> = new Set();
  private state: AudioState = {
    isPlaying: false,
    isLoading: false,
    surahNomor: null,
    surahName: null,
    ayahNomor: null,
    reciterId: '05',
    currentTime: 0,
    duration: 0,
    error: null
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudio();
    }
  }

  private initAudio() {
    if (this.audio) return;
    this.audio = new Audio();
    this.audio.preload = 'metadata';

    this.audio.addEventListener('play', () => {
      this.updateState({ isPlaying: true, isLoading: false, error: null });
    });

    this.audio.addEventListener('pause', () => {
      this.updateState({ isPlaying: false, isLoading: false });
    });

    this.audio.addEventListener('waiting', () => {
      this.updateState({ isLoading: true });
    });

    this.audio.addEventListener('playing', () => {
      this.updateState({ isPlaying: true, isLoading: false });
    });

    this.audio.addEventListener('timeupdate', () => {
      if (this.audio) {
        this.updateState({
          currentTime: this.audio.currentTime,
          duration: this.audio.duration || 0
        });
      }
    });

    this.audio.addEventListener('loadedmetadata', () => {
      if (this.audio) {
        this.updateState({
          duration: this.audio.duration || 0,
          isLoading: false
        });
      }
    });

    this.audio.addEventListener('ended', () => {
      this.updateState({
        isPlaying: false,
        isLoading: false,
        currentTime: 0
      });
    });

    this.audio.addEventListener('error', () => {
      const errMsg = 'Gagal memutar audio murottal. Periksa koneksi internet Anda.';
      this.updateState({
        isPlaying: false,
        isLoading: false,
        error: errMsg
      });
    });
  }

  public subscribe(listener: AudioListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private updateState(partial: Partial<AudioState>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((fn) => fn(this.state));
  }

  public getState(): AudioState {
    return this.state;
  }

  public async playTrack(params: {
    url: string;
    surahNomor: number;
    surahName: string;
    ayahNomor: number | null;
    reciterId: string;
  }): Promise<void> {
    this.initAudio();
    if (!this.audio) return;

    // If same track is playing, toggle pause
    if (
      this.state.surahNomor === params.surahNomor &&
      this.state.ayahNomor === params.ayahNomor &&
      this.state.isPlaying
    ) {
      this.pause();
      return;
    }

    // If same track was paused, resume
    if (
      this.state.surahNomor === params.surahNomor &&
      this.state.ayahNomor === params.ayahNomor &&
      !this.state.isPlaying &&
      this.audio.src === params.url
    ) {
      try {
        await this.audio.play();
        return;
      } catch (e) {
        console.warn('Playback resume failed:', e);
      }
    }

    this.updateState({
      isLoading: true,
      error: null,
      surahNomor: params.surahNomor,
      surahName: params.surahName,
      ayahNomor: params.ayahNomor,
      reciterId: params.reciterId,
      currentTime: 0,
      duration: 0
    });

    try {
      this.audio.src = params.url;
      this.audio.currentTime = 0;
      await this.audio.play();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error && err.name === 'NotAllowedError'
        ? 'Pemutaran audio memerlukan interaksi langsung klik/sentuhan.'
        : 'Tidak dapat memuat URL audio dari server.';
      this.updateState({
        isPlaying: false,
        isLoading: false,
        error: errorMsg
      });
    }
  }

  public pause(): void {
    if (this.audio) {
      this.audio.pause();
    }
  }

  public resume(): void {
    if (this.audio && this.audio.src) {
      this.audio.play().catch((err) => {
        console.warn('Resume error:', err);
      });
    }
  }

  public seek(seconds: number): void {
    if (this.audio && Number.isFinite(seconds)) {
      this.audio.currentTime = Math.max(0, Math.min(seconds, this.audio.duration || 0));
    }
  }

  public stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio.src = '';
    }
    this.updateState({
      isPlaying: false,
      isLoading: false,
      surahNomor: null,
      surahName: null,
      ayahNomor: null,
      currentTime: 0,
      duration: 0,
      error: null
    });
  }
}

export const audioService = new AudioService();
