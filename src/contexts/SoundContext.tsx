import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";

// Audio Assets (Public URLs for demo purposes)
const SFX = {
  correct: "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3", // Soft chime
  incorrect:
    "https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3", // Soft error
  click: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3", // UI Click
  hover: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3", // Interaction
  complete: "https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3", // Level up/Complete
};

export const BGM_TRACKS = [
  {
    id: "lofi-study",
    name: "Lo-Fi Study",
    url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",
    color: "from-indigo-500 to-purple-500",
  },
  {
    id: "rain",
    name: "Heavy Rain",
    url: "https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg",
    color: "from-slate-500 to-slate-700",
  },
  {
    id: "cafe-ambience",
    name: "Coffee Shop",
    url: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3",
    color: "from-orange-400 to-amber-500",
  },
];

type SFXType = keyof typeof SFX;

interface SoundContextType {
  // Config
  isMuted: boolean;
  toggleMute: () => void;
  bgmVolume: number;
  setBGMVolume: (vol: number) => void;
  sfxVolume: number;
  setSFXVolume: (vol: number) => void;

  // BGM
  currentTrackId: string | null;
  isPlaying: boolean;
  playBGM: (trackId: string) => void;
  pauseBGM: () => void;
  resumeBGM: () => void;

  // SFX
  playSFX: (type: SFXType) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: ReactNode }) {
  // Settings
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem("vf_mute");
    return saved ? JSON.parse(saved) : false;
  });

  const [bgmVolume, setBGMVolumeState] = useState(() => {
    const saved = localStorage.getItem("vf_bgm_vol");
    return saved ? parseFloat(saved) : 0.4;
  });

  const [sfxVolume, setSFXVolumeState] = useState(() => {
    const saved = localStorage.getItem("vf_sfx_vol");
    return saved ? parseFloat(saved) : 0.6;
  });

  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Audio Refs
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const sfxRefs = useRef<Record<string, HTMLAudioElement>>({});

  // Initialize SFX
  useEffect(() => {
    Object.entries(SFX).forEach(([key, url]) => {
      const audio = new Audio(url);
      sfxRefs.current[key] = audio;
    });
  }, []);

  // Persist Settings
  useEffect(() => {
    localStorage.setItem("vf_mute", JSON.stringify(isMuted));
  }, [isMuted]);
  useEffect(() => {
    localStorage.setItem("vf_bgm_vol", bgmVolume.toString());
  }, [bgmVolume]);
  useEffect(() => {
    localStorage.setItem("vf_sfx_vol", sfxVolume.toString());
  }, [sfxVolume]);

  // BGM Logic
  useEffect(() => {
    if (!currentTrackId) return;

    const track = BGM_TRACKS.find((t) => t.id === currentTrackId);
    if (!track) return;

    if (!bgmRef.current) {
      bgmRef.current = new Audio(track.url);
      bgmRef.current.loop = true;
    } else if (bgmRef.current.src !== track.url) {
      bgmRef.current.src = track.url;
    }

    bgmRef.current.volume = isMuted ? 0 : bgmVolume;

    if (isPlaying) {
      bgmRef.current
        .play()
        .catch((e) => console.error("Audio playback error:", e));
    } else {
      bgmRef.current.pause();
    }

    return () => {
      // Cleanup handled by ref, we generally want one global BGM instance
    };
  }, [currentTrackId, isPlaying, bgmVolume, isMuted]);

  // Volume Updates
  useEffect(() => {
    if (bgmRef.current) {
      bgmRef.current.volume = isMuted ? 0 : bgmVolume;
    }
  }, [bgmVolume, isMuted]);

  const setBGMVolume = (vol: number) => {
    setBGMVolumeState(vol);
  };

  const setSFXVolume = (vol: number) => {
    setSFXVolumeState(vol);
  };

  const toggleMute = () => setIsMuted((prev: boolean) => !prev);

  const playBGM = (trackId: string) => {
    if (currentTrackId === trackId && isPlaying) return;
    setCurrentTrackId(trackId);
    setIsPlaying(true);
  };

  const pauseBGM = () => setIsPlaying(false);
  const resumeBGM = () => setIsPlaying(true);

  const playSFX = (type: SFXType) => {
    if (isMuted) return;
    const audio = sfxRefs.current[type];
    if (audio) {
      audio.volume = sfxVolume;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  };

  // Global Click Listener for Generic UI Sound
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // Logic to check if clicked element is interactive (button, link, input)
      const target = e.target as HTMLElement;
      const clickable = target.closest('button, a, input, [role="button"]');

      if (clickable) {
        playSFX("click");
      }
    };

    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, [isMuted, sfxVolume]);

  const value = {
    isMuted,
    toggleMute,
    bgmVolume,
    setBGMVolume,
    sfxVolume,
    setSFXVolume,
    currentTrackId,
    isPlaying,
    playBGM,
    pauseBGM,
    resumeBGM,
    playSFX,
  };

  return (
    <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error("useSound must be used within a SoundProvider");
  }
  return context;
}
